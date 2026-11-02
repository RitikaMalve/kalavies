'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'

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
      subtitle: 'HANDCRAFTED GOLD & SILVER ESSENTIALS',
      description: 'Lightweight daily-wear chains, small charms, and minimal accents crafted for effortless style.',
      imageUrl: '/images/banners/hero-everyday-elegance.jpg?v=20261102y',
      mobileImageUrl: '/images/banners/hero-necklace-mobile.jpg?v=20261102y',
      buttonText: 'Shop Collection',
      linkUrl: '/products',
    },
    {
      id: 'default-hero-earrings',
      title: 'Dainty Studs & Everyday Hoops',
      subtitle: 'OXIDISED PEACOCK & TURQUOISE COLLECTION',
      description: 'Comfortable, skin-friendly daily wear designed for college, work, and everyday moments.',
      imageUrl: '/images/banners/hero-dainty-hoops.jpg?v=20261102y',
      mobileImageUrl: '/images/banners/hero-earrings-mobile.jpg?v=20261102y',
      buttonText: 'Shop Earrings',
      linkUrl: '/products?category=earrings',
    },
    {
      id: 'default-hero-chains',
      title: 'Delicate Crystals & Floral Drops',
      subtitle: 'TIMELESS FLORAL SPARKLE ESSENTIALS',
      description: 'Subtle sparkle with minimalist silver drop earrings and gold-tone pendants for effortless everyday style.',
      imageUrl: '/images/banners/hero-minimal-chains.jpg?v=20261102y',
      mobileImageUrl: '/images/banners/hero-bangles-mobile.jpg?v=20261102y',
      buttonText: 'Shop Crystals',
      linkUrl: '/products?category=earrings',
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

  // Check if title is formatted with bilingual separator (e.g., कलाविएस | KALAVIES)
  const isBilingual = currentBanner.title?.includes('|')
  const [devanagariPart, englishPart] = isBilingual
    ? (currentBanner.title || '').split('|').map((s) => s.trim())
    : [null, currentBanner.title]

  return (
    <section className="relative w-full overflow-hidden bg-[#FAF8F5]">
      {/* 100% Full-Width Edge-to-Edge Container without Side Margins */}
      <div
        className="group relative w-full h-[440px] sm:h-[520px] md:h-[600px] lg:h-[660px] overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Link
          href={resolveLink(currentBanner.linkUrl)}
          className="block relative w-full h-full overflow-hidden focus:outline-none"
        >
          {/* Background Photography seamlessly blended into warm studio background */}
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
                className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-[1.01]"
                loading="eager"
                fetchPriority="high"
              />
            </picture>

            {/* Seamless Soft Scrim for perfect text readability on mobile devices */}
            <div className="absolute inset-0 pointer-events-none sm:hidden bg-gradient-to-t from-[#FAF8F5]/95 via-[#FAF8F5]/45 to-transparent" />
          </div>

          {/* Centered-Left Editorial Content Showcase — Exactly Matching Screenshot */}
          <div className="relative z-10 w-full h-full max-w-5xl mx-auto px-4 sm:px-8 flex flex-col items-center justify-center text-center pb-8 sm:pb-0 pointer-events-none">
            <div className="flex flex-col items-center text-center max-w-xl mx-auto">
              
              {/* Headline */}
              {isBilingual ? (
                <h1
                  className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#1C1917] drop-shadow-xs flex items-center justify-center flex-wrap gap-x-3 sm:gap-x-4 mb-1.5 sm:mb-2.5"
                  style={{ fontFamily: 'Playfair Display, "Noto Serif Devanagari", Georgia, serif' }}
                >
                  <span>{devanagariPart}</span>
                  <span className="text-[#C5A059] font-light text-xl sm:text-3xl md:text-4xl opacity-80 select-none">|</span>
                  <span>{englishPart}</span>
                </h1>
              ) : currentBanner.title ? (
                <h1
                  className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#1C1917] drop-shadow-xs mb-1.5 sm:mb-2.5"
                  style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                >
                  {currentBanner.title}
                </h1>
              ) : null}

              {/* Subtitle */}
              {currentBanner.subtitle && (
                <p className="text-[10px] sm:text-xs md:text-sm font-semibold tracking-[0.24em] sm:tracking-[0.3em] text-[#9E7A38] uppercase mt-1 sm:mt-1.5 drop-shadow-2xs">
                  {currentBanner.subtitle}
                </p>
              )}

              {/* Delicate Diamond Accent Motif */}
              <div className="flex items-center justify-center gap-2 mt-2 sm:mt-3 text-[#C5A059]/80">
                <span className="w-6 sm:w-12 h-px bg-gradient-to-r from-transparent to-[#C5A059]" />
                <span className="text-[9px] sm:text-xs">✦</span>
                <span className="w-6 sm:w-12 h-px bg-gradient-to-l from-transparent to-[#C5A059]" />
              </div>

              {/* Mobile CTA (centered flow on mobile) */}
              <div className="pt-4 sm:hidden pointer-events-auto flex justify-center">
                <span className="inline-flex items-center gap-2.5 rounded-full bg-[#FFF9F3]/95 text-[#8A1A31] px-4 py-2 text-xs font-bold tracking-[0.16em] uppercase shadow-md border border-[#E8D8C4]">
                  <span>{currentBanner.buttonText || 'Shop Collection'}</span>
                  <span className="w-6 h-6 rounded-full bg-[#8A1A31] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <ArrowRight size={12} className="stroke-[2.5]" />
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Floating Pill CTA Button (Bottom Right) — Exactly Matching User's Screenshot */}
          <div className="hidden sm:block absolute right-6 md:right-12 lg:right-16 bottom-8 sm:bottom-10 z-20 pointer-events-auto">
            <span className="inline-flex items-center gap-3 rounded-full bg-[#FFF9F3]/95 hover:bg-white text-[#8A1A31] px-5 sm:px-6 py-2.5 sm:py-3 text-xs md:text-sm font-bold tracking-[0.18em] uppercase shadow-[0_8px_24px_rgba(61,41,24,0.14)] hover:shadow-[0_12px_32px_rgba(61,41,24,0.22)] border border-[#E8D8C4] hover:border-[#8A1A31]/40 transition-all duration-300 hover:scale-105 group/btn">
              <span>{currentBanner.buttonText || 'Shop Collection'}</span>
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#8A1A31] text-white flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover/btn:translate-x-0.5">
                <ArrowRight size={13} className="stroke-[2.5]" />
              </span>
            </span>
          </div>
        </Link>

        {/* Circular Left / Right Arrow Controls */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={goToPrev}
              aria-label="Previous Slide"
              className="absolute left-3 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white/95 text-[#1C1917] shadow-xl flex items-center justify-center border border-stone-200/80 hover:bg-white hover:scale-110 active:scale-95 transition-all z-20 cursor-pointer backdrop-blur-xs"
            >
              <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={goToNext}
              aria-label="Next Slide"
              className="absolute right-3 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white/95 text-[#1C1917] shadow-xl flex items-center justify-center border border-stone-200/80 hover:bg-white hover:scale-110 active:scale-95 transition-all z-20 cursor-pointer backdrop-blur-xs"
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
                      ? 'w-7 bg-[#8A1A31] shadow-xs'
                      : 'w-2 bg-[#8A1A31]/25 hover:bg-[#8A1A31]/50'
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
