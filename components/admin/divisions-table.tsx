"use client";

import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { fetchDivisions } from "@/features/divisions/divisionsSlice";
import { SetStateAction, useEffect, useState } from "react";
import { Edit, Trash } from "lucide-react";
import { FullScreenLoader } from "@/components/ui/fullScreenLoader";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Modal } from "@/components/ui/modal";
import { Division } from "@/types/types";

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
        console.log("Division added successfully");
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
        console.log("Division updated successfully");
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
      console.log("Division deleted successfully");
      toast({
        title: "Delete Successful",
        description: "The division has been deleted successfully.",
      });
      dispatch(fetchDivisions()); // Refresh divisions after deletion
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  if (loading) return <FullScreenLoader />;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="overflow-x-auto">
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Nomor</th>
            <th className="border border-gray-300 px-4 py-2">Name</th>
            <th className="border border-gray-300 px-4 py-2">Age Group</th>
            <th className="border border-gray-300 px-4 py-2">Skill Level</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {divisions
            ?.slice() // Create a copy of the array to avoid mutating the original state
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((division, id) => (
              <tr key={division.id}>
                <td className="border border-gray-300 px-4 py-2">{id+1}</td> 
                <td className="border border-gray-300 px-4 py-2">{division.name}</td>
                <td className="border border-gray-300 px-4 py-2">{division.age_group}</td>
                <td className="border border-gray-300 px-4 py-2">{division.skill_level}</td>
                <td className="border border-gray-300 px-4 py-2 flex justify-center space-x-2">
                  <Edit
                    onClick={() => handleEdit(division)}
                    className="h-5 w-5 text-gray-600 hover:text-gray-900 cursor-pointer"
                  />
                  <Trash
                    onClick={() => handleDelete(division.id)}
                    className="h-5 w-5 text-red-600 hover:text-red-800 cursor-pointer"
                  />
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {editDivision && (
        <Modal
          title="Edit Division"
          onClose={() => setEditDivision(null)}
          onSave={() => handleSaveEdit(editDivision)}
        >
          <form className="space-y-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Name:</label>
              <input
                type="text"
                value={editDivision.name}
                onChange={(e) =>
                  setEditDivision({ ...editDivision, name: e.target.value })
                }
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Age Group:</label>
              <input
                type="text"
                value={editDivision.age_group}
                onChange={(e) =>
                  setEditDivision({ ...editDivision, age_group: e.target.value })
                }
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Skill Level:</label>
              <input
                type="text"
                value={editDivision.skill_level}
                onChange={(e) =>
                  setEditDivision({ ...editDivision, skill_level: e.target.value })
                }
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
