import { prisma } from '@/lib/prisma'
import StoreLayout from '@/components/store/StoreLayout'
import ProductCard from '@/components/store/ProductCard'
import Link from 'next/link'
import SortSelector from '@/components/store/SortSelector'
import { Filter, X, ChevronRight, SlidersHorizontal, Search } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{
    search?: string
    category?: string
    sort?: string
    minPrice?: string
    maxPrice?: string
    material?: string
    filter?: string
    page?: string
  }>
}

export default async function ProductsCatalogPage({ searchParams }: Props) {
  const params = await searchParams
  const search = params.search || ''
  const categorySlug = params.category || ''
  const sort = params.sort || 'newest'
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined
  const material = params.material || ''
  const filterBadge = params.filter || ''
  const page = Number(params.page) || 1
  const limit = 16

  // Build where clause
  const where: any = { status: 'PUBLISHED' }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { sku: { contains: search } },
      { material: { contains: search } },
      { searchTags: { contains: search } },
    ]
  }

  if (categorySlug) {
    const matchedCategory = await prisma.category.findUnique({
      where: { slug: categorySlug },
      include: { children: true },
    })

    if (matchedCategory) {
      if (matchedCategory.children.length > 0) {
        where.categoryId = {
          in: [matchedCategory.id, ...matchedCategory.children.map((c) => c.id)],
        }
      } else {
        where.categoryId = matchedCategory.id
      }
    }
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.sellingPrice = {}
    if (minPrice !== undefined) where.sellingPrice.gte = minPrice
    if (maxPrice !== undefined) where.sellingPrice.lte = maxPrice
  }

  if (material) {
    where.material = { contains: material }
  }

  if (filterBadge === 'trending') where.isTrending = true
  if (filterBadge === 'bestseller') where.isBestseller = true
  if (filterBadge === 'new') where.isNewArrival = true
  if (filterBadge === 'featured') where.isFeatured = true

  // Sort order
  let orderBy: any = { createdAt: 'desc' }
  if (sort === 'price-asc') orderBy = { sellingPrice: 'asc' }
  if (sort === 'price-desc') orderBy = { sellingPrice: 'desc' }
  if (sort === 'popularity') orderBy = { soldCount: 'desc' }
  if (sort === 'rating') orderBy = { avgRating: 'desc' }

  const [products, totalCount, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
      include: {
        images: true,
        category: true,
      },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      where: { parentId: null, isActive: true },
      include: { children: { where: { isActive: true } } },
      orderBy: { sortOrder: 'asc' },
    }),
  ])

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <StoreLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#6B6B6B] mb-6">
          <Link href="/" className="hover:text-[#C9A84C]">Home</Link>
          <ChevronRight size={12} />
          <span className="font-semibold text-[#2D2D2D]">Catalogue</span>
          {categorySlug && (
            <>
              <ChevronRight size={12} />
              <span className="capitalize text-[#C9A84C] font-semibold">{categorySlug.replace(/-/g, ' ')}</span>
            </>
          )}
        </div>

        {/* Heading & Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-[#E8E3DC] gap-4">
          <div>
            <h1
              className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2D2D2D]"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              {categorySlug ? categorySlug.replace(/-/g, ' ').toUpperCase() : 'ALL JEWELLERY'}
            </h1>
            <p className="text-xs text-[#6B6B6B] mt-1">
              Showing {products.length} of {totalCount} handcrafted ornaments
            </p>
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#6B6B6B] uppercase">Sort By:</span>
            <SortSelector currentSort={sort} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
          {/* Left Sidebar Filter */}
          <div className="hidden lg:block space-y-6">
            <div className="rounded-xl border border-[#E8E3DC] bg-white p-5 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E3DC]">
                <h3 className="font-bold text-sm text-[#2D2D2D] flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-[#C9A84C]" /> Filters
                </h3>
                <Link
                  href="/products"
                  className="text-[11px] font-semibold text-[#C9A84C] hover:underline"
                >
                  Reset All
                </Link>
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D2D2D] mb-2.5">
                  Categories
                </h4>
                <div className="space-y-1 max-h-60 overflow-y-auto text-xs">
                  <Link
                    href={`/products?sort=${sort}`}
                    className={`block py-1 ${
                      !categorySlug ? 'font-bold text-[#C9A84C]' : 'text-[#6B6B6B] hover:text-[#2D2D2D]'
                    }`}
                  >
                    All Categories
                  </Link>
                  {categories.map((c) => (
                    <div key={c.id}>
                      <Link
                        href={`/products?category=${c.slug}&sort=${sort}`}
                        className={`block py-1 font-semibold ${
                          categorySlug === c.slug
                            ? 'text-[#C9A84C]'
                            : 'text-[#2D2D2D] hover:text-[#C9A84C]'
                        }`}
                      >
                        {c.name}
                      </Link>
                      {c.children && (
                        <div className="pl-3 space-y-0.5">
                          {c.children.map((sub) => (
                            <Link
                              key={sub.id}
                              href={`/products?category=${sub.slug}&sort=${sort}`}
                              className={`block py-0.5 ${
                                categorySlug === sub.slug
                                  ? 'font-bold text-[#C9A84C]'
                                  : 'text-[#6B6B6B] hover:text-[#2D2D2D]'
                              }`}
                            >
                              └ {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="pt-4 border-t border-[#E8E3DC]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D2D2D] mb-2.5">
                  Price Range
                </h4>
                <div className="space-y-1.5 text-xs text-[#6B6B6B]">
                  <Link
                    href={`/products?category=${categorySlug}&maxPrice=499&sort=${sort}`}
                    className="block hover:text-[#C9A84C]"
                  >
                    Under ₹499
                  </Link>
                  <Link
                    href={`/products?category=${categorySlug}&minPrice=500&maxPrice=999&sort=${sort}`}
                    className="block hover:text-[#C9A84C]"
                  >
                    ₹500 - ₹999
                  </Link>
                  <Link
                    href={`/products?category=${categorySlug}&minPrice=1000&maxPrice=1999&sort=${sort}`}
                    className="block hover:text-[#C9A84C]"
                  >
                    ₹1,000 - ₹1,999
                  </Link>
                  <Link
                    href={`/products?category=${categorySlug}&minPrice=2000&sort=${sort}`}
                    className="block hover:text-[#C9A84C]"
                  >
                    ₹2,000 & Above
                  </Link>
                </div>
              </div>

              {/* Material Filter */}
              <div className="pt-4 border-t border-[#E8E3DC]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D2D2D] mb-2.5">
                  Material
                </h4>
                <div className="space-y-1.5 text-xs text-[#6B6B6B]">
                  {['Oxidised Silver', 'Brass', 'German Silver', 'Alloy', 'Gold Plated'].map((mat) => (
                    <Link
                      key={mat}
                      href={`/products?category=${categorySlug}&material=${encodeURIComponent(mat)}&sort=${sort}`}
                      className="block hover:text-[#C9A84C]"
                    >
                      {mat}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Product Grid */}
          <div className="lg:col-span-3 space-y-8">
            {products.length === 0 ? (
              <div className="rounded-2xl border border-[#E8E3DC] bg-white p-12 text-center">
                <div className="h-14 w-14 rounded-full bg-amber-50 text-[#C9A84C] flex items-center justify-center mx-auto mb-4">
                  <Search size={24} />
                </div>
                <h3 className="font-bold text-lg text-[#2D2D2D]">No Matching Jewellery Found</h3>
                <p className="text-xs text-[#6B6B6B] mt-1 max-w-sm mx-auto">
                  Try adjusting your search criteria or resetting filters to view our full collection.
                </p>
                <Link
                  href="/products"
                  className="mt-6 inline-block rounded-lg bg-[#C9A84C] px-5 py-2.5 text-xs font-semibold text-white shadow hover:bg-[#B8963B] transition"
                >
                  View All Products
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product as any} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 pt-4">
                {page > 1 && (
                  <Link
                    href={`/products?page=${page - 1}&category=${categorySlug}&sort=${sort}`}
                    className="rounded-lg border border-[#E8E3DC] bg-white px-3 py-1.5 text-xs font-medium text-[#2D2D2D] hover:bg-gray-50"
                  >
                    Previous
                  </Link>
                )}
                {Array.from({ length: totalPages }).map((_, i) => (
                  <Link
                    key={i}
                    href={`/products?page=${i + 1}&category=${categorySlug}&sort=${sort}`}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      page === i + 1
                        ? 'bg-[#C9A84C] text-white font-bold'
                        : 'border border-[#E8E3DC] bg-white text-[#2D2D2D] hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </Link>
                ))}
                {page < totalPages && (
                  <Link
                    href={`/products?page=${page + 1}&category=${categorySlug}&sort=${sort}`}
                    className="rounded-lg border border-[#E8E3DC] bg-white px-3 py-1.5 text-xs font-medium text-[#2D2D2D] hover:bg-gray-50"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </StoreLayout>
  )
}
