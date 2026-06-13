import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Verifies the magic-link token hash and establishes the session.
// Requires the Supabase Magic Link email template to point here:
//   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null

  if (tokenHash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (!error) {
      // Root page routes by role (fellow -> /log, staff -> /dashboard).
      return NextResponse.redirect(`${origin}/`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=invalid_link`)
}
