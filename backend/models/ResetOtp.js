const mongoose = require('mongoose');

const resetOtpSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    unique: true, // ensures only one OTP per user
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // auto-delete after 5 minutes (300s)
  },
});

// Optional: add index manually (if needed)
// resetOtpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

module.exports = mongoose.model('ResetOtp', resetOtpSchema);
