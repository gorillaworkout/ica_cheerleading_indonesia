"use client"

import Image from "next/image"
import { useEffect, useRef } from "react"

const teamLogos = [
    { src: "/ica-province/BALI.png", alt: "Bali" },
    { src: "/ica-province/BANTEN.png", alt: "Banten" },
    { src: "/ica-province/DIYOGYAKARTA.png", alt: "DI Yogyakarta" },
    { src: "/ica-province/JAKARTA.png", alt: "Jakarta" },
    { src: "/ica-province/JAWABARAT.png", alt: "Jawa Barat" },
    { src: "/ica-province/JAWATENGAH.png", alt: "Jawa Tengah" },
    { src: "/ica-province/JAWATIMUR.png", alt: "Jawa Timur" },
    { src: "/ica-province/KALIMANTANBARAT.png", alt: "Kalimantan Barat" },
    { src: "/ica-province/KALIMANTANSELATAN.png", alt: "Kalimantan Selatan" },
    { src: "/ica-province/KALIMANTANTIMUR.png", alt: "Kalimantan Timur" },
    { src: "/ica-province/KEPULAUANRIAU.png", alt: "Kepulauan Riau" },
    { src: "/ica-province/NTB.png", alt: "NTB" },
    { src: "/ica-province/PAPUA.png", alt: "Papua" },
    { src: "/ica-province/RIAU.png", alt: "Riau" },
    { src: "/ica-province/SUMATERASELATAN.png", alt: "Sumatra Selatan" },
    { src: "/ica-province/SUMATERAUTARA.png", alt: "Sumatra Utara" },
]

export function TeamLogoSlider() {
    const sliderRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const slider = sliderRef.current
        if (!slider) return

        let start = performance.now()

        const step = (timestamp: number) => {
            const elapsed = timestamp - start
            start = timestamp

            if (slider) {
                slider.scrollLeft -= 0.5 * (elapsed / 16) // subtract instead of add

                // Seamless infinite loop when reaching the beginning
                if (slider.scrollLeft <= 0) {
                    slider.scrollLeft = slider.scrollWidth / 2
                }
            }

            requestAnimationFrame(step)
        }

        const frameId = requestAnimationFrame(step)
        return () => cancelAnimationFrame(frameId)
    }, [])

    // Duplicate the logos to fake an infinite scroll
    const duplicatedLogos = [...teamLogos, ...teamLogos]

    return (
        <div className="relative py-8 bg-white border-y overflow-hidden">
            <div
                ref={sliderRef}
                className="overflow-x-hidden whitespace-nowrap"
            >
                <div className="flex gap-8 w-max">
                    {duplicatedLogos.map((logo, index) => (
                        <div
                            key={index}
                            className="min-w-[150px] flex justify-center items-center"
                        >
                            <Image
                                src={logo.src}
                                alt={logo.alt}
                                width={150}
                                height={150}
                                className="object-contain transition duration-300"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
