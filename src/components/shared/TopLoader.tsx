'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export default function TopLoader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // When URL or query changes, complete the loader
    if (loading) {
      setProgress(100)
      const timer = setTimeout(() => {
        setLoading(false)
        setProgress(0)
      }, 250)
      return () => clearTimeout(timer)
    }
  }, [pathname, searchParams])

  useEffect(() => {
    // Global click listener for internal navigation links
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (!target) return

      const anchor = target.closest('a')
      if (anchor && anchor.href) {
        try {
          const url = new URL(anchor.href, window.location.origin)
          const isInternal = url.origin === window.location.origin
          const isSamePage =
            url.pathname === window.location.pathname &&
            url.search === window.location.search
          const isTargetBlank = anchor.target === '_blank'

          if (isInternal && !isSamePage && !isTargetBlank) {
            setLoading(true)
            setProgress(30)
            const p1 = setTimeout(() => setProgress(65), 120)
            const p2 = setTimeout(() => setProgress(85), 350)
            return () => {
              clearTimeout(p1)
              clearTimeout(p2)
            }
          }
        } catch {}
      }
    }

    document.addEventListener('click', handleClick, { capture: true })
    return () => document.removeEventListener('click', handleClick, { capture: true })
  }, [])

  if (!loading && progress === 0) return null

  return (
    <>
      {/* Top Gold Progress Line */}
      <div
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none h-1 bg-transparent"
      >
        <div
          className="h-full bg-gradient-to-r from-[#C9A84C] via-[#E2C76A] to-[#FAF8F5] transition-all duration-300 ease-out shadow-[0_0_12px_#C9A84C]"
          style={{
            width: `${progress}%`,
            opacity: progress === 100 ? 0 : 1,
            transition:
              progress === 100
                ? 'width 0.2s ease-out, opacity 0.3s ease-out 0.1s'
                : 'width 0.3s ease-out',
          }}
        />
      </div>

      {/* Screen Loader Overlay */}
      {loading && progress > 20 && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-[99990] pointer-events-none flex items-center justify-center bg-white/40 backdrop-blur-[2px] transition-opacity duration-200 animate-in fade-in"
        >
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E8E3DC] bg-white/95 px-7 py-5 shadow-2xl backdrop-blur-md space-y-3">
            <div className="relative flex h-12 w-12 items-center justify-center">
              <div className="absolute inset-0 rounded-full border-[3px] border-[#C9A84C]/20 border-t-[#C9A84C] animate-spin" />
              <span
                className="text-xs font-black text-[#C9A84C] tracking-widest"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                KLV
              </span>
            </div>
            <div className="text-center">
              <p
                className="text-xs font-bold text-[#1A1A1A] tracking-wider uppercase"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                KALAVIES
              </p>
              <p className="text-[11px] text-[#6B6B6B] mt-0.5">
                Loading Jewellery...
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
