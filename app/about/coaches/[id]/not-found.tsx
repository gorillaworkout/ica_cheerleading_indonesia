import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Coach Not Found</h1>
        <p className="text-gray-600 mb-8">The requested coach profile could not be found.</p>
        <Link href="/about/coaches">
          <Button className="bg-red-600 hover:bg-red-700">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Coaches
          </Button>
        </Link>
      </main>
      <Footer />
    </div>
  )
}
