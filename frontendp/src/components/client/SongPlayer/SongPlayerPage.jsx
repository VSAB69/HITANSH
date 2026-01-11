import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Music, Mic, ChevronDown, Clock, Play, ListMusic, Pause, Square, Save, RotateCcw, Loader2, Sliders, SkipBack, SkipForward, Volume2 } from "lucide-react";
import ClientService from "../ClientService";
import LyricsDisplay from "./LyricsDisplay";
import MixingModal from "../Mixing/MixingModal";
import { appApiClient } from "../../../api/endpoints";

// Format time helper
const formatTime = (seconds) => {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const SongPlayerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [song, setSong] = useState(null);
  const [coverUrl, setCoverUrl] = useState(null);
  const [karaokeUrl, setKaraokeUrl] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);

  // Tab state for right panel
  const [activeTab, setActiveTab] = useState("lyrics"); // "lyrics" or "queue"

  // Recording dropdown state
  const [showRecordingDropdown, setShowRecordingDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Recording state (moved from AudioRecorder)
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [recordingState, setRecordingState] = useState("idle");
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [recordingSaved, setRecordingSaved] = useState(false);
  const [showMixingModal, setShowMixingModal] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Single source of truth for audio
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    ClientService.getSongById(id).then((res) => {
      setSong(res.data);
    });
  }, [id]);

  useEffect(() => {
    if (!song?.cover_key) return;

    appApiClient
      .get(`/api/media/secure/?key=${encodeURIComponent(song.cover_key)}`)
      .then((res) => setCoverUrl(res.data.url));
  }, [song?.cover_key]);

  // Fetch karaoke audio URL
  useEffect(() => {
    if (!song?.audio_key) return;

    appApiClient
      .get(`/api/media/secure/?key=${encodeURIComponent(song.audio_key)}`)
      .then((res) => {
        setKaraokeUrl(res.data.url);
        if (audioRef.current) {
          audioRef.current.src = res.data.url;
        }
      });
  }, [song?.audio_key]);

  // Track current time and duration
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowRecordingDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ═══════════════════════════════════════════════════════════
  // PLAYBACK CONTROLS
  // ═══════════════════════════════════════════════════════════
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleSeek = (e) => {
    if (!progressRef.current || !audioRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = percent * duration;
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const skipBack = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // RECORDING FUNCTIONS
  // ═══════════════════════════════════════════════════════════
  const cleanupStream = () => {
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;
  };

  const resetRecording = () => {
    cleanupStream();
    setRecordingState("idle");
    setAudioBlob(null);
    setAudioURL(null);
    setRecordingSaved(false);
    setRecordingDuration(0);
  };

  const startMediaRecorder = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaStreamRef.current = stream;

    const recorder = new MediaRecorder(stream, {
      mimeType: "audio/webm",
    });

    mediaRecorderRef.current = recorder;
    audioChunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });

      setAudioBlob(blob);
      setAudioURL(URL.createObjectURL(blob));
      setRecordingState("stopped");

      if (audioRef.current) {
        setRecordingDuration(audioRef.current.currentTime);
      }

      cleanupStream();
    };

    recorder.start();
    setRecordingState("recording");
  };

  const handleStartRecording = async (fromBeginning) => {
    setShowRecordingDropdown(false);

    if (fromBeginning) {
      audioRef.current.currentTime = 0;
    }

    await audioRef.current.play();
    await startMediaRecorder();
  };

  const pauseRecording = () => {
    mediaRecorderRef.current?.pause();
    audioRef.current.pause();
    setRecordingState("paused");
  };

  const resumeRecording = async () => {
    mediaRecorderRef.current?.resume();
    await audioRef.current.play();
    setRecordingState("recording");
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    audioRef.current?.pause();
  };

  const saveRecording = async () => {
    if (!audioBlob || uploading) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("song", song.id);
      formData.append("audio_file", audioBlob, `recording-${Date.now()}.webm`);

      await ClientService.uploadRecording(formData);
      setRecordingSaved(true);
    } catch (err) {
      alert("Failed to upload recording");
    } finally {
      setUploading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  if (!song) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-night">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-crimson-pink/20 flex items-center justify-center animate-pulse">
            <Music className="w-8 h-8 text-crimson-pink" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="h-screen w-full flex flex-col bg-navy-night overflow-hidden">
      {/* Single audio element */}
      <audio ref={audioRef} preload="metadata" crossOrigin="anonymous" />

      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-crimson-pink/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-royal-blue/10 rounded-full blur-3xl" />
      </div>

      {/* Mixing Modal */}
      {showMixingModal && (
        <MixingModal
          isOpen={true}
          onClose={() => setShowMixingModal(false)}
          recordingUrl={audioURL}
          karaokeUrl={karaokeUrl}
          songTitle={song.title}
          recordingDuration={recordingDuration || song.duration}
        />
      )}

      {/* Header with Back button and Recording Controls */}
      <div className="relative z-20 p-4 flex items-center gap-3">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full glass-effect hover:bg-secondary/30 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Recording Controls */}
        {recordingState === "idle" && (
          <div className="relative" ref={dropdownRef}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowRecordingDropdown(!showRecordingDropdown)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg glass-effect hover:bg-crimson-pink/20 transition-all border border-crimson-pink/30"
            >
              <Mic className="w-4 h-4 text-crimson-pink" />
              <span className="text-sm font-medium text-foreground">Start Recording</span>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showRecordingDropdown ? "rotate-180" : ""}`} />
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showRecordingDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-2 w-64 dropdown-opaque shadow-glass z-[100] rounded-xl overflow-hidden"
                >
                  <div className="p-2">
                    <p className="text-xs text-muted-foreground px-3 py-2 uppercase tracking-wide">
                      Choose start position
                    </p>
                    <button
                      onClick={() => handleStartRecording(true)}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-crimson-pink/20 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-crimson-pink" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">From beginning (0:00)</p>
                        <p className="text-xs text-muted-foreground">Start recording from the start</p>
                      </div>
                    </button>
                    <button
                      onClick={() => handleStartRecording(false)}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-royal-blue/30 flex items-center justify-center">
                        <Play className="w-4 h-4 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">From current timestamp</p>
                        <p className="text-xs text-muted-foreground">Start at {formatTime(currentTime)}</p>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Recording In Progress Controls */}
        {recordingState === "recording" && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/20 border border-red-500/30">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-medium text-red-400">Recording...</span>
            </div>
            <button
              onClick={pauseRecording}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-medium transition-colors"
            >
              <Pause className="w-4 h-4" /> Pause
            </button>
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-sm font-medium transition-colors"
            >
              <Square className="w-4 h-4" /> Stop
            </button>
          </div>
        )}

        {recordingState === "paused" && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
              <Pause className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-400">Paused</span>
            </div>
            <button
              onClick={resumeRecording}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-medium transition-colors"
            >
              Resume
            </button>
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-sm font-medium transition-colors"
            >
              <Square className="w-4 h-4" /> Stop
            </button>
          </div>
        )}

        {recordingState === "stopped" && (
          <div className="flex items-center gap-2">
            <button
              onClick={saveRecording}
              disabled={uploading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${uploading ? "bg-secondary/50 cursor-not-allowed" : "bg-crimson-pink hover:bg-crimson-pink/80"}`}
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
            <button
              onClick={() => setShowMixingModal(true)}
              disabled={!karaokeUrl}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-royal-blue hover:bg-royal-blue/80 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sliders className="w-4 h-4" />
              Mix
            </button>
            <button
              onClick={resetRecording}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-sm font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> New
            </button>
            {recordingSaved && (
              <span className="text-green-400 text-sm font-medium">Saved!</span>
            )}
          </div>
        )}
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row gap-8 px-6 pb-24 overflow-hidden min-h-0">
        {/* Left Column: Album */}
        <div className="flex flex-col items-center lg:w-1/2">
          {/* Album Cover with glow border */}
          <div className="card-glass p-4 rounded-2xl" style={{ boxShadow: '0 0 40px rgba(15, 52, 96, 0.4)' }}>
            {coverUrl ? (
              <img
                src={coverUrl}
                crossOrigin="anonymous"
                className="w-64 h-64 rounded-xl object-cover"
                alt="cover"
              />
            ) : (
              <div className="w-64 h-64 rounded-xl bg-secondary/30 flex items-center justify-center">
                <Music className="w-16 h-16 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Song Title and Artist */}
          <h1 className="mt-6 text-2xl font-bold text-foreground text-center">
            {song.title}
          </h1>
          <p className="text-muted-foreground text-center">
            {song.artist?.name || (typeof song.artist === 'string' ? song.artist : 'Unknown Artist')}
          </p>

          {/* Recording Playback (if stopped) */}
          {audioURL && recordingState === "stopped" && (
            <div className="w-full max-w-md mt-4 card-glass p-4 rounded-xl">
              <p className="text-xs text-muted-foreground mb-2">Your Recording:</p>
              <audio controls src={audioURL} className="w-full" />
            </div>
          )}
        </div>

        {/* Right Column: Tabs (Lyrics / Queue) */}
        <div className="lg:w-1/2 flex flex-col min-h-0">
          {/* Tab Buttons */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab("lyrics")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === "lyrics"
                ? "bg-crimson-pink text-white"
                : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50"
                }`}
            >
              <Music className="w-4 h-4" />
              Lyrics
            </button>
            <button
              onClick={() => setActiveTab("queue")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === "queue"
                ? "bg-crimson-pink text-white"
                : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50"
                }`}
            >
              <ListMusic className="w-4 h-4" />
              Queue
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden min-h-0">
            {activeTab === "lyrics" && (
              <LyricsDisplay lyrics={song.lyrics} audioRef={audioRef} />
            )}
            {activeTab === "queue" && (
              <div className="p-6 h-full flex flex-col items-center justify-center text-muted-foreground">
                <ListMusic className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-sm">Queue feature coming soon</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Player Ribbon */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-navy-night/95 backdrop-blur-lg border-t border-border/30">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Progress Bar */}
          <div
            ref={progressRef}
            onClick={handleSeek}
            className="h-1 bg-secondary/50 rounded-full cursor-pointer overflow-hidden mb-3 -mt-1"
          >
            <div
              className="h-full bg-crimson-pink rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            {/* Song Info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {coverUrl ? (
                <img src={coverUrl} className="w-12 h-12 rounded-lg object-cover" alt="cover" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-secondary/30 flex items-center justify-center">
                  <Music className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate">{song.title}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {song.artist?.name || 'Unknown Artist'}
                </p>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-4">
              <button onClick={skipBack} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-crimson-pink hover:bg-crimson-pink/80 flex items-center justify-center transition-colors"
              >
                {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
              </button>
              <button onClick={skipForward} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Time & Volume */}
            <div className="flex items-center gap-4 flex-1 justify-end">
              <span className="text-sm text-muted-foreground min-w-[80px] text-right">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              <div className="hidden sm:flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-muted-foreground" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-secondary/50 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongPlayerPage;
