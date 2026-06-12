"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const supabase = createClient();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    if (error) {
      setMessage(error.message);
      setMessageType('error');
    } else {
      setMessage('Magic link sent! Please check your email (including spam folder).');
      setMessageType('success');
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
            Secure passwordless access for fellows, attendings & leadership
          </p>
        </div>

        <form onSubmit={handleMagicLink} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Work Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.name@howard.edu"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC] text-base"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full py-3.5 bg-[#0066CC] text-white font-semibold rounded-lg hover:bg-[#0052A3] active:bg-[#003D7A] disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? 'Sending secure link...' : 'Send magic link'}
          </button>
        </form>

        {message && (
          <div className={`mt-4 p-4 rounded-lg text-sm ${messageType === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'}`}>
            {message}
          </div>
        )}

        <p className="mt-6 text-center text-xs text-gray-500">
          We use secure, passwordless magic links. No password to remember.
        </p>
      </div>
    </div>
  );
}
