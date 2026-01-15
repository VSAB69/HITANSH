import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { appApiClient } from "../../../api/endpoints";
import CustomAudioPlayer from "../SongPlayer/CustomAudioPlayer";

const RecordingDetails = ({ recording }) => {
  const [audioUrl, setAudioUrl] = useState(null);
  const refreshTimer = useRef(null);

  // ─────────────────────────────
  // Fetch + auto-refresh signed URL
  // ─────────────────────────────
  const fetchSignedUrl = async () => {
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
  };

  useEffect(() => {
    fetchSignedUrl();

    return () => {
      clearTimeout(refreshTimer.current);
    };
  }, [recording.audio_key]);

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
      className="mt-4 space-y-4"
    >
      {audioUrl ? (
        <CustomAudioPlayer src={audioUrl} label={recording.song_title} />
      ) : (
        <div className="text-muted-foreground p-4 card-glass rounded-xl">Loading recording…</div>
      )}

      <div className="flex gap-3 flex-wrap">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={download}
          disabled={!audioUrl}
          className="flex items-center gap-2 px-6 py-3 rounded-xl
                     btn-gradient disabled:opacity-50 disabled:cursor-not-allowed
                     shadow-lg shadow-crimson-pink/20 font-semibold"
        >
          <Download className="w-5 h-5" />
          Download Recording
        </motion.button>
      </div>
    </motion.div>
  );
};

export default RecordingDetails;
