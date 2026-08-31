import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  if (!process.env.DATABASE_URL?.trim()) return undefined;
  return new PrismaClient({ log: ['error'] });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production' && prisma) {
  globalForPrisma.prisma = prisma;
}

export function catalogDb() {
  if (!prisma) {
    const err = new Error('DATABASE_URL manquant. Configurez Neon pour activer le catalogue central.');
    err.name = 'CatalogDbUnavailable';
    throw err;
  }
  return prisma;
}

export function catalogDbAvailable() {
  return Boolean(prisma);
}
