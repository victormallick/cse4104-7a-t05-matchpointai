const express = require('express');
const { 
  getUserHistory, 
  createTestUser, 
  getUserProfile, 
  updateUserProfile 
} = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// User Profiles - Protected by JWT Authentication
// GET /api/user/profile - Fetch profile of logged-in user
router.get('/profile', requireAuth, getUserProfile);

// PUT /api/user/profile - Update profile details of logged-in user
router.put('/profile', requireAuth, updateUserProfile);

// GET /api/user/history - Fetch past analysis records (supports optional JWT context)
router.get('/history', (req, res, next) => {
  if (req.headers.authorization) {
    return requireAuth(req, res, next);
  }
  next();
}, getUserHistory);

// POST /api/user/test-user (Helper route to bootstrap users for tests/devs)
router.post('/test-user', createTestUser);

module.exports = router;
