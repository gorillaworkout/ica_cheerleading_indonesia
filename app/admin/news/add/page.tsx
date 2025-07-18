import type { Metadata } from "next"

import { AddNewsForm } from "@/components/admin/add-news-form"
import { NewsTable } from "@/components/admin/news-table"

export const metadata: Metadata = {
  title: "Add Divisions",
  description: "Create a new competition in the ICA system.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function AddNewsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New News</h1>
        <p className="text-gray-600 mt-2">Create a new News event</p>
      </div>
      <AddNewsForm />
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900">Existing Divisions</h2>
        <NewsTable />
      </div>
    </div>
  )
}
