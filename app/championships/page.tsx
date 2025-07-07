import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ChampionshipsList } from "@/components/championships/championships-list"
import { ChampionshipsHero } from "@/components/championships/championships-hero"

export const metadata: Metadata = {
  title: "Championships",
  description:
    "Explore ICA cheerleading championships and competitions worldwide. Register your team and compete at the highest level.",
  openGraph: {
    title: "Championships - ICA",
    description:
      "Explore ICA cheerleading championships and competitions worldwide. Register your team and compete at the highest level.",
  },
}

export default function ChampionshipsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <ChampionshipsHero />
        <ChampionshipsList />
      </main>
      <Footer />
    </div>
  )
}
