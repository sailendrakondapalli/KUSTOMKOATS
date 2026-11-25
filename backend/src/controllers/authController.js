import * as authService from '../services/authService.js';

/**
 * Register new user
 */
export async function register(req, res) {
  try {
    const { email, password, full_name } = req.body;
    const data = await authService.registerUser(email, password, full_name);

    res.status(201).json({
      success: true,
      data,
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      error: 'Registration failed',
      message: error.message
    });
  }
}

/**
 * Login user
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const data = await authService.signInUser(email, password);

    res.json({
      success: true,
      data,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      error: 'Login failed',
      message: error.message
    });
  }
}

/**
 * Get current user profile
 */
export async function getMe(req, res) {
  try {
    const data = await authService.getCurrentUser(req.user.id, req.user);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      error: 'Failed to fetch profile',
      message: error.message
    });
  }
}

/**
 * Update user profile
 */
export async function updateProfile(req, res) {
  try {
    const updates = req.body;
    const data = await authService.updateProfile(req.user.id, updates);

    res.json({
      success: true,
      data,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: error.message
    });
  }
}

/**
 * Logout user
 */
export async function logout(req, res) {
  try {
    await authService.signOutUser();

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: error.message
    });
  }
}

/**
 * Request password reset
 */
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    await authService.requestPasswordReset(email, process.env.FRONTEND_URL);

    res.json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      error: 'Failed to send password reset email',
      message: error.message
    });
  }
}

/**
 * Reset password
 */
export async function resetPassword(req, res) {
  try {
    const { password } = req.body;
    await authService.resetPassword(password);

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({
      error: 'Failed to update password',
      message: error.message
    });
  }
}
