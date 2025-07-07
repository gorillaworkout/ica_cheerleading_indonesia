import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Clock, Trophy } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Division {
  id: string
  name: string
  ageGroup: string
  skillLevel: string
  price: number
  maxTeams: number
}

interface Competition {
  id: string
  name: string
  description: string
  date: string
  location: string
  registrationOpen: boolean
  registrationDeadline: string
  divisions: Division[]
}

interface CompetitionDetailsProps {
  competition: Competition
}

export function CompetitionDetails({ competition }: CompetitionDetailsProps) {
  return (
    <div className="py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="relative h-64 rounded-lg overflow-hidden mb-8">
          <Image src="/placeholder.svg?height=300&width=1200" alt={competition.name} fill className="object-cover" />
          <div className="absolute inset-0 bg-black bg-opacity-40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{competition.name}</h1>
              <p className="text-xl">{competition.description}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Competition Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-red-600" />
                  <span>Competition Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Date</p>
                      <p className="text-gray-600">{new Date(competition.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-gray-600">{competition.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Registration Deadline</p>
                      <p className="text-gray-600">{new Date(competition.registrationDeadline).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Divisions</p>
                      <p className="text-gray-600">{competition.divisions.length} Available</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Divisions */}
            <Card>
              <CardHeader>
                <CardTitle>Competition Divisions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {competition.divisions.map((division) => (
                    <div key={division.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{division.name}</h3>
                        <Badge variant="outline">${division.price}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Age Group:</span> {division.ageGroup}
                        </div>
                        <div>
                          <span className="font-medium">Skill Level:</span> {division.skillLevel}
                        </div>
                        <div>
                          <span className="font-medium">Max Teams:</span> {division.maxTeams}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Status */}
            <Card>
              <CardHeader>
                <CardTitle>Registration Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Badge
                    variant={competition.registrationOpen ? "default" : "secondary"}
                    className={`text-lg px-4 py-2 ${
                      competition.registrationOpen ? "bg-green-600 hover:bg-green-700" : "bg-gray-600"
                    }`}
                  >
                    {competition.registrationOpen ? "Registration Open" : "Registration Closed"}
                  </Badge>
                </div>

                {competition.registrationOpen && (
                  <>
                    <div className="text-center text-sm text-gray-600">
                      <p>Registration closes on</p>
                      <p className="font-medium">{new Date(competition.registrationDeadline).toLocaleDateString()}</p>
                    </div>
                    <Link href={`/championships/${competition.id}/register`}>
                      <Button className="w-full bg-red-600 hover:bg-red-700" size="lg">
                        Register Your Team
                      </Button>
                    </Link>
                  </>
                )}

                <div className="text-center">
                  <Link href="/contact">
                    <Button variant="outline" className="w-full bg-transparent">
                      Contact Us
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Divisions:</span>
                  <span className="font-medium">{competition.divisions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price Range:</span>
                  <span className="font-medium">
                    ${Math.min(...competition.divisions.map((d) => d.price))} - $
                    {Math.max(...competition.divisions.map((d) => d.price))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Teams:</span>
                  <span className="font-medium">{competition.divisions.reduce((sum, d) => sum + d.maxTeams, 0)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
