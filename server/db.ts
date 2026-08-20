import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;
  if (!envUrl) {
    throw new Error('DATABASE_URL ortam değişkeni tanımlı değil.');
  }

  // Neon PostgreSQL bağlantı havuzu ve timeout parametrelerini garanti et
  if (envUrl.includes('neon.tech') && !envUrl.includes('connection_limit')) {
    const separator = envUrl.includes('?') ? '&' : '?';
    return `${envUrl}${separator}connect_timeout=15&pool_timeout=15`;
  }

  return envUrl;
}

const activeDbUrl = getDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: activeDbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

// Serverless ve dev ortamlarında connection sızıntısını önlemek için singleton'ı globalThis'e kaydet
globalForPrisma.prisma = prisma;
