"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { defaultHeroSlides } from "@/utils/dummyhero"
import { motion, useScroll, useTransform } from "framer-motion"
import { getPublicImageUrl } from "@/utils/getPublicImageUrl"

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
  heroSlides = defaultHeroSlides,
  showTextAndButtons = true,
}: HeroImageSectionProps) {
  console.log(heroSlides, 'hero slides')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [heroSlides.length])

  useEffect(() => {
    if (heroSlides.length > 0 && heroSlides[currentSlide]?.src) {
      const preload = new window.Image()
      preload.src = heroSlides[currentSlide].src
      preload.onload = () => setLoading(false)
      preload.onerror = () => setLoading(false) // Ensure loading stops even if the image fails to load
    } else {
      setLoading(false) // Stop loading if no valid slides are available
    }
  }, [currentSlide, heroSlides])

  const nextSlide = () => {
    setLoading(true)
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  }

  const prevSlide = () => {
    setLoading(true)
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }

  const formattedSlides = heroSlides.map((slide) =>
  typeof slide === "string" ? { src: slide, alt: "" } : slide
);

  return (
    <section className="relative w-full h-full overflow-hidden">
      {formattedSlides.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"}`}
        >
          {loading ? (
            <div className="w-full h-full bg-gray-300 animate-pulse" />
          ) : (
            <Image
              src={image.src ? (image.src.startsWith("/") ? image.src : getPublicImageUrl(image.src)) : "/placeholder.svg"}
              alt={image.alt || "Image description not available"}
              fill
              className="object-cover w-full h-full"
              priority={index === 0}
            />
          )}

          {showTextAndButtons && !loading && (
            <>
              <div className="absolute inset-0 bg-black bg-opacity-40" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white max-w-4xl px-4">
                  <h1 className="text-5xl md:text-6xl font-bold mb-4">{image.title}</h1>
                  <p className="text-xl md:text-2xl mb-8">{image.subtitle}</p>
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
      ))}

      {/* Navigation Arrows */}
      {/* <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all z-20"
      >
        <ChevronLeft className="h-6 w-6 text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all z-20"
      >
        <ChevronRight className="h-6 w-6 text-white" />
      </button> */}

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {formattedSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setLoading(true);
              setCurrentSlide(index);
            }}
            className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? "bg-white" : "bg-white bg-opacity-50"}`}
          />
        ))}
      </div>
    </section>
  )
}
