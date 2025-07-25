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
  Scale, 
  Users, 
  Star, 
  MapPin,
  Mail,
  Phone,
  Shield,
  Target,
  Gavel,
  Medal,
  Trophy
} from "lucide-react"
import Image from "next/image"
import { useAppSelector } from "@/lib/redux/hooks"
import { selectJudgeById, selectJudgesLoading } from "@/features/judges/judgesSlice"
import { generateStorageUrl } from "@/utils/getPublicImageUrl"

// Types for judge data
interface Judge {
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
  competitions_judged: number
  years_experience: number
  certification_level: string
  is_active: boolean
  is_featured: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

interface JudgeDetailPageProps {
  params: Promise<{ id: string }>
}

export default function JudgeDetail({ params }: JudgeDetailPageProps) {
  const resolvedParams = use(params)
  const judge = useAppSelector((state) => selectJudgeById(state, resolvedParams.id))
  const loading = useAppSelector(selectJudgesLoading)

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <p className="text-gray-600 text-lg mt-4">Loading judge profile...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (!judge) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Judge Not Found</h1>
          <p className="text-gray-600 mb-8">The requested judge profile could not be found.</p>
          <Link href="/about/judges">
            <Button className="bg-red-600 hover:bg-red-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Judges
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
              <Link href="/about/judges">
                <Button variant="outline" className="bg-white border-red-200 hover:bg-red-50 text-red-600">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Judges
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
                        src={judge.image_url ? generateStorageUrl(judge.image_url) : "/placeholder.svg"}
                        alt={judge.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-red-600/10 to-transparent" />
                    </div>
                    
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{judge.name}</h1>
                    <p className="text-xl text-red-600 font-semibold mb-4">{judge.title}</p>
                    
                    {/* Enhanced Certification Level Badge */}
                    <div className="mb-6">
                      <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold shadow-lg border-2 border-white ${
                        judge.certification_level === 'International' 
                          ? 'bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 text-white'
                          : judge.certification_level === 'Level 4'
                          ? 'bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white'
                          : judge.certification_level === 'Level 3'
                          ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white'
                          : judge.certification_level === 'Level 2'
                          ? 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 text-white'
                          : 'bg-gradient-to-r from-slate-500 via-slate-600 to-slate-700 text-white'
                      }`}>
                        {judge.certification_level === 'International' ? (
                          <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                            <span>International Certified Judge</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                            </svg>
                            <span>{judge.certification_level} Certified Judge</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Contact Info */}
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="flex items-center justify-center space-x-2">
                        <MapPin className="h-4 w-4 text-red-500" />
                        <span>{judge.location}</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <Mail className="h-4 w-4 text-red-500" />
                        <span>{judge.email}</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <Phone className="h-4 w-4 text-red-500" />
                        <span>{judge.phone}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Card */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Trophy className="h-5 w-5 text-red-600" />
                      <span>Judge Statistics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Scale className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium">Competitions Judged</span>
                      </div>
                      <span className="font-bold text-red-600">{judge.competitions_judged}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium">Years Experience</span>
                      </div>
                      <span className="font-bold text-red-600">{judge.years_experience}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Information */}
              <div className="lg:col-span-2 space-y-6">
                {/* Bio Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-red-600" />
                      <span>About {judge.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed mb-4">{judge.bio}</p>
                    <div className="text-sm text-gray-500">
                      <strong>Specialization:</strong> {judge.specialization}
                    </div>
                  </CardContent>
                </Card>

                {/* Philosophy Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-red-600" />
                      <span>Judging Philosophy</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">{judge.philosophy}</p>
                  </CardContent>
                </Card>

                {/* Specialties Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Star className="h-5 w-5 text-red-600" />
                      <span>Specialties</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {judge.specialties.map((specialty, index) => (
                        <Badge key={index} variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Certifications and Achievements Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Certifications */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Shield className="h-5 w-5 text-red-600" />
                        <span>Certifications</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {judge.certifications.map((cert, index) => (
                          <li key={index} className="flex items-center space-x-2 text-sm">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span>{cert}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Achievements */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Medal className="h-5 w-5 text-red-600" />
                        <span>Achievements</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {judge.achievements.map((achievement, index) => (
                          <li key={index} className="flex items-center space-x-2 text-sm">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span>{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-16 bg-red-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Become a Certified Judge</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join our community of certified judges and help maintain the highest standards of fairness and excellence in cheerleading competitions.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button className="bg-red-600 hover:bg-red-700">
                <Gavel className="mr-2 h-4 w-4" />
                Judge Training Program
              </Button>
              <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                <Mail className="mr-2 h-4 w-4" />
                Contact Us
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
} 