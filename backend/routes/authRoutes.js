import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  getCurrentUser,
  register,
  login,
  logout,
  sendResetOtp,
  verifyResetOtp,
  resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

router.get("/me", protect, getCurrentUser);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/sendotp", protect, sendResetOtp);
router.post("/verify", protect, verifyResetOtp);
router.post("/resetpass", protect, resetPassword);

export default router;
