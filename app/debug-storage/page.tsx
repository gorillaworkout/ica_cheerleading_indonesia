"use client"
import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function DebugSupabase() {
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [buckets, setBuckets] = useState<any[]>([])

  const listBuckets = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.storage.listBuckets()
      if (error) {
        console.error("Error listing buckets:", error)
      } else {
        setBuckets(data || [])
        console.log("Buckets:", data)
      }
    } catch (err) {
      console.error("Error:", err)
    }
    setLoading(false)
  }

  const listFiles = async (bucketName: string, folder: string = "") => {
    setLoading(true)
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list(folder, {
          limit: 100,
          offset: 0,
        })
      
      if (error) {
        console.error("Error listing files:", error)
      } else {
        setFiles(data || [])
        console.log("Files in", bucketName, folder ? `/${folder}` : "", ":", data)
      }
    } catch (err) {
      console.error("Error:", err)
    }
    setLoading(false)
  }

  const searchPdfFiles = async (bucketName: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list("", {
          search: "670-juklak"
        })
      
      if (error) {
        console.error("Error searching files:", error)
      } else {
        setFiles(data || [])
        console.log("PDF search results:", data)
      }
    } catch (err) {
      console.error("Error:", err)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Debug Supabase Storage</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={() => listBuckets()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Loading..." : "List All Buckets"}
          </button>
          
          <button
            onClick={() => listFiles("uploads")}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ml-2"
            disabled={loading}
          >
            List Files in "uploads" (root)
          </button>
          
          <button
            onClick={() => listFiles("uploads", "public")}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ml-2"
            disabled={loading}
          >
            List Files in "uploads/public"
          </button>
          
          <button
            onClick={() => searchPdfFiles("uploads")}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 ml-2"
            disabled={loading}
          >
            Search for "670-juklak"
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Buckets ({buckets.length})</h2>
            <div className="bg-gray-100 p-4 rounded max-h-60 overflow-y-auto">
              {buckets.map((bucket, index) => (
                <div key={index} className="mb-2 p-2 bg-white rounded">
                  <strong>{bucket.name}</strong>
                  <br />
                  <small>Created: {bucket.created_at}</small>
                  <br />
                  <button
                    onClick={() => listFiles(bucket.name)}
                    className="text-blue-600 hover:underline text-sm mt-1 mr-2"
                  >
                    List files (root)
                  </button>
                  <button
                    onClick={() => listFiles(bucket.name, "public")}
                    className="text-green-600 hover:underline text-sm mt-1"
                  >
                    List files (public folder)
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Files ({files.length})</h2>
            <div className="bg-gray-100 p-4 rounded max-h-60 overflow-y-auto">
              {files.map((file, index) => (
                <div key={index} className="mb-2 p-2 bg-white rounded">
                  <strong>{file.name}</strong>
                  <br />
                  <small>Size: {file.metadata?.size || 'Unknown'} bytes</small>
                  <br />
                  <small>Modified: {file.updated_at}</small>
                  {file.name.endsWith('.pdf') && (
                    <div className="mt-1">
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">PDF</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
