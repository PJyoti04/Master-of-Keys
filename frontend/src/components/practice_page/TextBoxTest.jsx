import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import api from "../../utils/api";
import "../../App.css";
import { getRandomTypingText } from "../../assets/typingTexts";
import { AuthContext } from "../../context/AuthContext";

const APPEND_TEXT_THRESHOLD = 220;

const createInitialText = () => {
  const firstParagraph = getRandomTypingText();
  const secondParagraph = getRandomTypingText(firstParagraph);

  return `${firstParagraph} ${secondParagraph}`;
};

export default function TextBoxTest({
  isFullscreen,
  timeLeft,
  setTimeLeft,
  initialTime,
  setLoading,
  onSessionSaved,
}) {
  const { user } = useContext(AuthContext);
  const [practiceText, setPracticeText] = useState(createInitialText);

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
  const [isInputFocused, setIsInputFocused] = useState(false);

  const textBoxRef = useRef(null);
  const cursorRef = useRef(null);
  const mobileInputRef = useRef(null);

  const practiceTextRef = useRef(practiceText);
  const typedCharsRef = useRef([]);

  const hasSentSessionData = useRef(false);
  const testEndedRef = useRef(false);
  const startTimeRef = useRef(null);

  const correctCountRef = useRef(0);
  const wrongCountRef = useRef(0);
  const backspaceCountRef = useRef(0);
  const totalMistakesRef = useRef(0);

  const latestStatsRef = useRef(null);
  const latestGraphDataRef = useRef([]);

  const currentPosition = typedChars.length;
  const typedText = typedChars.join("");

  useEffect(() => {
    practiceTextRef.current = practiceText;
  }, [practiceText]);

  useEffect(() => {
    typedCharsRef.current = typedChars;
  }, [typedChars]);

  const stats = useMemo(() => {
    const totalTypedCharacters = correctCount + wrongCount;

    const accuracy =
      totalTypedCharacters > 0
        ? Math.round((correctCount / totalTypedCharacters) * 100)
        : 0;

    const elapsedMinutes = startTime
      ? Math.max((Date.now() - startTime) / 60000, 1 / 60)
      : 0;

    const wpm =
      elapsedMinutes > 0 ? Math.round(correctCount / 5 / elapsedMinutes) : 0;

    const penalty = wrongCount * 2;
    const score = Math.max(0, correctCount - penalty);

    const completionPercentage = Math.min(
      100,
      Math.round((typedChars.length / practiceText.length) * 100),
    );

    return {
      wpm,
      accuracy,

      // Cumulative keystroke statistics
      correctCharacters: correctCount,
      incorrectCharacters: wrongCount,
      totalTypedCharacters,

      backspaceCount,
      score,
      penalty,
      completionPercentage,
      typedText,
      text: typedText,
    };
  }, [
    correctCount,
    wrongCount,
    backspaceCount,
    startTime,
    typedChars.length,
    practiceText.length,
    typedText,
  ]);

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
    totalMistakesRef.current = totalMistakes;
  }, [
    correctCount,
    wrongCount,
    backspaceCount,
    totalMistakes,
  ]);

  const resetTest = useCallback(() => {
    const firstParagraph = getRandomTypingText();
    const secondParagraph = getRandomTypingText(firstParagraph);

    const nextPracticeText =
      `${firstParagraph} ${secondParagraph}`;

    setPracticeText(nextPracticeText);
    practiceTextRef.current = nextPracticeText;

    setTypedChars([]);
    typedCharsRef.current = [];

    setIsTyping(false);
    setStartTime(null);
    setTimerActive(false);
    setBackspaceCount(0);
    setTotalMistakes(0);
    setTestEnded(false);
    setGraphData([]);
    setCorrectCount(0);
    setWrongCount(0);

    setTimeLeft(initialTime);

    startTimeRef.current = null;
    correctCountRef.current = 0;
    wrongCountRef.current = 0;
    backspaceCountRef.current = 0;
    totalMistakesRef.current = 0;

    hasSentSessionData.current = false;
    testEndedRef.current = false;
    latestGraphDataRef.current = [];
    latestStatsRef.current = null;

    if (textBoxRef.current) {
      textBoxRef.current.scrollTop = 0;
    }

    if (mobileInputRef.current) {
      mobileInputRef.current.value = "";
    }
  }, [initialTime, setTimeLeft]);

  /*
   * Reset the entire test whenever the selected duration changes.
   *
   * For example:
   * 15 seconds -> 60 seconds
   * 60 seconds -> 120 seconds
   */
  useEffect(() => {
    resetTest();
  }, [initialTime, resetTest]);

  const sendSessionData = useCallback(
    async (finalStats, finalGraphData) => {
      if (hasSentSessionData.current || !finalStats) {
        return;
      }

      hasSentSessionData.current = true;

      /*
       * Guest user:
       * Do not call the backend because the protected API will fail.
       * Show the locally calculated result immediately.
       */
      if (!user) {
        onSessionSaved({
          ...finalStats,
          graphData: finalGraphData || [],
          isGuestResult: true,
          isSaved: false,
        });

        return;
      }

      /*
       * Logged-in user:
       * Save the session through the API.
       */
      setLoading(true);

      try {
        const response = await api.post("/user/practice", {
          ...finalStats,
          graphData: finalGraphData,
        });

        const savedSession = response.data?.session || response.data;

        onSessionSaved({
          ...savedSession,
          ...finalStats,
          graphData: savedSession?.graphData || finalGraphData || [],
          isGuestResult: false,
          isSaved: true,
        });
      } catch (error) {
        hasSentSessionData.current = false;
        testEndedRef.current = false;

        setTestEnded(false);

        console.error(
          "Failed to send practice session:",
          error?.response?.data || error,
        );
      } finally {
        setLoading(false);
      }
    },
    [user, setLoading, onSessionSaved],
  );

  const endTest = useCallback(() => {
    if (testEndedRef.current) {
      return;
    }

    testEndedRef.current = true;

    setTimerActive(false);
    setTestEnded(true);

    sendSessionData(
      latestStatsRef.current,
      latestGraphDataRef.current
    );

    mobileInputRef.current?.blur();
  }, [sendSessionData]);

  useEffect(() => {
    if (!timerActive || testEnded) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setTimeLeft((previousTime) => {
        if (previousTime <= 1) {
          endTest();
          return 0;
        }

        return previousTime - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [
    timerActive,
    testEnded,
    setTimeLeft,
    endTest,
  ]);

  /*
   * Append another paragraph before the user reaches the end.
   * The test therefore continues until the selected time expires.
   */
  useEffect(() => {
    const remainingCharacters =
      practiceText.length - currentPosition;

    if (
      remainingCharacters > APPEND_TEXT_THRESHOLD ||
      testEnded
    ) {
      return;
    }

    setPracticeText((previousText) => {
      const previousParagraph =
        previousText.split(" ").slice(-40).join(" ");

      const nextParagraph =
        getRandomTypingText(previousParagraph);

      return `${previousText} ${nextParagraph}`;
    });
  }, [
    currentPosition,
    practiceText.length,
    testEnded,
  ]);

  useEffect(() => {
    if (!timerActive || testEnded || !startTime) {
      return undefined;
    }

    const graphInterval = window.setInterval(() => {
      if (!startTimeRef.current) {
        return;
      }

      const elapsedSeconds = Math.floor(
        (Date.now() - startTimeRef.current) / 1000
      );

      const elapsedMinutes = Math.max(
        elapsedSeconds / 60,
        1 / 60
      );

      const currentWpm = Math.round(
        correctCountRef.current / 5 / elapsedMinutes
      );

      setGraphData((previousData) => [
        ...previousData,
        {
          second: elapsedSeconds,
          wpm: currentWpm,
          correct: correctCountRef.current,
          wrong: wrongCountRef.current,
          backspace: backspaceCountRef.current,
        },
      ]);
    }, 1000);

    return () => {
      window.clearInterval(graphInterval);
    };
  }, [timerActive, testEnded, startTime]);

  const beginTest = useCallback(() => {
    if (
      isTyping ||
      testEndedRef.current ||
      timerActive
    ) {
      return;
    }

    const now = Date.now();

    setIsTyping(true);
    setStartTime(now);
    setTimerActive(true);

    startTimeRef.current = now;
  }, [isTyping, timerActive]);

  const processCharacter = useCallback(
    (character) => {
      if (
        testEndedRef.current ||
        typeof character !== "string" ||
        character.length !== 1
      ) {
        return;
      }

      beginTest();

      setTypedChars((previousChars) => {
        const expectedCharacter =
          practiceTextRef.current[previousChars.length];

        if (expectedCharacter === undefined) {
          return previousChars;
        }

        if (character === expectedCharacter) {
          setCorrectCount((previous) => previous + 1);
        } else {
          setWrongCount((previous) => previous + 1);
          setTotalMistakes((previous) => previous + 1);
        }

        return [...previousChars, character];
      });
    },
    [beginTest]
  );

  const processBackspace = useCallback(() => {
    if (testEndedRef.current) {
      return;
    }

    setTypedChars((previousChars) => {
      if (previousChars.length === 0) {
        return previousChars;
      }

      return previousChars.slice(0, -1);
    });

    setBackspaceCount((previous) => previous + 1);
  }, []);

  /*
   * Desktop physical keyboard support.
   */
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (testEndedRef.current) {
        return;
      }

      const target = event.target;
      const isFormControl =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement;

      /*
       * Mobile input has its own handlers.
       * This prevents duplicate characters.
       */
      if (isFormControl) {
        return;
      }

      if (event.key === "Backspace") {
        event.preventDefault();
        processBackspace();
        return;
      }

      if (event.key.length !== 1) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
      }

      processCharacter(event.key);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [processBackspace, processCharacter]);

  /*
   * Mobile virtual keyboard input.
   *
   * The textarea is almost invisible, but remains focusable.
   * Tapping the visible typing area focuses it and opens the
   * mobile keyboard.
   */
  const handleMobileInput = (event) => {
    const enteredValue = event.currentTarget.value;

    if (!enteredValue) {
      return;
    }

    for (const character of enteredValue) {
      processCharacter(character);
    }

    event.currentTarget.value = "";
  };

  const handleMobileKeyDown = (event) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      processBackspace();
    }
  };

  const focusMobileInput = () => {
    if (testEndedRef.current) {
      return;
    }

    mobileInputRef.current?.focus({
      preventScroll: true,
    });
  };

  useEffect(() => {
    if (!cursorRef.current || !textBoxRef.current) {
      return;
    }

    const cursorPosition =
      cursorRef.current.getBoundingClientRect();

    const containerPosition =
      textBoxRef.current.getBoundingClientRect();

    if (cursorPosition.bottom > containerPosition.bottom) {
      textBoxRef.current.scrollTop +=
        cursorPosition.bottom -
        containerPosition.bottom +
        50;
    } else if (
      cursorPosition.top < containerPosition.top
    ) {
      textBoxRef.current.scrollTop -=
        containerPosition.top -
        cursorPosition.top +
        10;
    }
  }, [currentPosition]);

  const renderCharacter = (character, index) => {
    const typedCharacter = typedChars[index];
    const isCursor = index === currentPosition;
    const isTyped = index < currentPosition;
    const isCorrect = typedCharacter === character;

    let characterClass = "text-gray-400";

    if (isTyped) {
      characterClass = isCorrect
        ? "text-green-500"
        : "text-red-500";
    }

    const visibleCharacter =
      character === " " ? (
        <span className="inline-block w-[1.25ch]">
          &nbsp;
        </span>
      ) : (
        character
      );

    if (isCursor) {
      return (
        <span
          key={index}
          ref={cursorRef}
          className="relative inline-block"
        >
          <span className={characterClass}>
            {visibleCharacter}
          </span>

          <span className="absolute left-0 top-[5%] h-[90%] w-[2px] animate-blink bg-orange-500" />
        </span>
      );
    }

    return (
      <span key={index} className={characterClass}>
        {visibleCharacter}
      </span>
    );
  };

  const renderWords = () => {
    const tokens =
      practiceText.match(/\S+\s*/g) || [];

    let characterIndex = 0;

    return tokens.map((token, wordIndex) => {
      const wordCharacters = token.split("");
      const startIndex = characterIndex;

      characterIndex += wordCharacters.length;

      return (
        <span
          key={`${wordIndex}-${startIndex}`}
          className="inline-block whitespace-nowrap"
        >
          {wordCharacters.map(
            (character, localIndex) =>
              renderCharacter(
                character,
                startIndex + localIndex
              )
          )}
        </span>
      );
    });
  };

  return (
    // <div className="relative flex w-full justify-center px-3 sm:px-5 md:px-8">
      <div
        ref={textBoxRef}
        role="textbox"
        tabIndex={0}
        aria-label="Typing practice area"
        aria-description="Tap this area to open the mobile keyboard and begin typing."
        onClick={focusMobileInput}
        onFocus={focusMobileInput}
        //  style={{ overflowY: "scroll", overflowX: "hidden" }}
        className={`scrollbar-hidden relative w-[80%] cursor-text overflow-x-hidden rounded-2xl px-3 py-4 font-medium tracking-wide text-gray-400 outline-none transition duration-200 sm:px-5 sm:py-0 md:px-7 ${
          isFullscreen
            ? "h-[clamp(260px,55vh,520px)]"
            : "h-[clamp(220px,220px,250px)]"
        } ${
          isInputFocused 
          ? "" : ""
            // ? "shadow-[0_0_0_1px_rgba(255,145,0,0.35),0_15px_45px_rgba(0,0,0,0.2)]"
            // : "shadow-[0_15px_45px_rgba(0,0,0,0.15)]"
        }`}
      >
        {/* Mobile keyboard input */}
        <textarea
          ref={mobileInputRef}
          defaultValue=""
          inputMode="text"
          enterKeyHint="done"
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Mobile typing input"
          disabled={testEnded}
          onInput={handleMobileInput}
          onKeyDown={handleMobileKeyDown}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          className="absolute left-1/2 top-2 h-px w-px -translate-x-1/2 resize-none overflow-hidden bg-transparent p-0 text-transparent opacity-0 outline-none"
        />

        <div className="relative text-center text-lg leading-[2.2] sm:text-xl sm:leading-[2.15] md:text-2xl md:leading-[2.2]">
          {renderWords()}

          {currentPosition === practiceText.length && (
            <span
              ref={cursorRef}
              className="relative inline-block"
            >
              <span className="absolute left-0 top-0 h-full w-[2px] animate-blink bg-orange-500" />
            </span>
          )}
        </div>

        {!isTyping && !testEnded && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              focusMobileInput();
            }}
            className="sticky bottom-2 mt-5 block translate-x-1 rounded-full bg-[#181C22]/90 px-4 py-2 font-sans text-xs text-zinc-400 shadow-xl backdrop-blur-md transition hover:text-orange-500 md:hidden"
          >
            Tap here to open keyboard
          </button>
        )}
      </div>
    // </div>
  );
}