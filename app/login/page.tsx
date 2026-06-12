"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const supabase = createClient();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Check your email for the magic link!');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#0066CC] text-white mb-4">
            <span className="text-2xl font-bold">HE</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Sign in to Howard Endo App</h1>
          <p className="text-gray-600 mt-2 text-sm">
            For fellows, attendings, and program leadership
          </p>
        </div>

        <form onSubmit={handleMagicLink} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@howard.edu"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC] text-base"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full py-3 bg-[#0066CC] text-white font-semibold rounded-lg hover:bg-[#0052A3] active:bg-[#003D7A] disabled:opacity-50 transition-colors"
          >
            {loading ? 'Sending magic link...' : 'Send magic link'}
          </button>
        </form>

        {message && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            {message}
          </div>
        )}

        <p className="mt-6 text-center text-xs text-gray-500">
          We use passwordless magic links for security.
        </p>
      </div>
    </div>
  );
}
