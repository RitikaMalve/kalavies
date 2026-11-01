import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { generateInvoiceNumber } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export async function POST(req: NextRequest, { params }: Props) {
  const user = await getSession()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 })
  }

  try {
    const { id } = await params // payment id
    const body = await req.json()
    const { action, rejectionReason, refundUtr, refundAmount } = body

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            items: true,
            user: true,
            invoices: true,
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 })
    }

    const { order } = payment

    // ==========================================
    // ACTION A: VERIFY & CONFIRM ORDER
    // ==========================================
    if (action === 'VERIFY') {
      if (!payment.utrNumber) {
        return NextResponse.json(
          { error: 'Cannot verify payment without customer UTR number' },
          { status: 400 }
        )
      }

      // Check if UTR is duplicate on another confirmed/paid order
      const duplicate = await prisma.payment.findFirst({
        where: {
          utrNumber: payment.utrNumber,
          status: 'PAID',
          id: { not: payment.id },
        },
        include: { order: { select: { orderNumber: true } } },
      })

      if (duplicate) {
        return NextResponse.json(
          {
            error: `UTR ${payment.utrNumber} is already marked as PAID on order ${duplicate.order.orderNumber}. Prevented duplicate confirmation.`,
          },
          { status: 400 }
        )
      }

      await prisma.$transaction(async (tx) => {
        // 1. Update Payment
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'PAID',
            verifiedBy: user.id,
            verifiedAt: new Date(),
            rejectionReason: null,
          },
        })

        // 2. Update Order
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: 'CONFIRMED',
            paymentStatus: 'PAID',
          },
        })

        // 3. Ensure Official Tax Invoice exists
        if (order.invoices.length === 0) {
          const invoiceNumber = generateInvoiceNumber()
          await tx.invoice.create({
            data: {
              orderId: order.id,
              invoiceNumber,
              businessName: 'KALAVIES Jewellery',
              businessAddress: '108, Jewellery Palace, MG Road, Bangalore, Karnataka, 560001',
              businessGstin: '29ABCDE1234F1Z5',
              customerName: order.shippingName || `${order.user?.firstName || 'Customer'}`,
              customerEmail: order.user?.email || 'customer@kalavies.com',
              customerPhone: order.shippingPhone || order.user?.phone || null,
              customerAddress: `${order.shippingAddress}, ${order.shippingCity}, ${order.shippingState} - ${order.shippingPincode}`,
              subtotal: order.subtotal,
              shipping: order.shippingCharge,
              tax: 0,
              total: order.totalAmount,
            },
          })
        }

        // 4. Send Customer Notification
        if (order.userId) {
          await tx.notification.create({
            data: {
              userId: order.userId,
              title: `Payment Verified — Order Confirmed!`,
              message: `Your payment of ₹${order.totalAmount} for order #${order.orderNumber} (UTR: ${payment.utrNumber}) has been verified and confirmed. Preparing for dispatch!`,
              type: 'ORDER',
              linkUrl: `/orders/${order.id}`,
            },
          })
        }
      })

      return NextResponse.json({
        success: true,
        message: `Order #${order.orderNumber} successfully confirmed & invoice generated.`,
      })
    }

    // ==========================================
    // ACTION B: REJECT PAYMENT
    // ==========================================
    if (action === 'REJECT') {
      const reason = rejectionReason?.trim() || 'Payment could not be verified in bank records.'

      await prisma.$transaction(async (tx) => {
        // 1. Update Payment to REJECTED
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'REJECTED',
            rejectionReason: reason,
            verifiedBy: user.id,
            verifiedAt: new Date(),
          },
        })

        // 2. Update Order paymentStatus to REJECTED
        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'REJECTED',
          },
        })

        // 3. Send Customer Notification with rejection reason
        if (order.userId) {
          await tx.notification.create({
            data: {
              userId: order.userId,
              title: `Payment Verification Notice for #${order.orderNumber}`,
              message: `Payment could not be verified: ${reason}. Please visit your order payment page to submit the correct UTR or receipt.`,
              type: 'ORDER',
              linkUrl: `/orders/${order.id}/payment`,
            },
          })
        }
      })

      return NextResponse.json({
        success: true,
        message: `Payment rejected and notification sent to customer.`,
      })
    }

    // ==========================================
    // ACTION C: COMPLETE REFUND
    // ==========================================
    if (action === 'REFUND') {
      if (!refundUtr || !refundUtr.trim()) {
        return NextResponse.json(
          { error: 'Please provide the Bank Refund UTR / Reference Number' },
          { status: 400 }
        )
      }

      const cleanRefundUtr = refundUtr.trim()

      await prisma.$transaction(async (tx) => {
        // 1. Update Payment
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'REFUNDED',
            refundUtr: cleanRefundUtr,
            refundedAt: new Date(),
            refundAmount: Number(refundAmount) || order.totalAmount,
          },
        })

        // 2. Update Order
        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'REFUNDED',
          },
        })

        // 3. Send Customer Notification
        if (order.userId) {
          await tx.notification.create({
            data: {
              userId: order.userId,
              title: `Refund Processed for #${order.orderNumber}`,
              message: `Your refund of ₹${order.totalAmount} for order #${order.orderNumber} has been successfully processed to your account. Bank Refund Ref / UTR: ${cleanRefundUtr}.`,
              type: 'ORDER',
              linkUrl: `/orders/${order.id}`,
            },
          })
        }
      })

      return NextResponse.json({
        success: true,
        message: `Refund completed successfully with reference ${cleanRefundUtr}.`,
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err: any) {
    console.error('Admin payment action error:', err)
    return NextResponse.json({ error: err.message || 'Action failed' }, { status: 500 })
  }
}
