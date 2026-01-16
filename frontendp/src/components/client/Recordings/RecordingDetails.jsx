import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { appApiClient } from "../../../api/endpoints";
import CustomAudioPlayer from "../SongPlayer/CustomAudioPlayer";
import ClientService from "../ClientService";
import MixingModal from "../Mixing/MixingModal";

const RecordingDetails = ({ recording }) => {
  const [audioUrl, setAudioUrl] = useState(null);
  const [karaokeUrl, setKaraokeUrl] = useState(null);
  const [showMixingModal, setShowMixingModal] = useState(false);
  const refreshTimer = useRef(null);

  // ─────────────────────────────
  // Fetch + auto-refresh signed URL
  // ─────────────────────────────
  useEffect(() => {
    let timer;

    const fetchSignedUrl = async () => {
      if (!recording.audio_key) return;

      try {
        const res = await appApiClient.get(
          `/api/media/secure/?key=${encodeURIComponent(recording.audio_key)}`
        );

        setAudioUrl(res.data.url);

        // Refresh at 80% of expiry time
        const refreshInMs = res.data.expires_in * 0.8 * 1000;
        clearTimeout(timer);
        timer = setTimeout(fetchSignedUrl, refreshInMs);
      } catch (err) {
        console.error("Failed to load recording", err);
      }
    };

    fetchSignedUrl();

    return () => clearTimeout(timer);
  }, [recording.audio_key]);

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
      className="mt-4 space-y-4"
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
        <CustomAudioPlayer src={audioUrl} label={recording.song_title} />
      ) : (
        <div className="text-muted-foreground p-4 card-glass rounded-xl">
          Loading recording…
        </div>
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
