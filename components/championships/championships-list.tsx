"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Banknote, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { competitions } from "@/utils/dummyChampionship"
import { getPriceRangeInRupiah } from "@/lib/utils"
import { CompetitionProps } from "@/types/types"

export function ChampionshipsList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [yearFilter, setYearFilter] = useState<string>("all")

  const filteredCompetitions = useMemo(() => {
    return competitions.filter((comp) => {
      const matchYear = yearFilter === "all" || new Date(comp.date).getFullYear().toString() === yearFilter
      const matchName = comp.name.toLowerCase().includes(searchTerm.toLowerCase())
      return matchYear && matchName
    })
  }, [searchTerm, yearFilter])

  const uniqueYears = Array.from(new Set(competitions.map((c) => new Date(c.date).getFullYear().toString()))).sort(
    (a, b) => Number(b) - Number(a)
  )

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

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-8">
          <div className="flex-1">
            <Label htmlFor="search" className="text-sm text-gray-700">Search by name</Label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                id="search"
                placeholder="Enter competition name..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="w-full md:w-40">
            <Label htmlFor="year" className="text-sm text-gray-700">Filter by year</Label>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {uniqueYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredCompetitions.map((competition) => (
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

        {/* Archive CTA */}
        {/* <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Looking for past competitions or results?</p>
          <Link href="/championships/archive">
            <Button variant="outline" size="lg" className="bg-transparent">
              View Archive
            </Button>
          </Link>
        </div> */}
      </div>
    </section>
  )
}
