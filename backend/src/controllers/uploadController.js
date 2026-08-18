const { randomUUID } = require('crypto');
const { supabase, isSupabaseConfigured } = require('../config/supabase');
const { DEMO_USER_ID, now, store } = require('../data/demoData');
const ParserService = require('../services/parserService');

const uploadResume = async (req, res) => {
  try {
    const file = req.file;
    const userId = req.body.user_id || req.headers['x-user-id'] || req.user?.id || DEMO_USER_ID;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Select a PDF or DOCX resume to upload.'
      });
    }

    const parsedText = await ParserService.parseFile(
      file.buffer,
      file.mimetype,
      file.originalname
    );

    if (!parsedText.trim()) {
      return res.status(422).json({
        success: false,
        message: 'The uploaded document did not contain readable text.'
      });
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('resumes')
          .insert([
            {
              user_id: userId,
              file_path: file.originalname,
              file_type: file.mimetype,
              parsed_text: parsedText
            }
          ])
          .select()
          .single();

        if (!error && data) {
          return res.status(200).json({
            success: true,
            message: 'Resume uploaded and parsed successfully.',
            data: {
              resume_id: data.id,
              user_id: data.user_id,
              file_name: data.file_path,
              file_type: data.file_type,
              parsed_text_length: parsedText.length,
              uploaded_at: data.uploaded_at
            }
          });
        }
        console.warn('Supabase resume insert notice (falling back to memory):', error?.message);
      } catch (dbErr) {
        console.warn('Supabase database error during resume upload:', dbErr.message);
      }
    }

    const resume = {
      id: randomUUID(),
      user_id: userId,
      file_path: file.originalname,
      file_type: file.mimetype,
      parsed_text: parsedText,
      uploaded_at: now()
    };
    store.resumes.set(resume.id, resume);

    return res.status(200).json({
      success: true,
      message: 'Resume uploaded and parsed successfully.',
      data: {
        resume_id: resume.id,
        user_id: resume.user_id,
        file_name: resume.file_path,
        file_type: resume.file_type,
        parsed_text_length: parsedText.length,
        uploaded_at: resume.uploaded_at
      }
    });
  } catch (error) {
    console.error('Upload controller error:', error);
    return res.status(422).json({
      success: false,
      message: error.message || 'The resume could not be parsed.'
    });
  }
};

module.exports = {
  uploadResume
};
