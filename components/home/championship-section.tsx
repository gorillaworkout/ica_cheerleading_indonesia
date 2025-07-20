"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, ArrowRight, MapPin, Users, Banknote } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useAppSelector } from "@/lib/redux/hooks";
import { Badge } from "../ui/badge"
import { getPublicImageUrl } from "@/utils/getPublicImageUrl";
import { getCardStyle } from "@/styles/cardStyles";
import React, { useEffect, useState } from "react";

export function ChampionshipSection() {
  const competitions = useAppSelector((state) => state.competitions.competitions);

  // Helper to fetch image URLs for competitions
  const [imageUrls, setImageUrls] = useState<{ [id: string]: string | null }>({});

  useEffect(() => {
    async function fetchImages() {
      const urls: { [id: string]: string | null } = {};
      await Promise.all(
        competitions.slice(0, 2).map(async (competition) => {
          urls[competition.id] = await getPublicImageUrl(competition.image);
        })
      );
      setImageUrls(urls);
    }
    if (competitions.length > 0) {
      fetchImages();
    }
  }, [competitions]);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest Cheerleading Championships and Results</h2>
          <p className="text-lg text-gray-600">
            Explore the Latest Cheerleading Championships Across Indonesia
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {competitions.slice(0, 2).map((competition, index) => {
            const cardStyle = getCardStyle(index);
            return (
            <Card key={competition.id} className={`overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 ${cardStyle.border} ${cardStyle.shadow}`}>
              <div className="relative h-48">
                <Image
                  src={imageUrls[competition.id] || "/placeholder.svg"}
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
                    <span>33 Divisions</span>
                  </div>
                </div>

                {competition.registrationOpen && (
                  <div className="text-sm text-gray-600">
                    <strong>Registration Deadline:</strong>{" "}
                    {new Date(competition.registrationDeadline).toLocaleDateString()}
                  </div>
                )}

                <div className="flex space-x-2">
                  <Link href={`/championships/${competition.slug}`} className="flex-1">
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
            )
          })}
        </div>

        <div className="text-center mt-12">
          <Link href="/championships">
            <Button size="lg" className="bg-red-600 hover:bg-red-700">
              View All Championship
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
