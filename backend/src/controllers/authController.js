const { supabase } = require('../config/supabase');

/**
 * Controller handling user registration (Sign Up)
 */
const register = async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    // Validation checks
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long.'
      });
    }

    console.log(`Attempting registration for email: ${email}`);

    // Call Supabase Auth sign up
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: full_name || ''
        }
      }
    });

    if (error) {
      console.error('Supabase registration error:', error);
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    // Check if email confirmation is required (Supabase settings)
    const isConfirmed = data.user && data.user.identities && data.user.identities.length > 0;
    
    return res.status(201).json({
      success: true,
      message: isConfirmed 
        ? 'Registration successful! Verification email sent (if email confirmation is enabled).' 
        : 'Registration successful.',
      data: {
        user_id: data.user.id,
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name || '',
        created_at: data.user.created_at
      }
    });
  } catch (error) {
    console.error('Registration controller error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An unexpected error occurred during user registration.'
    });
  }
};

/**
 * Controller handling user login (Sign In)
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required.'
      });
    }

    console.log(`Attempting login for email: ${email}`);

    // Authenticate user with password via Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Supabase login error:', error);
      return res.status(401).json({
        success: false,
        error: error.message || 'Authentication failed. Please verify credentials.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user_id: data.user.id,
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name || '',
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_in: data.session.expires_in,
          token_type: data.session.token_type
        }
      }
    });
  } catch (error) {
    console.error('Login controller error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An unexpected error occurred during user login.'
    });
  }
};

/**
 * Controller handling user logout (Sign Out)
 */
const logout = async (req, res) => {
  try {
    // If the request contains a bearer token, we can sign out via Supabase SDK
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      // Setting session on client side to run sign out
      const { error } = await supabase.auth.admin.signOut(token);
      if (error) {
        console.warn('Supabase admin signOut session invalidation returned warning:', error.message);
      }
    }

    // Fallback/standard response (tells client to clear their local storage JWT credentials)
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (error) {
    console.error('Logout controller error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An unexpected error occurred during sign out.'
    });
  }
};

module.exports = {
  register,
  login,
  logout
};
