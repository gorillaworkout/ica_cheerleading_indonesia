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
        });
      }

      const provinceData = provinceMap.get(province)!;

      if (placement === 1) provinceData.gold += 1;
      else if (placement === 2) provinceData.silver += 1;
      else if (placement === 3) provinceData.bronze += 1;
    });
  });

  return [...provinceMap.values()].sort((a, b) => {
    if (b.gold !== a.gold) return b.gold - a.gold;
    if (b.silver !== a.silver) return b.silver - a.silver;
    return b.bronze - a.bronze;
  });
};

const cardStyles = [
  {
    bg: "bg-gradient-to-r from-yellow-100 via-yellow-200 to-yellow-300",
    border: "border-yellow-400",
    shadow: "shadow-lg",
    text: "text-yellow-700",
  },
  {
    bg: "bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300",
    border: "border-gray-400",
    shadow: "shadow-md",
    text: "text-gray-700",
  },
  {
    bg: "bg-gradient-to-r from-amber-100 via-amber-200 to-amber-300",
    border: "border-amber-400",
    shadow: "shadow-md",
    text: "text-amber-700",
  },
];

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
            const style = cardStyles[index] || {
              bg: "bg-white",
              border: "border-gray-200",
              shadow: "shadow-sm",
              text: "text-gray-700",
            };

            return (
              <div
                key={provinceData.province}
                className={`${style.bg} border ${style.border} ${style.shadow} rounded-xl p-6 flex items-center justify-between transition-transform transform hover:scale-105`}
              >
                <div className="flex items-center gap-6">
                  <div className={`font-extrabold text-4xl ${style.text}`}>
                    #{index + 1}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{provinceData.province}</h2>
                    {/* <p className="text-sm text-gray-700">
                      {provinceData.gold} Gold, {provinceData.silver} Silver, {provinceData.bronze} Bronze
                    </p> */}
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xl font-semibold">
                  <div className="flex items-center gap-2 text-yellow-500">
                    <Medal className="text-yellow-500" size={28} strokeWidth={2.5} />
                    {provinceData.gold}
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Medal className="text-gray-400" size={24} strokeWidth={2.2} />
                    {provinceData.silver}
                  </div>
                  <div className="flex items-center gap-2 text-amber-700">
                    <Medal className="text-amber-700" size={22} strokeWidth={2} />
                    {provinceData.bronze}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
