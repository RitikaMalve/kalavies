import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function PUT(req: NextRequest) {
  const user = await getSession()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await req.json()
    delete data.id
    delete data.updatedAt

    const existing = await prisma.businessSetting.findFirst()
    if (existing) {
      await prisma.businessSetting.update({
        where: { id: existing.id },
        data,
      })
    } else {
      await prisma.businessSetting.create({
        data,
      })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
