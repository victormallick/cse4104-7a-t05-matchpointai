const { randomUUID } = require('crypto');
const { supabase, isSupabaseConfigured } = require('../config/supabase');
const { adminUser, demoUser, now, store } = require('../data/demoData');

const normalizeEmail = (email = '') => email.trim().toLowerCase();

const buildDemoSession = (user) => ({
  access_token: user.role === 'admin'
    ? 'demo-admin-token'
    : user.id === demoUser.id
      ? 'demo-user-token'
      : `demo-user-${user.id}`,
  refresh_token: 'demo-refresh-token',
  expires_in: 86400,
  token_type: 'bearer'
});

const toAuthPayload = (user, session) => ({
  user_id: user.id,
  email: user.email,
  full_name: user.full_name,
  role: user.role,
  session
});

const register = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    const fullName = String(req.body.full_name || '').trim();

    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and password are required.'
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid email address.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least 6 characters.'
      });
    }

    if (!isSupabaseConfigured) {
      const user = {
        ...demoUser,
        id: randomUUID(),
        email,
        full_name: fullName,
        created_at: now(),
        updated_at: now()
      };

      store.profiles.set(user.id, user);

      return res.status(201).json({
        success: true,
        message: 'Demo account created successfully.',
        data: {
          ...toAuthPayload(user, buildDemoSession(user)),
          demo_mode: true
        }
      });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(201).json({
      success: true,
      message: data.session
        ? 'Registration successful.'
        : 'Registration successful. Check your email if confirmation is enabled.',
      data: toAuthPayload(
        {
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || fullName,
          role: data.user.user_metadata?.role || 'candidate'
        },
        data.session
      )
    });
  } catch (error) {
    console.error('Registration controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Registration could not be completed.'
    });
  }
};

const login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    if (!isSupabaseConfigured) {
      const isAdmin = email === adminUser.email || email.startsWith('admin');
      const baseUser = isAdmin ? adminUser : demoUser;
      const savedProfile = [...store.profiles.values()].find((profile) => profile.email === email);
      const user = savedProfile || {
        ...baseUser,
        email,
        full_name: isAdmin ? adminUser.full_name : baseUser.full_name
      };

      return res.status(200).json({
        success: true,
        message: `Welcome back, ${user.full_name}.`,
        data: {
          ...toAuthPayload(user, buildDemoSession(user)),
          demo_mode: true
        }
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return res.status(401).json({
        success: false,
        message: error.message || 'The email or password is incorrect.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: toAuthPayload(
        {
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || '',
          role: data.user.user_metadata?.role || 'candidate'
        },
        data.session
      )
    });
  } catch (error) {
    console.error('Login controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Login could not be completed.'
    });
  }
};

const logout = async (req, res) => {
  try {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.warn('Supabase sign-out warning:', error.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
      data: { demo_mode: !isSupabaseConfigured }
    });
  } catch (error) {
    console.error('Logout controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Logout could not be completed.'
    });
  }
};

module.exports = {
  register,
  login,
  logout
};
