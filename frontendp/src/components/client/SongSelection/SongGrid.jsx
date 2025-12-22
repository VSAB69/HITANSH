import React from "react";
import { motion } from "framer-motion";
import SongCard from "./SongCard";

const gridVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const SongGrid = ({ songs }) => {
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
      {songs.map((song) => (
        <SongCard key={song.id} song={song} />
      ))}
    </motion.div>
  );
};

export default SongGrid;
