const express = require('express');
const router = express.Router();
const { register, login, logout, getCurrentUser, sendResetOtp, verifyResetOtp, resetPassword } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');


router.get('/me', protect, getCurrentUser);
router.post('/register', register);
router.post('/login', login);
router.post('/logout',logout);
router.post('/sendotp',protect,sendResetOtp);
router.post('/verify',protect,verifyResetOtp);
router.post('/resetpass',protect,resetPassword);

module.exports = router;
