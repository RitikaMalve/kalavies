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
      subtitle: 'HANDCRAFTED GOLD & SILVER ESSENTIALS',
      description: 'Lightweight daily-wear chains, small charms, and minimal accents crafted for effortless style.',
      imageUrl: '/images/banners/hero-everyday-elegance.jpg?v=20261102v',
      mobileImageUrl: '/images/banners/hero-necklace-mobile.jpg?v=20261102v',
      buttonText: 'Shop Collection',
      linkUrl: '/products',
    },
    {
      id: 'default-hero-earrings',
      title: 'Dainty Studs & Everyday Hoops',
      subtitle: 'LIGHTWEIGHT GOLD-TONE & SILVER-TONE ESSENTIALS',
      description: 'Comfortable, skin-friendly daily wear designed for college, work, and everyday moments.',
      imageUrl: '/images/banners/hero-dainty-hoops.jpg?v=20261102v',
      mobileImageUrl: '/images/banners/hero-earrings-mobile.jpg?v=20261102v',
      buttonText: 'Shop Earrings',
      linkUrl: '/products?category=earrings',
    },
    {
      id: 'default-hero-chains',
      title: 'Delicate Crystals & Layered Chains',
      subtitle: 'MINIMAL & TRENDY FOR CASUAL & SPECIAL OCCASIONS',
      description: 'Subtle sparkle with minimalist silver drop earrings and gold-tone pendants for effortless everyday style.',
      imageUrl: '/images/banners/hero-minimal-chains.jpg?v=20261102v',
      mobileImageUrl: '/images/banners/hero-bangles-mobile.jpg?v=20261102v',
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

  return (
    <section className="relative w-full overflow-hidden bg-[#FAF8F5]">
      {/* 100% Full-Width Edge-to-Edge Container without Side Margins */}
      <div
        className="group relative w-full h-[460px] sm:h-[540px] md:h-[620px] lg:h-[680px] overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Link
          href={resolveLink(currentBanner.linkUrl)}
          className="block relative w-full h-full overflow-hidden focus:outline-none"
        >
          {/* Background Sunlit Canvas with Featured Single Jewellery Card on Right */}
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
            <div className="absolute inset-0 pointer-events-none sm:hidden bg-gradient-to-t from-[#FAF8F5]/95 via-[#FAF8F5]/50 to-transparent" />
          </div>

          {/* Left-Shifted Editorial Content Showcase — Matching User's Screenshot Exactly */}
          <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-6 sm:px-10 md:px-14 lg:px-20 flex flex-col justify-center items-start text-left pb-8 sm:pb-0 pointer-events-none">
            <div className="max-w-md lg:max-w-lg pr-4 text-left">
              
              {/* Category Pill Badge with Sparkles */}
              {currentBanner.subtitle && (
                <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold tracking-[0.22em] uppercase mb-2 sm:mb-3 px-3.5 py-1 rounded-full bg-white/85 text-[#A07828] border border-[#A07828]/25 shadow-xs backdrop-blur-xs">
                  <Sparkles size={13} className="text-[#A07828] shrink-0" />
                  <span>{currentBanner.subtitle}</span>
                </div>
              )}

              {/* Bold Editorial Headline */}
              {currentBanner.title && (
                <h1
                  className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.14] mb-2 sm:mb-4 text-[#1C1917] text-left"
                  style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                >
                  {currentBanner.title}
                </h1>
              )}

              {/* Subtitle / Description */}
              {currentBanner.description && (
                <p className="text-xs sm:text-sm md:text-base font-normal leading-relaxed mb-5 sm:mb-7 line-clamp-2 sm:line-clamp-3 max-w-md text-[#44403C] text-left">
                  {currentBanner.description}
                </p>
              )}

              {/* Shop Now Capsule Button */}
              <div className="pt-1 pointer-events-auto flex justify-start">
                <span className="inline-flex items-center gap-3 rounded-full py-2.5 sm:py-3 px-6 sm:px-8 text-xs sm:text-sm font-bold tracking-wider shadow-xl transition-all group-hover:scale-105 group-hover:shadow-2xl bg-[#1C1917] text-white hover:bg-[#2B2623] border border-black/80">
                  <span>{currentBanner.buttonText || 'Shop Now'}</span>
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#C9A84C] text-white flex items-center justify-center shrink-0 shadow-xs">
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
                      ? 'w-8 bg-[#C9A84C] shadow-md'
                      : 'w-2 bg-stone-300 hover:bg-stone-400'
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
