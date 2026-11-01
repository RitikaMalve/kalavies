import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getSession()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    let setting = await prisma.paymentSetting.findFirst()
    if (!setting) {
      setting = await prisma.paymentSetting.create({
        data: {
          qrImageUrl: '/images/payment-qr.jpg',
          upiId: 'lavanyamalve09-1@okhdfcbank',
          payeeName: 'Lavanya Malve',
          paymentInstructions:
            'Scan the UPI QR code with Google Pay, PhonePe, Paytm, or any UPI app. Pay the exact order amount, then enter the 12-digit UTR reference number and upload the screenshot.',
          isActive: true,
          updatedBy: user.id,
        },
      })
    }
    return NextResponse.json({ setting })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const user = await getSession()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await req.json()
    const { qrImageUrl, upiId, payeeName, paymentInstructions, isActive } = data

    if (!upiId || !upiId.trim()) {
      return NextResponse.json({ error: 'UPI ID is required' }, { status: 400 })
    }

    const existing = await prisma.paymentSetting.findFirst()
    let updated
    if (existing) {
      updated = await prisma.paymentSetting.update({
        where: { id: existing.id },
        data: {
          qrImageUrl: qrImageUrl ?? existing.qrImageUrl,
          upiId: upiId.trim(),
          payeeName: payeeName?.trim() || null,
          paymentInstructions: paymentInstructions?.trim() || null,
          isActive: typeof isActive === 'boolean' ? isActive : existing.isActive,
          updatedBy: user.id,
        },
      })
    } else {
      updated = await prisma.paymentSetting.create({
        data: {
          qrImageUrl: qrImageUrl || '',
          upiId: upiId.trim(),
          payeeName: payeeName?.trim() || null,
          paymentInstructions: paymentInstructions?.trim() || null,
          isActive: typeof isActive === 'boolean' ? isActive : true,
          updatedBy: user.id,
        },
      })
    }

    return NextResponse.json({ success: true, setting: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
