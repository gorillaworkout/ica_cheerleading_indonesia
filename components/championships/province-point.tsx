import React from "react";
import { Trophy, Medal } from "lucide-react";
import { mockResults } from "@/utils/dummyChampionship";
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

interface MockResults {
  [key: string]: DivisionResult[];
}

type ProvinceStats = {
  province: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
};

const getProvincePoints = (data: MockResults): ProvinceStats[] => {
  const provinceMap = new Map<string, ProvinceStats>();

  Object.values(data).flat().forEach((division) => {
    division.results.forEach(({ province, placement }) => {
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


export default function ProvinceRankingPage() {
  const provinceRanking = getProvincePoints(mockResults);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3 justify-center">
          <Trophy className="text-yellow-500 w-10 h-10" /> Province Medal Ranking
        </h1>

        <div className="space-y-6">
          {provinceRanking.map((provinceData, index) => {
            // Define custom styles for Olympic-style ranking
            let style;
            if (index === 0) {
              // 🥇 Gold - Rank 1
              style = {
                bg: "bg-gradient-to-r from-yellow-100 via-yellow-200 to-yellow-300",
                border: "border-yellow-400",
                shadow: "shadow-lg",
                text: "text-yellow-700",
              };
            } else if (index === 1) {
              // 🥈 Silver - Rank 2
              style = {
                bg: "bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300",
                border: "border-gray-400",
                shadow: "shadow-md",
                text: "text-gray-700",
              };
            } else if (index === 2) {
              // 🥉 Bronze - Rank 3
              style = {
                bg: "bg-gradient-to-r from-amber-200 via-amber-300 to-amber-400",
                border: "border-amber-500",
                shadow: "shadow-md",
                text: "text-amber-800",
              };
            } else {
              // 🏅 Other ranks - Blue gradient
              style = {
                bg: "bg-gradient-to-r from-blue-50 via-blue-100 to-blue-200",
                border: "border-blue-300",
                shadow: "shadow-sm",
                text: "text-blue-700",
              };
            }

            return (
              <div
                key={provinceData.province}
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
