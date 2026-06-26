const { supabase } = require('../config/supabase');

/**
 * Controller to manage user profile and fetch analysis history
 */
const getUserHistory = async (req, res) => {
  try {
    // Extract user_id from token session context, query parameters, or custom header
    const userId = req.user?.id || req.query.user_id || req.headers['x-user-id'];

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'user_id is required. Please provide it as a query parameter (?user_id=...) or authenticate.'
      });
    }

    console.log(`Fetching analysis history for user ${userId}`);

    // Query analysis records, joining resume and job description metadata to prevent N+1 queries
    const { data, error } = await supabase
      .from('analysis_records')
      .select(`
        id,
        ats_score,
        missing_keywords,
        improved_bullets,
        analyzed_at,
        resumes (
          id,
          file_path,
          uploaded_at
        ),
        job_descriptions (
          id,
          jd_text,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('analyzed_at', { ascending: false });

    if (error) {
      console.error('Fetch User History error:', error);
      return res.status(500).json({
        success: false,
        error: `Failed to fetch history: ${error.message}`
      });
    }

    // Format the response structure for client readability
    const history = data.map(record => ({
      analysis_id: record.id,
      ats_score: record.ats_score,
      missing_keywords: record.missing_keywords,
      improved_bullets: record.improved_bullets,
      analyzed_at: record.analyzed_at,
      resume: record.resumes ? {
        id: record.resumes.id,
        file_name: record.resumes.file_path,
        uploaded_at: record.resumes.uploaded_at
      } : null,
      job_description: record.job_descriptions ? {
        id: record.job_descriptions.id,
        jd_text_snippet: record.job_descriptions.jd_text.substring(0, 150) + '...',
        created_at: record.job_descriptions.created_at
      } : null
    }));

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    console.error('User history controller error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error fetching user history.'
    });
  }
};

/**
 * Helper endpoint to dynamically create a test user in public.users to simplify testing.
 * The foreign key constraints require users to exist in the database before uploading resumes.
 */
const createTestUser = async (req, res) => {
  try {
    const { email, full_name, id } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'email is required to create a user.'
      });
    }

    // Generate a random UUID if not provided
    const userUuid = id || require('crypto').randomUUID();

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      return res.status(200).json({
        success: true,
        message: 'User already exists.',
        data: {
          user_id: existingUser.id
        }
      });
    }

    // Insert user row
    // Note: In real production setups, users are created via Supabase Auth signup trigger.
    // For local development/testing phase, direct database insertion is allowed.
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          id: userUuid,
          email,
          full_name: full_name || 'Test User'
        }
      ])
      .select();

    if (error) {
      console.error('Create test user database error:', error);
      return res.status(500).json({
        success: false,
        error: `Database error: ${error.message}. If database RLS policies block this insert, check schema.sql setup.`
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Test user created successfully.',
      data: {
        user_id: data[0].id,
        email: data[0].email,
        full_name: data[0].full_name,
        created_at: data[0].created_at
      }
    });
  } catch (error) {
    console.error('Create test user error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error.'
    });
  }
};

/**
 * Controller to fetch the profile of the currently logged-in user
 */
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // populated by requireAuth middleware

    console.log(`Fetching profile for authenticated user ${userId}`);

    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, created_at')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error('Fetch Profile database error:', error);
      return res.status(404).json({
        success: false,
        error: 'User profile not found in public database.'
      });
    }

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('User profile controller error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error fetching profile.'
    });
  }
};

/**
 * Controller to update the profile of the currently logged-in user
 */
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // populated by requireAuth middleware
    const { full_name } = req.body;

    if (full_name === undefined) {
      return res.status(400).json({
        success: false,
        error: 'full_name parameter is required to perform an update.'
      });
    }

    console.log(`Updating profile for authenticated user ${userId}`);

    const { data, error } = await supabase
      .from('users')
      .update({ full_name })
      .eq('id', userId)
      .select()
      .single();

    if (error || !data) {
      console.error('Update Profile database error:', error);
      return res.status(500).json({
        success: false,
        error: `Failed to update user profile: ${error.message}`
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
      error: error.message || 'Internal server error updating profile.'
    });
  }
};

module.exports = {
  getUserHistory,
  createTestUser,
  getUserProfile,
  updateUserProfile
};
