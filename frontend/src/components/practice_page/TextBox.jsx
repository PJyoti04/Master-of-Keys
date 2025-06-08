import React, { useState, useEffect, useRef } from "react";
import "../../App.css";
import axios from "axios";
import {useNavigate} from 'react-router-dom'

export default function TextBox({ isFullscreen,timeLeft,setTimeLeft }) {
  // The text to be typed
  const sampleText =
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Porro ea voluptates nihil error amet, accusamus excepturi, quam repellat rem corporis illo dolores praesentium unde iste repudiandae eaque at, ducimus eum! lorem Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit earum harum quas dolorem maxime laudantium exercitationem! In cumque voluptatum sint, ab dignissimos rem eaque, hic totam ratione sequi velit doloremque.";

  // State variables
  const [currentPosition, setCurrentPosition] = useState(0);
  const [incorrectIndices, setIncorrectIndices] = useState(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [score, setScore] = useState(0);
  const [penalty, setPenalty] = useState(0);
  // const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(false);

  const navigate = useNavigate();

  // Reference to keep track of the text container
  const textBoxRef = useRef(null);
  const cursorRef = useRef(null);

  // Start the test when the first key is pressed
  const startTest = () => {
    if (!isTyping) {
      setIsTyping(true);
      setStartTime(Date.now());
      setTimerActive(true);
    }
  };

  // Timer effect
  const hasSentSessionData = React.useRef(false);

  useEffect(() => {
    let timer = null;
    if (timerActive && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
      if (!hasSentSessionData.current) {
        sendSessionData();
        hasSentSessionData.current = true;
      }
    }
    return () => clearTimeout(timer);
  }, [timerActive, timeLeft]);

  // Send session data to backend
  const sendSessionData = async () => {
    try {
      const typedText = sampleText.substring(0, currentPosition);
      const response = await axios.post("http://localhost:5000/api/user/practice", {
        wpm,
        accuracy,
        text: typedText,
      });
    } catch (error) {
      console.error("Failed to send session data:", error);
    }
  };

  // Ensure cursor is visible by scrolling if needed
  useEffect(() => {
    if (cursorRef.current && textBoxRef.current) {
      const cursorPos = cursorRef.current.getBoundingClientRect();
      const container = textBoxRef.current.getBoundingClientRect();

      if (cursorPos.bottom > container.bottom) {
        textBoxRef.current.scrollTop +=
          cursorPos.bottom - container.bottom + 40;
      } else if (cursorPos.top < container.top) {
        textBoxRef.current.scrollTop -= container.top - cursorPos.top + 20;
      }
    }
  }, [currentPosition]);

  // Handle key press events
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Special case for spacebar to prevent scrolling
      if (e.code === "Space") {
        e.preventDefault();
      }

      // Start test if first key press
      if (!isTyping) {
        startTest();
      }

      // Only process key presses if timer is active
      if (!timerActive) {
        return;
      }

      // Get the expected character at the current position
      const expectedChar = sampleText[currentPosition];
      const typedChar = e.key;

      // Only proceed if the current position is within the text
      if (currentPosition < sampleText.length) {
        // Check if the typed character matches the expected one
        if (typedChar === expectedChar) {
          // Correct typing - move cursor forward
          setCurrentPosition(currentPosition + 1);

          // Update score
          setScore((prevScore) => prevScore + 1);
        } else {
          // Incorrect typing - only if it's a printable character
          if (typedChar.length === 1 || typedChar === " ") {
            // Add current position to incorrect indices
            const newIncorrectIndices = new Set(incorrectIndices);
            newIncorrectIndices.add(currentPosition);
            setIncorrectIndices(newIncorrectIndices);

            setMistakes(mistakes + 1);

            // Apply penalty to score
            const newPenalty = 2; // Each mistake costs 2 points
            setPenalty((prevPenalty) => prevPenalty + newPenalty);
            setScore((prevScore) => Math.max(0, prevScore - newPenalty));
          }
        }

        // Calculate WPM and accuracy if typing has started
        if (startTime) {
          const timeElapsed = (Date.now() - startTime) / 60000; // in minutes
          const wordsTyped = currentPosition / 5; // 5 characters = 1 word standard
          const newWpm = Math.round(wordsTyped / timeElapsed);
          setWpm(newWpm > 0 ? newWpm : 0);

          const totalAttempts = currentPosition + mistakes;
          const newAccuracy =
            totalAttempts > 0
              ? Math.round(((currentPosition - mistakes) / totalAttempts) * 100)
              : 100;
          setAccuracy(newAccuracy > 0 ? newAccuracy : 0);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPosition,
    isTyping,
    mistakes,
    incorrectIndices,
    sampleText,
    startTime,
    timerActive,
  ]);

  return (
    <>
      <div className="stats flex justify-around px-10 py-2 text-white bg-gray-800 rounded-t-lg">
        {/* <div>Time Left: <span className="font-bold">{timeLeft}s</span></div> */}
        <div>WPM: <span className="font-bold">{wpm} |</span></div>
        <div>Accuracy: <span className="font-bold"> {accuracy}% |</span></div>
        <div>Score: <span className="font-bold">{score} |</span></div>
        <div>Mistakes: <span className="font-bold text-red-400">{mistakes} |</span></div>
        <div>Penalty: <span className="font-bold text-red-400">-{penalty }</span></div>
      </div>

      <div
        ref={textBoxRef}
        className={`scrollbar-hidden text-box w-[80%] bg-[#00000039] text-2xl/9 font-medium ${
          isFullscreen ? "h-[300px]" : "h-[200px]"
        } p-5 rounded-2xl m-[30px] mt-0 overflow-y-scroll relative tracking-wider leading-loose`}
        style={{ overflowY: "scroll", overflowX: "hidden" }}
      >
        <div className="relative">
          {sampleText.split("").map((char, index) => {
            // Determine character styling based on typing status
            let charClass = "";

            if (index === currentPosition) {
              return (
                <span key={index} ref={cursorRef} className="relative">
                  <span className="relative inline-block">
                    {char === ' ' ? (
                      <span className="inline-block w-[1.5ch] opacity-30">_</span>
                    ) : (
                      char
                    )}
                    <span className="absolute left-0 top-0 h-full w-[2px] bg-orange-500 animate-blink" />
                  </span>
                </span>
              );
            } else if (index < currentPosition) {
              // Already typed characters
              charClass = incorrectIndices.has(index)
                ? "text-red-500"
                : "text-green-500";
            }

            // Show visible space character
            if (char === " ") {
              return (
                <span key={index} className={`${charClass}`}>
                  <span className="inline-block w-[1.5ch] opacity-30">_</span>
                </span>
              );
            }

            // Regular characters
            return (
              <span key={index} className={charClass}>
                {char}
              </span>
            );
          })}
        </div>
      </div>
    </>
  );
}
