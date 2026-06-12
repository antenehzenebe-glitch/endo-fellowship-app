"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [mode, setMode] = useState<'password' | 'magic'>('password');

  const supabase = createClient();
  const router = useRouter();

  // Magic Link
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
      setMessage('Magic link sent! Check your email (including spam).');
      setMessageType('success');
    }
    setLoading(false);
  };

  // Email + Password Sign In
  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setMessageType('error');
    } else {
      router.push('/dashboard');
      router.refresh();
    }
    setLoading(false);
  };

  // Sign Up with Password
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setMessageType('error');
    } else if (data.user) {
      // Create profile for new password users
      await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: email.split('@')[0],
        email,
        role: 'fellow',
      });

      setMessage('Account created successfully! You can now sign in.');
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
          <h1 className="text-2xl font-bold text-gray-900">Howard Endo Fellowship</h1>
          <p className="text-gray-600 mt-1 text-sm">Sign in to continue</p>
        </div>

        {/* Mode Tabs */}
        <div className="flex mb-6 border-b">
          <button
            onClick={() => setMode('password')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === 'password' ? 'border-b-2 border-[#0066CC] text-[#0066CC]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Email & Password
          </button>
          <button
            onClick={() => setMode('magic')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === 'magic' ? 'border-b-2 border-[#0066CC] text-[#0066CC]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Magic Link
          </button>
        </div>

        {/* Password Mode */}
        {mode === 'password' && (
          <div>
            <form onSubmit={handlePasswordSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066CC]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066CC]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#0066CC] text-white font-semibold rounded-lg hover:bg-[#0052A3] disabled:opacity-60 transition-colors"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600 mb-3">New here?</p>
              <form onSubmit={handleSignUp} className="space-y-3">
                <button
                  type="submit"
                  disabled={loading || !email || !password}
                  className="w-full py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Create new account with this email
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Magic Link Mode */}
        {mode === 'magic' && (
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Work Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.name@howard.edu"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066CC]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-3.5 bg-[#0066CC] text-white font-semibold rounded-lg hover:bg-[#0052A3] disabled:opacity-60 transition-colors"
            >
              {loading ? 'Sending magic link...' : 'Send magic link'}
            </button>

            <p className="text-xs text-center text-gray-500 pt-2">
              We'll email you a secure one-time link
            </p>
          </form>
        )}

        {message && (
          <div className={`mt-4 p-4 rounded-lg text-sm ${messageType === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
