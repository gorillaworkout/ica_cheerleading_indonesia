"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FullScreenLoader } from "@/components/ui/fullScreenLoader";
import { Modal } from "@/components/ui/modal";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { fetchProvinces } from "@/features/provinces/provincesSlice";
import { 
  Edit, 
  Trash, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  MoreVertical, 
  User, 
  Shield, 
  CheckCircle, 
  XCircle,
  Mail,
  Calendar,
  MapPin,
  UserCheck,
  UserX,
  IdCard
} from "lucide-react";
import type { Profile } from "@/types/profiles/profiles";
import { getPublicImageUrl } from "@/utils/getPublicImageUrl";

const PAGE_SIZE = 10;

export function UsersTable() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<Profile | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);
  
  const dispatch = useAppDispatch();
  const { provinces } = useAppSelector((state) => state.provinces);
  const { toast } = useToast();

  useEffect(() => {
    dispatch(fetchProvinces());
  }, [dispatch]);

  useEffect(() => {
    fetchUsers();
  }, [filterStatus, searchTerm, page]);

  const fetchUsers = async () => {
    setLoading(true);

    let query = supabase
      .from("profiles")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (filterStatus === "verified") {
      query = query.eq("is_verified", true);
    } else if (filterStatus === "not_verified") {
      query = query.eq("is_verified", false);
    } else if (filterStatus === "pending_edit") {
      query = query.eq("is_request_edit", true).eq("is_edit_allowed", false);
    }

    if (searchTerm.trim() !== "") {
      query = query.ilike("display_name", `%${searchTerm.trim()}%`);
    }

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to fetch users.",
        variant: "destructive",
      });
    } else {
      setUsers(data || []);
      setTotalPages(Math.ceil((count || 0) / PAGE_SIZE));
    }
    setLoading(false);
  };

  const handleEdit = (user: Profile) => {
    setEditUser(user);
  };

  const handleSaveEdit = async (updatedUser: Profile): Promise<void> => {
    try {
      console.log("Updating user with data:", {
        id: updatedUser.id,
        display_name: updatedUser.display_name,
        role: updatedUser.role,
        gender: updatedUser.gender,
        birth_date: updatedUser.birth_date,
        province_code: updatedUser.province_code,
      });

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
      console.log("Deleting user with ID:", id);
      
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) {
        console.error("Error deleting user:", error);
        
        toast({
          title: "Delete Failed",
          description: `Failed to delete user: ${error.message || 'Unknown error'}`,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Delete Successful",
        description: "The user has been deleted successfully.",
        variant: "default",
      });
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

  const approveUser = async (userId: string) => {
    setApproving(userId);
    
    try {
      console.log("Approving user with ID:", userId);
      
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
      console.log("Approving edit request for user ID:", userId);
      
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
      console.log("Rejecting edit request for user ID:", userId);
      
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
  const filteredUsers = users;

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

  if (loading && users.length === 0) return <FullScreenLoader />;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Users Management</h2>
          <p className="text-gray-600 mt-1">Manage and verify user accounts</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Search and Filter Section */}
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
          Showing {users.length} users (Page {page} of {totalPages})
        </div>
      </div>

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
              {filteredUsers.map((user, index) => (
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
                            onClick={() => setZoomImageUrl(user.id_photo_url!)}
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
                      {!user.is_verified ? (
                        /* User belum verified - tampilkan button approve */
                        <button
                          onClick={() => approveUser(user.id)}
                          disabled={approving === user.id}
                          className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 flex items-center space-x-2"
                          title="Approve User"
                        >
                          <UserCheck className="w-4 h-4" />
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
                            <Trash className="w-4 h-4 text-gray-600 group-hover/btn:text-red-600 transition-colors duration-200" />
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Empty State */}
          {filteredUsers.length === 0 && !loading && (
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
        {totalPages > 1 && (
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
