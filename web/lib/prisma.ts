import { PrismaClient } from '@prisma/client';
import { loadRootEnv } from './loadRootEnv';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  loadRootEnv();
  if (!process.env.DATABASE_URL?.trim()) return undefined;
  return new PrismaClient({ log: ['error'] });
}

export function catalogDb() {
  const existing = globalForPrisma.prisma;
  if (existing) return existing;
  const client = createClient();
  if (!client) {
    const err = new Error('DATABASE_URL manquant. Configurez Neon pour activer le catalogue central.');
    err.name = 'CatalogDbUnavailable';
    throw err;
  }
  globalForPrisma.prisma = client;
  return client;
}

export function catalogDbAvailable() {
  try {
    catalogDb();
    return true;
  } catch {
    return false;
  }
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = catalogDb();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
