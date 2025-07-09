import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CompetitionDetails } from "@/components/championships/competition-details"
import { CompetitionResults } from "@/components/championships/competition-results"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{ id: string }>
}

// Mock data - replace with actual data fetching
const competitions = [
  {
    id: "1",
    name: "2024 World Championships",
    description: "The premier Indonesian cheerleading competition featuring teams from around the globe.",
    date: "2024-06-15",
    location: "Orlando, Florida, USA",
    registrationOpen: true,
    registrationDeadline: "2024-05-01",
    divisions: [
      { id: "1", name: "Team Cheer Coed Premiere", ageGroup: "12-14", skillLevel: "Beginner", price: 150, maxTeams: 32 },
      { id: "2", name: "Team Cheer Coed Elite", ageGroup: "15-18", skillLevel: "Elite", price: 250, maxTeams: 24 },
    ],
  },
  {
    id: "2",
    name: "Regional Championships 2024",
    description: "Regional competition for teams to qualify for the World Championships.",
    date: "2024-04-20",
    location: "Dallas, Texas, USA",
    registrationOpen: true,
    registrationDeadline: "2024-03-15",
    divisions: [
      { id: "4", name: "Youth Level 2", ageGroup: "8-12", skillLevel: "Intermediate", price: 120, maxTeams: 40 },
      { id: "5", name: "Junior Level 3", ageGroup: "12-15", skillLevel: "Intermediate", price: 180, maxTeams: 36 },
    ],
  },
  {
    id: "3",
    name: "Spring Classic 2024",
    description: "A competitive spring event for all skill levels and age groups.",
    date: "2024-03-10",
    location: "Las Vegas, Nevada, USA",
    registrationOpen: false,
    registrationDeadline: "2024-02-01",
    divisions: [
      { id: "6", name: "Mini Level 1", ageGroup: "5-8", skillLevel: "Beginner", price: 100, maxTeams: 50 },
      { id: "7", name: "Youth Level 3", ageGroup: "8-12", skillLevel: "Intermediate", price: 140, maxTeams: 45 },
    ],
  },
  {
    id: "4",
    name: "Summer Showcase 2024",
    description: "End-of-season showcase featuring the best teams from across the country.",
    date: "2024-07-25",
    location: "Los Angeles, California, USA",
    registrationOpen: false,
    registrationDeadline: "2024-06-15",
    divisions: [
      { id: "8", name: "All Star Elite", ageGroup: "16+", skillLevel: "Elite", price: 280, maxTeams: 20 },
      { id: "9", name: "College Division", ageGroup: "18-22", skillLevel: "Advanced", price: 200, maxTeams: 30 },
    ],
  },
]

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const competition = competitions.find((comp) => comp.id === id)

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
  const competition = competitions.find((comp) => comp.id === id)

  if (!competition) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <CompetitionDetails competition={competition} />
        <CompetitionResults competitionId={id} />
      </main>
      <Footer />
    </div>
  )
}

export async function generateStaticParams() {
  return competitions.map((competition) => ({
    id: competition.id,
  }))
}
