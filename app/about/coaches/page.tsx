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
}
export default function Coaches() {
  const coaches = useAppSelector(selectCoaches)
  const loading = useAppSelector(selectCoachesLoading)
  const dispatch = useAppDispatch()
  const [coachImages, setCoachImages] = useState<Record<string, string>>({})

  // Fetch coaches data on component mount
  useEffect(() => {
    dispatch(fetchCoaches())
  }, [dispatch])

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
                  <Card key={coach.id} className="text-center hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="mx-auto w-24 h-24 rounded-full overflow-hidden mb-4">
                        <Image
                          src={coachImages[coach.id] || "/placeholder.svg"}
                          alt={coach.name}
                          width={96}
                          height={96}
                          className="object-cover"
                          onError={(e) => {
                            console.error(`Failed to load image for coach ${coach.name}:`, coachImages[coach.id])
                            e.currentTarget.src = "/placeholder.svg"
                          }}
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
                        {coach.certifications.slice(0, 3).map((cert, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                        {coach.certifications.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{coach.certifications.length - 3} more
                          </Badge>
                        )}
                      </div>
                      <Link href={`/about/coaches/${coach.id}`}>
                        <Button variant="outline" className="w-full bg-transparent mt-2">
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
