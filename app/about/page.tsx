import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "About ICA",
  description: "Learn about the International Cheerleading Association, our mission, and organizational structure.",
  openGraph: {
    title: "About ICA - International Cheerleading Association",
    description: "Learn about the International Cheerleading Association, our mission, and organizational structure.",
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">About ICA</h1>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">What does ICA do?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  The International Cheerleading Association (ICA) is dedicated to promoting excellence in cheerleading
                  through competitive events, educational programs, and community building. We provide a platform for
                  athletes, coaches, and judges to showcase their skills and advance the sport of cheerleading globally.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Organization Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-red-50 rounded-lg p-6 mb-4">
                      <h3 className="font-semibold text-gray-900">Administration</h3>
                    </div>
                    <p className="text-sm text-gray-600">Executive team managing operations and strategic decisions</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-red-50 rounded-lg p-6 mb-4">
                      <h3 className="font-semibold text-gray-900">Coaches</h3>
                    </div>
                    <p className="text-sm text-gray-600">Certified coaches leading teams and training athletes</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-red-50 rounded-lg p-6 mb-4">
                      <h3 className="font-semibold text-gray-900">Judges</h3>
                    </div>
                    <p className="text-sm text-gray-600">Qualified judges ensuring fair competition standards</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
