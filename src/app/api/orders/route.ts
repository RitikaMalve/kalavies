import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { generateOrderNumber, generateInvoiceNumber } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSession()
    const { customerDetails, paymentMethod, items, subtotal, shippingCharge, totalAmount } =
      await req.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 })
    }

    if (!customerDetails?.fullName || !customerDetails?.phone || !customerDetails?.addressLine1) {
      return NextResponse.json({ error: 'Please provide complete delivery details' }, { status: 400 })
    }

    // Verify user or create guest customer record
    let userId = sessionUser?.id
    if (!userId) {
      // Find or create customer by email
      const existingUser = await prisma.user.findUnique({
        where: { email: customerDetails.email },
      })
      if (existingUser) {
        userId = existingUser.id
      } else {
        const guestUser = await prisma.user.create({
          data: {
            email: customerDetails.email,
            passwordHash: 'guest-no-password',
            firstName: customerDetails.fullName.split(' ')[0] || 'Valued',
            lastName: customerDetails.fullName.split(' ').slice(1).join(' ') || 'Customer',
            phone: customerDetails.phone,
            role: 'CUSTOMER',
          },
        })
        userId = guestUser.id
      }
    }

    const orderNumber = generateOrderNumber()
    const invoiceNumber = generateInvoiceNumber()

    // Database transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify and reduce stock for all items
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        })

        if (!product || product.totalStock < item.quantity) {
          throw new Error(
            `Insufficient stock for "${item.productName}". Available: ${product?.totalStock || 0}`
          )
        }

        // Deduct product stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            totalStock: { decrement: item.quantity },
            soldCount: { increment: item.quantity },
          },
        })

        // Log stock movement
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            variantId: item.variantId || null,
            type: 'SALE',
            quantity: -item.quantity,
            reason: `Order ${orderNumber}`,
            previousQty: product.totalStock,
            newQty: product.totalStock - item.quantity,
          },
        })
      }

      // 2. Create the Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: 'CONFIRMED',
          subtotal: Number(subtotal),
          shippingCharge: Number(shippingCharge),
          totalAmount: Number(totalAmount),
          paymentMethod: paymentMethod || 'COD',
          paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
          shippingName: customerDetails.fullName,
          shippingPhone: customerDetails.phone,
          shippingAddress: `${customerDetails.addressLine1} ${customerDetails.addressLine2 || ''}`.trim(),
          shippingCity: customerDetails.city,
          shippingState: customerDetails.state,
          shippingPincode: customerDetails.pincode,
          items: {
            create: items.map((i: any) => ({
              productId: i.productId,
              variantId: i.variantId || null,
              productName: i.productName,
              variantName: i.variantName || null,
              sku: i.sku,
              quantity: Number(i.quantity),
              mrp: Number(i.mrp),
              price: Number(i.price),
              totalPrice: Number(i.totalPrice),
              productImage: i.productImage || null,
            })),
          },
        },
      })

      // 3. Create Tax Invoice
      await tx.invoice.create({
        data: {
          orderId: newOrder.id,
          invoiceNumber,
          businessName: 'KALAVIES Jewellery Pvt Ltd',
          businessAddress: '108, Jewellery Palace, MG Road, Bangalore, Karnataka, 560001',
          businessGstin: '29ABCDE1234F1Z5',
          customerName: customerDetails.fullName,
          customerEmail: customerDetails.email,
          customerPhone: customerDetails.phone,
          customerAddress: `${customerDetails.addressLine1}, ${customerDetails.city}, ${customerDetails.state} - ${customerDetails.pincode}`,
          subtotal: Number(subtotal),
          shipping: Number(shippingCharge),
          tax: 0,
          total: Number(totalAmount),
        },
      })

      return newOrder
    })

    return NextResponse.json({ success: true, order: result })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
