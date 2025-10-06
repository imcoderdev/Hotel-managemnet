import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    
    // Exchange code for session
    const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return NextResponse.redirect(`${origin}/owner/login?error=auth_failed`);
    }

    if (session?.user) {
      // Check if owner record exists
      const { data: ownerData, error: ownerError } = await supabase
        .from('owners')
        .select('*')
        .eq('id', session.user.id)
        .single();

      // If owner doesn't exist, create one
      if (ownerError && ownerError.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('owners')
          .insert({
            id: session.user.id,
            email: session.user.email!,
            restaurant_name: session.user.user_metadata?.full_name || 'My Restaurant',
          });

        if (insertError) {
          console.error('Error creating owner:', insertError);
        }
      }
    }
  }

  // Redirect to dashboard
  return NextResponse.redirect(`${origin}/owner/dashboard`);
}
