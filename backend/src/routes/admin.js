const express = require('express');
const {
  getAnalytics,
  getLogs,
  getUsers,
  getAiUsage
} = require('../controllers/adminController');
const { requireAdmin, requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth, requireAdmin);
router.get('/analytics', getAnalytics);
router.get('/logs', getLogs);
router.get('/users', getUsers);
router.get('/ai-usage', getAiUsage);

module.exports = router;
