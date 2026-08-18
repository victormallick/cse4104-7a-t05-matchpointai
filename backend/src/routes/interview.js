const express = require('express');
const { generateInterview, evaluateAnswer, getReadinessReport } = require('../controllers/interviewController');

const router = express.Router();

router.post('/generate', generateInterview);
router.post('/evaluate', evaluateAnswer);
router.post('/readiness-report', getReadinessReport);

module.exports = router;
