import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Get the authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check if profile exists, if not create one (default role = fellow)
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (!existingProfile) {
          await supabase.from('profiles').insert({
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'New User',
            email: user.email || '',
            role: 'fellow', // Default role for new users
          });
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth failed
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
