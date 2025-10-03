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
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Supabase Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
    
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

    console.log('Auth user created:', authData.user.id, authData.user.email);
    
    // Verify user was actually created in auth.users table
    const { createClient: createAdminClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Check if user exists in auth.users table
    let userExists = false;
    for (let checkAttempt = 1; checkAttempt <= 5; checkAttempt++) {
      const { data: userInDb, error: userCheckError } = await supabaseAdmin
        .from('auth.users')
        .select('id')
        .eq('id', authData.user.id)
        .single();

      if (!userCheckError && userInDb) {
        userExists = true;
        console.log(`User confirmed in auth.users on attempt ${checkAttempt}`);
        break;
      }
      
      console.log(`User check attempt ${checkAttempt}: User not in auth.users yet`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (!userExists) {
      console.error('User never appeared in auth.users table');
      return {
        success: false,
        error: 'Sign up failed',
        errorDetails: 'User was not properly created',
      };
    }

    console.log('✅ User confirmed in auth.users, starting profile creation...');
    
    // Create user profile using service role key to bypass RLS
    const emergencyContact = emergencyContactName && emergencyContactPhone
      ? {
          name: emergencyContactName,
          phone: emergencyContactPhone,
          relationship: emergencyContactRelationship || 'Emergency Contact',
        }
      : null;

    console.log('📝 Creating profile with data:', {
      id: authData.user.id,
      email: email.trim().toLowerCase(),
      employee_id: employeeId.trim(),
      rank: rank.trim(),
      nationality: nationality.trim()
    });

    // Retry profile creation with multiple attempts
    let profileError: any = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      console.log(`🔄 Profile creation attempt ${attempt}/3...`);
      
      const { error } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authData.user.id,
          first_name: '', // Will be collected later via profile update
          last_name: '',
          email: email.trim().toLowerCase(),
          role: 'seafarer',
          employee_id: employeeId.trim(),
          rank: rank.trim(),  
          nationality: nationality.trim(),
          phone: phone?.trim() || null,
          emergency_contact_name: emergencyContact?.name || null,
          emergency_contact_phone: emergencyContact?.phone || null,
          emergency_contact_relationship: emergencyContact?.relationship || null,
        });

      if (!error) {
        console.log(`✅ Profile created successfully on attempt ${attempt}!`);
        break; // Success!
      }

      profileError = error;
      console.error(`❌ Profile creation attempt ${attempt} failed:`, error);
      
      if (error.code === '23503') {
        // Foreign key constraint - user not ready yet, wait and retry
        console.log(`🕐 User not ready (foreign key constraint), retrying in 2s...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        // Other error, don't retry
        break;
      }
    }

    if (profileError) {
      console.error('🚨 CRITICAL: Profile creation failed after all retry attempts!');
      console.error('Profile error details:', {
        code: profileError.code,
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint
      });
      return {
        success: false,
        error: 'Account created but profile setup failed',
        errorDetails: profileError.message,
      };
    }

    console.log('🎉 SUCCESS: Both user and profile created successfully!');
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


