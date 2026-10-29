import { prisma } from '@/lib/prisma'
import TrendingManager from '@/components/admin/TrendingManager'

export const dynamic = 'force-dynamic'

export default async function AdminTrendingPage() {
  const [settings, trendingProducts, allProducts] = await Promise.all([
    prisma.trendingSettings.findFirst(),
    prisma.trendingProduct.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            sellingPrice: true,
            totalStock: true,
            soldCount: true,
            category: { select: { name: true } },
          },
        },
      },
      orderBy: { priority: 'asc' },
    }),
    prisma.product.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        id: true,
        name: true,
        sku: true,
        isTrending: true,
        isBestseller: true,
        isFeatured: true,
        isNewArrival: true,
        soldCount: true,
      },
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <TrendingManager
      initialSettings={
        settings || {
          id: '',
          mode: 'HYBRID',
          autoWindowDays: 30,
          maxDisplayCount: 12,
          excludeOutOfStock: true,
        }
      }
      initialTrending={trendingProducts}
      allProducts={allProducts}
    />
  )
}
