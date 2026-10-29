import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const user = await getSession()
  if (!user) {
    return NextResponse.json({ items: [] })
  }

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: {
      product: {
        include: { images: { take: 1, orderBy: { isPrimary: 'desc' } } },
      },
      variant: true,
    },
  })

  const formatted = cartItems.map((item) => ({
    id: item.id,
    productId: item.productId,
    variantId: item.variantId || undefined,
    name: item.product.name,
    variantName: item.variant?.name,
    image: item.product.images[0]?.url,
    price: item.variant?.price || item.product.sellingPrice,
    mrp: item.variant?.mrp || item.product.mrp,
    quantity: item.quantity,
    maxStock: item.variant?.stock || item.product.totalStock,
    sku: item.variant?.sku || item.product.sku,
  }))

  return NextResponse.json({ items: formatted })
}

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ success: true, guest: true })

  try {
    const { productId, variantId, quantity } = await req.json()

    await prisma.cartItem.upsert({
      where: {
        userId_productId_variantId: {
          userId: user.id,
          productId,
          variantId: variantId || null,
        },
      },
      update: {
        quantity: { increment: quantity || 1 },
      },
      create: {
        userId: user.id,
        productId,
        variantId: variantId || null,
        quantity: quantity || 1,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ success: true, guest: true })

  try {
    const { productId, variantId, quantity } = await req.json()

    await prisma.cartItem.updateMany({
      where: {
        userId: user.id,
        productId,
        variantId: variantId || null,
      },
      data: { quantity },
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ success: true, guest: true })

  try {
    const { productId, variantId } = await req.json()

    await prisma.cartItem.deleteMany({
      where: {
        userId: user.id,
        productId,
        variantId: variantId || null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
