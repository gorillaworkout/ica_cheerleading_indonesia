// app/age-grid/page.tsx
"use client"

import { useRouter } from "next/navigation"

export default function AgeGridPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-6">
      <div className="w-full max-w-6xl mb-4 flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold">
          Age Grid - ICU Rules
        </h1>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Kembali ke Home
        </button>
      </div>

      <iframe
        src="https://cheerunion.org/education/rules-agegrid/"
        width="100%"
        height="1000"
        className="w-full border rounded-lg"
        sandbox=""
      />
    </div>
  )
}
