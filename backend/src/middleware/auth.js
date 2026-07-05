const { supabase, isSupabaseConfigured } = require('../config/supabase');
const { demoUser, adminUser, store } = require('../data/demoData');

/**
 * Authentication middleware that verifies the Supabase JWT token.
 * Expects header format: Authorization: Bearer <token>
 */
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!isSupabaseConfigured) {
      const token = authHeader?.startsWith('Bearer ')
        ? authHeader.slice('Bearer '.length)
        : '';
      const wantsAdmin = authHeader?.toLowerCase().includes('admin') ||
        req.headers['x-demo-role'] === 'admin';
      const registeredUserId = token.startsWith('demo-user-')
        ? token.slice('demo-user-'.length)
        : '';
      const registeredUser = store.profiles.get(registeredUserId);

      req.user = wantsAdmin
        ? { ...adminUser }
        : { ...(registeredUser || demoUser) };
      req.isDemoMode = true;
      return next();
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Use an Authorization: Bearer <token> header.'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. The bearer token is empty.'
      });
    }

    // Verify token validity and retrieve corresponding user account details from Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('JWT verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Access denied. The authentication token is invalid or expired.'
      });
    }

    // Attach user record context to the request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication middleware exception:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication could not be completed.'
    });
  }
};

const requireAdmin = async (req, res, next) => {
  if (req.isDemoMode) {
    return next();
  }

  const metadataRole = req.user?.role ||
    req.user?.user_metadata?.role ||
    req.user?.app_metadata?.role;

  if (metadataRole === 'admin') {
    return next();
  }

  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', req.user.id)
    .single();

  if (error || data?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Administrator access is required.'
    });
  }

  return next();
};

module.exports = {
  requireAuth,
  requireAdmin
};
