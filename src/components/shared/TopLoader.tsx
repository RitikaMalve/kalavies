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
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [pathname, searchParams])

  useEffect(() => {
    // Global click listener for all internal navigation links and action triggers
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (!target) return

      // Check if clicking an internal link
      const anchor = target.closest('a')
      if (anchor && anchor.href) {
        const url = new URL(anchor.href, window.location.origin)
        const isInternal = url.origin === window.location.origin
        const isSamePage = url.pathname === window.location.pathname && url.search === window.location.search && url.hash
        const isTargetBlank = anchor.target === '_blank'

        if (isInternal && !isSamePage && !isTargetBlank) {
          setLoading(true)
          setProgress(25)
          const p1 = setTimeout(() => setProgress(65), 150)
          const p2 = setTimeout(() => setProgress(85), 450)
          return () => {
            clearTimeout(p1)
            clearTimeout(p2)
          }
        }
      }
    }

    document.addEventListener('click', handleClick, { capture: true })
    return () => document.removeEventListener('click', handleClick, { capture: true })
  }, [])

  if (!loading && progress === 0) return null

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none h-[3px] bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-[#B8963B] via-[#C9A84C] to-[#E0CB82] shadow-[0_0_10px_#C9A84C,0_0_5px_#C9A84C] transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  )
}
