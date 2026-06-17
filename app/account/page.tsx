'use client'

// app/account/page.tsx
// Self-service password change for any signed-in user (replaces the temporary
// password). Uses the user's own session — no admin/service-role key.
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function AccountPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ''))
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setDone(false)
    if (password.length < 8) {
      setError('Use at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('The two passwords do not match.')
      return
    }
    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (updateError) {
      setError(updateError.message || 'Could not update the password. Try again.')
      return
    }
    setPassword('')
    setConfirm('')
    setDone(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#003a63] text-white border-b-4 border-[#c8102e]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt=""
                className="w-10 h-10 shrink-0 object-contain bg-white rounded p-0.5"
              />
              <h1 className="text-xl font-bold leading-tight">Account</h1>
            </div>
            <Link
              href="/dashboard"
              className="px-3 py-2 text-sm font-medium rounded-md text-white/90 hover:bg-white/10 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-8 sm:px-6">
        <h2 className="text-lg font-bold text-[#003a63]">Change password</h2>
        <p className="mt-1 text-sm text-gray-600">
          {email ? (
            <>
              Signed in as <span className="font-medium">{email}</span>.
            </>
          ) : (
            'Set a new password for your account.'
          )}
        </p>

        {done ? (
          <div
            role="status"
            className="mt-4 p-4 rounded-lg text-sm bg-green-50 border border-green-200 text-green-800"
          >
            Password updated. Use it next time you sign in.
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="new-password"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              New password
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#003a63]"
            />
          </div>
          <div>
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Confirm new password
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter the password"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#003a63]"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !password || !confirm}
            aria-busy={loading}
            className="w-full py-3.5 bg-[#c8102e] text-white font-semibold rounded-lg hover:bg-[#a50e26] disabled:opacity-60 transition-colors"
          >
            {loading ? 'Saving…' : 'Update password'}
          </button>
          {error ? (
            <div
              role="alert"
              className="p-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700"
            >
              {error}
            </div>
          ) : null}
        </form>
      </main>
    </div>
  )
}
