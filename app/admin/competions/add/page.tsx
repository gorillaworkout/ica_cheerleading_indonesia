import type { Metadata } from "next"
import { AddCompetitionForm } from "@/components/admin/add-competition-form"
import { CompetitionsTable } from "@/components/admin/competitions-table"

export const metadata: Metadata = {
  title: "Add Competition",
  description: "Create a new competition in the ICA system.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function AddCompetionPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New Competition</h1>
        <p className="text-gray-600 mt-2">Create a new competition event</p>
      </div>
      <AddCompetitionForm />
      <div className="mt-12">
        <CompetitionsTable />
      </div>
    </div>
  )
}
