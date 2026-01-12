import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Mic } from "lucide-react";
import RecordingDetails from "./RecordingDetails";

const RecordingCard = ({ recording }) => {
  const [open, setOpen] = useState(false);
  const date = new Date(recording.created_at);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-glass overflow-hidden"
    >
      {/* Summary */}
      <div
        onClick={() => setOpen(!open)}
        className="cursor-pointer p-5 flex items-center justify-between hover:bg-secondary/20 transition"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-crimson-pink/20 flex items-center justify-center">
            <Mic className="w-5 h-5 text-crimson-pink" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {recording.song_title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {date.toLocaleDateString()} - {date.toLocaleTimeString()} -{" "}
              {recording.duration ? `${recording.duration}s` : "—"}
            </p>
          </div>
        </div>

        {open ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
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
