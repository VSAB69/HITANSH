import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Music, User, ChevronLeft, ChevronRight } from "lucide-react";
import ClientService from "../client/ClientService";
import { appApiClient } from "../../api/endpoints";
import { useQueue } from "../../context/QueueContext";

// Genre Card Component (inline for simplicity)
const GenreCard = ({ genre, onPlay }) => {
  const [coverUrl, setCoverUrl] = useState(null);

  useEffect(() => {
    if (genre.cover_key) {
      appApiClient
        .get(`/api/media/secure/?key=${encodeURIComponent(genre.cover_key)}`)
        .then((res) => setCoverUrl(res.data.url))
        .catch(() => { });
    }
  }, [genre.cover_key]);

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      onClick={onPlay}
      className="flex-shrink-0 w-72 glass-effect rounded-2xl overflow-hidden cursor-pointer group"
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={genre.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-crimson-pink/30 to-royal-blue/30 flex items-center justify-center">
            <Music className="w-16 h-16 text-muted-foreground" />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--card))] to-transparent opacity-60" />
      </div>

      {/* Info */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-foreground mb-2">{genre.name}</h3>
        <p className="text-muted-foreground">{genre.count} {genre.count === 1 ? "song" : "songs"}</p>
      </div>
    </motion.div>
  );
};

export const Home = () => {
  const navigate = useNavigate();
  const { setQueue } = useQueue();
  const scrollRef = useRef(null);
  const [genres, setGenres] = useState([]);
  const [loadingGenres, setLoadingGenres] = useState(true);

  // Fetch genres on mount
  useEffect(() => {
    ClientService.getGenres()
      .then((res) => setGenres(res.data || []))
      .catch((err) => console.error("Failed to load genres", err))
      .finally(() => setLoadingGenres(false));
  }, []);

  // Scroll handler
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Play genre handler
  const handlePlayGenre = async (genre) => {
    try {
      const res = await ClientService.getSongsByGenre(genre.name);
      const songs = res.data || [];
      if (songs.length > 0) {
        setQueue(songs, 0, genre.name);
        navigate(`/songs/${songs[0].id}`);
      }
    } catch (err) {
      console.error("Failed to load genre songs", err);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-crimson-pink/10 rounded-full blur-3xl" />
        <div className="absolute bottom-32 right-24 w-72 h-72 bg-royal-blue/15 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-6 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-5xl w-full text-center"
        >
          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-gradient">Welcome to Cadencea</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Sing your favorite songs, view synced lyrics, and enjoy a smooth
            karaoke experience.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/songs")}
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl 
                         btn-gradient text-lg font-semibold"
            >
              <Music className="w-5 h-5" />
              Browse Songs
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/profile")}
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl 
                         bg-secondary/50 hover:bg-secondary border border-border/50
                         text-lg font-semibold transition-colors"
            >
              <User className="w-5 h-5" />
              View Profile
            </motion.button>
          </div>

          {/* Genre Carousel */}
          {!loadingGenres && genres.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="w-full py-8"
            >
              {/* Header with controls */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-left">
                  <span className="text-gradient">Browse by Genre</span>
                </h2>
                <div className="flex items-center gap-2 md:gap-4">
                  <button
                    onClick={() => scroll("left")}
                    className="p-2 rounded-full glass-effect hover:bg-secondary/50 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-foreground" />
                  </button>
                  <button
                    onClick={() => scroll("right")}
                    className="p-2 rounded-full glass-effect hover:bg-secondary/50 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-foreground" />
                  </button>
                  <button
                    onClick={() => navigate("/songs")}
                    className="text-crimson-pink hover:text-crimson-pink/80 font-medium transition-colors hidden sm:block"
                  >
                    See More
                  </button>
                </div>
              </div>

              {/* Scrollable container */}
              <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {genres.map((genre) => (
                  <GenreCard
                    key={genre.name}
                    genre={genre}
                    onPlay={() => handlePlayGenre(genre)}
                  />
                ))}
              </div>
            </motion.section>
          )}

          {/* Footer text */}
          <p className="mt-4 text-sm text-muted-foreground">
            Your ultimate karaoke experience
          </p>
        </motion.div>
      </div>
    </div>
  );
};
