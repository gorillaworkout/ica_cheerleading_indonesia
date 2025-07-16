"use client";

import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { fetchDivisions } from "@/features/divisions/divisionsSlice";
import { useEffect } from "react";
import { Edit, Trash } from "lucide-react";

export function DivisionsTable() {
  const dispatch = useAppDispatch();
  const { divisions, loading, error } = useAppSelector((state) => state.divisions);

  useEffect(() => {
    dispatch(fetchDivisions());
  }, [dispatch]);

  const handleEdit = (id: string) => {
    console.log("Edit division with ID:", id);
    // Implement edit logic here
  };

  const handleDelete = (id: string) => {
    console.log("Delete division with ID:", id);
    // Implement delete logic here
  };

  if (loading) return <p>Loading divisions...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="overflow-x-auto">
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Name</th>
            <th className="border border-gray-300 px-4 py-2">Age Group</th>
            <th className="border border-gray-300 px-4 py-2">Skill Level</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {divisions.map((division) => (
            <tr key={division.id}>
              <td className="border border-gray-300 px-4 py-2">{division.name}</td>
              <td className="border border-gray-300 px-4 py-2">{division.age_group}</td>
              <td className="border border-gray-300 px-4 py-2">{division.skill_level}</td>
              <td className="border border-gray-300 px-4 py-2 flex justify-center space-x-2">
                <Edit
                  onClick={() => handleEdit(division.id)}
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
    </div>
  );
}
