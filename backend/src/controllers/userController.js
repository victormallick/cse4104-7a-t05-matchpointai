const { randomUUID } = require('crypto');
const { supabase, isSupabaseConfigured } = require('../config/supabase');
const { DEMO_USER_ID, demoUser, now, store } = require('../data/demoData');

const resolveUserId = (req) =>
  req.user?.id || req.query.user_id || req.headers['x-user-id'] || DEMO_USER_ID;

const getUserHistory = async (req, res) => {
  try {
    const userId = resolveUserId(req);

    if (!isSupabaseConfigured) {
      return res.status(200).json({
        success: true,
        message: 'Analysis history loaded from demo data.',
        data: store.history
      });
    }

    const { data, error } = await supabase
      .from('analysis_records')
      .select(`
        id,
        ats_score,
        missing_keywords,
        missing_skills,
        improved_bullets,
        analyzed_at,
        resumes (id, file_path, uploaded_at),
        job_descriptions (id, title, company, jd_text, created_at)
      `)
      .eq('user_id', userId)
      .order('analyzed_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: `Failed to fetch analysis history: ${error.message}`
      });
    }

    const history = data.map((record) => ({
      analysis_id: record.id,
      job_title: record.job_descriptions?.title || 'Target role',
      company: record.job_descriptions?.company || 'Not specified',
      ats_score: record.ats_score,
      missing_keywords: record.missing_keywords || [],
      missing_skills: record.missing_skills || [],
      improvement_suggestions: record.improved_bullets || [],
      analyzed_at: record.analyzed_at,
      resume: record.resumes
        ? {
            id: record.resumes.id,
            file_name: record.resumes.file_path,
            uploaded_at: record.resumes.uploaded_at
          }
        : null
    }));

    return res.status(200).json({
      success: true,
      message: 'Analysis history loaded successfully.',
      data: history
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
        ...demoUser,
        id: req.body.id || randomUUID(),
        email,
        full_name: fullName,
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

    if (!isSupabaseConfigured) {
      const profile = store.profiles.get(userId) || store.profiles.get(DEMO_USER_ID);
      return res.status(200).json({
        success: true,
        message: 'Profile loaded from demo data.',
        data: profile
      });
    }

    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, target_job_role, portfolio_url, status, created_at, updated_at')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'User profile was not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile loaded successfully.',
      data
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
    const allowedFields = ['full_name', 'target_job_role', 'portfolio_url'];
    const updates = Object.fromEntries(
      allowedFields
        .filter((field) => req.body[field] !== undefined)
        .map((field) => [field, String(req.body[field]).trim()])
    );

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Provide at least one profile field to update.'
      });
    }

    if (!isSupabaseConfigured) {
      const current = store.profiles.get(userId) || store.profiles.get(DEMO_USER_ID);
      const updated = { ...current, ...updates, updated_at: now() };
      store.profiles.set(current.id, updated);

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully in demo mode.',
        data: updated
      });
    }

    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: now() })
      .eq('id', userId)
      .select()
      .single();

    if (error || !data) {
      return res.status(500).json({
        success: false,
        message: `Profile could not be updated: ${error?.message || 'Unknown error'}`
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
