import React from "react";
import { motion } from "framer-motion";
import SongCard from "./SongCard";
import { useQueue } from "../../../context/QueueContext";

const gridVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const SongGrid = ({ songs, source = "all" }) => {
  const { setQueue } = useQueue();

  const handleSongClick = (index) => {
    // Set the queue with all songs and start at the clicked index
    setQueue(songs, index, source);
  };

  return (
    <motion.div
      variants={gridVariants}
      initial="hidden"
      animate="show"
      className="
        grid 
        grid-cols-2 
        sm:grid-cols-3 
        md:grid-cols-4 
        lg:grid-cols-5 
        gap-6
      "
    >
      {songs.map((song, index) => (
        <SongCard
          key={song.id}
          song={song}
          onPlay={() => handleSongClick(index)}
        />
      ))}
    </motion.div>
  );
};

export default SongGrid;
