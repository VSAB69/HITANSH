import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, Download, Loader2 } from "lucide-react";
import DualWaveformDisplay from "./DualWaveformDisplay";
import TimelineSlider from "./TimelineSlider";
import VolumeControls from "./VolumeControls";
import { useAudioMixer } from "./useAudioMixer";
import "./MixingModal.css";

const MixingModal = ({
    isOpen,
    onClose,
    recordingUrl, // Object URL from blob or signed URL
    karaokeUrl, // Signed URL for karaoke track
    songTitle,
    recordingDuration = 60, // Default duration in seconds
}) => {
    const [offsetMs, setOffsetMs] = useState(0);
    const [karaokeVolume, setKaraokeVolume] = useState(0.7);
    const [recordingVolume, setRecordingVolume] = useState(1.0);
    const [initialized, setInitialized] = useState(false);
    const [initError, setInitError] = useState(null);
    const abortControllerRef = useRef(null);

    const {
        initialize,
        playPreview,
        stopPreview,
        exportMix,
        cleanup,
        isPlaying,
        isExporting,
    } = useAudioMixer();

    // Initialize audio when modal opens
    useEffect(() => {
        if (isOpen && karaokeUrl && recordingUrl) {
            // Create new AbortController for this initialization
            abortControllerRef.current = new AbortController();
            const signal = abortControllerRef.current.signal;

            setInitialized(false);
            setInitError(null);

            initialize(karaokeUrl, recordingUrl, signal)
                .then(() => {
                    // Only set initialized if not aborted
                    if (!signal.aborted) {
                        setInitialized(true);
                    }
                })
                .catch((err) => {
                    // Ignore AbortError - it's expected during cleanup
                    if (err?.name === "AbortError") {
                        return;
                    }
                    console.error("Failed to initialize mixer:", err);
                    if (!signal.aborted) {
                        setInitError("Failed to load audio files");
                    }
                });
        }

        // Cleanup when modal closes or URLs change
        return () => {
            // Abort any pending fetch requests
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
                abortControllerRef.current = null;
            }
            stopPreview();
        };
    }, [isOpen, karaokeUrl, recordingUrl, initialize, stopPreview]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setOffsetMs(0);
            setKaraokeVolume(0.7);
            setRecordingVolume(1.0);
            setInitialized(false);
            setInitError(null);
            cleanup();
        }
    }, [isOpen, cleanup]);

    const handlePreview = () => {
        if (isPlaying) {
            stopPreview();
        } else {
            playPreview(offsetMs, karaokeVolume, recordingVolume);
        }
    };

    const handleExport = () => {
        exportMix(offsetMs, karaokeVolume, recordingVolume, songTitle);
    };

    const handleClose = () => {
        stopPreview();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mixing-modal-overlay"
                onClick={handleClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="mixing-modal"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="mixing-modal-header">
                        <h2>🎚️ Mix Your Recording</h2>
                        <p>{songTitle}</p>
                        <button onClick={handleClose} className="close-btn">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="mixing-modal-content">
                        {initError ? (
                            <div className="text-red-400 text-center py-8">{initError}</div>
                        ) : (
                            <>
                                {/* Waveforms */}
                                <DualWaveformDisplay
                                    karaokeUrl={karaokeUrl}
                                    recordingUrl={recordingUrl}
                                    offsetMs={offsetMs}
                                />

                                {/* Timeline Slider */}
                                <TimelineSlider
                                    offsetMs={offsetMs}
                                    onOffsetChange={setOffsetMs}
                                    maxDuration={recordingDuration * 1000}
                                />

                                {/* Volume Controls */}
                                <VolumeControls
                                    karaokeVolume={karaokeVolume}
                                    recordingVolume={recordingVolume}
                                    onKaraokeVolumeChange={setKaraokeVolume}
                                    onRecordingVolumeChange={setRecordingVolume}
                                />
                            </>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="mixing-modal-actions">
                        <button
                            onClick={handlePreview}
                            disabled={!initialized || !!initError}
                            className="preview-btn"
                        >
                            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                            {isPlaying ? "Stop" : "Preview"}
                        </button>

                        <button
                            onClick={handleExport}
                            disabled={!initialized || isExporting || !!initError}
                            className="export-btn"
                        >
                            {isExporting ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Download size={18} />
                            )}
                            {isExporting ? "Exporting..." : "Export WAV"}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default MixingModal;
