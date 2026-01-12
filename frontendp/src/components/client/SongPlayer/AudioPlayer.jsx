import React, { useEffect, useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from "lucide-react";
import { appApiClient } from "../../../api/endpoints";

const AudioPlayer = ({ audioKey, audioRef }) => {
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setMuted] = useState(false);

  const progressRef = useRef(null);
  const refreshTimer = useRef(null);

  // Fetch + auto-refresh signed URL
  const fetchSignedUrl = async () => {
    if (!audioKey) return;

    const res = await appApiClient.get(
      `/api/media/secure/?key=${encodeURIComponent(audioKey)}`
    );

    setAudioUrl(res.data.url);

    // Refresh at 80% of expiry
    const refreshInMs = res.data.expires_in * 0.8 * 1000;
    clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(fetchSignedUrl, refreshInMs);
  };

  useEffect(() => {
    fetchSignedUrl();

    return () => {
      clearTimeout(refreshTimer.current);
    };
  }, [audioKey]);

  // Apply new signed URL safely
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
  }, [audioUrl]);

  // Audio event sync
  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    const onLoaded = () => setDuration(audio.duration || 0);
    const onTime = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };
    const onEnded = () => setIsPlaying(false);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, []);

  // Controls
  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      await audioRef.current.play();
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
    <div className="card-glass p-4 rounded-xl">
      {/* Controls */}
      <div className="flex items-center justify-center gap-6">
        <button
          onClick={() => skip(-10)}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <SkipBack className="w-5 h-5" />
        </button>

        <button
          onClick={togglePlay}
          className="w-12 h-12 rounded-full bg-crimson-pink hover:bg-crimson-pink/80 flex items-center justify-center text-white transition-colors"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>

        <button
          onClick={() => skip(10)}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <SkipForward className="w-5 h-5" />
        </button>

        <button
          onClick={toggleMute}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div
          ref={progressRef}
          onClick={handleSeek}
          className="h-2 bg-secondary/50 rounded-full cursor-pointer overflow-hidden"
        >
          <div
            className="h-full bg-crimson-pink rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between text-xs mt-2 text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
