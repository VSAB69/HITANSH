import React from "react";

const LyricsLine = ({ text, isActive }) => {
  return (
    <p
      className={`text-center text-xl transition-all duration-300
        ${
          isActive
            ? "text-purple-300 font-extrabold scale-110 drop-shadow-[0_0_12px_rgba(168,85,247,0.9)]"
            : "text-gray-300 opacity-50"
        }`}
    >
      {text}
    </p>
  );
};

export default LyricsLine;
