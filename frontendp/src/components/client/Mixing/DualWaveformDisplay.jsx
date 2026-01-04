import React, { useRef, useEffect, useState } from "react";
import WaveSurfer from "wavesurfer.js";

const DualWaveformDisplay = ({ karaokeUrl, recordingUrl, offsetMs }) => {
    const karaokeWaveformRef = useRef(null);
    const recordingWaveformRef = useRef(null);
    const karaokeWavesurfer = useRef(null);
    const recordingWavesurfer = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Guard: ensure refs are available
        if (!karaokeWaveformRef.current || !recordingWaveformRef.current) return;
        if (!karaokeUrl || !recordingUrl) return;

        let isMounted = true;
        setLoading(true);
        setError(null);

        // Initialize karaoke waveform
        karaokeWavesurfer.current = WaveSurfer.create({
            container: karaokeWaveformRef.current,
            waveColor: "#8b5cf6",
            progressColor: "#c4b5fd",
            height: 60,
            barWidth: 2,
            barGap: 1,
            barRadius: 2,
            cursorColor: "transparent",
            normalize: true,
            backend: "WebAudio",
        });

        // Initialize recording waveform
        recordingWavesurfer.current = WaveSurfer.create({
            container: recordingWaveformRef.current,
            waveColor: "#ec4899",
            progressColor: "#f9a8d4",
            height: 60,
            barWidth: 2,
            barGap: 1,
            barRadius: 2,
            cursorColor: "transparent",
            normalize: true,
            backend: "WebAudio",
        });

        // Track loading state
        let loadCount = 0;
        const checkLoaded = () => {
            loadCount++;
            if (loadCount === 2 && isMounted) {
                setLoading(false);
            }
        };

        // Handle errors gracefully (ignore AbortError)
        const handleError = (source) => (err) => {
            // Ignore AbortError - it's expected during cleanup
            if (err?.name === "AbortError" || String(err).includes("abort")) {
                return;
            }
            console.error(`${source} waveform error:`, err);
            if (isMounted) {
                setError(`Failed to load ${source} audio`);
                setLoading(false);
            }
        };

        karaokeWavesurfer.current.on("ready", checkLoaded);
        recordingWavesurfer.current.on("ready", checkLoaded);
        karaokeWavesurfer.current.on("error", handleError("karaoke"));
        recordingWavesurfer.current.on("error", handleError("recording"));

        // Load audio
        try {
            karaokeWavesurfer.current.load(karaokeUrl);
            recordingWavesurfer.current.load(recordingUrl);
        } catch (err) {
            // Catch synchronous errors
            if (err?.name !== "AbortError") {
                console.error("Failed to load waveforms:", err);
            }
        }

        // Cleanup function
        return () => {
            isMounted = false;

            // Safely destroy wavesurfer instances
            try {
                if (karaokeWavesurfer.current) {
                    karaokeWavesurfer.current.destroy();
                    karaokeWavesurfer.current = null;
                }
            } catch (e) {
                // Ignore cleanup errors (AbortError, etc.)
            }

            try {
                if (recordingWavesurfer.current) {
                    recordingWavesurfer.current.destroy();
                    recordingWavesurfer.current = null;
                }
            } catch (e) {
                // Ignore cleanup errors
            }
        };
    }, [karaokeUrl, recordingUrl]);


    return (
        <div className="waveform-container">
            {loading && !error && (
                <div className="waveform-loading">Loading waveforms...</div>
            )}

            {error && <div className="waveform-loading text-red-400">{error}</div>}

            <div className="waveform-track">
                <label>🎵 Karaoke Track</label>
                <div ref={karaokeWaveformRef} className="waveform" />
            </div>

            <div className="waveform-track recording">
                <label>
                    🎤 Your Recording
                    {offsetMs !== 0 && (
                        <span className="offset-indicator">
                            ({offsetMs > 0 ? "+" : ""}
                            {offsetMs}ms)
                        </span>
                    )}
                </label>
                <div ref={recordingWaveformRef} className="waveform" />
            </div>
        </div>
    );
};

export default DualWaveformDisplay;
