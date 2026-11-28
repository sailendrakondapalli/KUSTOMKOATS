import { supabase } from '../config/supabase.js';

/**
 * Register a new user with Supabase Auth
 */
export async function registerUser(email, password, full_name) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: full_name || ''
      }
    }
  });

  if (error) throw error;
  return data;
}

/**
 * Sign in user with email and password
 */
export async function signInUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Sign out user
 */
export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Request password reset email
 */
export async function requestPasswordReset(email, redirectUrl) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl
  });

  if (error) throw error;
}

/**
 * Update user password
 */
export async function updateUserPassword(password) {
  const { error } = await supabase.auth.updateUser({
    password
  });

  if (error) throw error;
}
