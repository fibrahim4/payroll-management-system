const express = require('express');
const router = express.Router();
const { register, login, getMe, seed } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/seed', seed); // Setup admin account

module.exports = router;
