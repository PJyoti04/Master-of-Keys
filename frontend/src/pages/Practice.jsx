import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import TypingTestKeyboard from "../components/KeyboardLayout/KBLayout";
import TextBox from "../components/practice_page/TextBox";
import { RiFocus3Fill } from "react-icons/ri";
import { IoGitBranchOutline } from "react-icons/io5";

const Practice = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const [timeLeft, setTimeLeft] = useState(10);
  const [focus, setFocus] = useState(() => {
    const saved = localStorage.getItem("focus");
    return saved ? JSON.parse(saved) : false;
  });

  const handleFullscreen = () => {
    setFocus((prev) => !prev);
  };

  // Save whenever fullscreen changes
  useEffect(() => {
    localStorage.setItem("focus", JSON.stringify(focus));
  }, [focus]);

  return (
    <div
      className="bg-[#181C22] text-white flex flex-col items-center min-h-[calc(100vh-80px)]"
      // min-h-[80vh] "
    >
      <div className="flex w-[80%] justify-between px-5 py-1 pt-6">
        <div className="text-2xl">{timeLeft}</div>
        {/* <div className="bg-[#00000045] p-2 rounded-xl text-[gray] ">Best Score:{bestScore} | Today's High Score:{todayHighScore}</div> */}
        {/* <div>
          <img
            className="w-[35px] cursor-pointer rounded-full p-1 hover:translate-y-1 hover:bg-[#0000008b] "
            src={fullscreen ? "/exitscreen.png" : "/fullscreen.png"}
            alt="fullscreen"
            onClick={handleFullscreen}
          />
        </div> */}
      </div>
      <TextBox timeLeft={timeLeft} setTimeLeft={setTimeLeft} />
      <div className="w-full mt-2">
        <TypingTestKeyboard isFullscreen={focus} />
      </div>
      <div className="flex items-center justify-end w-full px-10 gap-10 fixed bottom-5 text-sm">
        <button
          onClick={handleFullscreen}
          className={`hover:text-orange-500 flex gap-0.5 items-center ${focus ? "text-orange-500" : "text-gray-500"} `}
        >
          <RiFocus3Fill size={15} />
          focus mode
        </button>
        <p className="text-gray-500 hover:text-orange-500 flex gap-1 items-center cursor-pointer ">
          <IoGitBranchOutline size={15} />
          v2.0.0
        </p>
      </div>
    </div>
  );
};

export default Practice;
