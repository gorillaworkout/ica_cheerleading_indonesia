"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { defaultHeroSlides } from "@/utils/dummyhero"
import { motion, useScroll, useTransform } from "framer-motion"

interface Slide {
  src: string
  alt: string
  title?: string
  subtitle?: string
}

interface HeroSectionProps {
  heroSlides?: Slide[]
  showTextAndButtons?: boolean
}

export function HeroSection({
  heroSlides = defaultHeroSlides,
  showTextAndButtons = true,
}: HeroSectionProps) {
  // const [currentSlide, setCurrentSlide] = useState(0)
  // const [loading, setLoading] = useState(true)

  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  //   }, 5000)
  //   return () => clearInterval(timer)
  // }, [heroSlides.length])

  // useEffect(() => {
  //   const preload = new window.Image()
  //   preload.src = heroSlides[currentSlide].src
  //   preload.onload = () => setLoading(false)
  // }, [currentSlide, heroSlides])

  // const nextSlide = () => {
  //   setLoading(true)
  //   setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  // }

  // const prevSlide = () => {
  //   setLoading(true)
  //   setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  // }


  // new hero youtube

  const [isLoading, setIsLoading] = useState(true)
  const [visibleProducts, setVisibleProducts] = useState(9)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  const openFullscreen = () => {
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen();
    } else if ((el as any).webkitRequestFullscreen) {
      // Safari
      (el as any).webkitRequestFullscreen();
    } else if ((el as any).msRequestFullscreen) {
      // IE11
      (el as any).msRequestFullscreen();
    }
  }
  useEffect(() => {
    // Simulate page loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  // Handle escape key to close video modal
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowVideoModal(false)
      }
    }
    window.addEventListener("keydown", handleEsc)

    // Prevent scrolling when modal is open
    if (showVideoModal) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      window.removeEventListener("keydown", handleEsc)
      document.body.style.overflow = "auto"
    }
  }, [showVideoModal])

  const [introSection, setIntroSection] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setIntroSection(document.getElementById("introSection"));
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative flex items-center justify-center overflow-hidden bg-black md:h-screen h-auto"
    >
      <motion.div className="absolute top-0 left-0 w-full h-full z-0" style={{ opacity }}>
        <iframe
          src="https://www.youtube.com/embed/SksDptq-w8g?controls=0&autoplay=1&mute=1&loop=1&playlist=SksDptq-w8g&disablekb=1"
          title="Background Video"
          className="absolute top-0 left-0 w-full h-full object-cover"
          style={{ width: "100vw", height: "100vh" }}
          frameBorder="0"
          allow="autoplay fullscreen; picture-in-picture"

        ></iframe>
      </motion.div>

      <motion.div
        className="hidden md:block absolute bottom-10 left-1/2 transform -translate-x-1/2 cursor-pointer"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
        onClick={() => {
          introSection?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        <ChevronRight size={30} className="rotate-90" />
      </motion.div>
    </section>

    // <section className="relative w-full h-full overflow-hidden">
    //   {heroSlides.map((image, index) => (
    //     <div
    //       key={index}
    //       className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"}`}
    //     >
    //       {loading ? (
    //         <div className="w-full h-full bg-gray-300 animate-pulse" />
    //       ) : (
    //         <Image
    //           src={image.src || "/placeholder.svg"}
    //           alt={image.alt}
    //           fill
    //           className="object-cover w-full h-full"
    //           priority={index === 0}
    //         />
    //       )}

    //       {showTextAndButtons && !loading && (
    //         <>
    //           <div className="absolute inset-0 bg-black bg-opacity-40" />
    //           <div className="absolute inset-0 flex items-center justify-center">
    //             <div className="text-center text-white max-w-4xl px-4">
    //               <h1 className="text-5xl md:text-6xl font-bold mb-4">{image.title}</h1>
    //               <p className="text-xl md:text-2xl mb-8">{image.subtitle}</p>
    //               <div className="space-x-4">
    //                 <Link href="/championships">
    //                   <Button size="lg" className="bg-red-600 hover:bg-red-700">
    //                     View Championships
    //                   </Button>
    //                 </Link>
    //                 <Link href="/about">
    //                   <Button
    //                     size="lg"
    //                     variant="outline"
    //                     className="text-white border-white hover:bg-white hover:text-gray-900 bg-transparent"
    //                   >
    //                     Learn More
    //                   </Button>
    //                 </Link>
    //               </div>
    //             </div>
    //           </div>
    //         </>
    //       )}
    //     </div>
    //   ))}

    //   {/* Navigation Arrows */}
    //   {/* <button
    //     onClick={prevSlide}
    //     className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all z-20"
    //   >
    //     <ChevronLeft className="h-6 w-6 text-white" />
    //   </button>
    //   <button
    //     onClick={nextSlide}
    //     className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all z-20"
    //   >
    //     <ChevronRight className="h-6 w-6 text-white" />
    //   </button> */}

    //   {/* Slide Indicators */}
    //   <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
    //     {heroSlides.map((_, index) => (
    //       <button
    //         key={index}
    //         onClick={() => {
    //           setLoading(true)
    //           setCurrentSlide(index)
    //         }}
    //         className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? "bg-white" : "bg-white bg-opacity-50"}`}
    //       />
    //     ))}
    //   </div>
    // </section>
  )
}
