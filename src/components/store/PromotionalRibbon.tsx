'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Copy, Check, Gift, Truck, Zap, ChevronRight } from 'lucide-react'

interface CouponItem {
  id?: string
  code: string
  description?: string | null
  type?: string
  value?: number
  minOrderValue?: number | null
}

interface PromotionalRibbonProps {
  coupons?: CouponItem[]
}

export default function PromotionalRibbon({ coupons = [] }: PromotionalRibbonProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [activeMobileIndex, setActiveMobileIndex] = useState(0)

  // Default curated offers ensuring WELCOME10 and FESTIVE20 make perfect logical sense
  const defaultOffers = [
    {
      id: 'welcome10',
      badge: 'FIRST ORDER',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      title: 'Flat 10% OFF',
      subtitle: 'On your very first jewellery order',
      code: 'WELCOME10',
      tagline: 'No min. order value',
      icon: Gift,
    },
    {
      id: 'festive20',
      badge: 'FESTIVE SPECIAL',
      badgeColor: 'bg-amber-50 text-amber-900 border-amber-200',
      title: 'Flat 20% OFF',
      subtitle: 'Celebrate in style with grand festive savings',
      code: 'FESTIVE20',
      tagline: 'On orders above ₹999',
      icon: Sparkles,
    },
    {
      id: 'freeship',
      badge: 'ZERO SHIPPING',
      badgeColor: 'bg-stone-100 text-stone-800 border-stone-200',
      title: 'Free Express Shipping',
      subtitle: 'Direct, insured door delivery across India',
      code: 'AUTO-APPLY',
      tagline: 'On orders above ₹699',
      icon: Truck,
    },
  ]

  const handleCopy = (code: string) => {
    if (code === 'AUTO-APPLY') return
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2500)
    }
  }

  // Auto-rotate on mobile screens
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveMobileIndex((prev) => (prev + 1) % defaultOffers.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [defaultOffers.length])

  return (
    <section className="bg-[#FAF8F5] border-y border-[#E8E3DC] py-4 relative overflow-hidden">
      {/* Background subtle luxury shimmer */}
      <div className="absolute inset-0 bg-[radial-gradient(#C9A84C_0.6px,transparent_0.6px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Desktop View: 3 Elegant Interactive Perk Cards */}
        <div className="hidden md:grid md:grid-cols-3 gap-4">
          {defaultOffers.map((offer) => {
            const Icon = offer.icon
            const isCopied = copiedCode === offer.code

            return (
              <div
                key={offer.id}
                className="group relative rounded-xl border border-[#E8E3DC] bg-white p-4 shadow-xs hover:shadow-md hover:border-[#C9A84C]/60 transition-all duration-300 flex items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-50 text-[#C9A84C] flex items-center justify-center shrink-0 border border-amber-100 group-hover:scale-105 transition-transform">
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${offer.badgeColor}`}>
                        {offer.badge}
                      </span>
                      <span className="text-[11px] text-[#6B6B6B] font-medium">
                        {offer.tagline}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[#1A1A1A] leading-tight">
                      {offer.title}
                    </h4>
                    <p className="text-[11px] text-[#6B6B6B] mt-0.5 line-clamp-1">
                      {offer.subtitle}
                    </p>
                  </div>
                </div>

                {/* Interactive Coupon Code Button */}
                {offer.code === 'AUTO-APPLY' ? (
                  <span className="shrink-0 rounded-lg bg-[#FAF8F5] border border-[#E8E3DC] px-2.5 py-1.5 text-[11px] font-bold text-[#2D2D2D] uppercase tracking-wide">
                    Applied
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleCopy(offer.code)}
                    title={`Click to copy code ${offer.code}`}
                    className={`shrink-0 flex items-center gap-1.5 rounded-lg border border-dashed px-3 py-1.5 text-xs font-mono font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
                      isCopied
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-400 shadow-xs'
                        : 'bg-amber-50/60 text-[#1A1A1A] border-[#C9A84C] hover:bg-[#C9A84C] hover:text-white'
                    }`}
                  >
                    <span>{offer.code}</span>
                    {isCopied ? (
                      <Check size={13} className="text-emerald-700" />
                    ) : (
                      <Copy size={13} className="opacity-70 group-hover:opacity-100" />
                    )}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Mobile View: Dynamic Carousel with 1-Tap Copy */}
        <div className="md:hidden">
          {(() => {
            const currentOffer = defaultOffers[activeMobileIndex]
            const Icon = currentOffer.icon
            const isCopied = copiedCode === currentOffer.code

            return (
              <div className="rounded-xl border border-[#E8E3DC] bg-white p-3.5 shadow-xs flex items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-9 w-9 rounded-lg bg-amber-50 text-[#C9A84C] flex items-center justify-center shrink-0 border border-amber-100">
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${currentOffer.badgeColor}`}>
                        {currentOffer.badge}
                      </span>
                      <span className="text-[10px] text-[#6B6B6B] truncate">
                        {currentOffer.tagline}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-[#1A1A1A] truncate mt-0.5">
                      {currentOffer.title}
                    </h4>
                  </div>
                </div>

                {/* Mobile Copy Code Pill */}
                {currentOffer.code === 'AUTO-APPLY' ? (
                  <span className="shrink-0 rounded-md bg-[#FAF8F5] border border-[#E8E3DC] px-2 py-1 text-[10px] font-bold text-[#2D2D2D] uppercase">
                    In Bag
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleCopy(currentOffer.code)}
                    className={`shrink-0 flex items-center gap-1 rounded-md border border-dashed px-2.5 py-1 text-[11px] font-mono font-bold transition-all cursor-pointer ${
                      isCopied
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-400'
                        : 'bg-amber-50 text-[#1A1A1A] border-[#C9A84C]'
                    }`}
                  >
                    <span>{currentOffer.code}</span>
                    {isCopied ? <Check size={12} /> : <Copy size={12} className="opacity-70" />}
                  </button>
                )}
              </div>
            )
          })()}

          {/* Mobile Dot Indicators */}
          <div className="flex justify-center items-center gap-1.5 mt-2">
            {defaultOffers.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveMobileIndex(idx)}
                aria-label={`Show offer ${idx + 1}`}
                className={`h-1 rounded-full transition-all duration-300 ${
                  activeMobileIndex === idx ? 'w-4 bg-[#C9A84C]' : 'w-1 bg-[#E8E3DC]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
