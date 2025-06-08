import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ResetPasswordForm = () => {
  const [step, setStep] = useState(1); // 1: send OTP, 2: verify OTP, 3: reset password
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const nav = useNavigate();

  const handleError = (err, fallback = "Something went wrong") => {
    setError(err.response?.data?.message || fallback);
  };

  const sendOtp = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await axios.post("http://localhost:5000/api/auth/sendotp");
      setMessage(res.data.message);
      setStep(2);
    } catch (err) {
      handleError(err, "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await axios.post("http://localhost:5000/api/auth/verify", { otp });
      setMessage(res.data.message);
      setStep(3);
    } catch (err) {
      handleError(err, "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await axios.post("http://localhost:5000/api/auth/resetpass", {
        newPassword,
        confirmPassword
      });
      setMessage(res.data.message || "Password reset successful");
      // Optionally reset fields or redirect
      setStep(1);
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      nav('/');
    } catch (err) {
      handleError(err, "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[85vh] bg-[#181C22] flex items-center pb-14 font-mono">
      <div className="w-[500px] mx-auto p-[35px_25px_50px] bg-[#1f242a] rounded-lg shadow-lg text-white">
        <h2 className="text-xl text-center font-bold mb-10">Change Password</h2>

        {message && <p className="mb-4 text-green-500">{message}</p>}
        {error && <p className="mb-4 text-red-500">{error}</p>}

        {step === 1 && (
          <>
            <p className="mb-4 text-gray-400 text-sm">
              An OTP will be sent to your registered email for verification.
            </p>
            <button
              onClick={sendOtp}
              disabled={loading}
              className={`w-full p-2 rounded ${
                loading ? "bg-orange-300 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <label className="block mb-2">Enter OTP:</label>
            <input
              type="text"
              className="w-full p-2 mb-4 rounded bg-[#080a0c] text-white"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button
              onClick={verifyOtp}
              disabled={loading || !otp}
              className={`w-full mb-2 p-2 rounded ${
                loading || !otp ? "bg-orange-300 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button
              onClick={sendOtp}
              disabled={loading}
              className="w-full p-2 rounded bg-gray-600 hover:bg-gray-700"
            >
              Resend OTP
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <label className="block mb-2">New Password:</label>
            <input
              type="password"
              className="w-full p-2 mb-4 rounded bg-[#080a0c] text-white"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <label className="block mb-2">Confirm New Password:</label>
            <input
              type="password"
              className="w-full p-2 mb-4 rounded bg-[#080a0c] text-white"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              onClick={resetPassword}
              disabled={loading || !newPassword || !confirmPassword}
              className={`w-full p-2 rounded ${
                loading || !newPassword || !confirmPassword
                  ? "bg-orange-300 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordForm;
