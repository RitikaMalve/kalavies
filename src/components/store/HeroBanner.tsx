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

  const bannerList = banners.length > 0 ? banners : [
    {
      id: 'default-hero',
      title: 'Royal Indian Traditional & Oxidised Jewellery',
      imageUrl: '/images/banners/banner-1.jpg',
      buttonText: 'Explore Collection',
      linkUrl: '/products',
    },
  ]

  const total = bannerList.length

  // Auto-advance if multiple banners exist
  useEffect(() => {
    if (total <= 1) return

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total)
    }, 5500)

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
    if (diff > 50) {
      // Swiped left
      setCurrentIndex((prev) => (prev + 1) % total)
    } else if (diff < -50) {
      // Swiped right
      setCurrentIndex((prev) => (prev - 1 + total) % total)
    }
    setTouchStart(null)
  }

  const currentBanner = bannerList[currentIndex]

  return (
    <section className="relative w-full bg-[#FAF8F5] sm:py-3 md:py-4">
      <div className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-6">
        <div
          className="group relative overflow-hidden sm:rounded-2xl sm:border sm:border-[#E8E3DC] bg-white sm:shadow-md transition-all"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <Link
            href={resolveLink(currentBanner.linkUrl)}
            className="block relative w-full overflow-hidden focus:outline-none"
          >
            {/* Banner Media with Picture Element for Mobile vs Desktop */}
            <div className="relative w-full bg-[#FAF8F5]">
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
                  className="w-full h-auto block object-contain object-center transition-transform duration-700 group-hover:scale-[1.01]"
                  loading="eager"
                  fetchPriority="high"
                />
              </picture>
            </div>

            {/* Floating Pill Capsule Button (Bottom-Right, Inspiration Style) */}
            <div className="absolute bottom-2.5 right-2.5 sm:bottom-6 sm:right-6 md:bottom-8 md:right-10 z-10 pointer-events-none">
              <div className="inline-flex items-center gap-1.5 sm:gap-2.5 rounded-full bg-white/95 hover:bg-white border border-[#C9A84C]/50 py-1.5 px-3 sm:py-2.5 sm:pl-5 sm:pr-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#1A1A1A] shadow-md sm:shadow-xl backdrop-blur-md transition-all group-hover:shadow-2xl group-hover:border-[#C9A84C] group-hover:scale-105 pointer-events-auto">
                <span className="whitespace-nowrap">
                  {currentBanner.buttonText || 'Explore Collection'}
                </span>
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#C9A84C] text-white flex items-center justify-center shrink-0 group-hover:bg-[#B8963B] transition-colors shadow-sm">
                  <ArrowRight size={11} className="sm:w-3 sm:h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </Link>

          {/* Previous / Next Navigation Arrows for Desktop (Only if multiple banners) */}
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={goToPrev}
                aria-label="Previous Banner"
                className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#1A1A1A] shadow-md items-center justify-center border border-[#E8E3DC] opacity-0 group-hover:opacity-100 transition-all z-20 hover:scale-110"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={goToNext}
                aria-label="Next Banner"
                className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#1A1A1A] shadow-md items-center justify-center border border-[#E8E3DC] opacity-0 group-hover:opacity-100 transition-all z-20 hover:scale-110"
              >
                <ChevronRight size={18} />
              </button>

              {/* Dot Indicators at Bottom-Center */}
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
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
                        ? 'w-6 bg-[#C9A84C] shadow-sm'
                        : 'w-1.5 bg-white/70 hover:bg-white'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
