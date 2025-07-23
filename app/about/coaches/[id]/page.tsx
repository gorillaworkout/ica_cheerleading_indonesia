"use client"

import Link from "next/link"
import { use } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Award, 
  Calendar, 
  Trophy, 
  Users, 
  Star, 
  MapPin,
  Mail,
  Phone,
  Shield,
  Target,
  Zap
} from "lucide-react"
import Image from "next/image"
import { useAppSelector } from "@/lib/redux/hooks"
import { selectCoachById, selectCoachesLoading } from "@/features/coaches/coachesSlice"
import { generateStorageUrl } from "@/utils/getPublicImageUrl"

// Types for coach data
interface Coach {
  id: string
  name: string
  title: string
  specialization: string
  experience: string
  bio: string
  location: string
  email: string
  phone: string
  image_url: string
  philosophy: string
  certifications: string[]
  achievements: string[]
  specialties: string[]
  teams_coached: number
  champions_produced: number
  years_experience: number
  success_rate: number
  is_active: boolean
  is_featured: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

interface CoachDetailPageProps {
  params: Promise<{ id: string }>
}

export default function CoachDetail({ params }: CoachDetailPageProps) {
  const resolvedParams = use(params)
  const coach = useAppSelector((state) => selectCoachById(state, resolvedParams.id))
  const loading = useAppSelector(selectCoachesLoading)

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <p className="text-gray-600 text-lg mt-4">Loading coach profile...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (!coach) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Coach Not Found</h1>
          <p className="text-gray-600 mb-8">The requested coach profile could not be found.</p>
          <Link href="/about/coaches">
            <Button className="bg-red-600 hover:bg-red-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Coaches
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        {/* Hero Section with Futuristic Design */}
        <section className="relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-500 to-red-600 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ef4444' fill-opacity='0.05'%3E%3Cpath d='M30 0l30 30-30 30L0 30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          
          <div className="relative container mx-auto px-4 py-16">
            {/* Back Button */}
            <div className="mb-8">
              <Link href="/about/coaches">
                <Button variant="outline" className="bg-white border-red-200 hover:bg-red-50 text-red-600">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Coaches
                </Button>
              </Link>
            </div>

            {/* Main Profile Card */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Profile Image and Basic Info */}
              <div className="lg:col-span-1">
                <Card className="bg-white border-gray-100 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <div className="relative mx-auto w-48 h-48 rounded-full overflow-hidden mb-6 ring-4 ring-gray-100">
                      <Image
                        src={coach.image_url ? generateStorageUrl(coach.image_url) : "/placeholder.svg"}
                        alt={coach.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-red-600/10 to-transparent" />
                    </div>
                    
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{coach.name}</h1>
                    <p className="text-xl text-red-600 font-semibold mb-4">{coach.title}</p>
                    
                    {/* Contact Info */}
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="flex items-center justify-center space-x-2">
                        <MapPin className="h-4 w-4 text-red-500" />
                        <span>{coach.location}</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <Mail className="h-4 w-4 text-red-500" />
                        <span>{coach.email}</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <Phone className="h-4 w-4 text-red-500" />
                        <span>{coach.phone}</span>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mt-8">
                      <div className="bg-gray-50 border border-gray-100 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{coach.teams_coached}</div>
                        <div className="text-xs text-gray-600">Teams Coached</div>
                      </div>
                      <div className="bg-gray-50 border border-gray-100 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{coach.champions_produced}</div>
                        <div className="text-xs text-gray-600">Champions</div>
                      </div>
                      <div className="bg-gray-50 border border-gray-100 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{coach.years_experience}</div>
                        <div className="text-xs text-gray-600">Years Exp.</div>
                      </div>
                      <div className="bg-gray-50 border border-gray-100 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{coach.success_rate}%</div>
                        <div className="text-xs text-gray-600">Success Rate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Information */}
              <div className="lg:col-span-2 space-y-6">
                {/* Bio Section */}
                <Card className="bg-white border-gray-100 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-2xl">
                      <Users className="h-6 w-6 text-red-600" />
                      <span>About {coach.name.split(' ')[0]}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed text-lg">{coach.bio}</p>
                  </CardContent>
                </Card>

                {/* Philosophy */}
                <Card className="bg-white border-gray-100 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-2xl">
                      <Target className="h-6 w-6 text-red-600" />
                      <span>Coaching Philosophy</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <blockquote className="text-gray-700 italic text-lg leading-relaxed border-l-4 border-red-200 pl-6">
                      "{coach.philosophy}"
                    </blockquote>
                  </CardContent>
                </Card>

                {/* Achievements */}
                <Card className="bg-white border-gray-100 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-2xl">
                      <Trophy className="h-6 w-6 text-red-600" />
                      <span>Achievements</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {coach.achievements.map((achievement, index) => (
                        <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 border border-gray-100 rounded-lg">
                          <Award className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{achievement}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Specialties */}
                <Card className="bg-white border-gray-100 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-2xl">
                      <Zap className="h-6 w-6 text-red-600" />
                      <span>Specialties</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      {coach.specialties.map((specialty, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="bg-white border-red-200 text-red-700 hover:bg-red-50 px-4 py-2 text-sm"
                        >
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Certifications */}
                <Card className="bg-white border-gray-100 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-2xl">
                      <Shield className="h-6 w-6 text-red-600" />
                      <span>Certifications</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {coach.certifications.map((cert, index) => (
                        <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 border border-gray-100 rounded-lg">
                          <Star className="h-5 w-5 text-red-500" />
                          <span className="text-gray-700 font-medium">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Contact CTA */}
            <div className="mt-12 text-center">
              <Card className="bg-gradient-to-r from-red-600 to-red-500 text-white shadow-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">Ready to Train with {coach.name.split(' ')[0]}?</h3>
                  <p className="text-red-100 mb-6">Get in touch to learn more about training opportunities and programs.</p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button variant="outline" className="bg-white text-red-600 hover:bg-red-50 border-0">
                      <Mail className="mr-2 h-4 w-4" />
                      Send Email
                    </Button>
                    <Button variant="outline" className="bg-white text-red-600 hover:bg-red-50 border-0">
                      <Phone className="mr-2 h-4 w-4" />
                      Call Now
                    </Button>
                  </div>
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
