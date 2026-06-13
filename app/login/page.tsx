'use client'

// Invite-only magic-link sign-in. No password, no self-signup: accounts are
// provisioned by program staff, so the form never creates a user
// (shouldCreateUser: false) and we don't reveal whether an email is registered.
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const ERROR_MESSAGES: Record<string, string> = {
  not_provisioned:
    "That link worked, but there's no account set up for this email yet. Ask the program coordinator to add you.",
  auth: "That sign-in link didn't work or has expired. Request a new one below.",
  missing_code: 'That link was incomplete. Request a new one below.',
}

export default function LoginPage() {
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [urlError, setUrlError] = useState<string | null>(null)

  useEffect(() => {
    setUrlError(new URLSearchParams(window.location.search).get('error'))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Invite-only: never create a new user from the login form.
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setLoading(false)

    // If the email isn't a provisioned user, Supabase reports a signups-disabled
    // error. Show the same confirmation either way so we don't leak who has an
    // account. Surface only genuine failures (rate limit, network).
    if (otpError && !/not allowed|disabled|signups|not found/i.test(otpError.message)) {
      setError(otpError.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#0066CC] text-white mb-4">
            <span className="text-2xl font-bold">HE</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Howard Endo Fellowship</h1>
          <p className="text-gray-600 mt-1 text-sm">
            Sign in with your work email
          </p>
        </div>

        {urlError ? (
          <div
            role="alert"
            className="mb-4 p-4 rounded-lg text-sm bg-orange-50 border border-orange-200 text-orange-800"
          >
            {ERROR_MESSAGES[urlError] ?? 'Something went wrong. Try again below.'}
          </div>
        ) : null}

        {sent ? (
          <div
            role="status"
            className="p-4 rounded-lg text-sm bg-green-50 border border-green-200 text-green-800"
          >
            If an account exists for <span className="font-medium">{email}</span>, a
            secure sign-in link is on its way. Check your inbox (and spam).
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Work email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.name@howard.edu"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              aria-busy={loading}
              className="w-full py-3.5 bg-[#0066CC] text-white font-semibold rounded-lg hover:bg-[#0052A3] disabled:opacity-60 transition-colors"
            >
              {loading ? 'Sending link…' : 'Send sign-in link'}
            </button>

            {error ? (
              <div
                role="alert"
                className="p-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700"
              >
                {error}
              </div>
            ) : null}

            <p className="text-xs text-center text-gray-500 pt-1">
              Accounts are added by the program coordinator. We&apos;ll email you a
              one-time link — no password needed.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
