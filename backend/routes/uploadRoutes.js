import express from "express";
import protect from "../middleware/authMiddleware.js";
import { getAuthParamsForUpload, removeProfileAvatar, updateProfilePicture } from "../controllers/uploadController.js";

const router = express.Router();

router.get('/auth', protect, getAuthParamsForUpload);
router.patch('/profile/avatar',protect,updateProfilePicture);
router.patch('/profile/avatar/remove',protect,removeProfileAvatar);

export default router;