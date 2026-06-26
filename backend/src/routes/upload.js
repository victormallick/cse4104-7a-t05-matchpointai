const express = require('express');
const multer = require('multer');
const { uploadResume } = require('../controllers/uploadController');

const router = express.Router();

// Configure multer memory storage
const storage = multer.memoryStorage();

// Limit file size to 10MB and restrict to PDF, DOCX, and TXT
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    // Also check extensions for clients with missing/wrong mime types
    const fileExtension = file.originalname.split('.').pop().toLowerCase();
    const allowedExtensions = ['pdf', 'docx', 'txt'];

    if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format. Only PDF, DOCX, and TXT files are allowed.'));
    }
  }
});

// Define upload endpoint: POST /api/upload
// The middleware will parse the multipart/form-data request with key 'resume'
router.post('/', (req, res, next) => {
  upload.single('resume')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer specific errors
      return res.status(400).json({
        success: false,
        error: `File upload error: ${err.message}`
      });
    } else if (err) {
      // Other errors (e.g. file type restriction)
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
    next();
  });
}, uploadResume);

module.exports = router;
