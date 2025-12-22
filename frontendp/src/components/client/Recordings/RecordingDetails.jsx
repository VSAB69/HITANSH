import React from "react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";

const RecordingDetails = ({ recording }) => {
  const download = () => {
    const a = document.createElement("a");
    a.href = recording.audio_file;
    a.download = `${recording.song_title}-recording.webm`;
    a.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-4 bg-gray-800/40 border border-purple-400/20 rounded-xl p-4"
    >
      <audio controls src={recording.audio_file} className="w-full mb-4" />

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={download}
        className="flex items-center gap-2 px-6 py-3 rounded-xl
                   bg-purple-600 hover:bg-purple-500
                   shadow-lg shadow-purple-900/40 font-semibold"
      >
        <Download className="w-5 h-5" />
        Download Recording
      </motion.button>
    </motion.div>
  );
};

export default RecordingDetails;
