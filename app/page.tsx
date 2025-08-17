"use client"

import { useEffect, useState, Suspense, lazy } from "react"
import { HeroSection } from "@/components/home/hero-section"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { generateSEOMetadata, generateJSONLD, breadcrumbSchema } from "@/lib/seo"
import { useToast } from "@/hooks/use-toast"
import { useSEO } from "@/hooks/use-seo"
import InitialLoader from "@/components/ui/initial-loader"
import HeroLCP from "@/components/home/hero-lcp"
import PreloadResources from "@/components/ui/preload-resources"

// Dynamic imports untuk components yang tidak critical
const IntroSection = lazy(() => import("@/components/home/intro-section").then(module => ({ default: module.IntroSection })))
const NewsSection = lazy(() => import("@/components/home/news-section").then(module => ({ default: module.NewsSection })))
const TeamLogoSlider = lazy(() => import("@/components/home/team-logo-section").then(module => ({ default: module.TeamLogoSlider })))
const ChampionshipSection = lazy(() => import("@/components/home/championship-section").then(module => ({ default: module.ChampionshipSection })))
const CheerOrganizationsSection = lazy(() => import("@/components/home/cheer-organization-section").then(module => ({ default: module.default })))
const ScrollAnimation = lazy(() => import("@/components/ui/scroll-animation-safe").then(module => ({ default: module.ScrollAnimation })))

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

  // Auto-hide loader after 25ms untuk bypass React rendering delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true)
    }, 25)

    return () => clearTimeout(timer)
  }, [])

  // Fungsi untuk handle image load dari HeroLCP
  const handleHeroImageLoad = () => {
    setIsReady(true)
  }

  return (
    <PreloadResources heroImage={true}>
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
            {/* HeroLCP - Super Optimized untuk LCP yang cepat */}
            <HeroLCP
              title="ICA Cheerleading Indonesia"
              subtitle="Welcome to the official cheerleading community"
              onImageLoad={handleHeroImageLoad}
            />
          </div>
          
          {/* Lazy loaded sections dengan Suspense */}
          <Suspense fallback={<div className="h-32 bg-gray-100 animate-pulse" />}>
            <ScrollAnimation delay={0.1} direction="up">
              <div id="introSection">
                <IntroSection />
              </div>
            </ScrollAnimation>
          </Suspense>
          
          <Suspense fallback={<div className="h-32 bg-gray-100 animate-pulse" />}>
            <ScrollAnimation delay={0.1} direction="up">
              <NewsSection />
            </ScrollAnimation>
          </Suspense>
          
          <Suspense fallback={<div className="h-32 bg-gray-100 animate-pulse" />}>
            <ScrollAnimation delay={0.1} direction="right">
              <TeamLogoSlider />  
            </ScrollAnimation>
          </Suspense>
          
          <Suspense fallback={<div className="h-32 bg-gray-100 animate-pulse" />}>
            <ScrollAnimation delay={0.1} direction="right">
              <CheerOrganizationsSection/>
            </ScrollAnimation>
          </Suspense>
          
          <Suspense fallback={<div className="h-32 bg-gray-100 animate-pulse" />}>
            <ScrollAnimation delay={0.1} direction="right">
              <ChampionshipSection/>
            </ScrollAnimation>
          </Suspense>
        </main>
        
        <Footer />
      </div>
    </PreloadResources>
  )
}
