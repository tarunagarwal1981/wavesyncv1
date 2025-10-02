import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import { createApiHandler } from '@/middleware/api-middleware';
import { withValidation } from '@/lib/api/validation';
import { loginSchema } from '@/lib/api/validation';
import { LoginRequest } from '@/lib/api/types';

// Login handler
async function loginHandler(data: LoginRequest) {
  try {
    const { email, password } = data;

    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      throw new Error('Invalid email or password');
    }

    if (!authData.user) {
      throw new Error('Authentication failed');
    }

    // Get user profile
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      console.error('Profile fetch error:', userError);
    }

    const response = {
      user: {
        id: authData.user.id,
        email: authData.user.email,
        firstName: userData?.first_name || '',
        lastName: userData?.last_name || '',
        role: userData?.role || 'seafarer',
        avatarUrl: userData?.avatar_url,
      },
      session: {
        accessToken: authData.session?.access_token || '',
        refreshToken: authData.session?.refresh_token || '',
        expiresAt: authData.session?.expires_at ? 
          new Date(authData.session.expires_at * 1000).toISOString() : '',
      };

    return apiSuccess(response, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    return apiError(error instanceof Error ? error : new Error('Login failed'), 401);
  }
}

// Create handler with middleware
const handler = createApiHandler(
  withValidation(loginSchema, 'body')(loginHandler),
  {
    rateLimit: 5,
    endpoint: 'auth/login',
    logBody: false, // Don't log passwords for security
  }
);

export { handler as POST };
