import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buildProductSearchWhere, rankProductsByRelevance } from '@/lib/search'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q') || searchParams.get('search') || ''

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ products: [], totalCount: 0 })
    }

    const searchConditions = buildProductSearchWhere(query)

    const where: any = {
      status: 'PUBLISHED',
      isDeleted: false,
      sellingPrice: { gt: 0 },
      ...(searchConditions.length > 0 ? { OR: searchConditions } : {}),
    }

    const products = await prisma.product.findMany({
      where,
      take: 20, // Fetch up to 20 to rank and return top 8
      include: {
        images: {
          take: 1,
          orderBy: { isPrimary: 'desc' },
        },
        category: {
          select: { name: true, slug: true },
        },
      },
    })

    // Rank by relevance
    const ranked = rankProductsByRelevance(products, query).slice(0, 8)

    const formatted = ranked.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      sellingPrice: p.sellingPrice,
      mrp: p.mrp,
      totalStock: p.totalStock,
      categoryName: p.category?.name,
      imageUrl: p.images[0]?.url || '/images/products/placeholder-1.jpg',
    }))

    return NextResponse.json({
      success: true,
      query,
      products: formatted,
      totalCount: products.length,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Search failed' }, { status: 500 })
  }
}
