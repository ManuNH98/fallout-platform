import {
  Inject,
  Injectable,
  ServiceUnavailableException,
  type OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { PrismaClient } from '@repo/db';
import type { AppEnvironment } from '../../config/environment';
import {
  PRISMA_CLIENT_FACTORY,
  type PrismaClientFactory,
} from './prisma-client.provider';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private client?: Promise<PrismaClient>;
  private closing = false;
  private shutdown?: Promise<void>;

  constructor(
    private readonly config: ConfigService<AppEnvironment, true>,
    @Inject(PRISMA_CLIENT_FACTORY)
    private readonly createClient: PrismaClientFactory,
  ) {}

  getClient(): Promise<PrismaClient> {
    const url = this.config.get('DATABASE_URL', { infer: true });
    if (!url || this.closing) {
      return Promise.reject(
        new ServiceUnavailableException('La base de datos no esta disponible.'),
      );
    }
    // Compartir tambien la creacion pendiente evita clientes duplicados.
    this.client ??= this.createClient(url).catch(() => {
      this.client = undefined;
      throw new ServiceUnavailableException(
        'La base de datos no esta disponible.',
      );
    });
    return this.client;
  }

  onModuleDestroy(): Promise<void> {
    this.closing = true;
    this.shutdown ??= this.disconnect();
    return this.shutdown;
  }

  private async disconnect(): Promise<void> {
    if (!this.client) return;
    let client: PrismaClient;
    try {
      client = await this.client;
    } catch {
      // Si la factoria fallo, no hay cliente que desconectar.
      return;
    }
    try {
      await client.$disconnect();
    } catch {
      throw new Error('No se ha podido cerrar la conexion de base de datos.');
    }
  }
}
