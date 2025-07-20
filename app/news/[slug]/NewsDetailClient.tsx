"use client"

import { formatDate } from "@/utils/dateFormat";
import { useState, useEffect } from "react";
import Image from "next/image"
import { Calendar } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HeroSection } from "@/components/home/hero-section"
import { HeroImageSection } from "@/components/home/hero-image-section"
import { newsImageProps } from "@/types/types"
import { getPublicImageUrlSync } from "@/utils/getPublicImageUrl"

interface Article {
  id: number
  title: string
  slug: string
  date: string
  images?: any[]
  category?: string
  content: string
}


export function NewsDetailClient({
  article,
  relatedNews,
}: {
  article: Article
  relatedNews: Article[]
}) {
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timeout)
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 animate-pulse" />
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1 max-w-4xl">
          <Link href="/news">
            <Button variant="outline" className="mb-6">
              ← Back to News
            </Button>
          </Link>

          <div className="relative w-full h-64 md:h-96 rounded overflow-hidden mb-6 shadow-md">
            <HeroImageSection showTextAndButtons={false} heroSlides={article.images as any || []} />
            <span className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded font-semibold text-sm">
              {article.category}
            </span>
          </div>

          <h1 className="text-4xl font-bold mb-4 text-gray-900">{article.title}</h1>
          <div className="flex items-center text-gray-600 mb-8">
            <Calendar className="h-5 w-5 mr-2" />
            <time dateTime={article.date}>{formatDate(article.date)}</time>
          </div>

          <article
            className="prose prose-lg max-w-none text-gray-700 whitespace-pre-line"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-80 max-h-[calc(100vh-150px)] overflow-y-auto sticky top-24">
          <h2 className="text-xl font-bold mb-4">Popular Events</h2>

          <div className="space-y-4">
            {Array.isArray(relatedNews) &&
              relatedNews
                .filter((n) => n.id !== article.id)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((newsItem) => (
                  <Link
                    href={`/news/${newsItem.slug}`}
                    key={newsItem.id}
                    className="flex gap-4 items-start group bg-white border rounded-lg p-2 shadow-sm hover:shadow-md transition"
                  >
                    <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                      <Image
                        src={(() => {
                          if (!newsItem.images || !newsItem.images[0]) return "/placeholder.svg";
                          
                          const imageData = newsItem.images[0];
                          
                          // If it's a string (direct URL)
                          if (typeof imageData === "string") {
                            if (imageData.startsWith("https://")) return imageData;
                            if (imageData.startsWith("/")) return imageData;
                            return getPublicImageUrlSync(imageData) || "/placeholder.svg";
                          }
                          
                          // If it's an object with src property
                          if (typeof imageData === "object" && imageData && "src" in imageData) {
                            const src = (imageData as any).src;
                            if (typeof src === "string") {
                              if (src.startsWith("https://")) return src;
                              if (src.startsWith("/")) return src;
                              return getPublicImageUrlSync(src) || "/placeholder.svg";
                            }
                          }
                          
                          return "/placeholder.svg";
                        })()}
                        alt={newsItem.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                      {/* {newsItem.category && (
                        <span className="absolute top-1 left-1 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide">
                          {newsItem.category}
                        </span>
                      )} */}
                    </div>

                    <div className="flex flex-col justify-between flex-1">
                      <p className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-red-600">
                        {newsItem.title}
                      </p>
                      <time className="text-xs text-gray-500 mt-1">
                        {formatDate(newsItem.date)}
                      </time>
                    </div>
                  </Link>
                ))}
          </div>
        </aside>

      </div>
    </main>
  )
}
