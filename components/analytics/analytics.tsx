"use client"

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

interface AnalyticsProps {
  googleAnalyticsId?: string
}

export function Analytics({ googleAnalyticsId }: AnalyticsProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!googleAnalyticsId) return

    const url = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    
    // Track page views
    if (window.gtag) {
      window.gtag('config', googleAnalyticsId, {
        page_location: url,
        page_title: document.title,
      })
    }
  }, [pathname, searchParams, googleAnalyticsId])

  if (!googleAnalyticsId) return null

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${googleAnalyticsId}', {
              page_location: window.location.href,
              page_title: document.title,
              page_referrer: document.referrer,
            });
          `,
        }}
      />
    </>
  )
}

// Hook for tracking custom events
export function useAnalytics() {
  const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (window.gtag) {
      window.gtag('event', eventName, parameters)
    }
  }

  const trackPageView = (url: string, title?: string) => {
    if (window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        page_location: url,
        page_title: title,
      })
    }
  }

  return { trackEvent, trackPageView }
}
