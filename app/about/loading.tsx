import { Skeleton } from "@/components/ui/skeleton"

export default function AboutLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header skeleton */}
      <div className="h-16 border-b bg-white">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="hidden md:flex space-x-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-20" />
            ))}
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-10 w-48 mb-8" />

          <div className="space-y-8">
            {/* Cards skeleton */}
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="border rounded-lg">
                <div className="p-6 border-b">
                  <Skeleton className="h-6 w-40" />
                </div>
                <div className="p-6">
                  {i === 0 ? (
                    <Skeleton className="h-20 w-full" />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {Array.from({ length: 3 }).map((_, j) => (
                        <div key={j} className="text-center">
                          <Skeleton className="h-24 w-full rounded-lg mb-4" />
                          <Skeleton className="h-4 w-3/4 mx-auto" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
