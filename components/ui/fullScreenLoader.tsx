// components/ui/FullScreenLoader.tsx
import { Loader2 } from "lucide-react"
import Image from "next/image"

export function FullScreenLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-black transition-colors duration-300">
      <div className="flex flex-col items-center space-y-6 animate-fade-in">
        <Image
          src="/ica-rounded.png"
          alt="ICA Logo"
          width={150}
          height={150}
          className="animate-pulse"
        />
        {/* <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
          <Loader2 className="h-6 w-6 animate-spin text-red-600" />
          <span className="text-lg font-semibold">{message}</span>
        </div> */}
      </div>
    </div>
  )
}
