import {
  useContext,
  useMemo,
  useReducer,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Check,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  User,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthContext } from "../../context/AuthContext";
import api from "../../utils/api";

const initialState = {
  identifier: "",
  password: "",
};

const initialTouchedState = {
  identifier: false,
  password: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "UPDATE_FIELD":
      return {
        ...state,
        [action.field]: action.value,
      };

    case "SET_FORM":
      return {
        ...state,
        ...action.payload,
      };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

const getFieldErrors = (formState) => {
  const identifier = formState.identifier.trim();
  const password = formState.password;

  const errors = {
    identifier: "",
    password: "",
  };

  if (!identifier) {
    errors.identifier = "Username or email is required.";
  }

  if (!password) {
    errors.password = "Password is required.";
  }

  return errors;
};

const getBackendErrorMessage = (error) => {
  const responseData = error?.response?.data;

  if (
    typeof responseData?.message === "string" &&
    responseData.message.trim()
  ) {
    return responseData.message;
  }

  if (
    typeof responseData?.error === "string" &&
    responseData.error.trim()
  ) {
    return responseData.error;
  }

  if (
    Array.isArray(responseData?.errors) &&
    responseData.errors.length > 0
  ) {
    const firstError = responseData.errors[0];

    if (typeof firstError === "string") {
      return firstError;
    }

    if (typeof firstError?.message === "string") {
      return firstError.message;
    }
  }

  if (error?.code === "ERR_NETWORK") {
    return "Unable to connect to the server. Check your connection and try again.";
  }

  if (error?.response?.status === 400) {
    return "Please check your login details and try again.";
  }

  if (error?.response?.status === 401) {
    return "Invalid username, email or password.";
  }

  if (error?.response?.status === 403) {
    return "Your account is not allowed to sign in.";
  }

  if (error?.response?.status === 404) {
    return "No account was found with those details.";
  }

  if (error?.response?.status === 429) {
    return "Too many login attempts. Please try again shortly.";
  }

  if (error?.response?.status >= 500) {
    return "The server encountered an error. Please try again.";
  }

  return "Login failed. Please check your details and try again.";
};

const LoginForm = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [touched, setTouched] = useState(initialTouchedState);
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { fetchUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const errors = useMemo(() => getFieldErrors(state), [state]);

  const shouldShowError = (field) => {
    return Boolean(errors[field] && (touched[field] || submitted));
  };

  const shouldShowValid = (field) => {
    return Boolean(
      !errors[field] &&
        state[field] &&
        (touched[field] || submitted)
    );
  };

  const getInputContainerClasses = (field) => {
    const baseClasses =
      "group relative flex items-center rounded-xl bg-[#111419]/80 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] transition-all duration-200";

    if (shouldShowError(field)) {
      return `${baseClasses} bg-red-500/[0.06] shadow-[inset_0_0_0_1px_rgba(248,113,113,0.75),0_0_0_3px_rgba(248,113,113,0.07)]`;
    }

    if (shouldShowValid(field)) {
      return `${baseClasses} bg-emerald-500/[0.04] shadow-[inset_0_0_0_1px_rgba(52,211,153,0.55),0_0_0_3px_rgba(52,211,153,0.05)]`;
    }

    return `${baseClasses} hover:bg-[#15191F] focus-within:bg-[#15191F] focus-within:shadow-[inset_0_0_0_1px_rgba(255,145,0,0.8),0_0_0_3px_rgba(255,145,0,0.08)]`;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    let nextValue = value;

    if (name === "identifier") {
      nextValue = value.replace(/^\s+/, "");
    }

    dispatch({
      type: "UPDATE_FIELD",
      field: name,
      value: nextValue,
    });
  };

  const handleBlur = (event) => {
    const { name } = event.target;

    setTouched((previous) => ({
      ...previous,
      [name]: true,
    }));

    if (name === "identifier") {
      dispatch({
        type: "UPDATE_FIELD",
        field: "identifier",
        value: state.identifier.trim(),
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setSubmitted(true);

    setTouched({
      identifier: true,
      password: true,
    });

    const normalizedForm = {
      identifier: state.identifier.trim(),
      password: state.password,
    };

    const normalizedErrors = getFieldErrors(normalizedForm);
    const hasErrors = Object.values(normalizedErrors).some(Boolean);

    dispatch({
      type: "SET_FORM",
      payload: normalizedForm,
    });

    if (hasErrors) {
      toast.error("Please complete the highlighted fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post("/auth/login", normalizedForm);
      const responseData = response?.data || {};

      if (responseData.type && responseData.type !== "success") {
        toast.error(
          responseData.message || "Unable to log in to your account."
        );
        return;
      }

      toast.success(
        responseData.message || "You have logged in successfully."
      );

      try {
        await fetchUser?.();
      } catch (fetchError) {
        console.error("Unable to refresh authenticated user:", fetchError);
      }

      dispatch({ type: "RESET" });
      setTouched(initialTouchedState);
      setSubmitted(false);

      navigate("/");
    } catch (error) {
      toast.error(getBackendErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="relative w-full max-w-[900px] bg-[#181C22]">
        {/* Decorative background */}
        <div className="pointer-events-none absolute right-20 top-20 h-72 w-72 rounded-full bg-[#FF9100]/15 blur-[110px]" />

        {/* <div className="pointer-events-none absolute -bottom-32 -right-24 h-72 w-72 rounded-full bg-orange-700/10 blur-[110px]" /> */}

        {/* <div
          className="pointer-events-none absolute inset-0 opacity-25
          [background-image:linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)]
          [background-size:42px_42px]"
        /> */}

        <div className="relative z-10 flex min-h-[540px] max-h-[calc(100vh-110px)] max-md:max-h-none max-md:min-h-0">
          {/* Login form section */}
          <div className="flex w-full items-center justify-center p-6 md:w-[54%] md:p-8">
            <div className="w-full max-w-[410px]">
              {/* Mobile brand */}
              <div className="mb-6 md:hidden">
                <Link
                  to="/"
                  aria-label="Go to Master of Keys home page"
                  className="inline-flex items-center gap-3 font-bold text-white"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl b-[#FF9100] text-[#181C22] shado-[0_12px_30px_rgba(255,145,0,0.2)]">
                    {/* <LockKeyhole size={20} strokeWidth={2.4} /> */}
                    <img
                      className="h-[30px]"
                      src="/keyboard-shortcut.1024x1020.png"
                      alt="logo"
                    />
                  </span>

                  <span style={{ fontFamily: "Chelsea Market, system-ui" }}>
                    Master of Keys
                  </span>
                </Link>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#FF9100]">
                  Welcome back
                </p>

                <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white">
                  Log in to continue
                </h2>

                <p className="mt-2 max-w-sm font-sans text-xs leading-5 text-zinc-500">
                  Enter your username or email and password to access your
                  account.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                noValidate
                className="md:mt-14 mt-8 space-y-5"
              >
                {/* Identifier */}
                <div>
                  <label
                    htmlFor="login-identifier"
                    className="mb-2 block font-sans text-sm font-semibold text-zinc-200"
                  >
                    Username or email
                  </label>

                  <div className={getInputContainerClasses("identifier")}>
                    <span className="pointer-events-none absolute left-4 text-zinc-600 transition-colors duration-200 group-focus-within:text-[#FF9100]">
                      {state.identifier.includes("@") ? (
                        <Mail size={18} />
                      ) : (
                        <User size={18} />
                      )}
                    </span>

                    <input
                      id="login-identifier"
                      type="text"
                      name="identifier"
                      value={state.identifier}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={isSubmitting}
                      autoComplete="username"
                      autoCapitalize="none"
                      spellCheck={false}
                      aria-invalid={shouldShowError("identifier")}
                      aria-describedby={
                        shouldShowError("identifier")
                          ? "login-identifier-error"
                          : undefined
                      }
                      className="w-full bg-transparent py-3 pl-12 pr-11 font-sans text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    {shouldShowValid("identifier") && (
                      <Check
                        size={17}
                        className="pointer-events-none absolute right-4 text-emerald-400"
                      />
                    )}
                  </div>

                  <div className="mt-1 min-h-4">
                    {shouldShowError("identifier") && (
                      <p
                        id="login-identifier-error"
                        role="alert"
                        className="font-sans text-[11px] text-red-400"
                      >
                        {errors.identifier}
                      </p>
                    )}

                    {shouldShowValid("identifier") && (
                      <p className="flex items-center gap-1.5 font-sans text-[11px] text-emerald-400">
                        <Check size={12} />
                        Account identifier entered.
                      </p>
                    )}
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <label
                      htmlFor="login-password"
                      className="font-sans text-sm font-semibold text-zinc-200"
                    >
                      Password
                    </label>

                    <Link
                      to="/forgot-password"
                      className="font-sans text-[11px] font-semibold text-[#FF9100] transition-colors duration-200 hover:text-orange-300"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className={getInputContainerClasses("password")}>
                    <span className="pointer-events-none absolute left-4 text-zinc-600 transition-colors duration-200 group-focus-within:text-[#FF9100]">
                      <LockKeyhole size={18} />
                    </span>

                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={state.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={isSubmitting}
                      autoComplete="current-password"
                      aria-invalid={shouldShowError("password")}
                      aria-describedby={
                        shouldShowError("password")
                          ? "login-password-error"
                          : undefined
                      }
                      className="w-full bg-transparent py-3 pl-12 pr-12 font-sans text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((previous) => !previous)}
                      disabled={isSubmitting}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      aria-pressed={showPassword}
                      className="absolute right-3 grid h-9 w-9 place-items-center rounded-lg text-zinc-600 transition duration-200 hover:bg-white/[0.04] hover:text-[#FF9100] focus:outline-none focus:ring-2 focus:ring-[#FF9100]/25 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="mt-1 min-h-4">
                    {shouldShowError("password") && (
                      <p
                        id="login-password-error"
                        role="alert"
                        className="font-sans text-[11px] text-red-400"
                      >
                        {errors.password}
                      </p>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                  className="group relative flex min-h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-[#FF9100] px-6 font-sans text-sm font-bold text-[#181C22] shadow-[0_18px_45px_rgba(255,145,0,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ffa52e] hover:shadow-[0_22px_50px_rgba(255,145,0,0.28)] focus:outline-none focus:ring-2 focus:ring-[#FF9100]/40 focus:ring-offset-2 focus:ring-offset-[#181C22] disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                  <span className="relative flex items-center gap-2">
                    {isSubmitting ? (
                      <>
                        <LoaderCircle size={18} className="animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      <>
                        Login
                        <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
                          →
                        </span>
                      </>
                    )}
                  </span>
                </button>
              </form>

              <div className="mt-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-white/[0.05]" />
                <span className="font-sans text-[10px] uppercase tracking-[0.12em] text-zinc-700">
                  New here?
                </span>
                <span className="h-px flex-1 bg-white/[0.05]" />
              </div>

              <p className="mt-4 text-center font-sans text-xs text-zinc-500">
                Don&apos;t have an account?{" "}
                <Link
                  to="/signup"
                  className="font-semibold text-[#FF9100] transition-colors duration-200 hover:text-orange-300 hover:underline hover:underline-offset-4"
                >
                  Create account
                </Link>
              </p>
            </div>
          </div>

          {/* Image section */}
          <div className="relative hidden w-[46%] overflow-hidden md:flex">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[url('/signup_image-removebg-preview.png')] bg-contain bg- bg-no-repeat"
            />

            {/* <div className="absolute inset-0 bg-gradient-to-t from-[#181C22] via-[#181C22]/10 to-transparent" /> */}

            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#181C22]/20" />

            <div className="relative z-10 mt-auto w-full p-8">
              <span className="mb-3 border border-[#FF9100]/30 inline-flex items-center gap-2 rounded-full bg-[#181C22]/75 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#FF9100] shadow-[0_10px_30px_rgba(0,0,0,0.2)] backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF9100] shadow-[0_0_10px_rgba(255,145,0,0.8)]" />
                Continue your journey
              </span>

              <h1 className="text-4xl font-black leading-tight tracking-[-0.04em] text-white">
                Welcome
                <span className="block text-[#FF9100]">Back!</span>
              </h1>

              <p className="mt-3 max-w-sm font-sans text-sm leading-6 text-zinc-300">
                Return to your practice sessions, multiplayer rooms and detailed
                typing insights.
              </p>

              {/* <div className="mt-5 inline-flex items-center gap-3 rounded-2xl bg-[#111419]/65 px-4 py-3 shadow-[0_15px_45px_rgba(0,0,0,0.25)] backdrop-blur-xl">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#FF9100]/10 text-[#FF9100]">
                  <LockKeyhole size={18} />
                </span>

                <div className="font-sans">
                  <strong className="block text-xs text-white">
                    Secure login
                  </strong>

                  <span className="text-[10px] text-zinc-500">
                    Your account details stay protected
                  </span>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        pauseOnHover
        theme="dark"
        toastStyle={{
          background: "#181C22",
          color: "#ffffff",
          border: "none",
          boxShadow: "0 18px 55px rgba(0,0,0,0.35)",
        }}
      />
    </>
  );
};

export default LoginForm;