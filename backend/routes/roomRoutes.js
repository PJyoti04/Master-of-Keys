import express from "express";
import { createRoom, getRoom, joinRoom } from "../controllers/roomController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, createRoom);
router.get("/:roomCode", protect, getRoom);
router.post("/join", protect, joinRoom);

export default router;