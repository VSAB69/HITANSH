import React from "react";

const LyricsLine = ({ text, isActive, isPast }) => {
  return (
    <p
      className={`text-center leading-relaxed transition-all duration-300 ease-out
        ${isActive
          ? "text-xl md:text-2xl font-bold text-crimson-pink drop-shadow-[0_0_20px_rgba(233,69,96,0.5)]"
          : isPast
            ? "text-base md:text-lg text-muted-foreground/50"
            : "text-base md:text-lg text-muted-foreground/70"
        }`}
    >
      {text}
    </p>
  );
};

export default LyricsLine;
