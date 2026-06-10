import { useEffect, useState } from "react";

export default function Loader() {
  const text = "Loading...";
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let index = 0;

    const interval = setInterval(() => {
      if (index <= text.length) {
        setDisplayText(text.slice(0, index));
        index++;
      } else {
        index = 0;
      }
    }, 120);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <span className="text-2xl font-semibold font-mono text-white">
        {displayText}
        <span className="animate-pulse">|</span>
      </span>
    </div>
  );
}