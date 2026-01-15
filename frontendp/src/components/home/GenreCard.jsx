import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Music } from "lucide-react";
import { appApiClient } from "../../api/endpoints";
import { useQueue } from "../../context/QueueContext";
import ClientService from "../client/ClientService";

const GenreCard = ({ genre }) => {
    const navigate = useNavigate();
    const { setQueue } = useQueue();
    const [coverUrl, setCoverUrl] = useState(null);

    // Fetch cover URL
    useEffect(() => {
        if (genre.cover_key) {
            appApiClient
                .get(`/api/media/secure/?key=${encodeURIComponent(genre.cover_key)}`)
                .then((res) => setCoverUrl(res.data.url))
                .catch(() => { });
        }
    }, [genre.cover_key]);

    const handlePlay = async () => {
        try {
            // Fetch songs for this genre
            const res = await ClientService.getSongsByGenre(genre.name);
            const songs = res.data || [];

            if (songs.length > 0) {
                // Set queue with genre songs
                setQueue(songs, 0, genre.name);
                // Navigate to first song
                navigate(`/songs/${songs[0].id}`);
            }
        } catch (err) {
            console.error("Failed to load genre songs", err);
        }
    };

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex-shrink-0 w-48 cursor-pointer group"
            onClick={handlePlay}
        >
            <div className="relative rounded-xl overflow-hidden card-glass">
                {/* Cover Image */}
                <div className="aspect-square relative overflow-hidden">
                    {coverUrl ? (
                        <img
                            src={coverUrl}
                            alt={genre.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-crimson-pink/30 to-royal-blue/30 flex items-center justify-center">
                            <Music className="w-16 h-16 text-muted-foreground" />
                        </div>
                    )}

                    {/* Play button overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-12 h-12 rounded-full bg-crimson-pink flex items-center justify-center shadow-lg"
                        >
                            <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
                        </motion.div>
                    </div>
                </div>

                {/* Info */}
                <div className="p-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground truncate">{genre.name}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {genre.count} {genre.count === 1 ? "track" : "tracks"}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default GenreCard;
