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
  totalPoints: number;
  gold: number;
  silver: number;
  bronze: number;
};

const getProvincePoints = (data: MockResults): ProvinceStats[] => {
  const provinceMap = new Map<
    string,
    { totalPoints: number; gold: number; silver: number; bronze: number }
  >();

  Object.values(data).flat().forEach((division) => {
    division.results.forEach(({ province, placement }) => {
      const points = placement === 1 ? 3 : placement === 2 ? 2 : placement === 3 ? 1 : 0;

      if (!provinceMap.has(province)) {
        provinceMap.set(province, { totalPoints: 0, gold: 0, silver: 0, bronze: 0 });
      }

      const provinceData = provinceMap.get(province)!;
      provinceData.totalPoints += points;
      if (placement === 1) provinceData.gold += 1;
      if (placement === 2) provinceData.silver += 1;
      if (placement === 3) provinceData.bronze += 1;
    });
  });

  return [...provinceMap.entries()]
    .map(([province, stats]) => ({
      province,
      ...stats,
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints);
};

const cardStyles = [
  {
    bg: "bg-gradient-to-r from-yellow-100 via-yellow-200 to-yellow-300",
    border: "border-yellow-400",
    shadow: "shadow-lg",
    text: "text-yellow-700",
    iconColor: "text-yellow-500",
    iconSize: 40,
  },
  {
    bg: "bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300",
    border: "border-gray-400",
    shadow: "shadow-md",
    text: "text-gray-700",
    iconColor: "text-gray-400",
    iconSize: 32,
  },
  {
    bg: "bg-gradient-to-r from-amber-100 via-amber-200 to-amber-300",
    border: "border-amber-400",
    shadow: "shadow-md",
    text: "text-amber-700",
    iconColor: "text-amber-600",
    iconSize: 28,
  },
];

export default function ProvinceRankingPage() {
  const provinceRanking = getProvincePoints(mockResults);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3 justify-center">
          <Trophy className="text-yellow-500 w-10 h-10" /> Province Medal Points Ranking
        </h1>

        <p className="mb-6 text-center text-sm text-gray-600">
          Gold = 3 points, Silver = 2 points, Bronze = 1 point
        </p>

        <div className="space-y-6">
          {provinceRanking.map((provinceData, index) => {
            const style = cardStyles[index] || {
              bg: "bg-white",
              border: "border-gray-200",
              shadow: "shadow-sm",
              text: "text-gray-700",
              iconColor: "text-gray-300",
              iconSize: 24,
            };

            return (
              <div
                key={provinceData.province}
                className={`${style.bg} border ${style.border} ${style.shadow} rounded-xl p-6 flex items-center justify-between transition-transform transform hover:scale-105`}
              >
                <div className="flex items-center gap-6">
                  <div className={`font-extrabold text-4xl ${style.text}`}>#{index + 1}</div>
                  <div>
                    <h2 className="text-2xl font-bold">{provinceData.province}</h2>
                    <p className="text-sm text-gray-700">
                      {provinceData.gold} Gold, {provinceData.silver} Silver, {provinceData.bronze} Bronze
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Medal
                    className={style.iconColor}
                    size={style.iconSize}
                    strokeWidth={2.5}
                  />
                  <span className="font-bold text-2xl">{provinceData.totalPoints} pts</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
