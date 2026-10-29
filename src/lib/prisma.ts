import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('file:')) {
    return process.env.DATABASE_URL
  }

  // Handle SQLite on Vercel / serverless environment
  const filename = 'dev.db'
  const cwd = process.cwd()
  const possiblePaths = [
    path.join(cwd, 'prisma', filename),
    path.join(cwd, filename),
    path.join('/tmp', filename),
  ]

  let existingSource = possiblePaths.find((p) => fs.existsSync(p))

  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpPath = path.join('/tmp', filename)
    if (existingSource && existingSource !== tmpPath) {
      try {
        if (!fs.existsSync(tmpPath)) {
          fs.copyFileSync(existingSource, tmpPath)
        }
        return `file:${tmpPath}`
      } catch (err) {
        console.error('Failed to copy db to /tmp:', err)
      }
    }
    if (fs.existsSync(tmpPath)) {
      return `file:${tmpPath}`
    }
  }

  if (existingSource) {
    return `file:${existingSource}`
  }

  return 'file:./prisma/dev.db'
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
