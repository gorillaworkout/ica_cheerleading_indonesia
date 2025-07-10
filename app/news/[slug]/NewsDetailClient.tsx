"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { Calendar } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface Article {
  title: string
  slug: string
  date: string
  image?: string
  category?: string
  content: string
}

export function NewsDetailClient({ article }: { article: Article }) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timeout)
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 animate-pulse">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="h-10 w-40 bg-gray-300 rounded mb-6" />
          <div className="relative w-full h-64 md:h-96 bg-gray-300 rounded mb-6" />
          <div className="h-10 bg-gray-300 rounded mb-4 w-3/4" />
          <div className="flex items-center space-x-2 mb-8">
            <div className="h-5 w-5 bg-gray-300 rounded-full" />
            <div className="h-4 w-32 bg-gray-300 rounded" />
          </div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-300 rounded w-full" />
            <div className="h-4 bg-gray-300 rounded w-5/6" />
            <div className="h-4 bg-gray-300 rounded w-2/3" />
            <div className="h-4 bg-gray-300 rounded w-full" />
            <div className="h-4 bg-gray-300 rounded w-1/2" />
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/news">
          <Button variant="outline" className="mb-6">
            ← Back to News
          </Button>
        </Link>

        <div className="relative w-full h-64 md:h-96 rounded overflow-hidden mb-6 shadow-md">
          <Image
            src={article.image || "/placeholder.svg"}
            alt={article.title}
            fill
            className="object-cover"
          />
          <span className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded font-semibold text-sm">
            {article.category}
          </span>
        </div>

        <h1 className="text-4xl font-bold mb-4 text-gray-900">{article.title}</h1>
        <div className="flex items-center text-gray-600 mb-8">
          <Calendar className="h-5 w-5 mr-2" />
          <time dateTime={article.date}>{new Date(article.date).toLocaleDateString()}</time>
        </div>

        <article
          className="prose prose-lg max-w-none text-gray-700 whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </div>
    </main>
  )
}
