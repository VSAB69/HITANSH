import React, { useRef, useState, forwardRef, useImperativeHandle } from "react";
import { Mic, Pause, Square, Save, RotateCcw, Loader2, Sliders } from "lucide-react";
import ClientService from "../ClientService";
import StartRecordingModal from "./StartRecordingModal";
import MixingModal from "../Mixing/MixingModal";

const AudioRecorder = forwardRef(({
  songId,
  audioRef,
  karaokeUrl,
  songTitle,
  songDuration,
}, ref) => {
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksRef = useRef([]);

  const [recordingState, setRecordingState] = useState("idle");
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showMixingModal, setShowMixingModal] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Expose triggerRecord method for parent component
  useImperativeHandle(ref, () => ({
    triggerRecord: (choice) => {
      handleStartChoice(choice);
    }
  }));

  // Helpers
  const cleanupStream = () => {
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;
  };

  const resetRecording = () => {
    cleanupStream();
    setRecordingState("idle");
    setAudioBlob(null);
    setAudioURL(null);
    setSuccess(false);
    setRecordingDuration(0);
  };

  // Recording
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

      // Calculate recording duration from audio element position
      if (audioRef.current) {
        setRecordingDuration(audioRef.current.currentTime);
      }

      cleanupStream();
    };

    recorder.start();
    setRecordingState("recording");
  };

  // User Actions
  const handleRecordClick = () => {
    if (!audioRef.current) return;
    setShowModal(true);
  };

  const handleStartChoice = async (choice) => {
    setShowModal(false);

    if (choice === "start") {
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
      formData.append("song", songId);
      formData.append("audio_file", audioBlob, `recording-${Date.now()}.webm`);

      await ClientService.uploadRecording(formData);
      setSuccess(true);
    } catch (err) {
      alert("Failed to upload recording");
    } finally {
      setUploading(false);
    }
  };

  // UI
  return (
    <>
      {showModal && (
        <StartRecordingModal
          currentTime={audioRef.current?.currentTime || 0}
          onChoose={handleStartChoice}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Mixing Modal - only render when open to prevent AbortError */}
      {showMixingModal && (
        <MixingModal
          isOpen={true}
          onClose={() => setShowMixingModal(false)}
          recordingUrl={audioURL}
          karaokeUrl={karaokeUrl}
          songTitle={songTitle}
          recordingDuration={recordingDuration || songDuration}
        />
      )}

      <div className="card-glass p-4 rounded-xl">
        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <Mic className="w-4 h-4" />
          Recording
        </h3>

        <div className="flex gap-2 flex-wrap">
          {recordingState === "idle" && (
            <button
              onClick={handleRecordClick}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-crimson-pink hover:bg-crimson-pink/80 text-white text-sm font-medium transition-colors"
            >
              <Mic className="w-4 h-4" /> Record
            </button>
          )}

          {recordingState === "recording" && (
            <button
              onClick={pauseRecording}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-medium transition-colors"
            >
              <Pause className="w-4 h-4" /> Pause
            </button>
          )}

          {recordingState === "paused" && (
            <button
              onClick={resumeRecording}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-medium transition-colors"
            >
              Resume
            </button>
          )}

          {(recordingState === "recording" || recordingState === "paused") && (
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-sm font-medium transition-colors"
            >
              <Square className="w-4 h-4" /> Stop
            </button>
          )}

          {recordingState === "stopped" && (
            <>
              <button
                onClick={saveRecording}
                disabled={uploading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${uploading
                    ? "bg-secondary/50 cursor-not-allowed"
                    : "bg-crimson-pink hover:bg-crimson-pink/80"
                  }`}
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save
              </button>

              {/* Mix Button */}
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
            </>
          )}
        </div>

        {audioURL && (
          <div className="mt-4">
            <audio controls src={audioURL} className="w-full" />
          </div>
        )}

        {success && (
          <p className="mt-3 text-green-400 text-sm font-medium">
            Recording saved successfully
          </p>
        )}
      </div>
    </>
  );
});

AudioRecorder.displayName = "AudioRecorder";

export default AudioRecorder;
