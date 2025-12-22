import React, { useState, useEffect, useRef } from "react";
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaForward,
  FaBackward,
} from "react-icons/fa";

import AudioRecorder from "./AudioRecorder";

const AudioPlayer = ({ audioUrl, audioRef }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const progressRef = useRef(null);

  // Setup duration
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onloadedmetadata = () => {
        setDuration(audioRef.current.duration);
      };
    }
  }, []);

  // Sync progress
  useEffect(() => {
    const interval = setInterval(() => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
        setProgress(
          (audioRef.current.currentTime / audioRef.current.duration) * 100
        );
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    // 🔥 IMPORTANT: Resume audio context if suspended
    const audioContext = window.AudioContext || window.webkitAudioContext;

    if (audioContext) {
      const ctx = new audioContext();
      if (ctx.state === "suspended") {
        await ctx.resume();
      }
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      await audioRef.current.play(); // await is IMPORTANT
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setMuted(!isMuted);
  };

  const formatTime = (sec) => {
    if (isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleSeek = (e) => {
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percent = clickX / width;
    const newTime = duration * percent;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skip = (seconds) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime += seconds;
  };

  return (
    <div className="relative backdrop-blur-xl bg-gray-900/40 border border-purple-500/20 rounded-2xl p-6 shadow-xl shadow-purple-900/40">
      {/* Audio Element */}
      <audio ref={audioRef}>
        <source src={audioUrl} type="audio/mpeg" />
      </audio>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Backward 10s */}
        <button
          onClick={() => skip(-10)}
          className="control-btn hover:bg-purple-700"
        >
          <FaBackward size={20} />
        </button>

        {/* Play / Pause */}
        <button
          onClick={togglePlay}
          className="w-14 h-14 flex items-center justify-center rounded-full bg-purple-600 hover:bg-purple-500 transition transform hover:scale-110 shadow-lg shadow-purple-900/50 active:scale-95"
        >
          {isPlaying ? (
            <FaPause className="text-white text-2xl" />
          ) : (
            <FaPlay className="text-white text-2xl ml-1" />
          )}
        </button>

        {/* Forward 10s */}
        <button
          onClick={() => skip(10)}
          className="control-btn hover:bg-purple-700"
        >
          <FaForward size={20} />
        </button>

        {/* Volume */}
        <div className="relative">
          <button
            onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            className="control-btn hover:bg-purple-700 ml-2"
          >
            {isMuted || volume === 0 ? (
              <FaVolumeMute size={20} />
            ) : (
              <FaVolumeUp size={20} />
            )}
          </button>

          {/* Volume Slider Popup */}
          {showVolumeSlider && (
            <div className="absolute right-0 bottom-12 bg-gray-900/70 border border-purple-400/30 py-2 px-3 rounded-xl shadow-lg animate-fadeIn">
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={volume}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setVolume(v);
                  audioRef.current.volume = v;
                  setMuted(v === 0);
                }}
                className="accent-purple-400 w-28"
              />
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full mt-6">
        <div
          ref={progressRef}
          onClick={handleSeek}
          className="w-full bg-gray-700/40 h-3 rounded-full overflow-hidden cursor-pointer hover:h-4 transition-all"
        >
          <div
            className="bg-purple-400 h-full transition-all duration-150 ease-linear"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Time Display */}
        <div className="flex justify-between text-sm text-purple-300 mt-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
