import React from "react";

const VolumeControls = ({
    karaokeVolume,
    recordingVolume,
    onKaraokeVolumeChange,
    onRecordingVolumeChange,
}) => {
    return (
        <div className="volume-section">
            <div className="volume-track">
                <label>🎵 Karaoke</label>
                <input
                    type="range"
                    min={0}
                    max={2}
                    step={0.05}
                    value={karaokeVolume}
                    onChange={(e) => onKaraokeVolumeChange(parseFloat(e.target.value))}
                    className="volume-slider karaoke"
                />
                <span className="volume-value">{Math.round(karaokeVolume * 100)}%</span>
            </div>

            <div className="volume-track">
                <label>🎤 Recording</label>
                <input
                    type="range"
                    min={0}
                    max={2}
                    step={0.05}
                    value={recordingVolume}
                    onChange={(e) => onRecordingVolumeChange(parseFloat(e.target.value))}
                    className="volume-slider recording"
                />
                <span className="volume-value">
                    {Math.round(recordingVolume * 100)}%
                </span>
            </div>
        </div>
    );
};

export default VolumeControls;
