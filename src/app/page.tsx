import { prisma } from '@/lib/prisma'
import { getCachedStoreCategories } from '@/lib/categories'
import StoreLayout from '@/components/store/StoreLayout'
import ProductCard from '@/components/store/ProductCard'
import HeroBanner from '@/components/store/HeroBanner'
import PromotionalRibbon from '@/components/store/PromotionalRibbon'
import Link from 'next/link'
import { Sparkles, ArrowRight, ShieldCheck, Heart, Star, Tag, ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

const CATEGORY_REAL_IMAGES: Record<string, string> = {
  'earrings': '/images/categories/earrings.jpg?v=20261102',
  'nose-pins': '/images/categories/nose-pins.jpg?v=20261102',
  'necklaces': '/images/categories/necklaces.jpg?v=20261102',
  'bangles': '/images/categories/bangles.jpg?v=20261102',
  'rings': '/images/categories/rings.jpg?v=20261102',
  'gold-traditional-jewellery': '/images/categories/cat-traditional.jpg',
  'oxidised-jewellery': '/images/categories/oxidised-jewellery.jpg',
  'anti-tarnish-jewellery': '/images/categories/cat-daily.jpg',
  'demand-jewellery': '/images/categories/cat-festive.jpg',
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
  let necklaceCount = 0
  let earringCount = 0
  let nosePinCount = 0
  let bangleCount = 0
  let ringCount = 0

  try {
    const results = await Promise.all([
      prisma.homepageBanner.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
      getCachedStoreCategories(),
      prisma.product.findMany({
        where: { isTrending: true, isDeleted: false, status: 'PUBLISHED', sellingPrice: { gt: 0 } },
        take: 8,
        include: { images: true, category: true },
        orderBy: { soldCount: 'desc' },
      }),
      prisma.product.findMany({
        where: { isBestseller: true, isDeleted: false, status: 'PUBLISHED', sellingPrice: { gt: 0 } },
        take: 8,
        include: { images: true, category: true },
        orderBy: { soldCount: 'desc' },
      }),
      prisma.product.findMany({
        where: { isNewArrival: true, isDeleted: false, status: 'PUBLISHED', sellingPrice: { gt: 0 } },
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
      // Counts across the store for core jewellery universes
      prisma.product.count({
        where: {
          isDeleted: false,
          status: 'PUBLISHED',
          sellingPrice: { gt: 0 },
          OR: [
            { category: { slug: { contains: 'necklace' } } },
            { category: { name: { contains: 'necklace', mode: 'insensitive' } } },
            { name: { contains: 'necklace', mode: 'insensitive' } },
            { name: { contains: 'choker', mode: 'insensitive' } },
          ],
        },
      }),
      prisma.product.count({
        where: {
          isDeleted: false,
          status: 'PUBLISHED',
          sellingPrice: { gt: 0 },
          OR: [
            { category: { slug: { contains: 'earring' } } },
            { category: { slug: { contains: 'earing' } } },
            { category: { slug: { contains: 'cuff' } } },
            { name: { contains: 'earring', mode: 'insensitive' } },
            { name: { contains: 'jhumka', mode: 'insensitive' } },
            { name: { contains: 'dangler', mode: 'insensitive' } },
            { name: { contains: 'ear cuff', mode: 'insensitive' } },
          ],
        },
      }),
      prisma.product.count({
        where: {
          isDeleted: false,
          status: 'PUBLISHED',
          sellingPrice: { gt: 0 },
          OR: [
            { category: { slug: { contains: 'nose' } } },
            { name: { contains: 'nose pin', mode: 'insensitive' } },
            { name: { contains: 'nath', mode: 'insensitive' } },
          ],
        },
      }),
      prisma.product.count({
        where: {
          isDeleted: false,
          status: 'PUBLISHED',
          sellingPrice: { gt: 0 },
          OR: [
            { category: { slug: { contains: 'bangle' } } },
            { category: { slug: { contains: 'bracelet' } } },
            { name: { contains: 'bangle', mode: 'insensitive' } },
            { name: { contains: 'kada', mode: 'insensitive' } },
            { name: { contains: 'bracelet', mode: 'insensitive' } },
          ],
        },
      }),
      prisma.product.count({
        where: {
          isDeleted: false,
          status: 'PUBLISHED',
          sellingPrice: { gt: 0 },
          AND: [
            {
              NOT: [
                { category: { slug: { contains: 'earring' } } },
                { name: { contains: 'earring', mode: 'insensitive' } },
                { name: { contains: 'earing', mode: 'insensitive' } },
              ],
            },
            {
              OR: [
                { category: { slug: 'rings' } },
                { category: { slug: { contains: 'finger-ring' } } },
                { name: { contains: 'finger ring', mode: 'insensitive' } },
                { name: { contains: 'band ring', mode: 'insensitive' } },
              ],
            },
          ],
        },
      }),
    ])

    banners = results[0] || []
    categories = results[1] || []
    trendingProducts = results[2] || []
    bestsellers = results[3] || []
    newArrivals = results[4] || []
    coupons = results[5] || []
    testimonials = results[6] || []
    necklaceCount = results[7] || 0
    earringCount = results[8] || 0
    nosePinCount = results[9] || 0
    bangleCount = results[10] || 0
    ringCount = results[11] || 0
  } catch (error) {
    console.error('Error fetching homepage data:', error)
  }

  // Core essential jewellery collections with verified live product counts
  const coreUniverses = [
    {
      id: 'universe-necklaces',
      name: 'Necklaces & Chokers',
      slug: 'necklaces',
      image: '/images/categories/necklaces.jpg?v=20261102',
      count: necklaceCount,
    },
    {
      id: 'universe-earrings',
      name: 'Earrings & Jhumkas',
      slug: 'earrings',
      image: '/images/categories/earrings.jpg?v=20261102',
      count: earringCount,
    },
    {
      id: 'universe-nose-pins',
      name: 'Nose Pins',
      slug: 'nose-pins',
      image: '/images/categories/nose-pins.jpg?v=20261102',
      count: nosePinCount,
    },
    {
      id: 'universe-bangles',
      name: 'Bangles & Kadas',
      slug: 'bangles',
      image: '/images/categories/bangles.jpg?v=20261102',
      count: bangleCount,
    },
    {
      id: 'universe-rings',
      name: 'Rings',
      slug: 'rings',
      image: '/images/categories/rings.jpg?v=20261102',
      count: ringCount,
    },
  ]

  // Parent categories with verified live product counts
  const parentUniverses = (categories || []).map((cat: any) => {
    const directCount = cat._count?.products || 0
    const childrenCount = (cat.children || []).reduce(
      (sum: number, ch: any) => sum + (ch._count?.products || 0),
      0
    )
    return {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      image:
        CATEGORY_REAL_IMAGES[cat.slug] ||
        cat.image ||
        '/images/categories/oxidised-jewellery.jpg',
      count: directCount + childrenCount,
    }
  })

  // Combine and STRICTLY filter: when jewellery is empty (count === 0), do NOT show that category or tab!
  const combined = [...coreUniverses, ...parentUniverses]
  const seenSlugs = new Set<string>()
  const displayCategories = combined.filter((c) => {
    if (seenSlugs.has(c.slug)) return false
    seenSlugs.add(c.slug)
    // ONLY show categories that actually have products in stock
    return c.count > 0
  })

  return (
    <StoreLayout>
      {/* Responsive Hero Banner Carousel / Single Banner */}
      <HeroBanner banners={banners} />

      {/* Creative Interactive Perks & Promotional Ribbon */}
      <PromotionalRibbon coupons={coupons} />

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

        <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 lg:grid-cols-5 sm:gap-4 scrollbar-none">
          {displayCategories.map((cat: any) => {
            const catImage = CATEGORY_REAL_IMAGES[cat.slug] || cat.image || '/images/categories/oxidised-jewellery.jpg'
            return (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group relative rounded-2xl border border-[#E8E3DC] bg-white p-3.5 sm:p-4 text-center shadow-xs hover:shadow-lg hover:border-[#C9A84C] transition-all duration-300 flex flex-col items-center justify-between shrink-0 w-36 sm:w-auto active:scale-95"
              >
                <div className="w-20 h-20 sm:w-28 sm:h-28 shrink-0 rounded-2xl overflow-hidden border border-[#C9A84C]/25 bg-[#FAF8F5] mb-2 sm:mb-3 group-hover:scale-105 group-hover:border-[#C9A84C] transition duration-300 shadow-xs flex items-center justify-center relative">
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
                  <h3 className="font-bold text-xs sm:text-sm text-[#2D2D2D] group-hover:text-[#C9A84C] transition line-clamp-1">
                    {cat.name}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-[#6B6B6B] mt-0.5">
                    {cat.count !== undefined
                      ? `${cat.count} items`
                      : cat.children?.length > 0
                      ? `${cat.children.length} styles`
                      : cat._count?.products !== undefined
                      ? `${cat._count.products} items`
                      : 'Curated'}
                  </p>
                </div>
                <span className="mt-2 sm:mt-3 inline-flex items-center text-[10px] sm:text-[11px] font-semibold text-[#C9A84C] group-hover:translate-x-0.5 transition-transform">
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
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

      {/* Instagram Community Section */}
      <section className="border-t border-[#E8E3DC] bg-gradient-to-b from-white to-[#FAF8F5] py-14">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white shadow-md mb-3">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#C9A84C] block mb-1">
            Join Our Community
          </span>
          <h2
            className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A1A] mb-2"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Follow @kalavies on Instagram
          </h2>
          <p className="text-xs sm:text-sm text-[#6B6B6B] max-w-md mx-auto mb-6">
            Get styling inspiration, daily wear showcases, behind-the-scenes designs, and exclusive flash deals.
          </p>
          <a
            href="https://www.instagram.com/kalavies?utm_source=ig_web_button_share_sheet&exln=ZDNlZDc0MzIxNw=="
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-95 text-white px-6 py-3 text-xs sm:text-sm font-bold tracking-wide shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            <span>Follow @kalavies on Instagram</span>
          </a>
        </div>
      </section>
    </StoreLayout>
  )
}
