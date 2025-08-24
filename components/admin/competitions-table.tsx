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
import { getPublicImageUrl } from "@/utils/getPublicImageUrl";
import { Edit, Trash, Calendar, MapPin, Users, Search, Filter, Plus, Eye, MoreVertical } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { FullScreenLoader } from "@/components/ui/fullScreenLoader";
type Competition = {
  id: string;
  name: string;
  description: string | null;
  date: string;
  location: string;
  registration_open: boolean | null;
  registration_deadline: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  image: string | null;
  slug: string | null;
  [key: string]: any; // Allow dynamic keys for backward compatibility
};

export function CompetitionsTable() {
  const { toast } = useToast();
  const [competitions, setcompetitions] = useState<Competition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editCompetition, setEditCompetition] = useState<Competition | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [validationError, setValidationError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isImageUploading, setIsImageUploading] = useState(false);

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

  // Helper function to convert ISO date string to dd/mm/yyyy format
  const formatDateForDisplay = (isoDateString: string): string => {
    if (!isoDateString) return "";
    
    try {
      const date = new Date(isoDateString);
      if (isNaN(date.getTime())) return "";
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  const handleEdit = async (competition: Competition) => {
    // Convert ISO dates to dd/mm/yyyy format for display
    const formattedCompetition = {
      ...competition,
      date: formatDateForDisplay(competition.date),
      registration_deadline: competition.registration_deadline ? formatDateForDisplay(competition.registration_deadline) : ""
    };
    
    setEditCompetition(formattedCompetition);
    setValidationError(""); // Reset validation error when opening edit modal
    setImageFile(null);
    
    // Get proper image URL using getPublicImageUrl
    if (competition.image) {
      try {
        const imageUrl = await getPublicImageUrl(competition.image);
        setImagePreview(imageUrl);
      } catch (error) {
        console.error("Error getting image URL:", error);
        setImagePreview(null);
      }
    } else {
      setImagePreview(null);
    }
  };

  // Helper function to convert dd/mm/yyyy format to Date object
  const parseDate = (dateString: string): Date | null => {
    if (!dateString || dateString.length !== 10) return null;
    
    const parts = dateString.split('/');
    if (parts.length !== 3) return null;
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in Date constructor
    const year = parseInt(parts[2], 10);
    
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    if (day < 1 || day > 31 || month < 0 || month > 11 || year < 1000 || year > 9999) return null;
    
    const date = new Date(year, month, day);
    
    // Check if the date is valid (handles edge cases like 31/02/2024)
    if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
      return null;
    }
    
    return date;
  };

  const validateField = (field: keyof Competition, value: any, updatedCompetition: Competition): string => {
    let error = "";
    
    // Parse dates from dd/mm/yyyy format
    let competitionDate: Date | null = null;
    let registrationDeadline: Date | null = null;
    
    if (field === "date") {
      competitionDate = parseDate(value);
      if (!competitionDate) {
        return "Please enter a valid date in dd/mm/yyyy format (e.g., 25/12/2024)";
      }
    }
    
    if (field === "registration_deadline") {
      registrationDeadline = parseDate(value);
      if (!registrationDeadline) {
        return "Please enter a valid date in dd/mm/yyyy format (e.g., 20/12/2024)";
      }
    }
    
    // Get existing dates for comparison
    if (!competitionDate && updatedCompetition.date) {
      competitionDate = parseDate(updatedCompetition.date);
    }
    
    if (!registrationDeadline && updatedCompetition.registration_deadline) {
      registrationDeadline = parseDate(updatedCompetition.registration_deadline);
    }
    
    // Validation for competition date vs registration deadline
    if (competitionDate && registrationDeadline) {
      if (competitionDate < registrationDeadline) {
        error = "Competition date cannot be earlier than registration deadline.";
      } else if (competitionDate.getTime() === registrationDeadline.getTime()) {
        error = "Competition date should be after registration deadline for better organization.";
      }
    }
    
    // Additional validation: ensure dates are not in the past
    if (competitionDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day for fair comparison
      
      if (competitionDate < today) {
        error = "Competition date cannot be in the past.";
      }
    }
    
    if (registrationDeadline) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day for fair comparison
      
      if (registrationDeadline < today) {
        error = "Registration deadline cannot be in the past.";
      }
    }
    
    // Additional validation: ensure there's a reasonable gap between deadline and competition
    if (competitionDate && registrationDeadline) {
      if (competitionDate > registrationDeadline) {
        const timeDiff = competitionDate.getTime() - registrationDeadline.getTime();
        const daysDiff = timeDiff / (1000 * 3600 * 24);
        
        if (daysDiff < 1) {
          error = "There should be at least 1 day between registration deadline and competition date.";
        }
      }
    }
    
    return error;
  };

  // Helper function to auto-format date input as dd/mm/yyyy
  const formatDateInput = (value: string): string => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');
    
    // Limit to 8 digits (ddmmyyyy)
    if (numbers.length > 8) return value;
    
    // Format as dd/mm/yyyy
    if (numbers.length >= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4)}`;
    } else if (numbers.length >= 2) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    }
    
    return numbers;
  };

  const handleEditFieldChange = (field: keyof Competition, value: any) => {
    if (!editCompetition) return;
    
    // Auto-format date fields
    if (field === "date" || field === "registration_deadline") {
      value = formatDateInput(value);
    }
    
    const updatedCompetition = { ...editCompetition, [field]: value };
    setEditCompetition(updatedCompetition);
    
    // Run validation for the changed field
    let error = validateField(field, value, updatedCompetition);
    
    // If no error for the changed field, also validate the other date field to ensure overall consistency
    if (!error && (field === "date" || field === "registration_deadline")) {
      const otherField = field === "date" ? "registration_deadline" : "date";
      if (updatedCompetition[otherField]) {
        const otherError = validateField(otherField, updatedCompetition[otherField], updatedCompetition);
        if (otherError) {
          error = otherError;
        }
      }
    }
    
    setValidationError(error);
    
    // Log validation for debugging
    console.log(`Field ${field} changed to ${value}, validation error:`, error);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview URL for the new file
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      // If no file selected, try to restore the original image preview
      if (editCompetition?.image) {
        getPublicImageUrl(editCompetition.image).then(url => {
          setImagePreview(url);
        }).catch(() => {
          setImagePreview(null);
        });
      } else {
        setImagePreview(null);
      }
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from("uploads")
      .upload(`competitions/${fileName}`, file);

    if (error) {
      throw error;
    }

    const { data: publicData } = supabase.storage
      .from("uploads")
      .getPublicUrl(`competitions/${fileName}`);

    if (!publicData?.publicUrl) {
      throw new Error("Failed to retrieve public URL for the uploaded image.");
    }

    return publicData.publicUrl;
  };

  const deleteOldImage = async (imageUrl: string) => {
    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `competitions/${fileName}`;
      
      await supabase.storage.from("uploads").remove([filePath]);
    } catch (error) {
      console.error("Error deleting old image:", error);
      // Don't throw error here as it's not critical
    }
  };

  const getRegistrationStatus = (competition: Competition): { isOpen: boolean; status: string } => {
    const today = new Date();
    const eventDate = new Date(competition.date);
    const registrationDeadline = competition.registration_deadline ? new Date(competition.registration_deadline) : null;
    
    if (eventDate < today) {
      return { isOpen: false, status: "Event Completed" };
    }
    
    if (registrationDeadline && today <= registrationDeadline) {
      return { isOpen: true, status: "Registration Open" };
    }
    
    return { isOpen: false, status: "Registration Closed" };
  };

  const validateEditForm = (competition: Partial<Competition>): boolean => {
    // Parse dates from dd/mm/yyyy format
    let competitionDate: Date | null = null;
    let registrationDeadline: Date | null = null;
    
    if (competition.date) {
      competitionDate = parseDate(competition.date);
      if (!competitionDate) {
        setValidationError("Please enter a valid competition date in dd/mm/yyyy format (e.g., 25/12/2024)");
        return false;
      }
    }
    
    if (competition.registration_deadline) {
      registrationDeadline = parseDate(competition.registration_deadline);
      if (!registrationDeadline) {
        setValidationError("Please enter a valid registration deadline in dd/mm/yyyy format (e.g., 20/12/2024)");
        return false;
      }
    }
    
    // Check if competition date is before registration deadline
    if (competitionDate && registrationDeadline) {
      if (competitionDate < registrationDeadline) {
        setValidationError("Competition date cannot be earlier than registration deadline.")
        return false
      }
      
      if (competitionDate.getTime() === registrationDeadline.getTime()) {
        setValidationError("Competition date should be after registration deadline for better organization.")
        return false
      }
    }
    
    // Check if dates are not in the past
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (competitionDate && competitionDate < today) {
      setValidationError("Competition date cannot be in the past.")
      return false
    }
    
    if (registrationDeadline && registrationDeadline < today) {
      setValidationError("Registration deadline cannot be in the past.")
      return false
    }
    
    // Additional validation: ensure there's a reasonable gap between deadline and competition
    if (competitionDate && registrationDeadline) {
      if (competitionDate > registrationDeadline) {
        const timeDiff = competitionDate.getTime() - registrationDeadline.getTime()
        const daysDiff = timeDiff / (1000 * 3600 * 24)
        
        if (daysDiff < 1) {
          setValidationError("There should be at least 1 day between registration deadline and competition date.")
          return false
        }
      }
    }
    
    setValidationError("")
    return true
  }

  const handleSaveEdit = async (updatedCompetition: Partial<Competition>): Promise<void> => {
    // Validate form before saving
    if (!validateEditForm(updatedCompetition)) {
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsImageUploading(true);
      
      let newImageUrl = updatedCompetition.image;
      let oldImageUrl = editCompetition?.image;

      // Handle image upload if new file is selected
      if (imageFile) {
        newImageUrl = await uploadImage(imageFile);
        
        // Delete old image if it exists
        if (oldImageUrl) {
          await deleteOldImage(oldImageUrl);
        }
      }

      const updatedSlug = updatedCompetition.name
        ? updatedCompetition.name.toLowerCase().replace(/\s+/g, "-")
        : undefined;

      // Convert dd/mm/yyyy format to ISO string for database storage
      let eventDate: Date | null = null;
      let registrationDeadline: Date | null = null;
      
      if (updatedCompetition.date) {
        eventDate = parseDate(updatedCompetition.date);
      } else if (editCompetition?.date) {
        eventDate = parseDate(editCompetition.date);
      }
      
      if (updatedCompetition.registration_deadline) {
        registrationDeadline = parseDate(updatedCompetition.registration_deadline);
      } else if (editCompetition?.registration_deadline) {
        registrationDeadline = parseDate(editCompetition.registration_deadline);
      }

      // Calculate registration_open based on dates
      const today = new Date();
      
      let registrationOpen = false;
      if (registrationDeadline && eventDate) {
        registrationOpen = today <= registrationDeadline && today <= eventDate;
      }

      const { error } = await supabase
        .from("competitions")
        .update({
          name: updatedCompetition.name,
          description: updatedCompetition.description,
          date: eventDate ? eventDate.toISOString() : updatedCompetition.date,
          location: updatedCompetition.location,
          registration_open: registrationOpen,
          registration_deadline: registrationDeadline ? registrationDeadline.toISOString() : updatedCompetition.registration_deadline,
          image: newImageUrl,
          ...(updatedSlug ? { slug: updatedSlug } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq("id", updatedCompetition.id);

      if (error) {
        console.error("Error updating competition:", error);
        toast({
          title: "Error",
          description: "Failed to update competition. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Edit Successful",
        description: "Competition updated successfully.",
      });
      handleCloseEdit();
      fetchcompetitions();
    } catch (err) {
      console.error("Unexpected error:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsImageUploading(false);
    }
  };

  const handleCloseEdit = () => {
    setEditCompetition(null);
    setValidationError("");
    setImageFile(null);
    setImagePreview(null);
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
    const status = getRegistrationStatus(competition);
    
    if (status.status === "Event Completed") {
      return <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full border border-gray-200">Completed</span>;
    } else if (status.status === "Registration Open") {
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

      {/* Edit Competition Modal (All fields) */}
      {editCompetition && (
        <Modal
          title="Edit Competition"
          onClose={handleCloseEdit}
          onSave={() => handleSaveEdit(editCompetition)}
          saveDisabled={!!validationError || isImageUploading}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Competition Name *</label>
              <input
                type="text"
                value={editCompetition?.name || ""}
                onChange={(e) =>
                  handleEditFieldChange("name", e.target.value)
                }
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300"
                placeholder="Enter competition name..."
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Description</label>
              <textarea
                value={editCompetition?.description || ""}
                onChange={(e) =>
                  handleEditFieldChange("description", e.target.value)
                }
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300"
                placeholder="Enter competition description..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Location *</label>
              <input
                type="text"
                value={editCompetition?.location || ""}
                onChange={(e) =>
                  handleEditFieldChange("location", e.target.value)
                }
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300"
                placeholder="Enter competition location..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Competition Date *</label>
                <input
                  type="text"
                  value={editCompetition?.date || ""}
                  onChange={(e) =>
                    handleEditFieldChange("date", e.target.value)
                  }
                  className={`w-full px-4 py-3 bg-gray-50/50 border rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 ${
                    validationError && validationError.includes("competition date") 
                      ? "border-red-500 bg-red-50" 
                      : "border-gray-200"
                  }`}
                  placeholder="dd/mm/yyyy"
                  maxLength={10}
                />
                <p className="text-xs text-gray-500">
                  Format: dd/mm/yyyy (e.g., 25/12/2024)
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Registration Deadline</label>
                <input
                  type="text"
                  value={editCompetition?.registration_deadline || ""}
                  onChange={(e) =>
                    handleEditFieldChange("registration_deadline", e.target.value)
                  }
                  className={`w-full px-4 py-3 bg-gray-50/50 border rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 ${
                    validationError && validationError.includes("registration deadline") 
                      ? "border-red-500 bg-red-50" 
                      : "border-gray-200"
                  }`}
                  placeholder="dd/mm/yyyy"
                  maxLength={10}
                />
                <p className="text-xs text-gray-500">
                  Format: dd/mm/yyyy (e.g., 20/12/2024)
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Competition Image</label>
              
              {/* Current Image Preview */}
              {imagePreview && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-2">Current Image:</p>
                  <div className="relative inline-block">
                    <img 
                      src={imagePreview} 
                      alt="Competition preview" 
                      className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        console.error("Image failed to load:", imagePreview);
                        e.currentTarget.src = "/placeholder.jpg";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                        handleEditFieldChange("image", "");
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      title="Remove image"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
              
              {/* Image Upload */}
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300"
                />
                <p className="text-xs text-gray-500">
                  Upload new image to replace current one. Leave empty to keep current image.
                </p>
              </div>
            </div>
            
            {/* Registration Status Display */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Registration Status</label>
              <div className="p-3 bg-gray-50 rounded-lg">
                {(() => {
                  const status = getRegistrationStatus(editCompetition);
                  return (
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${status.isOpen ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className={`text-sm font-medium ${status.isOpen ? 'text-green-700' : 'text-red-700'}`}>
                        {status.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        (Auto-calculated based on dates)
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>

            {validationError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm font-medium flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  {validationError}
                </p>
              </div>
            )}
            
            {isImageUploading && (
              <p className="text-blue-500 text-xs mt-2">Uploading image...</p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
