import * as authModel from '../models/authModel.js';

/**
 * Register a new user
 */
export async function registerUser(email, password, full_name) {
  try {
    const data = await authModel.registerUser(email, password, full_name);
    return {
      user: data.user,
      session: data.session
    };
  } catch (error) {
    throw new Error(error.message || 'Registration failed');
  }
}

/**
 * Sign in user
 */
export async function signInUser(email, password) {
  try {
    const data = await authModel.signInUser(email, password);
    return {
      user: data.user,
      session: data.session
    };
  } catch (error) {
    throw new Error(error.message || 'Login failed');
  }
}

/**
 * Get current user with profile
 */
export async function getCurrentUser(userId, userObject) {
  try {
    const profile = await authModel.getUserProfile(userId);
    return {
      ...userObject,
      profile
    };
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch profile');
  }
}

/**
 * Update user profile
 */
export async function updateProfile(userId, updates) {
  try {
    const profile = await authModel.updateUserProfile(userId, updates);
    return profile;
  } catch (error) {
    throw new Error(error.message || 'Failed to update profile');
  }
}

/**
 * Sign out user
 */
export async function signOutUser() {
  try {
    await authModel.signOutUser();
  } catch (error) {
    throw new Error(error.message || 'Logout failed');
  }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email, frontendUrl) {
  try {
    const redirectUrl = `${frontendUrl}/reset-password`;
    await authModel.requestPasswordReset(email, redirectUrl);
  } catch (error) {
    throw new Error(error.message || 'Failed to send password reset email');
  }
}

/**
 * Reset password
 */
export async function resetPassword(password) {
  try {
    await authModel.updateUserPassword(password);
  } catch (error) {
    throw new Error(error.message || 'Failed to update password');
  }
}
