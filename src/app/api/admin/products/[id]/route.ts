import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true, variants: true, category: true },
  })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ product })
}

export async function PUT(req: NextRequest, { params }: Params) {
  const user = await getSession()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  let cleanSku = ''
  try {
    const body = await req.json()
    const {
      name,
      slug,
      sku,
      categoryId,
      collectionName,
      description,
      detailedContent,
      material,
      colour,
      style,
      weight,
      mrp,
      sellingPrice,
      costPrice,
      discountPercent,
      totalStock,
      lowStockThreshold,
      status,
      isFeatured,
      isTrending,
      isBestseller,
      isNewArrival,
      images,
    } = body

    cleanSku = sku ? String(sku).trim().toUpperCase() : ''

    // Update product
    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        ...(cleanSku ? { sku: cleanSku } : {}),
        categoryId,
        collectionName,
        description,
        detailedContent,
        material,
        colour,
        style,
        weight,
        mrp: Number(mrp),
        sellingPrice: Number(sellingPrice),
        costPrice: Number(costPrice) || 0,
        discountPercent: Number(discountPercent) || 0,
        totalStock: Number(totalStock),
        lowStockThreshold: Number(lowStockThreshold),
        status,
        isFeatured: Boolean(isFeatured),
        isTrending: Boolean(isTrending),
        isBestseller: Boolean(isBestseller),
        isNewArrival: Boolean(isNewArrival),
      },
    })

    // Sync images if provided
    if (images && Array.isArray(images)) {
      await prisma.productImage.deleteMany({ where: { productId: id } })
      await prisma.productImage.createMany({
        data: images.map((url: string, index: number) => ({
          productId: id,
          url,
          isPrimary: index === 0,
          sortOrder: index,
        })),
      })
    }

    return NextResponse.json({ success: true, product: updated })
  } catch (err: any) {
    if (err.code === 'P2002') {
      const target = err.meta?.target || []
      const targetStr = Array.isArray(target) ? target.join(', ') : String(target)
      if (targetStr.includes('sku')) {
        return NextResponse.json(
          { error: `A product with SKU "${cleanSku}" already exists. Please choose a different SKU.` },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: `Duplicate item found (${targetStr}). Please use unique values.` },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const user = await getSession()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  try {
    // Soft delete product by marking ARCHIVED
    await prisma.product.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    })
    return NextResponse.json({ success: true, message: 'Product archived' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
