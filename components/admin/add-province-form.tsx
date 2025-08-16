"use client"
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useAppDispatch } from "@/lib/redux/hooks";
import { fetchProvinces } from "@/features/provinces/provincesSlice";

export default function AddProvinceForm() {
  const dispatch = useAppDispatch()
  const [formData, setFormData] = useState({
    name: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { name } = formData;

    if (!name) {
      toast({ title: "Error", description: "Province name is required.", variant: "destructive" });
      return;
    }

    const { data: provinces, error: fetchError } = await supabase.from("provinces").select("id_province");

    if (fetchError) {
      toast({ title: "Error", description: fetchError.message, variant: "destructive" });
      return;
    }

    const nextIdProvince = provinces ? (provinces.length + 1).toString().padStart(3, "0") : "001";

    const { error } = await supabase.from("provinces").insert({
      id: crypto.randomUUID(),
      id_province: nextIdProvince,
      name: name.toUpperCase(),
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Province added successfully." });
    dispatch(fetchProvinces())
    setFormData({
      name: "",
    });
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Add New Province</h3>
        <p className="text-gray-600 text-sm">Create a new province for competition registration</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Province Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="mt-2 px-4 py-3 bg-gray-50/50 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300"
            placeholder="Enter province name..."
          />
        </div>

        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium py-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
        >
          Add Province
        </Button>
      </form>
    </div>
  );
}