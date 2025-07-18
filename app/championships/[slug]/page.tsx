import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CompetitionDetails } from "@/components/championships/competition-details"
import { CompetitionResults } from "@/components/championships/competition-results"
import { notFound } from "next/navigation"
import { fetchCompetitions } from "@/lib/fetchCompetitions"
import BestTeamSummary from "@/components/championships/best-team-medal-result"
import ProvinceRankingPage from "@/components/championships/province-point"
import { HeroImageSection } from "@/components/home/hero-image-section"
interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const competitions = await fetchCompetitions()
  const competition = competitions.find((comp) => comp.slug === slug)

  if (!competition) {
    return {
      title: "Competition Not Found",
    }
  }

  return {
    title: competition.name,
    description: competition.description,
    openGraph: {
      title: `${competition.name} - ICA Championships`,
      description: competition.description,
    },
  }
}

export default async function CompetitionPage({ params }: Props) {
  const { slug } = await params
  const competitions = await fetchCompetitions()
  const competition = competitions.find((comp) => comp.slug === slug)

  if (!competition) {
    notFound()
  }

  // Convert competition.image (string) to an array for HeroImageSection
  const heroSlides = competition.image ? [competition.image] : []

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <div className="container w-full h-[500px]">
          <HeroImageSection heroSlides={heroSlides} showTextAndButtons={false} />
        </div>
        <CompetitionDetails competition={competition} />
        <ProvinceRankingPage />
        <BestTeamSummary />
        <CompetitionResults competitionId={competition.id} />
      </main>
      <Footer />
    </div>
  )
}

export async function generateStaticParams() {
  const competitions = await fetchCompetitions()
  return competitions.map((competition) => ({
    slug: competition.slug,
  }))
}
