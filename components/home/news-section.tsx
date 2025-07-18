"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchNews } from "@/features/news/newsSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { getPublicImageUrlSync } from "@/utils/getPublicImageUrl"
export function NewsSection() {
  const dispatch = useAppDispatch();
  const { newsList, status } = useSelector((state: any) => state.news);
  console.log(newsList, "newslist")
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchNews());
    }
  }, [dispatch, status]);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest News & Updates</h2>
          <p className="text-lg text-gray-600">
            Stay informed about the latest developments in the cheerleading community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsList &&
            [...newsList]
              .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((article: any) => (
                <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48">
                    <Image src={
                      article.images && article.images[0]
                        ? (article.images[0].startsWith("https://")
                            ? article.images[0]
                            : article.images[0].startsWith("/")
                              ? article.images[0]
                              : getPublicImageUrlSync(article.images[0]) || "/placeholder.svg")
                        : "/placeholder.svg"
                    } alt={article.title} fill className="object-cover" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                        {article.category}
                      </span>
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(article.date).toLocaleDateString()}
                    </div>
                    <CardTitle className="text-xl line-clamp-2">{article.title}</CardTitle>
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

        <div className="text-center mt-12">
          <Link href="/news">
            <Button size="lg" className="bg-red-600 hover:bg-red-700">
              View All News
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
