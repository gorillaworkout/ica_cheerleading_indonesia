"use client";

import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { fetchDivisions } from "@/features/divisions/divisionsSlice";
import { SetStateAction, useEffect, useState } from "react";
import { Edit, Trash, Search, Filter, Plus, Eye, MoreVertical, Users, Target, Award } from "lucide-react";
import { FullScreenLoader } from "@/components/ui/fullScreenLoader";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Modal } from "@/components/ui/modal";
import { Division } from "@/types/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface NewDivision {
    name: string;
    age_group: string;
    skill_level: string;
    [key: string]: any;
}
interface UpdatedDivision {
    id: string;
    name: string;
    age_group: string;
    skill_level: string;
    [key: string]: any;
}

export function DivisionsTable() {
  const dispatch = useAppDispatch();
  const { divisions, loading, error } = useAppSelector((state) => state.divisions);
  const [editDivision, setEditDivision] = useState<Division | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSkillLevel, setFilterSkillLevel] = useState("all");

  useEffect(() => {
    dispatch(fetchDivisions());
  }, [dispatch]);

  const handleEdit = (division: Division) => {
    setEditDivision(division);
  };

const handleAddDivision = async (newDivision: NewDivision): Promise<void> => {
    try {
        const { error } = await supabase.from("divisions").insert(newDivision);
        if (error) {
            console.error("Error adding division:", error);
            return;
        }

        toast({
            title: "Add Successful",
            description: "The division has been added successfully.",
        });
        dispatch(fetchDivisions()); // Refetch data after adding
    } catch (err) {
        console.error("Unexpected error:", err);
    }
};

const handleSaveEdit = async (updatedDivision: UpdatedDivision): Promise<void> => {
    try {
        const { error } = await supabase
            .from("divisions")
            .update(updatedDivision)
            .eq("id", updatedDivision.id);
        if (error) {
            console.error("Error updating division:", error);
            return;
        }

        toast({
            title: "Edit Successful",
            description: "The division has been updated successfully.",
        });
        setEditDivision(null);
        dispatch(fetchDivisions()); // Refetch data after editing
    } catch (err) {
        console.error("Unexpected error:", err);
    }
};

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("divisions").delete().eq("id", id);
      if (error) {
        console.error("Error deleting division:", error);
        return;
      }

      toast({
        title: "Delete Successful",
        description: "The division has been deleted successfully.",
      });
      dispatch(fetchDivisions()); // Refresh divisions after deletion
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  // Filter and search logic
  const filteredDivisions = divisions
    ?.filter((division) => {
      const matchesSearch = division.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           division.age_group.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterSkillLevel === "all") return matchesSearch;
      return matchesSearch && division.skill_level.toLowerCase() === filterSkillLevel.toLowerCase();
    })
    .sort((a, b) => a.queue - b.queue) || [];

  const getSkillLevelBadge = (skillLevel: string) => {
    const level = skillLevel.toLowerCase();
    if (level.includes('novice') || level.includes('pemula')) {
      return <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded-full border border-green-200">Novice</span>;
    } else if (level.includes('intermediate') || level.includes('menengah')) {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-600 text-xs font-medium rounded-full border border-yellow-200">Intermediate</span>;
    } else if (level.includes('advanced') || level.includes('lanjutan')) {
      return <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full border border-red-200">Advanced</span>;
    } else if (level.includes('elite') || level.includes('elit')) {
      return <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs font-medium rounded-full border border-purple-200">Elite</span>;
    }
    return <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full border border-gray-200">{skillLevel}</span>;
  };

  if (loading) return <FullScreenLoader />;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Divisions Management</h2>
          <p className="text-gray-600 mt-1">Manage and monitor all competition divisions</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
          <Plus className="w-4 h-4 mr-2" />
          Add Division
        </Button>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search divisions by name or age group..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 bg-gray-50/50 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300"
            />
          </div>
          
          {/* Filter Dropdown */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterSkillLevel}
              onChange={(e) => setFilterSkillLevel(e.target.value)}
              className="pl-10 pr-8 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 appearance-none min-w-[200px]"
            >
              <option value="all">All Skill Levels</option>
              <option value="novice">Novice</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="elite">Elite</option>
            </select>
          </div>
        </div>
        
        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredDivisions.length} of {divisions?.length || 0} divisions
        </div>
      </div>

      {/* Standard Table Section */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border rounded-lg bg-white">
          <thead className="bg-gray-100 text-xs uppercase">
            <tr>
              <th className="p-2 border">No</th>
              <th className="p-2 border">Division Name</th>
              <th className="p-2 border">Age Group</th>
              <th className="p-2 border">Skill Level</th>
              <th className="p-2 border">Queue Order</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDivisions.map((division, index) => (
              <tr key={division.id} className="text-center hover:bg-gray-50">
                <td className="p-2 border">{index + 1}</td>
                <td className="p-2 border font-medium">{division.name}</td>
                <td className="p-2 border">{division.age_group}</td>
                <td className="p-2 border">
                  {getSkillLevelBadge(division.skill_level)}
                </td>
                <td className="p-2 border">#{division.queue}</td>
                <td className="p-2 border">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => handleEdit(division)}
                      className="text-blue-600 hover:text-blue-800 text-xs bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                      title="Edit Division"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(division.id)}
                      className="text-red-600 hover:text-red-800 text-xs bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors"
                      title="Delete Division"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Empty State */}
        {filteredDivisions.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No divisions found</h3>
            <p className="text-gray-500">
              {searchTerm || filterSkillLevel !== "all" 
                ? "Try adjusting your search or filter criteria" 
                : "Get started by creating your first division"}
            </p>
          </div>
        )}
      </div>

      {/* Edit Division Modal */}
      {editDivision && (
        <Modal
          title="Edit Division"
          onClose={() => setEditDivision(null)}
          onSave={() => editDivision && handleSaveEdit(editDivision)}
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Division Name</label>
              <input
                type="text"
                value={editDivision?.name || ""}
                onChange={(e) =>
                  editDivision && setEditDivision({ ...editDivision, name: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300"
                placeholder="Enter division name..."
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Age Group</label>
              <input
                type="text"
                value={editDivision?.age_group || ""}
                onChange={(e) =>
                  editDivision && setEditDivision({ ...editDivision, age_group: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300"
                placeholder="e.g., 12-15 years, Senior, etc."
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Skill Level</label>
              <select
                value={editDivision?.skill_level || ""}
                onChange={(e) =>
                  editDivision && setEditDivision({ ...editDivision, skill_level: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300"
              >
                <option value="">Select skill level...</option>
                <option value="Novice">Novice</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Elite">Elite</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Queue Order</label>
              <input
                type="number"
                value={editDivision?.queue || ""}
                onChange={(e) =>
                  editDivision && setEditDivision({ ...editDivision, queue: parseInt(e.target.value) || 0 })
                }
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300"
                placeholder="Competition order number..."
                min="1"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
