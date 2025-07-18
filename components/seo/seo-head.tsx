"use client"

import { useEffect } from 'react'
import { generateJSONLD } from '@/lib/seo'

interface SEOHeadProps {
  structuredData?: any
  breadcrumbs?: Array<{name: string, url: string}>
  canonicalUrl?: string
}

export function SEOHead({ structuredData, breadcrumbs, canonicalUrl }: SEOHeadProps) {
  useEffect(() => {
    // Update canonical URL if provided
    if (canonicalUrl) {
      let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement
      if (!canonical) {
        canonical = document.createElement('link')
        canonical.rel = 'canonical'
        document.head.appendChild(canonical)
      }
      canonical.href = canonicalUrl
    }
  }, [canonicalUrl])

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: generateJSONLD(structuredData)
          }}
        />
      )}
      
      {breadcrumbs && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: generateJSONLD({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: breadcrumbs.map((item, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: item.name,
                item: item.url
              }))
            })
          }}
        />
      )}
    </>
  )
}
