"use client"

import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, Award } from "lucide-react"
import Image from "next/image"
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks"
import { selectCoaches, selectCoachesLoading, fetchCoaches } from "@/features/coaches/coachesSlice"
import { selectProvinces, selectProvinceNameById, fetchProvinces } from "@/features/provinces/provincesSlice"
import { getPublicImageUrl, generateStorageUrl } from "@/utils/getPublicImageUrl"
import { useState, useEffect } from "react"

// Note: Metadata cannot be used in client components
// Consider moving to layout.tsx or using a wrapper component if needed

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
  user_id?: string
  created_by?: string
  updated_by?: string
}
export default function Coaches() {
  const coaches = useAppSelector(selectCoaches)
  const loading = useAppSelector(selectCoachesLoading)
  const provinces = useAppSelector(selectProvinces)
  const dispatch = useAppDispatch()
  const [coachImages, setCoachImages] = useState<Record<string, string>>({})

  // Fetch coaches data on component mount
  useEffect(() => {
    dispatch(fetchCoaches())
    dispatch(fetchProvinces())
  }, [dispatch])

  // Helper function to get province name
  const getProvinceName = (location?: string) => {
    if (!location) return 'N/A'
    
    // First try to find by province code
    const province = provinces.find(p => p.id_province === location)
    if (province) return province.name
    
    // If not found, check if location already contains province name
    const existingProvince = provinces.find(p => p.name.toLowerCase() === location.toLowerCase())
    if (existingProvince) return existingProvince.name
    
    // If still not found, return the location as is (might be a full address)
    return location
  }

  useEffect(() => {
    const loadImages = async () => {
      const imagePromises = coaches.map(async (coach) => {
        try {
          // Handle empty or null image_url
          if (!coach.image_url) {
            return { id: coach.id, url: "/placeholder.svg" }
          }
          
          // Try async method first
          let imageUrl = await getPublicImageUrl(coach.image_url)
          
          // Fallback to sync method if async fails
          if (!imageUrl) {
            imageUrl = generateStorageUrl(coach.image_url)
          }
          
          return { id: coach.id, url: imageUrl || "/placeholder.svg" }
        } catch (error) {
          console.error(`Error loading image for coach ${coach.id}:`, error)
          // Final fallback to sync method
          const fallbackUrl = generateStorageUrl(coach.image_url)
          return { id: coach.id, url: fallbackUrl }
        }
      })
      
      const images = await Promise.all(imagePromises)
      const imageMap = images.reduce((acc, { id, url }) => {
        acc[id] = url
        return acc
      }, {} as Record<string, string>)
      setCoachImages(imageMap)
    }

    if (coaches.length > 0) {
      loadImages()
    }
  }, [coaches])

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative h-[400px] overflow-hidden">
          <Image
            src="/medal.jpeg?height=400&width=1200"
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
                Learn from the best coaches in the cheerleading community
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
              <p className="text-lg text-gray-600">Meet our professional coaching staff</p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                <p className="text-gray-600 text-lg mt-4">Loading coaches...</p>
              </div>
            ) : coaches.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No coaches available at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {coaches.map((coach) => (
                                  <Card key={coach.id} className="text-center hover:shadow-lg transition-shadow overflow-hidden group">
                  <CardHeader className="pb-4">
                    {/* Enhanced Profile Image Container */}
                    <div className="relative mx-auto mb-6">
                      {/* Outer glow ring */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-red-400 via-red-500 to-red-600 rounded-full opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
                      
                      {/* Image container with better sizing */}
                      <div className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-white shadow-lg">
                        <Image
                          src={coachImages[coach.id] || "/placeholder.svg"}
                          alt={coach.name}
                          fill
                          sizes="128px"
                          className="object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            console.error(`Failed to load image for coach ${coach.name}:`, coachImages[coach.id])
                            e.currentTarget.src = "/placeholder.svg"
                          }}
                        />
                        {/* Subtle overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      
                      {/* Status indicator */}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    
                    <CardTitle className="text-xl text-gray-900 mb-1 group-hover:text-red-600 transition-colors duration-200">{coach.name}</CardTitle>
                    <p className="text-red-600 font-medium text-sm">{coach.specialization}</p>
                    <p className="text-gray-500 text-xs mt-1">{getProvinceName(coach.location)}</p>
                  </CardHeader>
                    <CardContent className="space-y-4 pt-2">
                      {/* Experience Section with Icon */}
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 bg-gray-50 rounded-lg py-2 px-3">
                        <Award className="h-4 w-4 text-red-500" />
                        <span><strong>Experience:</strong> {coach.experience}</span>
                      </div>
                      
                      {/* Certifications with improved styling */}
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Certifications</p>
                        <div className="flex flex-wrap justify-center gap-2">
                          {coach.certifications.slice(0, 3).map((cert, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="text-xs border-red-200 text-red-700 hover:bg-red-50 transition-colors duration-200"
                            >
                              {cert}
                            </Badge>
                          ))}
                          {coach.certifications.length > 3 && (
                            <Badge 
                              variant="outline" 
                              className="text-xs border-gray-200 text-gray-600 bg-gray-50"
                            >
                              +{coach.certifications.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Enhanced View Profile Button */}
                      <Link href={`/about/coaches/${coach.id}`} className="block mt-4">
                        <Button 
                          variant="outline" 
                          className="w-full bg-transparent border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200 group"
                        >
                          <Users className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
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
