import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Music, Mic, User } from "lucide-react";

export const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      {/* 🌌 BACKGROUND ANIMATIONS */}
      <div className="absolute inset-0">
        {/* Gradient flow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(168,85,247,0.25),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.25),transparent_40%),radial-gradient(circle_at_50%_80%,rgba(139,92,246,0.25),transparent_40%)] animate-[pulse_12s_ease-in-out_infinite]" />

        {/* Floating orbs */}
        <motion.div
          animate={{ y: [0, -40, 0], x: [0, 20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-20 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 50, 0], x: [0, -30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-32 right-24 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl"
        />

        {/* Particle grid */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:40px_40px] animate-[moveBg_30s_linear_infinite]" />
      </div>

      {/* 🎤 MAIN CONTENT */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl text-center"
        >
          {/* Title */}
          <motion.h1
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r 
                       from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent"
          >
            Welcome to CADENCEA 🎤
          </motion.h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-300 mb-12">
            Sing your favorite songs, follow synced lyrics, and capture your
            voice with studio-like karaoke recording.
          </p>

          {/* CTA BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/songs")}
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl 
                         bg-purple-600 hover:bg-purple-500 shadow-xl 
                         shadow-purple-900/40 text-lg font-semibold"
            >
              <Music className="w-6 h-6" />
              Browse Songs
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/recordings")}
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl 
                         bg-gray-800 hover:bg-gray-700 border border-purple-400/30 
                         text-lg font-semibold"
            >
              <Mic className="w-6 h-6" />
              My Recordings
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/profile")}
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl 
                         bg-gray-800 hover:bg-gray-700 border border-purple-400/30 
                         text-lg font-semibold"
            >
              <User className="w-6 h-6" />
              Profile
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
