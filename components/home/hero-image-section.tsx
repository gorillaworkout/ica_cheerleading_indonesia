"use client"

import { useState, useEffect, useMemo } from "react"
import { getPublicImageUrlSync } from "@/utils/getPublicImageUrl"
import { OptimizedHeroImage } from "./optimized-hero-image"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Slide {
  src: string
  alt: string
  title?: string
  subtitle?: string
}

interface HeroImageSectionProps {
  heroSlides?: Slide[]
  showTextAndButtons?: boolean
  onImageLoad?: () => void
}

// Inline HeroOverlayContent untuk avoid import issues
const HeroOverlayContent: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <>
    <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
    <div className="absolute inset-0 flex items-center justify-center p-4">
      <div className="text-center text-white max-w-4xl w-full">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
          {title}
        </h1>
        <p className="text-lg sm:text-xl lg:text-2xl mb-8 leading-relaxed opacity-90">
          {subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
          <Link href="/championships" className="w-full sm:w-auto">
            <Button 
              size="lg" 
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 transition-all duration-300 transform hover:scale-105"
            >
              View Championships
            </Button>
          </Link>
          <Link href="/about" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-gray-900 bg-transparent transition-all duration-300"
            >
              Learn More
            </Button>
          </Link>
        </div>
      </div>
    </div>
  </>
)

interface Slide {
  src: string
  alt: string
  title?: string
  subtitle?: string
}

interface HeroImageSectionProps {
  heroSlides?: Slide[]
  showTextAndButtons?: boolean
}

export function HeroImageSection({
  heroSlides = [],
  showTextAndButtons = true,
  onImageLoad,
}: HeroImageSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  
  // Optimize slide formatting dengan memoization yang lebih baik
  const formattedSlides = useMemo(() => {
    if (heroSlides.length === 0) return []
    
    return heroSlides.map((slide) => {
      if (typeof slide === "string") {
        return { 
          src: slide, 
          alt: "ICA Indonesia Cheerleading Competition Hero Image",
          title: "Excellence in Motion",
          subtitle: "Join the premier cheerleading competitions worldwide"
        }
      }
      return {
        ...slide,
        alt: slide.alt || "ICA Indonesia Cheerleading Competition Image",
        title: slide.title || "Excellence in Motion",
        subtitle: slide.subtitle || "Join the premier cheerleading competitions worldwide"
      }
    });
  }, [heroSlides])

  // Optimize auto-slide timer
  useEffect(() => {
    if (formattedSlides.length <= 1) return
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % formattedSlides.length)
    }, 5000)
    
    return () => clearInterval(timer)
  }, [formattedSlides.length])

  // Preload next image untuk smooth transition
  useEffect(() => {
    if (formattedSlides.length > 1) {
      const nextSlideIndex = (currentSlide + 1) % formattedSlides.length
      const nextImage = new window.Image()
      const nextSrc = formattedSlides[nextSlideIndex]?.src
      
      if (nextSrc) {
        nextImage.src = nextSrc.startsWith("https://") || nextSrc.startsWith("/") 
          ? nextSrc 
          : getPublicImageUrlSync(nextSrc) || "/placeholder.svg"
      }
    }
  }, [currentSlide, formattedSlides])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % formattedSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + formattedSlides.length) % formattedSlides.length)
  }

  return (
    <section className="relative w-full h-full overflow-hidden bg-gray-100">
      {formattedSlides.map((image, index) => {
        const isCurrentSlide = index === currentSlide
        const isFirstSlide = index === 0
        
        // Generate optimized image src
        const imageSrc = image.src.startsWith("https://") || image.src.startsWith("/") 
          ? image.src 
          : getPublicImageUrlSync(image.src) || "/placeholder.svg"

        return (
          <div
            key={`slide-${index}-${image.src}`}
            className={`absolute inset-0 transition-opacity duration-700 ${
              isCurrentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
            style={{ 
              willChange: isCurrentSlide ? 'auto' : 'opacity',
              transform: 'translateZ(0)' // Hardware acceleration
            }}
          >
            <OptimizedHeroImage
              src={imageSrc}
              alt={image.alt || "ICA Indonesia Cheerleading Competition"}
              priority={isFirstSlide}
              className="transition-transform duration-700 ease-in-out hover:scale-105"
              onLoad={isFirstSlide && onImageLoad ? onImageLoad : undefined}
            />

            {showTextAndButtons && isCurrentSlide && (
              <>
                <div className="absolute inset-0 bg-black bg-opacity-40" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white max-w-4xl px-4">
                    <h1 className="text-5xl md:text-6xl font-bold mb-4">
                      {image.title || "Excellence in Motion"}
                    </h1>
                    <p className="text-xl md:text-2xl mb-8">
                      {image.subtitle || "Join the premier cheerleading competitions worldwide"}
                    </p>
                    <div className="space-x-4">
                      <Link href="/championships">
                        <Button size="lg" className="bg-red-600 hover:bg-red-700">
                          View Championships
                        </Button>
                      </Link>
                      <Link href="/about">
                        <Button
                          size="lg"
                          variant="outline"
                          className="text-white border-white hover:bg-white hover:text-gray-900 bg-transparent"
                        >
                          Learn More
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )
      })}

      {/* Slide Indicators - Simplified untuk performance */}
      {formattedSlides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {formattedSlides.map((_, index) => (
            <button
              key={`indicator-${index}`}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? "bg-white" : "bg-white bg-opacity-50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
