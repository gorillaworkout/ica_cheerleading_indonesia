import { notFound } from "next/navigation"
import { NewsDetailClient } from "./NewsDetailClient"
import { news } from "@/utils/dummyNews"

interface Params {
  params: {
    slug: string
  }
}

export default function Page({ params }: Params) {
  const article = news.find((item) => item.slug === params.slug)
  if (!article) return notFound()

  return <NewsDetailClient article={article} />
}
