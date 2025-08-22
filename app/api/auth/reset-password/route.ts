import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
// ✅ Add MailerSend import
import { MailerSendService } from '@/utils/mailersend'

// Check environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables:')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
}

// Initialize Supabase with service role for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// ✅ NEW: Function to send email with MailerSend template
async function sendResetEmailWithMailerSend(email: string, resetUrl: string): Promise<boolean> {
  try {
    // console.log('🔄 Sending password reset via MailerSend template')
    
    // Get user name from email or database lookup
    let userName = email.split('@')[0] // Fallback
    
    // Optional: Get actual user name from database
    try {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('display_name')
        .eq('email', email)
        .single()
      
      if (profile?.display_name) {
        userName = profile.display_name
      }
    } catch (dbError) {
      console.log('📝 Using email prefix as name:', userName)
    }
    
    // Send using MailerSend template: vywj2lpzp8kg7oqz
    const success = await MailerSendService.sendPasswordResetEmail(
      email,
      userName,
      resetUrl
    )
    
    return success
    
  } catch (error) {
    console.error('❌ MailerSend reset email error:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, redirectTo } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // console.log('🔄 Processing password reset for:', email)

    // ✅ CRITICAL FIX: Check if user is deleted before allowing password reset
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("is_deleted")
      .eq("email", email)
      .single();

    if (profileError) {
      console.error("Error checking profile:", profileError);
      // If we can't check profile, continue with normal flow
    } else if (profile && profile.is_deleted === true) {
      return NextResponse.json(
        { error: 'Akun telah dihapus dan tidak dapat digunakan lagi' },
        { status: 403 }
      )
    }

    // Create reset URL
    const resetUrl = redirectTo || `${request.nextUrl.origin}/reset-password`
    
    // ✅ Try MailerSend first
    // console.log('📧 Attempting MailerSend template...')
    const mailerSendSuccess = await sendResetEmailWithMailerSend(email, resetUrl)
    
    if (mailerSendSuccess) {
      return NextResponse.json({
        success: true,
        message: 'Password reset email sent successfully via MailerSend template',
        method: 'mailersend_template',
        templateId: 'vywj2lpzp8kg7oqz'
      })
    }

    // Fallback: Supabase built-in method
    // console.log('🔄 MailerSend failed, trying Supabase fallback...')
    const { error: supabaseError } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: resetUrl
    })

    if (!supabaseError) {
      return NextResponse.json({
        success: true,
        message: 'Password reset email sent via Supabase fallback',
        method: 'supabase_fallback'
      })
    }

    // Both methods failed
    console.error('❌ All email methods failed')
    return NextResponse.json(
      { error: 'Failed to send reset email' },
      { status: 500 }
    )

  } catch (error) {
    console.error('❌ Reset password API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}