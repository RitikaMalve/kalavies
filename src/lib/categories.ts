import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

/**
 * Fetch and cache the public navigation category tree with active products.
 * Cached for 5 minutes (300s) and tagged for on-demand invalidation.
 * Eliminates multi-second Neon remote round-trips on every page hit.
 */
export const getCachedStoreCategories = unstable_cache(
  async () => {
    try {
      const rawCategories = await prisma.category.findMany({
        where: { parentId: null, isActive: true },
        include: {
          children: {
            where: {
              isActive: true,
              products: {
                some: {
                  isDeleted: false,
                  status: 'PUBLISHED',
                  sellingPrice: { gt: 0 },
                },
              },
            },
            include: {
              _count: {
                select: {
                  products: {
                    where: {
                      isDeleted: false,
                      status: 'PUBLISHED',
                      sellingPrice: { gt: 0 },
                    },
                  },
                },
              },
            },
            orderBy: { sortOrder: 'asc' },
          },
          _count: {
            select: {
              products: {
                where: {
                  isDeleted: false,
                  status: 'PUBLISHED',
                  sellingPrice: { gt: 0 },
                },
              },
            },
          },
        },
        orderBy: { sortOrder: 'asc' },
      })

      // Strictly omit any parent category that has 0 published products
      return rawCategories.filter((cat: any) => {
        const directCount = cat._count?.products || 0
        const childrenCount = (cat.children || []).reduce(
          (sum: number, child: any) => sum + (child._count?.products || 0),
          0
        )
        return directCount > 0 || childrenCount > 0
      })
    } catch (err) {
      console.error('Failed to fetch cached store categories:', err)
      return []
    }
  },
  ['store-nav-categories'],
  {
    revalidate: 300, // 5 minutes
    tags: ['categories'],
  }
)
