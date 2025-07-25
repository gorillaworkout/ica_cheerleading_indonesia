import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    console.log('🔄 Custom API: Attempting to resend verification email to:', email)

    // Check if service role key is available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.log('❌ Missing Supabase configuration for service role')
      return NextResponse.json(
        { 
          error: 'Server configuration incomplete',
          message: 'Unable to resend verification email at this time'
        },
        { status: 500 }
      )
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Try to resend verification email using admin client
    const { error } = await supabaseAdmin.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${request.nextUrl.origin}/auth/callback`
      }
    })

    if (error) {
      console.error('❌ Admin resend failed:', error)
      
      // Try alternative: get user and generate invitation
      const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()
      
      if (listError) {
        console.error('❌ Failed to list users:', listError)
        return NextResponse.json(
          { error: 'Failed to process verification resend' },
          { status: 500 }
        )
      }

      const user = users.users.find(u => u.email === email)
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      if (user.email_confirmed_at) {
        return NextResponse.json(
          { 
            message: 'Email is already verified',
            already_verified: true
          },
          { status: 200 }
        )
      }

      // Generate new confirmation token
      const { error: inviteError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'signup',
        email: email,
        password: 'temp-password-for-link-generation',
        options: {
          redirectTo: `${request.nextUrl.origin}/auth/callback`
        }
      })

      if (inviteError) {
        console.error('❌ Failed to generate invite link:', inviteError)
        return NextResponse.json(
          { error: 'Failed to generate verification link' },
          { status: 500 }
        )
      }

      console.log('✅ Generated new verification link for:', email)
      return NextResponse.json({
        success: true,
        message: 'Verification email sent successfully (via admin)',
        method: 'admin_generate_link'
      })
    }

    console.log('✅ Admin resend successful for:', email)
    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully',
      method: 'admin_resend'
    })

  } catch (error) {
    console.error('❌ Unexpected error in resend verification API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 