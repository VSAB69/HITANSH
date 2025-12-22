import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Music } from "lucide-react";
import RecordingDetails from "./RecordingDetails";

const RecordingCard = ({ recording }) => {
  const [open, setOpen] = useState(false);
  const date = new Date(recording.created_at);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/60 border border-purple-400/20 rounded-2xl shadow-lg overflow-hidden"
    >
      {/* Summary */}
      <div
        onClick={() => setOpen(!open)}
        className="cursor-pointer p-5 flex items-center justify-between hover:bg-gray-800/40 transition"
      >
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Music className="w-5 h-5 text-purple-300" />
            {recording.song_title}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {date.toLocaleDateString()} • {date.toLocaleTimeString()} •{" "}
            {recording.duration ? `${recording.duration}s` : "—"}
          </p>
        </div>

        {open ? (
          <ChevronUp className="w-6 h-6 text-purple-300" />
        ) : (
          <ChevronDown className="w-6 h-6 text-purple-300" />
        )}
      </div>

      {/* Details */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="px-5 pb-5"
          >
            <RecordingDetails recording={recording} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RecordingCard;
