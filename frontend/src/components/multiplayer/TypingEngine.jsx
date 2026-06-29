import { useEffect, useState } from "react";

function TypingEngine({
  text,
  onProgress,
  onFinish,
}) {
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const [startTime, setStartTime] =
    useState(null);

  useEffect(() => {
    if (!started && input.length > 0) {
      setStarted(true);
      setStartTime(Date.now());
    }
  }, [input, started]);

  const calculateStats = (
    value
  ) => {
    const elapsedMinutes =
      (Date.now() - startTime) /
      1000 /
      60;

    const correctChars = value
      .split("")
      .filter(
        (char, index) =>
          char === text[index]
      ).length;

    const progress = Math.min(
      100,
      Math.round(
        (value.length / text.length) *
          100
      )
    );

    const accuracy =
      value.length === 0
        ? 100
        : Math.round(
            (correctChars /
              value.length) *
              100
          );

    const wpm =
      elapsedMinutes > 0
        ? Math.round(
            correctChars /
              5 /
              elapsedMinutes
          )
        : 0;

    return {
      progress,
      accuracy,
      wpm,
    };
  };

  const handleChange = (e) => {
    const value = e.target.value;

    if (
      value.length > text.length
    )
      return;

    setInput(value);

    if (!startTime) return;

    const stats =
      calculateStats(value);

    onProgress(stats);

    if (
      value.length === text.length
    ) {
      onFinish(stats);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 p-6 rounded-lg">
        <p className="text-xl leading-9 text-zinc-300">
          {text.split("").map(
            (char, index) => {
              let color =
                "text-zinc-400";

              if (
                index <
                input.length
              ) {
                color =
                  input[index] ===
                  char
                    ? "text-green-400"
                    : "text-red-500";
              }

              return (
                <span
                  key={index}
                  className={color}
                >
                  {char}
                </span>
              );
            }
          )}
        </p>
      </div>

      <textarea
        autoFocus
        value={input}
        onChange={handleChange}
        className="
          w-full
          h-40
          bg-zinc-900
          text-white
          rounded-lg
          p-4
          outline-none
          border
          border-zinc-700
          focus:border-orange-500
        "
        placeholder="Start typing..."
      />
    </div>
  );
}

export default TypingEngine;