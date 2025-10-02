import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import { createApiHandler } from '@/middleware/api-middleware';
import { withValidation } from '@/lib/api/validation';
import { signupSchema } from '@/lib/api/validation';
import { SignupRequest } from '@/lib/api/types';

// Signup handler
async function signupHandler(data: SignupRequest) {
  try {
    const { email, password, firstName, lastName, role = 'seafarer' } = data;

    // Sign up with Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: role,
        },
      },
    });

    if (authError) {
      throw new Error(`Signup failed: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error('Signup failed');
    }

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        first_name: firstName,
        last_name: lastName,
        role: role,
        created_at: new Date().toISOString(),
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Continue anyway as auth user was created
    }

    const response = {
      user: {
        id: authData.user.id,
        email: authData.user.email,
        firstName,
        lastName,
        role,
        avatarUrl: null,
      },
      message: authData.user.email_confirmed_at 
        ? 'Signup successful'
        : 'Please check your email to confirm your account',
    };

    return apiSuccess(response, response.message);
  } catch (error) {
    console.error('Signup error:', error);
    return apiError(error instanceof Error ? error : new Error('Signup failed'), 400);
  }
}

// Create handler with middleware
const handler = createApiHandler(
  withValidation(signupSchema, 'body')(signupHandler),
  {
    rateLimit: 3,
    endpoint: 'auth/signup',
    logBody: false,
  }
);

export { handler as POST };
