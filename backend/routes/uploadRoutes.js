import express from "express";
import protect from "../middleware/authMiddleware.js";
import { getAuthParamsForUpload } from "../controllers/uploadController.js";

const router = express.Router();

router.get('/auth', protect, getAuthParamsForUpload);

export default router;