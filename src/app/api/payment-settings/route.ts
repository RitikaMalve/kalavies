import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const setting = await prisma.paymentSetting.findFirst({
      where: { isActive: true },
      select: {
        qrImageUrl: true,
        upiId: true,
        payeeName: true,
        paymentInstructions: true,
        isActive: true,
      },
    })

    return NextResponse.json({
      setting: setting || {
        qrImageUrl: '/images/payment-qr.jpg',
        upiId: 'lavanyamalve09-1@okhdfcbank',
        payeeName: 'Lavanya Malve',
        paymentInstructions:
          'Scan the QR code with any UPI application (GPay, PhonePe, Paytm, BHIM). Complete payment of exact amount, enter the 12-digit UTR reference number and upload the screenshot.',
        isActive: true,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
