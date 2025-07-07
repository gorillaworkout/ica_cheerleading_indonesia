import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, DollarSign } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Mock data - replace with actual data fetching
const competitions = [
  {
    id: "1",
    name: "2024 World Championships",
    description: "The premier international cheerleading competition featuring teams from around the globe.",
    date: "2024-06-15",
    location: "Orlando, Florida, USA",
    image: "/placeholder.svg?height=300&width=400",
    registrationOpen: true,
    registrationDeadline: "2024-05-01",
    divisions: 8,
    priceRange: "$150 - $300",
    status: "Registration Open",
  },
  {
    id: "2",
    name: "Regional Championships 2024",
    description: "Regional competition for teams to qualify for the World Championships.",
    date: "2024-04-20",
    location: "Dallas, Texas, USA",
    image: "/placeholder.svg?height=300&width=400",
    registrationOpen: true,
    registrationDeadline: "2024-03-15",
    divisions: 5,
    priceRange: "$120 - $180",
    status: "Registration Open",
  },
  {
    id: "3",
    name: "Spring Classic 2024",
    description: "A competitive spring event for all skill levels and age groups.",
    date: "2024-03-10",
    location: "Las Vegas, Nevada, USA",
    image: "/placeholder.svg?height=300&width=400",
    registrationOpen: false,
    registrationDeadline: "2024-02-01",
    divisions: 12,
    priceRange: "$100 - $200",
    status: "Registration Closed",
  },
  {
    id: "4",
    name: "Summer Showcase 2024",
    description: "End-of-season showcase featuring the best teams from across the country.",
    date: "2024-07-25",
    location: "Los Angeles, California, USA",
    image: "/placeholder.svg?height=300&width=400",
    registrationOpen: false,
    registrationDeadline: "2024-06-15",
    divisions: 6,
    priceRange: "$180 - $250",
    status: "Coming Soon",
  },
]

export function ChampionshipsList() {
  return (
    <section id="competitions" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Upcoming Championships</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Join thousands of athletes from around the world in our premier cheerleading competitions. From regional
            qualifiers to world championships, find the perfect competition for your team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {competitions.map((competition) => (
            <Card key={competition.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48">
                <Image
                  src={competition.image || "/placeholder.svg"}
                  alt={competition.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 right-4">
                  <Badge
                    variant={competition.registrationOpen ? "default" : "secondary"}
                    className={
                      competition.registrationOpen
                        ? "bg-green-600 hover:bg-green-700"
                        : competition.status === "Coming Soon"
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-gray-600"
                    }
                  >
                    {competition.status}
                  </Badge>
                </div>
              </div>

              <CardHeader>
                <CardTitle className="text-xl">{competition.name}</CardTitle>
                <p className="text-gray-600 line-clamp-2">{competition.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-red-600" />
                    <span>{new Date(competition.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-red-600" />
                    <span className="truncate">{competition.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-red-600" />
                    <span>{competition.divisions} Divisions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-red-600" />
                    <span>{competition.priceRange}</span>
                  </div>
                </div>

                {competition.registrationOpen && (
                  <div className="text-sm text-gray-600">
                    <strong>Registration Deadline:</strong>{" "}
                    {new Date(competition.registrationDeadline).toLocaleDateString()}
                  </div>
                )}

                <div className="flex space-x-2">
                  <Link href={`/championships/${competition.id}`} className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      View Details
                    </Button>
                  </Link>
                  {competition.registrationOpen && (
                    <Link href={`/championships/${competition.id}/register`} className="flex-1">
                      <Button className="w-full bg-red-600 hover:bg-red-700">Register Now</Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Looking for past competitions or results?</p>
          <Link href="/championships/archive">
            <Button variant="outline" size="lg" className="bg-transparent">
              View Archive
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
