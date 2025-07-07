import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award } from "lucide-react"

interface CompetitionResultsProps {
  competitionId: string
}

// Mock results data - replace with actual data fetching
const mockResults = {
  "1": [
    {
      division: "Senior Level 5",
      results: [
        { placement: 1, team: "Elite All Stars", score: 98.5, coach: "Sarah Johnson" },
        { placement: 2, team: "Thunder Bolts", score: 96.2, coach: "Mike Davis" },
        { placement: 3, team: "Lightning Strike", score: 94.8, coach: "Emma Wilson" },
      ],
    },
    {
      division: "Junior Level 1",
      results: [
        { placement: 1, team: "Rising Stars", score: 92.1, coach: "Lisa Chen" },
        { placement: 2, team: "Dream Team", score: 90.7, coach: "John Smith" },
        { placement: 3, team: "Victory Squad", score: 89.3, coach: "Amy Brown" },
      ],
    },
  ],
}

export function CompetitionResults({ competitionId }: CompetitionResultsProps) {
  const results = mockResults[competitionId as keyof typeof mockResults]

  if (!results) {
    return (
      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle>Competition Results</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <p className="text-gray-600">Results will be posted after the competition concludes.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const getPlacementIcon = (placement: number) => {
    switch (placement) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return (
          <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-white">
            {placement}
          </div>
        )
    }
  }

  const getPlacementColor = (placement: number) => {
    switch (placement) {
      case 1:
        return "bg-yellow-50 border-yellow-200"
      case 2:
        return "bg-gray-50 border-gray-200"
      case 3:
        return "bg-amber-50 border-amber-200"
      default:
        return "bg-white border-gray-200"
    }
  }

  return (
    <div className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Competition Results</h2>
          <p className="text-lg text-gray-600">Congratulations to all participating teams!</p>
        </div>

        <div className="space-y-8">
          {results.map((divisionResult, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-xl">{divisionResult.division}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {divisionResult.results.map((result, resultIndex) => (
                    <div key={resultIndex} className={`border rounded-lg p-4 ${getPlacementColor(result.placement)}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {getPlacementIcon(result.placement)}
                          <div>
                            <h3 className="font-semibold text-lg">{result.team}</h3>
                            <p className="text-sm text-gray-600">Coach: {result.coach}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-red-600">{result.score}</div>
                          <Badge variant="outline" className="mt-1">
                            {result.placement === 1
                              ? "1st Place"
                              : result.placement === 2
                                ? "2nd Place"
                                : result.placement === 3
                                  ? "3rd Place"
                                  : `${result.placement}th Place`}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
