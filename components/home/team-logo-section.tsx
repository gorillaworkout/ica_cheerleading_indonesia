"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { useAppSelector } from "@/lib/redux/hooks"
import { ScrollAnimation } from "@/components/ui/scroll-animation-safe"

const logos = [
  { name: "1752562017120-BALI.jpg", short: "ICU" },
  { name: "1752562017385-BANTEN.jpg", short: "ACU" },
  { name: "1752562017755-DIYOGYAKARTA.jpg", short: "ICA" },
  { name: "1752562018023-JAKARTA.jpg", short: "ICA" },
  { name: "1752562027421-JAWABARAT.jpg", short: "ICA" },
  { name: "1752562027705-JAWATENGAH.jpg", short: "ICA" },
  { name: "1752562028075-JAWATIMUR.jpg", short: "ICA" },
  { name: "1752562028334-KALIMANTANBARAT.jpg", short: "ICA" },
  { name: "1752562034516-KALIMANTANSELATAN.jpg", short: "ICA" },
  { name: "1752562034753-KALIMANTANTIMUR.jpg", short: "ICA" },
  { name: "1752562034960-KEPULAUANRIAU.jpg", short: "ICA" },
  { name: "1752562035163-NTB.jpg", short: "ICA" },
  { name: "1752562041365-PAPUA.jpg", short: "ICA" },
  { name: "1752562041919-RIAU.jpg", short: "ICA" },
  { name: "1752562042173-SUMATERASELATAN.jpg", short: "ICA" },
  { name: "1752562042364-SUMATERAUTARA.jpg", short: "ICA" },
]

export function TeamLogoSlider() {
  const sliderRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const animationRef = useRef<number | null>(null)
  const { images } = useAppSelector((state) => state.publicImages)

  const matchedImages = logos.map((logo) => {
    const match = images.find((img) => img.name === logo.name)
    return match ? { ...logo, url: match.url } : null
  }).filter(Boolean)

  // Auto scroll function
  useEffect(() => {
    const slider = sliderRef.current
    if (!slider) return

    const scrollSpeed = 1 // pixels per frame
    let animationId: number

    const animate = () => {
      if (!isPaused && slider) {
        // Move from left to right continuously
        slider.scrollLeft += scrollSpeed

        // Reset to beginning when reaching the middle (since we have triple images)
        const maxScroll = slider.scrollWidth / 3
        if (slider.scrollLeft >= maxScroll) {
          slider.scrollLeft = 0
        }
      }
      animationId = requestAnimationFrame(animate)
    }

    // Start animation immediately
    animationId = requestAnimationFrame(animate)
    animationRef.current = animationId

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [isPaused, matchedImages.length])

  // Triple the images for smooth infinite scroll
  const tripleImages = [...matchedImages, ...matchedImages, ...matchedImages]

  return (
    <ScrollAnimation delay={0.1} direction="up">
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="relative py-8 bg-[#fdfdfd] border-y overflow-hidden">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Provincial Teams</h3>
          <p className="text-gray-600">Representing provinces across Indonesia</p>
        </div>
        
        <div 
          ref={sliderRef} 
          className="overflow-x-hidden whitespace-nowrap py-4"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => {
            setIsPaused(false)
            setHoveredIndex(null)
          }}
        >
          <div className="inline-flex gap-4">
            {tripleImages.map((logo: any, index: number) => (
              <div 
                key={`${logo?.name}-${index}`} 
                className="inline-block w-[120px] h-[120px] flex-shrink-0 cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {logo?.url && (
                  <div className="w-full h-full flex items-center justify-center p-2">
                    <div className={`transition-all duration-300 ease-out ${
                      hoveredIndex === index 
                        ? 'transform scale-110 shadow-2xl rounded-2xl bg-white p-3' 
                        : 'transform scale-100'
                    }`}>
                      <Image
                        src={logo.url}
                        alt={logo.name}
                        width={80}
                        height={80}
                        className={`object-contain transition-all duration-300 ${
                          hoveredIndex === index 
                            ? 'brightness-110 contrast-110' 
                            : 'opacity-85 hover:opacity-100'
                        }`}
                        quality={75}
                        sizes="80px"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScrollAnimation>
  )
}
