import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Mail,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";
import api from "../../utils/api";
import { API_PATHS } from "../../utils/Apipaths";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const STEPS = [
  { id: 1, label: "Request OTP" },
  { id: 2, label: "Verify" },
  { id: 3, label: "New password" },
];

function ForgotPassword({
  isOpen = true,
  onClose,
  initialEmail = "",
  onOtpSent,
  isModal = true,
  allowReset = true,
}) {
  const [step, setStep] = useState(1); // 1: Email, 2: Verify OTP, 3: New Password, 4: Success
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Sync initial email when modal opens
  useEffect(() => {
    if (isOpen) {
      setEmail(initialEmail || "");
      setStep(1);
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setError("");
      setSuccessMessage("");
      setEmailTouched(false);
    }
  }, [isOpen, initialEmail]);

  // Handle countdown for resend OTP timer
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  // Handle escape key to close modal
  useEffect(() => {
    if (!isModal || !isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !loading && !resendLoading) {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModal, isOpen, loading, resendLoading, onClose]);

  if (isModal && !isOpen) {
    return null;
  }

  const isEmailValid = EMAIL_REGEX.test(email.trim());

  const getEmailContainerClasses = () => {
    const base =
      "group relative flex items-center rounded-xl bg-[#111419]/80 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] transition-all duration-200";

    if (emailTouched && !isEmailValid) {
      return `${base} bg-red-500/[0.06] shadow-[inset_0_0_0_1px_rgba(248,113,113,0.75),0_0_0_3px_rgba(248,113,113,0.07)]`;
    }

    if (emailTouched && isEmailValid) {
      return `${base} bg-emerald-500/[0.04] shadow-[inset_0_0_0_1px_rgba(52,211,153,0.55),0_0_0_3px_rgba(52,211,153,0.05)]`;
    }

    return `${base} hover:bg-[#15191F] focus-within:bg-[#15191F] focus-within:shadow-[inset_0_0_0_1px_rgba(255,145,0,0.8),0_0_0_3px_rgba(255,145,0,0.08)]`;
  };

  // Step 1: Send OTP to registered email
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError("");
    setSuccessMessage("");
    setEmailTouched(true);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your registered email address.");
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(
        API_PATHS.FORGOT_PASSWORD || "/auth/forgot-password",
        { email: trimmedEmail }
      );

      const message =
        response.data?.message || "OTP sent successfully to your email.";
      setSuccessMessage(message);
      setResendTimer(60);

      onOtpSent?.(trimmedEmail);

      if (allowReset) {
        setStep(2);
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to send OTP. Please check the email and try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0 || resendLoading) return;
    setError("");
    setSuccessMessage("");
    setResendLoading(true);

    try {
      const response = await api.post(
        API_PATHS.FORGOT_PASSWORD || "/auth/forgot-password",
        { email: email.trim() }
      );

      setSuccessMessage(
        response.data?.message || "A new OTP has been sent to your email."
      );
      setResendTimer(60);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to resend OTP. Please try again later."
      );
    } finally {
      setResendLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!otp.trim()) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(
        API_PATHS.VERIFY_RESET_OTP || "/auth/verify-reset-otp",
        {
          email: email.trim(),
          otp: otp.trim(),
        }
      );

      setSuccessMessage(response.data?.message || "OTP verified successfully!");
      setStep(3);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid OTP or code has expired. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Set New Password
  const handleResetPassword = async (e) => {
    e?.preventDefault();
    setError("");
    setSuccessMessage("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(
        API_PATHS.RESET_PASSWORD || "/auth/reset-password",
        {
          email: email.trim(),
          otp: otp.trim(),
          newPassword,
          confirmPassword,
        }
      );

      setSuccessMessage(response.data?.message || "Password reset successful!");
      setStep(4);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div
      role="dialog"
      aria-modal={isModal}
      aria-labelledby="forgot-password-title"
      className="relative w-full max-w-[460px] overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#20252D] text-white shadow-[0_30px_100px_rgba(0,0,0,0.5)]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Decorative ambient gradients */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#FF9100]/15 blur-[90px]" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-orange-700/10 blur-[90px]" />

      {/* Header section */}
      <div className="relative border-b border-white/[0.06] bg-gradient-to-br from-[#FF9100]/[0.10] to-transparent p-6 sm:p-7">
        {/* Close button if modal */}
        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            disabled={loading || resendLoading}
            aria-label="Close dialog"
            className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-xl border border-white/5 bg-[#181C22]/80 text-zinc-400 transition-colors hover:border-[#FF9100]/30 hover:bg-[#181C22] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#FF9100]/30 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        )}

        <div className="flex items-center gap-3.5">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#FF9100] text-[#181C22] shadow-[0_10px_25px_rgba(255,145,0,0.25)]">
            <KeyRound size={22} strokeWidth={2.4} />
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[#FF9100]">
              Account Recovery
            </span>
            <h2
              id="forgot-password-title"
              className="text-2xl font-black tracking-[-0.04em] text-white"
            >
              {step === 4
                ? "Password Updated"
                : step === 3
                ? "Set New Password"
                : step === 2
                ? "Verify OTP"
                : "Forgot Password"}
            </h2>
          </div>
        </div>

        <p className="mt-3 font-sans text-xs leading-5 text-zinc-400">
          {step === 4
            ? "Your account credentials have been updated successfully."
            : step === 3
            ? "Create and confirm a secure new password for your account."
            : step === 2
            ? `Enter the 6-digit verification code sent to ${email}.`
            : "Enter your registered email address and we'll send you an OTP to reset your password."}
        </p>

        {/* 3-Step progress indicator matching ResetPasswordForm */}
        {allowReset && step <= 3 && (
          <div className="mt-5 grid grid-cols-3 gap-2">
            {STEPS.map((item) => {
              const complete = step > item.id;
              const active = step === item.id;
              return (
                <div key={item.id}>
                  <div
                    className={`h-1.5 rounded-full transition-colors ${
                      complete || active ? "bg-[#FF9100]" : "bg-white/[0.08]"
                    }`}
                  />
                  <p
                    className={`mt-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] ${
                      active
                        ? "text-[#FF9100]"
                        : complete
                        ? "text-zinc-400"
                        : "text-zinc-600"
                    }`}
                  >
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Body section */}
      <div className="relative p-6 sm:p-7">
        {/* Feedback banners */}
        {error && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/[0.08] p-3.5 text-xs text-red-300"
          >
            <span className="font-semibold text-red-400">Error:</span>
            <span className="flex-1">{error}</span>
          </div>
        )}

        {successMessage && step !== 4 && (
          <div
            role="status"
            className="mb-4 flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.08] p-3.5 text-xs text-emerald-300"
          >
            <Check size={16} className="mt-0.5 shrink-0 text-emerald-400" />
            <span className="flex-1">{successMessage}</span>
          </div>
        )}

        {/* STEP 1: Email Form (Request OTP) */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} noValidate className="space-y-5">
            <div>
              <label
                htmlFor="forgot-email-input"
                className="mb-2 block font-sans text-xs font-semibold text-zinc-200"
              >
                Registered Email Address
              </label>

              <div className={getEmailContainerClasses()}>
                <span className="pointer-events-none absolute left-4 text-zinc-500 transition-colors group-focus-within:text-[#FF9100]">
                  <Mail size={18} />
                </span>

                <input
                  id="forgot-email-input"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  onBlur={() => setEmailTouched(true)}
                  disabled={loading}
                  placeholder="name@example.com"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  className="w-full bg-transparent py-3.5 pl-12 pr-11 font-sans text-sm text-white placeholder:text-zinc-600 outline-none disabled:cursor-not-allowed disabled:opacity-60"
                />

                {emailTouched && isEmailValid && (
                  <Check
                    size={17}
                    className="pointer-events-none absolute right-4 text-emerald-400"
                  />
                )}
              </div>

              <div className="mt-1.5 min-h-4">
                {emailTouched && !isEmailValid && (
                  <p className="font-sans text-[11px] text-red-400">
                    {!email.trim()
                      ? "Email address is required."
                      : "Enter a valid email address."}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="group relative flex min-h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-[#FF9100] px-6 font-sans text-sm font-bold text-[#181C22] shadow-[0_18px_45px_rgba(255,145,0,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ffa52e] hover:shadow-[0_22px_50px_rgba(255,145,0,0.28)] focus:outline-none focus:ring-2 focus:ring-[#FF9100]/40 focus:ring-offset-2 focus:ring-offset-[#181C22] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

              <span className="relative flex items-center gap-2">
                {loading ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Send OTP
                    <ArrowRight
                      size={16}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </>
                )}
              </span>
            </button>
          </form>
        )}

        {/* STEP 2: Verify OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} noValidate className="space-y-4">
            {/* Email info banner + change email button */}
            <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#181C22] px-3.5 py-2.5">
              <div className="flex items-center gap-2 truncate text-xs text-zinc-300">
                <Mail size={14} className="text-[#FF9100] shrink-0" />
                <span className="truncate">{email}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError("");
                  setSuccessMessage("");
                }}
                disabled={loading || resendLoading}
                className="shrink-0 text-[11px] font-semibold text-[#FF9100] hover:text-orange-300 transition-colors"
              >
                Change
              </button>
            </div>

            {/* OTP Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="forgot-otp-input"
                  className="font-sans text-xs font-semibold text-zinc-200"
                >
                  Verification Code
                </label>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0 || resendLoading || loading}
                  className="flex items-center gap-1 font-sans text-[11px] font-semibold text-[#FF9100] hover:text-orange-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw
                    size={11}
                    className={resendLoading ? "animate-spin" : ""}
                  />
                  {resendLoading
                    ? "Sending..."
                    : resendTimer > 0
                    ? `Resend in ${resendTimer}s`
                    : "Resend OTP"}
                </button>
              </div>

              <input
                id="forgot-otp-input"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ""));
                  if (error) setError("");
                }}
                disabled={loading}
                placeholder="• • • • • •"
                className="w-full rounded-xl border border-white/[0.08] bg-[#111419]/80 py-3 text-center font-sans text-xl font-bold tracking-[0.4em] text-white placeholder:text-zinc-600 outline-none transition-all focus:border-[#FF9100]/60 focus:ring-4 focus:ring-[#FF9100]/10 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !otp.trim() || otp.trim().length < 6}
              className="group relative flex min-h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-[#FF9100] px-6 font-sans text-sm font-bold text-[#181C22] shadow-[0_18px_45px_rgba(255,145,0,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ffa52e] hover:shadow-[0_22px_50px_rgba(255,145,0,0.28)] focus:outline-none focus:ring-2 focus:ring-[#FF9100]/40 focus:ring-offset-2 focus:ring-offset-[#181C22] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative flex items-center gap-2">
                {loading ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Verify Code
                  </>
                )}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setError("");
              }}
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={14} />
              Back to email
            </button>
          </form>
        )}

        {/* STEP 3: New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} noValidate className="space-y-4">
            {/* New Password */}
            <div>
              <label
                htmlFor="forgot-new-password"
                className="mb-1.5 block font-sans text-xs font-semibold text-zinc-200"
              >
                New Password
              </label>
              <div className="group relative flex items-center rounded-xl bg-[#111419]/80 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] transition-all duration-200 focus-within:shadow-[inset_0_0_0_1px_rgba(255,145,0,0.8),0_0_0_3px_rgba(255,145,0,0.08)]">
                <span className="pointer-events-none absolute left-4 text-zinc-500 transition-colors group-focus-within:text-[#FF9100]">
                  <LockKeyhole size={17} />
                </span>
                <input
                  id="forgot-new-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                  className="w-full bg-transparent py-3 pl-11 pr-11 font-sans text-sm text-white placeholder:text-zinc-600 outline-none disabled:cursor-not-allowed disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                  className="absolute right-3 grid h-8 w-8 place-items-center rounded-lg text-zinc-500 transition hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="forgot-confirm-password"
                className="mb-1.5 block font-sans text-xs font-semibold text-zinc-200"
              >
                Confirm New Password
              </label>
              <div className="group relative flex items-center rounded-xl bg-[#111419]/80 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] transition-all duration-200 focus-within:shadow-[inset_0_0_0_1px_rgba(255,145,0,0.8),0_0_0_3px_rgba(255,145,0,0.08)]">
                <span className="pointer-events-none absolute left-4 text-zinc-500 transition-colors group-focus-within:text-[#FF9100]">
                  <LockKeyhole size={17} />
                </span>
                <input
                  id="forgot-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  placeholder="Repeat new password"
                  autoComplete="new-password"
                  className="w-full bg-transparent py-3 pl-11 pr-11 font-sans text-sm text-white placeholder:text-zinc-600 outline-none disabled:cursor-not-allowed disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  tabIndex={-1}
                  className="absolute right-3 grid h-8 w-8 place-items-center rounded-lg text-zinc-500 transition hover:text-white"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={
                  loading ||
                  !newPassword ||
                  !confirmPassword ||
                  newPassword !== confirmPassword
                }
                className="group relative flex min-h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-[#FF9100] px-6 font-sans text-sm font-bold text-[#181C22] shadow-[0_18px_45px_rgba(255,145,0,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ffa52e] hover:shadow-[0_22px_50px_rgba(255,145,0,0.28)] focus:outline-none focus:ring-2 focus:ring-[#FF9100]/40 focus:ring-offset-2 focus:ring-offset-[#181C22] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative flex items-center gap-2">
                  {loading ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Update Password
                    </>
                  )}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(2);
                  setError("");
                }}
                disabled={loading}
                className="mt-3 flex w-full items-center justify-center gap-2 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={14} />
                Back to code
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: Success Confirmation */}
        {step === 4 && (
          <div className="py-2 text-center">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.15)]">
              <Check size={32} strokeWidth={2.5} />
            </div>

            <h3 className="text-lg font-bold text-white">
              Password Reset Complete!
            </h3>
            <p className="mt-2 text-xs leading-5 text-zinc-400">
              Your password has been changed successfully. You can now use your
              new password to log into your account.
            </p>

            <button
              type="button"
              onClick={() => {
                if (onClose) {
                  onClose();
                }
              }}
              className="mt-6 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#FF9100] px-5 font-sans text-sm font-bold text-[#181C22] shadow-[0_15px_35px_rgba(255,145,0,0.2)] transition-all hover:bg-[#ffa52e]"
            >
              Back to Login
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // If used as a modal, wrap in fixed backdrop
  if (isModal) {
    return (
      <div
        className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
        onClick={() => !loading && !resendLoading && onClose?.()}
      >
        {content}
      </div>
    );
  }

  // Standalone mode (non-modal)
  return content;
}

export default ForgotPassword;
