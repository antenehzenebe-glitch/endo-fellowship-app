'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface LoginFormProps {
  initialError: string | null
}

// Magic-link sign-in only. Accounts are invite-only: staff create the auth
// user (Supabase dashboard invite) and the profile row. `shouldCreateUser:
// false` means an email that was never invited gets a clear error instead of
// a stray auth account. There is deliberately no password or self-signup path.
export default function LoginForm({ initialError }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(initialError)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: false },
    })

    if (otpError) {
      // Supabase wording for a non-invited email mentions signups; translate.
      setError(
        /signup|sign-up|not allowed|not found/i.test(otpError.message)
          ? 'This email is not registered with the program. Contact the PD/APD or coordinator to be added.'
          : `Could not send the sign-in link: ${otpError.message}`
      )
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-white p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div
            aria-hidden="true"
            className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-600 text-white mb-4"
          >
            <span className="text-2xl font-bold">HE</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Howard Endo Fellowship</h1>
          <p className="text-gray-600 mt-1 text-sm">
            Sign in with your program email — we&apos;ll send a one-time link.
          </p>
        </div>

        {sent ? (
          <div
            role="status"
            className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800"
          >
            <p className="font-semibold mb-1">Check your email</p>
            <p>
              A sign-in link was sent to <span className="font-medium">{email}</span>. It
              expires shortly — check spam if you don&apos;t see it. You can close this tab.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate={false}>
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-semibold text-gray-700 mb-1.5"
              >
                Program email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.name@howard.edu"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary-600"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || email.trim() === ''}
              aria-busy={loading}
              className="w-full py-3.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 active:bg-primary-800 disabled:opacity-60 transition-colors"
            >
              {loading ? 'Sending link…' : 'Send sign-in link'}
            </button>

            <p className="text-xs text-center text-gray-500 pt-2">
              Accounts are created by the program. No password needed.
            </p>
          </form>
        )}

        {error && (
          <div
            role="alert"
            className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
          >
            {error}
          </div>
        )}
      </div>
    </main>
  )
}
