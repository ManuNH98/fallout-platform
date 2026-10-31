import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { PrismaClient } from '@repo/db';
import { Test } from '@nestjs/testing';
import { execFile } from 'node:child_process';
import { resolve } from 'node:path';
import { promisify } from 'node:util';
import { DatabaseModule } from './database.module';
import { DatabaseService } from './database.service';
import {
  PRISMA_CLIENT_FACTORY,
  type PrismaClientFactory,
} from './prisma-client.provider';

const url = 'postgresql://user:synthetic-password@localhost:1/db';
function setup(connection = url) {
  const disconnect = jest.fn().mockResolvedValue(undefined);
  const client = { $disconnect: disconnect } as unknown as PrismaClient;
  const factory: jest.MockedFunction<PrismaClientFactory> = jest.fn();
  factory.mockResolvedValue(client);
  const service = new DatabaseService(
    new ConfigService({ DATABASE_URL: connection }),
    factory,
  );
  return { service, factory, disconnect, client };
}

it('no crea cliente al construir y conserva el modo sin DB', async () => {
  const { service, factory } = setup('');
  expect(factory).not.toHaveBeenCalled();
  await expect(service.getClient()).rejects.toThrow(
    ServiceUnavailableException,
  );
  await service.onModuleDestroy();
  expect(factory).not.toHaveBeenCalled();
});

it('reutiliza una sola instancia entre peticiones concurrentes y desconecta una vez', async () => {
  const { service, factory, client, disconnect } = setup();
  const clients = await Promise.all([
    service.getClient(),
    service.getClient(),
    service.getClient(),
  ]);
  expect(clients.every((value) => value === client)).toBe(true);
  expect(factory).toHaveBeenCalledTimes(1);
  expect(factory).toHaveBeenCalledWith(url);
  await Promise.all([service.onModuleDestroy(), service.onModuleDestroy()]);
  expect(disconnect).toHaveBeenCalledTimes(1);
  await expect(service.getClient()).rejects.toThrow(
    ServiceUnavailableException,
  );
  expect(factory).toHaveBeenCalledTimes(1);
});

it('espera a la creacion pendiente antes del cierre y rechaza nuevas solicitudes', async () => {
  const { service, factory, client, disconnect } = setup();
  let complete!: (value: PrismaClient) => void;
  factory.mockReturnValue(
    new Promise((resolveClient) => {
      complete = resolveClient;
    }),
  );
  const pending = service.getClient();
  const closing = service.onModuleDestroy();
  await expect(service.getClient()).rejects.toThrow(
    ServiceUnavailableException,
  );
  expect(disconnect).not.toHaveBeenCalled();
  complete(client);
  await pending;
  await closing;
  expect(disconnect).toHaveBeenCalledTimes(1);
});

it('sanitiza errores de creacion y permite reintento', async () => {
  const { service, factory, client } = setup();
  factory.mockRejectedValueOnce(new Error(url));
  await expect(service.getClient()).rejects.toThrow(
    'La base de datos no esta disponible.',
  );
  await expect(service.getClient()).resolves.toBe(client);
  expect(factory).toHaveBeenCalledTimes(2);
  await service.onModuleDestroy();
});

it('un fallo de creacion durante el cierre no intenta desconectar un cliente inexistente', async () => {
  const { service, factory, disconnect } = setup();
  factory.mockRejectedValue(new Error(url));
  const pending = service.getClient();
  const closing = service.onModuleDestroy();
  await expect(pending).rejects.toThrow(ServiceUnavailableException);
  await expect(closing).resolves.toBeUndefined();
  expect(disconnect).not.toHaveBeenCalled();
});

it('no filtra la conexion si falla la desconexion', async () => {
  const { service, disconnect } = setup();
  await service.getClient();
  disconnect.mockRejectedValue(new Error(url));
  await expect(service.onModuleDestroy()).rejects.toThrow(
    'No se ha podido cerrar la conexion de base de datos.',
  );
});

it('Nest exporta un provider unico y ejecuta su lifecycle al cerrar', async () => {
  const { factory, disconnect } = setup();
  const module = await Test.createTestingModule({ imports: [DatabaseModule] })
    .useMocker((token) =>
      token === ConfigService
        ? new ConfigService({ DATABASE_URL: url })
        : undefined,
    )
    .overrideProvider(PRISMA_CLIENT_FACTORY)
    .useValue(factory)
    .compile();
  const service = module.get(DatabaseService);
  expect(module.get(DatabaseService)).toBe(service);
  expect(factory).not.toHaveBeenCalled();
  await service.getClient();
  await module.close();
  expect(disconnect).toHaveBeenCalledTimes(1);
});

it('Jest consume el artefacto ESM real con Node nativo, sin conexion ni loader TS', async () => {
  const script = `
    import assert from 'node:assert/strict';
    import net from 'node:net';
    net.Socket.prototype.connect = function () { throw new Error('Conexion no autorizada en esta prueba'); };
    const { createPrismaClient, PrismaClient } = await import('@repo/db');
    assert.ok(import.meta.resolve('@repo/db').endsWith('/dist/src/index.js'));
    const client = createPrismaClient('postgresql://user:synthetic@localhost:1/db');
    assert.equal(typeof PrismaClient, 'function');
    assert.equal(typeof client.$queryRaw, 'function');
    assert.equal(typeof client.$disconnect, 'function');
    await client.$disconnect();
    console.log('compiled-db-ok');
  `;
  const result = await promisify(execFile)(
    process.execPath,
    ['--input-type=module', '-e', script],
    {
      cwd: resolve(__dirname, '../../..'),
      env: { ...process.env, DATABASE_URL: '', DIRECT_URL: '' },
      timeout: 10_000,
    },
  );
  expect(result.stdout.trim()).toBe('compiled-db-ok');
});
