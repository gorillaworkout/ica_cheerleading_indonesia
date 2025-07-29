"use client"

import Image from "next/image"
import { useState, useCallback } from "react"

interface OptimizedHeroImageProps {
  src: string
  alt: string
  priority?: boolean
  className?: string
  onLoad?: () => void
}

export function OptimizedHeroImage({ 
  src, 
  alt, 
  priority = false, 
  className = "",
  onLoad 
}: OptimizedHeroImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
    onLoad?.()
  }, [onLoad])

  return (
    <>
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-cover w-full h-full transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        priority={priority}
        sizes="100vw"
        quality={priority ? 95 : 80}
        placeholder="blur"
        blurDataURL="data:image/webp;base64,UklGRqIAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA"
        style={{
          objectFit: 'cover',
          objectPosition: 'center',
        }}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'low'}
        onLoad={handleLoad}
        decoding={priority ? 'sync' : 'async'}
        unoptimized={false}
      />
      
      {/* Skeleton loader untuk better perceived performance */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
      )}
    </>
  )
}
