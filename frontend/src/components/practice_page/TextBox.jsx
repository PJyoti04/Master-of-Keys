import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "../../App.css";
import axios from "axios";
import api from "../../utils/api";

const sampleText =
  "Technology has transformed the way people communicate, learn, and work. Every day, millions of users rely on computers and mobile devices to access information, connect with others, and complete important tasks. Developing strong typing skills can significantly improve productivity and reduce the time required to perform routine activities. Consistent practice helps increase typing speed, improve accuracy, and build confidence when working with digital tools. Whether you are a student, software developer, writer, or business professional, efficient typing remains a valuable skill in today's fast-paced world.";

export default function TextBox({
  isFullscreen,
  timeLeft,
  setTimeLeft,
  initialTime,
  setLoading,
  onSessionSaved,
}) {
  const [typedChars, setTypedChars] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [timerActive, setTimerActive] = useState(false);
  const [backspaceCount, setBackspaceCount] = useState(0);
  const [totalMistakes, setTotalMistakes] = useState(0);
  const [testEnded, setTestEnded] = useState(false);
  const [graphData, setGraphData] = useState([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  const textBoxRef = useRef(null);
  const cursorRef = useRef(null);

  const hasSentSessionData = useRef(false);
  const testEndedRef = useRef(false);
  const startTimeRef = useRef(null);

  const correctCountRef = useRef(0);
  const wrongCountRef = useRef(0);
  const backspaceCountRef = useRef(0);
  const latestStatsRef = useRef(null);
  const latestGraphDataRef = useRef([]);

  const currentPosition = typedChars.length;
  const typedText = typedChars.join("");

  const stats = useMemo(() => {
    const correctCharacters = typedChars.filter(
      (char, index) => char === sampleText[index]
    ).length;

    const incorrectCharacters = typedChars.length - correctCharacters;

    const accuracy =
      typedChars.length > 0
        ? Math.round((correctCharacters / typedChars.length) * 100)
        : 100;

    const elapsedMinutes = startTime
      ? Math.max((Date.now() - startTime) / 60000, 1 / 60)
      : 0;

    const wpm =
      elapsedMinutes > 0
        ? Math.round(correctCharacters / 5 / elapsedMinutes)
        : 0;

    const penalty = totalMistakes * 2;
    const score = Math.max(0, correctCharacters - penalty);

    const completionPercentage = Math.round(
      (typedChars.length / sampleText.length) * 100
    );

    return {
      wpm,
      accuracy,
      correctCharacters,
      incorrectCharacters,
      backspaceCount,
      score,
      penalty,
      completionPercentage,
      typedText,
      text: typedText,
    };
  }, [typedChars, startTime, totalMistakes, backspaceCount, typedText]);

  useEffect(() => {
    latestStatsRef.current = stats;
  }, [stats]);

  useEffect(() => {
    latestGraphDataRef.current = graphData;
  }, [graphData]);

  useEffect(() => {
    correctCountRef.current = correctCount;
    wrongCountRef.current = wrongCount;
    backspaceCountRef.current = backspaceCount;
  }, [correctCount, wrongCount, backspaceCount]);

  const sendSessionData = useCallback(
    async (finalStats, finalGraphData) => {
      if (hasSentSessionData.current) return;

      hasSentSessionData.current = true;
      setLoading(true);

      // setTimeout(async () => {

      try {
        const res = await api.post("/user/practice", {
          ...finalStats,
          graphData: finalGraphData,
        });

        const savedSession = res.data?.session || res.data;

        onSessionSaved({
          ...savedSession,
          ...finalStats,
          graphData: savedSession.graphData || finalGraphData,
        });
      } catch (error) {
        hasSentSessionData.current = false;
        testEndedRef.current = false;
        setTestEnded(false);

        console.error("Failed to send session data:", error);
      } finally {
        setLoading(false);
      }
      // },6000)
    },
    [setLoading, onSessionSaved]
  );

  const endTest = useCallback(() => {
    if (testEndedRef.current) return;

    testEndedRef.current = true;

    setTimerActive(false);
    setTestEnded(true);

    sendSessionData(latestStatsRef.current, latestGraphDataRef.current);
  }, [sendSessionData]);

  useEffect(() => {
    if (!timerActive || testEnded) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endTest();
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, testEnded, setTimeLeft, endTest]);

  useEffect(() => {
    if (currentPosition >= sampleText.length && isTyping && !testEnded) {
      endTest();
    }
  }, [currentPosition, isTyping, testEnded, endTest]);

  useEffect(() => {
    if (!timerActive || testEnded || !startTime) return;

    const graphInterval = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const elapsedMinutes = Math.max(elapsedSeconds / 60, 1 / 60);

      const currentWpm = Math.round(
        correctCountRef.current / 5 / elapsedMinutes
      );

      setGraphData((prev) => [
        ...prev,
        {
          second: elapsedSeconds,
          wpm: currentWpm,
          correct: correctCountRef.current,
          wrong: wrongCountRef.current,
          backspace: backspaceCountRef.current,
        },
      ]);
    }, 1000);

    return () => clearInterval(graphInterval);
  }, [timerActive, testEnded, startTime]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (testEndedRef.current) return;

      const isPrintableKey = e.key.length === 1;

      if (e.code === "Space") {
        e.preventDefault();
      }

      if (!isTyping && isPrintableKey) {
        const now = Date.now();

        setIsTyping(true);
        setStartTime(now);
        setTimerActive(true);

        startTimeRef.current = now;
      }

      if (e.key === "Backspace") {
        e.preventDefault();

        setTypedChars((prev) => {
          if (prev.length === 0) return prev;
          return prev.slice(0, -1);
        });

        setBackspaceCount((prev) => prev + 1);
        return;
      }

      if (!isPrintableKey) return;

      setTypedChars((prev) => {
        if (prev.length >= sampleText.length) return prev;

        const expectedChar = sampleText[prev.length];

        if (e.key !== expectedChar) {
          setTotalMistakes((prev) => prev + 1);
          setWrongCount((prev) => prev + 1);
        } else {
          setCorrectCount((prev) => prev + 1);
        }

        return [...prev, e.key];
      });
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isTyping]);

  useEffect(() => {
    if (cursorRef.current && textBoxRef.current) {
      const cursorPos = cursorRef.current.getBoundingClientRect();
      const container = textBoxRef.current.getBoundingClientRect();

      if (cursorPos.bottom > container.bottom) {
        textBoxRef.current.scrollTop += cursorPos.bottom - container.bottom + 40;
      } else if (cursorPos.top < container.top) {
        textBoxRef.current.scrollTop -= container.top - cursorPos.top + 20;
      }
    }
  }, [currentPosition]);

  const renderCharacter = (char, index) => {
    const typedChar = typedChars[index];
    const isCursor = index === currentPosition;
    const isTyped = index < currentPosition;
    const isCorrect = typedChar === char;

    let charClass = "";

    if (isTyped) {
      charClass = isCorrect ? "text-green-500" : "text-red-500";
    }

    const visibleChar =
      char === " " ? (
        <span className="inline-block w-[1.5ch] opacity-30"></span>
      ) : (
        char
      );

    if (isCursor) {
      return (
        <span key={index} ref={cursorRef} className="relative inline-block">
          <span className={charClass}>{visibleChar}</span>
          <span className="absolute left-0 top-0 h-full w-[2px] bg-orange-500 animate-blink" />
        </span>
      );
    }

    return (
      <span key={index} className={charClass}>
        {visibleChar}
      </span>
    );
  };

  const renderWords = () => {
    const tokens = sampleText.match(/\S+\s*/g) || [];
    let charIndex = 0;

    return tokens.map((token, wordIndex) => {
      const wordChars = token.split("");
      const startIndex = charIndex;
      charIndex += wordChars.length;

      return (
        <span key={wordIndex} className="inline-block whitespace-nowrap">
          {wordChars.map((char, localIndex) =>
            renderCharacter(char, startIndex + localIndex)
          )}
        </span>
      );
    });
  };

  return (
    <div
      ref={textBoxRef}
      className={`scrollbar-hidden text-box w-[80%] text-2xl/9 font-medium ${
        isFullscreen ? "h-[300px]" : "h-[200px]"
      } p-3 rounded-2xl m-[30px] mt-0 overflow-y-scroll relative tracking-wider leading-loose text-gray-400`}
      style={{ overflowY: "scroll", overflowX: "hidden" }}
    >
      <div className="relative text-center">
        {renderWords()}

        {currentPosition === sampleText.length && (
          <span ref={cursorRef} className="relative inline-block">
            <span className="absolute left-0 top-0 h-full w-[2px] bg-orange-500 animate-blink" />
          </span>
        )}
      </div>
    </div>
  );
}