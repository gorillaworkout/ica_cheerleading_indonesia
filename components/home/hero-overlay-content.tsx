import React from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface HeroOverlayContentProps {
  title: string
  subtitle: string
}

const HeroOverlayContent: React.FC<HeroOverlayContentProps> = ({ title, subtitle }) => {
  return (
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
}

export default HeroOverlayContent
