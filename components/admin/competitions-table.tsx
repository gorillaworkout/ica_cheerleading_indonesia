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
      const updatedSlug = updatedCompetition.name
        ? updatedCompetition.name.toLowerCase().replace(/\s+/g, "-")
        : undefined;

      const { error } = await supabase
        .from("competitions")
        .update({
          name: updatedCompetition.name,
          ...(updatedSlug ? { slug: updatedSlug } : {}),
        })
        .eq("id", updatedCompetition.id);

      if (error) {
        console.error("Error updating competition:", error);
        return;
      }

      toast({
        title: "Edit Successful",
        description: "Competition name updated.",
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

      {/* Edit Competition Modal (Name only) */}
      {editCompetition && (
        <Modal
          title="Edit Competition"
          onClose={() => setEditCompetition(null)}
          onSave={() => handleSaveEdit(editCompetition)}
        >
          <div className="">
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
          </div>
        </Modal>
      )}
    </div>
  );
}
