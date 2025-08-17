"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { fetchProvinces } from "@/features/provinces/provincesSlice";
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Edit, 
  Trash2,
  Plus,
  Search,
  Filter,
  UserCheck,
  UserX,
  IdCard,
  RotateCcw
} from "lucide-react";
import type { Profile } from "@/types/profiles/profiles";
import { getPublicImageUrl, generateStorageUrl } from "@/utils/getPublicImageUrl";


const PAGE_SIZE = 10;

export function UsersTable() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [deletedUsers, setDeletedUsers] = useState<Profile[]>([]); // New state for deleted users
  const [showDeletedUsers, setShowDeletedUsers] = useState(false); // Toggle between active and deleted users
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<Profile | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);
  const [viewUser, setViewUser] = useState<Profile | null>(null);
  
  const dispatch = useAppDispatch();
  const { provinces } = useAppSelector((state) => state.provinces);
  const { toast } = useToast();

  useEffect(() => {
    dispatch(fetchProvinces());
  }, [dispatch]);

  useEffect(() => {
    fetchUsers();
    fetchDeletedUsers(); // Also fetch deleted users
  }, []); // Only fetch once on component mount

  // Recalculate total pages when filters change
  useEffect(() => {
    const filteredCount = users.filter(user => {
      // Always exclude deleted users
      if (user.is_deleted === true) return false;
      
      if (searchTerm.trim() !== "") {
        const searchLower = searchTerm.toLowerCase();
        return (
          user.display_name?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.phone_number?.toLowerCase().includes(searchLower) ||
          user.province_code?.toLowerCase().includes(searchLower)
        );
      }
      if (filterStatus === "verified") {
        return user.is_verified === true;
      } else if (filterStatus === "not_verified") {
        return user.is_verified === false;
      } else if (filterStatus === "pending_edit") {
        return user.is_request_edit === true && user.is_edit_allowed === false;
      }
      return true;
    }).length;
    
    setTotalPages(Math.ceil(filteredCount / PAGE_SIZE));
    setPage(1); // Reset to first page when filters change
  }, [users, searchTerm, filterStatus]);

  // Separate useEffect for search and filter changes
  useEffect(() => {
    // Reset to first page when search or filter changes
    setPage(1);
  }, [searchTerm, filterStatus]);

  // Fetch users (now fetches all, filtering/pagination client-side)
  const fetchUsers = async () => {
    setLoading(true);
    let query = supabase.from("profiles").select("*").eq("is_deleted", false).order("created_at", { ascending: false });
    const { data, error } = await query;
    if (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to fetch users.", variant: "destructive" });
    } else {
      setUsers(data || []);
      // Calculate total pages based on filtered results (client-side)
      const filteredCount = (data || []).filter(user => {
        // Always exclude deleted users
        if (user.is_deleted === true) return false;
        
        if (searchTerm.trim() !== "") {
          const searchLower = searchTerm.toLowerCase();
          return (
            user.display_name?.toLowerCase().includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower) ||
            user.phone_number?.toLowerCase().includes(searchLower) ||
            user.province_code?.toLowerCase().includes(searchLower)
          );
        }
        if (filterStatus === "verified") {
          return user.is_verified === true;
        } else if (filterStatus === "not_verified") {
          return user.is_verified === false;
        } else if (filterStatus === "pending_edit") {
          return user.is_request_edit === true && user.is_edit_allowed === false;
        }
        return true;
      }).length;
      setTotalPages(Math.ceil(filteredCount / PAGE_SIZE));
    }
    setLoading(false);
  };

  // Fetch deleted users
  const fetchDeletedUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("is_deleted", true)
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching deleted users:", error);
      toast({ title: "Error", description: "Failed to fetch deleted users.", variant: "destructive" });
    } else {
      setDeletedUsers(data || []);
    }
  };

  // Restore deleted user
  const handleRestoreUser = async (id: string) => {
    try {
      console.log("Attempting to restore user with ID:", id);
      
      const { error: restoreError, data: restoreData } = await supabase
        .from("profiles")
        .update({ is_deleted: false })
        .eq("id", id)
        .eq("is_deleted", true)
        .select();
      
      if (restoreError) {
        console.error("Error restoring user:", restoreError);
        toast({
          title: "Restore Failed",
          description: `Failed to restore user: ${restoreError.message || 'Unknown error'}`,
          variant: "destructive",
        });
        return;
      }
      
      if (!restoreData || restoreData.length === 0) {
        toast({
          title: "Restore Failed",
          description: "User restore was not successful. Please check your permissions.",
          variant: "destructive",
        });
        return;
      }
      
      console.log("User restored successfully:", restoreData);
      
      // Update both states
      setDeletedUsers(prev => prev.filter(user => user.id !== id));
      setUsers(prev => [restoreData[0], ...prev]);
      
      toast({
        title: "Restore Successful",
        description: "The user has been restored successfully.",
        variant: "default",
      });
      
    } catch (err) {
      console.error("Unexpected error during restore:", err);
      toast({
        title: "Unexpected Error",
        description: `An unexpected error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (user: Profile) => {
    setEditUser(user);
  };

  const handleViewUser = (user: Profile) => {
    setViewUser(user);
  };

  const handleSaveEdit = async (updatedUser: Profile): Promise<void> => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: updatedUser.display_name,
          role: updatedUser.role,
          gender: updatedUser.gender,
          birth_date: updatedUser.birth_date,
          province_code: updatedUser.province_code,
          updated_at: new Date().toISOString(),
        })
        .eq("id", updatedUser.id);

      if (error) {
        console.error("Error updating user:", error);
        
        toast({
          title: "Update Failed",
          description: `Failed to update user: ${error.message || 'Unknown error'}`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Edit Successful",
        description: "The user has been updated successfully.",
        variant: "default",
      });
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      console.error("Unexpected error:", err);
      
      toast({
        title: "Unexpected Error",
        description: `An unexpected error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      console.log("Attempting to soft delete user with ID:", id);
      console.log("Current users before delete:", users.length);
      console.log("User to delete:", users.find(u => u.id === id));
      
      // First, let's check if the user exists and is not already deleted
      const { data: checkUser, error: checkError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .eq("is_deleted", false)
        .single();
      
      console.log("User check before delete:", { checkUser, checkError });
      
      if (checkError) {
        console.error("Error checking user:", checkError);
        toast({
          title: "Delete Failed",
          description: "User not found or already deleted",
          variant: "destructive",
        });
        return;
      }
      
      if (!checkUser) {
        console.error("User not found or already deleted");
        toast({
          title: "Delete Failed",
          description: "User not found or already deleted",
          variant: "destructive",
        });
        return;
      }
      
      console.log("User found, proceeding with soft delete");
      
      // Soft delete: update is_deleted to true
      const { error: updateError, data: updateData } = await supabase
        .from("profiles")
        .update({ is_deleted: true })
        .eq("id", id)
        .eq("is_deleted", false)
        .select();
      
      console.log("Soft delete response:", { updateError, updateData });
      
      if (updateError) {
        console.error("Error soft deleting user:", updateError);
        
        // Check if it's an RLS policy issue
        if (updateError.message.includes("row-level security") || updateError.message.includes("policy")) {
          toast({
            title: "Delete Failed - Permission Denied",
            description: "You don't have permission to delete this user. This may be due to RLS policy restrictions.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Delete Failed",
            description: `Failed to delete user: ${updateError.message || 'Unknown error'}`,
            variant: "destructive",
          });
        }
        return;
      }
      
      // Check if soft delete was actually successful
      if (!updateData || updateData.length === 0) {
        console.error("Soft delete operation returned no data - user may not have been updated");
        toast({
          title: "Delete Failed",
          description: "User deletion was not successful. Please check your permissions.",
          variant: "destructive",
        });
        return;
      }
      
      console.log("User soft deleted successfully");
      console.log("Updated user data:", updateData);
      
      // Update local state immediately for better UX
      setUsers(prevUsers => {
        const updatedUsers = prevUsers.filter(user => user.id !== id);
        console.log("Users before filter:", prevUsers.length);
        console.log("Users after filter:", updatedUsers.length);
        console.log("Deleted user ID:", id);
        console.log("Remaining user IDs:", updatedUsers.map(u => u.id));
        return updatedUsers;
      });
      
      toast({
        title: "Delete Successful",
        description: "The user has been deleted successfully.",
        variant: "default",
      });
      
      console.log("Soft delete completed successfully - user should be removed from UI");
      
      // Verify soft delete operation by checking if user is marked as deleted
      setTimeout(async () => {
        try {
          const { data: verifyUser, error: verifyError } = await supabase
            .from("profiles")
            .select("id, is_deleted")
            .eq("id", id)
            .single();
          
          console.log("Verification after soft delete:", { verifyUser, verifyError });
          
          if (verifyUser && verifyUser.is_deleted === true) {
            console.log("User successfully soft deleted from database");
          } else if (verifyUser && verifyUser.is_deleted === false) {
            console.warn("User still not marked as deleted!");
            console.warn("This indicates an RLS policy issue or update operation failed");
            
            // Revert local state since soft delete failed
            setUsers(prevUsers => {
              const revertedUsers = [...prevUsers, checkUser];
              console.log("Reverting users state, count:", revertedUsers.length);
              return revertedUsers;
            });
            
            toast({
              title: "Delete Failed - User Still Active",
              description: "User could not be deleted due to database restrictions. Please contact administrator.",
              variant: "destructive",
            });
          } else {
            console.log("User not found in database (may have been hard deleted)");
          }
        } catch (verifyErr) {
          console.log("User not found in database (soft delete successful)");
        }
      }, 1000);
      
    } catch (err) {
      console.error("Unexpected error:", err);
      
      toast({
        title: "Unexpected Error",
        description: `An unexpected error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const approveUser = async (userId: string) => {
    setApproving(userId);
    
    try {

      
      const { error } = await supabase
        .from("profiles")
        .update({ 
          is_verified: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        console.error("Error approving user:", error);
        
        toast({
          title: "Approval Failed",
          description: `Failed to approve user: ${error.message || 'Unknown error'}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Approval Successful",
          description: "User has been approved successfully.",
          variant: "default",
        });
        fetchUsers();
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      
      toast({
        title: "Unexpected Error",
        description: `An unexpected error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
    
    setApproving(null);
  };

  const approveEditRequest = async (userId: string) => {
    setApproving(userId);
    
    try {

      
      const { error } = await supabase
        .from("profiles")
        .update({ 
          is_edit_allowed: true, 
          is_request_edit: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        console.error("Error approving edit request:", error);
        
        toast({
          title: "Edit Approval Failed",
          description: `Failed to approve edit request: ${error.message || 'Unknown error'}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Edit Request Approved",
          description: "User edit request has been approved successfully.",
          variant: "default",
        });
        fetchUsers();
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      
      toast({
        title: "Unexpected Error",
        description: `An unexpected error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
    
    setApproving(null);
  };

  const rejectEditRequest = async (userId: string) => {
    try {

      
      const { error } = await supabase
        .from("profiles")
        .update({ 
          is_request_edit: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        console.error("Error rejecting edit request:", error);
        
        toast({
          title: "Edit Rejection Failed",
          description: `Failed to reject edit request: ${error.message || 'Unknown error'}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Edit Request Rejected",
          description: "User edit request has been rejected successfully.",
          variant: "default",
        });
        fetchUsers();
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      
      toast({
        title: "Unexpected Error",
        description: `An unexpected error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  // Filter users based on search and filter criteria
  const filteredUsers = users.filter(user => {
    // Apply search filter
    if (searchTerm.trim() !== "") {
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = user.display_name?.toLowerCase().includes(searchLower);
      const emailMatch = user.email.toLowerCase().includes(searchLower);
      if (!nameMatch && !emailMatch) return false;
    }
    
    // Apply status filter
    if (filterStatus === "verified") {
      return user.is_verified === true;
    } else if (filterStatus === "not_verified") {
      return user.is_verified === false;
    } else if (filterStatus === "pending_edit") {
      return user.is_request_edit === true && user.is_edit_allowed === false;
    }
    
    return true; // "all" filter
  });

  // Apply pagination to filtered results
  const paginatedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getProvinceName = (provinceCode: string) => {
    const province = provinces.find(p => p.id_province === provinceCode);
    return province ? province.name : provinceCode;
  };

  const getStatusBadge = (user: Profile) => {
    if (user.is_verified) {
      if (user.is_request_edit && !user.is_edit_allowed) {
        return <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs font-medium rounded-full border border-orange-200">Edit Pending</span>;
      }
      return <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded-full border border-green-200">Verified</span>;
    }
    return <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full border border-red-200">Not Verified</span>;
  };

  const getRoleBadge = (role: string) => {
    const roleColors = {
      admin: "bg-purple-100 text-purple-600 border-purple-200",
      coach: "bg-blue-100 text-blue-600 border-blue-200", 
      athlete: "bg-gray-100 text-gray-600 border-gray-200"
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full border ${roleColors[role as keyof typeof roleColors] || roleColors.athlete}`}>{role}</span>;
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            {showDeletedUsers ? "Deleted Users" : "Users Management"}
          </h2>
          <p className="text-gray-600 mt-1">
            {showDeletedUsers 
              ? `Manage deleted users (${deletedUsers.length} users)` 
              : `Manage and verify user accounts (${users.length} users)`
            }
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Toggle Button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowDeletedUsers(false)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !showDeletedUsers
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Active Users
            </button>
            <button
              onClick={() => setShowDeletedUsers(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showDeletedUsers
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Deleted Users
            </button>
          </div>
          
          {/* Add User Button (only show for active users) */}
          {/* {!showDeletedUsers && (
            <Button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          )} */}
        </div>
      </div>

      {/* Search and Filter Section (only show for active users) */}
      {!showDeletedUsers && (
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="pl-10 pr-4 py-3 bg-gray-50/50 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300"
              />
            </div>
            
            {/* Filter Dropdown */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(1);
                }}
                className="pl-10 pr-8 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 appearance-none min-w-[200px]"
              >
                <option value="all">All Users</option>
                <option value="verified">Verified</option>
                <option value="not_verified">Not Verified</option>
                <option value="pending_edit">Pending Edit Requests</option>
              </select>
            </div>
          </div>
          
          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredUsers.length} users (Page {page} of {totalPages})
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  User Info
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Contact Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Role & Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  KTP Photo
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                      <span className="ml-2">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : showDeletedUsers ? (
                // Show deleted users
                deletedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      No deleted users found
                    </td>
                  </tr>
                ) : (
                  deletedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors duration-200 group">
                      {/* User Info */}
                      <td className="px-6 py-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-red-600 transition-colors duration-200">
                              {user.display_name || "No Name"}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Member: {user.member_code || "No Code"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact Details */}
                      <td className="px-6 py-6">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <Mail className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{user.email}</p>
                              <p className="text-xs text-gray-500">Email</p>
                            </div>
                          </div>
                          {user.birth_date && (
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-orange-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{user.birth_date}</p>
                                <p className="text-xs text-gray-500">Birth Date</p>
                              </div>
                            </div>
                          )}
                          {user.province_code && (
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <MapPin className="w-4 h-4 text-purple-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{getProvinceName(user.province_code)}</p>
                                <p className="text-xs text-gray-500">Province</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Role & Status */}
                      <td className="px-6 py-6">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Shield className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="space-y-1">
                              {getRoleBadge(user.role)}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </div>
                            <div className="space-y-1">
                              <Badge variant="destructive">Deleted</Badge>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* KTP Photo */}
                      <td className="px-6 py-6">
                        <div className="flex items-center justify-center">
                          {user.id_photo_url ? (
                            <div className="relative group/img">
                              <img
                                src={user.id_photo_url ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${user.id_photo_url}` : undefined}
                                alt="KTP"
                                onClick={() => {
                                  if (user.id_photo_url) {
                                    setZoomImageUrl(user.id_photo_url);
                                  }
                                }}
                                className="h-16 w-auto max-w-[80px] object-contain border border-gray-200 rounded-lg cursor-pointer hover:scale-105 transition-transform duration-200 shadow-sm"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 rounded-lg transition-colors duration-200 flex items-center justify-center">
                                <Eye className="w-4 h-4 text-white opacity-0 group-hover/img:opacity-100 transition-opacity duration-200" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                              <IdCard className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-6">
                        <div className="flex items-center justify-center space-x-2">
                          {/* Restore Button */}
                          <button
                            onClick={() => handleRestoreUser(user.id)}
                            className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                            title="Restore User"
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span>Restore User</span>
                          </button>
                          
                          {/* View User Button */}
                          <button
                            onClick={() => handleViewUser(user)}
                            className="w-10 h-10 bg-gray-100 hover:bg-green-100 rounded-lg flex items-center justify-center transition-colors duration-200 group/btn"
                            title="View User Details"
                          >
                            <Eye className="w-4 h-4 text-gray-600 group-hover/btn:text-green-600 transition-colors duration-200" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )
              ) : (
                // Show active users (existing logic)
                filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user, index) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors duration-200 group">
                      {/* User Info */}
                      <td className="px-6 py-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-red-600 transition-colors duration-200">
                              {user.display_name || "No Name"}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Member: {user.member_code || "No Code"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact Details */}
                      <td className="px-6 py-6">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <Mail className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{user.email}</p>
                              <p className="text-xs text-gray-500">Email</p>
                            </div>
                          </div>
                          {user.birth_date && (
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-orange-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{user.birth_date}</p>
                                <p className="text-xs text-gray-500">Birth Date</p>
                              </div>
                            </div>
                          )}
                          {user.province_code && (
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <MapPin className="w-4 h-4 text-purple-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{getProvinceName(user.province_code)}</p>
                                <p className="text-xs text-gray-500">Province</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Role & Status */}
                      <td className="px-6 py-6">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Shield className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="space-y-1">
                              {getRoleBadge(user.role)}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                              {user.is_verified ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                            </div>
                            <div className="space-y-1">
                              {getStatusBadge(user)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* KTP Photo */}
                      <td className="px-6 py-6">
                        <div className="flex items-center justify-center">
                          {user.id_photo_url ? (
                            <div className="relative group/img">
                              <img
                                src={user.id_photo_url ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${user.id_photo_url}` : undefined}
                                alt="KTP"
                                onClick={() => {
                                  if (user.id_photo_url) {
                                    setZoomImageUrl(user.id_photo_url);
                                  }
                                }}
                                className="h-16 w-auto max-w-[80px] object-contain border border-gray-200 rounded-lg cursor-pointer hover:scale-105 transition-transform duration-200 shadow-sm"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 rounded-lg transition-colors duration-200 flex items-center justify-center">
                                <Eye className="w-4 h-4 text-white opacity-0 group-hover/img:opacity-100 transition-opacity duration-200" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                              <IdCard className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-6">
                        <div className="flex items-center justify-center space-x-2">
                          {/* View User Button - Always visible */}
                          <button
                            onClick={() => handleViewUser(user)}
                            className="w-10 h-10 bg-gray-100 hover:bg-green-100 rounded-lg flex items-center justify-center transition-colors duration-200 group/btn"
                            title="View User Details"
                          >
                            <Eye className="w-4 h-4 text-gray-600 group-hover/btn:text-green-600 transition-colors duration-200" />
                          </button>

                          {!user.is_verified ? (
                            /* User belum verified - tampilkan button approve */
                            <button
                              onClick={() => approveUser(user.id)}
                              disabled={approving === user.id}
                              className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 flex items-center space-x-2"
                              title="Approve User"
                            >
                              {/* <UserCheck className="w-4 h-4" /> */}
                              <span>{approving === user.id ? "Approving..." : "Approve User"}</span>
                            </button>
                          ) : user.is_verified && user.is_request_edit && !user.is_edit_allowed ? (
                            /* User sudah verified tapi request edit - tampilkan button approve edit */
                            <div className="flex space-x-2">
                              <button
                                onClick={() => approveEditRequest(user.id)}
                                disabled={approving === user.id}
                                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 flex items-center space-x-2"
                                title="Approve Edit Request"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>{approving === user.id ? "Approving..." : "Approve Edit"}</span>
                              </button>
                              <button
                                onClick={() => rejectEditRequest(user.id)}
                                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                                title="Reject Edit Request"
                              >
                                <XCircle className="w-4 h-4" />
                                <span>Reject</span>
                              </button>
                            </div>
                          ) : (
                            /* User sudah verified dan tidak ada pending request - tampilkan edit/delete */
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(user)}
                                className="w-10 h-10 bg-gray-100 hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors duration-200 group/btn"
                                title="Edit User"
                              >
                                <Edit className="w-4 h-4 text-gray-600 group-hover/btn:text-blue-600 transition-colors duration-200" />
                              </button>
                              <button
                                onClick={() => handleDelete(user.id)}
                                className="w-10 h-10 bg-gray-100 hover:bg-red-100 rounded-lg flex items-center justify-center transition-colors duration-200 group/btn"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4 text-gray-600 group-hover/btn:text-red-600 transition-colors duration-200" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
          
          {/* Empty State */}
          {filteredUsers.length === 0 && !loading && !showDeletedUsers && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500">
                {searchTerm || filterStatus !== "all" 
                  ? "Try adjusting your search or filter criteria" 
                  : "No users have been registered yet"}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!showDeletedUsers && totalPages > 1 && (
          <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <Button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                variant="outline"
                className="text-gray-600 border-gray-300 hover:bg-gray-100"
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <Button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                variant="outline"
                className="text-gray-600 border-gray-300 hover:bg-gray-100"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editUser && (
        <Modal
          title="Edit User"
          onClose={() => setEditUser(null)}
          onSave={() => handleSaveEdit(editUser)}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Display Name</label>
                <input
                  type="text"
                  value={editUser?.display_name || ""}
                  onChange={(e) =>
                    setEditUser({ ...editUser, display_name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300"
                  placeholder="Enter display name..."
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Role</label>
                <select
                  value={editUser?.role || "user"}
                  onChange={(e) =>
                    setEditUser({ ...editUser, role: e.target.value as any })
                  }
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300"
                >
                  <option value="athlete">Athlete</option>
                  <option value="coach">Coach</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Gender</label>
                <select
                  value={editUser?.gender || ""}
                  onChange={(e) =>
                    setEditUser({ ...editUser, gender: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300"
                >
                  <option value="">Select gender...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Birth Date</label>
                <input
                  type="date"
                  value={editUser?.birth_date || ""}
                  onChange={(e) =>
                    setEditUser({ ...editUser, birth_date: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Province</label>
              <select
                value={editUser?.province_code || ""}
                onChange={(e) =>
                  setEditUser({ ...editUser, province_code: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300"
              >
                <option value="">Select province...</option>
                {provinces.map((province) => (
                  <option key={province.id_province} value={province.id_province}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Modal>
      )}

      {/* View User Details Modal */}
      {viewUser && (
        <Modal
          title="User Details"
          onClose={() => setViewUser(null)}
          onSave={undefined}
        >
          <div className="space-y-6">
            {/* User Basic Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600">Display Name</label>
                  <p className="text-sm font-medium text-gray-900">{viewUser.display_name || "No Name"}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Member Code</label>
                  <p className="text-sm font-medium text-gray-900">{viewUser.member_code || "No Code"}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Email</label>
                  <p className="text-sm font-medium text-gray-900">{viewUser.email}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Role</label>
                  <div className="mt-1">{getRoleBadge(viewUser.role)}</div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Gender</label>
                  <p className="text-sm font-medium text-gray-900">{viewUser.gender || "Not specified"}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Birth Date</label>
                  <p className="text-sm font-medium text-gray-900">{viewUser.birth_date || "Not specified"}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Province</label>
                  <p className="text-sm font-medium text-gray-900">
                    {viewUser.province_code ? getProvinceName(viewUser.province_code) : "Tidak diketahui"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Status</label>
                  <div className="mt-1">{getStatusBadge(viewUser)}</div>
                </div>
              </div>
            </div>

            {/* KTP Photo Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <IdCard className="w-5 h-5 text-green-600" />
                KTP Photo Verification
              </h3>
              
              {viewUser.id_photo_url ? (
                <div className="space-y-4">
                  {/* Large KTP Image */}
                  <div className="flex justify-center">
                    <div className="relative max-w-2xl">
                      <img
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${viewUser.id_photo_url}`}
                        alt="KTP Photo"
                        className="w-full h-auto max-h-96 object-contain border border-gray-200 rounded-lg shadow-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="flex items-center justify-center w-full h-32 text-gray-400 border border-gray-200 rounded-lg"><span class="text-sm">KTP image not found</span></div>';
                          }
                        }}
                      />
                      
                      {/* Zoom Button */}
                      <button
                        onClick={() => {
                          if (viewUser.id_photo_url) {
                            setZoomImageUrl(viewUser.id_photo_url);
                          }
                        }}
                        className="absolute top-2 right-2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200 group"
                        title="Zoom KTP Image"
                      >
                        <Eye className="w-4 h-4 text-gray-600 group-hover:text-green-600" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Image Info */}
                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      Image Path: {viewUser.id_photo_url}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Click the eye icon to zoom in for detailed verification
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <IdCard className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No KTP Photo Uploaded</p>
                  <p className="text-sm text-gray-400 mt-1">User has not uploaded their KTP photo yet</p>
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Additional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600">Created At</label>
                  <p className="text-sm font-medium text-gray-900">
                    {viewUser.created_at ? new Date(viewUser.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Not available'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Last Updated</label>
                  <p className="text-sm font-medium text-gray-900">
                    {viewUser.updated_at ? new Date(viewUser.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Not available'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* KTP Image Zoom Modal */}
      {zoomImageUrl && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setZoomImageUrl(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white p-4 rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setZoomImageUrl(null)}
              className="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 p-2 rounded-full transition-colors duration-200"
            >
              <XCircle className="w-4 h-4" />
            </button>
            <img
              src={zoomImageUrl ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${zoomImageUrl}` : undefined}
              alt="Zoomed KTP"
              className="object-contain max-h-[80vh] w-full mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
}
