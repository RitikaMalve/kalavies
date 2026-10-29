import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function PUT(req: NextRequest) {
  const user = await getSession()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { mode, autoWindowDays, maxDisplayCount, excludeOutOfStock } = await req.json()

    const existing = await prisma.trendingSettings.findFirst()
    if (existing) {
      await prisma.trendingSettings.update({
        where: { id: existing.id },
        data: {
          mode,
          autoWindowDays: Number(autoWindowDays),
          maxDisplayCount: Number(maxDisplayCount),
          excludeOutOfStock: Boolean(excludeOutOfStock),
        },
      })
    } else {
      await prisma.trendingSettings.create({
        data: {
          mode,
          autoWindowDays: Number(autoWindowDays),
          maxDisplayCount: Number(maxDisplayCount),
          excludeOutOfStock: Boolean(excludeOutOfStock),
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
