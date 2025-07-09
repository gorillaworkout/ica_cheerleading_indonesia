import React from "react"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Calendar } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"

const news = [
  {
    id: 1,
    title: "2024 World Championships Registration Now Open",
    content: `Join us for the biggest cheerleading event of the year. Registration is now open for teams worldwide.
    
This championship will bring together the best teams from all over the globe to compete at the highest level.`,
    date: "2024-01-15",
    image: "/placeholder.svg?height=400&width=700",
    category: "Competition",
  },
  {
    id: 2,
    title: "New Judging Certification Program Launched",
    content: `We're excited to announce our new comprehensive judging certification program for aspiring judges.
    
This program covers all aspects of cheerleading judging and aims to maintain the highest standards.`,
    date: "2024-01-10",
    image: "/placeholder.svg?height=400&width=700",
    category: "Education",
  },
  {
    id: 3,
    title: "Coach Development Workshop Series",
    content: `Join our monthly workshop series designed to help coaches improve their skills and knowledge.
    
Workshops include training techniques, leadership skills, and motivational strategies.`,
    date: "2024-01-05",
    image: "/placeholder.svg?height=400&width=700",
    category: "Training",
  },
]

interface Params {
  params: {
    id: string
  }
}

export default function NewsDetailPage({ params }: Params) {
  const id = Number(params.id)
  const article = news.find((item) => item.id === id)

  if (!article) {
    notFound()
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

        <article className="prose prose-lg max-w-none text-gray-700 whitespace-pre-line">
          {article.content}
        </article>
      </div>
    </main>
  )
}
