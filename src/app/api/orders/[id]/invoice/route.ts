import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateInvoiceNumber } from '@/lib/utils'
import { generateInvoiceHtml, generateInvoicePdfBuffer, InvoiceData } from '@/lib/invoiceGenerator'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const invoiceId = searchParams.get('invoiceId')
    const format = searchParams.get('format') // 'pdf' or 'html'

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        items: true,
        invoices: {
          include: {
            items: true,
            orderAddress: true,
            shipment: true,
          },
        },
      },
    })

    if (!order) {
      return new Response('Order not found', { status: 404 })
    }

    // Select invoice
    let invoice = invoiceId
      ? order.invoices.find((inv) => inv.id === invoiceId)
      : order.invoices[0]

    // Create default invoice if none exists
    if (!invoice) {
      const invoiceNumber = generateInvoiceNumber()
      const customerName =
        order.shippingName ||
        (order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Valued Customer')
      const customerEmail = order.user?.email || null
      const customerPhone = order.shippingPhone || order.user?.phone || null
      const customerAddress = `${order.shippingAddress || ''}, ${order.shippingCity || ''}, ${order.shippingState || ''} - ${order.shippingPincode || ''}`

      invoice = await prisma.invoice.create({
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
            create: order.items.map((i) => ({
              orderItemId: i.id,
              productName: i.productName,
              sku: i.sku,
              quantity: i.quantity,
              unitPrice: i.price,
              discount: i.discount,
              taxRate: 3,
              taxAmount: Math.round((i.totalPrice * 3) / 103),
              totalAmount: i.totalPrice,
            })),
          },
        },
        include: {
          items: true,
          orderAddress: true,
          shipment: true,
        },
      })

      // Audit log
      await prisma.invoiceAuditLog.create({
        data: {
          invoiceId: invoice.id,
          action: 'GENERATED',
          performedBy: 'SYSTEM',
          reason: 'Auto-generated on invoice request',
        },
      })
    } else {
      // Record view / download audit
      await prisma.invoiceAuditLog.create({
        data: {
          invoiceId: invoice.id,
          action: format === 'pdf' ? 'DOWNLOADED' : 'PRINTED',
          performedBy: 'USER',
          reason: format === 'pdf' ? 'Downloaded PDF invoice' : 'Viewed HTML invoice',
        },
      })
    }

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
      trackingNumber: invoice.shipment?.trackingNumber || order.trackingNumber,
      subtotal: invoice.subtotal,
      discount: invoice.discount,
      shipping: invoice.shipping,
      tax: invoice.tax,
      total: invoice.total,
      type: invoice.type,
      addressLabel: invoice.orderAddress?.label,
      items:
        invoice.items && invoice.items.length > 0
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

    if (format === 'pdf') {
      const pdfBuffer = await generateInvoicePdfBuffer(invoiceData)
      return new Response(new Uint8Array(pdfBuffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="Invoice-${invoice.invoiceNumber}.pdf"`,
        },
      })
    }

    // Clean HTML Invoice
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice - ${invoice.invoiceNumber} | KALAVIES Jewellery</title>
  <style>
    * { box-sizing: border-box; }
    body { background: #FAF8F5; margin: 0; padding: 40px 15px; }
    .action-bar { max-width: 820px; margin: 0 auto 20px auto; display: flex; justify-content: space-between; align-items: center; }
    .btn { padding: 8px 18px; border-radius: 6px; font-weight: bold; font-size: 13px; text-decoration: none; cursor: pointer; border: none; }
    .btn-pdf { background: #C9A84C; color: white; }
    .btn-print { background: #2D2D2D; color: white; }
    @media print {
      body { background: white; padding: 0; }
      .action-bar { display: none; }
      .invoice-wrapper { border: none !important; box-shadow: none !important; padding: 0 !important; }
    }
  </style>
</head>
<body>
  <div class="action-bar">
    <a href="/admin/invoices" class="btn" style="background:#fff;border:1px solid #E8E3DC;color:#2D2D2D;">← Back to Invoices</a>
    <div style="display: flex; gap: 10px;">
      <a href="?format=pdf" class="btn btn-pdf">⬇️ Download Official PDF</a>
      <button onclick="window.print()" class="btn btn-print">🖨️ Print / Save PDF</button>
    </div>
  </div>

  ${generateInvoiceHtml(invoiceData)}
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
