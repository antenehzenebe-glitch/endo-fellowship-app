import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SignOutButton from '@/components/SignOutButton';

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-600">{profile?.full_name || user.email}</p>
          </div>
          <SignOutButton />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-4">Your Account</h2>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Email</span>
              <span className="font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Role</span>
              <span className="font-medium capitalize">{profile?.role || 'Not set'}</span>
            </div>
            {profile?.pgy_year && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">PGY Year</span>
                <span className="font-medium">PGY-{profile.pgy_year}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          This is a protected dashboard. More features coming soon.
        </div>
      </div>
    </div>
  );
}
