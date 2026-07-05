const { supabase, isSupabaseConfigured } = require('../config/supabase');
const { DEMO_USER_ID, jobRecommendations } = require('../data/demoData');

const getRecommendations = async (req, res) => {
  try {
    const userId = req.query.user_id || req.user?.id || DEMO_USER_ID;

    if (!isSupabaseConfigured) {
      return res.status(200).json({
        success: true,
        message: 'Job recommendations loaded from demo data.',
        data: jobRecommendations
      });
    }

    const { data, error } = await supabase
      .from('job_recommendations')
      .select('*')
      .eq('user_id', userId)
      .order('match_score', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: `Job recommendations could not be loaded: ${error.message}`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Job recommendations loaded successfully.',
      data: data.length ? data : jobRecommendations
    });
  } catch (error) {
    console.error('Job recommendations error:', error);
    return res.status(500).json({
      success: false,
      message: 'Job recommendations could not be loaded.'
    });
  }
};

module.exports = {
  getRecommendations
};
