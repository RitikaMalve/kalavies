import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const user = await getSession()
  if (!user) return NextResponse.json({ items: [] })

  const items = await prisma.wishlistItem.findMany({
    where: { userId: user.id },
    include: {
      product: {
        include: { images: { take: 1, orderBy: { isPrimary: 'desc' } } },
      },
    },
  })

  const formatted = items.map((i) => ({
    id: i.id,
    productId: i.productId,
    name: i.product.name,
    image: i.product.images[0]?.url,
    price: i.product.sellingPrice,
    mrp: i.product.mrp,
    slug: i.product.slug,
  }))

  return NextResponse.json({ items: formatted })
}

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ success: true, guest: true })

  try {
    const { productId } = await req.json()
    await prisma.wishlistItem.upsert({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
      update: {},
      create: {
        userId: user.id,
        productId,
      },
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
    const { productId } = await req.json()
    await prisma.wishlistItem.deleteMany({
      where: {
        userId: user.id,
        productId,
      },
    })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
