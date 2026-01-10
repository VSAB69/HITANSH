import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaForward,
  FaBackward,
} from "react-icons/fa";
import { appApiClient } from "../../../api/endpoints";

const AudioPlayer = ({ audioKey, audioRef }) => {
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume] = useState(1);
  const [isMuted, setMuted] = useState(false);

  const progressRef = useRef(null);
  const refreshTimer = useRef(null);

  // ─────────────────────────────
  // Fetch + auto-refresh signed URL (memoized)
  // ─────────────────────────────
  const fetchSignedUrl = useCallback(async () => {
    if (!audioKey) return;

    const res = await appApiClient.get(
      `/api/media/secure/?key=${encodeURIComponent(audioKey)}`
    );

    setAudioUrl(res.data.url);

    // Refresh at 80% of expiry
    const refreshInMs = res.data.expires_in * 0.8 * 1000;
    clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(fetchSignedUrl, refreshInMs);
  }, [audioKey]);

  useEffect(() => {
    fetchSignedUrl();

    return () => {
      clearTimeout(refreshTimer.current);
    };
  }, [fetchSignedUrl]);

  // ─────────────────────────────
  // Apply new signed URL safely
  // ─────────────────────────────
  useEffect(() => {
    if (!audioUrl || !audioRef.current) return;

    const audio = audioRef.current;
    const wasPlaying = !audio.paused;
    const time = audio.currentTime;

    audio.src = audioUrl;
    audio.load();

    if (wasPlaying) {
      audio.currentTime = time;
      audio.play();
    }
  }, [audioUrl, audioRef]);

  // ─────────────────────────────
  // Audio event sync
  // ─────────────────────────────
  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    const onLoaded = () => setDuration(audio.duration || 0);
    const onTime = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
    };
  }, [audioRef]);

  // ─────────────────────────────
  // Controls
  // ─────────────────────────────
  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      await audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setMuted(!isMuted);
  };

  const skip = (seconds) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime += seconds;
  };

  const handleSeek = (e) => {
    if (!audioRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = duration * percent;
  };

  const formatTime = (sec) => {
    if (isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="relative backdrop-blur-xl bg-gray-900/40 border border-purple-500/20 rounded-2xl p-6 shadow-xl shadow-purple-900/40">
      <div className="flex items-center justify-between">
        <button onClick={() => skip(-10)} className="control-btn">
          <FaBackward />
        </button>

        <button
          onClick={togglePlay}
          className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center"
        >
          {isPlaying ? <FaPause /> : <FaPlay className="ml-1" />}
        </button>

        <button onClick={() => skip(10)} className="control-btn">
          <FaForward />
        </button>

        <button onClick={toggleMute} className="control-btn">
          {isMuted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
        </button>
      </div>

      <div className="mt-4">
        <div
          ref={progressRef}
          onClick={handleSeek}
          className="h-3 bg-gray-700 rounded cursor-pointer"
        >
          <div
            className="h-full bg-purple-400"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between text-sm mt-2 text-purple-300">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
