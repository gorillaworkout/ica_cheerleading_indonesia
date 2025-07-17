"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

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

export default function AddResultsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [formData, setFormData] = useState({
    competitionId: "",
    division: "",
    placement: "",
    team: "",
    score: "",
    province: "",
  });

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
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { competitionId, division, placement, team, score, province } = formData;

    if (!competitionId || !division || !placement || !team || !score || !province) {
      toast({ title: "Error", description: "All fields are required.", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("results").insert({
      competition_id: competitionId,
      division,
      placement: parseInt(placement, 10),
      team,
      score: parseFloat(score),
      province,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Result added successfully." });

    setFormData({
      competitionId: "",
      division: "",
      placement: "",
      team: "",
      score: "",
      province: "",
    });
  };

  return (
    <div className="max-w-4xl p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-left text-gray-800">Add Competition Results</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="competitionId" className="text-gray-700 font-medium">Competition</Label>
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
          <Label htmlFor="division" className="text-gray-700 font-medium">Division</Label>
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
          <Label htmlFor="placement" className="text-gray-700 font-medium">Placement</Label>
          <Select
            value={formData.placement}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, placement: value }))
            }
          >
            <SelectTrigger className="w-full border-gray-300">
              <SelectValue placeholder="Select placement" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => (i + 1).toString()).map((placement) => (
                <SelectItem key={placement} value={placement}>
                  {placement}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="team" className="text-gray-700 font-medium">Team</Label>
          <Input
            id="team"
            name="team"
            value={formData.team}
            onChange={handleInputChange}
            required
            className="w-full border-gray-300"
          />
        </div>

        <div>
          <Label htmlFor="score" className="text-gray-700 font-medium">Score</Label>
          <Input
            id="score"
            name="score"
            type="number"
            step="0.1"
            value={formData.score}
            onChange={handleInputChange}
            required
            className="w-full border-gray-300"
          />
        </div>

        <div>
          <Label htmlFor="province" className="text-gray-700 font-medium">Province</Label>
          <Select
            value={formData.province}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, province: value }))
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

        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
          Add Result
        </Button>
      </form>
    </div>
  );
}
