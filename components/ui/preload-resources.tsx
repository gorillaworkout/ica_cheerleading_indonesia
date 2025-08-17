'use client'

import { useEffect } from 'react'

interface PreloadResourcesProps {
  heroImage?: boolean
  font?: boolean
  children?: React.ReactNode
}

export default function PreloadResources({ 
  heroImage = false, 
  font = false,
  children 
}: PreloadResourcesProps) {
  useEffect(() => {
    // Preload hero image jika dibutuhkan
    if (heroImage) {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = '/ica-hero.webp'
      link.type = 'image/webp'
      link.setAttribute('fetchpriority', 'high')
      document.head.appendChild(link)
    }

    // Preload font jika dibutuhkan
    if (font) {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'font'
      link.href = '/righteous-Regular.ttf'
      link.type = 'font/ttf'
      link.crossOrigin = 'anonymous'
      document.head.appendChild(link)
    }
  }, [heroImage, font])

  return <>{children}</>
}
