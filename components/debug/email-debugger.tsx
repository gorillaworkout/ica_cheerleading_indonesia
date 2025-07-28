'use client'

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, Mail, Settings } from 'lucide-react'

export function EmailDebugger() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<any[]>([])

  const runTests = async () => {
    setTesting(true)
    setResults([])
    const testResults: any[] = []

    // Test 1: Basic Supabase connection
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1)
      testResults.push({
        test: 'Supabase Connection',
        status: error ? 'fail' : 'pass',
        message: error ? error.message : 'Connection successful',
        icon: error ? XCircle : CheckCircle
      })
    } catch (e) {
      testResults.push({
        test: 'Supabase Connection',
        status: 'fail',
        message: 'Connection failed',
        icon: XCircle
      })
    }

    // Test 2: Auth configuration check
    try {
      // This will show us auth config issues
      const { error } = await supabase.auth.resetPasswordForEmail('test@nonexistent.com')
      testResults.push({
        test: 'Auth Configuration',
        status: error?.message?.includes('Email not confirmed') ? 'warn' : 
                error?.message?.includes('email') && !error?.message?.includes('User not found') ? 'fail' : 'pass',
        message: error ? error.message : 'Auth service responding',
        icon: error?.message?.includes('Email not confirmed') ? AlertCircle :
              error?.message?.includes('email') && !error?.message?.includes('User not found') ? XCircle : CheckCircle
      })
    } catch (e: any) {
      testResults.push({
        test: 'Auth Configuration',
        status: 'fail',
        message: e.message || 'Auth service error',
        icon: XCircle
      })
    }

    // Test 3: Environment variables
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    testResults.push({
      test: 'Environment Variables',
      status: hasUrl && hasKey ? 'pass' : 'fail',
      message: `URL: ${hasUrl ? '✓' : '✗'}, Key: ${hasKey ? '✓' : '✗'}`,
      icon: hasUrl && hasKey ? CheckCircle : XCircle
    })

    // Test 4: Current URL configuration
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'unknown'
    testResults.push({
      test: 'Current Origin',
      status: 'info',
      message: currentOrigin,
      icon: Settings
    })

    setResults(testResults)
    setTesting(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'bg-green-100 text-green-800 border-green-200'
      case 'fail': return 'bg-red-100 text-red-800 border-red-200'
      case 'warn': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mail className="h-5 w-5" />
          <span>Email System Debugger</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runTests} 
          disabled={testing}
          className="w-full"
        >
          {testing ? 'Running Tests...' : 'Run Diagnostic Tests'}
        </Button>

        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((result, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                <result.icon className={`h-5 w-5 mt-0.5 ${
                  result.status === 'pass' ? 'text-green-600' :
                  result.status === 'fail' ? 'text-red-600' :
                  result.status === 'warn' ? 'text-yellow-600' : 'text-blue-600'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{result.test}</span>
                    <Badge className={getStatusColor(result.status)}>
                      {result.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Common Solutions:</strong>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• Check Supabase Dashboard → Authentication → URL Configuration</li>
              <li>• Verify SMTP settings in Supabase Dashboard</li>
              <li>• Add {typeof window !== 'undefined' ? window.location.origin : 'current-domain'}/reset-password to Redirect URLs</li>
              <li>• Check email template configuration</li>
              <li>• Verify user email exists in profiles table</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
