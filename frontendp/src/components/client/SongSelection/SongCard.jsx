import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const SongCard = ({ song }) => {
  const navigate = useNavigate();

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
      {/* Cover */}
      <div className="relative aspect-[1/1] overflow-hidden">
        <img
          src={song.cover_image}
          alt={song.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center shadow-xl">
            <Play className="w-7 h-7 text-white ml-1" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white truncate">
          {song.title}
        </h3>
      </div>
    </motion.div>
  );
};

export default SongCard;
