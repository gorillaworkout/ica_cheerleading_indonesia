import type { Metadata } from "next"
import { HeroSection } from "@/components/home/hero-section"
import { IntroSection } from "@/components/home/intro-section"
import { NewsSection } from "@/components/home/news-section"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { TeamLogoSlider } from "@/components/home/team-logo-section"

export const metadata: Metadata = {
  title: "Home",
  description:
    "Welcome to the Indonesia Cheer Association - Your gateway to competitive cheerleading excellence.",
  openGraph: {
    title: "ICA - Indonesia Cheer Association",
    description:
      "Welcome to the Indonesia Cheer Association - Your gateway to competitive cheerleading excellence.",
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <IntroSection />
        <TeamLogoSlider />  
        <NewsSection />
      </main>
      <Footer />
    </div>
  )
}
