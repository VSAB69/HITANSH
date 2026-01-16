import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, Upload, Loader2, Sliders, Music, Mic } from "lucide-react";
import { useAudioMixer } from "./useAudioMixer";
import ClientService from "../ClientService";
import "./MixingModal.css";

const MixingModal = ({
    isOpen,
    onClose,
    recordingUrl, // Object URL from blob or signed URL
    karaokeUrl, // Signed URL for karaoke track
    songTitle,
    songId,
    recordingDuration = 60, // Default duration in seconds
    recordingStartTime = 0, // Timestamp where recording started
}) => {
    const [karaokeVolume, setKaraokeVolume] = useState(0.7);
    const [recordingVolume, setRecordingVolume] = useState(1.0);
    const [initialized, setInitialized] = useState(false);
    const [initError, setInitError] = useState(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadError, setUploadError] = useState(null);
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
            setUploadSuccess(false);
            setUploadError(null);

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
            setKaraokeVolume(0.7);
            setRecordingVolume(1.0);
            setInitialized(false);
            setInitError(null);
            setUploadSuccess(false);
            setUploadError(null);
            cleanup();
        }
    }, [isOpen, cleanup]);

    const handlePreview = () => {
        if (isPlaying) {
            stopPreview();
        } else {
            // Pass recordingStartTime for preview layering
            playPreview(recordingStartTime * 1000, karaokeVolume, recordingVolume);
        }
    };

    const handleExport = async () => {
        setUploadError(null);
        setUploadSuccess(false);

        try {
            // Export returns a WAV blob
            const wavBlob = await exportMix(karaokeVolume, recordingVolume, recordingStartTime);

            if (!wavBlob) {
                throw new Error("Export failed - no audio generated");
            }

            // Upload to database using the same protocol as save recording
            const formData = new FormData();
            formData.append("song", songId);
            formData.append("audio_file", wavBlob, `mixed-${Date.now()}.wav`);

            await ClientService.uploadRecording(formData);
            setUploadSuccess(true);
        } catch (error) {
            console.error("Export/Upload failed:", error);
            setUploadError("Failed to export and save. Please try again.");
        }
    };

    const handleClose = () => {
        stopPreview();
        onClose();
    };

    if (!isOpen) return null;

    // Use portal to render modal at document body level
    return ReactDOM.createPortal(
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mixing-modal-overlay"
                onClick={handleClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="mixing-modal"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="mixing-modal-header">
                        <div className="header-content">
                            <div className="header-icon">
                                <Sliders size={20} />
                            </div>
                            <div className="header-text">
                                <h2>Mix Your Recording</h2>
                                <p>{songTitle}</p>
                            </div>
                        </div>
                        <button onClick={handleClose} className="close-btn">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="mixing-modal-content">
                        {initError ? (
                            <div className="error-message">{initError}</div>
                        ) : (
                            <>
                                {/* Info Card */}
                                <div className="info-card">
                                    <div className="info-item">
                                        <span className="info-label">Recording starts at</span>
                                        <span className="info-value">{formatTime(recordingStartTime)}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Duration</span>
                                        <span className="info-value">{formatTime(recordingDuration)}</span>
                                    </div>
                                </div>

                                {/* Volume Controls */}
                                <div className="volume-section">
                                    <div className="volume-track">
                                        <div className="volume-header">
                                            <Music size={16} className="volume-icon karaoke" />
                                            <label>Karaoke Track</label>
                                        </div>
                                        <div className="volume-control">
                                            <input
                                                type="range"
                                                min={0}
                                                max={2}
                                                step={0.05}
                                                value={karaokeVolume}
                                                onChange={(e) => setKaraokeVolume(parseFloat(e.target.value))}
                                                className="volume-slider karaoke"
                                            />
                                            <span className="volume-value">{Math.round(karaokeVolume * 100)}%</span>
                                        </div>
                                    </div>

                                    <div className="volume-track">
                                        <div className="volume-header">
                                            <Mic size={16} className="volume-icon recording" />
                                            <label>Your Recording</label>
                                        </div>
                                        <div className="volume-control">
                                            <input
                                                type="range"
                                                min={0}
                                                max={2}
                                                step={0.05}
                                                value={recordingVolume}
                                                onChange={(e) => setRecordingVolume(parseFloat(e.target.value))}
                                                className="volume-slider recording"
                                            />
                                            <span className="volume-value">{Math.round(recordingVolume * 100)}%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Success/Error Messages */}
                                {uploadSuccess && (
                                    <div className="success-message">
                                        ✓ Mixed recording saved successfully!
                                    </div>
                                )}
                                {uploadError && (
                                    <div className="error-message">
                                        {uploadError}
                                    </div>
                                )}
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
                            disabled={!initialized || isExporting || !!initError || uploadSuccess}
                            className="export-btn"
                        >
                            {isExporting ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Upload size={18} />
                            )}
                            {isExporting ? "Exporting..." : uploadSuccess ? "Saved!" : "Export & Save"}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
};

// Helper function to format time
const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default MixingModal;
