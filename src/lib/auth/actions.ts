'use server';

import { createClient } from '@/lib/supabase/server';
import { createClientSideSupabase } from './session';
import { redirect } from 'next/navigation';
import type { AuthError } from '@supabase/supabase-js';

export interface AuthResult {
  success: boolean;
  error?: string;
  errorDetails?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  confirmPassword: string;
  employeeId: string;
  rank: string;
  nationality: string;
  phone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface ResetPasswordData {
  email: string;
}

export interface UpdatePasswordData {
  password: string;
  confirmPassword: string;
}

/**
 * Sign in user with email and password
 */
export async function signIn({
  email,
  password,
  rememberMe = false,
}: LoginData): Promise<AuthResult> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: 'Invalid email or password',
        errorDetails: error.message,
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: 'Sign in failed',
        errorDetails: 'No user data returned',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
      errorDetails: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Sign up new user
 */
export async function signUp({
  email,
  password,
  confirmPassword,
  employeeId,
  rank,
  nationality,
  phone,
  emergencyContactName,
  emergencyContactPhone,
  emergencyContactRelationship,
}: SignUpData): Promise<AuthResult> {
  try {
    const supabase = await createClient();

    // Validate passwords match
    if (password !== confirmPassword) {
      return {
        success: false,
        error: 'Passwords do not match',
      };
    }

    // Check if employee ID already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('employee_id')
      .eq('employee_id', employeeId)
      .single();

    if (existingProfile) {
      return {
        success: false,
        error: 'Employee ID already exists',
      };
    }

    // Create user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    });

    if (authError) {
      console.error('Sign up auth error:', authError);
      return {
        success: false,
        error: getSignUpErrorMessage(authError),
        errorDetails: authError.message,
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Sign up failed',
        errorDetails: 'No user data returned',
      };
    }

    // Create user profile
    const emergencyContact = emergencyContactName && emergencyContactPhone
      ? {
          name: emergencyContactName,
          phone: emergencyContactPhone,
          relationship: emergencyContactRelationship || 'Emergency Contact',
        }
      : null;

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        employee_id: employeeId.trim(),
        rank: rank.trim(),
        nationality: nationality.trim(),
        phone: phone?.trim() || null,
        emergency_contact: emergencyContact,
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return {
        success: false,
        error: 'Account created but profile setup failed',
        errorDetails: profileError.message,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Sign up error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
      errorDetails: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Request password reset
 */
export async function requestPasswordReset({ email }: ResetPasswordData): Promise<AuthResult> {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password`,
    });

    if (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        error: 'Failed to send reset email',
        errorDetails: error.message,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
      errorDetails: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update user password
 */
export async function updatePassword({
  password,
  confirmPassword,
}: UpdatePasswordData): Promise<AuthResult> {
  try {
    const supabase = await createClient();

    // Validate passwords match
    if (password !== confirmPassword) {
      return {
        success: false,
        error: 'Passwords do not match',
      };
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      console.error('Password update error:', error);
      return {
        success: false,
        error: 'Failed to update password',
        errorDetails: error.message,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Password update error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
      errorDetails: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Sign out user
 */
export async function signOut(): Promise<AuthResult> {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Sign out error:', error);
      return {
        success: false,
        error: 'Failed to sign out',
        errorDetails: error.message,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
      errorDetails: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Client-side sign in for forms
 */
export async function clientSignIn(loginData: LoginData): Promise<AuthResult> {
  try {
    const supabase = createClientSideSupabase();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginData.email.trim().toLowerCase(),
      password: loginData.password,
    });

    if (error) {
      console.error('Client sign in error:', error);
      return {
        success: false,
        error: 'Invalid email or password',
        errorDetails: error.message,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Client sign in error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
      errorDetails: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Client-side sign out
 */
export async function clientSignOut(): Promise<void> {
  const supabase = createClientSideSupabase();
  await supabase.auth.signOut();
}

/**
 * Check if email is already registered
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email.trim().toLowerCase())
      .single();

    return !error && data !== null;
  } catch (error) {
    console.error('Error checking email:', error);
    return false;
  }
}

/**
 * Helper function to get user-friendly sign up error messages
 */
function getSignUpErrorMessage(error: AuthError): string {
  switch (error.message) {
    case 'User already registered':
      return 'An account with this email already exists';
    case 'Password should be at least 6 characters':
      return 'Password must be at least 6 characters long';
    case 'Invalid email':
      return 'Please enter a valid email address';
    default:
      if (error.message.includes('weak password')) {
        return 'Password is too weak. Please choose a stronger password';
      }
      return 'Sign up failed. Please try again';
  }
}
