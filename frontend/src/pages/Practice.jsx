import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import TypingTestKeyboard from "../components/KeyboardLayout/KBLayout";
import TextBox from "../components/practice_page/TextBox";

const Practice = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const [fullscreen, setFullscreen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);

  // let bestScore = '32 wpm';
  // let todayHighScore = '29 wpm';
  const handleFullscreen = () => {
    setFullscreen(prev => !prev)
  }

  return (
    <div className="bg-[#181C22] text-white font-mono flex flex-col justify-center items-center min-h-[80vh] ">
      <div className="flex w-[80%] justify-between px-5 py-2 mt-5 ">
        <div className="text-2xl">{timeLeft}</div>
        {/* <div className="bg-[#00000045] p-2 rounded-xl text-[gray] ">Best Score:{bestScore} | Today's High Score:{todayHighScore}</div> */}
        <div>
          <img
            className="w-[35px] cursor-pointer rounded-full p-1 hover:translate-y-1 hover:bg-[#0000008b] "
            src={fullscreen ? "/exitscreen.png" : "/fullscreen.png"}
            alt="fullscreen"
            onClick={handleFullscreen}
          />
        </div>
      </div>
      <TextBox isFullscreen={fullscreen} timeLeft={timeLeft} setTimeLeft={setTimeLeft} />
      <TypingTestKeyboard isFullscreen={fullscreen} />
    </div>
  );
};

export default Practice;
