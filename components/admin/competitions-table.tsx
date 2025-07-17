"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Edit, Trash } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { FullScreenLoader } from "@/components/ui/fullScreenLoader";
type Competition = {
  id: string;
  name: string;
  location: string;
  date: string;
  [key: string]: any; // Allow dynamic keys
};

export function CompetitionsTable() {
  const { toast } = useToast();
  const [competitions, setcompetitions] = useState<Competition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editCompetition, setEditCompetition] = useState<Competition | null>(null);

  useEffect(() => {
    fetchcompetitions();
  }, []);

  const fetchcompetitions = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from("competitions").select();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch competitions.",
        variant: "destructive",
      });
    } else {
      setcompetitions(data || []);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("competitions").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete competition.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Competition deleted successfully.",
      });
      fetchcompetitions();
    }
  };

  const handleEdit = (competition: Competition) => {
    setEditCompetition(competition);
  };

  const handleSaveEdit = async (updatedCompetition: Partial<Competition>): Promise<void> => {
    try {
      let newImageUrl = updatedCompetition.image;

      if (updatedCompetition.image instanceof File) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("uploads")
          .upload(`competitions/${updatedCompetition.id}-${updatedCompetition.image.name}`, updatedCompetition.image);

        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          return;
        }

        newImageUrl = uploadData?.path;

        // Delete old image if exists
        const oldImageUrl = competitions.find((comp) => comp.id === updatedCompetition.id)?.image;
        if (oldImageUrl && oldImageUrl !== newImageUrl) {
          const { error: deleteError } = await supabase.storage
            .from("uploads")
            .remove([oldImageUrl]);

          if (deleteError) {
            console.error("Error deleting old image:", deleteError);
          }
        }
      } else {
        // Retain the old image if no new image is provided
        newImageUrl = competitions.find((comp) => comp.id === updatedCompetition.id)?.image;
      }

      const updatedSlug = updatedCompetition.name
        ? updatedCompetition.name.toLowerCase().replace(/\s+/g, "-")
        : updatedCompetition.slug;

      // Check and update registration_open based on the date and registration deadline
      const today = new Date();
      const eventDate = updatedCompetition.date ? new Date(updatedCompetition.date) : null;
      const registrationDeadline = updatedCompetition.registration_deadline ? new Date(updatedCompetition.registration_deadline) : null;

      let registrationOpen = false;
      if (eventDate && registrationDeadline) {
        registrationOpen = today <= registrationDeadline && today < eventDate;
      }

      const { error } = await supabase
        .from("competitions")
        .update({
          ...updatedCompetition,
          image: newImageUrl,
          slug: updatedSlug,
          registration_open: registrationOpen,
        })
        .eq("id", updatedCompetition.id);

      if (error) {
        console.error("Error updating competition:", error);
        return;
      }

      toast({
        title: "Edit Successful",
        description: "The competition has been updated successfully.",
      });
      setEditCompetition(null);
      fetchcompetitions();
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  return (
    <div className="overflow-x-auto">
      <h2 className="text-xl font-bold mb-4">Competitions</h2>
      {isLoading ? (
        <FullScreenLoader />
      ) : (
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2">Nomor</th>
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">Location</th>
              <th className="border border-gray-300 px-4 py-2">Event Date</th>
              <th className="border border-gray-300 px-4 py-2">Registration Deadline</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {competitions
              ?.slice()
              .sort(
                (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
              )
              .map((competition, id) => (
                <tr key={competition.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 text-center">{id + 1}</td>
                  <td className="border border-gray-300 px-4 py-2">{competition.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{competition.location}</td>
                  <td className="border border-gray-300 px-4 py-2">{competition.date}</td>
                  <td className="border border-gray-300 px-4 py-2">{competition.registration_deadline}</td>
                  <td className="border border-gray-300 px-4 py-2 flex justify-center space-x-2">
                    <Edit
                      onClick={() => handleEdit(competition)}
                      className="h-5 w-5 text-gray-600 hover:text-gray-900 cursor-pointer"
                    />
                    <Trash
                      onClick={() => handleDelete(competition.id)}
                      className="h-5 w-5 text-red-600 hover:text-red-800 cursor-pointer"
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}

      {editCompetition && (
        <Modal
          title="Edit Competition"
          onClose={() => setEditCompetition(null)}
          onSave={() => handleSaveEdit(editCompetition)}
        >
          <form className="space-y-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Name:</label>
              <input
                type="text"
                value={editCompetition?.name || ""}
                onChange={(e) =>
                  setEditCompetition({ ...editCompetition, name: e.target.value })
                }
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Description:</label>
              <textarea
                value={editCompetition?.description || ""}
                onChange={(e) =>
                  setEditCompetition({ ...editCompetition, description: e.target.value })
                }
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Location:</label>
              <input
                type="text"
                value={editCompetition?.location || ""}
                onChange={(e) =>
                  setEditCompetition({ ...editCompetition, location: e.target.value })
                }
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Date:</label>
              <input
                type="date"
                value={editCompetition?.date || ""}
                onChange={(e) => {
                  const newDate = e.target.value;
                  if (
                    editCompetition?.registration_deadline &&
                    new Date(newDate) < new Date(editCompetition.registration_deadline)
                  ) {
                    toast({
                      title: "Error",
                      description: "Date cannot be earlier than the registration deadline.",
                      variant: "destructive",
                    });
                    return;
                  }
                  setEditCompetition({ ...editCompetition, date: newDate });
                }}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Registration Deadline:</label>
              <input
                type="date"
                value={editCompetition?.registration_deadline || ""}
                onChange={(e) => {
                  const newDeadline = e.target.value;
                  if (
                    editCompetition?.date &&
                    new Date(newDeadline) > new Date(editCompetition.date)
                  ) {
                    toast({
                      title: "Error",
                      description: "Registration deadline cannot be later than the event date.",
                      variant: "destructive",
                    });

                    return;
                  }
                  setEditCompetition({ ...editCompetition, registration_deadline: newDeadline });
                }}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Image:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setEditCompetition({ ...editCompetition, image: file });
                  }
                }}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
