import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export async function POST(req: NextRequest, { params }: Props) {
  try {
    const sessionUser = await getSession()
    const { id } = await params
    const { reason, refundUpi } = await req.json()

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true, payments: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check permissions: user must own the order or be an ADMIN
    const isAdmin = sessionUser?.role === 'ADMIN'
    const isOwner = sessionUser && sessionUser.id === order.userId

    // If order was placed as guest/session, allow cancellation within payment phase
    if (!isAdmin && !isOwner && order.status !== 'PENDING_PAYMENT') {
      return NextResponse.json({ error: 'Unauthorized to cancel this order' }, { status: 403 })
    }

    // Cannot cancel if already shipped or delivered
    if (['SHIPPED', 'DELIVERED'].includes(order.status)) {
      return NextResponse.json(
        { error: `Cannot cancel order after dispatch. Current status: ${order.status}` },
        { status: 400 }
      )
    }

    if (order.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Order is already cancelled' }, { status: 400 })
    }

    const isPaid = order.paymentStatus === 'PAID'
    const targetPaymentStatus = isPaid ? 'REFUND_PENDING' : 'REJECTED'

    const cancellationReasonText = reason?.trim() || (isAdmin ? 'Cancelled by Administrator' : 'Cancelled by Customer')

    // Perform cancellation & stock restoration inside a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Restore product inventory stock
      for (const item of order.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } })
        if (product) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              totalStock: { increment: item.quantity },
              soldCount: { decrement: item.quantity },
            },
          })

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              variantId: item.variantId || null,
              type: 'RETURN',
              quantity: item.quantity,
              reason: `Order Cancellation ${order.orderNumber} - ${cancellationReasonText}`,
              previousQty: product.totalStock,
              newQty: product.totalStock + item.quantity,
            },
          })
        }
      }

      // 2. Update Order
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'CANCELLED',
          paymentStatus: targetPaymentStatus,
          cancelledAt: new Date(),
          cancelReason: cancellationReasonText,
        },
      })

      // 3. Update Payment record
      if (order.payments.length > 0) {
        await tx.payment.updateMany({
          where: { orderId: order.id },
          data: {
            status: targetPaymentStatus,
            refundReason: isPaid ? cancellationReasonText : null,
            customerRefundUpi: refundUpi?.trim() || null,
            refundAmount: isPaid ? order.totalAmount : null,
          },
        })
      }

      // 4. Create Notification
      if (order.userId) {
        const refundMsg = isPaid
          ? ` A refund of ₹${order.totalAmount} has been initiated to your UPI account (${refundUpi || 'account on file'}).`
          : ''

        await tx.notification.create({
          data: {
            userId: order.userId,
            title: `Order #${order.orderNumber} Cancelled`,
            message: `Your order #${order.orderNumber} has been cancelled.${refundMsg}`,
            type: 'ORDER',
            linkUrl: `/orders/${order.id}`,
          },
        })
      }
    })

    return NextResponse.json({
      success: true,
      message: isPaid
        ? 'Order cancelled successfully. Refund has been initiated and will be credited to your UPI ID.'
        : 'Order cancelled successfully and reserved jewellery stock has been restored.',
      isRefundPending: isPaid,
    })
  } catch (err: any) {
    console.error('Order cancellation error:', err)
    return NextResponse.json({ error: err.message || 'Failed to cancel order' }, { status: 500 })
  }
}
