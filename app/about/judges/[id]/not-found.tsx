import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Scale, ArrowLeft } from "lucide-react"

export default function JudgeNotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <Scale className="h-16 w-16 text-gray-400 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Judge Not Found</h1>
        <p className="text-lg text-gray-600 mb-8">
          The judge profile you're looking for doesn't exist or has been removed.
        </p>
        <div className="space-x-4">
          <Link href="/about/judges">
            <Button className="bg-red-600 hover:bg-red-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Judges
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline">
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 