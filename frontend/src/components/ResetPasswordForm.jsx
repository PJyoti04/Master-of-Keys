import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  MailCheck,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import api from "../utils/api";

const steps = [
  { id: 1, label: "Request OTP" },
  { id: 2, label: "Verify" },
  { id: 3, label: "New password" },
];

function ResetPasswordForm() {
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const prepare = () => {
    setLoading(true);
    setError("");
    setMessage("");
  };
  const handleError = (err, fallback) =>
    setError(err.response?.data?.message || fallback);

  const sendOtp = async () => {
    prepare();
    try {
      const response = await api.post("/auth/sendotp");
      setMessage(response.data.message || "OTP sent successfully.");
      setStep(2);
    } catch (err) {
      handleError(err, "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };
  const verifyOtp = async () => {
    if (!otp.trim()) return setError("Enter the OTP sent to your email.");
    prepare();
    try {
      const response = await api.post("/auth/verify", { otp: otp.trim() });
      setMessage(response.data.message || "OTP verified.");
      setStep(3);
    } catch (err) {
      handleError(err, "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };
  const resetPassword = async () => {
    if (newPassword.length < 8)
      return setError("Password must contain at least 8 characters.");
    if (newPassword !== confirmPassword)
      return setError("Passwords do not match.");
    prepare();
    try {
      await api.post("/auth/resetpass", { newPassword, confirmPassword });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      handleError(err, "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-[calc(100dvh-64px)] overflow-hidden bg-[#181C22] px-3 py-6 text-white sm:min-h-[calc(100vh-80px)] sm:px-6 sm:py-10">
      <div className="pointer-events-none absolute -left-28 top-12 h-80 w-80 rounded-full bg-orange-500/[0.08] blur-[110px]" />
      <div className="pointer-events-none absolute -right-28 bottom-10 h-80 w-80 rounded-full bg-violet-500/[0.05] blur-[110px]" />
      <div className="relative mx-auto max-w-xl">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mb-5 inline-flex items-center gap-2 text-xs font-medium text-zinc-500 transition hover:text-white"
        >
          <ArrowLeft size={15} />
          Back to dashboard
        </button>
        <section className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#20252D] shadow-[0_30px_100px_rgba(0,0,0,0.35)]">
          <div className="border-b border-white/[0.06] bg-gradient-to-br from-orange-500/[0.10] to-transparent p-5 sm:p-7">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
              <KeyRound size={22} />
            </div>
            <h1 className="mt-5 text-2xl font-black tracking-[-0.04em] sm:text-3xl">
              Secure your account
            </h1>
            <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
              Verify your identity with a one-time code before setting a new
              password.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-2">
              {steps.map((item) => {
                const complete = step > item.id;
                const active = step === item.id;
                return (
                  <div key={item.id}>
                    <div
                      className={`h-1.5 rounded-full ${complete || active ? "bg-orange-500" : "bg-white/[0.06]"}`}
                    />
                    <p
                      className={`mt-2 text-[9px] font-semibold uppercase tracking-[0.1em] ${active ? "text-orange-400" : complete ? "text-zinc-400" : "text-zinc-700"}`}
                    >
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="p-5 sm:p-7">
            {message && (
              <div className="mb-4 flex items-start gap-3 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.08] p-3 text-xs text-emerald-300">
                <Check size={16} className="shrink-0" />
                {message}
              </div>
            )}
            {error && (
              <div className="mb-4 rounded-xl border border-red-500/15 bg-red-500/[0.08] p-3 text-xs text-red-300">
                {error}
              </div>
            )}
            {step === 1 && (
              <>
                <div className="rounded-2xl border border-white/[0.05] bg-[#181C22] p-4">
                  <MailCheck size={21} className="text-orange-400" />
                  <h2 className="mt-3 font-semibold">Email verification</h2>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    We will send a one-time password to the email connected to
                    your account.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={loading}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/15 transition hover:bg-orange-600 disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw size={17} className="animate-spin" />
                  ) : (
                    <ShieldCheck size={17} />
                  )}
                  {loading ? "Sending OTP..." : "Send verification code"}
                </button>
              </>
            )}
            {step === 2 && (
              <>
                <label className="text-xs font-semibold text-zinc-300">
                  Verification code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={8}
                  value={otp}
                  onChange={(event) =>
                    setOtp(event.target.value.replace(/\D/g, ""))
                  }
                  placeholder="Enter the OTP"
                  className="mt-2 w-full rounded-xl border border-white/[0.08] bg-[#181C22] px-4 py-3.5 text-center text-lg font-bold tracking-[0.35em] text-white outline-none focus:border-orange-500/40 focus:ring-4 focus:ring-orange-500/[0.08]"
                />
                <button
                  type="button"
                  onClick={verifyOtp}
                  disabled={loading || !otp}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {loading && <RefreshCw size={17} className="animate-spin" />}
                  {loading ? "Verifying..." : "Verify code"}
                </button>
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={loading}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-[#181C22] px-4 py-3 text-xs font-semibold text-zinc-400"
                >
                  <RefreshCw size={14} />
                  Resend OTP
                </button>
              </>
            )}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-300">
                    New password
                  </label>
                  <div className="relative mt-2">
                    <LockKeyhole
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full rounded-xl border border-white/[0.08] bg-[#181C22] py-3.5 pl-11 pr-12 text-sm text-white outline-none focus:border-orange-500/40 focus:ring-4 focus:ring-orange-500/[0.08]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center text-zinc-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-300">
                    Confirm password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Enter the same password"
                    className="mt-2 w-full rounded-xl border border-white/[0.08] bg-[#181C22] px-4 py-3.5 text-sm text-white outline-none focus:border-orange-500/40 focus:ring-4 focus:ring-orange-500/[0.08]"
                  />
                </div>
                <button
                  type="button"
                  onClick={resetPassword}
                  disabled={loading || !newPassword || !confirmPassword}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {loading && <RefreshCw size={17} className="animate-spin" />}
                  {loading ? "Updating password..." : "Update password"}
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default ResetPasswordForm;
