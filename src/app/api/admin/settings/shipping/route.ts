import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function PUT(req: NextRequest) {
  const user = await getSession()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { freeShippingAbove, flatShippingRate } = await req.json()

    const existing = await prisma.shippingSetting.findFirst()
    if (existing) {
      await prisma.shippingSetting.update({
        where: { id: existing.id },
        data: {
          freeShippingAbove: Number(freeShippingAbove),
          flatShippingRate: Number(flatShippingRate),
        },
      })
    } else {
      await prisma.shippingSetting.create({
        data: {
          freeShippingAbove: Number(freeShippingAbove),
          flatShippingRate: Number(flatShippingRate),
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
