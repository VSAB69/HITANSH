import React from "react";

const LyricsLine = ({ text, isActive }) => {
  return (
    <p
      className={`text-center text-xl transition-all duration-500 ease-out
        ${isActive
          ? "text-crimson-pink font-bold scale-105 drop-shadow-[0_0_12px_rgba(233,69,96,0.6)]"
          : "text-muted-foreground/60"
        }`}
    >
      {text}
    </p>
  );
};

export default LyricsLine;
