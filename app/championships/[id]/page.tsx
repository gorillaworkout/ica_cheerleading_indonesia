import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CompetitionDetails } from "@/components/championships/competition-details"
import { CompetitionResults } from "@/components/championships/competition-results"
import { notFound } from "next/navigation"
import {competitionsDetails} from '@/utils/dummyChampionship'
import BestTeamSummary from "@/components/championships/best-team-medal-result"
import { HeroSection } from "@/components/home/hero-section"
import { jurnasHeroSlides } from "@/utils/dummyhero"
import ProvinceRankingPage from "@/components/championships/province-point"
interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const competition = competitionsDetails.find((comp) => comp.id === id)

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
  const { id } = await params
  const competition = competitionsDetails.find((comp) => comp.id === id)

  if (!competition) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <div className="container w-full h-[500px]">
          <HeroSection heroSlides={jurnasHeroSlides} showTextAndButtons={false} />
        </div>
        <CompetitionDetails competition={competition} />
        <ProvinceRankingPage/>
        <BestTeamSummary/>
        <CompetitionResults competitionId={id} />
      </main>
      <Footer />
    </div>
  )
}

export async function generateStaticParams() {
  return competitionsDetails.map((competition) => ({
    id: competition.id,
  }))
}
