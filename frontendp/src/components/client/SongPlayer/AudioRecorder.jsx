import React, { useRef, useState } from "react";
import {
  FaMicrophone,
  FaPause,
  FaStop,
  FaSave,
  FaRedo,
  FaSpinner,
} from "react-icons/fa";
import ClientService from "../ClientService";
import StartRecordingModal from "./StartRecordingModal";

const AudioRecorder = ({ songId, audioRef }) => {
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const [recordingState, setRecordingState] = useState("idle");
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [showModal, setShowModal] = useState(false);

  // ---------- INTERNAL HELPERS ----------
  const resetRecording = () => {
    setRecordingState("idle");
    setAudioBlob(null);
    setAudioURL(null);
    setSuccess(false);
  };

  const startMediaRecorder = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

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
    };

    recorder.start();
    setRecordingState("recording");
  };

  // ---------- USER ACTIONS ----------
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
  };

  const saveRecording = async () => {
    if (!audioBlob || uploading) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("song", songId);
      formData.append("audio_file", audioBlob);
      await ClientService.uploadRecording(formData);
      setSuccess(true);
    } catch {
      alert("Failed to upload recording");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {/* START MODAL */}
      {showModal && (
        <StartRecordingModal
          currentTime={audioRef.current?.currentTime || 0}
          onChoose={handleStartChoice}
          onClose={() => setShowModal(false)}
        />
      )}

      <div className="mt-8 p-6 rounded-2xl bg-gray-900/40 border border-purple-400/20 shadow-lg">
        <h3 className="text-lg font-semibold text-purple-300 mb-4">
          🎤 Recording
        </h3>

        <div className="flex gap-4 flex-wrap">
          {recordingState === "idle" && (
            <button
              onClick={handleRecordClick}
              className="rec-btn bg-red-600 hover:bg-red-500"
            >
              <FaMicrophone /> Record
            </button>
          )}

          {recordingState === "recording" && (
            <button
              onClick={pauseRecording}
              className="rec-btn bg-yellow-500 hover:bg-yellow-400"
            >
              <FaPause /> Pause
            </button>
          )}

          {recordingState === "paused" && (
            <button
              onClick={resumeRecording}
              className="rec-btn bg-green-600 hover:bg-green-500"
            >
              ▶ Resume
            </button>
          )}

          {(recordingState === "recording" || recordingState === "paused") && (
            <button
              onClick={stopRecording}
              className="rec-btn bg-gray-700 hover:bg-gray-600"
            >
              <FaStop /> Stop
            </button>
          )}

          {recordingState === "stopped" && (
            <>
              <button
                onClick={saveRecording}
                disabled={uploading}
                className={`rec-btn ${
                  uploading
                    ? "bg-purple-400 cursor-not-allowed"
                    : "bg-purple-600 hover:bg-purple-500"
                }`}
              >
                {uploading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaSave />
                )}
                Save
              </button>

              <button
                onClick={resetRecording}
                className="rec-btn bg-gray-800 hover:bg-gray-700"
              >
                <FaRedo /> New Recording
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
          <p className="mt-3 text-green-400 font-semibold">
            ✅ Recording saved successfully
          </p>
        )}
      </div>
    </>
  );
};

export default AudioRecorder;
