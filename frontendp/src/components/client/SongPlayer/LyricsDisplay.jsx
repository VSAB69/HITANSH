import React, { useEffect, useState, useRef, useCallback } from "react";
import LyricsLine from "./LyricsLine";

const LyricsDisplay = ({ lyrics, audioRef }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const lineRefs = useRef([]);

  // Auto-scroll to active lyric
  const scrollToActiveLine = useCallback((index) => {
    if (!containerRef.current || !lineRefs.current[index]) return;

    const container = containerRef.current;
    const activeLine = lineRefs.current[index];

    // Calculate position to center the active line
    const containerHeight = container.clientHeight;
    const lineTop = activeLine.offsetTop;
    const lineHeight = activeLine.clientHeight;

    // Scroll to position the active line in the upper third of the container
    const scrollPosition = lineTop - containerHeight / 3 + lineHeight / 2;

    container.scrollTo({
      top: Math.max(0, scrollPosition),
      behavior: "smooth",
    });
  }, []);

  // Detect active lyric and auto-scroll
  useEffect(() => {
    const interval = setInterval(() => {
      if (!audioRef.current || !lyrics || lyrics.length === 0) return;

      const time = audioRef.current.currentTime;
      let newIndex = 0;

      for (let i = 0; i < lyrics.length; i++) {
        if (time < lyrics[i].timestamp) {
          newIndex = i - 1 >= 0 ? i - 1 : 0;
          break;
        }
        // If we're past all timestamps, show the last line
        if (i === lyrics.length - 1) {
          newIndex = i;
        }
      }

      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
        scrollToActiveLine(newIndex);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [lyrics, audioRef, currentIndex, scrollToActiveLine]);

  // If no lyrics, show placeholder
  if (!lyrics || lyrics.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p className="text-lg">No lyrics available</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto overflow-x-hidden scrollbar-hide py-12"
    >
      {/* Lyrics Lines */}
      <div className="space-y-6 px-4">
        {lyrics.map((line, index) => (
          <div
            key={index}
            ref={(el) => (lineRefs.current[index] = el)}
          >
            <LyricsLine
              index={index}
              text={line.text}
              isActive={index === currentIndex}
            />
          </div>
        ))}
      </div>

      {/* Spacer at bottom for scrolling past last lyric */}
      <div className="h-64" />
    </div>
  );
};

export default LyricsDisplay;
