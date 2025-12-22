import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ClientService from "../ClientService";
import SongGrid from "./SongGrid";

const SongSelectionPage = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ClientService.getSongs()
      .then((res) => setSongs(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white overflow-hidden">
      {/* 🌌 Ambient animated background */}
      <div className="absolute inset-0">
        <motion.div
          animate={{ opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(168,85,247,0.25),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.25),transparent_40%),radial-gradient(circle_at_50%_80%,rgba(139,92,246,0.25),transparent_40%)]"
        />

        <motion.div
          animate={{ y: [0, -40, 0], x: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-20 left-16 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 50, 0], x: [0, -30, 0] }}
          transition={{ duration: 24, repeat: Infinity }}
          className="absolute bottom-32 right-24 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl"
        />
      </div>

      {/* 🎵 CONTENT */}
      <div className="relative z-10 px-6 py-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-purple-300 mb-3">
            Browse Songs 🎶
          </h1>
          <p className="text-gray-300 text-lg">
            Choose a track, sing along with synced lyrics, and record your
            voice.
          </p>
        </motion.div>

        {/* Loader */}
        {loading && (
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-center text-purple-300 text-xl mt-20"
          >
            Loading songs…
          </motion.div>
        )}

        {/* Song Grid */}
        {!loading && <SongGrid songs={songs} />}
      </div>
    </div>
  );
};

export default SongSelectionPage;
