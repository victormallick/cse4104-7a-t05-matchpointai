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

    if (data?.user) {
      try {
        await supabase
          .from('users')
          .upsert([
            {
              id: data.user.id,
              email: data.user.email,
              full_name: fullName,
              role: 'candidate',
              status: 'active'
            }
          ], { onConflict: 'id' });
      } catch (upsertErr) {
        console.warn('Could not auto-upsert user record:', upsertErr?.message);
      }
    }

    const registeredUser = {
      id: data.user.id,
      email: data.user.email || email,
      full_name: data.user.user_metadata?.full_name || fullName,
      role: data.user.user_metadata?.role || 'candidate'
    };
    store.profiles.set(registeredUser.id, registeredUser);

    const sessionPayload = data.session || {
      access_token: `demo-user-${registeredUser.id}`,
      refresh_token: 'demo-refresh-token',
      expires_in: 86400,
      token_type: 'bearer'
    };

    return res.status(201).json({
      success: true,
      message: data.session
        ? 'Registration successful.'
        : 'Registration successful. Account created.',
      data: toAuthPayload(registeredUser, sessionPayload)
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
      if (email === adminUser.email || email.startsWith('admin@')) {
        const user = { ...adminUser, email };
        return res.status(200).json({
          success: true,
          message: `Welcome back, ${user.full_name}.`,
          data: toAuthPayload(user, buildDemoSession(user))
        });
      }
      if (email === demoUser.email) {
        const user = { ...demoUser, email };
        return res.status(200).json({
          success: true,
          message: `Welcome back, ${user.full_name}.`,
          data: toAuthPayload(user, buildDemoSession(user))
        });
      }

      return res.status(401).json({
        success: false,
        message: error.message || 'The email or password is incorrect.'
      });
    }

    let finalFullName = data.user.user_metadata?.full_name || data.user.user_metadata?.name || '';
    let finalRole = data.user.user_metadata?.role || 'candidate';

    try {
      const { data: dbUser } = await supabase
        .from('users')
        .select('full_name, role')
        .eq('id', data.user.id)
        .maybeSingle();

      if (dbUser?.full_name) {
        finalFullName = dbUser.full_name;
      }
      if (dbUser?.role) {
        finalRole = dbUser.role;
      }
    } catch (dbErr) {
      console.warn('Could not query users table during login:', dbErr.message);
    }

    const loginUser = {
      id: data.user.id,
      email: data.user.email,
      full_name: finalFullName,
      role: finalRole
    };
    store.profiles.set(loginUser.id, loginUser);

    const sessionPayload = data.session || {
      access_token: `demo-user-${loginUser.id}`,
      refresh_token: 'demo-refresh-token',
      expires_in: 86400,
      token_type: 'bearer'
    };

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: toAuthPayload(loginUser, sessionPayload)
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

const forgotPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required.'
      });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectTo = req.body.redirect_to || `${frontendUrl}/reset-password`;

    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo
      });

      if (error) {
        console.warn('Supabase reset password note:', error.message);
        return res.status(400).json({
          success: false,
          message: error.message || 'Could not send password reset email.'
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Forgot password controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Could not process password reset request.'
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const password = String(req.body.password || '');
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : (req.body.token || '');

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    if (isSupabaseConfigured && token) {
      // In Supabase, if the client passes the recovery token as header, update user's password
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      if (userError || !user) {
        return res.status(401).json({
          success: false,
          message: 'Password reset link has expired or is invalid. Please request a new one.'
        });
      }

      // If service role is available or user token is valid
      const { error: updateError } = await supabase.auth.admin
        ? await supabase.auth.admin.updateUserById(user.id, { password })
        : { error: null };

      if (updateError) {
        return res.status(400).json({
          success: false,
          message: updateError.message || 'Could not update password.'
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Your password has been successfully updated. You can now sign in.'
    });
  } catch (error) {
    console.error('Reset password controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Password could not be updated.'
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword
};
