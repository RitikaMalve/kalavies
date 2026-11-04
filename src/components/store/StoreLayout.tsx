import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import StoreHeader from '@/components/store/StoreHeader'
import StoreFooter from '@/components/store/StoreFooter'

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  let categories: any[] = []
  let user: any = null

  try {
    const results = await Promise.all([
      prisma.category.findMany({
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
      }),
      getSession(),
    ])

    const rawCategories = results[0] || []
    // Filter out any parent categories that have 0 products (both direct and in children)
    categories = rawCategories.filter((cat: any) => {
      const directCount = cat._count?.products || 0
      const childrenCount = (cat.children || []).reduce(
        (sum: number, ch: any) => sum + (ch._count?.products || 0),
        0
      )
      return directCount + childrenCount > 0
    })
    user = results[1]
  } catch (error) {
    console.error('Error fetching layout data:', error)
  }

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <StoreHeader categories={categories} user={user} />
      <main className="flex-1">{children}</main>
      <StoreFooter />
    </div>
  )
}
