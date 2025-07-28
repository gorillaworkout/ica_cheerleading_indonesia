'use client'

import { EmailDebugger } from "@/components/debug/email-debugger"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function EmailDebugPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Email System Debug</h1>
            <p className="text-gray-600">
              Diagnose email configuration issues for password reset functionality
            </p>
          </div>
          <EmailDebugger />
        </div>
      </main>
      <Footer />
    </div>
  )
}
