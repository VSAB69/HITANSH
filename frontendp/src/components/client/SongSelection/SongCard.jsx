import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { appApiClient } from "../../../api/endpoints";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const SongCard = ({ song }) => {
  const navigate = useNavigate();
  const [coverUrl, setCoverUrl] = useState(null);

  useEffect(() => {
    if (!song.cover_key) return;

    let cancelled = false;

    const loadCover = async () => {
      try {
        const res = await appApiClient.get(
          `/api/media/secure/?key=${encodeURIComponent(song.cover_key)}`
        );

        if (!cancelled) {
          setCoverUrl(res.data.url);
        }
      } catch (err) {
        console.error("Failed to load cover image", err);
      }
    };

    loadCover();

    return () => {
      cancelled = true;
    };
  }, [song.cover_key]);

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(`/songs/${song.id}`)}
      className="
        group cursor-pointer rounded-2xl overflow-hidden
        bg-gray-900/60 border border-purple-400/20
        shadow-lg hover:shadow-purple-900/40 transition
      "
    >
      <div className="relative aspect-[1/1] overflow-hidden">
        {coverUrl ? (
          <img
            src={coverUrl}
            crossOrigin="anonymous"
            alt={song.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 animate-pulse" />
        )}

        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center shadow-xl">
            <Play className="w-7 h-7 text-white ml-1" />
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-white truncate">
          {song.title}
        </h3>
      </div>
    </motion.div>
  );
};

export default SongCard;
