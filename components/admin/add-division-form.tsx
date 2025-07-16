"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { DivisionDetailsProps } from "@/types/types";
import { v4 as uuidv4 } from "uuid";

export function AddDivisionForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<DivisionDetailsProps>({
    id: uuidv4(),
    name: "",
    age_group: "",
    skill_level: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.from("divisions").insert([
        {
          ...formData,
          id: uuidv4(),
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        throw error;
      }

      toast({
        title: "Division Added",
        description: "The division has been successfully added.",
      });

      // Reset form
      setFormData({
        id: uuidv4(),
        name: "",
        age_group: "",
        skill_level: "",
      });
    } catch (error) {
      console.log(error, "error");
      toast({
        title: "Error",
        description: "Failed to add division. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5 text-red-600" />
            <span>Add Division</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Division Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Senior Level 5"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="age_group">Age Group *</Label>
            <Input
              id="age_group"
              name="age_group"
              value={formData.age_group}
              onChange={handleInputChange}
              placeholder="e.g., 15-18"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="skill_level">Skill Level *</Label>
            <Input
              id="skill_level"
              name="skill_level"
              value={formData.skill_level}
              onChange={handleInputChange}
              placeholder="e.g., Elite"
              required
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" className="bg-transparent">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-red-600 hover:bg-red-700"
        >
          {isSubmitting ? "Adding..." : "Add Division"}
        </Button>
      </div>
    </form>
  );
}
