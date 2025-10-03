'use server';

import { supabase } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { loginSchema, signupSchema, passwordUpdateSchema } from '@/lib/api/validation';

// Login action
export async function loginAction(formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Validate input
    const validatedData = loginSchema.parse({ email, password });

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (error) {
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    // Redirect to dashboard
    redirect('/dashboard');
  } catch (error) {
    console.error('Login action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login failed',
    };
  }
}

// Signup action
export async function signupAction(formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const role = formData.get('role') as string || 'seafarer';

    // Validate input
    const validatedData = signupSchema.parse({
      email,
      password,
      firstName,
      lastName,
      role,
    });

    // Sign up with Supabase
    const { data, error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          first_name: validatedData.firstName,
          last_name: validatedData.lastName,
          role: validatedData.role,
        },
      },
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: 'Signup failed',
      };
    }

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        email: data.user.email,
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        role: validatedData.role,
        created_at: new Date().toISOString(),
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
    }

    return {
      success: true,
      message: data.user.email_confirmed_at 
        ? 'Signup successful! You can now log in.'
        : 'Please check your email to confirm your account.',
    };
  } catch (error) {
    console.error('Signup action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Signup failed',
    };
  }
}

// Logout action
export async function logoutAction() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Clear Next.js cache
    revalidatePath('/', 'layout');
    
    // Redirect to login page
    redirect('/auth/login');
  } catch (error) {
    console.error('Logout action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Logout failed',
    };
  }
}

// Password reset request action
export async function passwordResetRequestAction(formData: FormData) {
  try {
    const email = formData.get('email') as string;

    if (!email) {
      return {
        success: false,
        error: 'Email is required',
      };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      message: 'Password reset email sent. Please check your inbox.',
    };
  } catch (error) {
    console.error('Password reset request error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Password reset failed',
    };
  }
}

// Password update action
export async function passwordUpdateAction(formData: FormData) {
  try {
    const currentPassword = formData.get('currentPassword') as string;
    resignPassword = formData.get('newPassword') as string;

    if (!currentPassword || !newPassword) {
      return {
        success: false,
        error: 'Both current and new passwords are required',
      };
    }

    // Validate input
    const validatedData = passwordUpdateSchema.parse({
      currentPassword,
      newPassword,
    });

    const { error } = await supabase.auth.updateUser({
      password: validatedData.newPassword,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Revalidate profile data
    revalidatePath('/profile');

    return {
      success: true,
      message: 'Password updated successfully',
    };
  } catch (error) {
    console.error('Password update error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Password update failed',
    };
  }
}

// Check authentication status
export async function checkAuthStatus() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        isAuthenticated: false,
        user: null,
      };
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      isAuthenticated: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: profile?.first_name || '',
        lastName: profile?.last_name || '',
        role: profile?.role || 'seafarer',
        avatarUrl: profile?.avatar_url,
      },
    };
  } catch (error) {
    console.error('Auth status check error:', error);
    return {
      isAuthenticated: false,
      user: null,
    };
  }
}



