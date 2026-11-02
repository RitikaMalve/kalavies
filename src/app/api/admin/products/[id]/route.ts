import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { checkSkuAvailability } from '@/lib/skuHelper'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params
  if (id === 'check-sku') {
    return checkSkuAvailability(req)
  }
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

    const parsedSellingPrice = Number(sellingPrice) || 0
    if (status === 'PUBLISHED' && parsedSellingPrice <= 0) {
      return NextResponse.json(
        { error: 'Selling Price (Rate) must be greater than ₹0 to publish a product.' },
        { status: 400 }
      )
    }

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
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orderItems: true },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (product._count.orderItems > 0) {
      // Product has existing order history: preserve order records via soft delete / archive
      await prisma.product.update({
        where: { id },
        data: { status: 'ARCHIVED' },
      })
      return NextResponse.json({
        success: true,
        message: `Product "${product.name}" is associated with existing customer orders and has been safely archived (soft deleted) to protect order history.`,
        softDeleted: true,
      })
    } else {
      // No order history: safe to fully delete product and related dependencies
      await prisma.$transaction([
        prisma.productImage.deleteMany({ where: { productId: id } }),
        prisma.productVariant.deleteMany({ where: { productId: id } }),
        prisma.cartItem.deleteMany({ where: { productId: id } }),
        prisma.wishlistItem.deleteMany({ where: { productId: id } }),
        prisma.review.deleteMany({ where: { productId: id } }),
        prisma.stockMovement.deleteMany({ where: { productId: id } }),
        prisma.trendingProduct.deleteMany({ where: { productId: id } }),
        prisma.discountRule.deleteMany({ where: { targetId: id } }),
        prisma.product.delete({ where: { id } }),
      ])
      return NextResponse.json({
        success: true,
        message: `Product "${product.name}" deleted successfully.`,
        softDeleted: false,
      })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete product' }, { status: 500 })
  }
}
