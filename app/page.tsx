"use client"

import { useEffect, useState } from "react"
import { HeroSection } from "@/components/home/hero-section"
import { IntroSection } from "@/components/home/intro-section"
import { NewsSection } from "@/components/home/news-section"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { TeamLogoSlider } from "@/components/home/team-logo-section"
import { ChampionshipSection } from "@/components/home/championship-section"
import CheerOrganizationsSection from "@/components/home/cheer-organization-section"
import { ScrollAnimation } from "@/components/ui/scroll-animation-safe"
import { generateSEOMetadata, generateJSONLD, breadcrumbSchema } from "@/lib/seo"
import { useToast } from "@/hooks/use-toast"
import { useSEO } from "@/hooks/use-seo"
import { HeroImageSection } from "@/components/home/hero-image-section"
import InitialLoader from "@/components/ui/initial-loader"
// Metadata moved to layout.tsx since this is now a client component

const breadcrumbs = breadcrumbSchema([
  { name: "Beranda", url: "https://indonesiancheer.org" }
])

export default function HomePage() {
  const { toast } = useToast()
  const [isReady, setIsReady] = useState(false)
  const heroSlides = [
    { src: "/ica-hero.webp", alt: "ICA Cheerleading Indonesia Hero Image" }
  ]

  // Set SEO for homepage
  useSEO({
    canonical: 'https://indonesiancheer.org/',
    hreflang: {
      'id': 'https://indonesiancheer.org/',
      'x-default': 'https://indonesiancheer.org/'
    }
  });

  useEffect(() => {
    const justLoggedOut = localStorage.getItem("justLoggedOut")
    const justLoggedIn = localStorage.getItem("justLoggedIn")
    const justRegistered = localStorage.getItem("justRegistered")
    const justAuthenticated = localStorage.getItem("justAuthenticated")
    
    // Priority order: Login > Register > Authenticate > Logout
    // This prevents multiple toasts from showing at once
    
    if (justLoggedIn === "true") {
      // Tampilkan toast login success di homepage
      toast({
        title: "Login Successful!",
        description: "Welcome back! You have successfully logged in.",
        variant: "default",
      })
      
      // Clear all flags when showing login toast
      localStorage.removeItem("justLoggedIn")
      localStorage.removeItem("justLoggedOut")
      localStorage.removeItem("justRegistered")
      localStorage.removeItem("justAuthenticated")
      return
    }
    
    if (justRegistered === "true") {
      // Tampilkan toast registration success di homepage
      toast({
        title: "Registration Successful!",
        description: "Please check your email and click the activation link to activate your account before logging in.",
        variant: "default",
      })
      
      // Clear all flags when showing register toast
      localStorage.removeItem("justRegistered")
      localStorage.removeItem("justLoggedOut")
      localStorage.removeItem("justAuthenticated")
      return
    }
    
    if (justAuthenticated === "true") {
      // Tampilkan toast authentication success di homepage
      toast({
        title: "Authentication Successful!",
        description: "You have been successfully authenticated and logged in.",
        variant: "default",
      })
      
      // Clear all flags when showing authenticate toast
      localStorage.removeItem("justAuthenticated")
      localStorage.removeItem("justLoggedOut")
      return
    }
    
    if (justLoggedOut === "true") {
      // Tampilkan toast logout success di homepage
      toast({
        title: "Logged Out Successfully!",
        description: "You have been logged out. See you again soon!",
        variant: "default",
      })
      
      // Hapus flag setelah toast ditampilkan
      localStorage.removeItem("justLoggedOut")
    }
  }, [toast])

  // Fungsi untuk handle image load
  const handleHeroImageLoad = () => {
    setIsReady(true)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Loader Splash */}
      {!isReady && <InitialLoader />}
      {/* Structured Data - Breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: generateJSONLD(breadcrumbs)
        }}
      />
      <Header />
      <main>
        <div className="w-full h-screen">
          <HeroImageSection heroSlides={heroSlides} showTextAndButtons={false} onImageLoad={handleHeroImageLoad} />
        </div>
        <ScrollAnimation delay={0.1} direction="up">
          <div id="introSection">
            <IntroSection />
          </div>
        </ScrollAnimation>
        <ScrollAnimation delay={0.1} direction="up">
          <NewsSection />
        </ScrollAnimation>
        <ScrollAnimation delay={0.1} direction="right">
          <TeamLogoSlider />  
        </ScrollAnimation>
        <ScrollAnimation delay={0.1} direction="right">
          <CheerOrganizationsSection/>
        </ScrollAnimation>
        <ScrollAnimation delay={0.1} direction="right">
          <ChampionshipSection/>
        </ScrollAnimation>
      </main>
      <Footer />
    </div>
  )
}
