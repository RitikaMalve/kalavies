import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import JSZip from 'jszip'
import { generateInvoicePdfBuffer, generateInvoiceHtml, InvoiceData } from '@/lib/invoiceGenerator'
import { generateInvoiceNumber } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderIds, format = 'pdf' } = await req.json()
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: 'No orders selected' }, { status: 400 })
    }

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

    const zip = new JSZip()
    const invoiceFolder = zip.folder('KALAVIES_Invoices')

    for (const order of orders) {
      // Find or generate invoice
      let invoice = order.invoices[0]

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
          },
        })

        // Audit log
        await prisma.invoiceAuditLog.create({
          data: {
            invoiceId: invoice.id,
            action: 'GENERATED',
            performedBy: session.email || 'ADMIN',
            reason: 'Generated during bulk download',
          },
        })
      }

      // Record download audit
      await prisma.invoiceAuditLog.create({
        data: {
          invoiceId: invoice.id,
          action: 'DOWNLOADED',
          performedBy: session.email || 'ADMIN',
          reason: 'Bulk ZIP download',
        },
      })

      // Prepare invoice data
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

      if (format === 'html') {
        const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Invoice ${invoice.invoiceNumber}</title></head><body style="background:#f9f9f9;padding:20px;">${generateInvoiceHtml(invoiceData)}</body></html>`
        invoiceFolder?.file(`Invoice-${invoice.invoiceNumber}.html`, html)
      } else {
        // PDF format
        const pdfBuffer = await generateInvoicePdfBuffer(invoiceData)
        invoiceFolder?.file(`Invoice-${invoice.invoiceNumber}.pdf`, pdfBuffer)
      }
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })

    return new Response(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="KALAVIES_Invoices_${Date.now()}.zip"`,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
