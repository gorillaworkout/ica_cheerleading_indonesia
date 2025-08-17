"use client"

import React, { useEffect, useState } from "react";
import { Trophy, Medal, Clock, Calendar, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

// Safe Redux import
let useAppSelector: any = null;
try {
  const reduxHooks = require("@/lib/redux/hooks");
  useAppSelector = reduxHooks.useAppSelector;
} catch (error) {
  console.warn("Redux hooks not available");
}

// Import Supabase safely
let supabase: any = null;
try {
  const supabaseModule = require("@/lib/supabase");
  supabase = supabaseModule.supabase;
} catch (error) {
  console.warn("Supabase not available");
}

interface Result {
  placement: number;
  team: string;
  score: number;
  province: string;
}

interface DivisionResult {
  division: string;
  results: Result[];
}

type ProvinceStats = {
  province: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
};

const getProvincePoints = (data: DivisionResult[]): ProvinceStats[] => {
  const provinceMap = new Map<string, ProvinceStats>();

  data.forEach((division: DivisionResult) => {
    division.results.forEach(({ province, placement }: Result) => {
      if (!provinceMap.has(province)) {
        provinceMap.set(province, {
          province,
          gold: 0,
          silver: 0,
          bronze: 0,
          total: 0,
        });
      }

      const provinceData = provinceMap.get(province)!;

      if (placement === 1) provinceData.gold += 1;
      else if (placement === 2) provinceData.silver += 1;
      else if (placement === 3) provinceData.bronze += 1;

      provinceData.total = provinceData.gold + provinceData.silver + provinceData.bronze;
    });
  });

  return [...provinceMap.values()].sort((a, b) => {
    if (b.gold !== a.gold) return b.gold - a.gold;
    if (b.silver !== a.silver) return b.silver - a.silver;
    return b.bronze - a.bronze;
  });
};

interface ProvinceRankingSimpleProps {
  competitionId: string;
}

export default function ProvinceRankingSimple({ competitionId }: ProvinceRankingSimpleProps) {
  const [mounted, setMounted] = useState(false);
  const [provinceData, setProvinceData] = useState<ProvinceStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [competitionInfo, setCompetitionInfo] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  // Get provinces from Redux store safely
  const provinces = useAppSelector ? useAppSelector((state: any) => state.provinces.provinces) : [];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !supabase) {
      setLoading(false);
      return;
    }

    if (!useAppSelector) {
      setLoading(false);
      return;
    }

    async function fetchSupabaseData() {
      setLoading(true);
      
      try {
        // Fetch competition info first to check event status
        const { data: competitionData, error: competitionError } = await supabase
          .from("competitions")
          .select("name, start_date, end_date, status")
          .eq("id", competitionId)
          .single();

        if (competitionError) {
          console.error("❌ Error fetching competition info:", competitionError);
          setCompetitionInfo(null);
        } else {
          setCompetitionInfo(competitionData);
        }
        
        // Fetch results with more detailed logging
        const { data: resultsData, error: resultsError } = await supabase
          .from("results")
          .select("division, placement, team, score, province")
          .eq("competition_id", competitionId)
          .order("division", { ascending: true })
          .order("placement", { ascending: true });

        if (resultsError) {
          console.error("❌ Error fetching results:", resultsError);
          setLoading(false);
          return;
        }

        if (!resultsData || resultsData.length === 0) {
          console.warn("⚠️ No results data found in database");
          setProvinceData([]);
          setLoading(false);
          return;
        }

        // Create province mapping from Redux store
        const provinceMap = provinces.reduce((acc: any, province: any) => {
          if (province?.id_province && province?.name) {
            acc[province.id_province] = province.name;
          }
          return acc;
        }, {});

        // Add fallback mapping for common province codes in case Redux is incomplete
        const fallbackMapping: { [key: string]: string } = {
          "001": "JAWA BARAT",
          "002": "KALIMANTAN TIMUR",
          "003": "JAWA TENGAH",
          "004": "DI YOGYAKARTA",
          "005": "JAWA TIMUR",
          "006": "RIAU",
          "007": "SUMATERA SELATAN",
          "008": "PAPUA",
          "009": "KEPULAUAN RIAU",
          "010": "DKI JAKARTA",
          "011": "BALI",
          "012": "KALIMANTAN BARAT",
          "013": "KALIMANTAN SELATAN",
          "014": "NUSA TENGGARA BARAT",
        };

        // Combine Redux mapping with fallback
        const combinedMapping = { ...fallbackMapping, ...provinceMap };

        // If no provinces loaded from Redux yet, wait
        if (provinces.length === 0) {
          console.warn("⚠️ Provinces not loaded from Redux yet, retrying...");
          setTimeout(() => fetchSupabaseData(), 1000);
          return;
        }

        // Enrich results with province names from Redux
        const enrichedResults = resultsData?.map((result: any) => {
          const mappedProvinceName = combinedMapping[result.province];
          if (!mappedProvinceName) {
            console.warn(`⚠️ Province ID "${result.province}" not found in mapping`);
          }
          return {
            ...result,
            province: mappedProvinceName || `Unknown Province (${result.province})`,
          };
        }) || [];

        // Group by division safely
        const groupedResults = enrichedResults.reduce((acc: DivisionResult[], result: any) => {
          if (!result.division) return acc;
          
          const existingDivision = acc.find((d) => d.division === result.division);
          if (existingDivision) {
            existingDivision.results.push(result);
          } else {
            acc.push({ 
              division: result.division, 
              results: [result] 
            });
          }
          return acc;
        }, []);

        const calculatedRanking = getProvincePoints(groupedResults);
        
        if (calculatedRanking.length > 0) {
          setProvinceData(calculatedRanking);
        } else {
          setProvinceData([]);
        }
      } catch (err) {
        console.error("❌ Unexpected error:", err);
        setProvinceData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchSupabaseData();
  }, [mounted, provinces]);

  // Helper function to determine competition status
  const getCompetitionStatus = () => {
    if (!competitionInfo) return 'unknown';
    
    const now = new Date();
    const startDate = new Date(competitionInfo.start_date);
    const endDate = new Date(competitionInfo.end_date);
    
    if (now < startDate) return 'upcoming';
    if (now >= startDate && now <= endDate) return 'ongoing';
    if (now > endDate) return 'completed';
    
    return 'unknown';
  };

  // Helper function to get status message
  const getStatusMessage = () => {
    const status = getCompetitionStatus();
    
    switch (status) {
      case 'upcoming':
        return {
          icon: <Clock className="w-16 h-16 mx-auto mb-4 text-blue-400" />,
          title: "Event Not Started Yet",
          message: "Province ranking will be available after the competition concludes and results have been processed.",
          color: "text-blue-600"
        };
      case 'ongoing':
        return {
          icon: <Calendar className="w-16 h-16 mx-auto mb-4 text-orange-400" />,
          title: "Competition in Progress",
          message: "Province ranking will be available after the competition concludes and results have been processed.",
          color: "text-orange-600"
        };
      case 'completed':
        return {
          icon: <Info className="w-16 h-16 mx-auto mb-4 text-gray-400" />,
          title: "Data Not Updated Yet",
          message: "Competition has concluded. Admin team is currently processing and verifying results. Province ranking will be available soon.",
          color: "text-gray-600"
        };
      default:
        return {
          icon: <Info className="w-16 h-16 mx-auto mb-4 text-gray-400" />,
          title: "Competition Information",
          message: "Province ranking will be available after the competition concludes and results have been processed.",
          color: "text-gray-600"
        };
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          <p className="mt-4 text-gray-600">Loading province rankings...</p>
        </div>
      </div>
    );
  }

  // Show status message if no data available
  if (!provinceData || provinceData.length === 0) {
    const statusInfo = getStatusMessage();
    
    return (
      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Province Medal Ranking</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <div className="flex flex-col items-center">
                {statusInfo.icon}
                <h2 className={`text-xl font-bold mb-4 ${statusInfo.color}`}>
                  {statusInfo.title}
                </h2>
                <p className="text-gray-600 max-w-md">
                  {statusInfo.message}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Sort data again just in case
  const sortedData = [...provinceData].sort((a, b) => {
    if (b.gold !== a.gold) return b.gold - a.gold;
    if (b.silver !== a.silver) return b.silver - a.silver;
    return b.bronze - a.bronze;
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3 justify-center">
          <Trophy className="text-yellow-500 w-10 h-10" /> Province Medal Ranking
        </h1>

        {/* Competition Status Info */}
        {competitionInfo && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-800">{competitionInfo.name}</h3>
                <p className="text-sm text-blue-600">
                  {new Date(competitionInfo.start_date).toLocaleDateString('en-US')} - {new Date(competitionInfo.end_date).toLocaleDateString('en-US')}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {sortedData.map((provinceData, index) => {
            // Define custom styles for Olympic-style ranking
            let style;
            if (index === 0) {
              style = {
                bg: "bg-gradient-to-r from-yellow-100 via-yellow-200 to-yellow-300",
                border: "border-yellow-400",
                shadow: "shadow-lg",
                text: "text-yellow-700",
              };
            } else if (index === 1) {
              style = {
                bg: "bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300",
                border: "border-gray-400",
                shadow: "shadow-md",
                text: "text-gray-700",
              };
            } else if (index === 2) {
              style = {
                bg: "bg-gradient-to-r from-amber-200 via-amber-300 to-amber-400",
                border: "border-amber-500",
                shadow: "shadow-md",
                text: "text-amber-800",
              };
            } else {
              style = {
                bg: "bg-gradient-to-r from-blue-50 via-blue-100 to-blue-200",
                border: "border-blue-300",
                shadow: "shadow-sm",
                text: "text-blue-700",
              };
            }

            return (
              <div
                key={`${provinceData.province}-${index}`}
                className={`${style.bg} border ${style.border} ${style.shadow} rounded-xl p-6 flex flex-col md:flex-row justify-between gap-4 transition-transform transform hover:scale-105`}
              >
                <div className="flex items-center gap-4 md:gap-6 justify-center md:justify-start text-center md:text-left">
                  <div className={`font-extrabold text-3xl md:text-4xl ${style.text} flex items-center gap-2`}>
                    {index === 0 && <span className="text-4xl">🥇</span>}
                    {index === 1 && <span className="text-4xl">🥈</span>}
                    {index === 2 && <span className="text-4xl">🥉</span>}
                    {index >= 3 && <span className="text-4xl">🏅</span>}
                    #{index + 1}
                  </div>
                  <div className="break-words max-w-[200px] md:max-w-none">
                    <h2 className="text-xl md:text-2xl font-bold">{provinceData.province}</h2>
                  </div>
                </div>

                <div className="flex flex-col items-center md:items-end text-center md:text-right w-full md:w-auto">
                  <div className="flex flex-wrap justify-center md:justify-end gap-4 text-lg md:text-xl font-semibold">
                    <div className="flex flex-col items-center gap-1 text-yellow-500">
                      <div className="flex items-center gap-1">
                        <Medal size={28} strokeWidth={2.5} />
                        <span className="font-bold text-lg md:text-xl">{provinceData.gold}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-1 text-gray-400">
                      <div className="flex items-center gap-1">
                        <Medal size={24} strokeWidth={2.2} />
                        <span className="font-bold text-lg md:text-xl">{provinceData.silver}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-1 text-amber-700">
                      <div className="flex items-center gap-1">
                        <Medal size={22} strokeWidth={2} />
                        <span className="font-bold text-lg md:text-xl">{provinceData.bronze}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-sm text-gray-600 mt-2 md:mt-1">
                    Total Medals: {provinceData.total}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
