import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { generateInvoiceNumber } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const paymentStatus = searchParams.get('paymentStatus') || ''
    const invoiceStatus = searchParams.get('invoiceStatus') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}

    if (paymentStatus) {
      where.paymentStatus = paymentStatus
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { shippingName: { contains: search } },
        { shippingPhone: { contains: search } },
        { shippingCity: { contains: search } },
        { user: { email: { contains: search } } },
      ]
    }

    const totalOrders = await prisma.order.count({ where })
    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
        invoices: {
          include: {
            items: true,
            orderAddress: true,
            shipment: true,
          },
        },
        items: true,
        orderAddresses: true,
        shipments: { include: { items: true } },
      },
    })

    // Filter by invoice status if specified
    let filteredOrders = orders
    if (invoiceStatus === 'ISSUED') {
      filteredOrders = orders.filter((o) => o.invoices.length > 0)
    } else if (invoiceStatus === 'PENDING') {
      filteredOrders = orders.filter((o) => o.invoices.length === 0)
    }

    return NextResponse.json({
      orders: filteredOrders,
      total: totalOrders,
      page,
      limit,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderIds } = await req.json()
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: 'No orders selected' }, { status: 400 })
    }

    const orders = await prisma.order.findMany({
      where: { id: { in: orderIds } },
      include: {
        user: true,
        items: true,
        invoices: { include: { items: true } },
      },
    })

    const results: any[] = []
    let successCount = 0
    let failedCount = 0
    let existingCount = 0

    for (const order of orders) {
      try {
        // Idempotency: Check if a standard invoice already exists
        let invoice = order.invoices.find((inv) => inv.type === 'STANDARD')

        if (invoice) {
          existingCount++
          results.push({
            orderId: order.id,
            orderNumber: order.orderNumber,
            invoiceNumber: invoice.invoiceNumber,
            status: 'ALREADY_EXISTS',
          })
          continue
        }

        // Generate new unique invoice
        const invoiceNumber = generateInvoiceNumber()
        const customerName =
          order.shippingName ||
          (order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Valued Customer')
        const customerEmail = order.user?.email || null
        const customerPhone = order.shippingPhone || order.user?.phone || null
        const customerAddress = `${order.shippingAddress || ''}, ${order.shippingCity || ''}, ${order.shippingState || ''} - ${order.shippingPincode || ''}`

        const newInvoice = await prisma.$transaction(async (tx) => {
          const inv = await tx.invoice.create({
            data: {
              orderId: order.id,
              invoiceNumber,
              type: 'STANDARD',
              status: 'ISSUED',
              businessName: 'KALAVIES Jewellery Pvt Ltd',
              businessAddress: '108, Jewellery Palace, MG Road, Bangalore, Karnataka, 560001',
              businessGstin: '29ABCDE1234F1Z5',
              customerName,
              customerEmail,
              customerPhone,
              customerAddress,
              subtotal: order.subtotal,
              discount: order.couponDiscount,
              shipping: order.shippingCharge,
              tax: order.taxAmount || Math.round((order.subtotal * 3) / 103),
              total: order.totalAmount,
              items: {
                create: order.items.map((item) => ({
                  orderItemId: item.id,
                  productName: item.productName,
                  sku: item.sku,
                  quantity: item.quantity,
                  unitPrice: item.price,
                  discount: item.discount,
                  taxRate: 3,
                  taxAmount: Math.round((item.totalPrice * 3) / 103),
                  totalAmount: item.totalPrice,
                })),
              },
            },
          })

          // Audit log
          await tx.invoiceAuditLog.create({
            data: {
              invoiceId: inv.id,
              action: 'GENERATED',
              performedBy: session.email || 'ADMIN',
              reason: 'Bulk invoice generation job',
              details: JSON.stringify({ orderId: order.id, orderNumber: order.orderNumber }),
            },
          })

          return inv
        })

        successCount++
        results.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          invoiceNumber: newInvoice.invoiceNumber,
          status: 'GENERATED',
        })
      } catch (err: any) {
        failedCount++
        results.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          status: 'FAILED',
          error: err.message,
        })
      }
    }

    // Record generation job
    await prisma.invoiceGenerationJob.create({
      data: {
        jobType: 'BULK_ORDERS',
        status: failedCount === 0 ? 'COMPLETED' : 'PARTIALLY_COMPLETED',
        totalCount: orderIds.length,
        successCount: successCount + existingCount,
        failedCount,
        targetOrders: JSON.stringify(orderIds),
        notes: `Bulk generated ${successCount} new invoices, ${existingCount} already present.`,
      },
    })

    return NextResponse.json({
      success: true,
      totalCount: orderIds.length,
      successCount,
      existingCount,
      failedCount,
      results,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
