const express = require('express');
const { runGapAnalysis } = require('../controllers/analysisController');

const router = express.Router();

// POST /api/analysis/gap-analysis
router.post('/gap-analysis', runGapAnalysis);

module.exports = router;
