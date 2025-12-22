import React, { useEffect, useState, useRef } from "react";
import LyricsLine from "./LyricsLine";

const LyricsDisplay = ({ lyrics, audioRef }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);

  // Detect active lyric (but do NOT scroll)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!audioRef.current) return;

      const time = audioRef.current.currentTime;

      for (let i = 0; i < lyrics.length; i++) {
        if (time < lyrics[i].timestamp) {
          const newIndex = i - 1 >= 0 ? i - 1 : 0;
          setCurrentIndex(newIndex);
          break;
        }
      }
    }, 200);

    return () => clearInterval(interval);
  }, [lyrics, audioRef]);

  return (
    <div
      ref={scrollRef}
      className="
        relative 
        h-72 
        overflow-y-scroll 
        overflow-x-hidden
        bg-gray-900/40 
        border border-purple-400/20 
        rounded-xl 
        p-6 
        shadow-inner 
        shadow-black/40

        scrollbar-hide
      "
    >
      {/* Fade effect top */}
      <div
        className="pointer-events-none absolute top-0 left-0 w-full h-16 
        bg-gradient-to-b from-gray-900/80 to-transparent"
      ></div>

      {/* Lyrics */}
      <div className="space-y-4 relative z-10">
        {lyrics.map((line, index) => (
          <LyricsLine
            key={index}
            index={index}
            text={line.text}
            isActive={index === currentIndex}
          />
        ))}
      </div>

      {/* Fade effect bottom */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 w-full h-16 
        bg-gradient-to-t from-gray-900/80 to-transparent"
      ></div>
    </div>
  );
};

export default LyricsDisplay;
