import { createClient } from '@/lib/supabase/server';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { redirect } from 'next/navigation';
import type { User, Session } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

export { redirect };

export type AuthUser = User;
export type AuthSession = Session;

/**
 * Get the current authenticated user from the server
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }

  return user;
}

/**
 * Get the current session from the server
 */
export async function getCurrentSession(): Promise<AuthSession | null> {
  const supabase = await createClient();
  
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error('Error getting current session:', error);
    return null;
  }

  return session;
}

/**
 * Require authentication - redirect to login if not authenticated
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  return user;
}

/**
 * Redirect authenticated users away from auth pages
 */
export async function redirectIfAuthenticated(): Promise<void> {
  const user = await getCurrentUser();
  
  if (user) {
    redirect('/dashboard');
  }
}

/**
 * Get user profile data
 */
export async function getUserProfile(userId: string): Promise<Database['public']['Tables']['profiles']['Row'] | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error getting user profile:', error);
    return null;
  }

  return data;
}

/**
 * Get the current user with profile data
 */
export async function getCurrentUserWithProfile(): Promise<{
  user: AuthUser;
  profile: Database['public']['Tables']['profiles']['Row'] | null;
} | null> {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }

  const profile = await getUserProfile(user.id);

  return { user, profile };
}

/**
 * Get user with profile data (alias for compatibility)
 */
export async function getUserWithProfile() {
  return await getCurrentUserWithProfile();
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

/**
 * Check if user is a new user (no profile yet)
 */
export async function isNewUser(userId: string): Promise<boolean> {
  const profile = await getUserProfile(userId);
  return profile === null;
}

/**
 * Create client-side supabase client for browser interactions
 */
export function createClientSideSupabase() {
  return createBrowserClient();
}
