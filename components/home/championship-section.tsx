"use client";

import { formatDate } from "@/utils/dateFormat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, ArrowRight, MapPin, Users, Trophy, Star, Zap } from "lucide-react"
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
    <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
      
      {/* Gradient orbs for atmosphere */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-red-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500/20 to-blue-500/20 backdrop-blur-sm border border-white/10 rounded-full px-6 py-2 mb-6">
            <Trophy className="w-5 h-5 text-red-400" />
            <span className="text-white/80 font-medium">Championship Events</span>
          </div>
          <h2 className="text-5xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-6">
            Latest Cheerleading Championships
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Experience the pinnacle of cheerleading excellence across Indonesia's most prestigious competitions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {competitions.slice(0, 2).map((competition, index) => (
            <div key={competition.id} className="group relative">
              {/* Animated border glow */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              
              {/* Main card */}
              <div className="relative bg-gradient-to-br from-slate-800/90 to-red-900/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden transform transition-all duration-500 group-hover:scale-[1.02] group-hover:-translate-y-2">
                
                {/* Image section with overlays */}
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={imageUrls[competition.id] || "/placeholder.svg"}
                    alt={competition.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
                  
                  {/* Status badge */}
                  <div className="absolute top-6 right-6">
                    <div className={`
                      px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-md border transition-all duration-300
                      ${competition.registrationOpen 
                        ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300 shadow-emerald-500/25' 
                        : competition.status === "Coming Soon"
                          ? 'bg-blue-500/20 border-blue-400/30 text-blue-300 shadow-blue-500/25'
                          : 'bg-gray-500/20 border-gray-400/30 text-gray-300 shadow-gray-500/25'
                      } shadow-lg
                    `}>
                      <div className="flex items-center gap-2">
                        {competition.registrationOpen && <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>}
                        {competition.status}
                      </div>
                    </div>
                  </div>
                  
                  {/* Competition index indicator */}
                  <div className="absolute top-6 left-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-purple-500/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{String(index + 1).padStart(2, '0')}</span>
                    </div>
                  </div>
                  
                  {/* Floating elements */}
                  <div className="absolute bottom-6 left-6">
                    <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md rounded-full px-4 py-2 border border-white/10">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-white text-sm font-medium">Premium Event</span>
                    </div>
                  </div>
                </div>

                {/* Content section */}
                <div className="p-8">
                  {/* Title */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-red-400 group-hover:to-blue-400 group-hover:bg-clip-text transition-all duration-300">
                      {competition.name}
                    </h3>
                    <p className="text-gray-300 leading-relaxed line-clamp-2">
                      {competition.description}
                    </p>
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-1 gap-4 mb-6">
                    <div className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-colors duration-300">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Event Date</p>
                        <p className="text-white font-medium">{formatDate(competition.date)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-colors duration-300">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Location</p>
                        <p className="text-white font-medium truncate">{competition.location}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-colors duration-300">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Divisions</p>
                        <p className="text-white font-medium">33 Categories</p>
                      </div>
                    </div>
                  </div>

                  {/* Registration deadline */}
                  {competition.registrationOpen && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-300 font-semibold text-sm">Registration Closing Soon</span>
                      </div>
                      <p className="text-white">
                        <span className="text-gray-300">Deadline:</span>{" "}
                        <span className="font-semibold">
                          {formatDate(competition.registrationDeadline)}
                        </span>
                      </p>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    <Link href={`/championships/${competition.slug}`} className="flex-1">
                      <button className="w-full px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white font-semibold transition-all duration-300 hover:bg-white/20 hover:border-white/30 hover:shadow-lg hover:shadow-white/10 group/btn">
                        <div className="flex items-center justify-center gap-2">
                          <span>View Details</span>
                          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                        </div>
                      </button>
                    </Link>
                    
                    {competition.registrationOpen && (
                      <Link href={`/championships/${competition.id}/register`} className="flex-1">
                        <button className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 hover:scale-105 group/btn">
                          <div className="flex items-center justify-center gap-2">
                            <Trophy className="w-4 h-4" />
                            <span>Register Now</span>
                          </div>
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Link href="/championships">
            <button className="relative group px-8 py-4 bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white font-bold text-lg rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/25 hover:scale-105">
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-purple-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Button content */}
              <div className="relative flex items-center gap-3">
                <Trophy className="w-6 h-6" />
                <span>Explore All Championships</span>
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
              
              {/* Shine effect */}
              <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:animate-shine"></div>
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}
