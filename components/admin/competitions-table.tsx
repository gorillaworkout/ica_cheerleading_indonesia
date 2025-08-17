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
import { formatDate } from "@/utils/dateFormat";
import { supabase } from "@/lib/supabase";
import { Edit, Trash, Calendar, MapPin, Users, Search, Filter, Plus, Eye, MoreVertical } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

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

  // Filter and search logic
  const filteredCompetitions = competitions
    .filter((comp) => {
      const matchesSearch = comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           comp.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterStatus === "all") return matchesSearch;
      
      const today = new Date();
      const eventDate = new Date(comp.date);
      const registrationDeadline = comp.registration_deadline ? new Date(comp.registration_deadline) : null;
      
      if (filterStatus === "upcoming") return matchesSearch && eventDate > today;
      if (filterStatus === "completed") return matchesSearch && eventDate < today;
      if (filterStatus === "registration-open") return matchesSearch && registrationDeadline && today <= registrationDeadline;
      
      return matchesSearch;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getStatusBadge = (competition: Competition) => {
    const today = new Date();
    const eventDate = new Date(competition.date);
    const registrationDeadline = competition.registration_deadline ? new Date(competition.registration_deadline) : null;
    
    if (eventDate < today) {
      return <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full border border-gray-200">Completed</span>;
    } else if (registrationDeadline && today <= registrationDeadline) {
      return <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded-full border border-green-200">Registration Open</span>;
    } else {
      return <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full border border-blue-200">Upcoming</span>;
    }
  };

  return (
    <div className="">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Competitions Management</h2>
          <p className="text-gray-600 mt-1">Manage and monitor all cheerleading competitions</p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search competitions by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 bg-gray-50/50 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300"
            />
          </div>
          
          {/* Filter Dropdown */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 appearance-none min-w-[200px]"
            >
              <option value="all">All Competitions</option>
              <option value="upcoming">Upcoming</option>
              <option value="registration-open">Registration Open</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        
        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredCompetitions.length} of {competitions.length} competitions
        </div>
      </div>

      {/* Standard Table Section */}
      {isLoading ? (
        <FullScreenLoader />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border rounded-lg bg-white">
            <thead className="bg-gray-100 text-xs uppercase">
              <tr>
                <th className="p-2 border">No</th>
                <th className="p-2 border">Competition Name</th>
                <th className="p-2 border">Location</th>
                <th className="p-2 border">Event Date</th>
                <th className="p-2 border">Registration Deadline</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompetitions.map((competition, index) => (
                <tr key={competition.id} className="text-center hover:bg-gray-50">
                  <td className="p-2 border">{index + 1}</td>
                  <td className="p-2 border font-medium text-left">
                    <div>
                      <div className="font-semibold">{competition.name}</div>
                      {competition.description && (
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {competition.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-2 border">{competition.location}</td>
                  <td className="p-2 border">
                    {formatDate(competition.date)}
                  </td>
                  <td className="p-2 border">
                    {competition.registration_deadline ? (
                      formatDate(competition.registration_deadline)
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-2 border">
                    {getStatusBadge(competition)}
                  </td>
                  <td className="p-2 border">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleEdit(competition)}
                        className="text-blue-600 hover:text-blue-800 text-xs bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                        title="Edit Competition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(competition.id)}
                        className="text-red-600 hover:text-red-800 text-xs bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors"
                        title="Delete Competition"
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
          {filteredCompetitions.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No competitions found</h3>
              <p className="text-gray-500">
                {searchTerm || filterStatus !== "all" 
                  ? "Try adjusting your search or filter criteria" 
                  : "Get started by creating your first competition"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Edit Competition Modal */}
      {editCompetition && (
        <Modal
          title="Edit Competition"
          onClose={() => setEditCompetition(null)}
          onSave={() => handleSaveEdit(editCompetition)}
        >
          <div className="">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Competition Name</label>
                <input
                  type="text"
                  value={editCompetition?.name || ""}
                  onChange={(e) =>
                    setEditCompetition({ ...editCompetition, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300"
                  placeholder="Enter competition name..."
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Location</label>
                <input
                  type="text"
                  value={editCompetition?.location || ""}
                  onChange={(e) =>
                    setEditCompetition({ ...editCompetition, location: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300"
                  placeholder="Enter location..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Description</label>
              <textarea
                value={editCompetition?.description || ""}
                onChange={(e) =>
                  setEditCompetition({ ...editCompetition, description: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 resize-none"
                placeholder="Enter competition description..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Event Date</label>
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
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Registration Deadline</label>
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
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Competition Image</label>
              
              {/* Current Image Preview */}
              {editCompetition?.image && typeof editCompetition.image === 'string' && (
                <div className="mb-4">
                  <label className="text-xs font-medium text-gray-600 mb-2 block">Current Image:</label>
                  <div className="relative w-48 h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${editCompetition.image}`}
                      alt="Current competition image"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = '<div class="flex items-center justify-center w-full h-full text-gray-400"><span class="text-sm">Image not found</span></div>';
                        }
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Current image path: {editCompetition.image}</p>
                </div>
              )}

              {/* New Image Upload */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setEditCompetition({ ...editCompetition, image: file });
                    }
                  }}
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Supported formats: JPG, PNG, WebP. Maximum size: 5MB
                </p>
              </div>

              {/* New Image Preview */}
              {editCompetition?.image && editCompetition.image instanceof File && (
                <div className="mt-4">
                  <label className="text-xs font-medium text-gray-600 mb-2 block">New Image Preview:</label>
                  <div className="relative w-48 h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={URL.createObjectURL(editCompetition.image)}
                      alt="New competition image preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    File: {editCompetition.image.name} ({(editCompetition.image.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              )}

              {/* No Image State */}
              {!editCompetition?.image && (
                <div className="mt-4">
                  <label className="text-xs font-medium text-gray-600 mb-2 block">No Image:</label>
                  <div className="w-48 h-32 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <div className="w-8 h-8 mx-auto mb-2">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-xs">No image uploaded</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
