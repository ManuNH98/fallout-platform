import type { PrismaClient } from '@repo/db';

export const PRISMA_CLIENT_FACTORY = Symbol('PRISMA_CLIENT_FACTORY');
export type PrismaClientFactory = (url: string) => Promise<PrismaClient>;

export const prismaClientProvider = {
  provide: PRISMA_CLIENT_FACTORY,
  // Importacion nativa ESM: no transformar el cliente generado a CommonJS.
  useValue: (async (url: string) => {
    const { createPrismaClient } = await import('@repo/db');
    return createPrismaClient(url);
  }) satisfies PrismaClientFactory,
};
