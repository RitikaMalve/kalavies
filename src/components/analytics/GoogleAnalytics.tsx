'use client'

import { Suspense, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Script from 'next/script'

declare global {
  interface Window {
    dataLayer: any[]
    gtag?: (...args: any[]) => void
  }
}

function AnalyticsRouteTracker({ measurementId }: { measurementId: string }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!measurementId || typeof window === 'undefined' || typeof window.gtag !== 'function') {
      return
    }

    const query = searchParams?.toString()
    const url = pathname + (query ? `?${query}` : '')

    window.gtag('config', measurementId, {
      page_path: url,
    })
  }, [pathname, searchParams, measurementId])

  return null
}

export default function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  // If no measurement ID is configured, do not inject gtag scripts
  if (!measurementId || measurementId.trim() === '' || measurementId === 'G-XXXXXXXXXX') {
    return null
  }

  return (
    <>
      {/* Google Analytics gtag.js loader */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      {/* Google Analytics Initialization */}
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              page_path: window.location.pathname,
              send_page_view: true
            });
          `,
        }}
      />
      {/* Dynamic route tracker for App Router client navigation */}
      <Suspense fallback={null}>
        <AnalyticsRouteTracker measurementId={measurementId} />
      </Suspense>
    </>
  )
}
