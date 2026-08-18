const express = require('express');
const { getRecommendations, generateCoverLetter } = require('../controllers/jobsController');

const router = express.Router();

router.get('/recommendations', getRecommendations);
router.post('/recommendations', getRecommendations);
router.post('/cover-letter', generateCoverLetter);

module.exports = router;
