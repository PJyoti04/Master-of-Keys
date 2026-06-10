/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";

const COLS = 15;

const key = (label, span = 1, display = label) => ({ label, span, display });

const layouts = {
  windows: [
    [
      key("`"), key("1"), key("2"), key("3"), key("4"), key("5"), key("6"),
      key("7"), key("8"), key("9"), key("0"), key("-"), key("="), key("Backspace", 2),
    ],
    [
      key("Tab", 1.5), key("Q"), key("W"), key("E"), key("R"), key("T"), key("Y"),
      key("U"), key("I"), key("O"), key("P"), key("["), key("]"), key("\\", 1.5),
    ],
    [
      key("Caps", 1.75, "Caps Lock"), key("A"), key("S"), key("D"), key("F"),
      key("G"), key("H"), key("J"), key("K"), key("L"), key(";"), key("'"),
      key("Enter", 2.25),
    ],
    [
      key("Shift", 2.25), key("Z"), key("X"), key("C"), key("V"), key("B"),
      key("N"), key("M"), key(","), key("."), key("/"), key("Shift", 2.75),
    ],
    [
      key("Ctrl", 1.25), key("Win", 1.25), key("Alt", 1.25),
      key("Space", 7.5), key("Alt", 1.25), key("Ctrl", 2.5),
    ],
  ],

  mac: [
    [
      key("`"), key("1"), key("2"), key("3"), key("4"), key("5"), key("6"),
      key("7"), key("8"), key("9"), key("0"), key("-"), key("="), key("Delete", 2),
    ],
    [
      key("Tab", 1.5), key("Q"), key("W"), key("E"), key("R"), key("T"), key("Y"),
      key("U"), key("I"), key("O"), key("P"), key("["), key("]"), key("\\", 1.5),
    ],
    [
      key("Caps", 1.75, "Caps Lock"), key("A"), key("S"), key("D"), key("F"),
      key("G"), key("H"), key("J"), key("K"), key("L"), key(";"), key("'"),
      key("Return", 2.25),
    ],
    [
      key("Shift", 2.25), key("Z"), key("X"), key("C"), key("V"), key("B"),
      key("N"), key("M"), key(","), key("."), key("/"), key("Shift", 2.75),
    ],
    [
      key("Fn", 1), key("Control", 1.5), key("Option", 1.5),
      key("Command", 1.75), key("Space", 5.75),
      key("Command", 1.75), key("Option", 1.75),
    ],
  ],
};

export default function TypingTestKeyboard({
  isFullscreen,
  keyboardType = "mac",
}) {
  const [pressedKeys, setPressedKeys] = useState({});

  const keyboardLayout = layouts[keyboardType] ?? layouts.windows;

  const keyMapping = {
    Backquote: "`",
    Digit1: "1",
    Digit2: "2",
    Digit3: "3",
    Digit4: "4",
    Digit5: "5",
    Digit6: "6",
    Digit7: "7",
    Digit8: "8",
    Digit9: "9",
    Digit0: "0",
    Minus: "-",
    Equal: "=",
    Backspace: keyboardType === "mac" ? "Delete" : "Backspace",

    Tab: "Tab",
    KeyQ: "Q",
    KeyW: "W",
    KeyE: "E",
    KeyR: "R",
    KeyT: "T",
    KeyY: "Y",
    KeyU: "U",
    KeyI: "I",
    KeyO: "O",
    KeyP: "P",
    BracketLeft: "[",
    BracketRight: "]",
    Backslash: "\\",

    CapsLock: "Caps",
    KeyA: "A",
    KeyS: "S",
    KeyD: "D",
    KeyF: "F",
    KeyG: "G",
    KeyH: "H",
    KeyJ: "J",
    KeyK: "K",
    KeyL: "L",
    Semicolon: ";",
    Quote: "'",
    Enter: keyboardType === "mac" ? "Return" : "Enter",

    ShiftLeft: "Shift",
    ShiftRight: "Shift",

    KeyZ: "Z",
    KeyX: "X",
    KeyC: "C",
    KeyV: "V",
    KeyB: "B",
    KeyN: "N",
    KeyM: "M",
    Comma: ",",
    Period: ".",
    Slash: "/",

    ControlLeft: keyboardType === "mac" ? "Control" : "Ctrl",
    ControlRight: keyboardType === "mac" ? "Control" : "Ctrl",
    AltLeft: keyboardType === "mac" ? "Option" : "Alt",
    AltRight: keyboardType === "mac" ? "Option" : "Alt",
    MetaLeft: keyboardType === "mac" ? "Command" : "Win",
    MetaRight: keyboardType === "mac" ? "Command" : "Win",

    Space: "Space",
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      const pressedKey = keyMapping[event.code];

      if (
        event.code === "Space" ||
        event.code === "Tab" ||
        event.code === "AltLeft" ||
        event.code === "AltRight"
      ) {
        event.preventDefault();
      }

      if (pressedKey) {
        setPressedKeys((prev) => ({
          ...prev,
          [pressedKey]: true,
        }));
      }
    };

    const handleKeyUp = (event) => {
      const pressedKey = keyMapping[event.code];

      if (pressedKey) {
        setPressedKeys((prev) => ({
          ...prev,
          [pressedKey]: false,
        }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [keyboardType]);

  if (isFullscreen) return null;

  return (
    <div className="mx-auto mb-8 w-full max-w-[900px] px-3">
      <div
        className="
          rounded-[28px]
          border border-white/10
          bg-gradient-to-b from-[#252A31] to-[#171A1F]
          p-3 sm:p-4
          shadow-[0_24px_70px_rgba(0,0,0,0.6)]
        "
      >
        <div className="flex flex-col gap-1.5 sm:gap-2">
          {keyboardLayout.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="grid gap-1.5 sm:gap-2"
              style={{
                gridTemplateColumns: `repeat(${COLS * 4}, minmax(0, 1fr))`,
              }}
            >
              {row.map((item, keyIndex) => {
                const isPressed = pressedKeys[item.label];

                return (
                  <div
                    key={`${rowIndex}-${keyIndex}-${item.label}`}
                    style={{
                      gridColumn: `span ${Math.round(item.span * 4)} / span ${Math.round(
                        item.span * 4
                      )}`,
                    }}
                    className={`
                      h-10 sm:h-12
                      rounded-[9px] sm:rounded-[11px]
                      flex items-center justify-center
                      border
                      select-none
                      overflow-hidden

                      ${
                        isPressed
                          ? `
                            border-[#ffb347]
                            bg-[#ff9500]
                            text-black
                            translate-y-[2px]
                            scale-[0.975]
                            shadow-[inset_0_3px_8px_rgba(0,0,0,0.38),0_0_22px_rgba(255,149,0,0.55)]
                          `
                          : `
                            border-white/10
                            bg-gradient-to-b from-[#444B55] to-[#252A31]
                            text-[#F5F5F7]
                            shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_4px_8px_rgba(0,0,0,0.38)]
                          `
                      }

                      transition-all duration-75 ease-out
                    `}
                  >
                    {item.label === "Space" ? (
                      <div className="h-[4px] w-20 sm:w-32 rounded-full bg-white/25" />
                    ) : (
                      <span
                        className="
                          truncate px-1
                          text-[9px] sm:text-[11px]
                          font-semibold
                          tracking-wide
                        "
                      >
                        {item.display}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}