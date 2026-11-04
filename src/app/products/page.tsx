import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { getCachedStoreCategories } from '@/lib/categories'
import StoreLayout from '@/components/store/StoreLayout'
import ProductCard from '@/components/store/ProductCard'
import Link from 'next/link'
import SortSelector from '@/components/store/SortSelector'
import { Filter, X, ChevronRight, SlidersHorizontal, Search } from 'lucide-react'
import { buildProductSearchWhere, rankProductsByRelevance } from '@/lib/search'

export const dynamic = 'force-dynamic'

const PRICE_TIERS = [
  { label: 'Under ₹149', min: undefined, max: 149 },
  { label: 'Under ₹199', min: undefined, max: 199 },
  { label: 'Under ₹299', min: undefined, max: 299 },
  { label: 'Under ₹499', min: undefined, max: 499 },
  { label: '₹500 & Above', min: 500, max: undefined },
]

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

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams
  const categorySlug = params.category || ''
  const search = params.search || ''

  if (categorySlug) {
    if (categorySlug === 'necklaces' || categorySlug === 'necklace') {
      return {
        title: 'Buy Handcrafted Necklaces & Chokers Online | KALAVIES India',
        description: 'Shop authentic curated gold-tone & anti-tarnish necklaces, chokers, and pendant sets at best prices from KALAVIES India.',
        alternates: { canonical: `/products?category=${categorySlug}` },
      }
    }
    if (categorySlug === 'earrings' || categorySlug === 'earring') {
      return {
        title: 'Buy Designer Earrings & Jhumkas Online | KALAVIES India',
        description: 'Shop authentic oxidised and gold-look earrings, studs, ear cuffs, and danglers at best prices from KALAVIES India.',
        alternates: { canonical: `/products?category=${categorySlug}` },
      }
    }

    try {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
      })
      if (category) {
        return {
          title: `Buy ${category.name} Online | KALAVIES India`,
          description: `Shop authentic curated ${category.name} online at best prices. Premium oxidised silver designs, secure UPI payment & free shipping above ₹699.`,
          alternates: {
            canonical: `/products?category=${categorySlug}`,
          },
          openGraph: {
            title: `${category.name} Collection | KALAVIES Jewellery`,
            description: `Explore our curated collection of ${category.name}.`,
          },
        }
      }
    } catch {}
  }

  if (search) {
    return {
      title: `Search: "${search}" | KALAVIES Jewellery`,
      description: `Browse jewellery search results for "${search}" at KALAVIES.`,
    }
  }

  return {
    title: 'All Jewellery Collections | KALAVIES India',
    description:
      'Explore authentic oxidised earrings, jhumkas, necklaces, chokers, bangles, and bridal jewellery sets. Free shipping above ₹699 with fast nationwide delivery.',
    alternates: {
      canonical: '/products',
    },
  }
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
  const limit = 18

  // URL generator to preserve search and active filters
  const buildCatalogUrl = (overrides: Record<string, string | number | undefined>) => {
    const queryObj = new URLSearchParams()
    if (search) queryObj.set('search', search)
    if (categorySlug) queryObj.set('category', categorySlug)
    if (sort && sort !== 'newest') queryObj.set('sort', sort)
    if (material) queryObj.set('material', material)
    if (filterBadge) queryObj.set('filter', filterBadge)
    if (minPrice !== undefined) queryObj.set('minPrice', String(minPrice))
    if (maxPrice !== undefined) queryObj.set('maxPrice', String(maxPrice))

    Object.entries(overrides).forEach(([key, val]) => {
      if (val === undefined || val === '') {
        queryObj.delete(key)
      } else {
        queryObj.set(key, String(val))
      }
    })
    const qs = queryObj.toString()
    return qs ? `/products?${qs}` : '/products'
  }

  // Build where clause
  const where: any = { status: 'PUBLISHED', isDeleted: false, sellingPrice: { gt: 0 } }

  if (search) {
    const searchConditions = buildProductSearchWhere(search)
    if (searchConditions.length > 0) {
      where.OR = searchConditions
    }
  }

  let products: any[] = []
  let totalCount = 0
  let categories: any[] = []

  try {
    if (categorySlug) {
      const isNecklaceFilter =
        categorySlug === 'necklaces' ||
        categorySlug === 'necklace' ||
        categorySlug.toLowerCase().includes('necklace') ||
        categorySlug.toLowerCase().includes('nackless')

      const isEarringFilter =
        categorySlug === 'earrings' ||
        categorySlug === 'earring' ||
        categorySlug === 'earings'

      if (isNecklaceFilter) {
        // Find all categories representing necklaces across the entire catalogue
        const necklaceCategories = await prisma.category.findMany({
          where: {
            isActive: true,
            OR: [
              { slug: { contains: 'necklace' } },
              { name: { contains: 'necklace', mode: 'insensitive' } },
              { slug: { contains: 'choker' } },
              { name: { contains: 'choker', mode: 'insensitive' } },
            ],
          },
          select: { id: true },
        })

        const catIds = necklaceCategories.map((c) => c.id)

        where.OR = [
          ...(where.OR || []),
          { categoryId: { in: catIds } },
          { name: { contains: 'necklace', mode: 'insensitive' } },
          { name: { contains: 'choker', mode: 'insensitive' } },
        ]
      } else if (isEarringFilter) {
        // Find all categories representing earrings across the entire catalogue
        const earringCategories = await prisma.category.findMany({
          where: {
            isActive: true,
            OR: [
              { slug: { contains: 'earring' } },
              { slug: { contains: 'earing' } },
              { slug: { contains: 'cuff' } },
              { name: { contains: 'earring', mode: 'insensitive' } },
              { name: { contains: 'earing', mode: 'insensitive' } },
              { name: { contains: 'cuff', mode: 'insensitive' } },
            ],
          },
          select: { id: true },
        })

        const catIds = earringCategories.map((c) => c.id)

        where.OR = [
          ...(where.OR || []),
          { categoryId: { in: catIds } },
          { name: { contains: 'earring', mode: 'insensitive' } },
          { name: { contains: 'jhumka', mode: 'insensitive' } },
          { name: { contains: 'dangler', mode: 'insensitive' } },
          { name: { contains: 'ear cuff', mode: 'insensitive' } },
        ]
      } else {
        const matchedCategory = await prisma.category.findUnique({
          where: { slug: categorySlug },
          include: { children: { where: { isActive: true } } },
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
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.sellingPrice = {}
      if (minPrice !== undefined) where.sellingPrice.gte = minPrice
      if (maxPrice !== undefined) where.sellingPrice.lte = maxPrice
    }

    if (material) {
      where.material = { contains: material, mode: 'insensitive' }
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

    const results = await Promise.all([
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
      getCachedStoreCategories(),
    ])

    // If searching and default sort, rank by relevance
    const rawProducts = results[0] || []
    products = search && sort === 'newest' ? rankProductsByRelevance(rawProducts, search) : rawProducts
    totalCount = results[1]
    categories = results[2] || []
  } catch (err) {
    console.error('Error fetching catalog products:', err)
  }

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
              {search ? (
                <span>
                  Results for &ldquo;<span className="text-[#C9A84C]">{search}</span>&rdquo;
                </span>
              ) : categorySlug ? (
                categorySlug.replace(/-/g, ' ').toUpperCase()
              ) : (
                'ALL JEWELLERY'
              )}
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <p className="text-xs text-[#6B6B6B]">
                Showing {products.length} of {totalCount} curated ornaments
              </p>
              {search && (
                <Link
                  href={buildCatalogUrl({ search: undefined, page: 1 })}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-0.5 rounded-full border border-red-200 transition"
                >
                  Clear &ldquo;{search}&rdquo; ✕
                </Link>
              )}
              {(minPrice !== undefined || maxPrice !== undefined) && (
                <Link
                  href={buildCatalogUrl({ minPrice: undefined, maxPrice: undefined, page: 1 })}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8A1A31] bg-[#FAF8F5] hover:bg-[#F3EFEA] px-2.5 py-0.5 rounded-full border border-[#C9A84C]/50 transition"
                >
                  Price: {minPrice ? (maxPrice ? `₹${minPrice} - ₹${maxPrice}` : `₹${minPrice} & Above`) : `Under ₹${maxPrice}`} ✕
                </Link>
              )}
              {material && (
                <Link
                  href={buildCatalogUrl({ material: undefined, page: 1 })}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8A1A31] bg-[#FAF8F5] hover:bg-[#F3EFEA] px-2.5 py-0.5 rounded-full border border-[#C9A84C]/50 transition"
                >
                  Material: {material} ✕
                </Link>
              )}
            </div>
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#6B6B6B] uppercase">Sort By:</span>
            <SortSelector currentSort={sort} />
          </div>
        </div>

        {/* Horizontal Category & Quick Filter Pills for Mobile / Tablet */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 pt-3 scrollbar-none">
          <Link
            href={buildCatalogUrl({ category: undefined, filter: undefined, page: 1 })}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition active:scale-95 ${
              !categorySlug && !filterBadge
                ? 'bg-[#1A1A1A] text-white shadow-xs'
                : 'bg-white border border-[#E8E3DC] text-[#2D2D2D] hover:border-[#C9A84C]'
            }`}
          >
            All Jewellery
          </Link>
          <Link
            href={buildCatalogUrl({ filter: 'trending', page: 1 })}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition active:scale-95 ${
              filterBadge === 'trending'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white border border-[#E8E3DC] text-[#2D2D2D] hover:border-rose-400'
            }`}
          >
            🔥 Trending
          </Link>
          <Link
            href={buildCatalogUrl({ filter: 'bestseller', page: 1 })}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition active:scale-95 ${
              filterBadge === 'bestseller'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-white border border-[#E8E3DC] text-[#2D2D2D] hover:border-purple-400'
            }`}
          >
            ⭐ Bestsellers
          </Link>
          <Link
            href={buildCatalogUrl({ filter: 'new', page: 1 })}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition active:scale-95 ${
              filterBadge === 'new'
                ? 'bg-[#C9A84C] text-white shadow-xs'
                : 'bg-white border border-[#E8E3DC] text-[#2D2D2D] hover:border-[#C9A84C]'
            }`}
          >
            ✨ New In
          </Link>
          <Link
            href={buildCatalogUrl({ category: 'necklaces', filter: undefined, page: 1 })}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition active:scale-95 ${
              categorySlug === 'necklaces'
                ? 'bg-[#C9A84C] text-white shadow-xs'
                : 'bg-white border border-[#E8E3DC] text-[#2D2D2D] hover:border-[#C9A84C]'
            }`}
          >
            Necklaces
          </Link>
          <Link
            href={buildCatalogUrl({ category: 'earrings', filter: undefined, page: 1 })}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition active:scale-95 ${
              categorySlug === 'earrings'
                ? 'bg-[#C9A84C] text-white shadow-xs'
                : 'bg-white border border-[#E8E3DC] text-[#2D2D2D] hover:border-[#C9A84C]'
            }`}
          >
            Earrings
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={buildCatalogUrl({ category: c.slug, page: 1 })}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition active:scale-95 ${
                categorySlug === c.slug
                  ? 'bg-[#C9A84C] text-white shadow-xs'
                  : 'bg-white border border-[#E8E3DC] text-[#2D2D2D] hover:border-[#C9A84C]'
              }`}
            >
              {c.name}
            </Link>
          ))}
          {PRICE_TIERS.map((tier) => {
            const isActive = minPrice === tier.min && maxPrice === tier.max
            return (
              <Link
                key={tier.label}
                href={
                  isActive
                    ? buildCatalogUrl({ minPrice: undefined, maxPrice: undefined, page: 1 })
                    : buildCatalogUrl({ minPrice: tier.min, maxPrice: tier.max, page: 1 })
                }
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition active:scale-95 ${
                  isActive
                    ? 'bg-[#C9A84C] text-white shadow-xs'
                    : 'bg-white border border-[#E8E3DC] text-[#2D2D2D] hover:border-[#C9A84C]'
                }`}
              >
                {tier.label}
              </Link>
            )
          })}
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
                    href={buildCatalogUrl({ category: undefined, page: 1 })}
                    className={`block py-1 ${
                      !categorySlug ? 'font-bold text-[#C9A84C]' : 'text-[#6B6B6B] hover:text-[#2D2D2D]'
                    }`}
                  >
                    All Categories
                  </Link>
                  <Link
                    href={buildCatalogUrl({ category: 'necklaces', page: 1 })}
                    className={`block py-1 font-semibold ${
                      categorySlug === 'necklaces'
                        ? 'text-[#C9A84C]'
                        : 'text-[#2D2D2D] hover:text-[#C9A84C]'
                    }`}
                  >
                    Necklaces & Chokers
                  </Link>
                  <Link
                    href={buildCatalogUrl({ category: 'earrings', page: 1 })}
                    className={`block py-1 font-semibold ${
                      categorySlug === 'earrings'
                        ? 'text-[#C9A84C]'
                        : 'text-[#2D2D2D] hover:text-[#C9A84C]'
                    }`}
                  >
                    Earrings & Jhumkas
                  </Link>
                  {categories.map((c) => (
                    <div key={c.id}>
                      <Link
                        href={buildCatalogUrl({ category: c.slug, page: 1 })}
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
                          {c.children.map((sub: any) => (
                            <Link
                              key={sub.id}
                              href={buildCatalogUrl({ category: sub.slug, page: 1 })}
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
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D2D2D]">
                    Price Range
                  </h4>
                  {(minPrice !== undefined || maxPrice !== undefined) && (
                    <Link
                      href={buildCatalogUrl({ minPrice: undefined, maxPrice: undefined, page: 1 })}
                      className="text-[10px] font-semibold text-[#C9A84C] hover:underline"
                    >
                      Clear
                    </Link>
                  )}
                </div>
                <div className="space-y-1 text-xs">
                  {PRICE_TIERS.map((tier) => {
                    const isActive = minPrice === tier.min && maxPrice === tier.max
                    return (
                      <Link
                        key={tier.label}
                        href={
                          isActive
                            ? buildCatalogUrl({ minPrice: undefined, maxPrice: undefined, page: 1 })
                            : buildCatalogUrl({ minPrice: tier.min, maxPrice: tier.max, page: 1 })
                        }
                        className={`flex items-center justify-between py-1 px-2 rounded-lg transition-colors ${
                          isActive
                            ? 'font-bold text-[#C9A84C] bg-amber-50/70'
                            : 'text-[#6B6B6B] hover:text-[#2D2D2D] hover:bg-neutral-50'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          {isActive && <span className="h-1.5 w-1.5 rounded-full bg-[#C9A84C]" />}
                          <span>{tier.label}</span>
                        </span>
                        {isActive && <span className="text-[11px] font-bold text-[#C9A84C]">✓</span>}
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Material Filter */}
              <div className="pt-4 border-t border-[#E8E3DC]">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D2D2D]">
                    Material
                  </h4>
                  {material && (
                    <Link
                      href={buildCatalogUrl({ material: undefined, page: 1 })}
                      className="text-[10px] font-semibold text-[#C9A84C] hover:underline"
                    >
                      Clear
                    </Link>
                  )}
                </div>
                <div className="space-y-1 text-xs">
                  {['Oxidised Silver', 'Brass', 'German Silver', 'Alloy', 'Gold Plated'].map((mat) => {
                    const isMatActive = material.toLowerCase() === mat.toLowerCase()
                    return (
                      <Link
                        key={mat}
                        href={
                          isMatActive
                            ? buildCatalogUrl({ material: undefined, page: 1 })
                            : buildCatalogUrl({ material: mat, page: 1 })
                        }
                        className={`flex items-center justify-between py-1 px-2 rounded-lg transition-colors ${
                          isMatActive
                            ? 'font-bold text-[#C9A84C] bg-amber-50/70'
                            : 'text-[#6B6B6B] hover:text-[#2D2D2D] hover:bg-neutral-50'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          {isMatActive && <span className="h-1.5 w-1.5 rounded-full bg-[#C9A84C]" />}
                          <span>{mat}</span>
                        </span>
                        {isMatActive && <span className="text-[11px] font-bold text-[#C9A84C]">✓</span>}
                      </Link>
                    )
                  })}
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
                <h3 className="font-bold text-lg text-[#2D2D2D]">
                  {search ? `No Jewellery Found for "${search}"` : 'No Matching Jewellery Found'}
                </h3>
                <p className="text-xs text-[#6B6B6B] mt-1 max-w-sm mx-auto">
                  {search
                    ? 'We searched titles, descriptions, and materials. Try checking keywords or exploring our full collection below.'
                    : 'Try adjusting your search criteria or resetting filters to view our full collection.'}
                </p>
                <Link
                  href="/products"
                  className="mt-6 inline-block rounded-lg bg-[#C9A84C] px-5 py-2.5 text-xs font-semibold text-white shadow hover:bg-[#B8963B] transition"
                >
                  View All Products
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
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
                    href={buildCatalogUrl({ page: page - 1 })}
                    className="rounded-lg border border-[#E8E3DC] bg-white px-3 py-1.5 text-xs font-medium text-[#2D2D2D] hover:bg-gray-50"
                  >
                    Previous
                  </Link>
                )}
                {Array.from({ length: totalPages }).map((_, i) => (
                  <Link
                    key={i}
                    href={buildCatalogUrl({ page: i + 1 })}
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
                    href={buildCatalogUrl({ page: page + 1 })}
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
