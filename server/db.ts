import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getDatabaseUrl(): string {
  // If a remote DB connection string is set (e.g. Postgres / Supabase)
  const envUrl = process.env.DATABASE_URL;
  if (envUrl && !envUrl.startsWith('file:')) {
    return envUrl;
  }

  const isServerless = !!(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NETLIFY ||
    process.env.NODE_ENV === 'production'
  );

  if (isServerless) {
    const tmpDbPath = path.join('/tmp', 'dev.db');

    // Possible source paths where Next.js bundles the SQLite file
    const possibleSources = [
      path.join(process.cwd(), 'prisma', 'dev.db'),
      path.join(process.cwd(), 'dev.db'),
      path.resolve(__dirname, '..', 'prisma', 'dev.db'),
      path.resolve(__dirname, '..', '..', 'prisma', 'dev.db'),
      path.resolve('/var/task/prisma/dev.db'),
      path.resolve('/var/task/dev.db'),
    ];

    let foundSource: string | null = null;
    for (const src of possibleSources) {
      try {
        if (fs.existsSync(src)) {
          foundSource = src;
          break;
        }
      } catch {}
    }

    if (foundSource) {
      try {
        if (!fs.existsSync(tmpDbPath)) {
          fs.copyFileSync(foundSource, tmpDbPath);
          console.log(`[Prisma] Successfully initialized SQLite at ${tmpDbPath} from ${foundSource}`);
        }
      } catch (err) {
        console.error('[Prisma] Error copying SQLite to /tmp:', err);
      }
      return `file:${tmpDbPath}`;
    }

    return `file:${tmpDbPath}`;
  }

  const localDb = path.join(process.cwd(), 'prisma', 'dev.db');
  return `file:${localDb}`;
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
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
