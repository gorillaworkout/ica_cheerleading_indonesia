import type { Metadata } from "next"
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

export const metadata: Metadata = generateSEOMetadata({
  title: "Beranda - ICA Indonesian Cheer Association",
  description: "Selamat datang di Indonesian Cheer Association - Platform resmi kompetisi cheerleading terbesar di Indonesia. Bergabunglah dengan komunitas cheerleading nasional.",
  keywords: [
    "beranda ICA",
    "cheerleading indonesia",
    "kompetisi cheerleading nasional",
    "komunitas cheerleading",
    "olahraga cheerleading indonesia",
    "turnamen cheerleading",
    "pelatihan cheerleading professional"
  ],
  canonicalUrl: "https://indonesiancheer.org",
  type: "website"
})

const breadcrumbs = breadcrumbSchema([
  { name: "Beranda", url: "https://indonesiancheer.org" }
])

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Structured Data - Breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: generateJSONLD(breadcrumbs)
        }}
      />
      
      <Header />
      <main>
        <div className="w-full h-fit">
          <HeroSection showTextAndButtons={false} />
        </div>
        <ScrollAnimation delay={0.2} direction="up">
          <div id="introSection">
            <IntroSection />
          </div>
        </ScrollAnimation>
        <ScrollAnimation delay={0.3} direction="up">
          <NewsSection />
        </ScrollAnimation>
        <ScrollAnimation delay={0.4} direction="up">
          <TeamLogoSlider />  
        </ScrollAnimation>
        <ScrollAnimation delay={0.5} direction="up">
          <CheerOrganizationsSection/>
        </ScrollAnimation>
        <ScrollAnimation delay={0.6} direction="up">
          <ChampionshipSection/>
        </ScrollAnimation>
      </main>
      <Footer />
    </div>
  )
}
