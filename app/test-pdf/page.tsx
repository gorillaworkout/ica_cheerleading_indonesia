"use client"
import { getDirectPdfUrl } from "@/utils/getPublicPdfUrl"

export default function TestPdf() {
  const handleTestClick = () => {
    const pdfUrl = getDirectPdfUrl("670-juklak.pdf")
    console.log("PDF URL:", pdfUrl)
    window.open(pdfUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Test PDF Link</h1>
        <button
          onClick={handleTestClick}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
        >
          Test Open PDF
        </button>
      </div>
    </div>
  )
}
