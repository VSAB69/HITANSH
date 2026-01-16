import React, { createContext, useContext, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const QueueContext = createContext(null);

export const QueueProvider = ({ children }) => {
    const navigate = useNavigate();

    // Queue state
    const [queue, setQueueState] = useState([]); // Array of song objects
    const [currentIndex, setCurrentIndex] = useState(0);
    const [source, setSource] = useState("all"); // "all", genre name, etc.

    // Set a new queue and optionally start playing
    const setQueue = useCallback((songs, startIndex = 0, sourceName = "all") => {
        setQueueState(songs);
        setCurrentIndex(startIndex);
        setSource(sourceName);
    }, []);

    // Play a specific song from the queue
    const playSongFromQueue = useCallback((index) => {
        if (index >= 0 && index < queue.length) {
            setCurrentIndex(index);
            navigate(`/songs/${queue[index].id}`);
        }
    }, [queue, navigate]);

    // Get current song
    const currentSong = queue[currentIndex] || null;

    // Play next song
    const playNext = useCallback(() => {
        if (currentIndex < queue.length - 1) {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            navigate(`/songs/${queue[nextIndex].id}`);
            return true;
        }
        return false; // No more songs
    }, [currentIndex, queue, navigate]);

    // Play previous song (or restart if requested)
    const playPrevious = useCallback((forceRestart = false) => {
        if (forceRestart || currentIndex === 0) {
            // Return false to indicate caller should restart current song
            return false;
        }
        const prevIndex = currentIndex - 1;
        setCurrentIndex(prevIndex);
        navigate(`/songs/${queue[prevIndex].id}`);
        return true;
    }, [currentIndex, queue, navigate]);

    // Check if we have next/previous
    const hasNext = currentIndex < queue.length - 1;
    const hasPrevious = currentIndex > 0;

    const value = {
        queue,
        currentIndex,
        currentSong,
        source,
        setQueue,
        playSongFromQueue,
        playNext,
        playPrevious,
        hasNext,
        hasPrevious,
    };

    return (
        <QueueContext.Provider value={value}>
            {children}
        </QueueContext.Provider>
    );
};

export const useQueue = () => {
    const context = useContext(QueueContext);
    if (!context) {
        throw new Error("useQueue must be used within a QueueProvider");
    }
    return context;
};

export default QueueContext;
