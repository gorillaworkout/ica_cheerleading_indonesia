"use client"
import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function UploadPdf() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const uploadFile = async () => {
    if (!file) return

    setUploading(true)
    
    try {
      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from("uploads")
        .upload("670-juklak.pdf", file, {
          cacheControl: "3600",
          upsert: true // This will overwrite if file exists
        })

      if (error) {
        console.error("Upload error:", error)
        alert("Upload failed: " + error.message)
      } else {
        console.log("Upload successful:", data)
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from("uploads")
          .getPublicUrl("670-juklak.pdf")
        
        setUploadedUrl(urlData.publicUrl)
        alert("File uploaded successfully!")
      }
    } catch (err) {
      console.error("Error:", err)
      alert("Upload failed")
    }
    
    setUploading(false)
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Upload PDF to Supabase</h1>
        
        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Upload 670-juklak.pdf</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select PDF file:
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            
            {file && (
              <div className="text-sm text-gray-600">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
            
            <button
              onClick={uploadFile}
              disabled={!file || uploading}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {uploading ? "Uploading..." : "Upload PDF"}
            </button>
          </div>
          
          {uploadedUrl && (
            <div className="mt-6 p-4 bg-green-100 rounded">
              <h3 className="text-green-800 font-semibold">Upload Successful!</h3>
              <p className="text-green-700 text-sm mt-1">File URL:</p>
              <a 
                href={uploadedUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm break-all"
              >
                {uploadedUrl}
              </a>
            </div>
          )}
        </div>

        <div className="mt-8 bg-yellow-100 p-4 rounded">
          <h3 className="text-yellow-800 font-semibold">Instructions:</h3>
          <ol className="text-yellow-700 text-sm mt-2 list-decimal list-inside space-y-1">
            <li>Select your PDF file (it will be uploaded as "670-juklak.pdf")</li>
            <li>Click "Upload PDF"</li>
            <li>After successful upload, the Age Grid links will work</li>
            <li>The file will be available at: uploads/670-juklak.pdf</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
