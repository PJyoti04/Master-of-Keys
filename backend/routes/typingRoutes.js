import express from "express";
import { saveSession, getHistory } from '../controllers/typingController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/practice', protect, saveSession);
router.get('/dashboard', protect, getHistory);

export default router;