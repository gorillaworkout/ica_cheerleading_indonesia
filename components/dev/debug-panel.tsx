"use client"

import { useSelector, useDispatch } from "react-redux"
import { useAppSelector } from "@/lib/redux/hooks"
import { fetchNews, testSupabaseConnection } from "@/features/news/newsSlice"

export function DebugPanel() {
  const newsState = useSelector((state: any) => state.news)
  const { user } = useAppSelector((state) => state.auth)
  const dispatch = useDispatch()
  
  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null
  }
  
  const handleRefreshNews = () => {
    dispatch(fetchNews() as any);
  }
  
  const handleTestConnection = () => {
    dispatch(testSupabaseConnection() as any);
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs max-w-xs z-50">
      <h3 className="font-bold mb-2">🐛 Debug Panel</h3>
      <div className="space-y-1 mb-3">
        <div>ENV: {process.env.NODE_ENV}</div>
        <div>News Status: {newsState.status}</div>
        <div>News Count: {newsState.newsList?.length || 0}</div>
        <div>News Error: {newsState.error || 'None'}</div>
        <div>User: {user ? '✅ Authenticated' : '❌ Not authenticated'}</div>
        <div>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</div>
      </div>
      <div className="space-y-2">
        <button 
          onClick={handleRefreshNews}
          className="w-full bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
        >
          🔄 Refresh News
        </button>
        <button 
          onClick={handleTestConnection}
          className="w-full bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs"
        >
          🧪 Test Connection
        </button>
      </div>
    </div>
  )
}
