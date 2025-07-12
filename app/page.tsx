import type { Metadata } from "next"
import { HeroSection } from "@/components/home/hero-section"
import { IntroSection } from "@/components/home/intro-section"
import { NewsSection } from "@/components/home/news-section"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { TeamLogoSlider } from "@/components/home/team-logo-section"
import { SocialMedia } from "@/components/layout/socialMedia"
import { ChampionshipSection } from "@/components/home/championship-section"
import CheerOrganizationsSection from "@/components/home/cheer-organization-section"
import { Counter } from "@/components/counter/counter"

export const metadata: Metadata = {
  title: "Home",
  description:
    "Welcome to the Indonesian Cheer Association - Your gateway to competitive cheerleading excellence.",
  openGraph: {
    title: "ICA - Indonesian Cheer Association",
    description:
      "Welcome to the Indonesian Cheer Association - Your gateway to competitive cheerleading excellence.",
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* <Counter /> */}
      <SocialMedia/>
      <Header />
      <main>
        <div className="w-[99.6vw] h-screen">
          <HeroSection showTextAndButtons={false} />
        </div>
        <IntroSection />
        <TeamLogoSlider />  
        <CheerOrganizationsSection/>
        <ChampionshipSection/>
        <NewsSection />
      </main>
      <Footer />
    </div>
  )
}
