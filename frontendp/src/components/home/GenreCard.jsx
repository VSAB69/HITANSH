import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Music, Play } from "lucide-react";
import { appApiClient } from "../../api/endpoints";

const GenreCard = ({ genre, onPlay }) => {
  const [coverUrl, setCoverUrl] = useState(null);

  useEffect(() => {
    if (genre.cover_key) {
      appApiClient
        .get(`/api/media/secure/?key=${encodeURIComponent(genre.cover_key)}`)
        .then((res) => setCoverUrl(res.data.url))
        .catch(() => {});
    }
  }, [genre.cover_key]);

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      onClick={onPlay}
      className="flex-shrink-0 w-72 rounded-2xl overflow-hidden 
                 bg-card/80 backdrop-blur border border-border
                 cursor-pointer group transition-shadow hover:shadow-xl"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={genre.name}
            className="w-full h-full object-cover 
                       group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full bg-gradient-to-br 
                          from-crimson-pink/30 to-royal-blue/30 
                          flex items-center justify-center"
          >
            <Music className="w-16 h-16 text-muted-foreground" />
          </div>
        )}

        {/* Play overlay */}
        <div
          className="absolute inset-0 bg-black/40 opacity-0 
                        group-hover:opacity-100 transition-opacity 
                        flex items-center justify-center"
        >
          <div
            className="w-12 h-12 rounded-full bg-crimson-pink 
                          flex items-center justify-center shadow-lg"
          >
            <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="text-xl font-semibold text-foreground mb-1">
          {genre.name}
        </h3>
        <p className="text-muted-foreground text-sm">
          {genre.count} {genre.count === 1 ? "song" : "songs"}
        </p>
      </div>
    </motion.div>
  );
};

export default GenreCard;
