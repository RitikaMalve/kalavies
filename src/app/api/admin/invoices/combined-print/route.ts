import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { generateInvoiceHtml, InvoiceData } from '@/lib/invoiceGenerator'
import { generateInvoiceNumber } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return new Response('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const orderIdsParam = searchParams.get('orderIds')
    if (!orderIdsParam) {
      return new Response('No orderIds provided', { status: 400 })
    }

    const orderIds = orderIdsParam.split(',').filter(Boolean)
    const orders = await prisma.order.findMany({
      where: { id: { in: orderIds } },
      include: {
        user: true,
        items: true,
        invoices: {
          include: {
            items: true,
            orderAddress: true,
          },
        },
      },
    })

    const invoiceHtmlList: string[] = []

    for (let i = 0; i < orders.length; i++) {
      const order = orders[i]
      let invoice = order.invoices[0]

      if (!invoice) {
        invoice = await prisma.invoice.create({
          data: {
            orderId: order.id,
            invoiceNumber: generateInvoiceNumber(),
            type: 'STANDARD',
            status: 'ISSUED',
            businessName: 'KALAVIES Jewellery Pvt Ltd',
            businessAddress: '108, Jewellery Palace, MG Road, Bangalore, Karnataka, 560001',
            businessGstin: '29ABCDE1234F1Z5',
            customerName: order.shippingName || (order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Valued Customer'),
            customerEmail: order.user?.email || null,
            customerPhone: order.shippingPhone || order.user?.phone || null,
            customerAddress: `${order.shippingAddress || ''}, ${order.shippingCity || ''}, ${order.shippingState || ''} - ${order.shippingPincode || ''}`,
            subtotal: order.subtotal,
            discount: order.couponDiscount,
            shipping: order.shippingCharge,
            tax: order.taxAmount || Math.round((order.subtotal * 3) / 103),
            total: order.totalAmount,
            items: {
              create: order.items.map((it) => ({
                orderItemId: it.id,
                productName: it.productName,
                sku: it.sku,
                quantity: it.quantity,
                unitPrice: it.price,
                discount: it.discount,
                taxRate: 3,
                taxAmount: Math.round((it.totalPrice * 3) / 103),
                totalAmount: it.totalPrice,
              })),
            },
          },
          include: {
            items: true,
            orderAddress: true,
          },
        })
      }

      // Record print audit
      await prisma.invoiceAuditLog.create({
        data: {
          invoiceId: invoice.id,
          action: 'PRINTED',
          performedBy: session.email || 'ADMIN',
          reason: 'Combined multi-order print view',
        },
      })

      const invoiceData: InvoiceData = {
        invoiceNumber: invoice.invoiceNumber,
        issuedAt: invoice.issuedAt,
        businessName: invoice.businessName,
        businessAddress: invoice.businessAddress || '108, Jewellery Palace, MG Road, Bangalore, 560001',
        businessGstin: invoice.businessGstin || '29ABCDE1234F1Z5',
        customerName: invoice.customerName,
        customerEmail: invoice.customerEmail,
        customerPhone: invoice.customerPhone,
        customerAddress: invoice.customerAddress,
        orderNumber: order.orderNumber,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        trackingNumber: order.trackingNumber,
        subtotal: invoice.subtotal,
        discount: invoice.discount,
        shipping: invoice.shipping,
        tax: invoice.tax,
        total: invoice.total,
        type: invoice.type,
        addressLabel: invoice.orderAddress?.label,
        items: (invoice.items && invoice.items.length > 0)
          ? invoice.items.map((it) => ({
              productName: it.productName,
              sku: it.sku,
              quantity: it.quantity,
              unitPrice: it.unitPrice,
              totalPrice: it.totalAmount,
            }))
          : order.items.map((it) => ({
              productName: it.productName,
              variantName: it.variantName,
              sku: it.sku,
              quantity: it.quantity,
              unitPrice: it.price,
              totalPrice: it.totalPrice,
            })),
      }

      invoiceHtmlList.push(generateInvoiceHtml(invoiceData, i < orders.length - 1))
    }

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>KALAVIES Batch Invoices (${orders.length} Invoices)</title>
  <style>
    * { box-sizing: border-box; }
    body { background: #FAF8F5; margin: 0; padding: 30px 15px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .controls { max-width: 820px; margin: 0 auto 20px auto; display: flex; justify-content: space-between; align-items: center; background: white; padding: 14px 20px; border-radius: 8px; border: 1px solid #E8E3DC; }
    .btn-print { background: #C9A84C; color: white; border: none; padding: 10px 24px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 13px; }
    .btn-print:hover { background: #B8963B; }
    @media print {
      body { background: white; padding: 0; }
      .controls { display: none; }
      .page-break { page-break-after: always; break-after: page; }
      .invoice-wrapper { border: none !important; box-shadow: none !important; margin: 0 !important; padding: 20px !important; }
    }
  </style>
</head>
<body>
  <div class="controls">
    <div>
      <strong style="color: #1A1A1A; font-size: 15px;">Combined Printable Invoices</strong>
      <p style="margin: 2px 0 0 0; font-size: 12px; color: #6B6B6B;">Total ${orders.length} tax invoices ready for printing with automated page breaks</p>
    </div>
    <button class="btn-print" onclick="window.print()">🖨️ Print All Invoices</button>
  </div>

  ${invoiceHtmlList.join('')}
</body>
</html>
    `

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  } catch (err: any) {
    return new Response(`Error: ${err.message}`, { status: 500 })
  }
}
