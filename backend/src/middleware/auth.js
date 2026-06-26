const { supabase } = require('../config/supabase');

/**
 * Authentication middleware that verifies the Supabase JWT token.
 * Expects header format: Authorization: Bearer <token>
 */
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. Missing or malformed authorization header (expected Bearer token).'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. Bearer token value is empty.'
      });
    }

    // Verify token validity and retrieve corresponding user account details from Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('JWT verification error:', error);
      return res.status(401).json({
        success: false,
        error: 'Access denied. The provided authentication token is invalid or has expired.'
      });
    }

    // Attach user record context to the request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication middleware exception:', error);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred during authentication processing.'
    });
  }
};

module.exports = {
  requireAuth
};
