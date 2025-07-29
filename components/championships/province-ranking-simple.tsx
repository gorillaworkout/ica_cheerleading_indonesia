"use client"

import React, { useEffect, useState } from "react";
import { Trophy, Medal } from "lucide-react";

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

export default function ProvinceRankingSimple() {
  const [mounted, setMounted] = useState(false);
  const [provinceData, setProvinceData] = useState<ProvinceStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  // Get provinces from Redux store safely
  const provinces = useAppSelector ? useAppSelector((state: any) => state.provinces.provinces) : [];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !supabase) {
      setError("Supabase not available");
      setLoading(false);
      return;
    }

    if (!useAppSelector) {
      setError("Redux not available");
      setLoading(false);
      return;
    }

    async function fetchSupabaseData() {
      setLoading(true);
      setError(null);
      
      try {

        
        // Fetch results with more detailed logging
        const { data: resultsData, error: resultsError } = await supabase
          .from("results")
          .select("division, placement, team, score, province")
          .order("division", { ascending: true })
          .order("placement", { ascending: true });
        if (resultsError) {
          console.error("❌ Error fetching results:", resultsError);
          setError(`Error fetching results: ${resultsError.message}`);
          return;
        }

        if (!resultsData || resultsData.length === 0) {
          console.warn("⚠️ No results data found in database");
          setError("No competition results found in database");
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



        // Enhanced debug info for UI display
        setDebugInfo({
          resultsCount: resultsData?.length || 0,
          resultsError: resultsError?.message || null,
          sampleResult: resultsData?.[0] || null,
          provincesCount: provinces.length || 0,
          provinceMapping: combinedMapping,
          uniqueProvinceCodesInResults: [...new Set(resultsData?.map((r: any) => r.province))].slice(0, 10)
        });



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

          setError("No ranking data could be calculated");
        }
      } catch (err) {
        console.error("❌ Unexpected error:", err);
        setError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    }

    fetchSupabaseData();
  }, [mounted, provinces]);

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

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-red-500 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-red-400" />
            <h2 className="text-xl font-bold mb-2">Error Loading Rankings</h2>
            <p className="mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!provinceData || provinceData.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Trophy className="text-gray-400 w-16 h-16 mb-4" />
          <h2 className="text-xl font-bold text-gray-600 mb-2">No Rankings Available</h2>
          <p className="text-gray-500">Competition results will appear here after events are completed.</p>
          <p className="text-gray-400 text-sm mt-2">Check back later for updated rankings!</p>
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

        {/* Debug Info */}
        {/* {debugInfo && (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-bold mb-2">Debug Information:</h3>
            <pre className="text-xs overflow-auto max-h-40">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )} */}

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
