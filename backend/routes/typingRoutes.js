const express = require('express');
const router = express.Router();
const { saveSession, getHistory } = require('../controllers/typingController');
const protect = require('../middleware/authMiddleware');

router.post('/practice', protect, saveSession);
router.get('/dashboard', protect, getHistory);

module.exports = router;