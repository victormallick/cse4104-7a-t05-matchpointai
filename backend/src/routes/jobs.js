const express = require('express');
const { getRecommendations } = require('../controllers/jobsController');

const router = express.Router();

router.get('/recommendations', getRecommendations);

module.exports = router;
