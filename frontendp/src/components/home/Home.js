import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Music, User } from "lucide-react";

export const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-crimson-pink/10 rounded-full blur-3xl" />
        <div className="absolute bottom-32 right-24 w-72 h-72 bg-royal-blue/15 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-3.5rem)] px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl text-center"
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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

          {/* Footer text */}
          <p className="mt-16 text-sm text-muted-foreground">
            Your ultimate karaoke experience
          </p>
        </motion.div>
      </div>
    </div>
  );
};
