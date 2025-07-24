'use client'

import { useState } from 'react'
import { useAppSelector } from "@/lib/redux/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Download, RefreshCw, Loader2, Database, CheckCircle, XCircle } from 'lucide-react'
import { AutoIDCardGenerator } from '@/utils/autoGenerateIdCard'
import { ensureUploadsBucket, ensureIDCardsFolder } from '@/utils/ensureStorageBucket'
import { supabase } from '@/lib/supabase'

export default function TestAutoGenerateIDCard() {
  const { user, profile } = useAppSelector((state) => state.auth)
  const [loading, setLoading] = useState(false)
  const [storageLoading, setStorageLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [storageStatus, setStorageStatus] = useState<{
    bucket: boolean | null
    folder: boolean | null
    message: string
  }>({ bucket: null, folder: null, message: '' })

  const handleTestStorage = async () => {
    setStorageLoading(true)
    setStorageStatus({ bucket: null, folder: null, message: 'Testing storage...' })

    try {
      const bucketExists = await ensureUploadsBucket()
      const folderExists = await ensureIDCardsFolder()
      
      setStorageStatus({
        bucket: bucketExists,
        folder: folderExists,
        message: `Bucket: ${bucketExists ? 'OK' : 'FAILED'}, Folder: ${folderExists ? 'OK' : 'FAILED'}`
      })
    } catch (error) {
      console.error('Storage test error:', error)
      setStorageStatus({
        bucket: false,
        folder: false,
        message: `Storage test failed: ${error}`
      })
    } finally {
      setStorageLoading(false)
    }
  }

  const handleGenerateIDCard = async () => {
    if (!user?.id) {
      setResult({ success: false, message: 'User not logged in' })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const success = await AutoIDCardGenerator.generateAndSaveIDCard(user.id)
      if (success) {
        setResult({ success: true, message: 'ID Card generated successfully!' })
        // Optionally refresh the profile data
        window.location.reload()
      } else {
        setResult({ success: false, message: 'Failed to generate ID card' })
      }
    } catch (error) {
      console.error('Error generating ID card:', error)
      setResult({ success: false, message: `Error: ${error}` })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Required</h2>
            <p className="text-gray-600">Please sign in to test ID card generation.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Test Auto ID Card Generator</h1>
              <p className="text-gray-600">Test the automatic ID card generation functionality</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Profile Info */}
          <Card>
            <CardHeader>
              <CardTitle>Current Profile Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900">{profile?.display_name || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Birth Date</label>
                  <p className="text-gray-900">{profile?.birth_date || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Gender</label>
                  <p className="text-gray-900">{profile?.gender || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Province</label>
                  <p className="text-gray-900">{profile?.province_code || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Role</label>
                  <p className="text-gray-900">{profile?.role || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Profile Photo</label>
                  <p className="text-gray-900">{profile?.profile_photo_url ? 'Available' : 'Not set'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Current ID Card</label>
                  <p className="text-gray-900">{profile?.id_card_image ? 'Generated' : 'Not generated'}</p>
                </div>
              </div>

              {/* Requirements Check */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Requirements Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${profile?.display_name ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm">Display Name</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${profile?.birth_date ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm">Birth Date</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${profile?.gender ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm">Gender</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${profile?.province_code ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm">Province Code</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${profile?.profile_photo_url ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm">Profile Photo</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Action */}
          <Card>
            <CardHeader>
              <CardTitle>Generate ID Card</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Storage Test */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Storage Test</h3>
                <Button
                  onClick={handleTestStorage}
                  disabled={storageLoading}
                  variant="outline"
                  className="w-full mb-3"
                >
                  {storageLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing Storage...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Test Storage Bucket
                    </>
                  )}
                </Button>
                
                {storageStatus.message && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      {storageStatus.bucket === true ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : storageStatus.bucket === false ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <div className="h-4 w-4 bg-gray-300 rounded-full animate-pulse" />
                      )}
                      <span className="text-sm">Uploads Bucket</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {storageStatus.folder === true ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : storageStatus.folder === false ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <div className="h-4 w-4 bg-gray-300 rounded-full animate-pulse" />
                      )}
                      <span className="text-sm">ID Cards Folder</span>
                    </div>
                    <p className="text-xs text-gray-600">{storageStatus.message}</p>
                  </div>
                )}
              </div>

              {/* ID Card Generation */}
              <div className="text-center border-t pt-6">
                <Button
                  onClick={handleGenerateIDCard}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Test Generate ID Card
                    </>
                  )}
                </Button>
              </div>

              {result && (
                <div className={`p-4 rounded-lg border ${
                  result.success 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      result.success ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="font-medium">
                      {result.success ? 'Success' : 'Error'}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{result.message}</p>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Note:</h4>
                <p className="text-sm text-gray-600">
                  This function is automatically called during user registration. 
                  Use this test page to manually generate ID cards for existing users 
                  or to debug the generation process.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
