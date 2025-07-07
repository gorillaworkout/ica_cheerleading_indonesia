import { Button } from "@/components/ui/button"
import { Trophy, Calendar, MapPin } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function ChampionshipsHero() {
  return (
    <section className="relative h-[500px] overflow-hidden">
      <Image
        src="/placeholder.svg?height=500&width=1200"
        alt="Cheerleading Championship"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white max-w-4xl px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Championships</h1>
          <p className="text-xl md:text-2xl mb-8">
            Compete at the highest level in our premier cheerleading competitions
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-lg px-4 py-2">
              <Trophy className="h-5 w-5" />
              <span>World-Class Competition</span>
            </div>
            <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-lg px-4 py-2">
              <Calendar className="h-5 w-5" />
              <span>Year-Round Events</span>
            </div>
            <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-lg px-4 py-2">
              <MapPin className="h-5 w-5" />
              <span>Global Locations</span>
            </div>
          </div>
          <Link href="#competitions">
            <Button size="lg" className="bg-red-600 hover:bg-red-700">
              View Competitions
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
