import { prisma } from '@/lib/prisma'
import StoreLayout from '@/components/store/StoreLayout'
import ProductCard from '@/components/store/ProductCard'
import Link from 'next/link'
import { Sparkles, ArrowRight, ShieldCheck, Heart, Star, Tag, ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

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
        where: { isTrending: true, status: 'PUBLISHED' },
        take: 8,
        include: { images: true, category: true },
        orderBy: { soldCount: 'desc' },
      }),
      prisma.product.findMany({
        where: { isBestseller: true, status: 'PUBLISHED' },
        take: 8,
        include: { images: true, category: true },
        orderBy: { soldCount: 'desc' },
      }),
      prisma.product.findMany({
        where: { isNewArrival: true, status: 'PUBLISHED' },
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

    banners = results[0]
    categories = results[1]
    trendingProducts = results[2]
    bestsellers = results[3]
    newArrivals = results[4]
    coupons = results[5]
    testimonials = results[6]
  } catch (error) {
    console.error('Error fetching homepage data:', error)
  }

  const heroBanner = banners[0] || {
    title: 'Royal Indian Handcrafted Jewellery',
    subtitle: 'Antique Oxidised Silver & Traditional Grandeur',
    description: 'Elevate your festive ensembles with timeless craftsmanship and authentic Indian heritage.',
    imageUrl: '/images/banners/banner-1.jpg',
    buttonText: 'Explore Collections',
    linkUrl: '/products',
  }

  return (
    <StoreLayout>
      {/* Hero Banner Section */}
      <section className="relative bg-[#1A1A1A] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-40 mix-blend-overlay">
          <img
            src={heroBanner.imageUrl}
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-28 lg:py-36 flex flex-col items-center text-center">
          {heroBanner.subtitle && (
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C9A84C]/50 bg-black/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#C9A84C] backdrop-blur-sm mb-6">
              <Sparkles size={14} />
              {heroBanner.subtitle}
            </div>
          )}

          <h1
            className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-3xl leading-tight"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            {heroBanner.title}
          </h1>

          <p className="mt-6 text-base sm:text-lg text-white/80 max-w-2xl leading-relaxed">
            {heroBanner.description ||
              'Intricately carved oxidised silver, kundan bridal motifs, and contemporary daily essentials crafted for the modern Indian connoisseur.'}
          </p>

          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link
              href={heroBanner.linkUrl || '/products'}
              className="inline-flex items-center gap-2 rounded-full bg-[#C9A84C] px-8 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-[#B8963B] transition transform hover:-translate-y-0.5"
            >
              {heroBanner.buttonText || 'Shop Collection'} <ArrowRight size={16} />
            </Link>
            <Link
              href="/products?category=oxidised-jewellery"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition"
            >
              Oxidised Collection
            </Link>
          </div>
        </div>
      </section>

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
            From regal oxidised heritage sets to lightweight everyday sparkle.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group relative rounded-2xl border border-[#E8E3DC] bg-white p-5 text-center shadow-sm hover:shadow-md hover:border-[#C9A84C] transition flex flex-col items-center justify-between"
            >
              <div className="h-24 w-24 rounded-2xl overflow-hidden border border-[#C9A84C]/30 bg-[#FAF8F5] mb-3 group-hover:scale-105 group-hover:border-[#C9A84C] transition duration-300 shadow-sm flex items-center justify-center">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-amber-50 flex items-center justify-center">
                    <Sparkles size={28} className="text-[#C9A84C]" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#2D2D2D] group-hover:text-[#C9A84C] transition">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-[#6B6B6B] mt-0.5">
                  {cat.children?.length || 0} subcategories
                </p>
              </div>
              <span className="mt-3 inline-flex items-center text-[10px] font-semibold text-[#C9A84C]">
                Explore <ChevronRight size={12} />
              </span>
            </Link>
          ))}
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

      {/* Promotional Middle Banner */}
      {banners[1] && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="relative rounded-2xl overflow-hidden bg-[#1A1A1A] text-white p-8 sm:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl space-y-3 text-center md:text-left">
              <span className="rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/40 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#C9A84C]">
                {banners[1].subtitle || 'Exclusive Offer'}
              </span>
              <h3
                className="text-2xl sm:text-4xl font-extrabold"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {banners[1].title}
              </h3>
              <p className="text-xs sm:text-sm text-white/80">
                {banners[1].description || 'Handcrafted silver tones with antique dark finish.'}
              </p>
              <div className="pt-2">
                <Link
                  href={banners[1].linkUrl || '/products'}
                  className="inline-flex items-center gap-2 rounded-full bg-[#C9A84C] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#B8963B] transition"
                >
                  {banners[1].buttonText || 'Discover Now'} <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            <div className="h-48 w-48 sm:h-64 sm:w-64 rounded-full border-4 border-[#C9A84C]/40 overflow-hidden shadow-2xl shrink-0">
              <img
                src={banners[1].imageUrl}
                alt="Promo"
                className="w-full h-full object-cover"
              />
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
            Rooted in Tradition, Designed for Eternity
          </h2>
          <p className="text-sm text-[#6B6B6B] leading-relaxed max-w-2xl mx-auto">
            Every KALAVIES piece is sculpted with centuries-old Indian artisan techniques, combining antique oxidised tones, hand-set Kundan stones, and modern skin-friendly materials to accompany you from festive celebrations to everyday grace.
          </p>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-xl bg-white border border-[#E8E3DC]/80 shadow-xs">
              <span className="text-lg block">👑</span>
              <span className="text-xs font-bold text-[#2D2D2D] block mt-1">Artisan Handcrafted</span>
              <span className="text-[10px] text-[#6B6B6B]">Heritage craftsmanship</span>
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
