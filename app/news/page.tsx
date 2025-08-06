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
                        <Card key={article.id} className="relative overflow-hidden rounded-3xl shadow-lg border border-gray-100 bg-gradient-to-br from-white via-gray-50 to-gray-100 h-full flex flex-col justify-between group transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl">
                            <div className="relative h-48 w-full">
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
                                    className="object-cover rounded-t-3xl group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-4 left-4 flex gap-2 items-center">
                                    <span className="bg-gradient-to-r from-red-600 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow">
                                        {article.category}
                                    </span>
                                    <span className="bg-white/80 text-gray-700 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 shadow">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        {formatDate(article.date)}
                                    </span>
                                </div>
                            </div>
                            <CardHeader className="px-6 pt-6 pb-2">
                                <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-red-600 transition-colors duration-300" dangerouslySetInnerHTML={{ __html: article.title }}></CardTitle>
                            </CardHeader>
                            <CardContent className="px-6 pb-20 pt-0 flex-1">
                                <p className="text-gray-500 mb-4 line-clamp-3 text-base leading-relaxed">
                                    <span dangerouslySetInnerHTML={{ __html: article.content }} />
                                </p>
                            </CardContent>
                            <div className="absolute left-0 right-0 bottom-0 px-6 pb-6">
                                <Link href={`/news/${article.slug}`}>
                                    <Button 
                                        variant="outline" 
                                        className="w-full bg-gradient-to-r from-red-600 via-pink-500 to-red-500 text-white font-bold py-3 rounded-xl shadow-lg border-0 group-hover:from-pink-500 group-hover:to-red-600 transition-all duration-300 flex items-center justify-center gap-2 text-base tracking-wide hover:scale-105 hover:shadow-xl"
                                        aria-label={`Read full article: ${article.title}`}
                                    >
                                        <span>Read Full Article</span>
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </main>
    )
}
