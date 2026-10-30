import { ServiceUnavailableException } from '@nestjs/common';
import {
  profileStore,
  storedProfile,
  subject,
} from '../../../test/helpers/auth-profile';
import { DatabaseService } from '../database/database.service';
import { UsersService } from './users.service';

function setup() {
  const store = profileStore();
  const getClient = jest
    .fn()
    .mockResolvedValue({ userProfile: store.delegate });
  return {
    ...store,
    getClient,
    service: new UsersService({ getClient } as unknown as DatabaseService),
  };
}

it('crea con identidad verificada y deja USER/UUID/fechas a los defaults', async () => {
  const { service, delegate } = setup();
  const result = await service.synchronize(subject);
  expect(result).toMatchObject({
    supabaseUserId: subject,
    role: 'USER',
    username: null,
  });
  expect(typeof result.createdAt).toBe('string');
  expect(delegate.upsert).toHaveBeenCalledWith(
    expect.objectContaining({
      where: { supabaseUserId: subject },
      create: { supabaseUserId: subject },
      update: {},
    }),
  );
});

it('resuelve concurrencia P2002 recuperando la misma fila ganadora', async () => {
  const { service, rows, delegate } = setup();
  const results = await Promise.all(
    Array.from({ length: 20 }, () => service.synchronize(subject)),
  );
  expect(rows.size).toBe(1);
  expect(new Set(results.map((x) => x.id)).size).toBe(1);
  expect(results.every((x) => x.role === 'USER')).toBe(true);
  expect(delegate.findUnique).toHaveBeenCalled();
});

it.each(['USER', 'ADMIN', 'EDITOR', 'MODERATOR'] as const)(
  'no sobrescribe rol %s, campos o fechas existentes',
  async (role) => {
    const { service, rows, delegate } = setup();
    const profile = {
      ...storedProfile(subject, role),
      username: 'habitante',
      displayName: 'Moradora',
      avatarUrl: 'https://example.com/avatar.png',
      internalSecret: 'no-publicar',
    };
    rows.set(subject, profile);
    const first = await service.synchronize(subject);
    const second = await service.synchronize(subject);
    expect(second).toEqual(first);
    expect(second).toMatchObject({
      role,
      username: profile.username,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      updatedAt: profile.updatedAt.toISOString(),
    });
    expect(second).not.toHaveProperty('internalSecret');
    expect(delegate.upsert).toHaveBeenLastCalledWith(
      expect.objectContaining({ update: {} }),
    );
    expect(rows.get(subject)).toBe(profile);
  },
);

it('una lectura ausente devuelve null sin upsert', async () => {
  const { service, delegate } = setup();
  await expect(service.findBySupabaseUserId(subject)).resolves.toBeNull();
  expect(delegate.upsert).not.toHaveBeenCalled();
});

it('una lectura existente serializa fechas sin aceptar otro identificador', async () => {
  const { service, rows, delegate } = setup();
  rows.set(subject, storedProfile());
  expect(await service.findBySupabaseUserId(subject)).toMatchObject({
    createdAt: '2026-10-30T10:00:00.000Z',
  });
  expect(delegate.findUnique).toHaveBeenCalledWith(
    expect.objectContaining({ where: { supabaseUserId: subject } }),
  );
});

it.each([
  'find',
  'upsert',
  'client',
  'conflict-read',
  'conflict-missing',
] as const)(
  'sanitiza fallo %s como 503, nunca como perfil ausente',
  async (failure) => {
    const { service, delegate, getClient } = setup();
    const secret = new Error('postgres://usuario:password@host-interno');
    if (failure === 'client') getClient.mockRejectedValue(secret);
    if (failure === 'find') delegate.findUnique.mockRejectedValue(secret);
    if (failure === 'upsert') delegate.upsert.mockRejectedValue(secret);
    if (failure.startsWith('conflict'))
      delegate.upsert.mockRejectedValue({ code: 'P2002' });
    if (failure === 'conflict-read')
      delegate.findUnique.mockRejectedValue(secret);
    const operation =
      failure === 'find'
        ? service.findBySupabaseUserId(subject)
        : service.synchronize(subject);
    await expect(operation).rejects.toBeInstanceOf(ServiceUnavailableException);
    await expect(operation).rejects.not.toThrow('password');
  },
);
