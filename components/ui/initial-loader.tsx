export default function InitialLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <img src="/ica-text.webp" alt="ICA Logo" className="h-32 w-auto animate-pulse" />
        <div className="text-lg font-semibold text-red-600 animate-pulse">Loading ICA Cheerleading...</div>
        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-2 bg-red-500 rounded-full animate-loader-bar" style={{ width: '80%' }} />
        </div>
      </div>
      <style jsx>{`
        @keyframes loader-bar {
          0% { width: 0%; }
          50% { width: 80%; }
          100% { width: 100%; }
        }
        .animate-loader-bar {
          animation: loader-bar 1.2s infinite alternate;
        }
      `}</style>
    </div>
  )
}
