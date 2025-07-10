"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, ArrowRight } from "lucide-react"
import { Header } from "@/components/layout/header"
import {news} from "@/utils/dummyNews"


export default function NewsPage() {
    return (
        <main className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-900">
                    All News & Updates
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {news.map((article) => (
                        <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white">
                            <div className="relative h-48">
                                <Image
                                    src={article.image || "/placeholder.svg"}
                                    alt={article.title}
                                    fill
                                    className="object-cover"
                                />
                                <span className="absolute top-4 left-4 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
                                    {article.category}
                                </span>
                            </div>
                            <CardHeader>
                                <div className="flex items-center text-sm text-gray-500 mb-2">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    {new Date(article.date).toLocaleDateString()}
                                </div>
                                <CardTitle className="text-xl line-clamp-2" dangerouslySetInnerHTML={{ __html: article.title }}></CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-400 mb-4 line-clamp-3" dangerouslySetInnerHTML={{ __html: article.content }}></p>
                                <Link href={`/news/${article.slug}`}>
                                    <Button variant="outline" className="w-full group bg-transparent">
                                        Read More
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </main>
    )
}
