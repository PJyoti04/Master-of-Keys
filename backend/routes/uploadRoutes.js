import express from "express";
import protect from "../middleware/authMiddleware.js";
import { getAuthParamsForUpload, updateProfilePicture } from "../controllers/uploadController.js";

const router = express.Router();

router.get('/auth', protect, getAuthParamsForUpload);
router.patch('/profile/avatar',protect,updateProfilePicture);

export default router;