export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0066CC] text-white mb-4">
            <span className="text-3xl font-bold">HE</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Howard Endocrinology
            <br />Fellowship App
          </h1>
          <p className="mt-3 text-gray-600">
            Mobile-first ACGME tracking for PGY-4 & PGY-5 fellows
          </p>
        </div>

        <div className="space-y-3">
          <a
            href="/login"
            className="block w-full px-6 py-3 bg-[#0066CC] text-white font-semibold rounded-lg hover:bg-[#0052A3] active:bg-[#003D7A] transition-colors"
          >
            Sign in to continue
          </a>
          
          <p className="text-sm text-gray-500">
            For Howard University Hospital Endocrinology fellows, attendings, and program leadership.
          </p>
        </div>

        <div className="mt-12 text-xs text-gray-400">
          Built for clinical excellence • Mobile-first • Secure
        </div>
      </div>
    </main>
  );
}
