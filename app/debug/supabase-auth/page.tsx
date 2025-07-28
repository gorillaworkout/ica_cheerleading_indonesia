"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"

interface TestResult {
  name: string
  status: 'success' | 'error' | 'pending'
  message: string
  details?: string
}

export default function SupabaseAuthDebugPage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(false)

  const updateResult = (name: string, status: 'success' | 'error' | 'pending', message: string, details?: string) => {
    setResults(prev => {
      const filtered = prev.filter(r => r.name !== name)
      return [...filtered, { name, status, message, details }]
    })
  }

  const runTests = async () => {
    setLoading(true)
    setResults([])

    // Test 1: Supabase Connection
    updateResult('Connection', 'pending', 'Testing connection...')
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1)
      if (error) {
        updateResult('Connection', 'error', 'Failed to connect', error.message)
      } else {
        updateResult('Connection', 'success', 'Connected successfully')
      }
    } catch (e) {
      updateResult('Connection', 'error', 'Connection failed', String(e))
    }

    // Test 2: Auth Configuration
    updateResult('Auth Config', 'pending', 'Checking auth configuration...')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      updateResult('Auth Config', 'success', 'Auth initialized', 
        `Current session: ${session ? 'Active' : 'None'}`)
    } catch (e) {
      updateResult('Auth Config', 'error', 'Auth config failed', String(e))
    }

    // Test 3: Environment Variables
    updateResult('Environment', 'pending', 'Checking environment variables...')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      updateResult('Environment', 'error', 'Missing environment variables',
        `URL: ${supabaseUrl ? 'Set' : 'Missing'}, Key: ${supabaseKey ? 'Set' : 'Missing'}`)
    } else {
      updateResult('Environment', 'success', 'Environment variables loaded',
        `URL: ${supabaseUrl.substring(0, 30)}..., Key: ${supabaseKey.substring(0, 20)}...`)
    }

    // Test 4: Test Email Send (Simple)
    updateResult('Email Test', 'pending', 'Testing simple email send...')
    try {
      // Try with a test email that definitely doesn't exist
      const testEmail = `test-${Date.now()}@nonexistent-domain-for-testing.com`
      const { error } = await supabase.auth.resetPasswordForEmail(testEmail)
      
      if (error) {
        if (error.message.includes('SMTP') || error.message.includes('email')) {
          updateResult('Email Test', 'error', 'SMTP not configured', 
            'Supabase email service needs SMTP configuration in dashboard')
        } else if (error.message.includes('rate limit')) {
          updateResult('Email Test', 'error', 'Rate limited', 
            'Too many email attempts - wait a few minutes')
        } else {
          updateResult('Email Test', 'error', 'Email service error', error.message)
        }
      } else {
        updateResult('Email Test', 'success', 'Email service responsive')
      }
    } catch (e) {
      updateResult('Email Test', 'error', 'Email test failed', String(e))
    }

    // Test 5: Check Project Settings
    updateResult('Project Info', 'pending', 'Getting project information...')
    try {
      const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      const projectId = projectUrl.split('//')[1]?.split('.')[0]
      updateResult('Project Info', 'success', 'Project details retrieved',
        `Project ID: ${projectId}, URL: ${projectUrl}`)
    } catch (e) {
      updateResult('Project Info', 'error', 'Failed to get project info', String(e))
    }

    setLoading(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'pending': return '⏳'
      default: return '⚪'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600'
      case 'error': return 'text-red-600'
      case 'pending': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Supabase Auth Diagnostic Tool
          </h1>
          
          <div className="mb-6">
            <button
              onClick={runTests}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50"
            >
              {loading ? 'Running Tests...' : 'Run Diagnostic Tests'}
            </button>
          </div>

          {results.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Test Results:</h2>
              
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg ${
                    result.status === 'success' ? 'border-green-200 bg-green-50' :
                    result.status === 'error' ? 'border-red-200 bg-red-50' :
                    'border-yellow-200 bg-yellow-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{getStatusIcon(result.status)}</span>
                    <div className="flex-1">
                      <h3 className={`font-medium ${getStatusColor(result.status)}`}>
                        {result.name}: {result.message}
                      </h3>
                      {result.details && (
                        <p className="text-sm text-gray-600 mt-1 font-mono">
                          {result.details}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Configuration Guide */}
          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">
              🔧 Configuration Guide
            </h3>
            
            <div className="space-y-3 text-sm text-blue-700">
              <p><strong>If you see SMTP errors:</strong></p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Go to Supabase Dashboard → Settings → Auth</li>
                <li>Configure SMTP Settings:
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>Host: smtp.gmail.com (for Gmail)</li>
                    <li>Port: 587</li>
                    <li>Username: your-email@gmail.com</li>
                    <li>Password: your-app-password</li>
                  </ul>
                </li>
                <li>Set Site URL: http://localhost:3000 (dev) or your domain (prod)</li>
                <li>Add Redirect URLs: http://localhost:3000/reset-password</li>
              </ol>
              
              <p className="mt-4"><strong>Alternative Solutions:</strong></p>
              <ul className="list-disc list-inside ml-4">
                <li>Use Supabase's built-in email service (limited in free tier)</li>
                <li>Configure custom SMTP provider (Sendgrid, Mailgun, etc.)</li>
                <li>Implement custom email sending via API route</li>
              </ul>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 flex space-x-4">
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm"
            >
              Open Supabase Dashboard
            </a>
            <button
              onClick={() => window.location.href = '/forgot-password'}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm"
            >
              Test Password Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
