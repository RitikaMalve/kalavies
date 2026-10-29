import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { generateInvoiceNumber } from '@/lib/utils'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: orderId } = await params

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: true,
        orderAddresses: {
          include: {
            shipments: { include: { items: { include: { orderItem: true } } } },
            invoices: { include: { items: true } },
          },
        },
        shipments: {
          include: {
            orderAddress: true,
            items: { include: { orderItem: true } },
            invoices: true,
          },
        },
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
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: orderId } = await params
    const { destinations } = await req.json()

    if (!destinations || !Array.isArray(destinations) || destinations.length === 0) {
      return NextResponse.json({ error: 'Please provide at least one destination address' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Validate allocated quantities against order.items
    const allocatedTotals: Record<string, number> = {}
    for (const dest of destinations) {
      for (const item of dest.items || []) {
        allocatedTotals[item.orderItemId] = (allocatedTotals[item.orderItemId] || 0) + Number(item.quantity)
      }
    }

    for (const orderItem of order.items) {
      const allocated = allocatedTotals[orderItem.id] || 0
      if (allocated > orderItem.quantity) {
        throw new Error(
          `Allocated quantity (${allocated}) for "${orderItem.productName}" exceeds purchased quantity (${orderItem.quantity})`
        )
      }
    }

    // Execute in transaction
    const result = await prisma.$transaction(async (tx) => {
      const createdShipments: any[] = []
      const createdInvoices: any[] = []

      for (let i = 0; i < destinations.length; i++) {
        const dest = destinations[i]
        const shipmentNumber = `SHP-${order.orderNumber}-${i + 1}`
        const invoiceNumber = generateInvoiceNumber()

        // 1. Create OrderAddress
        const orderAddress = await tx.orderAddress.create({
          data: {
            orderId: order.id,
            recipientName: dest.recipientName,
            recipientPhone: dest.recipientPhone,
            addressLine1: dest.addressLine1,
            addressLine2: dest.addressLine2 || null,
            city: dest.city,
            state: dest.state,
            pincode: dest.pincode,
            label: dest.label || `Address ${i + 1}: ${dest.city}`,
          },
        })

        // 2. Calculate destination item totals
        let destSubtotal = 0
        const shipmentItemData: any[] = []
        const invoiceItemData: any[] = []

        for (const it of dest.items || []) {
          const originalOrderItem = order.items.find((oi) => oi.id === it.orderItemId)
          if (!originalOrderItem) continue

          const qty = Number(it.quantity)
          const lineTotal = originalOrderItem.price * qty
          destSubtotal += lineTotal

          shipmentItemData.push({
            orderItemId: originalOrderItem.id,
            quantity: qty,
          })

          invoiceItemData.push({
            orderItemId: originalOrderItem.id,
            productName: originalOrderItem.productName,
            sku: originalOrderItem.sku,
            quantity: qty,
            unitPrice: originalOrderItem.price,
            discount: 0,
            taxRate: 3,
            taxAmount: Math.round((lineTotal * 3) / 103),
            totalAmount: lineTotal,
          })
        }

        const destShipping = dest.shippingCharge ? Number(dest.shippingCharge) : 0
        const destTax = Math.round((destSubtotal * 3) / 103)
        const destTotal = destSubtotal + destShipping

        // 3. Create Shipment
        const shipment = await tx.shipment.create({
          data: {
            shipmentNumber,
            orderId: order.id,
            orderAddressId: orderAddress.id,
            status: 'READY_TO_SHIP',
            courierName: dest.courierName || 'Blue Dart Express',
            trackingNumber: dest.trackingNumber || `BLU${Math.floor(10000000 + Math.random() * 90000000)}`,
            shippingCharge: destShipping,
            subtotal: destSubtotal,
            tax: destTax,
            total: destTotal,
            notes: dest.notes || `Multi-address split shipment for ${dest.recipientName}`,
            items: {
              create: shipmentItemData,
            },
          },
        })

        // 4. Create separate legally distinct Tax Invoice for this recipient/delivery address
        const invoice = await tx.invoice.create({
          data: {
            orderId: order.id,
            shipmentId: shipment.id,
            orderAddressId: orderAddress.id,
            invoiceNumber,
            type: 'SPLIT_SHIPMENT',
            status: 'ISSUED',
            businessName: 'KALAVIES Jewellery Pvt Ltd',
            businessAddress: '108, Jewellery Palace, MG Road, Bangalore, Karnataka, 560001',
            businessGstin: '29ABCDE1234F1Z5',
            customerName: dest.recipientName,
            customerPhone: dest.recipientPhone,
            customerAddress: `${dest.addressLine1}, ${dest.city}, ${dest.state} - ${dest.pincode}`,
            subtotal: destSubtotal,
            discount: 0,
            shipping: destShipping,
            tax: destTax,
            total: destTotal,
            items: {
              create: invoiceItemData,
            },
          },
        })

        // Audit log
        await tx.invoiceAuditLog.create({
          data: {
            invoiceId: invoice.id,
            action: 'GENERATED',
            performedBy: session.email || 'ADMIN',
            reason: `Split shipment invoice created for destination: ${dest.recipientName} (${dest.city})`,
            details: JSON.stringify({
              orderId: order.id,
              shipmentId: shipment.id,
              orderAddressId: orderAddress.id,
              totalAmount: destTotal,
            }),
          },
        })

        createdShipments.push(shipment)
        createdInvoices.push(invoice)
      }

      return { createdShipments, createdInvoices }
    })

    return NextResponse.json({
      success: true,
      shipmentsCount: result.createdShipments.length,
      invoicesCount: result.createdInvoices.length,
      shipments: result.createdShipments,
      invoices: result.createdInvoices,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
