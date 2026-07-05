const { supabase, isSupabaseConfigured } = require('../config/supabase');
const {
  adminLogs,
  adminUsers,
  aiUsage,
  analytics
} = require('../data/demoData');

const getAnalytics = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: isSupabaseConfigured
      ? 'System analytics loaded successfully.'
      : 'System analytics loaded from demo data.',
    data: analytics
  });
};

const getLogs = async (req, res) => {
  try {
    if (!isSupabaseConfigured) {
      return res.status(200).json({
        success: true,
        message: 'Admin logs loaded from demo data.',
        data: adminLogs
      });
    }

    const { data, error } = await supabase
      .from('admin_logs')
      .select('*')
      .order('performed_at', { ascending: false })
      .limit(50);

    if (error) {
      return res.status(500).json({
        success: false,
        message: `Admin logs could not be loaded: ${error.message}`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Admin logs loaded successfully.',
      data
    });
  } catch (error) {
    console.error('Admin logs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Admin logs could not be loaded.'
    });
  }
};

const getUsers = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: isSupabaseConfigured
      ? 'User monitoring data loaded successfully.'
      : 'User monitoring data loaded from demo data.',
    data: adminUsers
  });
};

const getAiUsage = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'AI usage monitoring data loaded successfully.',
    data: aiUsage
  });
};

module.exports = {
  getAnalytics,
  getLogs,
  getUsers,
  getAiUsage
};
