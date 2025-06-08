const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");
const sendOtpEmail= require("../utils/sendOtpEmail")
const ResetOtp = require("../models/ResetOtp");
const crypto = require("crypto");

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const emailExists = await User.findOne({ email });
    if (emailExists)
      return res.json({ message: "User already exists", type: "error" });

    const userExists = await User.findOne({ username });
    if (userExists)
      return res.json({ message: "User already exists", type: "error" });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({ username, email, password: hashed });
    const token = generateToken(user._id);
    sendEmail(email,username);
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      })
      .json({ message: "Signup successfull", type: "success" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  const { identifier, password } = req.body;
  try {
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });
    if (!user)
      return res.json({ message: "Invalid credentials", type: "error" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.json({ message: "Invalid Password", type: "error" });

    const token = generateToken(user._id);

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      })
      .json({ message: "Login successfull", type: "success" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token").json({ message: "Logged out successfully" });
};

//Load Login status on intial loading...
exports.getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const initial = req.user.username?.charAt(0).toUpperCase() || "";
    const info = {
      username: req.user.username,
      email: req.user.email
    };
    res.json({ initial , info});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send OTP for password reset
exports.sendResetOtp = async (req, res) => {
  // const { email } = req.body;
  const email = req.user.email;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // const expiration = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP to DB, remove existing OTPs for user
    await ResetOtp.deleteMany({ userId: user._id });
    await ResetOtp.create({ userId: user._id, otp, createdAt: new Date() });

    // Send OTP via email
    await sendOtpEmail(user.email, otp);

    res.json({ message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ message: "OTP sending error" });
  }
};

// Verify OTP
exports.verifyResetOtp = async (req, res) => {
  const { otp } = req.body;
  const email = req.user.email;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const record = await ResetOtp.findOne({ userId: user._id});
    if (!record) {
      return res.status(400).json({ message: "Invalid OTP or has been expired" });
    }
    // await ResetOtp.deleteMany({ userId: user._id });

    res.json({ message: "OTP verified" });
  } catch (error) {
    res.status(500).json({ message: "OTP verifying error" });
  }
};

// Reset password after OTP verification
exports.resetPassword = async (req, res) => {
  const { newPassword , confirmPassword } = req.body;
    const email = req.user.email;
  try {
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);

    user.password = hashed;
    await user.save();

    // Delete OTP after successful reset
    await ResetOtp.deleteMany({ userId: user._id });

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Password reset error" });
  }
};
