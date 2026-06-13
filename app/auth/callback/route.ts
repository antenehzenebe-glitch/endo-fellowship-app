// app/auth/callback/route.ts
// Completes magic-link sign-in. Handles BOTH link styles so it works regardless
// of which Supabase email template is configured:
//   • code flow      → ?code=...                  (default {{ .ConfirmationURL }})
//   • token-hash flow → ?token_hash=...&type=...   (custom template)
//
// Invite-only is enforced here: we never create a profile. If an authenticated
// user has no profile row (RLS blocks self-insert anyway), we sign them back out
// and send them to /login. Otherwise we route by role.
import { NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { roleHome } from '@/lib/auth'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null

  const supabase = await createClient()

  let authFailed = false
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    authFailed = Boolean(error)
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    authFailed = Boolean(error)
  } else {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  if (authFailed) {
    return NextResponse.redirect(`${origin}/login?error=auth`)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=auth`)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) {
    // Authenticated but not provisioned — invite-only. Don't let them in.
    await supabase.auth.signOut()
    return NextResponse.redirect(`${origin}/login?error=not_provisioned`)
  }

  return NextResponse.redirect(`${origin}${roleHome(profile.role)}`)
}
