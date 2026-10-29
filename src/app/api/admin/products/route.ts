import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const categoryId = searchParams.get('category') || ''
  const status = searchParams.get('status') || ''

  const where: any = {}
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { sku: { contains: search } },
    ]
  }
  if (categoryId) where.categoryId = categoryId
  if (status) where.status = status

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      category: { select: { id: true, name: true } },
      images: true,
      variants: true,
    },
  })

  return NextResponse.json({ products })
}

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const {
      name,
      slug,
      sku,
      categoryId,
      collectionName,
      brandName,
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
      searchTags,
      seoTitle,
      metaDescription,
      images,
      variants,
    } = body

    if (!name || !slug || !sku || !categoryId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        sku,
        categoryId,
        collectionName,
        brandName: brandName || 'KALAVIES',
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
        totalStock: Number(totalStock) || 0,
        lowStockThreshold: Number(lowStockThreshold) || 5,
        status: status || 'PUBLISHED',
        isFeatured: Boolean(isFeatured),
        isTrending: Boolean(isTrending),
        isBestseller: Boolean(isBestseller),
        isNewArrival: Boolean(isNewArrival),
        searchTags,
        seoTitle,
        metaDescription,
        images: {
          create: (images || []).map((url: string, index: number) => ({
            url,
            isPrimary: index === 0,
            sortOrder: index,
          })),
        },
        variants: {
          create: (variants || []).map((v: any) => ({
            name: v.name,
            sku: v.sku,
            size: v.size,
            color: v.color,
            price: Number(v.price),
            mrp: Number(v.mrp),
            stock: Number(v.stock),
          })),
        },
      },
    })

    // Record opening stock movement
    if (totalStock > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          type: 'OPENING',
          quantity: totalStock,
          reason: 'Initial Product Stock Registration',
          adminId: user.id,
          previousQty: 0,
          newQty: totalStock,
        },
      })
    }

    return NextResponse.json({ success: true, product })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
