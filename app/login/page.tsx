'use client'

// Invite-only sign-in. Primary: email + password (set by program staff).
// Fallback: email me a one-time link. No self-signup.
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const ERROR_MESSAGES: Record<string, string> = {
  not_provisioned:
    "That worked, but there's no account set up for this email yet. Ask the program coordinator to add you.",
  auth: "That link didn't work or has expired. Sign in with your password below.",
  missing_code: 'That link was incomplete. Sign in with your password below.',
}

export default function LoginPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [urlError, setUrlError] = useState<string | null>(null)
  const [linkMode, setLinkMode] = useState(false)
  const [linkSent, setLinkSent] = useState(false)

  useEffect(() => {
    setUrlError(new URLSearchParams(window.location.search).get('error'))
  }, [])

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (signInError) { setError('Email or password is incorrect. Check both and try again.'); return }
    window.location.assign('/')
  }

  const handleSendLink = async () => {
    setLoading(true); setError('')
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    setLoading(false)
    if (otpError && !/not allowed|disabled|signups|not found/i.test(otpError.message)) setError(otpError.message)
    else setLinkSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="" className="block w-16 h-16 mx-auto mb-4 object-contain" />
          <h1 className="text-2xl font-bold text-[#003a63]">Howard Endo Fellowship</h1>
          <p className="text-gray-600 mt-1 text-sm">Sign in to the program hub</p>
        </div>

        {urlError ? (
          <div role="alert" className="mb-4 p-4 rounded-lg text-sm bg-orange-50 border border-orange-200 text-orange-800">
            {ERROR_MESSAGES[urlError] ?? 'Something went wrong. Try again below.'}
          </div>
        ) : null}

        {linkSent ? (
          <div role="status" className="p-4 rounded-lg text-sm bg-green-50 border border-green-200 text-green-800">
            If an account exists for <span className="font-medium">{email}</span>, a one-time sign-in link is on its way. Check your inbox (and spam).
          </div>
        ) : linkMode ? (
          <form onSubmit={(e) => { e.preventDefault(); handleSendLink() }} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Work email</label>
              <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="your.name@huhosp.org" required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#003a63]" />
            </div>
            <button type="submit" disabled={loading || !email} aria-busy={loading}
              className="w-full py-3.5 bg-[#c8102e] text-white font-semibold rounded-lg hover:bg-[#a50e26] disabled:opacity-60 transition-colors">
              {loading ? 'Sending link…' : 'Email me a one-time link'}
            </button>
            <button type="button" onClick={() => setLinkMode(false)} className="w-full text-sm text-[#003a63] font-medium">
              ← Back to password sign-in
            </button>
            {error ? <div role="alert" className="p-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700">{error}</div> : null}
          </form>
        ) : (
          <form onSubmit={handlePassword} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Work email</label>
              <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="your.name@huhosp.org" required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#003a63]" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#003a63]" />
            </div>
            <button type="submit" disabled={loading || !email || !password} aria-busy={loading}
              className="w-full py-3.5 bg-[#c8102e] text-white font-semibold rounded-lg hover:bg-[#a50e26] disabled:opacity-60 transition-colors">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
            {error ? <div role="alert" className="p-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700">{error}</div> : null}
            <button type="button" onClick={() => { setError(''); setLinkMode(true) }} className="w-full text-sm text-[#003a63] font-medium pt-1">
              Forgot password? Email me a one-time link instead
            </button>
            <p className="text-xs text-center text-gray-500 pt-1">Accounts are added by the program coordinator.</p>
          </form>
        )}
      </div>
    </div>
  )
}
