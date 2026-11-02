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
      id: 'default-hero-necklace',
      title: 'कलाविएस | KALAVIES',
      subtitle: 'OUR SIGNATURE GOLD NECKLACES',
      description: 'Handcrafted 18K Gold Plated Chain with Puffy Heart Pendant',
      imageUrl: '/images/banners/hero-necklace.jpg?v=20261102u',
      mobileImageUrl: '/images/banners/hero-necklace-mobile.jpg?v=20261102u',
      buttonText: 'Explore Necklaces',
      linkUrl: '/products?category=necklaces',
    },
    {
      id: 'default-hero-earrings',
      title: 'झुमके और बालियां | EARRINGS',
      subtitle: 'OXIDISED PEACOCK & TURQUOISE COLLECTION',
      description: 'Traditional Handcrafted Silver Artistry for Every Occasion',
      imageUrl: '/images/banners/hero-earrings.jpg?v=20261102u',
      mobileImageUrl: '/images/banners/hero-earrings-mobile.jpg?v=20261102u',
      buttonText: 'Explore Earrings',
      linkUrl: '/products?category=earrings',
    },
    {
      id: 'default-hero-crystals',
      title: 'क्रिस्टल ड्रॉप्स | CRYSTAL DROPS',
      subtitle: 'TIMELESS FLORAL SPARKLE ESSENTIALS',
      description: 'Faceted Oval Crystal & Sparkling Floral Drop Earrings',
      imageUrl: '/images/banners/hero-bangles.jpg?v=20261102u',
      mobileImageUrl: '/images/banners/hero-bangles-mobile.jpg?v=20261102u',
      buttonText: 'Explore Crystals',
      linkUrl: '/products?category=earrings',
    },
  ]

  const total = bannerList.length

  // Auto-advance slider
  useEffect(() => {
    if (total <= 1) return

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total)
    }, 7000)

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
    <section className="relative w-full overflow-hidden bg-[#FAF6F0] border-b border-[#E8DCCB]/60">
      {/* Edge-to-Edge Responsive Container */}
      <div
        className="group relative w-full h-[400px] sm:h-[480px] md:h-[560px] lg:h-[620px] overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Link
          href={resolveLink(currentBanner.linkUrl)}
          className="block relative w-full h-full overflow-hidden focus:outline-none"
        >
          {/* Background Silk Texture with Framed Real Jewellery Photography & Floral Art */}
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
                alt={currentBanner.title || 'KALAVIES Royal Jewellery Collection'}
                className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-[1.015]"
                loading="eager"
                fetchPriority="high"
              />
            </picture>

            {/* Subtle luminous center vignette to ensure typography readability without washing out side jewellery */}
            <div className="absolute inset-0 pointer-events-none bg-radial from-[#FAF6F0]/40 via-[#FAF6F0]/10 to-transparent" />
          </div>

          {/* Centered Editorial Brand Showcase — Matching Mohar Luxury Banner Layout */}
          <div className="relative z-10 w-full h-full max-w-4xl mx-auto px-4 sm:px-8 flex flex-col items-center justify-center text-center pb-12 sm:pb-8 pointer-events-none">
            <div className="flex flex-col items-center text-center max-w-xl mx-auto">
              
              {/* Royal Bilingual Brand Title: कलाविएस | KALAVIES */}
              {isBilingual ? (
                <h1
                  className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#8A1A31] drop-shadow-xs flex items-center justify-center flex-wrap gap-x-3 sm:gap-x-4 mb-1 sm:mb-2.5"
                  style={{ fontFamily: 'Playfair Display, "Noto Serif Devanagari", Georgia, serif' }}
                >
                  <span className="tracking-wide">{devanagariPart}</span>
                  <span className="text-[#C5A059] font-light text-2xl sm:text-4xl md:text-5xl opacity-80 select-none">|</span>
                  <span className="tracking-wider">{englishPart}</span>
                </h1>
              ) : currentBanner.title ? (
                <h1
                  className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#8A1A31] drop-shadow-xs mb-1 sm:mb-2.5"
                  style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                >
                  {currentBanner.title}
                </h1>
              ) : null}

              {/* Elegant Gold Subtitle (e.g., OUR SIGNATURE JEWELLERY COLLECTION) */}
              {currentBanner.subtitle && (
                <p className="text-[10px] sm:text-xs md:text-sm font-semibold tracking-[0.24em] sm:tracking-[0.32em] text-[#9E7A38] uppercase mt-1 sm:mt-2 drop-shadow-2xs">
                  {currentBanner.subtitle}
                </p>
              )}

              {/* Delicate Floral / Diamond Accent Motif */}
              <div className="flex items-center justify-center gap-2 mt-2.5 sm:mt-3 text-[#C5A059]/80">
                <span className="w-6 sm:w-12 h-px bg-gradient-to-r from-transparent to-[#C5A059]" />
                <span className="text-[9px] sm:text-xs">✤</span>
                <span className="w-6 sm:w-12 h-px bg-gradient-to-l from-transparent to-[#C5A059]" />
              </div>

              {/* Mobile CTA (shown on small screens in center flow) */}
              <div className="pt-4 sm:hidden pointer-events-auto flex justify-center">
                <span className="inline-flex items-center gap-2.5 rounded-full bg-[#FFF9F3]/95 text-[#8A1A31] px-4 py-2 text-xs font-bold tracking-[0.16em] uppercase shadow-md border border-[#E8D8C4]">
                  <span>{currentBanner.buttonText || 'Explore Collection'}</span>
                  <span className="w-6 h-6 rounded-full bg-[#8A1A31] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <ArrowRight size={12} className="stroke-[2.5]" />
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Floating Pill CTA Button (Bottom Right) — Exactly Matching Mohar Banner Inspiration */}
          <div className="hidden sm:block absolute right-6 md:right-12 lg:right-16 bottom-8 sm:bottom-10 z-20 pointer-events-auto">
            <span className="inline-flex items-center gap-3 rounded-full bg-[#FFF9F3]/95 hover:bg-white text-[#8A1A31] px-5 sm:px-6 py-2.5 sm:py-3 text-xs md:text-sm font-bold tracking-[0.18em] uppercase shadow-[0_8px_24px_rgba(61,41,24,0.14)] hover:shadow-[0_12px_32px_rgba(61,41,24,0.22)] border border-[#E8D8C4] hover:border-[#8A1A31]/40 transition-all duration-300 hover:scale-105 group/btn">
              <span>{currentBanner.buttonText || 'Explore Kalavies'}</span>
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
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/90 text-[#8A1A31] shadow-lg flex items-center justify-center border border-[#E8D8C4] hover:bg-white hover:scale-110 active:scale-95 transition-all z-20 cursor-pointer backdrop-blur-xs"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={goToNext}
              aria-label="Next Slide"
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/90 text-[#8A1A31] shadow-lg flex items-center justify-center border border-[#E8D8C4] hover:bg-white hover:scale-110 active:scale-95 transition-all z-20 cursor-pointer backdrop-blur-xs"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </button>

            {/* Slide Dots Indicator */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
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
