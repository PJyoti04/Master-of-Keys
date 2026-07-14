import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import TypingTestKeyboard from "../components/KeyboardLayout/KBLayout";
import ResultModal from "../components/practice_page/ResultModal";
import { RiFocus3Fill } from "react-icons/ri";
import {
  IoGitBranchOutline,
  IoBuild,
  IoChevronDown,
  IoClose,
} from "react-icons/io5";
import Loader from "../components/ui/Loader";
import TextBoxTest from "../components/practice_page/TextBoxTest";
import TextBox from "../components/practice_page/TextBox";

const DEFAULT_TIME = 60;
const MAX_CUSTOM_TIME = 86400;
const PRESET_TIMES = [15, 30, 60, 120];

const Practice = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const getSavedPracticeTime = () => {
    const saved = Number(localStorage.getItem("practiceTime"));

    if (
      Number.isFinite(saved) &&
      saved > 0 &&
      saved <= MAX_CUSTOM_TIME
    ) {
      return saved;
    }

    return DEFAULT_TIME;
  };

  const savedPracticeTime = getSavedPracticeTime();

  const [loading, setLoading] = useState(false);
  const [selectedTime, setSelectedTime] = useState(savedPracticeTime);

  const [customTime, setCustomTime] = useState(() => {
    return PRESET_TIMES.includes(savedPracticeTime)
      ? null
      : savedPracticeTime;
  });

  const [timeLeft, setTimeLeft] = useState(savedPracticeTime);
  const [showCustomModal, setShowCustomModal] = useState(false);

  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [customTimeError, setCustomTimeError] = useState("");

  const [resultData, setResultData] = useState(null);
  const [resetKey, setResetKey] = useState(0);

  const [focus, setFocus] = useState(() => {
    try {
      const saved = localStorage.getItem("focus");
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  // Enable this when login protection is required.
  // useEffect(() => {
  //   if (!user) {
  //     navigate("/login");
  //   }
  // }, [user, navigate]);

  useEffect(() => {
    localStorage.setItem("focus", JSON.stringify(focus));
  }, [focus]);

  /*
   * The custom time must be used when present.
   * Previously TextBoxTest received selectedTime only,
   * which meant custom duration could be ignored.
   */
  const activeTime = customTime ?? selectedTime;

  const formatTimeDisplay = (totalSeconds) => {
    const safeSeconds = Math.max(0, Number(totalSeconds) || 0);

    const hrs = Math.floor(safeSeconds / 3600);
    const mins = Math.floor((safeSeconds % 3600) / 60);
    const secs = safeSeconds % 60;

    const pad = (value) => String(value).padStart(2, "0");

    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }

    return mins > 0 ? `${pad(mins)}:${pad(secs)}` : `${pad(secs)}`;
  };

  const formatDurationLabel = (totalSeconds) => {
    if (totalSeconds >= 3600) {
      const hrs = Math.floor(totalSeconds / 3600);
      const remainingMinutes = Math.floor(
        (totalSeconds % 3600) / 60
      );

      return remainingMinutes > 0
        ? `${hrs}h ${remainingMinutes}m`
        : `${hrs}h`;
    }

    if (totalSeconds >= 60) {
      const mins = Math.floor(totalSeconds / 60);
      const remainingSeconds = totalSeconds % 60;

      return remainingSeconds > 0
        ? `${mins}m ${remainingSeconds}s`
        : `${mins}m`;
    }

    return `${totalSeconds}s`;
  };

  const resetCurrentTest = (duration) => {
    setTimeLeft(duration);
    setResultData(null);
    setResetKey((previous) => previous + 1);
  };

  const handleTimeSelect = (secondsValue) => {
    const duration = Number(secondsValue);

    if (!PRESET_TIMES.includes(duration)) {
      return;
    }

    setSelectedTime(duration);
    setCustomTime(null);

    localStorage.setItem("practiceTime", String(duration));

    resetCurrentTest(duration);
  };

  const openCustomModal = () => {
    setCustomTimeError("");

    if (customTime) {
      const customHours = Math.floor(customTime / 3600);
      const customMinutes = Math.floor(
        (customTime % 3600) / 60
      );
      const customSeconds = customTime % 60;

      setHours(customHours ? String(customHours) : "");
      setMinutes(customMinutes ? String(customMinutes) : "");
      setSeconds(customSeconds ? String(customSeconds) : "");
    }

    setShowCustomModal(true);
  };

  const closeCustomModal = () => {
    setShowCustomModal(false);
    setCustomTimeError("");
  };

  const handleCustomInputChange = (setter, maximum) => (event) => {
    const rawValue = event.target.value;

    if (rawValue === "") {
      setter("");
      setCustomTimeError("");
      return;
    }

    const numericValue = Math.max(
      0,
      Math.min(Number(rawValue), maximum)
    );

    setter(String(numericValue));
    setCustomTimeError("");
  };

  const handleCustomTime = () => {
    const h = Number(hours) || 0;
    const m = Number(minutes) || 0;
    const s = Number(seconds) || 0;

    const totalSeconds = h * 3600 + m * 60 + s;

    if (totalSeconds <= 0) {
      setCustomTimeError(
        "Custom duration must be greater than 0."
      );
      return;
    }

    if (totalSeconds > MAX_CUSTOM_TIME) {
      setCustomTimeError(
        "Custom duration cannot exceed 24 hours."
      );
      return;
    }

    setCustomTime(totalSeconds);
    setSelectedTime(totalSeconds);

    localStorage.setItem(
      "practiceTime",
      String(totalSeconds)
    );

    resetCurrentTest(totalSeconds);

    setShowCustomModal(false);
    setCustomTimeError("");

    setHours("");
    setMinutes("");
    setSeconds("");
  };

  const resetTest = () => {
    const savedTime = getSavedPracticeTime();
    const isPresetTime = PRESET_TIMES.includes(savedTime);

    setSelectedTime(savedTime);
    setCustomTime(isPresetTime ? null : savedTime);
    setTimeLeft(savedTime);
    setResultData(null);
    setResetKey((previous) => previous + 1);
  };

  const handleFullscreen = () => {
    setFocus((previous) => !previous);
  };

  const mobileSelectValue = customTime
    ? "custom"
    : String(selectedTime);

  return (
    <div className="relative flex min-h-[calc(100vh-80px)] flex-col items-center overflow-x-hidden bg-[#181C22] text-white">
      {loading && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#181C22]">
          <Loader />
        </div>
      )}

      {!resultData && !loading && (
        <div className="flex w-full flex-1 flex-col items-center">
          {/* Timer toolbar */}
          <div className="flex w-full max-w-[1280px] items-center justify-between gap-3 px-4 pb-2 pt-5 sm:px-6 md:w-[80%] md:px-5 md:py-1 md:pt-6">
            {/* Remaining time */}
            <div
              className="shrink-0 text-xl font-semibold tabular-nums sm:text-2xl"
              aria-live="polite"
              aria-label={`${timeLeft} seconds remaining`}
            >
              {formatTimeDisplay(timeLeft)}
            </div>

            {/* Desktop/tablet timer buttons */}
            <div className="hidden items-center gap-3 rounded-xl bg-black/30 px-3 py-1 text-xs sm:flex">
              {PRESET_TIMES.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleTimeSelect(preset)}
                  className={`rounded-lg px-2 py-1 transition ${
                    !customTime && selectedTime === preset
                      ? "bg-orange-500/10 text-orange-500"
                      : "text-gray-400 hover:text-orange-500"
                  }`}
                >
                  {formatDurationLabel(preset)}
                </button>
              ))}

              <button
                type="button"
                onClick={openCustomModal}
                className={`flex items-center gap-1 rounded-lg px-2 py-1 transition ${
                  customTime
                    ? "bg-orange-500/10 text-orange-500"
                    : "text-gray-400 hover:text-orange-500"
                }`}
              >
                <IoBuild />

                <span>
                  {customTime ? formatDurationLabel(customTime) : "Custom"}
                </span>
              </button>
            </div>

            {/* Mobile timer select */}
            <div className="flex items-center gap-2 sm:hidden">
              <div className="relative">
                <select
                  value={mobileSelectValue}
                  onChange={(event) => {
                    const value = event.target.value;

                    if (value === "custom") {
                      openCustomModal();
                      return;
                    }

                    handleTimeSelect(Number(value));
                  }}
                  aria-label="Select typing test duration"
                  className="h-10 min-w-[112px] appearance-none rounded-xl bg-black/30 py-2 pl-3 pr-9 text-xs font-medium text-gray-300 outline-none transition focus:bg-black/40 focus:ring-2 focus:ring-orange-500/30"
                >
                  {PRESET_TIMES.map((preset) => (
                    <option
                      key={preset}
                      value={preset}
                      className="bg-[#181C22] text-white"
                    >
                      {formatDurationLabel(preset)}
                    </option>
                  ))}

                  <option value="custom" className="bg-[#181C22] text-white">
                    {customTime ? formatDurationLabel(customTime) : "Custom"}
                  </option>
                </select>

                <IoChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-orange-500"
                />
              </div>

              <button
                type="button"
                onClick={openCustomModal}
                aria-label="Set custom test duration"
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-black/30 transition ${
                  customTime
                    ? "text-orange-500"
                    : "text-gray-400 hover:text-orange-500"
                }`}
              >
                <IoBuild size={17} />
              </button>
            </div>
          </div>

          {/* Typing area */}
          <div className="w-full flex justify-center">
            <TextBoxTest
              key={resetKey}
              timeLeft={timeLeft}
              setTimeLeft={setTimeLeft}
              initialTime={activeTime}
              setLoading={setLoading}
              onSessionSaved={setResultData}
            />
            {/* <TextBox
              key={resetKey}
              timeLeft={timeLeft}
              setTimeLeft={setTimeLeft}
              initialTime={activeTime}
              setLoading={setLoading}
              onSessionSaved={setResultData}
            /> */}
          </div>

          {/* Desktop and tablet visual keyboard */}
          <div className="mt-2 hidden w-full sm:block">
            <TypingTestKeyboard isFullscreen={focus} />
          </div>

          {/*
           * On phones, the physical keyboard visualization is hidden.
           * TextBoxTest should focus its hidden input/textarea when tapped,
           * allowing the mobile virtual keyboard to open.
           */}
          <p className="mt-3 px-4 text-center font-sans text-xs text-gray-500 sm:hidden">
            Tap the typing area to open your keyboard.
          </p>

          {/* Bottom controls */}
          <div className="mt-auto flex w-full max-w-[1280px] items-center justify-between gap-5 px-4 pb-5 pt-4 text-xs sm:justify-end sm:gap-10 sm:px-8 sm:text-sm md:fixed md:bottom-5 md:right-0 md:px-10">
            <button
              type="button"
              onClick={handleFullscreen}
              className={`lg:flex items-center hidden gap-1 transition hover:text-orange-500 ${
                focus ? "text-orange-500" : "text-gray-500"
              }`}
            >
              <RiFocus3Fill size={15} />
              <span>focus mode</span>
            </button>

            <p className="flex cursor-pointer items-center gap-1 text-gray-500 transition hover:text-orange-500">
              <IoGitBranchOutline size={15} />
              <span>v2.0.0</span>
            </p>
          </div>
        </div>
      )}

      {resultData && (
        <ResultModal
          stats={resultData}
          graphData={resultData?.graphData ?? []}
          onRetry={resetTest}
        />
      )}

      {/* Custom duration modal */}
      {showCustomModal && (
        <div
          className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="custom-duration-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeCustomModal();
            }
          }}
        >
          <div className="w-full max-w-[360px] rounded-2xl border border-white/10 bg-[#181C22] p-5 shadow-2xl sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2
                id="custom-duration-title"
                className="text-lg font-semibold sm:text-xl"
              >
                Custom Duration
              </h2>

              <button
                type="button"
                onClick={closeCustomModal}
                aria-label="Close custom duration modal"
                className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-gray-400 transition hover:bg-white/10 hover:text-orange-500"
              >
                <IoClose size={20} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="min-w-0">
                <label
                  htmlFor="custom-hours"
                  className="mb-1.5 block text-[10px] uppercase tracking-wide text-gray-500"
                >
                  Hours
                </label>

                <input
                  id="custom-hours"
                  type="number"
                  min="0"
                  max="24"
                  inputMode="numeric"
                  value={hours}
                  onChange={handleCustomInputChange(setHours, 24)}
                  className="w-full min-w-0 rounded-xl bg-black/30 px-2 py-2.5 text-center text-sm outline-none transition placeholder:text-gray-600 focus:ring-2 focus:ring-orange-500/30 sm:px-3"
                />
              </div>

              <div className="min-w-0">
                <label
                  htmlFor="custom-minutes"
                  className="mb-1.5 block text-[10px] uppercase tracking-wide text-gray-500"
                >
                  Minutes
                </label>

                <input
                  id="custom-minutes"
                  type="number"
                  min="0"
                  max="59"
                  inputMode="numeric"
                  value={minutes}
                  onChange={handleCustomInputChange(setMinutes, 59)}
                  className="w-full min-w-0 rounded-xl bg-black/30 px-2 py-2.5 text-center text-sm outline-none transition placeholder:text-gray-600 focus:ring-2 focus:ring-orange-500/30 sm:px-3"
                />
              </div>

              <div className="min-w-0">
                <label
                  htmlFor="custom-seconds"
                  className="mb-1.5 block text-[10px] uppercase tracking-wide text-gray-500"
                >
                  Seconds
                </label>

                <input
                  id="custom-seconds"
                  type="number"
                  min="0"
                  max="59"
                  inputMode="numeric"
                  value={seconds}
                  onChange={handleCustomInputChange(setSeconds, 59)}
                  className="w-full min-w-0 rounded-xl bg-black/30 px-2 py-2.5 text-center text-sm outline-none transition placeholder:text-gray-600 focus:ring-2 focus:ring-orange-500/30 sm:px-3"
                />
              </div>
            </div>

            <div className="mt-4 min-h-8">
              {customTimeError ? (
                <p role="alert" className="text-xs text-red-400">
                  {customTimeError}
                </p>
              ) : (
                <p className="text-xs text-gray-400">
                  Maximum allowed duration is 24 hours.
                </p>
              )}
            </div>

            <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                onClick={closeCustomModal}
                className="w-full rounded-xl bg-white/10 px-4 py-2.5 text-sm transition hover:bg-white/15 sm:w-auto sm:py-2"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCustomTime}
                className="w-full rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 sm:w-auto sm:py-2"
              >
                Set Time
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Practice;