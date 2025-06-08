/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';

export default function TypingTestKeyboard({isFullscreen}) {
  const [pressedKeys, setPressedKeys] = useState({});

  // Simplified keyboard layout focused on typing test needs
  const keyboardLayout = [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
    ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
    ['Caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', '\'', 'Enter'],
    ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'Shift'],
    ['Ctrl', 'Alt', 'Space', 'Alt', 'Ctrl']
  ];

  // Key mapping for physical keypresses
  const keyMapping = {
    'Backquote': '`', 'Digit1': '1', 'Digit2': '2', 'Digit3': '3', 'Digit4': '4', 'Digit5': '5',
    'Digit6': '6', 'Digit7': '7', 'Digit8': '8', 'Digit9': '9', 'Digit0': '0',
    'Minus': '-', 'Equal': '=', 'Backspace': 'Backspace',
    'Tab': 'Tab', 'KeyQ': 'Q', 'KeyW': 'W', 'KeyE': 'E', 'KeyR': 'R', 'KeyT': 'T',
    'KeyY': 'Y', 'KeyU': 'U', 'KeyI': 'I', 'KeyO': 'O', 'KeyP': 'P',
    'BracketLeft': '[', 'BracketRight': ']', 'Backslash': '\\',
    'CapsLock': 'Caps', 'KeyA': 'A', 'KeyS': 'S', 'KeyD': 'D', 'KeyF': 'F', 'KeyG': 'G',
    'KeyH': 'H', 'KeyJ': 'J', 'KeyK': 'K', 'KeyL': 'L', 'Semicolon': ';', 'Quote': '\'', 'Enter': 'Enter',
    'ShiftLeft': 'Shift', 'ShiftRight': 'Shift', 'KeyZ': 'Z', 'KeyX': 'X', 'KeyC': 'C', 'KeyV': 'V', 'KeyB': 'B',
    'KeyN': 'N', 'KeyM': 'M', 'Comma': ',', 'Period': '.', 'Slash': '/',
    'ControlLeft': 'Ctrl', 'ControlRight': 'Ctrl', 'AltLeft': 'Alt', 'AltRight': 'Alt',
    'Space': 'Space'
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = keyMapping[event.code];

      // To prevent the default behaviour of scrolling in browsers
      if (event.code === 'Space') {
        event.preventDefault();
      }

      // To prevent the default behaviour of Alt key
      if (event.code === 'AltLeft' || event.code == 'AltRight') {
        event.preventDefault();
      }
      
      // Also prevent default behavior for Tab key
      if (event.code === 'Tab') {
        event.preventDefault();
      }
      if (key) {
        setPressedKeys(prev => ({ ...prev, [key]: true }));
      }
    };

    const handleKeyUp = (event) => {
      const key = keyMapping[event.code];
      if (key) {
        setPressedKeys(prev => ({ ...prev, [key]: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  // Function to determine key width and ensure balanced layout
  const getKeyWidth = (key, rowIndex) => {
    switch (key) {
      case 'Space':
        return 'w-64';
      case 'Backspace':
        return 'w-16';
      case 'Enter':
        return 'w-16';
      case 'Shift':
        return rowIndex === 3 && (key === 'Shift') ? 'w-16' : 'w-16';
      case 'Caps':
      case 'Tab':
        return 'w-14';
      case 'Ctrl':
      case 'Alt':
        return 'w-12';
      default:
        return 'w-10';
    }
  };

  return isFullscreen === true ? (
    <></>
  ) :  (
    
    <div className="bg-[#181C22] font-mono p-6 rounded-lg shadow-xl mx-auto w-[700px] mb-[30px] ">
      <div className="flex flex-col gap-1 mx-auto">
        {keyboardLayout.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1 justify-center">
            {row.map((key, keyIndex) => {
              // Determine if this is the first or last key in the row for left/right Shift
              const isLeftShift = key === 'Shift' && keyIndex === 0;
              const isRightShift = key === 'Shift' && keyIndex === row.length - 1;
              
              return (
                <div
                  key={`${rowIndex}-${keyIndex}`}
                  className={`
                    ${getKeyWidth(key, rowIndex)} h-10 rounded flex items-center justify-center 
                    ${pressedKeys[key] ? 'bg-[orange] text-gray-900' : 'bg-gray-700 text-white'}
                    transition-colors duration-100 ease-in-out shadow-md
                  `}
                >
                  <span className="text-xs font-medium">
                    {key}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}