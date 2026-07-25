'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignOutButton({
  variant = 'default',
}: {
  variant?: 'default' | 'onDark'
}) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const className =
    variant === 'onDark'
      ? 'inline-flex min-h-[44px] items-center px-4 text-sm font-medium text-white border border-white/40 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white'
      : 'inline-flex min-h-[44px] items-center px-4 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'

  return (
    <button onClick={handleSignOut} className={className}>
      Sign out
    </button>
  )
}
