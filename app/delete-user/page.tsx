// app/admin/delete-user/page.tsx
"use client"

import { useState } from "react"

export default function DeleteUserPage() {
  const [userId, setUserId] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!userId) {
      setMessage("Please enter a user ID.")
      return
    }

    setLoading(true)
    setMessage(null)

    const res = await fetch("/api/admin/delete-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })

    const data = await res.json()

    if (res.ok) {
      setMessage("✅ User deleted successfully.")
    } else {
      setMessage(`❌ Failed to delete user: ${data.error}`)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full border p-6 rounded-lg shadow space-y-4">
        <h1 className="text-xl font-semibold text-gray-800">Delete Supabase User</h1>
        <input
          type="text"
          placeholder="Enter user ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <button
          onClick={handleDelete}
          disabled={loading}
          className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded transition"
        >
          {loading ? "Deleting..." : "Delete User"}
        </button>
        {message && <p className="text-sm text-center text-gray-700">{message}</p>}
      </div>
    </div>
  )
}
