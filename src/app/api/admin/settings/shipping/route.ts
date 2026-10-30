import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const setting = await prisma.shippingSetting.findFirst()
    return NextResponse.json({
      freeShippingAbove: setting?.freeShippingAbove ?? 699,
      flatShippingRate: setting?.flatShippingRate ?? 70,
      codEnabled: setting?.codEnabled ?? true,
      codExtraCharge: setting?.codExtraCharge ?? 0,
      estimatedDaysMin: setting?.estimatedDaysMin ?? 3,
      estimatedDaysMax: setting?.estimatedDaysMax ?? 7,
    })
  } catch {
    return NextResponse.json({
      freeShippingAbove: 699,
      flatShippingRate: 70,
      codEnabled: true,
      codExtraCharge: 0,
      estimatedDaysMin: 3,
      estimatedDaysMax: 7,
    })
  }
}

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
