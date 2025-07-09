import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Users, Award, Calendar } from "lucide-react"

export function IntroSection() {
  const features = [
    {
      icon: Trophy,
      title: "Competitions",
      description: "Join premier cheerleading competitions worldwide with standardized judging and fair play.",
    },
    {
      icon: Users,
      title: "Community",
      description: "Connect with coaches, athletes, and judges from around the globe in our vibrant community.",
    },
    {
      icon: Award,
      title: "Education",
      description: "Access training resources, certification programs, and educational materials.",
    },
    {
      icon: Calendar,
      title: "Events",
      description: "Stay updated with upcoming competitions, workshops, and community events.",
    },
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to the Indonesia Cheer Association
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We are dedicated to promoting excellence in cheerleading through competitive events, educational programs,
            and building a global community of athletes, coaches, and enthusiasts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
