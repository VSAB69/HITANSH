import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import LyricsLine from "./LyricsLine";

const LyricsDisplay = ({ lyrics, audioRef }) => {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const containerRef = useRef(null);
  const lineRefs = useRef([]);

  // Auto-scroll to center the active lyric line
  const scrollToActiveLine = useCallback((index) => {
    if (!containerRef.current || !lineRefs.current[index]) return;

    const activeLine = lineRefs.current[index];

    activeLine.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, []);

  // Detect active lyric and auto-scroll
  useEffect(() => {
    const checkLyricSync = () => {
      if (!audioRef.current || !lyrics || lyrics.length === 0) return;

      const time = audioRef.current.currentTime;
      let newIndex = -1;

      for (let i = 0; i < lyrics.length; i++) {
        if (time >= lyrics[i].timestamp) {
          newIndex = i;
        } else {
          break;
        }
      }

      if (newIndex !== currentIndex && newIndex >= 0) {
        setCurrentIndex(newIndex);
        scrollToActiveLine(newIndex);
      }
    };

    checkLyricSync();
    const interval = setInterval(checkLyricSync, 100);
    return () => clearInterval(interval);
  }, [lyrics, audioRef, currentIndex, scrollToActiveLine]);

  // Calculate distance from current line for parallax effect
  const getDistanceStyle = (index) => {
    if (currentIndex < 0) return { scale: 0.85, opacity: 0.5 };

    const distance = Math.abs(index - currentIndex);

    if (distance === 0) {
      return { scale: 1, opacity: 1 };
    } else if (distance === 1) {
      return { scale: 0.92, opacity: 0.65 };
    } else if (distance === 2) {
      return { scale: 0.85, opacity: 0.45 };
    } else {
      return { scale: 0.8, opacity: 0.3 };
    }
  };

  // If no lyrics, show placeholder
  if (!lyrics || lyrics.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p className="text-lg">No lyrics available</p>
      </div>
    );
  }

  // Parallax scrolling lyrics
  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto overflow-x-hidden scrollbar-hide scroll-smooth"
    >
      {/* Top spacer */}
      <div className="h-[35vh]" />

      {/* Lyrics Lines with parallax */}
      <div className="space-y-5 px-6">
        {lyrics.map((line, index) => {
          const style = getDistanceStyle(index);
          const isPast = index < currentIndex;
          const isActive = index === currentIndex;

          return (
            <motion.div
              key={index}
              ref={(el) => (lineRefs.current[index] = el)}
              animate={{
                scale: style.scale,
                opacity: style.opacity,
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="origin-center"
            >
              <LyricsLine
                text={line.text}
                isActive={isActive}
                isPast={isPast}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Bottom spacer */}
      <div className="h-[50vh]" />
    </div>
  );
};

export default LyricsDisplay;
