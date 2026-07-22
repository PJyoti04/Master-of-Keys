import express from "express";

import {
  getDashboardOverview,
  getDashboardSessions,
  getPracticeSessionDetails,
  getRoomSessionDetails,
} from "../controllers/dashboardController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/overview", getDashboardOverview);

router.get("/sessions", getDashboardSessions);

router.get("/practice/:sessionId", getPracticeSessionDetails);

router.get("/rooms/:roomId", getRoomSessionDetails);

export default router;
