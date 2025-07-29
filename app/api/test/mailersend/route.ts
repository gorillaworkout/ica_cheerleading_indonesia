import { NextRequest, NextResponse } from 'next/server'
import { MailerSendService } from '@/utils/mailersend'

export async function POST(request: NextRequest) {
  try {
    const { email, type = 'reset' } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // console.log('🧪 Testing MailerSend with:', { email, type })

    // Test connection first
    const connectionTest = await MailerSendService.testConnection()
    if (!connectionTest) {
      return NextResponse.json({
        error: 'MailerSend connection test failed',
        apiTokenExists: !!process.env.MAILERSEND_API_TOKEN,
        fromEmail: process.env.MAILERSEND_FROM_EMAIL || 'not set'
      }, { status: 500 })
    }

    let result = false
    let templateId = ''

    if (type === 'reset') {
      // Test password reset email
      const resetUrl = `${request.nextUrl.origin}/reset-password?test=true`
      result = await MailerSendService.sendPasswordResetEmail(
        email,
        'Test User',
        resetUrl
      )
      templateId = 'vywj2lpzp8kg7oqz'
    } else if (type === 'verification') {
      // Test email verification
      const confirmationUrl = `${request.nextUrl.origin}/auth/callback?test=true`
      result = await MailerSendService.sendVerificationEmail(
        email,
        'Test User',
        confirmationUrl
      )
      templateId = '351ndgwqpjdgzqx8'
    }

    if (result) {
      return NextResponse.json({
        success: true,
        message: `Test ${type} email sent successfully`,
        templateId,
        email,
        apiTokenExists: !!process.env.MAILERSEND_API_TOKEN,
        fromEmail: process.env.MAILERSEND_FROM_EMAIL || 'default'
      })
    } else {
      return NextResponse.json({
        error: `Failed to send test ${type} email`,
        templateId,
        apiTokenExists: !!process.env.MAILERSEND_API_TOKEN,
        fromEmail: process.env.MAILERSEND_FROM_EMAIL || 'default'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Test MailerSend error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      apiTokenExists: !!process.env.MAILERSEND_API_TOKEN
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'MailerSend test endpoint',
    apiTokenExists: !!process.env.MAILERSEND_API_TOKEN,
    fromEmail: process.env.MAILERSEND_FROM_EMAIL || 'not set',
    templates: {
      passwordReset: 'vywj2lpzp8kg7oqz',
      emailVerification: '351ndgwqpjdgzqx8'
    }
  })
} 