import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, hashPassword, verifyPassword, createSession } from '@/lib/auth'
import { generateOrderNumber, generateInvoiceNumber } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSession()
    const {
      customerDetails,
      paymentMethod,
      items,
      subtotal,
      shippingCharge,
      totalAmount,
      password,
    } = await req.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 })
    }

    if (!customerDetails?.fullName || !customerDetails?.phone || !customerDetails?.addressLine1) {
      return NextResponse.json(
        { error: 'Please provide complete delivery details (Name, Phone, Address)' },
        { status: 400 }
      )
    }

    const cleanPhone = customerDetails.phone.replace(/\D/g, '').slice(-10)
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { error: 'Please provide a valid 10-digit mobile number' },
        { status: 400 }
      )
    }

    const cleanEmail = customerDetails.email ? customerDetails.email.toLowerCase().trim() : ''

    let userId = sessionUser?.id
    let newSessionToken: string | null = null

    // If unauthenticated, verify account or create a new account
    if (!userId) {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { phone: cleanPhone },
            { phone: `+91${cleanPhone}` },
            { phone: `91${cleanPhone}` },
            { phone: `0${cleanPhone}` },
            { phone: { endsWith: cleanPhone } },
            ...(cleanEmail ? [{ email: cleanEmail }] : []),
          ],
        },
      })

      if (existingUser) {
        // Account exists - require password authentication
        if (!password) {
          return NextResponse.json(
            {
              error: `An account already exists for ${existingUser.firstName || 'this mobile number'}. Please enter your password to proceed.`,
              requiresPassword: true,
              accountExists: true,
              userFirstName: existingUser.firstName,
            },
            { status: 401 }
          )
        }

        const isPasswordValid = await verifyPassword(password.trim(), existingUser.passwordHash)
        if (!isPasswordValid) {
          return NextResponse.json(
            {
              error: 'Incorrect password for this account. Please try again.',
              requiresPassword: true,
              accountExists: true,
              userFirstName: existingUser.firstName,
            },
            { status: 401 }
          )
        }

        userId = existingUser.id
        newSessionToken = await createSession(existingUser.id)
      } else {
        // Account does NOT exist - register new customer with phone and password
        if (!password || password.trim().length < 6) {
          return NextResponse.json(
            {
              error: 'Please create a password (at least 6 characters) to register your account and place your order.',
              requiresPassword: true,
              accountExists: false,
            },
            { status: 400 }
          )
        }

        const passwordHash = await hashPassword(password.trim())
        const nameParts = customerDetails.fullName.trim().split(/\s+/)
        const firstName = nameParts[0] || 'Valued'
        const lastName = nameParts.slice(1).join(' ') || 'Customer'
        const accountEmail = cleanEmail || `${cleanPhone}@kalavies.customer`

        // Check if fallback email happens to be taken
        const fallbackCheck = await prisma.user.findUnique({ where: { email: accountEmail } })
        const finalEmail = fallbackCheck ? `${cleanPhone}_${Date.now()}@kalavies.customer` : accountEmail

        const newUser = await prisma.user.create({
          data: {
            email: finalEmail,
            phone: cleanPhone,
            passwordHash,
            firstName,
            lastName,
            role: 'CUSTOMER',
          },
        })

        userId = newUser.id
        newSessionToken = await createSession(newUser.id)
      }
    }

    const orderNumber = generateOrderNumber()
    const invoiceNumber = generateInvoiceNumber()

    // Retrieve verified shipping rule from database
    const shippingSetting = await prisma.shippingSetting.findFirst()
    const freeShippingAbove = shippingSetting?.freeShippingAbove ?? 699
    const flatShippingRate = shippingSetting?.flatShippingRate ?? 70
    const verifiedShippingCharge = Number(subtotal) >= freeShippingAbove ? 0 : flatShippingRate
    const verifiedTotalAmount = Number(subtotal) + verifiedShippingCharge

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
          shippingCharge: verifiedShippingCharge,
          totalAmount: verifiedTotalAmount,
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
          customerEmail: customerDetails.email || `${cleanPhone}@customer`,
          customerPhone: customerDetails.phone,
          customerAddress: `${customerDetails.addressLine1}, ${customerDetails.city}, ${customerDetails.state} - ${customerDetails.pincode}`,
          subtotal: Number(subtotal),
          shipping: verifiedShippingCharge,
          tax: 0,
          total: verifiedTotalAmount,
        },
      })

      return newOrder
    })

    const response = NextResponse.json({ success: true, order: result })

    // Set authentication session cookie if user just logged in or registered during checkout
    if (newSessionToken) {
      response.cookies.set('session-token', newSessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      })
    }

    return response
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
