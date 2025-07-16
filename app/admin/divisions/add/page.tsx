import type { Metadata } from "next"

import { AddDivisionForm } from "@/components/admin/add-division-form"
import { DivisionsTable } from "@/components/admin/divisions-table"

export const metadata: Metadata = {
  title: "Add Divisions",
  description: "Create a new competition in the ICA system.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function AddDivisionPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New Division</h1>
        <p className="text-gray-600 mt-2">Create a new division event</p>
      </div>
      <AddDivisionForm />
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900">Existing Divisions</h2>
        <DivisionsTable />
      </div>
    </div>
  )
}
