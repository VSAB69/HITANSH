import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Download, Sliders } from "lucide-react";
import { appApiClient } from "../../../api/endpoints";
import ClientService from "../ClientService";
import MixingModal from "../Mixing/MixingModal";

const RecordingDetails = ({ recording }) => {
  const [audioUrl, setAudioUrl] = useState(null);
  const [karaokeUrl, setKaraokeUrl] = useState(null);
  const [showMixingModal, setShowMixingModal] = useState(false);
  const refreshTimer = useRef(null);

  // ─────────────────────────────
  // Fetch + auto-refresh signed URL (MEMOIZED)
  // ─────────────────────────────
  const fetchSignedUrl = useCallback(async () => {
    if (!recording.audio_key) return;

    try {
      const res = await appApiClient.get(
        `/api/media/secure/?key=${encodeURIComponent(recording.audio_key)}`
      );

      setAudioUrl(res.data.url);

      // Refresh at 80% of expiry
      const refreshInMs = res.data.expires_in * 0.8 * 1000;
      clearTimeout(refreshTimer.current);
      refreshTimer.current = setTimeout(fetchSignedUrl, refreshInMs);
    } catch (err) {
      console.error("Failed to load recording", err);
    }
  }, [recording.audio_key]);

  useEffect(() => {
    fetchSignedUrl();

    return () => {
      clearTimeout(refreshTimer.current);
    };
  }, [fetchSignedUrl]);

  // ─────────────────────────────
  // Fetch karaoke URL for mixing
  // ─────────────────────────────
  useEffect(() => {
    if (!recording.song) return;

    ClientService.getSongById(recording.song)
      .then((res) => {
        if (res.data.audio_key) {
          return appApiClient.get(
            `/api/media/secure/?key=${encodeURIComponent(res.data.audio_key)}`
          );
        }
      })
      .then((res) => {
        if (res?.data?.url) {
          setKaraokeUrl(res.data.url);
        }
      })
      .catch((err) => console.error("Failed to load karaoke URL", err));
  }, [recording.song]);

  // ─────────────────────────────
  // Download
  // ─────────────────────────────
  const download = () => {
    if (!audioUrl) return;

    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `${recording.song_title}-recording.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-4 bg-gray-800/40 border border-purple-400/20 rounded-xl p-4"
    >
      {showMixingModal && (
        <MixingModal
          isOpen={true}
          onClose={() => setShowMixingModal(false)}
          recordingUrl={audioUrl}
          karaokeUrl={karaokeUrl}
          songTitle={recording.song_title}
          recordingDuration={recording.duration}
        />
      )}

      {audioUrl ? (
        <audio controls src={audioUrl} className="w-full mb-4" />
      ) : (
        <div className="text-gray-400 mb-4">Loading recording…</div>
      )}

      <div className="flex gap-3 flex-wrap">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={download}
          disabled={!audioUrl}
          className="flex items-center gap-2 px-6 py-3 rounded-xl
                     bg-purple-600 hover:bg-purple-500
                     disabled:bg-purple-400 disabled:cursor-not-allowed
                     shadow-lg shadow-purple-900/40 font-semibold"
        >
          <Download className="w-5 h-5" />
          Download Recording
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowMixingModal(true)}
          disabled={!audioUrl || !karaokeUrl}
          className="flex items-center gap-2 px-6 py-3 rounded-xl
                     bg-indigo-600 hover:bg-indigo-500
                     disabled:bg-indigo-400 disabled:cursor-not-allowed
                     shadow-lg shadow-indigo-900/40 font-semibold"
        >
          <Sliders className="w-5 h-5" />
          Mix with Track
        </motion.button>
      </div>
    </motion.div>
  );
};

export default RecordingDetails;
