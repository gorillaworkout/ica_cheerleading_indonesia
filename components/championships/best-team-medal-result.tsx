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

const getTopTeams = (data: MockResults) => {
  const teamMap = new Map<string, { gold: number; silver: number; bronze: number }>();

  Object.values(data).flat().forEach((division) => {
    division.results.forEach(({ team, placement }) => {
      if (!teamMap.has(team)) {
        teamMap.set(team, { gold: 0, silver: 0, bronze: 0 });
      }
      const teamData = teamMap.get(team)!;
      if (placement === 1) teamData.gold += 1;
      else if (placement === 2) teamData.silver += 1;
      else if (placement === 3) teamData.bronze += 1;
    });
  });

  return [...teamMap.entries()]
    .map(([team, stats]) => ({
      team,
      ...stats,
      total: stats.gold + stats.silver + stats.bronze,
    }))
    .sort((a, b) => {
      if (b.gold !== a.gold) return b.gold - a.gold;
      if (b.silver !== a.silver) return b.silver - a.silver;
      return b.bronze - a.bronze;
    })
    .slice(0, 3);
};

export default function BestTeamRanking() {
  const topTeams = getTopTeams(mockResults);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3 justify-center">
          <Trophy className="text-yellow-500 w-10 h-10" /> Top 3 Teams with Most Medals
        </h1>

        <div className="space-y-6">
          {topTeams.map((teamData, index) => {
            // Define custom styles for Olympic-style ranking (Top 3 teams only)
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
            } else {
              // 🥉 Bronze - Rank 3
              style = {
                bg: "bg-gradient-to-r from-amber-200 via-amber-300 to-amber-400",
                border: "border-amber-500",
                shadow: "shadow-md",
                text: "text-amber-800",
              };
            }

            return (
              <div
                key={teamData.team}
                className={`${style.bg} border ${style.border} ${style.shadow} rounded-xl p-6 flex flex-col md:flex-row justify-between gap-4 transition-transform transform hover:scale-105`}
              >
                <div className="flex items-center gap-4 md:gap-6 justify-center md:justify-start text-center md:text-left w-full md:w-auto">
                  <div className={`font-extrabold text-3xl md:text-4xl ${style.text} flex items-center gap-2`}>
                    {index === 0 && <span className="text-4xl">🥇</span>}
                    {index === 1 && <span className="text-4xl">🥈</span>}
                    {index === 2 && <span className="text-4xl">🥉</span>}
                    #{index + 1}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl md:text-2xl font-bold break-words">
                      {teamData.team}
                    </h2>
                  </div>
                </div>

                <div className="flex flex-col items-center md:items-end text-center md:text-right w-full md:w-auto">
                  <div className="flex flex-wrap justify-center md:justify-end gap-4 font-semibold text-lg md:text-xl">
                    <div className="flex flex-col items-center gap-1 text-yellow-500">
                      <div className="flex items-center gap-1">
                        <Medal size={28} strokeWidth={2.5} />
                        {teamData.gold}
                      </div>
                      {/* <div className="text-xs text-gray-500">Gold</div> */}
                    </div>
                    <div className="flex flex-col items-center gap-1 text-gray-400">
                      <div className="flex items-center gap-1">
                        <Medal size={24} strokeWidth={2.2} />
                        {teamData.silver}
                      </div>
                      {/* <div className="text-xs text-gray-500">Silver</div> */}
                    </div>
                    <div className="flex flex-col items-center gap-1 text-amber-700">
                      <div className="flex items-center gap-1">
                        <Medal size={22} strokeWidth={2} />
                        {teamData.bronze}
                      </div>
                      {/* <div className="text-xs text-gray-500">Bronze</div> */}
                    </div>
                  </div>

                  <span className="text-sm text-gray-600 mt-2 md:mt-1">
                    Total Medals: {teamData.total}
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
