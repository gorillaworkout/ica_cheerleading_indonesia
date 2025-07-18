"use client"

import { notFound } from "next/navigation"
import { NewsDetailClient } from "./NewsDetailClient"
import { use, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { fetchNews } from "@/features/news/newsSlice"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"

export default function Page(props: { params: Promise<{ slug: string }> }) {
  const { slug } = use(props.params) // ✅ unwrapped with `use()`
  const dispatch = useAppDispatch();
  const { newsList, status } = useSelector((state: any) => state.news);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchNews());
    }
  }, [dispatch, status]);

  // Show loading state while fetching news
  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-8"></div>
          <div className="h-64 bg-gray-300 rounded mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  // Find the article by slug from Redux store
  const article = newsList?.find((item: any) => item.slug === slug)

  if (!article) return notFound()

  return <NewsDetailClient article={article} relatedNews={newsList || []} />
}
