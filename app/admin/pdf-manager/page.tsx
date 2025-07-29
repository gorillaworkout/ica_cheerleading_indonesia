// app/admin/pdf-manager/page.tsx
"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, FileText, Download, Eye } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

type PDFFile = {
  name: string
  url: string
  size: number
  created_at: string
}

export default function PDFManagerPage() {
  const [pdfs, setPdfs] = useState<PDFFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchPDFs = async () => {
    const { data, error } = await supabase.storage.from("uploads").list("public", {
      limit: 100,
      sortBy: { column: "created_at", order: "desc" },
    })

    if (error) {
      // console.error("Fetch error", error)
      toast({
        title: "Error",
        description: "Failed to fetch PDF files.",
        variant: "destructive",
      })
      return
    }

    // Filter hanya file PDF
    const pdfFiles = data.filter(file => 
      file.name.toLowerCase().endsWith('.pdf')
    )

    const urls: PDFFile[] = pdfFiles.map((file) => ({
      name: file.name,
      url: supabase.storage.from("uploads").getPublicUrl(`public/${file.name}`).data.publicUrl,
      size: file.metadata?.size || 0,
      created_at: file.created_at || '',
    }))

    setPdfs(urls)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return

    setUploading(true)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Validasi: hanya PDF
      if (!file.type.includes('pdf')) {
        toast({ 
          title: "Error", 
          description: `File ${file.name} bukan PDF, dilewati.`,
          variant: "destructive"
        })
        continue
      }

      // Validasi: maksimal 2MB
      if (file.size > 2 * 1024 * 1024) {
        toast({ 
          title: "Error", 
          description: `File ${file.name} lebih dari 2MB, dilewati.`,
          variant: "destructive"
        })
        continue
      }

      const timestamp = Date.now().toString().slice(-3);
      const filePath = `public/${timestamp}-${file.name}`;

      const { error } = await supabase.storage.from("uploads").upload(filePath, file)

      if (error) {
        // console.error("Upload error", error)
        toast({
          title: "Error",
          description: `Failed to upload ${file.name}: ${error.message}`,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Success",
          description: `${file.name} uploaded successfully!`,
        })
      }
    }

    await fetchPDFs()
    setUploading(false)
    
    // Reset input
    if (e.target) {
      e.target.value = ''
    }
  }

  const handleDelete = async (fileName: string) => {
    setDeleting(fileName);

    const fullPath = `public/${fileName}`; // pastikan full path benar

    const { error } = await supabase
      .storage
      .from("uploads")
      .remove([fullPath]);

    if (error) {
      // console.error("Delete error", error);
      toast({ 
        title: "Error", 
        description: `Failed to delete: ${error.message}`,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: `${fileName} deleted successfully!`,
      })
      setPdfs((prev) => prev.filter((pdf) => pdf.name !== fileName));
    }
    setDeleting(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handlePreview = (url: string) => {
    window.open(url, '_blank');
  };

  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchPDFs()
  }, [])

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">PDF Manager</h1>
        <div className="text-sm text-gray-600">
          Total: {pdfs.length} files
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">Upload PDF Files</h2>
        <div className="space-y-2">
          <Input 
            type="file" 
            multiple 
            accept=".pdf,application/pdf" 
            onChange={handleUpload} 
            disabled={uploading} 
            className="h-[60px] cursor-pointer"
          />
          <p className="text-xs text-gray-500">
            Hanya file PDF yang diizinkan. Maksimal ukuran file: 2MB per file.
          </p>
        </div>
        
        {uploading && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-blue-500 bg-blue-100">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">PDF Files</h2>
        </div>
        
        {pdfs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p>No PDF files uploaded yet.</p>
          </div>
        ) : (
          <div className="divide-y">
            {pdfs.map((pdf) => (
              <div key={pdf.url} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    <FileText className="h-8 w-8 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {pdf.name}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                      <span>{formatFileSize(pdf.size)}</span>
                      {pdf.created_at && (
                        <span>{new Date(pdf.created_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePreview(pdf.url)}
                    className="h-8 w-8 p-0"
                    title="Preview PDF"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(pdf.url, pdf.name)}
                    className="h-8 w-8 p-0"
                    title="Download PDF"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(pdf.name)}
                    disabled={deleting === pdf.name}
                    className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    title="Delete PDF"
                  >
                    {deleting === pdf.name ? (
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
