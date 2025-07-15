"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { useAppSelector } from "@/lib/redux/hooks"

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
  const { images } = useAppSelector((state) => state.publicImages)

  const matchedImages = logos.map((logo) => {
    const match = images.find((img) => img.name === logo.name)
    return match ? { ...logo, url: match.url } : null
  }).filter(Boolean)

  useEffect(() => {
    const slider = sliderRef.current
    if (!slider) return

    let start = performance.now()

    const step = (timestamp: number) => {
      const elapsed = timestamp - start
      start = timestamp

      if (slider) {
        slider.scrollLeft -= 0.5 * (elapsed / 16)

        if (slider.scrollLeft <= 0) {
          slider.scrollLeft = slider.scrollWidth / 2
        }
      }

      requestAnimationFrame(step)
    }

    const frameId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frameId)
  }, [])

  const duplicatedImages = [...matchedImages, ...matchedImages]

  return (
    <div className="relative py-8 bg-white border-y overflow-hidden">
      <div ref={sliderRef} className="overflow-x-hidden whitespace-nowrap">
        <div className="flex gap-8 w-max">
          {duplicatedImages.map((logo, index) => (
            <div key={index} className="min-w-[150px] flex justify-center items-center">
              {logo?.url && (
                <Image
                  src={logo.url}
                  alt={logo.name}
                  width={150}
                  height={150}
                  className="object-contain transition duration-300"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
