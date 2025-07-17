import AddResultsPage from "@/components/admin/add-result-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Add Results",
  description: "Create a new competition in the ICA system.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function AddResultsWrapper() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add Competition Results</h1>
        <p className="text-gray-600 mt-2">Add results for a competition event</p>
      </div>
      <AddResultsPage />
    </div>
  )
}
