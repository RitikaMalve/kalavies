import { prisma } from '@/lib/prisma'
import CategoriesManager from '@/components/admin/CategoriesManager'

export const dynamic = 'force-dynamic'

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      children: {
        include: {
          children: true,
          _count: { select: { products: true } },
        },
      },
      _count: { select: { products: true } },
    },
  })

  return <CategoriesManager initialCategories={categories} />
}
