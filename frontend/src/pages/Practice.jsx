import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import TypingTestKeyboard from "../components/KeyboardLayout/KBLayout";
import TextBox from "../components/practice_page/TextBox";
import ResultModal from "../components/practice_page/ResultModal";
import { RiFocus3Fill } from "react-icons/ri";
import { IoGitBranchOutline, IoBuild } from "react-icons/io5";
import Loader from "../components/ui/Loader";

const DEFAULT_TIME = 60;
const MAX_CUSTOM_TIME = 86400;
const PRESET_TIMES = [15, 30, 60, 120];

const Practice = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const getSavedPracticeTime = () => {
    const saved = Number(localStorage.getItem("practiceTime"));
    return saved > 0 ? saved : DEFAULT_TIME;
  };

  const [loading, setLoading] = useState(false);
  const [selectedTime, setSelectedTime] = useState(getSavedPracticeTime);
  const [timeLeft, setTimeLeft] = useState(getSavedPracticeTime);
  const [customTime, setCustomTime] = useState(null);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [resultData, setResultData] = useState(null);
  const [resetKey, setResetKey] = useState(0);

  const [focus, setFocus] = useState(() => {
    const saved = localStorage.getItem("focus");
    return saved ? JSON.parse(saved) : false;
  });

  // useEffect(() => {
  //   if (!user) navigate("/login");
  // }, [user, navigate]);

  useEffect(() => {
    localStorage.setItem("focus", JSON.stringify(focus));
  }, [focus]);

  const activeTime = customTime ?? selectedTime;

  const formatTimeDisplay = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    const pad = (value) => String(value).padStart(2, "0");

    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    if (mins > 0) {
      return `${pad(mins)}:${pad(secs)}`;
    }

    return `${pad(secs)}`;
  };

  const formatDurationLabel = (totalSeconds) => {
    if (totalSeconds >= 3600) {
      return `${Math.floor(totalSeconds / 3600)}h`;
    }

    if (totalSeconds >= 60) {
      return `${Math.floor(totalSeconds / 60)}m`;
    }

    return `${totalSeconds}s`;
  };

  const handleTimeSelect = (secondsValue) => {
    setSelectedTime(secondsValue);
    setTimeLeft(secondsValue);
    setCustomTime(null);
    setResultData(null);

    localStorage.setItem("practiceTime", secondsValue);
    setResetKey((prev) => prev + 1);
  };

  const handleCustomTime = () => {
    const h = Number(hours) || 0;
    const m = Number(minutes) || 0;
    const s = Number(seconds) || 0;

    const totalSeconds = h * 3600 + m * 60 + s;

    if (totalSeconds <= 0) {
      alert("Custom duration must be greater than 0.");
      return;
    }

    if (totalSeconds > MAX_CUSTOM_TIME) {
      alert("Custom duration cannot exceed 24 hours.");
      return;
    }

    setCustomTime(totalSeconds);
    setTimeLeft(totalSeconds);
    setResultData(null);
    setShowCustomModal(false);
    setResetKey((prev) => prev + 1);

    setHours("");
    setMinutes("");
    setSeconds("");
  };

  const resetTest = () => {
    const savedTime = getSavedPracticeTime();

    setCustomTime(null);
    setSelectedTime(savedTime);
    setTimeLeft(savedTime);
    setResultData(null);
    setResetKey((prev) => prev + 1);
  };

  const handleFullscreen = () => {
    setFocus((prev) => !prev);
  };

  return (
    <div className="bg-[#181C22] text-white flex flex-col items-center min-h-[calc(100vh-80px)] relative">
      {loading && (
        <div className="fixed inset-0 z-[10000] bg-black/90 flex items-center justify-center">
          <Loader />
        </div>
      )}

      {!resultData && !loading && (
        <>
          <div className="flex w-[80%] justify-between px-5 py-1 pt-6">
            <div className="text-2xl font-semibold">
              {formatTimeDisplay(timeLeft)}
            </div>

            <div className="flex items-center gap-3 bg-black/30 px-3 py-1 rounded-xl text-xs">
              {PRESET_TIMES.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleTimeSelect(preset)}
                  className={`px-2 py-1 rounded-lg transition ${
                    !customTime && selectedTime === preset
                      ? "text-orange-500 bg-orange-500/10"
                      : "text-gray-400 hover:text-orange-500"
                  }`}
                >
                  {formatDurationLabel(preset)}
                </button>
              ))}

              <button
                onClick={() => setShowCustomModal(true)}
                className={`flex gap-1 items-center px-2 py-1 rounded-lg transition ${
                  customTime
                    ? "text-orange-500 bg-orange-500/10"
                    : "text-gray-400 hover:text-orange-500"
                }`}
              >
                <IoBuild />
                {customTime ? formatDurationLabel(customTime) : "Custom"}
              </button>
            </div>
          </div>

          <TextBox
            key={resetKey}
            timeLeft={timeLeft}
            setTimeLeft={setTimeLeft}
            initialTime={activeTime}
            setLoading={setLoading}
            onSessionSaved={setResultData}
          />

          <div className="w-full mt-2">
            <TypingTestKeyboard isFullscreen={focus} />
          </div>

          <div className="flex items-center justify-end w-full px-10 gap-10 fixed bottom-5 text-sm">
            <button
              onClick={handleFullscreen}
              className={`hover:text-orange-500 flex gap-0.5 items-center ${
                focus ? "text-orange-500" : "text-gray-500"
              }`}
            >
              <RiFocus3Fill size={15} />
              focus mode
            </button>

            <p className="text-gray-500 hover:text-orange-500 flex gap-1 items-center cursor-pointer">
              <IoGitBranchOutline size={15} />
              v2.0.0
            </p>
          </div>
        </>
      )}

      {resultData && (
        <ResultModal
          stats={resultData}
          graphData={resultData?.graphData ?? []}
          onRetry={resetTest}
        />
      )}

      {showCustomModal && (
        <div className="fixed inset-0 z-[10001] bg-black/70 flex items-center justify-center">
          <div className="w-[360px] bg-[#181C22] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-semibold mb-4">Custom Duration</h2>

            <div className="grid grid-cols-3 gap-3 mb-5">
              <input
                type="number"
                min="0"
                placeholder="Hours"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="bg-black/30 rounded-xl px-3 py-2 outline-none"
              />

              <input
                type="number"
                min="0"
                placeholder="Minutes"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="bg-black/30 rounded-xl px-3 py-2 outline-none"
              />

              <input
                type="number"
                min="0"
                placeholder="Seconds"
                value={seconds}
                onChange={(e) => setSeconds(e.target.value)}
                className="bg-black/30 rounded-xl px-3 py-2 outline-none"
              />
            </div>

            <p className="text-xs text-gray-400 mb-5">
              Maximum allowed duration is 24 hours.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15"
              >
                Cancel
              </button>

              <button
                onClick={handleCustomTime}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 font-semibold"
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