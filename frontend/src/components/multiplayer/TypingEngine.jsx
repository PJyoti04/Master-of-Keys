import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  HiOutlineCursorArrowRays,
  // HiOutlineKeyboard,
} from "react-icons/hi2";

function TypingEngine({
  text,
  onProgress,
  onFinish,
  disabled = false,
}) {
  const [typedChars, setTypedChars] = useState([]);
  const [started, setStarted] = useState(false);
  const [startTime, setStartTime] = useState(null);

  /*
   * These counters represent the complete typing history.
   * Backspace does not remove previous correct or incorrect keystrokes.
   */
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [backspaceCount, setBackspaceCount] = useState(0);

  const [isInputFocused, setIsInputFocused] = useState(false);

  const textContainerRef = useRef(null);
  const cursorRef = useRef(null);
  const mobileInputRef = useRef(null);

  const textRef = useRef(text);
  const typedCharsRef = useRef([]);

  const startedRef = useRef(false);
  const startTimeRef = useRef(null);
  const finishedRef = useRef(false);

  const correctCountRef = useRef(0);
  const wrongCountRef = useRef(0);
  const backspaceCountRef = useRef(0);

  const lastProgressEmitRef = useRef(0);

  const currentPosition = typedChars.length;

  useEffect(() => {
    textRef.current = text;
  }, [text]);

  useEffect(() => {
    typedCharsRef.current = typedChars;
  }, [typedChars]);

  useEffect(() => {
    correctCountRef.current = correctCount;
    wrongCountRef.current = wrongCount;
    backspaceCountRef.current = backspaceCount;
  }, [correctCount, wrongCount, backspaceCount]);

  /*
   * Completely reset the engine if the server supplies a new race text.
   */
  useEffect(() => {
    setTypedChars([]);
    setStarted(false);
    setStartTime(null);
    setCorrectCount(0);
    setWrongCount(0);
    setBackspaceCount(0);
    setIsInputFocused(false);

    typedCharsRef.current = [];
    startedRef.current = false;
    startTimeRef.current = null;
    finishedRef.current = false;

    correctCountRef.current = 0;
    wrongCountRef.current = 0;
    backspaceCountRef.current = 0;
    lastProgressEmitRef.current = 0;

    if (textContainerRef.current) {
      textContainerRef.current.scrollTop = 0;
    }

    if (mobileInputRef.current) {
      mobileInputRef.current.value = "";
    }
  }, [text]);

  const calculateStats = useCallback(
    ({
      position = typedCharsRef.current.length,
      correct = correctCountRef.current,
      wrong = wrongCountRef.current,
      backspaces = backspaceCountRef.current,
    } = {}) => {
      const totalKeystrokes = correct + wrong;

      const elapsedMinutes = startTimeRef.current
        ? Math.max(
            (Date.now() - startTimeRef.current) / 60000,
            1 / 60
          )
        : 0;

      const progress =
        textRef.current.length > 0
          ? Math.min(
              100,
              Number(
                (
                  (position / textRef.current.length) *
                  100
                ).toFixed(2)
              )
            )
          : 0;

      const accuracy =
        totalKeystrokes > 0
          ? Math.round((correct / totalKeystrokes) * 100)
          : 0;

      const wpm =
        elapsedMinutes > 0
          ? Math.max(
              0,
              Math.round(correct / 5 / elapsedMinutes)
            )
          : 0;

      return {
        progress,
        accuracy,
        wpm,
        correctChars: correct,
        wrongChars: wrong,
        backspaceCount: backspaces,
        totalKeystrokes,
      };
    },
    []
  );

  const currentStats = useMemo(() => {
    return calculateStats({
      position: typedChars.length,
      correct: correctCount,
      wrong: wrongCount,
      backspaces: backspaceCount,
    });
  }, [
    typedChars.length,
    correctCount,
    wrongCount,
    backspaceCount,
    calculateStats,
  ]);

  const startRaceForPlayer = useCallback(() => {
    if (startedRef.current || disabled || finishedRef.current) {
      return;
    }

    const now = Date.now();

    startedRef.current = true;
    startTimeRef.current = now;

    setStarted(true);
    setStartTime(now);
  }, [disabled]);

  const emitProgress = useCallback(
    (stats, force = false) => {
      const now = Date.now();

      /*
       * Limit progress events to approximately 8 updates per second.
       * This keeps real-time movement smooth without flooding Socket.IO.
       */
      if (
        !force &&
        now - lastProgressEmitRef.current < 120
      ) {
        return;
      }

      lastProgressEmitRef.current = now;
      onProgress?.(stats);
    },
    [onProgress]
  );

  const completeRace = useCallback(
    (stats) => {
      if (finishedRef.current) {
        return;
      }

      finishedRef.current = true;

      emitProgress(
        {
          ...stats,
          progress: 100,
        },
        true
      );

      onFinish?.({
        ...stats,
        progress: 100,
      });

      mobileInputRef.current?.blur();
    },
    [emitProgress, onFinish]
  );

  const processCharacter = useCallback(
    (character) => {
      if (
        disabled ||
        finishedRef.current ||
        typeof character !== "string" ||
        character.length !== 1
      ) {
        return;
      }

      const currentText = textRef.current;
      const currentTypedChars = typedCharsRef.current;
      const position = currentTypedChars.length;

      if (!currentText || position >= currentText.length) {
        return;
      }

      startRaceForPlayer();

      const expectedCharacter = currentText[position];
      const isCorrect = character === expectedCharacter;

      const nextTypedChars = [
        ...currentTypedChars,
        character,
      ];

      const nextCorrectCount =
        correctCountRef.current + (isCorrect ? 1 : 0);

      const nextWrongCount =
        wrongCountRef.current + (isCorrect ? 0 : 1);

      typedCharsRef.current = nextTypedChars;
      correctCountRef.current = nextCorrectCount;
      wrongCountRef.current = nextWrongCount;

      setTypedChars(nextTypedChars);

      if (isCorrect) {
        setCorrectCount(nextCorrectCount);
      } else {
        setWrongCount(nextWrongCount);
      }

      /*
       * startTimeRef is assigned synchronously above, so the
       * first keystroke can also produce valid statistics.
       */
      const stats = calculateStats({
        position: nextTypedChars.length,
        correct: nextCorrectCount,
        wrong: nextWrongCount,
        backspaces: backspaceCountRef.current,
      });

      const hasFinished =
        nextTypedChars.length >= currentText.length;

      if (hasFinished) {
        completeRace(stats);
      } else {
        emitProgress(stats);
      }
    },
    [
      disabled,
      startRaceForPlayer,
      calculateStats,
      completeRace,
      emitProgress,
    ]
  );

  const processBackspace = useCallback(() => {
    if (disabled || finishedRef.current) {
      return;
    }

    const currentTypedChars = typedCharsRef.current;

    if (currentTypedChars.length === 0) {
      return;
    }

    const nextTypedChars = currentTypedChars.slice(0, -1);
    const nextBackspaceCount =
      backspaceCountRef.current + 1;

    typedCharsRef.current = nextTypedChars;
    backspaceCountRef.current = nextBackspaceCount;

    setTypedChars(nextTypedChars);
    setBackspaceCount(nextBackspaceCount);

    if (startedRef.current) {
      const stats = calculateStats({
        position: nextTypedChars.length,
        correct: correctCountRef.current,
        wrong: wrongCountRef.current,
        backspaces: nextBackspaceCount,
      });

      emitProgress(stats, true);
    }
  }, [
    disabled,
    calculateStats,
    emitProgress,
  ]);

  /*
   * Desktop physical keyboard support.
   */
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (disabled || finishedRef.current) {
        return;
      }

      const target = event.target;

      /*
       * The hidden mobile input handles its own input events.
       * Ignoring form controls here prevents duplicate characters.
       */
      const isFormControl =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement;

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
  }, [
    disabled,
    processBackspace,
    processCharacter,
  ]);

  /*
   * Mobile virtual keyboard support.
   *
   * A focusable input is required for browsers to open the
   * native keyboard. It is invisible and is not a separate
   * visible area where the user has to type.
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

  const focusTypingInput = () => {
    if (disabled || finishedRef.current) {
      return;
    }

    mobileInputRef.current?.focus({
      preventScroll: true,
    });
  };

  /*
   * Keep the active character visible as the text moves down.
   */
  useEffect(() => {
    if (!cursorRef.current || !textContainerRef.current) {
      return;
    }

    const cursorRect =
      cursorRef.current.getBoundingClientRect();

    const containerRect =
      textContainerRef.current.getBoundingClientRect();

    if (cursorRect.bottom > containerRect.bottom - 30) {
      textContainerRef.current.scrollTop +=
        cursorRect.bottom -
        containerRect.bottom +
        55;
    } else if (cursorRect.top < containerRect.top + 20) {
      textContainerRef.current.scrollTop -=
        containerRect.top -
        cursorRect.top +
        40;
    }
  }, [currentPosition]);

  const renderCharacter = (character, index) => {
    const typedCharacter = typedChars[index];
    const isTyped = index < currentPosition;
    const isCursor = index === currentPosition;
    const isCorrect = typedCharacter === character;

    let characterClass = "text-zinc-500";

    if (isTyped) {
      characterClass = isCorrect
        ? "text-emerald-400"
        : "bg-red-500/15 text-red-400";
    }

    const visibleCharacter =
      character === " " ? (
        <span className="inline-block w-[1.15ch]">
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

          {!disabled && !finishedRef.current && (
            <span className="absolute left-0 top-[7%] h-[86%] w-[2px] animate-pulse rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
          )}
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
    const tokens = text.match(/\S+\s*/g) || [];
    let characterIndex = 0;

    return tokens.map((token, wordIndex) => {
      const characters = token.split("");
      const startIndex = characterIndex;

      characterIndex += characters.length;

      return (
        <span
          key={`${wordIndex}-${startIndex}`}
          className="inline-block whitespace-nowrap"
        >
          {characters.map((character, localIndex) =>
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
    <section className="w-full">
      {/* Local player statistics */}
      <div className="mb-3 grid grid-cols-4 gap-2 sm:mb-4 sm:gap-3">
        <div className="rounded-xl bg-black/20 px-2 py-2.5 text-center sm:px-3">
          <strong className="block text-base font-bold tabular-nums text-white sm:text-lg">
            {currentStats.wpm}
          </strong>

          <span className="font-sans text-[9px] uppercase tracking-wide text-zinc-600 sm:text-[10px]">
            WPM
          </span>
        </div>

        <div className="rounded-xl bg-black/20 px-2 py-2.5 text-center sm:px-3">
          <strong className="block text-base font-bold tabular-nums text-white sm:text-lg">
            {currentStats.accuracy}%
          </strong>

          <span className="font-sans text-[9px] uppercase tracking-wide text-zinc-600 sm:text-[10px]">
            Accuracy
          </span>
        </div>

        <div className="rounded-xl bg-black/20 px-2 py-2.5 text-center sm:px-3">
          <strong className="block text-base font-bold tabular-nums text-emerald-400 sm:text-lg">
            {correctCount}
          </strong>

          <span className="font-sans text-[9px] uppercase tracking-wide text-zinc-600 sm:text-[10px]">
            Correct
          </span>
        </div>

        <div className="rounded-xl bg-black/20 px-2 py-2.5 text-center sm:px-3">
          <strong className="block text-base font-bold tabular-nums text-red-400 sm:text-lg">
            {wrongCount}
          </strong>

          <span className="font-sans text-[9px] uppercase tracking-wide text-zinc-600 sm:text-[10px]">
            Wrong
          </span>
        </div>
      </div>

      {/* Own progress */}
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between font-sans text-[10px] text-zinc-500">
          <span>Your race progress</span>
          <span className="tabular-nums text-orange-400">
            {Math.round(currentStats.progress)}%
          </span>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-black/30">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-600 to-orange-400 transition-[width] duration-150"
            style={{
              width: `${currentStats.progress}%`,
            }}
          />
        </div>
      </div>

      {/* Visible typing surface */}
      <div
        ref={textContainerRef}
        role="textbox"
        tabIndex={disabled ? -1 : 0}
        aria-label="Multiplayer race typing area"
        aria-disabled={disabled}
        onClick={focusTypingInput}
        onFocus={focusTypingInput}
        className={`scrollbar-hidden relative h-[clamp(230px,38vh,360px)] w-full cursor-text overflow-x-hidden overflow-y-auto rounded-2xl bg-black/20 px-4 py-5 outline-none transition sm:px-6 sm:py-6 md:h-[clamp(260px,42vh,410px)] md:px-8 ${
          isInputFocused
            ? "shadow-[0_0_0_1px_rgba(249,115,22,0.35),0_20px_55px_rgba(0,0,0,0.2)]"
            : "shadow-[0_20px_55px_rgba(0,0,0,0.15)]"
        } ${
          disabled
            ? "cursor-not-allowed opacity-70"
            : ""
        }`}
      >
        <input
          ref={mobileInputRef}
          type="text"
          inputMode="text"
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          disabled={disabled || finishedRef.current}
          aria-label="Mobile race typing input"
          onInput={handleMobileInput}
          onKeyDown={handleMobileKeyDown}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          className="absolute left-1/2 top-2 h-px w-px -translate-x-1/2 bg-transparent p-0 text-transparent opacity-0 outline-none"
        />

        <div className="relative text-center font-mono text-lg font-medium leading-[2.05] tracking-wide sm:text-xl sm:leading-[2.1] md:text-2xl md:leading-[2.15]">
          {renderWords()}
        </div>

        {!started && !disabled && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              focusTypingInput();
            }}
            className="sticky bottom-2 left-1/2 mt-5 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#181C22]/95 px-4 py-2 font-sans text-xs text-zinc-400 shadow-xl backdrop-blur-xl transition hover:text-orange-500"
          >
            {/* <HiOutlineKeyboard size={16} /> */}

            <span className="sm:hidden">
              Tap to open keyboard
            </span>

            <span className="hidden sm:inline">
              Start typing
            </span>
          </button>
        )}

        {finishedRef.current && (
          <div className="sticky bottom-3 mx-auto mt-5 flex w-fit items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 font-sans text-xs font-semibold text-emerald-400 backdrop-blur-xl">
            <HiOutlineCursorArrowRays size={16} />
            You finished the race
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 font-sans text-[10px] text-zinc-600 sm:text-xs">
        <span>
          {started
            ? "Your progress is being shared in real time."
            : "The timer starts with your first character."}
        </span>

        <span>{backspaceCount} backspaces</span>
      </div>
    </section>
  );
}

export default TypingEngine;
