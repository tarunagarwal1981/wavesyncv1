import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirectTo = requestUrl.searchParams.get('redirect_to') || '/dashboard';

  if (code) {
    const supabase = await createClient();
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, request.url));
    }

    if (data.user) {
      // Check if user needs to complete their profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single();

      if (!profile) {
        return NextResponse.redirect(new URL('/auth/complete-profile', request.url));
      }

      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
  }

  // If no code or failed to create session, redirect to login
  return NextResponse.redirect(new URL('/auth/login', request.url));
}


