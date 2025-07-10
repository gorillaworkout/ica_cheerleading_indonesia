import { notFound } from "next/navigation"
import { NewsDetailClient } from "./NewsDetailClient"
import { news } from "@/utils/dummyNews"
import { use } from "react"


// app/news/[slug]/page.tsx (at bottom)
export async function generateStaticParams() {
  return news.map((item) => ({ slug: item.slug }))
}

// ✅ This must be an async function to use `params` safely

export default function Page(props: { params: Promise<{ slug: string }> }) {
  const { slug } = use(props.params) // ✅ unwrapped with `use()`


  const article = news.find((item) => item.slug === slug)

  if (!article) return notFound()

  return <NewsDetailClient article={article} />
}
