import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, Award } from "lucide-react"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Education",
  description: "Explore ICA educational programs, coaching certifications, and judge training courses.",
  openGraph: {
    title: "Education - ICA",
    description: "Explore ICA educational programs, coaching certifications, and judge training courses.",
  },
}

const coaches = [
  {
    id: "1",
    name: "Sarah Johnson",
    specialization: "Elite Level Training",
    experience: "15 years",
    certifications: ["Level 5 Certified", "Safety Instructor"],
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "2",
    name: "Mike Davis",
    specialization: "Youth Development",
    experience: "12 years",
    certifications: ["Youth Specialist", "Tumbling Coach"],
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "3",
    name: "Emma Wilson",
    specialization: "Choreography & Performance",
    experience: "10 years",
    certifications: ["Choreography Expert", "Performance Coach"],
    image: "/placeholder.svg?height=200&width=200",
  },
]

const judges = [
  {
    id: "1",
    name: "Dr. Lisa Chen",
    level: "Master Judge",
    experience: "20 years",
    specialties: ["Technical Skills", "Safety Standards"],
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "2",
    name: "John Smith",
    level: "Senior Judge",
    experience: "18 years",
    specialties: ["Performance", "Choreography"],
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "3",
    name: "Amy Brown",
    level: "Certified Judge",
    experience: "8 years",
    specialties: ["Youth Divisions", "Beginner Levels"],
    image: "/placeholder.svg?height=200&width=200",
  },
]

export default function Coaches() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative h-[400px] overflow-hidden">
          <Image
            src="/placeholder.svg?height=400&width=1200"
            alt="Education and Training"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-50" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white max-w-4xl px-4">
              <h1 className="text-5xl md:text-6xl font-bold mb-4">Coaches</h1>
              <p className="text-xl md:text-2xl mb-8">
                Learn from the best coaches  in the cheerleading community
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-lg px-4 py-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Certification Programs</span>
                </div>
                <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-lg px-4 py-2">
                  <Users className="h-5 w-5" />
                  <span>Expert Instructors</span>
                </div>
                <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-lg px-4 py-2">
                  <Award className="h-5 w-5" />
                  <span>Professional Development</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ICA Coaches Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">ICA Certified Coaches</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Our certified coaches bring years of experience and expertise to help develop the next generation of
                cheerleaders.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {coaches.map((coach) => (
                <Card key={coach.id} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mx-auto w-24 h-24 rounded-full overflow-hidden mb-4">
                      <Image
                        src={coach.image || "/placeholder.svg"}
                        alt={coach.name}
                        width={96}
                        height={96}
                        className="object-cover"
                      />
                    </div>
                    <CardTitle className="text-xl">{coach.name}</CardTitle>
                    <p className="text-red-600 font-medium">{coach.specialization}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-gray-600">
                      <p>
                        <strong>Experience:</strong> {coach.experience}
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {coach.certifications.map((cert, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full bg-transparent">
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>


        {/* Programs Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Educational Programs</h2>
              <p className="text-lg text-gray-600">Advance your skills with our comprehensive training programs</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-red-600" />
                    <span>Coach Certification Program</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Comprehensive training program for aspiring and current coaches to enhance their skills and
                    knowledge.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Safety and Risk Management</li>
                    <li>• Skill Progression and Training</li>
                    <li>• Team Management and Leadership</li>
                    <li>• Competition Preparation</li>
                  </ul>
                  <Button className="w-full bg-red-600 hover:bg-red-700">Learn More</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-red-600" />
                    <span>Judge Training Course</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Professional development program for individuals interested in becoming certified ICA judges.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Scoring Systems and Criteria</li>
                    <li>• Rule Book and Regulations</li>
                    <li>• Ethics and Professionalism</li>
                    <li>• Practical Judging Experience</li>
                  </ul>
                  <Button className="w-full bg-red-600 hover:bg-red-700">Learn More</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
