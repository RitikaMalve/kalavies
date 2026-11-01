import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { restoreOrderInventoryStock } from '@/lib/stock'

interface Params {
  params: Promise<{ id: string }>
}

export async function PUT(req: NextRequest, { params }: Params) {
  const user = await getSession()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  try {
    const { status, paymentStatus, trackingNumber, trackingUrl } = await req.json()

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const wasCancelledBefore = order.status === 'CANCELLED'
    const isNowCancelled = status === 'CANCELLED' || paymentStatus === 'REJECTED'

    // If order is newly cancelled or payment rejected, restore product stocks back!
    if (!wasCancelledBefore && isNowCancelled) {
      await restoreOrderInventoryStock(
        prisma,
        order.id,
        `Order ${order.orderNumber} cancelled/failed (Status: ${status}, Payment: ${paymentStatus})`,
        user.id
      )
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status,
        paymentStatus,
        trackingNumber: trackingNumber || null,
        trackingUrl: trackingUrl || null,
        cancelledAt: isNowCancelled ? new Date() : order.cancelledAt,
        deliveredAt: status === 'DELIVERED' ? new Date() : order.deliveredAt,
      },
    })

    // Log admin action
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'ORDER_STATUS',
        entity: 'Order',
        entityId: id,
        details: JSON.stringify({ status, paymentStatus, trackingNumber }),
      },
    })

    return NextResponse.json({ success: true, order: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
