// app/gallery/page.tsx
"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

type ImageFile = {
  name: string
  url: string
}

export default function GalleryPage() {
  const [images, setImages] = useState<ImageFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchImages = async () => {
    const { data, error } = await supabase.storage.from("uploads").list("public", {
      limit: 100,
      sortBy: { column: "created_at", order: "desc" },
    })

    if (error) {
      console.error("Fetch error", error)
      return
    }

    const urls: ImageFile[] = data.map((file) => ({
      name: file.name,
      url: supabase.storage.from("uploads").getPublicUrl(`public/${file.name}`).data.publicUrl,
    }))

    setImages(urls)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return

    setUploading(true)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: "Error", description: `File ${file.name} lebih dari 2MB, dilewati.` })
        continue
      }

    const timestamp = Date.now().toString().slice(-3);
    const filePath = `public/${timestamp}-${file.name}`;

      const { error } = await supabase.storage.from("uploads").upload(filePath, file)

      if (error) console.error("Upload error", error)
    }

    await fetchImages()
    setUploading(false)
  }

const handleDelete = async (fileName: string) => {
  setDeleting(fileName);

  const fullPath = `public/${fileName}`; // pastikan full path benar

  const { error } = await supabase
    .storage
    .from("uploads")
    .remove([fullPath]);

  if (error) {
    console.error("Delete error", error);
    toast({ title: "Error", description: error.message });
  } else {

    setImages((prev) => prev.filter((img) => img.name !== fileName));
  }
  setDeleting(null);
};



  useEffect(() => {
    fetchImages()
  }, [])

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">Gallery Uploads</h1>

      <Input type="file" multiple accept="image/*" onChange={handleUpload} disabled={uploading} className="h-[100px]" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((img) => (
          <div key={img.url} className="relative group">
            <img
              src={img.url}
              alt={img.name}
              className="rounded border object-cover w-full h-40"
            />
            <p className="text-xs mt-1 break-words">{img.name}</p>

            <button
              onClick={() => handleDelete(img.name)}
              disabled={deleting === img.name}
              className="absolute top-2 right-2 bg-white/80 rounded-full p-1 hover:bg-red-600 hover:text-white transition"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
