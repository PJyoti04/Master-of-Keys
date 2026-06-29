import express from "express";
import {
  createRoom,
  getRoom,
  joinRoom,
  leaveRoom,
  getRoomResults,
} from "../controllers/roomController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, createRoom);
router.post("/join", protect, joinRoom);
router.post("/leave", protect, leaveRoom);
router.get("/:roomCode", protect, getRoom);
router.get("/:roomCode/results", protect, getRoomResults);

export default router;