import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Music } from "lucide-react";
import ClientService from "../ClientService";
import SongGrid from "./SongGrid";

const SongSelectionPage = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ClientService.getSongs()
      .then((res) => setSongs(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-16 w-72 h-72 bg-crimson-pink/10 rounded-full blur-3xl" />
        <div className="absolute bottom-32 right-24 w-80 h-80 bg-royal-blue/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 py-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-crimson-pink/20 flex items-center justify-center">
            <Music className="w-6 h-6 text-crimson-pink" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              <span className="text-gradient">Select a Song</span>
            </h1>
            <p className="text-muted-foreground">
              Browse our collection and pick your next karaoke hit
            </p>
          </div>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="text-center text-muted-foreground mt-20">
            Loading songs...
          </div>
        )}

        {/* Song Grid */}
        {!loading && <SongGrid songs={songs} />}
      </div>
    </div>
  );
};

export default SongSelectionPage;
