const { supabase } = require('../config/supabase');

/**
 * Controller to handle gap analysis between a parsed resume and a job description.
 */
const runGapAnalysis = async (req, res) => {
  try {
    const { user_id, resume_id, jd_id, jd_text } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id is required.'
      });
    }

    if (!resume_id) {
      return res.status(400).json({
        success: false,
        error: 'resume_id is required.'
      });
    }

    // 1. Resolve or Create Job Description
    let resolvedJdId = jd_id;
    let resolvedJdText = jd_text;

    if (!resolvedJdId && !resolvedJdText) {
      return res.status(400).json({
        success: false,
        error: 'Either jd_id or jd_text must be provided.'
      });
    }

    // If only jd_text is provided, save it to 'job_descriptions' database first
    if (!resolvedJdId) {
      const { data: jdData, error: jdError } = await supabase
        .from('job_descriptions')
        .insert([
          {
            user_id,
            jd_text: resolvedJdText
          }
        ])
        .select();

      if (jdError) {
        console.error('Save Job Description error:', jdError);
        return res.status(500).json({
          success: false,
          error: `Failed to save job description: ${jdError.message}`
        });
      }

      resolvedJdId = jdData[0].id;
    } else {
      // Fetch the existing job description text if not provided in the request
      if (!resolvedJdText) {
        const { data: jdData, error: jdError } = await supabase
          .from('job_descriptions')
          .select('jd_text')
          .eq('id', resolvedJdId)
          .single();

        if (jdError || !jdData) {
          console.error('Fetch Job Description error:', jdError);
          return res.status(404).json({
            success: false,
            error: 'Job description not found.'
          });
        }
        resolvedJdText = jdData.jd_text;
      }
    }

    // 2. Fetch the Resume Text
    const { data: resumeData, error: resumeError } = await supabase
      .from('resumes')
      .select('parsed_text')
      .eq('id', resume_id)
      .single();

    if (resumeError || !resumeData) {
      console.error('Fetch Resume error:', resumeError);
      return res.status(404).json({
        success: false,
        error: 'Resume not found.'
      });
    }

    const resumeText = resumeData.parsed_text;

    console.log(`Starting gap analysis for user ${user_id}. Resume length: ${resumeText.length}, JD length: ${resolvedJdText.length}`);

    // 3. AI / LLM PLACEHOLDER LOGIC
    // In Phase 2, we will call OpenAI or Gemini here.
    // For now, we generate realistic mock analysis results based on standard criteria.
    const mockAtsScore = Math.floor(Math.random() * (88 - 55 + 1)) + 55; // Score between 55 and 88
    
    const mockMissingKeywords = [
      'Docker',
      'Kubernetes',
      'CI/CD Pipelines',
      'Redis',
      'TypeScript'
    ];

    const mockImprovedBullets = [
      {
        original: 'Responsible for maintaining the backend code and fixing bugs.',
        improved: 'Developed and optimized 15+ backend REST APIs using Node.js and TypeScript, reducing load latency by 25% and resolving critical bugs.',
        reason: 'Quantified achievements with metrics and highlighted the backend tech stack.'
      },
      {
        original: 'Worked with team on deployment of application.',
        improved: 'Orchestrated containerized deployments using Docker and Kubernetes, reducing software release cycle times by 40%.',
        reason: 'Demonstrated cloud computing and deployment skills with clear impact.'
      }
    ];

    // 4. Save Analysis Record to Supabase
    const { data: analysisData, error: analysisError } = await supabase
      .from('analysis_records')
      .insert([
        {
          user_id,
          resume_id,
          jd_id: resolvedJdId,
          ats_score: mockAtsScore,
          missing_keywords: mockMissingKeywords,
          improved_bullets: mockImprovedBullets
        }
      ])
      .select();

    if (analysisError) {
      console.error('Save Analysis Record error:', analysisError);
      return res.status(500).json({
        success: false,
        error: `Failed to save analysis record: ${analysisError.message}`
      });
    }

    const newAnalysisRecord = analysisData[0];

    // 5. Generate Mock Mock Interview Questions (Interview Session)
    const mockQuestions = [
      {
        id: 1,
        question: 'Explain how containerizing an application with Docker can solve deployment inconsistency issues.',
        topic: 'Docker',
        difficulty: 'Medium'
      },
      {
        id: 2,
        question: 'Describe your experience implementing Redis for session caching and data throughput speedups.',
        topic: 'Redis',
        difficulty: 'Hard'
      },
      {
        id: 3,
        question: 'How do you handle schema migrations safely in a production database environment?',
        topic: 'Database Migrations',
        difficulty: 'Medium'
      }
    ];

    const { data: sessionData, error: sessionError } = await supabase
      .from('interview_sessions')
      .insert([
        {
          user_id,
          analysis_id: newAnalysisRecord.id,
          questions_json: mockQuestions
        }
      ])
      .select();

    if (sessionError) {
      console.error('Save Interview Session error:', sessionError);
      // We don't fail the whole request if interview questions fail to save, just warn
      console.warn('Warning: Failed to generate and save mock interview questions.');
    }

    return res.status(200).json({
      success: true,
      message: 'Gap analysis successfully computed (placeholder mode).',
      data: {
        analysis_id: newAnalysisRecord.id,
        user_id: newAnalysisRecord.user_id,
        resume_id: newAnalysisRecord.resume_id,
        jd_id: newAnalysisRecord.jd_id,
        ats_score: newAnalysisRecord.ats_score,
        missing_keywords: newAnalysisRecord.missing_keywords,
        improved_bullets: newAnalysisRecord.improved_bullets,
        analyzed_at: newAnalysisRecord.analyzed_at,
        interview_session: sessionData ? {
          session_id: sessionData[0].id,
          questions: sessionData[0].questions_json
        } : null
      }
    });
  } catch (error) {
    console.error('Gap analysis controller error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error during gap analysis.'
    });
  }
};

module.exports = {
  runGapAnalysis
};
