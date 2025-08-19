"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editModalCompetitionId, setEditModalCompetitionId] = useState<string>("");
  const [editModalDivision, setEditModalDivision] = useState<string>("");
  const [editModalRows, setEditModalRows] = useState<Array<{ team: string; province: string; score: string }>>([]);
  const [filteredDivisions, setFilteredDivisions] = useState<Division[]>([]);

  const handleEditRowChange = (index: number, field: "team" | "province" | "score", value: string) => {
    setEditModalRows(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value } as any;
      return next;
    });
  };

  const addEditRow = () => {
    if (editModalRows.length < 3) {
      setEditModalRows(prev => [...prev, { team: "", province: "", score: "" }]);
    }
  };

  const handleSaveDivisionEdit = async () => {
    if (!editModalCompetitionId || !editModalDivision) {
      toast({ title: "Error", description: "Competition and Division are required.", variant: "destructive" });
      return;
    }
    if (editModalRows.length === 0 || editModalRows.some(r => !r.team || !r.province || !r.score)) {
      toast({ title: "Error", description: "Team, Province, dan Score wajib diisi.", variant: "destructive" });
      return;
    }

    const recalculated = [...editModalRows]
      .map(r => ({ team: r.team, province: r.province, score: parseFloat(r.score) }))
      .filter(r => !Number.isNaN(r.score))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item, idx) => ({
        competition_id: editModalCompetitionId,
        division: editModalDivision,
        placement: idx + 1,
        team: item.team,
        score: item.score,
        province: item.province,
      }));

    const { error: deleteError } = await supabase
      .from("results")
      .delete()
      .eq("competition_id", editModalCompetitionId)
      .eq("division", editModalDivision);
    if (deleteError) {
      toast({ title: "Error", description: deleteError.message, variant: "destructive" });
      return;
    }

    const { error: insertError } = await supabase.from("results").insert(recalculated);
    if (insertError) {
      toast({ title: "Error", description: insertError.message, variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Division results updated." });
    setEditModalOpen(false);
    setEditModalCompetitionId("");
    setEditModalDivision("");
    setEditModalRows([]);
    fetchResults();
  };

  // Function to recalculate placements after deletion
  const recalculatePlacements = async (competitionId: string, division: string) => {
    try {
      console.log("🔄 Recalculating placements for:", competitionId, division);
      
      // Fetch remaining results for this division
      const { data: remainingResults, error: fetchError } = await supabase
        .from("results")
        .select("*")
        .eq("competition_id", competitionId)
        .eq("division", division)
        .order("score", { ascending: false });

      if (fetchError) {
        console.error("❌ Error fetching remaining results:", fetchError);
        return;
      }

      console.log("📊 Remaining results:", remainingResults);

      if (remainingResults && remainingResults.length > 0) {
        // Create batch update data
        const updateData = remainingResults.map((result, index) => ({
          id: result.id,
          placement: index + 1
        }));

        console.log("🔄 Updates to apply:", updateData);

        // Update each result individually for better reliability
        for (const update of updateData) {
          const { error: updateError } = await supabase
            .from("results")
            .update({ placement: update.placement })
            .eq("id", update.id);

          if (updateError) {
            console.error("❌ Error updating placement:", updateError);
          } else {
            console.log("✅ Updated result", update.id, "to placement", update.placement);
          }
        }
        
        console.log("✅ All placements updated successfully");
        
        // Verify the update was successful by fetching again
        await new Promise(resolve => setTimeout(resolve, 200));
        const { data: verifyData } = await supabase
          .from("results")
          .select("placement")
          .eq("competition_id", competitionId)
          .eq("division", division)
          .order("placement", { ascending: true });
          
        console.log("🔍 Verification data:", verifyData);
        
      } else {
        console.log("ℹ️ No remaining results to update");
      }
    } catch (error) {
      console.error("❌ Unexpected error in recalculatePlacements:", error);
    }
  };

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

    // Sort results within each division by placement to ensure consistent order
    Object.keys(groupedResults).forEach(competitionId => {
      groupedResults[competitionId].forEach(division => {
        division.results.sort((a: any, b: any) => a.placement - b.placement);
      });
    });

    // Sort competitions by name (alphabetical) to ensure consistent render order
    const sortedCompetitionIds = Object.keys(groupedResults).sort((a, b) => {
      const compA = competitions.find(c => c.id === a);
      const compB = competitions.find(c => c.id === b);
      const nameA = compA?.name || '';
      const nameB = compB?.name || '';
      return nameA.localeCompare(nameB);
    });

    // Create new sorted object
    const sortedResults: Record<string, any[]> = {};
    sortedCompetitionIds.forEach(id => {
      sortedResults[id] = groupedResults[id];
    });

    // Sort divisions within each competition by name for consistent order
    Object.keys(sortedResults).forEach(competitionId => {
      sortedResults[competitionId].sort((a: any, b: any) => {
        const nameA = a.division || '';
        const nameB = b.division || '';
        return nameA.localeCompare(nameB);
      });
    });

    setResults(sortedResults);
  }

  useEffect(() => {
    async function fetchCompetitions() {
      const { data, error } = await supabase
        .from("competitions")
        .select("id, name")
        .eq("registration_open", false);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }

      if (data && data.length > 0) {
        setCompetitions(data);
        setFormData((prev) => ({ ...prev, competitionId: data[0].id }));
        console.log(data, 'data')
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

  // Filter divisions based on selected competition to prevent duplicates
  useEffect(() => {
    if (formData.competitionId) {
      // Get divisions that already have results for this competition
      const existingDivisions = results[formData.competitionId]?.map(d => d.division) || [];
      
      // Filter out divisions that already have results
      const availableDivisions = divisions.filter(div => !existingDivisions.includes(div.name));
      
      setFilteredDivisions(availableDivisions);
      
      // Reset division selection if current division is no longer available
      if (formData.division && !availableDivisions.find(d => d.name === formData.division)) {
        setFormData(prev => ({ ...prev, division: "" }));
      }
    } else {
      setFilteredDivisions([]);
    }
  }, [formData.competitionId, divisions, results]);

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

    if (!competitionId || !division) {
      toast({ title: "Error", description: "Competition and Division are required.", variant: "destructive" });
      return;
    }

    // Check if division already has results for this competition
    const existingResults = results[competitionId]?.find(d => d.division === division);
    if (existingResults && !isEditMode) {
      toast({ 
        title: "Error", 
        description: "This division already has results. Please edit existing results instead.", 
        variant: "destructive" 
      });
      return;
    }

    if (isEditMode) {
      // In edit mode, only validate team, province, score (placement will be recalculated)
      if (placementScores.some((ps) => !ps.score || !ps.team || !ps.province)) {
        toast({ title: "Error", description: "Team, Province, and Score are required for each entry.", variant: "destructive" });
        return;
      }
    } else if (placementScores.some((ps) => !ps.placement || !ps.score || !ps.team || !ps.province)) {
      toast({ title: "Error", description: "All fields are required.", variant: "destructive" });
      return;
    }

    // Build results payload
    let resultsPayload: any[] = [];
    if (isEditMode) {
      // Recalculate placements by score (desc)
      const recalculated = [...placementScores]
        .map((ps) => ({
          team: ps.team || "",
          province: ps.province || "",
          score: parseFloat(ps.score),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((item, idx) => ({
          competition_id: competitionId,
          division,
          placement: idx + 1,
          team: item.team,
          score: item.score,
          province: item.province,
        }));
      resultsPayload = recalculated;
    } else {
      // Validate placement scores order
      const sortedScores = [...placementScores].sort((a, b) => parseInt(a.placement, 10) - parseInt(b.placement, 10));
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
      resultsPayload = placementScores.map((ps) => ({
        competition_id: competitionId,
        division,
        placement: parseInt(ps.placement, 10),
        team: ps.team || "",
        score: parseFloat(ps.score),
        province: ps.province || "",
      }));
    }

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
    const { error: insertError } = await supabase.from("results").insert(resultsPayload);

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
    setIsEditMode(false);
    fetchResults();
  };

  return (
    <>
      <div className="max-w-8xl">
        <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 border-b border-red-200">
            <div className="p-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Add Competition Results</h1>
                  <p className="text-red-100 mt-1">Enter competition results and scores</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Competition Selection */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <Label className="text-gray-800 font-semibold text-lg mb-4 block">
                  Competition Details
                </Label>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="competitionId" className="text-gray-700 font-medium mb-2 block">
                      Competition
                    </Label>
                    <Select
                      value={formData.competitionId}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, competitionId: value }))
                      }
                    >
                      <SelectTrigger className="w-full bg-white border-gray-300 text-gray-900 rounded-xl h-12 hover:border-red-400 focus:border-red-500 focus:ring-red-500/20">
                        <SelectValue placeholder="Select a competition" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        {competitions.map((comp) => (
                          <SelectItem key={comp.id} value={comp.id} className="text-gray-900 focus:bg-red-50">
                            {comp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="division" className="text-gray-700 font-medium mb-2 block">
                      Division
                    </Label>
                    <Select
                      value={formData.division}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, division: value }))
                      }
                    >
                      <SelectTrigger className="w-full bg-white border-gray-300 text-gray-900 rounded-xl h-12 hover:border-red-400 focus:border-red-500 focus:ring-red-500/20">
                        <SelectValue placeholder="Select a division" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200" position="popper" side="bottom" sideOffset={4}>
                        {filteredDivisions.length > 0 ? (
                          filteredDivisions.map((div) => (
                          <SelectItem key={div.name} value={div.name} className="text-gray-900 focus:bg-red-50">
                            {div.name}
                          </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 text-sm text-gray-400 text-center">
                            No available divisions
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Results Entry */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <Label className="text-gray-800 font-semibold text-lg mb-4 block">
                  Placements, Scores, and Team Details
                </Label>
                <div className="space-y-4">
                  {placementScores.map((ps, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label htmlFor={`team-${index}`} className="text-gray-700 font-medium mb-2 block">
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
                            className="w-full bg-white border-gray-300 text-gray-900 rounded-xl h-12 placeholder:text-gray-400 hover:border-red-400 focus:border-red-500 focus:ring-red-500/20"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`province-${index}`} className="text-gray-700 font-medium mb-2 block">
                            Province
                          </Label>
                          <Select
                            value={ps.province || ""}
                            onValueChange={(value) =>
                              handlePlacementScoreChange(index, "province", value)
                            }
                          >
                            <SelectTrigger className="w-full bg-white border-gray-300 text-gray-900 rounded-xl h-12 hover:border-red-400 focus:border-red-500 focus:ring-red-500/20">
                              <SelectValue placeholder="Select a province" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-gray-200">
                              {provinces.map((province) => (
                                <SelectItem key={province.id_province} value={province.id_province} className="text-gray-900 focus:bg-red-50">
                                  {province.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`placement-${index}`} className="text-gray-700 font-medium mb-2 block">
                            Placement
                          </Label>
                          <Select
                            value={ps.placement}
                            onValueChange={(value) =>
                              handlePlacementScoreChange(index, "placement", value)
                            }
                          >
                            <SelectTrigger className="w-full bg-white border-gray-300 text-gray-900 rounded-xl h-12 hover:border-red-400 focus:border-red-500 focus:ring-red-500/20">
                              <SelectValue placeholder="Select placement" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-gray-200">
                              {getAvailablePlacements(index).map((placement) => (
                                <SelectItem key={placement} value={placement} className="text-gray-900 focus:bg-red-50">
                                  #{placement}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor={`score-${index}`} className="text-gray-700 font-medium mb-2 block">
                            Score
                          </Label>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="Enter score"
                            value={ps.score}
                            onChange={(e) =>
                              handlePlacementScoreChange(index, "score", e.target.value)
                            }
                            className="w-full bg-white border-gray-300 text-gray-900 rounded-xl h-12 placeholder:text-gray-400 hover:border-red-400 focus:border-red-500 focus:ring-red-500/20"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {placementScores.length < 3 && (
                    <Button
                      type="button"
                      onClick={addPlacementScore}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 border-0"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Placement
                    </Button>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg border-0"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Add Results
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="mt-10 max-w-8xl">
        <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 border-b border-red-200">
            <div className="p-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Competition Results</h1>
                  <p className="text-red-100 mt-1">Manage and view all competition results</p>
                </div>
              </div>
            </div>
          </div>

          {/* Results Content */}
          <div className="p-6">
            {Object.keys(results).length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Results Yet</h3>
                <p className="text-gray-600">Competition results will appear here once they are added.</p>
              </div>
            ) : (
              <Accordion type="single" collapsible className="space-y-4">
                {Object.entries(results).map(([competitionId, divisions]) => {
                  const competition = competitions.find((comp) => comp.id === competitionId);
                  const totalDivisions = divisions.length;
                  const totalResults = divisions.reduce((sum: number, div: any) => sum + div.results.length, 0);
                  
                  return (
                    <AccordionItem 
                      key={competitionId} 
                      value={competitionId}
                      className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:no-underline group">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                              </svg>
                            </div>
                            <div className="text-left">
                              <h2 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors duration-200">
                                {competition ? competition.name : "Unknown Competition"}
                              </h2>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-sm text-gray-600">
                                  {totalDivisions} {totalDivisions === 1 ? 'Division' : 'Divisions'}
                                </span>
                                <span className="text-sm text-gray-400">•</span>
                                <span className="text-sm text-gray-600">
                                  {totalResults} {totalResults === 1 ? 'Result' : 'Results'}
                                </span>
                              </div>
                            </div>
                          </div>
                          {/* Actions intentionally omitted at competition level */}
                        </div>
                      </AccordionTrigger>
                      
                        <AccordionContent className="px-6 pb-6">
                         <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                           <Accordion type="single" collapsible className="space-y-3">
                             {divisions.map((division: any, index: number) => (
                               <AccordionItem 
                                 key={index} 
                                 value={`division-${index}`}
                                 className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                               >
                                 <AccordionTrigger className="px-4 py-3 hover:no-underline group">
                                   <div className="flex items-center justify-between w-full">
                                     <div className="flex items-center space-x-3">
                                       <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                                         <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                         </svg>
                                       </div>
                                       <div className="text-left">
                                         <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors duration-200">
                                           {division.division}
                                         </h3>
                                         <span className="text-xs text-gray-500">
                                           {division.results.length} {division.results.length === 1 ? 'participant' : 'participants'}
                                         </span>
                                       </div>
                                     </div>
                                   </div>
                                 </AccordionTrigger>
                                 <div className="px-4 pt-2 flex justify-end">
                                   <Button
                                     size="sm"
                                     className="mb-4 border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-colors rounded-lg"
                                     onClick={(e) => {
                                       e.preventDefault();
                                       e.stopPropagation();
                                       setEditModalCompetitionId(competitionId as string);
                                       setEditModalDivision(division.division);
                                       const rows = (division.results || []).map((r: any) => ({
                                         team: r.team ?? "",
                                         province: r.province ?? "",
                                         score: (r.score ?? '').toString(),
                                       }));
                                       setEditModalRows(rows.length ? rows : [{ team: "", province: "", score: "" }]);
                                       setEditModalOpen(true);
                                     }}
                                   >
                                     Edit Division
                                   </Button>
                                 </div>
                                 <AccordionContent className="px-4 pb-4">
                                   <div className="space-y-3">
                                     {division.results.map((result: any, idx: number) => {
                                       const province = provinces.find((prov) => prov.id_province === result.province);
                                       const placementColors = {
                                         1: "from-yellow-500 to-amber-600",
                                         2: "from-gray-400 to-gray-500", 
                                         3: "from-amber-600 to-orange-700"
                                       };
                                       const placementColor = placementColors[result.placement as keyof typeof placementColors] || "from-gray-500 to-gray-600";
                                       
                                       return (
                                         <div key={idx} className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300">
                                           <div className="flex items-center justify-between mb-3">
                                             <div className="flex items-center space-x-3">
                                               <div className={`w-10 h-10 bg-gradient-to-br ${placementColor} rounded-xl flex items-center justify-center shadow-md`}>
                                                 <span className="text-white font-bold text-sm">#{result.placement}</span>
                                               </div>
                                               <div>
                                                 <h4 className="font-bold text-gray-900 text-lg">{result.team}</h4>
                                                 <p className="text-gray-600 text-sm">{province ? province.name : "Unknown Province"}</p>
                                               </div>
                                             </div>
                                             <div className="text-right">
                                               <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg px-3 py-1">
                                                 <span className="text-red-700 font-bold text-lg">{result.score}</span>
                                                 <span className="text-red-600 text-sm ml-1">pts</span>
                                               </div>
                                             </div>
                                           </div>
                                           <div className="flex justify-end gap-2">
                                              <Button
                                                size="sm"
                                                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-lg border-0"
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
                                                    // Recalculate placements after deletion
                                                    await recalculatePlacements(competitionId as string, division.division);
                                                    // Retry fetchResults multiple times to ensure data is updated
                                                    let retryCount = 0;
                                                    const maxRetries = 3;
                                                    
                                                    const retryFetch = async () => {
                                                      await new Promise(resolve => setTimeout(resolve, 300));
                                                      fetchResults();
                                                      
                                                      // Verify if data is correct, if not retry
                                                      setTimeout(async () => {
                                                        const { data: verifyResults } = await supabase
                                                          .from("results")
                                                          .select("placement")
                                                          .eq("competition_id", competitionId)
                                                          .eq("division", division)
                                                          .order("placement", { ascending: true });
                                                        
                                                        const expectedPlacements = verifyResults?.map((_, idx) => idx + 1) || [];
                                                        const actualPlacements = verifyResults?.map(r => r.placement) || [];
                                                        
                                                        if (JSON.stringify(expectedPlacements) !== JSON.stringify(actualPlacements) && retryCount < maxRetries) {
                                                          retryCount++;
                                                          console.log(`🔄 Retry ${retryCount}/${maxRetries} - Data not yet consistent`);
                                                          retryFetch();
                                                        } else {
                                                          console.log("✅ Data is now consistent");
                                                        }
                                                      }, 200);
                                                    };
                                                    
                                                    retryFetch();
                                                  }
                                                }}
                                              >
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Delete
                                              </Button>
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
                       </AccordionContent>
                     </AccordionItem>
                   );
                 })}
               </Accordion>
             )}
           </div>
         </div>
       </div>
       {editModalOpen && (
         <Modal
           title={`Edit Division Results - ${editModalDivision}`}
           onClose={() => setEditModalOpen(false)}
           onSave={handleSaveDivisionEdit}
         >
           <div className="space-y-4">
             {editModalRows.map((row, idx) => (
               <div key={idx} className="grid md:grid-cols-3 gap-4">
                 <div>
                   <Label className="text-gray-700 font-medium mb-2 block">Team</Label>
                   <Input
                     type="text"
                     value={row.team}
                     onChange={(e) => handleEditRowChange(idx, "team", e.target.value)}
                     placeholder="Enter team name"
                     className="bg-white border-gray-300 text-gray-900 rounded-xl h-10"
                   />
                 </div>
                 <div>
                   <Label className="text-gray-700 font-medium mb-2 block">Province</Label>
                   <Select
                     value={row.province}
                     onValueChange={(value) => handleEditRowChange(idx, "province", value)}
                   >
                     <SelectTrigger className="w-full bg-white border-gray-300 text-gray-900 rounded-xl h-10">
                       <SelectValue placeholder="Select a province" />
                     </SelectTrigger>
                     <SelectContent className="bg-white border-gray-200">
                       {provinces.map((province) => (
                         <SelectItem key={province.id_province} value={province.id_province} className="text-gray-900 focus:bg-red-50">
                           {province.name}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
                 <div>
                   <Label className="text-gray-700 font-medium mb-2 block">Score</Label>
                   <Input
                     type="number"
                     step="0.1"
                     value={row.score}
                     onChange={(e) => handleEditRowChange(idx, "score", e.target.value)}
                     placeholder="Enter score"
                     className="bg-white border-gray-300 text-gray-900 rounded-xl h-10"
                   />
                 </div>
               </div>
             ))}
             {editModalRows.length < 3 && (
               <Button type="button" onClick={addEditRow} className="bg-blue-600 hover:bg-blue-700 text-white">
                 Add Row
               </Button>
             )}
           </div>
         </Modal>
       )}
    </>
  );
}