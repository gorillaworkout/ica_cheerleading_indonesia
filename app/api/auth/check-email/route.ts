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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Server configuration incomplete' },
        { status: 500 }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers()
    if (error) {
      return NextResponse.json(
        { error: 'Failed to check email status' },
        { status: 500 }
      )
    }

    const user = users.users.find(u => u.email?.toLowerCase() === String(email).toLowerCase())
    if (!user) {
      return NextResponse.json({ exists: false, verified: false })
    }

    return NextResponse.json({ exists: true, verified: Boolean(user.email_confirmed_at) })
  } catch (e) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


