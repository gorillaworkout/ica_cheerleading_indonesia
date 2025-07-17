import AddProvinceForm from "@/components/admin/add-province-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Add Province",
  description: "Create a new competition in the ICA system.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function AddProvincePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add Province</h1>
        <p className="text-gray-600 mt-2">Add province for a competition event</p>
      </div>
      <AddProvinceForm />
    </div>
  )
}
