const express = require('express');
const { generateInterview } = require('../controllers/interviewController');

const router = express.Router();

router.post('/generate', generateInterview);

module.exports = router;
