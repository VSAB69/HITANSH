import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Music } from "lucide-react";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const SongCard = ({ song }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/songs/${song.id}`)}
      className="group cursor-pointer rounded-xl overflow-hidden card-glass transition"
    >
      <div className="relative aspect-square overflow-hidden">
        {song.cover_url ? (
          <img
            src={song.cover_url}
            crossOrigin="anonymous"
            alt={song.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-secondary/30 flex items-center justify-center">
            <Music className="w-12 h-12 text-muted-foreground" />
          </div>
        )}

        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-crimson-pink flex items-center justify-center shadow-lg">
            <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-base font-semibold text-foreground truncate">
          {song.title}
        </h3>
        <p className="text-sm text-muted-foreground truncate">
          {song.artist?.name || (typeof song.artist === 'string' ? song.artist : 'Unknown Artist')}
        </p>
      </div>
    </motion.div>
  );
};

export default SongCard;
