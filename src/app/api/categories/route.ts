import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
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

  // Filter out any parent categories that have 0 products (both direct and in children)
  const categories = rawCategories.filter((cat) => {
    const directCount = cat._count?.products || 0
    const childrenCount = (cat.children || []).reduce(
      (sum: number, ch: any) => sum + (ch._count?.products || 0),
      0
    )
    return directCount + childrenCount > 0
  })

  return NextResponse.json({ categories })
}
