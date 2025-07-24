"use client"

import { useAppSelector } from "@/lib/redux/hooks"
import { getPublicImageUrl } from "@/utils/getPublicImageUrl"
import { ArrowLeft, ExternalLink } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"

export default function IDPhotoPage() {
  const { profile } = useAppSelector((state) => state.auth)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  if (!profile)
    return (
      <div className="h-screen flex items-center justify-center text-gray-600 bg-white">
        Loading profile...
      </div>
    )

  useEffect(() => {
    if (profile?.id_photo_url) {
      getPublicImageUrl(profile.id_photo_url).then(setImageUrl)
    }
  }, [profile?.id_photo_url])

  if (!profile.id_photo_url)
    return (
      <div className="h-screen flex flex-col items-center justify-center text-center text-gray-600 bg-white px-4">
        <p className="text-lg font-medium">ID Photo not uploaded.</p>
        <Link
          href="/profile"
          className="mt-4 text-red-600 hover:underline flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </Link>
      </div>
    )

  if (!imageUrl)
    return (
      <div className="h-screen flex items-center justify-center text-gray-600 bg-white">
        Loading image...
      </div>
    )


  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-b from-white to-red-50 px-4 relative">
      {/* Back Button */}
      <Link
        href="/profile"
        className="absolute top-6 left-6 text-gray-700 hover:text-red-600 flex items-center gap-2 transition-all"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="text-sm font-medium">Back</span>
      </Link>

      {/* Image Container */}
      <div className="relative max-w-sm w-full bg-white border border-gray-200 shadow-xl rounded-2xl p-6 space-y-5 flex flex-col items-center animate-fade-in">
        <h1 className="text-lg font-bold text-gray-800">Uploaded ID Photo</h1>

        <div className="w-full aspect-[3/4] rounded-lg overflow-hidden border border-red-500 shadow-sm">
          <Image
            src={imageUrl}
            alt="ID Photo"
            width={400}
            height={600}
            className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
            unoptimized
            priority
          />
        </div>

        <a
          href={imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
        >
          View Fullscreen <ExternalLink className="ml-1 h-4 w-4" />
        </a>
      </div>
    </div>
  )
}
