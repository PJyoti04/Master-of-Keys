import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import TypingTestKeyboard from "../components/KeyboardLayout/KBLayout";
import TextBox from "../components/practice_page/TextBox";
import ResultModal from "../components/practice_page/ResultModal";
import { RiFocus3Fill } from "react-icons/ri";
import { IoGitBranchOutline } from "react-icons/io5";
import Loader from "../components/ui/Loader";

const INITIAL_TIME = 10;

const Practice = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [resultData, setResultData] = useState(null);
  const [resetKey, setResetKey] = useState(0);

  const [focus, setFocus] = useState(() => {
    const saved = localStorage.getItem("focus");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    localStorage.setItem("focus", JSON.stringify(focus));
  }, [focus]);

  const handleFullscreen = () => {
    setFocus((prev) => !prev);
  };

  const resetTest = () => {
    setResultData(null);
    setTimeLeft(INITIAL_TIME);
    setResetKey((prev) => prev + 1);
  };

  return (
    <div className="bg-[#181C22] text-white flex flex-col items-center min-h-[calc(100vh-80px)] relative">
      {loading && (
        <div className="w-full h-[calc(100vh-80px)] z-[41] bg-black flex items-center justify-center">
          <Loader />
        </div>
      )}

      {!resultData && !loading && (
        <>
          <div className="flex w-[80%] justify-between px-5 py-1 pt-6">
            <div className="text-2xl">{timeLeft}</div>
          </div>

          <TextBox
            key={resetKey}
            // isFullscreen={focus}
            timeLeft={timeLeft}
            setTimeLeft={setTimeLeft}
            initialTime={INITIAL_TIME}
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
    </div>
  );
};

export default Practice;