"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { getPublicImageUrlSync } from "@/utils/getPublicImageUrl"

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
}: HeroImageSectionProps) {
  console.log(heroSlides, 'hero slides')
  const [currentSlide, setCurrentSlide] = useState(0)
  
  const formattedSlides = useMemo(() => {
    return heroSlides.map((slide, index) => {
      if (typeof slide === "string") {
        return { 
          src: slide, 
          alt: "",
          title: "Excellence in Motion",
          subtitle: "Join the premier cheerleading competitions worldwide"
        }
      }
      return {
        ...slide,
        title: slide.title || "Excellence in Motion",
        subtitle: slide.subtitle || "Join the premier cheerleading competitions worldwide"
      }
    });
  }, [heroSlides]);

  console.log('formattedSlides:', formattedSlides, 'currentSlide:', currentSlide);

  useEffect(() => {
    if (formattedSlides.length <= 1) return; // Don't auto-slide if only one or no slides
    
    console.log('Setting up timer for', formattedSlides.length, 'slides');
    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        const next = (prev + 1) % formattedSlides.length;
        console.log('Auto-sliding from', prev, 'to', next);
        return next;
      })
    }, 5000)
    return () => clearInterval(timer)
  }, [formattedSlides.length])

  useEffect(() => {
    if (formattedSlides.length > 0 && formattedSlides[currentSlide]?.src) {
      const imageSrc = formattedSlides[currentSlide].src.startsWith("https://")
        ? formattedSlides[currentSlide].src
        : formattedSlides[currentSlide].src.startsWith("/") 
          ? formattedSlides[currentSlide].src 
          : getPublicImageUrlSync(formattedSlides[currentSlide].src) || "/placeholder.svg";
      
      console.log('Current slide changed to:', currentSlide, 'Image src:', imageSrc);
    }
  }, [currentSlide, formattedSlides])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % formattedSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + formattedSlides.length) % formattedSlides.length)
  }

  return (
    <section className="relative w-full h-full overflow-hidden">
      {formattedSlides.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"}`}
        >
          <Image
            src={
              image.src.startsWith("https://") 
                ? image.src 
                : image.src.startsWith("/") 
                  ? image.src 
                  : getPublicImageUrlSync(image.src) || "/placeholder.svg"
            }
            alt={image.alt || "Image description not available"}
            fill
            className="object-cover w-full h-full"
            priority={index === 0}
          />

          {showTextAndButtons && index === currentSlide && (
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
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? "bg-white" : "bg-white bg-opacity-50"}`}
          />
        ))}
      </div>
    </section>
  )
}
