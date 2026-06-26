const { supabase } = require('../config/supabase');
const ParserService = require('../services/parserService');

/**
 * Controller to handle file upload and resume text extraction
 */
const uploadResume = async (req, res) => {
  try {
    const file = req.file;
    // Extract user_id from body or headers (fallback to headers for API flexibility)
    const userId = req.body.user_id || req.headers['x-user-id'];

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded. Please select a resume file (PDF, DOCX, TXT).'
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing user_id. Please provide user_id in request body or X-User-Id header.'
      });
    }

    console.log(`Received file: ${file.originalname} (${file.size} bytes) for user ${userId}`);

    // Parse the file text using the parser service
    const parsedText = await ParserService.parseFile(file.buffer, file.mimetype, file.originalname);

    // Save parsing details and file path placeholder to Supabase 'resumes' table
    // For local setup, we can use a mock path or file name as file_path
    const { data, error } = await supabase
      .from('resumes')
      .insert([
        {
          user_id: userId,
          file_path: file.originalname, // Save filename as temporary file path
          parsed_text: parsedText
        }
      ])
      .select();

    if (error) {
      console.error('Supabase save error:', error);
      
      // If user does not exist in 'users' table (Foreign key constraint violation)
      if (error.code === '23503') {
        return res.status(400).json({
          success: false,
          error: `Foreign key violation: User with ID ${userId} does not exist in the public.users database. Please create the user record first.`
        });
      }

      return res.status(500).json({
        success: false,
        error: `Database insertion failed: ${error.message}`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Resume uploaded and parsed successfully.',
      data: {
        resume_id: data[0].id,
        user_id: data[0].user_id,
        file_name: data[0].file_path,
        parsed_text_length: parsedText.length,
        uploaded_at: data[0].uploaded_at
      }
    });
  } catch (error) {
    console.error('Upload controller error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error during resume upload.'
    });
  }
};

module.exports = {
  uploadResume
};
