import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export async function POST(req: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const { utrNumber, screenshotUrl } = await req.json()

    if (!utrNumber || !utrNumber.trim()) {
      return NextResponse.json(
        { error: 'Please enter the 12-digit UPI UTR or Transaction Reference Number' },
        { status: 400 }
      )
    }

    const cleanUtr = utrNumber.trim().toUpperCase()

    // 1. Fetch order
    const order = await prisma.order.findUnique({
      where: { id },
      include: { payments: true, user: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'This order has been cancelled and cannot accept payments' },
        { status: 400 }
      )
    }

    // 2. Prevent duplicate UTR usage across other orders
    const duplicate = await prisma.payment.findFirst({
      where: {
        utrNumber: cleanUtr,
        status: { in: ['PAID', 'VERIFICATION_PENDING'] },
        orderId: { not: order.id },
      },
      include: { order: { select: { orderNumber: true } } },
    })

    if (duplicate) {
      return NextResponse.json(
        {
          error: `This UTR number (${cleanUtr}) has already been used for order ${duplicate.order.orderNumber}. Please check your transaction details.`,
        },
        { status: 400 }
      )
    }

    // 3. Update or create Payment
    let payment = order.payments[0]
    if (payment) {
      payment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          utrNumber: cleanUtr,
          paymentScreenshotUrl: screenshotUrl || payment.paymentScreenshotUrl,
          status: 'VERIFICATION_PENDING',
          rejectionReason: null, // clear previous rejection if any
        },
      })
    } else {
      payment = await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: order.totalAmount,
          method: 'UPI',
          status: 'VERIFICATION_PENDING',
          utrNumber: cleanUtr,
          paymentScreenshotUrl: screenshotUrl || null,
        },
      })
    }

    // 4. Update Order Status
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'PAYMENT_VERIFICATION',
        paymentStatus: 'VERIFICATION_PENDING',
      },
    })

    // 5. Notify Customer
    if (order.userId) {
      await prisma.notification.create({
        data: {
          userId: order.userId,
          title: 'Payment Details Submitted',
          message: `Payment details for order #${order.orderNumber} (UTR: ${cleanUtr}) submitted for verification. We will notify you once confirmed.`,
          type: 'ORDER',
          linkUrl: `/orders/${order.id}/payment`,
        },
      })
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      payment,
      message: 'Payment details submitted successfully! Awaiting admin verification.',
    })
  } catch (err: any) {
    console.error('Payment details submission error:', err)
    return NextResponse.json({ error: err.message || 'Submission failed' }, { status: 500 })
  }
}
