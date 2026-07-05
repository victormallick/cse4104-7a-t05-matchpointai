const { randomUUID } = require('crypto');
const { supabase, isSupabaseConfigured } = require('../config/supabase');
const {
  DEMO_USER_ID,
  interviewQuestions,
  store
} = require('../data/demoData');

const generateInterview = async (req, res) => {
  try {
    const analysisId = req.body.analysis_id;
    const userId = req.body.user_id || req.user?.id || DEMO_USER_ID;
    const analysis = analysisId ? store.analyses.get(analysisId) : null;
    const missingSkills = req.body.missing_skills || analysis?.missing_skills || [];

    const questions = {
      technical: interviewQuestions.technical.map((question, index) => ({
        ...question,
        focus_skill: missingSkills[index] || question.topic
      })),
      behavioral: interviewQuestions.behavioral,
      hr: interviewQuestions.hr
    };

    let sessionId = randomUUID();

    if (isSupabaseConfigured && analysisId) {
      const { data, error } = await supabase
        .from('interview_sessions')
        .insert([
          {
            user_id: userId,
            analysis_id: analysisId,
            questions_json: questions
          }
        ])
        .select()
        .single();

      if (error) {
        return res.status(500).json({
          success: false,
          message: `Interview session could not be saved: ${error.message}`
        });
      }
      sessionId = data.id;
    }

    return res.status(200).json({
      success: true,
      message: isSupabaseConfigured
        ? 'Interview questions generated successfully.'
        : 'Interview questions generated from the demo question bank.',
      data: {
        session_id: sessionId,
        analysis_id: analysisId || null,
        questions,
        total_questions:
          questions.technical.length + questions.behavioral.length + questions.hr.length,
        generation_mode: process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY
          ? 'ai-ready'
          : 'demo'
      }
    });
  } catch (error) {
    console.error('Interview generation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Interview questions could not be generated.'
    });
  }
};

module.exports = {
  generateInterview
};
