"use client"

import Image from "next/image"
import { useEffect, useRef } from "react"

const teamLogos = [
    { src: "/ica-rounded.png", alt: "Team 1" },
    { src: "/ica-rounded.png", alt: "Team 2" },
    { src: "/ica-rounded.png", alt: "Team 3" },
    { src: "/ica-rounded.png", alt: "Team 4" },
    { src: "/ica-rounded.png", alt: "Team 5" },
    { src: "/ica-rounded.png", alt: "Team 6" },
    { src: "/ica-rounded.png", alt: "Team 7" },
    { src: "/ica-rounded.png", alt: "Team 8" },
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
                                width={120}
                                height={120}
                                className="object-contain grayscale hover:grayscale-0 transition duration-300"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
