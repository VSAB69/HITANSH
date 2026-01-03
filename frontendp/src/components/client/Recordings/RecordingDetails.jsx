import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { appApiClient } from "../../../api/endpoints";

const RecordingDetails = ({ recording }) => {
  const [audioUrl, setAudioUrl] = useState(null);

  useEffect(() => {
    if (!recording.audio_key) return;

    let cancelled = false;

    const loadAudio = async () => {
      try {
        const res = await appApiClient.get(
          `/api/media/secure/?key=${encodeURIComponent(recording.audio_key)}`
        );

        if (!cancelled) {
          setAudioUrl(res.data.url);
        }
      } catch (err) {
        console.error("Failed to load recording", err);
      }
    };

    loadAudio();

    return () => {
      cancelled = true;
    };
  }, [recording.audio_key]);

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
      {audioUrl ? (
        <audio controls src={audioUrl} className="w-full mb-4" />
      ) : (
        <div className="text-gray-400 mb-4">Loading recording…</div>
      )}

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
    </motion.div>
  );
};

export default RecordingDetails;
