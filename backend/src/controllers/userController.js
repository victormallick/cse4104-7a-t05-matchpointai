const { randomUUID } = require('crypto');
const { supabase, isSupabaseConfigured } = require('../config/supabase');
const { DEMO_USER_ID, demoUser, now, store } = require('../data/demoData');

const resolveUserId = (req) =>
  req.user?.id || req.query?.user_id || req.headers?.['x-user-id'] || DEMO_USER_ID;

const getUserHistory = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    let history = [];

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('user_scans')
          .select('id, scan_data, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          history = data.map((record) => {
            const scan = record.scan_data || {};
            return {
              analysis_id: record.id,
              job_title: scan.job_title || 'Target role',
              company: scan.company || '',
              ats_score: scan.ats_score ?? 0,
              match_rate: scan.match_rate ?? scan.ats_score ?? 0,
              missing_keywords: scan.missing_keywords || [],
              missing_skills: scan.missing_skills || [],
              extracted_skills: scan.skills || scan.extracted_skills || [],
              strengths: scan.strengths || [],
              weaknesses: scan.weaknesses || [],
              improvement_suggestions: scan.suggestions || scan.improved_bullets || scan.actionable_fixes || [],
              category_scores: scan.category_scores || {},
              analyzed_at: scan.analyzed_at || record.created_at,
              ...scan
            };
          });

          return res.status(200).json({
            success: true,
            message: 'Analysis history loaded successfully from Supabase.',
            data: history
          });
        }
      } catch (err) {
        console.warn('Supabase user_scans history fetch note:', err.message);
      }
    }

    const memoryItems = store.history.filter((item) => item.user_id === userId);
    return res.status(200).json({
      success: true,
      message: 'Analysis history loaded successfully.',
      data: memoryItems
    });
  } catch (error) {
    console.error('User history controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Analysis history could not be loaded.'
    });
  }
};

const createTestUser = async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const fullName = String(req.body.full_name || 'Test User').trim();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.'
      });
    }

    if (!isSupabaseConfigured) {
      const user = {
        id: req.body.id || randomUUID(),
        email,
        full_name: fullName,
        location: '',
        bio: '',
        target_job_role: '',
        portfolio_url: '',
        linkedin_url: '',
        github_url: '',
        skills: [],
        created_at: now(),
        updated_at: now()
      };
      store.profiles.set(user.id, user);

      return res.status(201).json({
        success: true,
        message: 'Demo test user created successfully.',
        data: user
      });
    }

    const userId = req.body.id || randomUUID();
    const { data, error } = await supabase
      .from('users')
      .upsert([{ id: userId, email, full_name: fullName }], { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: `Test user could not be created: ${error.message}`
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Test user created successfully.',
      data
    });
  } catch (error) {
    console.error('Create test user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Test user could not be created.'
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const oauthFullName = req.user?.user_metadata?.full_name || req.user?.user_metadata?.name || req.user?.full_name || '';
    const userEmail = req.user?.email || req.user?.user_metadata?.email || '';

    const cleanDefault = {
      id: userId,
      full_name: oauthFullName,
      email: userEmail,
      location: '',
      bio: '',
      target_job_role: '',
      portfolio_url: '',
      linkedin_url: '',
      github_url: '',
      skills: []
    };

    if (!isSupabaseConfigured) {
      const profile = store.profiles.get(userId);
      return res.status(200).json({
        success: true,
        message: 'Profile loaded.',
        data: profile || cleanDefault
      });
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      const stored = store.profiles.get(userId);
      const fallback = stored ? { ...cleanDefault, ...stored } : cleanDefault;
      return res.status(200).json({
        success: true,
        message: 'Profile loaded.',
        data: {
          ...cleanDefault,
          ...fallback,
          email: userEmail || fallback.email,
          full_name: oauthFullName || fallback.full_name
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile loaded successfully.',
      data: {
        ...cleanDefault,
        ...data,
        email: data.email || userEmail,
        full_name: data.full_name || oauthFullName
      }
    });
  } catch (error) {
    console.error('User profile controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Profile could not be loaded.'
    });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const allowedFields = [
      'full_name',
      'target_job_role',
      'portfolio_url',
      'bio',
      'location',
      'linkedin_url',
      'github_url',
      'target_seniority',
      'target_region',
      'expected_salary',
      'work_preference',
      'skills'
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Provide at least one profile field to update.'
      });
    }

    if (!isSupabaseConfigured) {
      const current = store.profiles.get(userId) || store.profiles.get(DEMO_USER_ID) || demoUser;
      const updated = { ...current, ...updates, updated_at: now() };
      store.profiles.set(current.id, updated);

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: updated
      });
    }

    const userEmail = req.user?.email || req.user?.user_metadata?.email || '';
    const userPayload = {
      id: userId,
      ...(userEmail ? { email: userEmail } : {}),
      ...updates,
      updated_at: now()
    };

    // Also update Supabase Auth user_metadata so future OAuth tokens reflect the updated name
    if (updates.full_name) {
      try {
        if (supabase.auth?.admin?.updateUserById) {
          await supabase.auth.admin.updateUserById(userId, {
            user_metadata: {
              ...(req.user?.user_metadata || {}),
              full_name: updates.full_name,
              name: updates.full_name
            }
          });
        }
      } catch (authMetaErr) {
        console.warn('Could not sync user_metadata in Supabase Auth:', authMetaErr?.message || authMetaErr);
      }
    }

    const { data, error } = await supabase
      .from('users')
      .upsert(userPayload, { onConflict: 'id' })
      .select()
      .single();

    if (error || !data) {
      console.warn('Supabase profile upsert note:', error?.message);
      const current = store.profiles.get(userId) || store.profiles.get(DEMO_USER_ID) || demoUser;
      const updated = { ...current, ...updates, updated_at: now() };
      store.profiles.set(current.id, updated);

      return res.status(200).json({
        success: true,
        message: 'Profile updated locally.',
        data: updated
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data
    });
  } catch (error) {
    console.error('Update profile controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Profile could not be updated.'
    });
  }
};

module.exports = {
  getUserHistory,
  createTestUser,
  getUserProfile,
  updateUserProfile
};
