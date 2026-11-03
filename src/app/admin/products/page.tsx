import { prisma } from '@/lib/prisma'
import { buildProductSearchWhere } from '@/lib/search'
import { purgeExpiredDeletedProducts } from '@/lib/trashService'
import AdminProductsManagerClient, {
  ProductItem,
  CategoryOption,
} from '@/components/admin/AdminProductsManagerClient'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{
    tab?: string
    search?: string
    category?: string
    status?: string
    page?: string
  }>
}

export default async function AdminProductsPage({ searchParams }: Props) {
  // Purge any expired trash items (>24 hours) automatically on load
  await purgeExpiredDeletedProducts()

  const params = await searchParams
  const tab = (params.tab === 'trash' ? 'trash' : 'active') as 'active' | 'trash'
  const search = params.search || ''
  const categoryId = params.category || ''
  const status = params.status || ''
  const page = Number(params.page) || 1
  const limit = 15

  const where: any = {}

  if (tab === 'trash') {
    where.isDeleted = true
  } else {
    where.isDeleted = false
    if (search) {
      const searchConditions = buildProductSearchWhere(search)
      if (searchConditions.length > 0) {
        where.OR = searchConditions
      }
    }
    if (categoryId) {
      where.categoryId = categoryId
    }
    if (status) {
      if (status !== 'ALL') {
        where.status = status
      }
    } else {
      // By default, exclude archived status from active view unless specified
      where.status = { not: 'ARCHIVED' }
    }
  }

  const [products, totalCount, activeCount, trashCount, rawCategories] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: tab === 'trash' ? { deletedAt: 'desc' } : { createdAt: 'desc' },
      include: {
        category: { select: { id: true, name: true } },
        images: { take: 1, orderBy: { isPrimary: 'desc' } },
      },
    }),
    prisma.product.count({ where }),
    prisma.product.count({ where: { isDeleted: false } }),
    prisma.product.count({ where: { isDeleted: true } }),
    prisma.category.findMany({
      where: { parentId: null },
      include: { children: { select: { id: true, name: true } } },
      orderBy: { sortOrder: 'asc' },
    }),
  ])

  const serializedProducts: ProductItem[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    sellingPrice: p.sellingPrice,
    mrp: p.mrp,
    totalStock: p.totalStock,
    lowStockThreshold: p.lowStockThreshold,
    isFeatured: p.isFeatured,
    isTrending: p.isTrending,
    isBestseller: p.isBestseller,
    isNewArrival: p.isNewArrival,
    status: p.status,
    isDeleted: p.isDeleted,
    deletedAt: p.deletedAt ? p.deletedAt.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
    category: {
      id: p.category.id,
      name: p.category.name,
    },
    images: p.images.map((img) => ({ url: img.url })),
  }))

  const categories: CategoryOption[] = rawCategories.map((c) => ({
    id: c.id,
    name: c.name,
    children: c.children.map((sub) => ({ id: sub.id, name: sub.name })),
  }))

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <AdminProductsManagerClient
      products={serializedProducts}
      categories={categories}
      totalCount={totalCount}
      activeCount={activeCount}
      trashCount={trashCount}
      currentPage={page}
      totalPages={totalPages}
      limit={limit}
      currentTab={tab}
      searchQuery={search}
      selectedCategoryId={categoryId}
      selectedStatus={status}
    />
  )
}
