"use client"


import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Scale, Users, Award, Gavel, Medal, ShieldCheck } from "lucide-react"
import Image from "next/image"
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks"
import { selectJudges, selectJudgesLoading, fetchJudges } from "@/features/judges/judgesSlice"
import { getPublicImageUrl, generateStorageUrl } from "@/utils/getPublicImageUrl"
import { useState, useEffect } from "react"

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



export default function Judges() {
  const judges = useAppSelector(selectJudges)
  const loading = useAppSelector(selectJudgesLoading)
  const dispatch = useAppDispatch()
  const [judgeImages, setJudgeImages] = useState<Record<string, string>>({})

  // Fetch judges data on component mount
  useEffect(() => {
    dispatch(fetchJudges())
  }, [dispatch])

  useEffect(() => {
    const loadImages = async () => {
      const imagePromises = judges.map(async (judge) => {
        try {
          // Handle empty or null image_url
          if (!judge.image_url) {
            return { id: judge.id, url: "/placeholder.svg" }
          }
          
          // Try async method first
          let imageUrl = await getPublicImageUrl(judge.image_url)
          
          // Fallback to sync method if async fails
          if (!imageUrl) {
            imageUrl = generateStorageUrl(judge.image_url)
          }
          
          return { id: judge.id, url: imageUrl || "/placeholder.svg" }
        } catch (error) {
          console.error(`Error loading image for judge ${judge.id}:`, error)
          // Final fallback to sync method
          const fallbackUrl = generateStorageUrl(judge.image_url)
          return { id: judge.id, url: fallbackUrl }
        }
      })
      
      const images = await Promise.all(imagePromises)
      const imageMap = images.reduce((acc, { id, url }) => {
        acc[id] = url
        return acc
      }, {} as Record<string, string>)
      setJudgeImages(imageMap)
    }

    if (judges.length > 0) {
      loadImages()
    }
  }, [judges])

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-r from-red-600 to-red-700 text-white">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 0l30 30-30 30L0 30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          
          <div className="relative container mx-auto px-4 py-20">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-6">
                <Scale className="h-10 w-10" />
              </div>
              <h1 className="text-5xl font-bold mb-6">Certified Judges</h1>
              <p className="text-xl text-red-100 mb-8 leading-relaxed">
                Meet our experienced and certified judges who ensure fair competition and maintain the highest standards of cheerleading excellence across Indonesia.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Certified Professionals</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2">
                  <Medal className="h-4 w-4" />
                  <span>International Standards</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2">
                  <Award className="h-4 w-4" />
                  <span>Fair Competition</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Judges Grid Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Certified Judges</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our panel of experienced judges brings years of expertise and dedication to ensuring fair and accurate scoring in all ICA competitions.
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                <p className="text-gray-600 text-lg mt-4">Loading judges...</p>
              </div>
            ) : judges.length === 0 ? (
              <div className="text-center py-12">
                <Scale className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Judges Available</h3>
                <p className="text-gray-600">Judge profiles will be displayed here once they are added.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {judges.map((judge) => (
                  <Card key={judge.id} className="text-center hover:shadow-lg transition-shadow overflow-hidden group">
                    <CardHeader className="pb-4">
                      {/* Enhanced Profile Image Container */}
                      <div className="relative mx-auto mb-6">
                        {/* Outer glow ring */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-red-400 via-red-500 to-red-600 rounded-full opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
                        
                        {/* Image container with better sizing */}
                        <div className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-white shadow-lg">
                          <Image
                            src={judgeImages[judge.id] || "/placeholder.svg"}
                            alt={judge.name}
                            fill
                            sizes="128px"
                            className="object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              console.error(`Failed to load image for judge ${judge.name}:`, judgeImages[judge.id])
                              e.currentTarget.src = "/placeholder.svg"
                            }}
                          />
                          {/* Subtle overlay gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        
                        {/* Enhanced Certification Level Indicator */}
                        <div className={`absolute -bottom-2 -right-2 flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg border-2 border-white transform hover:scale-105 transition-all duration-200 ${
                          judge.certification_level === 'International' 
                            ? 'bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 text-white'
                            : judge.certification_level === 'Level 4'
                            ? 'bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white'
                            : judge.certification_level === 'Level 3'
                            ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white'
                            : judge.certification_level === 'Level 2'
                            ? 'bg-emerald-500 via-emerald-600 to-emerald-700 text-white'
                            : 'bg-slate-500 via-slate-600 to-slate-700 text-white'
                        }`}>
                          {judge.certification_level === 'International' ? (
                            <>
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                              </svg>
                              <span>INT</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                              </svg>
                              <span>{judge.certification_level.replace('Level ', 'L')}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <CardTitle className="text-xl text-gray-900 mb-2 group-hover:text-red-600 transition-colors duration-200">{judge.name}</CardTitle>
                      <p className="text-red-600 font-medium text-sm mb-3">{judge.specialization}</p>
                      
                      {/* Clean Certification Level Badge */}
                      <div className={`inline-flex justify-center items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
                        judge.certification_level === 'International' 
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : judge.certification_level === 'Level 4'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : judge.certification_level === 'Level 3'
                          ? 'bg-orange-100 text-orange-800 border border-orange-200'
                          : judge.certification_level === 'Level 2'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}>
                        <Scale className="w-3 h-3" />
                        <span>{judge.certification_level}</span>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4 pt-2">
                      {/* Experience Section with Icon */}
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 bg-gray-50 rounded-lg py-2 px-3">
                        <Award className="h-4 w-4 text-red-500" />
                        <span><strong>Experience:</strong> {judge.experience}</span>
                      </div>
                      
                      {/* Competitions Judged */}
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                        <Medal className="h-4 w-4 text-red-500" />
                        <span><strong>Competitions:</strong> {judge.competitions_judged}</span>
                      </div>
                      
                      {/* Specialties with improved styling */}
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Specialties</p>
                        <div className="flex flex-wrap justify-center gap-2">
                          {judge.specialties.slice(0, 3).map((specialty, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="text-xs border-red-200 text-red-700 hover:bg-red-50 transition-colors duration-200"
                            >
                              {specialty}
                            </Badge>
                          ))}
                          {judge.specialties.length > 3 && (
                            <Badge 
                              variant="outline" 
                              className="text-xs border-gray-200 text-gray-600 bg-gray-50"
                            >
                              +{judge.specialties.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Enhanced View Profile Button */}
                      <Link href={`/about/judges/${judge.id}`} className="block mt-4">
                        <Button 
                          variant="outline" 
                          className="w-full bg-transparent border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200 group"
                        >
                          <Scale className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                          View Profile
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Judge Training Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Judge Training Programs</h2>
              <p className="text-lg text-gray-600">Advance your skills with our comprehensive judge training programs</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Gavel className="h-5 w-5 text-red-600" />
                    <span>Judge Certification Program</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Comprehensive training program for aspiring judges to learn scoring systems and competition management.
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

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-red-600" />
                    <span>Advanced Judge Training</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Advanced program for certified judges to enhance skills and learn international judging standards.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• International Standards</li>
                    <li>• Advanced Scoring Techniques</li>
                    <li>• Competition Management</li>
                    <li>• Mentorship Programs</li>
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
