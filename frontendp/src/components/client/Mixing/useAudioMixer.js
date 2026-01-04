import { useRef, useState, useCallback } from "react";

export const useAudioMixer = () => {
    const audioContextRef = useRef(null);
    const karaokeBufferRef = useRef(null);
    const recordingBufferRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const sourcesRef = useRef([]);

    // Load audio file into buffer with abort support
    const loadAudioBuffer = async (url, signal) => {
        if (!audioContextRef.current) {
            audioContextRef.current = new AudioContext();
        }
        const response = await fetch(url, { signal });
        const arrayBuffer = await response.arrayBuffer();
        return audioContextRef.current.decodeAudioData(arrayBuffer);
    };

    // Initialize with both audio URLs (supports AbortSignal)
    const initialize = useCallback(async (karaokeUrl, recordingUrl, abortSignal) => {
        try {
            const [karaokeBuffer, recordingBuffer] = await Promise.all([
                loadAudioBuffer(karaokeUrl, abortSignal),
                loadAudioBuffer(recordingUrl, abortSignal),
            ]);

            // Only set buffers if not aborted
            if (!abortSignal?.aborted) {
                karaokeBufferRef.current = karaokeBuffer;
                recordingBufferRef.current = recordingBuffer;
            }
        } catch (error) {
            // Ignore abort errors - they're expected during cleanup
            if (error.name === "AbortError") {
                return;
            }
            console.error("Failed to load audio buffers:", error);
            throw error;
        }
    }, []);

    // Stop any existing playback
    const stopPreview = useCallback(() => {
        sourcesRef.current.forEach((s) => {
            try {
                s.stop();
            } catch {
                // Ignore errors when stopping already stopped sources
            }
        });
        sourcesRef.current = [];
        setIsPlaying(false);
    }, []);

    // Preview playback with offset and volumes
    const playPreview = useCallback(
        (offsetMs, karaokeVol, recordingVol) => {
            if (!audioContextRef.current || !karaokeBufferRef.current) return;

            stopPreview(); // Stop any existing playback

            const ctx = audioContextRef.current;

            // Resume context if suspended (browser autoplay policy)
            if (ctx.state === "suspended") {
                ctx.resume();
            }

            const offsetSec = offsetMs / 1000;

            // Karaoke source
            const karaokeSource = ctx.createBufferSource();
            karaokeSource.buffer = karaokeBufferRef.current;
            const karaokeGain = ctx.createGain();
            karaokeGain.gain.value = karaokeVol;
            karaokeSource.connect(karaokeGain).connect(ctx.destination);

            // Recording source
            const recordingSource = ctx.createBufferSource();
            recordingSource.buffer = recordingBufferRef.current;
            const recordingGain = ctx.createGain();
            recordingGain.gain.value = recordingVol;
            recordingSource.connect(recordingGain).connect(ctx.destination);

            // Start with offset
            const now = ctx.currentTime;
            if (offsetSec >= 0) {
                karaokeSource.start(now);
                recordingSource.start(now + offsetSec);
            } else {
                karaokeSource.start(now + Math.abs(offsetSec));
                recordingSource.start(now);
            }

            sourcesRef.current = [karaokeSource, recordingSource];
            setIsPlaying(true);

            // Auto-stop when finished
            const duration = Math.max(
                karaokeBufferRef.current.duration,
                recordingBufferRef.current.duration + Math.abs(offsetSec)
            );

            setTimeout(() => {
                setIsPlaying(false);
                sourcesRef.current = [];
            }, duration * 1000);
        },
        [stopPreview]
    );

    // Export mixed audio using OfflineAudioContext
    const exportMix = useCallback(
        async (offsetMs, karaokeVol, recordingVol, songTitle = "mix") => {
            if (!karaokeBufferRef.current || !recordingBufferRef.current) {
                console.error("Audio buffers not loaded");
                return;
            }

            setIsExporting(true);

            try {
                const offsetSec = offsetMs / 1000;
                const karaokeDuration = karaokeBufferRef.current.duration;
                const recordingDuration = recordingBufferRef.current.duration;

                // Calculate total duration
                const totalDuration =
                    offsetSec >= 0
                        ? Math.max(karaokeDuration, recordingDuration + offsetSec)
                        : Math.max(karaokeDuration + Math.abs(offsetSec), recordingDuration);

                const sampleRate = karaokeBufferRef.current.sampleRate;
                const offlineCtx = new OfflineAudioContext(
                    2, // stereo
                    Math.ceil(totalDuration * sampleRate),
                    sampleRate
                );

                // Karaoke
                const karaokeSource = offlineCtx.createBufferSource();
                karaokeSource.buffer = karaokeBufferRef.current;
                const karaokeGain = offlineCtx.createGain();
                karaokeGain.gain.value = karaokeVol;
                karaokeSource.connect(karaokeGain).connect(offlineCtx.destination);

                // Recording
                const recordingSource = offlineCtx.createBufferSource();
                recordingSource.buffer = recordingBufferRef.current;
                const recordingGain = offlineCtx.createGain();
                recordingGain.gain.value = recordingVol;
                recordingSource.connect(recordingGain).connect(offlineCtx.destination);

                // Start with offset
                if (offsetSec >= 0) {
                    karaokeSource.start(0);
                    recordingSource.start(offsetSec);
                } else {
                    karaokeSource.start(Math.abs(offsetSec));
                    recordingSource.start(0);
                }

                // Render - this is async and doesn't block UI
                const renderedBuffer = await offlineCtx.startRendering();

                // Convert to WAV using async chunked processing (non-blocking)
                const wavBlob = await audioBufferToWavAsync(renderedBuffer);
                downloadBlob(wavBlob, `${songTitle}-mixed.wav`);
            } catch (error) {
                console.error("Export failed:", error);
                alert("Export failed. Please try again.");
            } finally {
                setIsExporting(false);
            }
        },
        []
    );

    // Cleanup function to close AudioContext
    const cleanup = useCallback(() => {
        stopPreview();
        karaokeBufferRef.current = null;
        recordingBufferRef.current = null;
    }, [stopPreview]);

    return {
        initialize,
        playPreview,
        stopPreview,
        exportMix,
        cleanup,
        isPlaying,
        isExporting,
    };
};

// Helper: Convert AudioBuffer to WAV Blob (ASYNC - non-blocking)
async function audioBufferToWavAsync(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const totalSamples = buffer.length * numChannels;

    // Create the data array
    const data = new Int16Array(totalSamples);

    // Process in chunks to avoid blocking the main thread
    const CHUNK_SIZE = 50000; // samples per chunk
    let processedSamples = 0;

    // Get channel data upfront
    const channels = [];
    for (let ch = 0; ch < numChannels; ch++) {
        channels.push(buffer.getChannelData(ch));
    }

    // Process chunks with yielding to main thread
    while (processedSamples < buffer.length) {
        const chunkEnd = Math.min(processedSamples + CHUNK_SIZE, buffer.length);

        // Process this chunk
        for (let i = processedSamples; i < chunkEnd; i++) {
            for (let ch = 0; ch < numChannels; ch++) {
                const sample = channels[ch][i];
                const clamped = Math.max(-1, Math.min(1, sample));
                data[i * numChannels + ch] =
                    clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
            }
        }

        processedSamples = chunkEnd;

        // Yield to main thread every chunk to keep UI responsive
        await new Promise((resolve) => setTimeout(resolve, 0));
    }

    // Build WAV file
    const wavBuffer = new ArrayBuffer(44 + data.length * 2);
    const view = new DataView(wavBuffer);

    // WAV header
    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + data.length * 2, true);
    writeString(view, 8, "WAVE");
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, "data");
    view.setUint32(40, data.length * 2, true);

    // Write audio data in chunks too
    let offset = 44;
    let dataIndex = 0;
    const DATA_CHUNK_SIZE = 100000;

    while (dataIndex < data.length) {
        const chunkEnd = Math.min(dataIndex + DATA_CHUNK_SIZE, data.length);

        for (let i = dataIndex; i < chunkEnd; i++, offset += 2) {
            view.setInt16(offset, data[i], true);
        }

        dataIndex = chunkEnd;

        // Yield to main thread
        await new Promise((resolve) => setTimeout(resolve, 0));
    }

    return new Blob([wavBuffer], { type: "audio/wav" });
}

function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export default useAudioMixer;
