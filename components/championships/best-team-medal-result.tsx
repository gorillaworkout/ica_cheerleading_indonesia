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

const getTopTeams = (data:MockResults) => {
  const teamPointsMap = new Map();

  Object.values(data).flat().forEach((division) => {
    division.results.forEach(({ team, placement }) => {
      const points = placement === 1 ? 3 : placement === 2 ? 2 : placement === 3 ? 1 : 0;
      if (!teamPointsMap.has(team)) {
        teamPointsMap.set(team, { gold: 0, silver: 0, bronze: 0, totalPoints: 0 });
      }
      const teamData = teamPointsMap.get(team);
      if (placement === 1) teamData.gold += 1;
      if (placement === 2) teamData.silver += 1;
      if (placement === 3) teamData.bronze += 1;
      teamData.totalPoints += points;
    });
  });

  return [...teamPointsMap.entries()]
    .map(([team, stats]) => ({ team, ...stats }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 3);
};

const cardStyles = [
  {
    bg: "bg-gradient-to-r from-yellow-100 via-yellow-200 to-yellow-300",
    border: "border-yellow-400",
    shadow: "shadow-lg",
    iconColor: "text-yellow-500",
    iconSize: 12,
  },
  {
    bg: "bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300",
    border: "border-gray-400",
    shadow: "shadow-md",
    iconColor: "text-gray-500",
    iconSize: 10,
  },
  {
    bg: "bg-gradient-to-r from-amber-100 via-amber-200 to-amber-300",
    border: "border-amber-400",
    shadow: "shadow-md",
    iconColor: "text-amber-600",
    iconSize: 9,
  },
];
export default function BestTeamRanking() {
  const topTeams = getTopTeams(mockResults);

  return (
    <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3 justify-center">
                <Trophy className="text-yellow-500 w-10 h-10" /> Top 3 Teams with Most Medals
            </h1>

            <p className="mb-6 text-center text-sm text-gray-600">
                Gold = 3 points, Silver = 2 points, Bronze = 1 point
            </p>

            <div className="space-y-6">
                {topTeams.map((team, index) => {
                const style = cardStyles[index] || cardStyles[2];

                return (
                    <div
                    key={team.team}
                    className={`${style.bg} border ${style.border} ${style.shadow} rounded-xl p-6 flex items-center justify-between transition-transform transform hover:scale-105`}
                    >
                    <div className="flex items-center gap-6">
                        <div
                        className={`font-extrabold text-5xl ${
                            index === 0 ? "text-yellow-600" : index === 1 ? "text-gray-600" : "text-amber-700"
                        }`}
                        >
                        #{index + 1}
                        </div>
                        <div>
                        <h2 className="text-2xl font-bold">{team.team}</h2>
                        <p className="text-sm text-gray-700">
                            {team.gold} Gold, {team.silver} Silver, {team.bronze} Bronze
                        </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 font-semibold text-xl">
                        {team.gold > 0 && (
                        <Medal
                            className={`${style.iconColor}`}
                            size={style.iconSize * 6}
                            strokeWidth={2.5}
                        />
                        )}
                        {team.silver > 0 && (
                        <Medal
                            className="text-gray-400"
                            size={style.iconSize * 4}
                            strokeWidth={2}
                        />
                        )}
                        {team.bronze > 0 && (
                        <Medal
                            className="text-amber-700"
                            size={style.iconSize * 3}
                            strokeWidth={2}
                        />
                        )}
                        <span>{team.totalPoints} pts</span>
                    </div>
                    </div>
                );
                })}
            </div>
        </div>
    </div>
  );
}
