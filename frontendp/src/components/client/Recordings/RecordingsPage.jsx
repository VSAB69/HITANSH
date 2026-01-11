import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mic, Music } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ClientService from "../ClientService";
import RecordingCard from "./RecordingCard";

const RecordingsPage = () => {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchRecordings = () => {
    setLoading(true);
    setError(null);
    ClientService.getMyRecordings()
      .then((res) => setRecordings(res.data || []))
      .catch((err) => setError("Failed to load recordings"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecordings();
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-crimson-pink/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-royal-blue/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 py-10 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-crimson-pink/20 flex items-center justify-center">
            <Mic className="w-6 h-6 text-crimson-pink" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              <span className="text-gradient">My Recordings</span>
            </h1>
            <p className="text-muted-foreground">
              Your karaoke performances
            </p>
          </div>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="text-center text-muted-foreground mt-20">
            Loading recordings...
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center mt-20">
            <p className="text-crimson-pink mb-4">{error}</p>
            <button
              onClick={fetchRecordings}
              className="btn-gradient px-6 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && recordings.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card-glass p-12 text-center mt-10"
          >
            <div className="w-16 h-16 rounded-xl bg-secondary/30 flex items-center justify-center mx-auto mb-6">
              <Music className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No recordings yet
            </h2>
            <p className="text-muted-foreground mb-6">
              Start singing your favorite songs to create your first recording
            </p>
            <button
              onClick={() => navigate("/songs")}
              className="btn-gradient px-6 py-3 rounded-lg font-medium"
            >
              Browse Songs
            </button>
          </motion.div>
        )}

        {/* Recordings List */}
        {!loading && !error && recordings.length > 0 && (
          <div className="space-y-4">
            {recordings.map((rec) => (
              <RecordingCard key={rec.id} recording={rec} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordingsPage;
