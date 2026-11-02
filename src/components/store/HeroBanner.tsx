'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'

interface BannerItem {
  id: string
  title?: string | null
  subtitle?: string | null
  description?: string | null
  imageUrl: string
  mobileImageUrl?: string | null
  buttonText?: string | null
  linkUrl?: string | null
}

interface HeroBannerProps {
  banners: BannerItem[]
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

export default function HeroBanner({ banners }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const bannerList: BannerItem[] = banners.length > 0 ? banners : [
    {
      id: 'default-hero-everyday',
      title: 'Everyday Elegance, Made Affordable',
      subtitle: 'DISCOVER BEAUTIFUL GOLD & SILVER IMITATION JEWELLERY FOR EVERY OCCASION',
      description: 'Lightweight daily-wear hoops, delicate chains, small studs, and minimal accents crafted for effortless style.',
      imageUrl: '/images/banners/hero-everyday-elegance.jpg?v=20261102',
      buttonText: 'Shop Collection',
      linkUrl: '/products',
    },
    {
      id: 'default-hero-earrings',
      title: 'Dainty Studs & Everyday Hoops',
      subtitle: 'LIGHTWEIGHT GOLD-TONE & SILVER-TONE ESSENTIALS',
      description: 'Comfortable, skin-friendly daily wear designed for college, work, and everyday moments.',
      imageUrl: '/images/banners/hero-dainty-hoops.jpg?v=20261102',
      buttonText: 'Shop Earrings',
      linkUrl: '/products?category=earrings',
    },
    {
      id: 'default-hero-chains',
      title: 'Delicate Chains & Layered Pendants',
      subtitle: 'MINIMAL & TRENDY FOR CASUAL & SPECIAL OCCASIONS',
      description: 'Subtle sparkle with minimalist silver and gold-tone pendants for effortless everyday style.',
      imageUrl: '/images/banners/hero-minimal-chains.jpg?v=20261102',
      buttonText: 'Shop Necklaces',
      linkUrl: '/products?category=necklaces',
    },
  ]

  const total = bannerList.length

  // Auto-advance slider
  useEffect(() => {
    if (total <= 1) return

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total)
    }, 6500)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [total])

  const goToPrev = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentIndex((prev) => (prev - 1 + total) % total)
  }

  const goToNext = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentIndex((prev) => (prev + 1) % total)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return
    const touchEnd = e.changedTouches[0].clientX
    const diff = touchStart - touchEnd
    if (diff > 45) {
      // Swiped left
      setCurrentIndex((prev) => (prev + 1) % total)
    } else if (diff < -45) {
      // Swiped right
      setCurrentIndex((prev) => (prev - 1 + total) % total)
    }
    setTouchStart(null)
  }

  const currentBanner = bannerList[currentIndex]

  return (
    <section className="relative w-full overflow-hidden bg-[#120E0C]">
      {/* 100% Full-Width Edge-to-Edge Hero Background */}
      <div
        className="group relative w-full h-[480px] sm:h-[560px] md:h-[640px] lg:h-[700px] xl:h-[740px] overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Link
          href={resolveLink(currentBanner.linkUrl)}
          className="block relative w-full h-full overflow-hidden focus:outline-none"
        >
          {/* Full Background Jewellery Photography - 100% Crystal-Clear */}
          <div className="absolute inset-0 w-full h-full">
            <picture>
              {currentBanner.mobileImageUrl && (
                <source
                  media="(max-width: 640px)"
                  srcSet={currentBanner.mobileImageUrl}
                />
              )}
              <img
                src={currentBanner.imageUrl}
                alt={currentBanner.title || 'KALAVIES Jewellery Banner'}
                className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-[1.02]"
                loading="eager"
                fetchPriority="high"
              />
            </picture>

            {/* Subtle Vignette Scrim - Lets Full Background Image Shine Bright & Vivid */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/65 via-black/20 to-black/30" />
          </div>

          {/* Centered Editorial Content Showcase Floating Over Full Background */}
          <div className="relative z-10 w-full h-full max-w-5xl mx-auto px-4 sm:px-8 flex flex-col items-center justify-center text-center pb-8 sm:pb-0 pointer-events-none">
            <div className="max-w-2xl mx-auto flex flex-col items-center text-center">
              {currentBanner.subtitle && (
                <div className="inline-flex items-center justify-center gap-1.5 text-[10px] sm:text-xs font-bold tracking-[0.22em] uppercase mb-2 sm:mb-3 px-4 py-1.5 rounded-full bg-black/40 text-amber-300 border border-amber-300/30 backdrop-blur-md shadow-lg">
                  <Sparkles size={13} className="text-amber-300 shrink-0" />
                  <span>{currentBanner.subtitle}</span>
                </div>
              )}

              {currentBanner.title && (
                <h1
                  className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-2 sm:mb-4 text-center text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]"
                  style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                >
                  {currentBanner.title}
                </h1>
              )}

              {currentBanner.description && (
                <p className="text-xs sm:text-sm md:text-base font-normal leading-relaxed mb-5 sm:mb-7 line-clamp-2 sm:line-clamp-3 max-w-xl mx-auto text-center text-stone-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
                  {currentBanner.description}
                </p>
              )}

              {/* Shop Now Capsule Button */}
              <div className="pt-1 pointer-events-auto flex justify-center">
                <span className="inline-flex items-center gap-3 rounded-full py-2.5 sm:py-3.5 px-6 sm:px-9 text-xs sm:text-sm font-bold tracking-wider shadow-2xl transition-all duration-300 bg-white text-stone-950 hover:bg-[#C9A84C] hover:text-white border border-white/80 group-hover:scale-105">
                  <span>{currentBanner.buttonText || 'Shop Collection'}</span>
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#C9A84C] group-hover:bg-white text-white group-hover:text-stone-900 flex items-center justify-center shrink-0 shadow-sm transition-colors">
                    <ArrowRight size={13} />
                  </span>
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* Circular Left / Right Arrow Controls */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={goToPrev}
              aria-label="Previous Slide"
              className="absolute left-3 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/70 text-white shadow-2xl flex items-center justify-center border border-white/30 hover:scale-110 active:scale-95 transition-all z-20 cursor-pointer backdrop-blur-md"
            >
              <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={goToNext}
              aria-label="Next Slide"
              className="absolute right-3 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/70 text-white shadow-2xl flex items-center justify-center border border-white/30 hover:scale-110 active:scale-95 transition-all z-20 cursor-pointer backdrop-blur-md"
            >
              <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 stroke-[2.5]" />
            </button>

            {/* Slide Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
              {bannerList.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setCurrentIndex(i)
                  }}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentIndex
                      ? 'w-8 bg-[#C9A84C] shadow-lg ring-1 ring-white/50'
                      : 'w-2 bg-white/50 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
