"use client"

import { formatDate } from "@/utils/dateFormat";
import React, { useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, ArrowRight } from "lucide-react"
import { Header } from "@/components/layout/header"
import { useSelector, useDispatch } from "react-redux"
import { fetchNews } from "@/features/news/newsSlice"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { getPublicImageUrlSync } from "@/utils/getPublicImageUrl"

export default function NewsPage() {
    const dispatch = useAppDispatch();
    const { newsList, status } = useSelector((state: any) => state.news);

    useEffect(() => {
        if (status === "idle") {
            dispatch(fetchNews());
        }
    }, [dispatch, status]);

    if (status === "loading") {
        return (
            <main className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-16">
                    <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-900">
                        All News & Updates
                    </h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, index) => (
                            <Card key={index} className="overflow-hidden bg-white animate-pulse">
                                <div className="h-48 bg-gray-300"></div>
                                <CardHeader>
                                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                                    <div className="h-6 bg-gray-300 rounded"></div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-300 rounded"></div>
                                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-900">
                    All News & Updates
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {newsList && [...newsList]
                        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((article: any) => (
                        <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white">
                            <div className="relative h-48">
                                <Image
                                    src={article.images && article.images[0] 
                                        ? (article.images[0].startsWith("https://")
                                            ? article.images[0]
                                            : article.images[0].startsWith("/") 
                                              ? article.images[0] 
                                              : getPublicImageUrlSync(article.images[0]) || "/placeholder.svg")
                                        : "/placeholder.svg"}
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
                                    {formatDate(article.date)}
                                </div>
                                <CardTitle className="text-xl line-clamp-2" dangerouslySetInnerHTML={{ __html: article.title }}></CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-400 mb-4 line-clamp-3" dangerouslySetInnerHTML={{ __html: article.content }}></p>
                                <Link href={`/news/${article.slug}`}>
                                    <Button variant="outline" className="w-full group bg-transparent" aria-label={`Read full article: ${article.title}`}>
                                        Read Full Article
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
