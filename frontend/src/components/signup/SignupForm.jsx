// ```jsx
import {
  useContext,
  useEffect,
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
  X,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthContext } from "../../context/AuthContext";
import api from "../../utils/api";

const initialState = {
  username: "",
  email: "",
  password: "",
};

const initialTouchedState = {
  username: false,
  email: false,
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

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getPasswordRequirements = (password) => ({
  minimumLength: password.length >= 6,
  hasLetter: /[a-zA-Z]/.test(password),
  hasNumber: /\d/.test(password),
  hasSpecialCharacter: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  hasNoSpaces: !/\s/.test(password),
});

const getFieldErrors = (formState) => {
  const username = formState.username.trim();
  const email = formState.email.trim();
  const password = formState.password;

  const errors = {
    username: "",
    email: "",
    password: "",
  };

  if (!username) {
    errors.username = "Username is required.";
  } else if (username.length < 3) {
    errors.username = "Username must contain at least 3 characters.";
  } else if (username.length > 30) {
    errors.username = "Username cannot exceed 30 characters.";
  } else if (/\s/.test(username)) {
    errors.username = "Username cannot contain spaces.";
  }

  if (!email) {
    errors.email = "Email address is required.";
  } else if (!emailRegex.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  const passwordRequirements = getPasswordRequirements(password);

  if (!password) {
    errors.password = "Password is required.";
  } else if (!passwordRequirements.minimumLength) {
    errors.password = "Password must contain at least 6 characters.";
  } else if (!passwordRequirements.hasLetter) {
    errors.password = "Password must contain at least one letter.";
  } else if (!passwordRequirements.hasNumber) {
    errors.password = "Password must contain at least one number.";
  } else if (!passwordRequirements.hasSpecialCharacter) {
    errors.password = "Password must contain a special character.";
  } else if (!passwordRequirements.hasNoSpaces) {
    errors.password = "Password cannot contain spaces.";
  }

  return errors;
};

const getBackendErrorMessage = (error) => {
  const responseData = error?.response?.data;

  if (typeof responseData?.message === "string" && responseData.message.trim()) {
    return responseData.message;
  }

  if (typeof responseData?.error === "string" && responseData.error.trim()) {
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

  if (error?.response?.status === 409) {
    return "An account with these details already exists.";
  }

  if (error?.response?.status === 429) {
    return "Too many signup attempts. Please try again shortly.";
  }

  if (error?.response?.status >= 500) {
    return "The server encountered an error. Please try again.";
  }

  return "Signup failed. Please check your details and try again.";
};

const RequirementItem = ({ isValid, children }) => {
  return (
    <li
      className={`flex items-center gap-2 text-[11px] transition-colors duration-200 ${
        isValid ? "text-emerald-400" : "text-zinc-500"
      }`}
    >
      <span
        className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border transition-colors duration-200 ${
          isValid
            ? "border-emerald-400/50 bg-emerald-400/10"
            : "border-zinc-700 bg-zinc-900/40"
        }`}
      >
        {isValid ? <Check size={10} /> : <X size={9} />}
      </span>

      <span>{children}</span>
    </li>
  );
};

const SignupForm = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [touched, setTouched] = useState(initialTouchedState);
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { fetchUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const errors = useMemo(() => getFieldErrors(state), [state]);

  const passwordRequirements = useMemo(
    () => getPasswordRequirements(state.password),
    [state.password]
  );

  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

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

  const getInputClasses = (field) => {
    const baseClasses =
      "w-full rounded-xl border bg-[#111419]/80 px-4 py-3 text-sm text-white outline-none transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60";

    if (shouldShowError(field)) {
      return `${baseClasses} border-red-500/80 ring-2 ring-red-500/10 focus:border-red-400 focus:ring-red-500/20`;
    }

    if (shouldShowValid(field)) {
      return `${baseClasses} border-emerald-500/70 ring-2 ring-emerald-500/10 focus:border-emerald-400 focus:ring-emerald-500/20`;
    }

    return `${baseClasses} border-white/10 hover:border-white/20 focus:border-[#FF9100] focus:ring-2 focus:ring-[#FF9100]/15`;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    let nextValue = value;

    if (name === "username") {
      nextValue = value.replace(/^\s+/, "");
    }

    if (name === "email") {
      nextValue = value.replace(/\s/g, "");
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

    if (name === "username") {
      dispatch({
        type: "UPDATE_FIELD",
        field: "username",
        value: state.username.trim(),
      });
    }

    if (name === "email") {
      dispatch({
        type: "UPDATE_FIELD",
        field: "email",
        value: state.email.trim(),
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
      username: true,
      email: true,
      password: true,
    });

    const normalizedForm = {
      username: state.username.trim(),
      email: state.email.trim().toLowerCase(),
      password: state.password,
    };

    const normalizedErrors = getFieldErrors(normalizedForm);
    const hasErrors = Object.values(normalizedErrors).some(Boolean);

    dispatch({
      type: "SET_FORM",
      payload: normalizedForm,
    });

    if (hasErrors) {
      toast.error("Please correct the highlighted fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post("/auth/register", normalizedForm);
      const responseData = response?.data || {};

      if (responseData.type && responseData.type !== "success") {
        toast.error(
          responseData.message || "Unable to create your account."
        );
        return;
      }

      toast.success(
        responseData.message || "Your account was created successfully."
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
      <div className="relative w-full max-w-[900px] overflow-hidden rounded-3xl border-white/10 bg-[#181C22] shado-[0_30px_100px_rgba(0,0,0,0.45)]">
        {/* Background decoration */}
        <div className="pointer-events-none absolute left-32 top-28 h-72 w-72 rounded-full bg-[#FF9100]/15 blur-[100px]" />

        {/* <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-orange-700/10 blur-[110px]" /> */}

        {/* <div
          className="pointer-events-none absolute inset-0 opacity-30
          [background-image:linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)]
          [background-size:42px_42px]"
        /> */}

        <div className="relative z-10 flex min-h-[560px] max-h-[calc(100vh-110px)] max-md:max-h-none max-md:min-h-0">
          {/* Image section */}
          <div className="relative hidden w-[46%] overflow-hidden border- border-white/10 md:flex">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[url('/signup_image-removebg-preview.png')] bg-contain bg- bg-no-repeat"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#181C22] via-[#181C22]/20 to-transparent" />

            <div className="relative z-10 mt-auto w-full p-8">
              <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#FF9100]/30 bg-[#181C22]/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#FF9100] backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF9100] shadow-[0_0_10px_rgba(255,145,0,0.8)]" />
                Start your journey
              </span>

              <h1 className="text-4xl font-black leading-tight tracking-[-0.04em] text-white">
                Welcome to
                <span style={{ fontFamily: "Chelsea Market, system-ui" }} className="block text-[#FF9100]">Master of Keys</span>
              </h1>

              <p className="mt-3 max-w-sm font-mono text-sm leading-6 text-zinc-300">
                Practice, compete and improve your typing performance.
              </p>
            </div>
          </div>

          {/* Form section */}
          <div className="flex w-full font-mono items-center justify-center overflow-y- p-6 py-4 md:w-[54%] md:p-8">
            <div className="w-full max-w-[420px]">
              {/* Mobile heading */}
              <div className="mb-5 md:hidden">
                <Link
                  to="/"
                  className="inline-flex items-center gap-3 font-bold text-white"
                  aria-label="Go to Master of Keys home page"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#FF9100] font-sans font-black text-[#181C22]">
                    M
                  </span>

                  <span style={{ fontFamily: "Chelsea Market, system-ui" }}>Master of Keys</span>
                </Link>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#FF9100]">
                  Create account
                </p>

                <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white">
                  Join Master of Keys
                </h2>

                <p className="mt-2 font-sans text-xs leading-5 text-zinc-500">
                  Enter your details to start improving your typing.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                noValidate
                className="mt-5 space-y-3"
              >
                {/* Username */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <label
                      htmlFor="signup-username"
                      className="font-sans text-sm font-semibold text-zinc-200"
                    >
                      Username
                    </label>

                    <span className="font-sans text-[10px] text-zinc-600">
                      {state.username.trim().length}/30
                    </span>
                  </div>

                  <input
                    id="signup-username"
                    type="text"
                    name="username"
                    value={state.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isSubmitting}
                    maxLength={30}
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    aria-invalid={shouldShowError("username")}
                    aria-describedby={
                      shouldShowError("username")
                        ? "signup-username-error"
                        : undefined
                    }
                    className={getInputClasses("username")}
                  />

                  <div className="mt-1 min-h-4">
                    {shouldShowError("username") && (
                      <p
                        id="signup-username-error"
                        role="alert"
                        className="font-sans text-[11px] text-red-400"
                      >
                        {errors.username}
                      </p>
                    )}

                    {shouldShowValid("username") && (
                      <p className="flex items-center gap-1.5 font-sans text-[11px] text-emerald-400">
                        <Check size={12} />
                        Username looks good.
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="signup-email"
                    className="mb-1.5 block font-sans text-sm font-semibold text-zinc-200"
                  >
                    Email address
                  </label>

                  <input
                    id="signup-email"
                    type="email"
                    name="email"
                    value={state.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isSubmitting}
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    inputMode="email"
                    aria-invalid={shouldShowError("email")}
                    aria-describedby={
                      shouldShowError("email")
                        ? "signup-email-error"
                        : undefined
                    }
                    className={getInputClasses("email")}
                  />

                  <div className="mt-1 min-h-4">
                    {shouldShowError("email") && (
                      <p
                        id="signup-email-error"
                        role="alert"
                        className="font-sans text-[11px] text-red-400"
                      >
                        {errors.email}
                      </p>
                    )}

                    {shouldShowValid("email") && (
                      <p className="flex items-center gap-1.5 font-sans text-[11px] text-emerald-400">
                        <Check size={12} />
                        Email address is valid.
                      </p>
                    )}
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="signup-password"
                    className="mb-1.5 block font-sans text-sm font-semibold text-zinc-200"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={state.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={isSubmitting}
                      autoComplete="new-password"
                      aria-invalid={shouldShowError("password")}
                      aria-describedby="signup-password-requirements signup-password-error"
                      className={`${getInputClasses("password")} pr-12`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((previous) => !previous)
                      }
                      disabled={isSubmitting}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      aria-pressed={showPassword}
                      className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-zinc-500 transition duration-200 hover:bg-white/5 hover:text-[#FF9100] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  <div className="mt-1 min-h-4">
                    {shouldShowError("password") && (
                      <p
                        id="signup-password-error"
                        role="alert"
                        className="font-sans text-[11px] text-red-400"
                      >
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div
                    id="signup-password-requirements"
                    className="mt-2 rounded-xl border border-white/[0.08] bg-[#111419]/60 px-3 py-2.5"
                  >
                    <p className="mb-2 font-sans text-[11px] font-semibold text-zinc-300">
                      Password must include:
                    </p>

                    <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 max-[420px]:grid-cols-1">
                      <RequirementItem
                        isValid={passwordRequirements.minimumLength}
                      >
                        6+ characters
                      </RequirementItem>

                      <RequirementItem
                        isValid={passwordRequirements.hasLetter}
                      >
                        One letter
                      </RequirementItem>

                      <RequirementItem
                        isValid={passwordRequirements.hasNumber}
                      >
                        One number
                      </RequirementItem>

                      <RequirementItem
                        isValid={
                          passwordRequirements.hasSpecialCharacter
                        }
                      >
                        Special character
                      </RequirementItem>
                    </ul>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                  className="group relative flex min-h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-[#FF9100] px-6 font-sans text-sm font-bold text-[#181C22] shadow-[0_18px_45px_rgba(255,145,0,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ffa52e] hover:shadow-[0_22px_50px_rgba(255,145,0,0.28)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                  <span className="relative flex items-center gap-2">
                    {isSubmitting ? (
                      <>
                        <LoaderCircle
                          size={18}
                          className="animate-spin"
                        />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create account
                        <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
                          →
                        </span>
                      </>
                    )}
                  </span>
                </button>
              </form>

              <p className="mt-4 text-center font-sans text-xs text-zinc-500">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-[#FF9100] transition-colors duration-200 hover:text-orange-300 hover:underline hover:underline-offset-4"
                >
                  Log in
                </Link>
              </p>
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
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      />
    </>
  );
};

export default SignupForm;
// ```
