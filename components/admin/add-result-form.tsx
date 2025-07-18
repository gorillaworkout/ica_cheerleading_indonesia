"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

interface Competition {
  id: string;
  name: string;
}

interface Division {
  name: string;
}

interface Province {
  id_province: string;
  name: string;
}

interface PlacementScore {
  placement: string;
  score: string;
  team?: string; // Added optional team field
  province?: string; // Added optional province field
}

interface DivisionResult {
  placement: number;
  team: string;
  score: number;
  province: string;
}

export const mockResults2: Record<string, any[]> = {};

export default function AddResultsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [placementScores, setPlacementScores] = useState<PlacementScore[]>([
    { placement: "", score: "" },
  ]);
  const [formData, setFormData] = useState({
    competitionId: "",
    division: "",
    team: "",
    province: "",
  });
  const [results, setResults] = useState<Record<string, any[]>>({});

  // Ensure fetchResults is defined before calling it
  async function fetchResults() {
    const { data, error } = await supabase.from("results").select("*");

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    const groupedResults = data.reduce(
      (acc: Record<string, any[]>, result) => {
        if (!acc[result.competition_id]) {
          acc[result.competition_id] = [];
        }

        const divisionIndex = acc[result.competition_id].findIndex(
          (entry) => entry.division === result.division
        );

        if (divisionIndex !== -1) {
          acc[result.competition_id][divisionIndex].results.push(result);
        } else {
          acc[result.competition_id].push({
            division: result.division,
            results: [result],
          });
        }

        return acc;
      },
      {}
    );

    setResults(groupedResults);
  }

  useEffect(() => {
    async function fetchCompetitions() {
      const { data, error } = await supabase
        .from("competitions")
        .select("id, name")
        .eq("registration_open", true);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }

      if (data && data.length > 0) {
        setCompetitions(data);
        setFormData((prev) => ({ ...prev, competitionId: data[0].id }));
      }
    }

    async function fetchDivisions() {
      const { data, error } = await supabase
        .from("divisions")
        .select("name")
        .order("queue", { ascending: true });

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }

      setDivisions(data || []);
    }

    async function fetchProvinces() {
      const { data, error } = await supabase
        .from("provinces")
        .select("id_province, name")
        .order("id_province", { ascending: true });

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }

      setProvinces(data || []);
    }

    fetchCompetitions();
    fetchDivisions();
    fetchProvinces();
    fetchResults();
  }, []);

  useEffect(() => {
    if (formData.competitionId && formData.division) {
      const existingDivision = mockResults2[formData.competitionId]?.find(
        (entry) => entry.division === formData.division
      );

      if (existingDivision) {
        setPlacementScores(
          existingDivision.results.map((result: DivisionResult) => ({
            placement: result.placement.toString(),
            score: result.score.toString(),
            team: result.team,
            province: result.province,
          }))
        );
      } else {
        setPlacementScores([{ placement: "", score: "" }]);
      }
    }
  }, [formData.competitionId, formData.division]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlacementScoreChange = (index: number, field: keyof PlacementScore, value: string) => {
    setPlacementScores((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const addPlacementScore = () => {
    if (placementScores.length < 3) {
      setPlacementScores((prev) => [...prev, { placement: "", score: "" }]);
    }
  };

  const getAvailablePlacements = (index: number) => {
    const usedPlacements = placementScores
      .map((ps, i) => (i !== index ? ps.placement : null))
      .filter((p) => p !== null);
    return ["1", "2", "3"].filter((p) => !usedPlacements.includes(p));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { competitionId, division } = formData;

    if (!competitionId || !division || placementScores.some((ps) => !ps.placement || !ps.score || !ps.team || !ps.province)) {
      toast({ title: "Error", description: "All fields are required.", variant: "destructive" });
      return;
    }

    // Validate placement scores
    const sortedScores = [...placementScores].sort((a, b) => parseInt(a.placement, 10) - parseInt(b.placement, 10));

    // Ensure single data has placement 1
    if (placementScores.length === 1 && placementScores[0].placement !== "1") {
      toast({
        title: "Error",
        description: "If there is only one result, the placement must be 1.",
        variant: "destructive",
      });
      return;
    }

    for (let i = 1; i < sortedScores.length; i++) {
      if (parseFloat(sortedScores[i].score) > parseFloat(sortedScores[i - 1].score)) {
        toast({
          title: "Error",
          description: `Placement ${sortedScores[i].placement} cannot have a higher score than Placement ${sortedScores[i - 1].placement}.`,
          variant: "destructive",
        });
        return;
      }
    }

    const results = placementScores.map((ps) => ({
      competition_id: competitionId,
      division,
      placement: parseInt(ps.placement, 10),
      team: ps.team || "",
      score: parseFloat(ps.score),
      province: ps.province || "",
    }));

    // Delete existing results for the same competition and division
    const { error: deleteError } = await supabase
      .from("results")
      .delete()
      .eq("competition_id", competitionId)
      .eq("division", division);

    if (deleteError) {
      toast({ title: "Error", description: deleteError.message, variant: "destructive" });
      return;
    }

    // Insert new results
    const { error: insertError } = await supabase.from("results").insert(results);

    if (insertError) {
      toast({ title: "Error", description: insertError.message, variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Results added successfully." });

    setFormData({
      competitionId: "",
      division: "",
      team: "",
      province: "",
    });
    setPlacementScores([{ placement: "", score: "" }]);
    fetchResults();
  };

  return (
    <>
      <div className="max-w-4xl p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-3xl font-bold mb-6 text-left text-gray-800">
          Add Competition Results
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label
              htmlFor="competitionId"
              className="text-gray-700 font-medium"
            >
              Competition
            </Label>
            <Select
              value={formData.competitionId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, competitionId: value }))
              }
            >
              <SelectTrigger className="w-full border-gray-300">
                <SelectValue placeholder="Select a competition" />
              </SelectTrigger>
              <SelectContent>
                {competitions.map((comp) => (
                  <SelectItem key={comp.id} value={comp.id}>
                    {comp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="division" className="text-gray-700 font-medium">
              Division
            </Label>
            <Select
              value={formData.division}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, division: value }))
              }
            >
              <SelectTrigger className="w-full border-gray-300">
                <SelectValue placeholder="Select a division" />
              </SelectTrigger>
              <SelectContent>
                {divisions.map((div) => (
                  <SelectItem key={div.name} value={div.name}>
                    {div.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-gray-700 font-medium">
              Placements, Scores, and Team Details
            </Label>
            {placementScores.map((ps, index) => (
              <div key={index} className="p-4 border rounded-lg mb-4">
                <div className="mb-2">
                  <Label
                    htmlFor={`team-${index}`}
                    className="text-gray-700 font-medium"
                  >
                    Team Name
                  </Label>
                  <Input
                    type="text"
                    name={`team-${index}`}
                    placeholder="Enter team name"
                    value={ps.team || ""}
                    onChange={(e) =>
                      handlePlacementScoreChange(index, "team", e.target.value)
                    }
                    className="w-full border-gray-300"
                  />
                </div>
                <div className="mb-2">
                  <Label
                    htmlFor={`province-${index}`}
                    className="text-gray-700 font-medium"
                  >
                    Province
                  </Label>
                  <Select
                    value={ps.province || ""}
                    onValueChange={(value) =>
                      handlePlacementScoreChange(index, "province", value)
                    }
                  >
                    <SelectTrigger className="w-full border-gray-300">
                      <SelectValue placeholder="Select a province" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((province) => (
                        <SelectItem key={province.id_province} value={province.id_province}>
                          {province.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-4 items-center">
                  <div className="w-1/2">
                    <Label
                      htmlFor={`placement-${index}`}
                      className="text-gray-700 font-medium"
                    >
                      Placement
                    </Label>
                    <Select
                      value={ps.placement}
                      onValueChange={(value) =>
                        handlePlacementScoreChange(index, "placement", value)
                      }
                    >
                      <SelectTrigger className="w-full border-gray-300">
                        <SelectValue placeholder="Select placement" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailablePlacements(index).map((placement) => (
                          <SelectItem key={placement} value={placement}>
                            {placement}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-1/2">
                    <Label
                      htmlFor={`score-${index}`}
                      className="text-gray-700 font-medium"
                    >
                      Score
                    </Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Score"
                      value={ps.score}
                      onChange={(e) =>
                        handlePlacementScoreChange(index, "score", e.target.value)
                      }
                      className="w-full border-gray-300"
                    />
                  </div>
                </div>
              </div>
            ))}
            {placementScores.length < 3 && (
              <Button
                type="button"
                onClick={addPlacementScore}
                className="mt-2 bg-blue-500 hover:bg-blue-600 text-white"
              >
                Add Placement
              </Button>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Add Result
          </Button>
        </form>
      </div>

      <div className="mt-10 max-w-4xl p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-3xl font-bold mb-6 text-left text-gray-800">
          Competition Results
        </h1>
        {Object.entries(results).map(([competitionId, divisions]) => {
          const competition = competitions.find((comp) => comp.id === competitionId);
          return (
            <div key={competitionId} className="mb-6 p-4 border rounded-lg shadow-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">
                  {competition ? competition.name : "Unknown Competition"}
                </h2>
                <Button
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={() => {
                    const firstDivision = results[competitionId]?.[0]?.division || "";
                    const firstResult = results[competitionId]?.[0]?.results[0];

                    setFormData({
                      competitionId,
                      division: firstDivision,
                      team: firstResult?.team || "",
                      province: firstResult?.province || "",
                    });

                    setPlacementScores(
                      results[competitionId]?.find((division: any) => division.division === firstDivision)?.results.map((result: any) => ({
                        placement: result.placement?.toString() || "",
                        score: result.score?.toString() || "",
                        team: result.team || "",
                        province: result.province || "",
                      })) || [{ placement: "", score: "", team: "", province: "" }]
                    );
                  }}
                >
                  Edit
                </Button>
              </div>
              <Accordion type="single" collapsible>
                {divisions.map((division: any, index: number) => (
                  <AccordionItem key={index} value={`division-${index}`}>
                    <AccordionTrigger>{division.division}</AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2">
                        {division.results.map((result: any, idx: number) => {
                          const province = provinces.find((prov) => prov.id_province === result.province);
                          return (
                            <li key={idx} className="p-4 border rounded-lg bg-gray-100">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-lg">Placement {result.placement}</span>
                                <span className="text-sm text-gray-600">{province ? province.name : "Unknown Province"}</span>
                              </div>
                              <div className="mt-2">
                                <p className="text-gray-800 font-medium">Team: {result.team}</p>
                                <p className="text-gray-800">Score: {result.score} points</p>
                              </div>
                              <div className="flex justify-end mt-4">
                                <Button
                                  className="bg-red-500 hover:bg-red-600 text-white"
                                  onClick={async () => {
                                    const { error } = await supabase
                                      .from("results")
                                      .delete()
                                      .eq("id", result.id);
                                    if (error) {
                                      toast({
                                        title: "Error",
                                        description: error.message,
                                        variant: "destructive",
                                      });
                                    } else {
                                      toast({
                                        title: "Success",
                                        description: "Result deleted successfully.",
                                      });
                                      fetchResults();
                                    }
                                  }}
                                >
                                  Delete
                                </Button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          );
        })}
      </div>
    </>
  );
}
