"use client"
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Modal } from "@/components/ui/modal";
import { Edit, Trash } from "lucide-react";

export default function AddProvinceForm() {
  const [formData, setFormData] = useState({
    name: "",
  });
  type Province = { id_province: string; name: string };
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [editModal, setEditModal] = useState<{ id_province: string; name: string } | null>(null);

  useEffect(() => {
    const fetchProvinces = async () => {
      const { data, error } = await supabase
        .from("provinces")
        .select("id_province, name")
        .order("id_province", { ascending: true }); // Order by id_province in ascending order

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }

      setProvinces(data || []);
    };

    fetchProvinces();
  }, []);

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

    setFormData({
      name: "",
    });

    // Refresh the provinces list
    const { data, error: fetchProvincesError } = await supabase.from("provinces").select("id_province, name");

    if (!fetchProvincesError) {
      setProvinces(data || []);
    }
  };

  const handleEditModalSubmit = async () => {
    if (!editModal) return;

    const { id_province, name } = editModal;

    const { error } = await supabase
      .from("provinces")
      .update({ name: name.toUpperCase() })
      .eq("id_province", id_province);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Province updated successfully." });

    setEditModal(null);

    // Refresh the provinces list
    const { data, error: fetchProvincesError } = await supabase.from("provinces").select("id_province, name");

    if (!fetchProvincesError) {
      setProvinces(data || []);
    }
  };

  const handleDelete = async (id_province: string) => {
    const { error } = await supabase
      .from("provinces")
      .delete()
      .eq("id_province", id_province);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Province deleted successfully." });

    // Refresh the provinces list
    const { data, error: fetchProvincesError } = await supabase.from("provinces").select("id_province, name");

    if (!fetchProvincesError) {
      setProvinces(data || []);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Province Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <Button type="submit" className="bg-red-600 hover:bg-red-700">
          Add Province
        </Button>
      </form>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Existing Provinces</h2>
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2">Province ID</th>
              <th className="border border-gray-300 px-4 py-2">Province Name</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {provinces.map((province) => (
              <tr key={province.id_province} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {province.id_province.toString().padStart(3, "0")}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">{province.name}</td>
                <td className="border border-gray-300 px-4 py-2 text-center flex justify-center space-x-2">
                  <Edit
                    onClick={() => setEditModal(province)}
                    className="h-5 w-5 text-gray-600 hover:text-gray-900 cursor-pointer"
                  />
                  <Trash
                    onClick={() => handleDelete(province.id_province)}
                    className="h-5 w-5 text-red-600 hover:text-red-800 cursor-pointer"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editModal && (
        <Modal
          title="Edit Province"
          onClose={() => setEditModal(null)}
          onSave={handleEditModalSubmit}
        >
          <form className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Province Name</Label>
              <Input
                id="edit-name"
                value={editModal.name}
                onChange={(e) =>
                  setEditModal((prev) => (prev ? { ...prev, name: e.target.value } : null))
                }
                required
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}