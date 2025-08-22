"use client"

import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, Award, MapPin, Trophy, Star } from "lucide-react"
import Image from "next/image"
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks"
import { selectProvinces, fetchProvinces } from "@/features/provinces/provincesSlice"
import { getPublicImageUrl } from "@/utils/getPublicImageUrl"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Profile } from "@/types/profiles/profiles"

export default function Athletes() {
  const [athletes, setAthletes] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const provinces = useAppSelector(selectProvinces)
  const dispatch = useAppDispatch()

  useEffect(() => {
    const fetchAthletes = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'athlete')
          .eq('is_deleted', false)
          .eq('is_verified', true)
          .order('created_at', { ascending: false })

        if (error) throw error
        setAthletes(data || [])
      } catch (error) {
        console.error('Error fetching athletes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAthletes()
    dispatch(fetchProvinces())
  }, [dispatch])

  const getProvinceName = (provinceCode: string) => {
    const province = provinces.find(p => p.id_province === provinceCode)
    return province ? province.name : provinceCode
  }

  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return "/placeholder-user.jpg"
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${imagePath}`
  }

  if (loading && athletes.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-50 to-red-100 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Our <span className="text-red-600">Athletes</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Meet the talented cheerleading athletes who bring passion, dedication, and excellence to every performance.
          </p>
        </div>
      </section>

      {/* Athletes Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Athletes
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our exceptional athletes who have demonstrated outstanding skills, teamwork, and dedication in cheerleading.
            </p>
          </div>

          {athletes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {athletes.map((athlete) => (
                <Card key={athlete.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="relative h-64 bg-gray-100">
                    <Image
                      src={getImageUrl(athlete.id_photo_url)}
                      alt={athlete.display_name || "Athlete"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">{athlete.display_name || "Unnamed Athlete"}</CardTitle>
                    <p className="text-gray-600">Athlete</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-2" />
                      {athlete.province_code ? getProvinceName(athlete.province_code) : "Location not specified"}
                    </div>
                    
                    {athlete.age && (
                      <div className="flex items-center text-sm">
                        <Users className="w-4 h-4 mr-2 text-blue-500" />
                        <span>{athlete.age} years old</span>
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Member Code:</span>
                        <span className="font-medium">{athlete.member_code || "N/A"}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Joined:</span>
                        <span className="font-medium text-green-600">
                          {athlete.created_at ? new Date(athlete.created_at).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Athletes Yet</h3>
              <p className="text-gray-600 mb-6">
                We're working on featuring our outstanding athletes. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Join Our Athlete Community
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Are you passionate about cheerleading? Join our community of dedicated athletes and showcase your skills in competitions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/login">
                Join as Athlete
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/about/coaches">
                Meet Our Coaches
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
