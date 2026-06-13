import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { roleHome } from '@/lib/auth'

// Root is public. A signed-in user is routed straight to their home (fellow ->
// /log, staff -> /dashboard); everyone else sees the landing page below.
export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    // Provisioned -> their home. Signed in but no profile yet -> let them
    // reach /login, which explains the unprovisioned state.
    if (profile) redirect(roleHome(profile.role))
    redirect('/login?error=unprovisioned')
  }

  const pillars = [
    {
      title: 'Progress tracking',
      body: 'De-identified procedure logs against program minimums, ITE scores, and scholarly activity.',
    },
    {
      title: 'Evaluations',
      body: 'ACGME milestone assessments and assignable evaluation forms — rotation, 360, faculty, and program.',
    },
    {
      title: 'Program materials',
      body: 'Curriculum, policies, and onboarding documents in one place, with read acknowledgments.',
    },
  ]

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-xl text-center">
          <div
            aria-hidden="true"
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-600 text-white mb-6"
          >
            <span className="text-2xl font-bold">HE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Howard Endocrinology Fellowship
          </h1>
          <p className="mt-3 text-base text-gray-600 max-w-md mx-auto">
            The program&apos;s working tool for the Endocrinology, Diabetes &amp; Metabolism
            fellowship at Howard University Hospital.
          </p>

          <div className="mt-8">
            <Link
              href="/login"
              className="inline-block px-8 py-3.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 active:bg-primary-800 transition-colors"
            >
              Sign in
            </Link>
            <p className="mt-3 text-sm text-gray-500">
              For fellows, attendings, and program leadership. Access is by invitation.
            </p>
          </div>

          <ul className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            {pillars.map((p) => (
              <li key={p.title} className="p-4 border border-gray-200 rounded-xl bg-white">
                <h2 className="font-semibold text-sm text-gray-900 mb-1">{p.title}</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <footer className="px-4 py-6 text-center text-xs text-gray-400">
        <p>Internal program tool. Not a system of record for ACGME submission.</p>
        <p className="mt-1">No patient information is stored in this application.</p>
      </footer>
    </main>
  )
}
