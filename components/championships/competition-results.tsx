"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award } from "lucide-react"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import {cardStyles} from '@/styles/cardStyle'

interface CompetitionResultsProps {
  competitionId: string
}

export function CompetitionResults({ competitionId }: CompetitionResultsProps) {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchResults() {
      setLoading(true)
      const { data: resultsData, error: resultsError } = await supabase
        .from("results")
        .select("division, placement, team, score, province")
        .eq("competition_id", competitionId)
        .order("division", { ascending: true })
        .order("placement", { ascending: true });

      if (resultsError) {
        console.error("Error fetching results:", resultsError.message);
        setResults([]);
        setLoading(false);
        return;
      }

      const { data: provincesData, error: provincesError } = await supabase
        .from("provinces")
        .select("id_province, name");

      if (provincesError) {
        console.error("Error fetching provinces:", provincesError.message);
        setResults([]);
        setLoading(false);
        return;
      }

      const provinceMap = provincesData.reduce((acc: any, province: any) => {
        acc[province.id_province] = province.name;
        return acc;
      }, {});

      const enrichedResults = resultsData.map((result: any) => ({
        ...result,
        province: provinceMap[result.province] || "Unknown Province",
      }));

      const groupedResults = enrichedResults.reduce((acc: any, result: any) => {
        const division = acc.find((d: any) => d.division === result.division);
        if (division) {
          division.results.push(result);
        } else {
          acc.push({ division: result.division, results: [result] });
        }
        return acc;
      }, []);

      setResults(groupedResults);
      setLoading(false)
    }

    fetchResults()
  }, [competitionId])

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
  
  if (loading) {
    return (
      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle>Competition Results</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <p className="text-gray-600">Loading results...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!results.length) {
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

  return (
    <div className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Competition Results</h2>
          <p className="text-lg text-gray-600">Congratulations to all participating teams!</p>
        </div>

        <Accordion type="multiple" className="space-y-4 bg-transparent p-4 rounded-lg" style={{ overflow: "visible" }}>
          {results.map((divisionResult, index) => (
            <AccordionItem key={index} value={`division-${index}`}>
              <AccordionTrigger className="text-lg font-bold text-gray-900">
                {divisionResult.division}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6">
                  {divisionResult.results.map((result: any, resultIndex: number) => {
                    const style = cardStyles[resultIndex] || {
                      bg: "bg-transparent",
                      border: "border-gray-200",
                      shadow: "shadow-sm",
                      text: "text-gray-700",
                    };

                    return (
                      <div
                        key={resultIndex}
                        className={`${style.bg} border ${style.border} ${style.shadow} rounded-xl p-6 flex flex-col md:flex-row justify-between gap-4`}
                        style={{ overflow: "visible", width: "100%" }}
                      >
                        <div className="flex items-center gap-6 justify-center md:justify-start text-center md:text-left w-full md:w-auto">
                          <div className="flex items-center gap-4">
                            <div className={`font-extrabold text-3xl md:text-4xl ${style.text}`}>
                              #{result.placement}
                            </div>
                          </div>
                          <div className="min-w-0">
                            <h2 className="text-xl md:text-2xl font-bold break-words">
                              {result.team}
                            </h2>
                            <p className="text-sm text-gray-600">Province: {result.province}</p>
                          </div>
                        </div>

                        <div className="flex justify-center items-center  text-center md:text-right w-full md:w-auto gap-2">
                          {getPlacementIcon(result.placement)}
                          <div className="text-3xl font-bold text-red-600">{result.score}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}
