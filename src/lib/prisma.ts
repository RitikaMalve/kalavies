import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const NEON_FALLBACK_URL =
  'postgresql://neondb_owner:npg_pO0ZcMtw5zTB@ep-noisy-dew-b7bx5ert-pooler.c-13.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require'

function resolveDbUrl(): string {
  const envUrl = process.env.DATABASE_URL
  if (envUrl && envUrl.startsWith('postgres')) {
    return envUrl
  }
  return (
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.STORAGE_DATABASE_URL ||
    process.env.STORAGE_POSTGRES_PRISMA_URL ||
    process.env.STORAGE_POSTGRES_URL ||
    NEON_FALLBACK_URL
  )
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: resolveDbUrl(),
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
