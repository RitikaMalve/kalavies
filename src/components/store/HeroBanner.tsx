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
      id: 'default-hero-gold',
      title: 'The Gold & Champagne Collection',
      subtitle: 'TIMELESS FILIGREE & MODERN BRILLIANCE',
      description: 'Featuring handcrafted filigree gold kadas, delicate gemstone stacking rings, luminous earrings, and 14k thin bracelets.',
      imageUrl: '/images/banners/hero-gold-jewellery.jpg?v=20261101b',
      buttonText: 'Shop Now',
      linkUrl: '/products',
    },
    {
      id: 'default-hero-1',
      title: 'Royal Heritage Collection',
      subtitle: 'AUTHENTIC 925 OXIDISED SILVER ARTISTRY',
      description: 'Handcrafted silver choker, earrings and tribal temple pieces with regal antique polish.',
      imageUrl: '/images/banners/hero-jewellery-1.jpg?v=20261101',
      buttonText: 'Explore Collection',
      linkUrl: '/products?category=oxidised-jewellery',
    },
    {
      id: 'default-hero-2',
      title: 'Temple & Tribal Artistry',
      subtitle: 'TIMELESS INDIAN MASTERPIECES',
      description: 'Intricately engraved peacock motifs, coin necklaces and statement kadas.',
      imageUrl: '/images/banners/hero-jewellery-2.jpg?v=20261101',
      buttonText: 'Shop New Arrivals',
      linkUrl: '/products?filter=new',
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
      {/* 100% Full-Width Edge-to-Edge Container without Side Margins */}
      <div
        className="group relative w-full h-[460px] sm:h-[540px] md:h-[620px] lg:h-[680px] xl:h-[720px] overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Link
          href={resolveLink(currentBanner.linkUrl)}
          className="block relative w-full h-full overflow-hidden focus:outline-none"
        >
          {/* Background Jewellery Product Photography stretching 100% */}
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
                className="w-full h-full object-cover object-right md:object-center transition-transform duration-1000 ease-out group-hover:scale-[1.01]"
                loading="eager"
                fetchPriority="high"
              />
            </picture>

            {/* Seamless Left Vignette to ensure crystal-clear text readability on all screens */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent sm:from-black/85 sm:via-black/40 sm:to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 sm:hidden pointer-events-none" />
          </div>

          {/* Editorial Content Showcase Constrained to Site Grid */}
          <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 flex flex-col justify-end sm:justify-center pb-12 sm:pb-0 pointer-events-none">
            <div className="max-w-xl">
              {currentBanner.subtitle && (
                <div className="inline-flex items-center gap-1.5 text-[#C9A84C] text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase mb-2 sm:mb-3 drop-shadow">
                  <Sparkles size={13} className="text-[#C9A84C] shrink-0" />
                  <span>{currentBanner.subtitle}</span>
                </div>
              )}

              {currentBanner.title && (
                <h1
                  className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight mb-2 sm:mb-4 drop-shadow-lg"
                  style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                >
                  {currentBanner.title}
                </h1>
              )}

              {currentBanner.description && (
                <p className="text-xs sm:text-sm md:text-base text-stone-200 font-light leading-relaxed mb-5 sm:mb-7 line-clamp-2 sm:line-clamp-3 max-w-md drop-shadow">
                  {currentBanner.description}
                </p>
              )}

              {/* Shop Now Capsule Button */}
              <div className="pt-1 pointer-events-auto">
                <span className="inline-flex items-center gap-3 rounded-full bg-white text-[#1A1A1A] hover:bg-[#FAF8F5] border border-white/70 py-2.5 sm:py-3 px-5 sm:px-7 text-xs sm:text-sm font-bold tracking-wider shadow-2xl backdrop-blur-md transition-all group-hover:scale-105 group-hover:shadow-2xl">
                  <span>{currentBanner.buttonText || 'Shop Now'}</span>
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#C9A84C] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <ArrowRight size={13} />
                  </span>
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* Circular Left / Right Arrow Controls Matching User's Inspiration */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={goToPrev}
              aria-label="Previous Slide"
              className="absolute left-3 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white text-[#111] shadow-2xl flex items-center justify-center border border-white/80 hover:bg-[#FAF8F5] hover:scale-110 active:scale-95 transition-all z-20 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={goToNext}
              aria-label="Next Slide"
              className="absolute right-3 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white text-[#111] shadow-2xl flex items-center justify-center border border-white/80 hover:bg-[#FAF8F5] hover:scale-110 active:scale-95 transition-all z-20 cursor-pointer"
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
                      ? 'w-8 bg-[#C9A84C] shadow-lg'
                      : 'w-2 bg-white/60 hover:bg-white'
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
