import AddProvinceForm from "@/components/admin/add-province-form"
import { ProvinceTable } from "@/components/admin/province-table"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Add Province",
  description: "Create a new province in the ICA system.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function AddProvincePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Province Management</h1>
        <p className="text-gray-600 mt-2">Add and manage provinces for competitions</p>
      </div>
      <div className="space-y-8">
        <AddProvinceForm />
        <ProvinceTable />
      </div>
    </div>
  )
}
