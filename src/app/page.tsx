import { prisma } from '@/lib/prisma'
import StoreLayout from '@/components/store/StoreLayout'
import ProductCard from '@/components/store/ProductCard'
import HeroBanner from '@/components/store/HeroBanner'
import Link from 'next/link'
import { Sparkles, ArrowRight, ShieldCheck, Heart, Star, Tag, ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

const CATEGORY_REAL_IMAGES: Record<string, string> = {
  'earrings': '/images/categories/earrings.jpg?v=20261102',
  'nose-pins': '/images/categories/nose-pins.jpg?v=20261102',
  'necklaces': '/images/categories/necklaces.jpg?v=20261102',
  'bangles': '/images/categories/bangles.jpg?v=20261102',
  'rings': '/images/categories/rings.jpg?v=20261102',
}

function resolveLink(url?: string | null): string {
  if (!url || !url.trim()) return '/products'
  const clean = url.trim()
  if (clean === '/collections/new-arrivals' || clean === '/collections/new') return '/products?filter=new'
  if (clean.startsWith('/collections/')) return `/products?collection=${encodeURIComponent(clean.replace('/collections/', ''))}`
  if (clean.startsWith('/categories/')) return `/products?category=${encodeURIComponent(clean.replace('/categories/', ''))}`
  if (clean === '/collections' || clean === '/categories') return '/products'
  return clean
}

export default async function HomePage() {
  let banners: any[] = []
  let categories: any[] = []
  let trendingProducts: any[] = []
  let bestsellers: any[] = []
  let newArrivals: any[] = []
  let coupons: any[] = []
  let testimonials: any[] = []

  try {
    const results = await Promise.all([
      prisma.homepageBanner.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.category.findMany({
        where: { parentId: null, isActive: true },
        include: {
          children: { where: { isActive: true } },
          _count: { select: { products: true } },
        },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.product.findMany({
        where: { isTrending: true, status: 'PUBLISHED', sellingPrice: { gt: 0 } },
        take: 8,
        include: { images: true, category: true },
        orderBy: { soldCount: 'desc' },
      }),
      prisma.product.findMany({
        where: { isBestseller: true, status: 'PUBLISHED', sellingPrice: { gt: 0 } },
        take: 8,
        include: { images: true, category: true },
        orderBy: { soldCount: 'desc' },
      }),
      prisma.product.findMany({
        where: { isNewArrival: true, status: 'PUBLISHED', sellingPrice: { gt: 0 } },
        take: 8,
        include: { images: true, category: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.coupon.findMany({
        where: { isActive: true },
        take: 2,
      }),
      prisma.testimonial.findMany({
        where: { isActive: true },
        take: 3,
        orderBy: { sortOrder: 'asc' },
      }),
    ])

  banners = results[0] || []
    categories = results[1] || []
    trendingProducts = results[2] || []
    bestsellers = results[3] || []
    newArrivals = results[4] || []
    coupons = results[5] || []
    testimonials = results[6] || []
  } catch (error) {
    console.error('Error fetching homepage data:', error)
  }

  const fallbackCategories = [
    {
      id: 'cat-earrings',
      name: 'Earrings',
      slug: 'earrings',
      image: '/images/categories/earrings.jpg?v=20261101',
      _count: { products: 24 },
    },
    {
      id: 'cat-nose-pins',
      name: 'Nose Pins',
      slug: 'nose-pins',
      image: '/images/categories/nose-pins.jpg?v=20261101',
      _count: { products: 8 },
    },
    {
      id: 'cat-necklaces',
      name: 'Necklaces',
      slug: 'necklaces',
      image: '/images/categories/necklaces.jpg?v=20261101',
      _count: { products: 15 },
    },
    {
      id: 'cat-bangles',
      name: 'Bangles',
      slug: 'bangles',
      image: '/images/categories/bangles.jpg?v=20261101',
      _count: { products: 10 },
    },
    {
      id: 'cat-rings',
      name: 'Rings',
      slug: 'rings',
      image: '/images/categories/rings.jpg?v=20261101',
      _count: { products: 14 },
    },
  ]

  // Strictly show ONLY the 5 core essentials: Earrings, Nose Pins, Necklaces, Bangles, Rings
  const CORE_CATEGORY_SLUGS = ['earrings', 'nose-pins', 'necklaces', 'bangles', 'rings']

  const allAvailableCategories =
    categories.length === 0
      ? fallbackCategories
      : categories.flatMap((c) => (c.children && c.children.length > 0 ? [c, ...c.children] : [c]))

  const displayCategories = CORE_CATEGORY_SLUGS.map((slug) => {
    const found = allAvailableCategories.find((c) => c.slug === slug)
    if (found) return found
    return fallbackCategories.find((c) => c.slug === slug)
  }).filter(Boolean) as typeof fallbackCategories

  return (
    <StoreLayout>
      {/* Responsive Hero Banner Carousel / Single Banner */}
      <HeroBanner banners={banners} />

      {/* Coupon Strip */}
      {coupons.length > 0 && (
        <section className="bg-[#FAF8F5] border-y border-[#E8E3DC] py-3">
          <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-center gap-6 text-xs text-[#2D2D2D]">
            {coupons.map((c) => (
              <div key={c.id} className="flex items-center gap-2">
                <Tag size={14} className="text-[#C9A84C]" />
                <span>
                  Use code <strong className="font-mono text-[#C9A84C]">{c.code}</strong> for{' '}
                  {c.type === 'PERCENTAGE' ? `${c.value}% OFF` : `₹${c.value} OFF`}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Categories Showcase */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C9A84C]">
            Explore By Category
          </span>
          <h2
            className="text-3xl font-bold tracking-tight text-[#1A1A1A] mt-2"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Curated Jewellery Universes
          </h2>
          <p className="text-xs sm:text-sm text-[#6B6B6B] mt-2">
            Affordable gold and silver-tone imitation jewellery for everyday use and special occasions.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {displayCategories.map((cat: any) => {
            const catImage = CATEGORY_REAL_IMAGES[cat.slug] || cat.image || '/images/categories/oxidised-jewellery.jpg'
            return (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group relative rounded-2xl border border-[#E8E3DC] bg-white p-4 text-center shadow-sm hover:shadow-lg hover:border-[#C9A84C] transition-all duration-300 flex flex-col items-center justify-between"
              >
                <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-2xl overflow-hidden border border-[#C9A84C]/25 bg-[#FAF8F5] mb-3 group-hover:scale-105 group-hover:border-[#C9A84C] transition duration-300 shadow-sm flex items-center justify-center relative">
                  <img
                    src={catImage}
                    alt={cat.name}
                    width={112}
                    height={112}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="eager"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#2D2D2D] group-hover:text-[#C9A84C] transition line-clamp-1">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-[#6B6B6B] mt-0.5">
                    {cat.children?.length > 0
                      ? `${cat.children.length} styles`
                      : cat._count?.products !== undefined
                      ? `${cat._count.products} items`
                      : 'Curated'}
                  </p>
                </div>
                <span className="mt-3 inline-flex items-center text-[11px] font-semibold text-[#C9A84C] group-hover:translate-x-0.5 transition-transform">
                  Explore <ChevronRight size={12} className="ml-0.5" />
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Trending Now Section */}
      {trendingProducts.length > 0 && (
        <section className="bg-white border-y border-[#E8E3DC] py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-rose-600">
                  🔥 Viral In Style
                </span>
                <h2
                  className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A1A] mt-1"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  Trending Collections
                </h2>
              </div>
              <Link
                href="/products?filter=trending"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#C9A84C] hover:underline"
              >
                View All Trending <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {trendingProducts.map((p) => (
                <ProductCard key={p.id} product={p as any} />
              ))}
            </div>
          </div>
        </section>
      )}


      {/* Bestsellers Section */}
      {bestsellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#C9A84C]">
                ⭐ Most Loved
              </span>
              <h2
                className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A1A] mt-1"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Bestselling Jewellery Pieces
              </h2>
            </div>
            <Link
              href="/products?filter=bestseller"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#C9A84C] hover:underline"
            >
              View All Bestsellers <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {bestsellers.map((p) => (
              <ProductCard key={p.id} product={p as any} />
            ))}
          </div>
        </section>
      )}

      {/* New Arrivals Section */}
      {newArrivals.length > 0 && (
        <section className="bg-white border-t border-[#E8E3DC] py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                  🌿 Just In
                </span>
                <h2
                  className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A1A] mt-1"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  New Arrivals
                </h2>
              </div>
              <Link
                href="/products?filter=new"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#C9A84C] hover:underline"
              >
                View All New Arrivals <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {newArrivals.map((p) => (
                <ProductCard key={p.id} product={p as any} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Brand Heritage Banner */}
      <section className="bg-gradient-to-b from-[#FAF8F5] to-white border-y border-[#E8E3DC] py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-block p-1 rounded-full shadow-md mb-4">
            <img
              src="/logo-circle.png"
              alt="KALAVIES Seal of Heritage"
              className="h-24 w-24 rounded-full object-contain"
            />
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#C9A84C] block mb-2">
            The KALAVIES Promise
          </span>
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1A1A1A] mb-4"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Everyday Elegance, Made Affordable
          </h2>
          <p className="text-sm text-[#6B6B6B] leading-relaxed max-w-2xl mx-auto">
            Kalavies offers affordable, stylish gold-tone and silver-tone imitation jewellery for everyday use, casual outfits, and special occasions. Feather-light, skin-friendly pieces designed to elevate your everyday sparkle.
          </p>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-xl bg-white border border-[#E8E3DC]/80 shadow-xs">
              <span className="text-lg block">👑</span>
              <span className="text-xs font-bold text-[#2D2D2D] block mt-1">Premium Quality</span>
              <span className="text-[10px] text-[#6B6B6B]">Authentic designs</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#E8E3DC]/80 shadow-xs">
              <span className="text-lg block">🌿</span>
              <span className="text-xs font-bold text-[#2D2D2D] block mt-1">Skin-Safe Materials</span>
              <span className="text-[10px] text-[#6B6B6B]">Lead &amp; nickel free</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#E8E3DC]/80 shadow-xs">
              <span className="text-lg block">📦</span>
              <span className="text-xs font-bold text-[#2D2D2D] block mt-1">Luxury Packaging</span>
              <span className="text-[10px] text-[#6B6B6B]">Ready for gifting</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#E8E3DC]/80 shadow-xs">
              <span className="text-lg block">✨</span>
              <span className="text-xs font-bold text-[#2D2D2D] block mt-1">Assured Quality</span>
              <span className="text-[10px] text-[#6B6B6B]">Strict quality checks</span>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      {testimonials.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C9A84C]">
              Real Customer Love
            </span>
            <h2
              className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A1A] mt-1"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Words From Our Patrons
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="rounded-2xl border border-[#E8E3DC] bg-white p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-1 text-amber-400 mb-3">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-[#2D2D2D] italic leading-relaxed">
                    "{t.comment}"
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#E8E3DC] flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-amber-50 text-[#C9A84C] font-bold text-xs flex items-center justify-center">
                    {t.name[0]}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-[#2D2D2D]">{t.name}</h5>
                    <p className="text-[10px] text-[#6B6B6B]">{t.location || 'Verified Buyer'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </StoreLayout>
  )
}
