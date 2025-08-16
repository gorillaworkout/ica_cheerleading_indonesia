"use client";

import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { fetchProvinces } from "@/features/provinces/provincesSlice";
import { useEffect, useState } from "react";
import { Edit, Trash, Search, Filter, Plus, Eye, MoreVertical, MapPin, Trophy, Award, Medal } from "lucide-react";
import { FullScreenLoader } from "@/components/ui/fullScreenLoader";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Use the Province interface from Redux store and extend it for our use
interface ExtendedProvince {
  id_province: string;
  name: string;
  logo?: string | File;
  total_gold?: number;
  total_silver?: number;
  total_bronze?: number;
  total_points?: number;
  [key: string]: any;
}

export function ProvinceTable() {
  const dispatch = useAppDispatch();
  const { provinces, loading, error } = useAppSelector((state) => state.provinces);
  const [editProvince, setEditProvince] = useState<ExtendedProvince | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchProvinces());
  }, [dispatch]);

  const handleEdit = (province: any) => {
    setEditProvince(province);
  };

  const handleSaveEdit = async (updatedProvince: ExtendedProvince): Promise<void> => {
    try {
      let newLogoUrl = updatedProvince.logo;

      if (updatedProvince.logo && updatedProvince.logo instanceof File) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("uploads")
          .upload(`provinces/${updatedProvince.id_province}-${updatedProvince.logo.name}`, updatedProvince.logo);

        if (uploadError) {
          console.error("Error uploading logo:", uploadError);
          return;
        }

        newLogoUrl = uploadData?.path;
      }

      const { error } = await supabase
        .from("provinces")
        .update({
          name: updatedProvince.name,
          logo: typeof newLogoUrl === 'string' ? newLogoUrl : undefined,
        })
        .eq("id_province", updatedProvince.id_province);

      if (error) {
        console.error("Error updating province:", error);
        return;
      }

      toast({
        title: "Edit Successful",
        description: "The province has been updated successfully.",
      });
      setEditProvince(null);
      dispatch(fetchProvinces());
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("provinces").delete().eq("id_province", id);
      if (error) {
        console.error("Error deleting province:", error);
        return;
      }
      toast({
        title: "Delete Successful",
        description: "The province has been deleted successfully.",
      });
      dispatch(fetchProvinces());
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  // Convert provinces to extended format for easier use
  const extendedProvinces = provinces.map(province => ({
    ...province,
    logo: (province as any).logo || null,
  }));

  // Filter and search logic - simplified
  const filteredProvinces = extendedProvinces
    ?.filter((province) => {
      return province.name.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => parseInt(a.id_province) - parseInt(b.id_province)) || [];

  if (loading) return <FullScreenLoader />;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Provinces Management</h2>
          <p className="text-gray-600 mt-1">Manage and monitor all participating provinces</p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search provinces by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 bg-gray-50/50 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300"
            />
          </div>
        </div>
        
        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredProvinces.length} of {provinces?.length || 0} provinces
        </div>
      </div>

      {/* Standard Table Section */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border rounded-lg bg-white">
          <thead className="bg-gray-100 text-xs uppercase">
            <tr>
              <th className="p-2 border">No</th>
              <th className="p-2 border">Province Name</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredProvinces.map((province, index) => (
              <tr key={province.id_province} className="text-center hover:bg-gray-50">
                <td className="p-2 border">{index + 1}</td>
                <td className="p-2 border font-medium">{province.name}</td>
                <td className="p-2 border">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => handleEdit(province)}
                      className="text-blue-600 hover:text-blue-800 text-xs bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                      title="Edit Province"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(province.id_province)}
                      className="text-red-600 hover:text-red-800 text-xs bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors"
                      title="Delete Province"
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
        {filteredProvinces.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No provinces found</h3>
            <p className="text-gray-500">
              {searchTerm 
                ? "Try adjusting your search criteria" 
                : "Get started by adding your first province"}
            </p>
          </div>
        )}
      </div>

      {/* Edit Province Modal */}
      {editProvince && (
        <Modal
          title="Edit Province"
          onClose={() => setEditProvince(null)}
          onSave={() => handleSaveEdit(editProvince)}
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Province Name</label>
              <input
                type="text"
                value={editProvince?.name || ""}
                onChange={(e) =>
                  setEditProvince({ ...editProvince, name: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300"
                placeholder="Enter province name..."
              />
            </div>

            {/* <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Province Logo</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setEditProvince({ ...editProvince, logo: file });
                    }
                  }}
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Supported formats: JPG, PNG, WebP. Maximum size: 5MB
                </p>
              </div>
            </div> */}
          </div>
        </Modal>
      )}
    </div>
  );
}
