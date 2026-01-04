import React from "react";

const TimelineSlider = ({ offsetMs, onOffsetChange, maxDuration }) => {
    const formatTime = (ms) => {
        const totalSec = Math.abs(ms) / 1000;
        const min = Math.floor(totalSec / 60);
        const sec = (totalSec % 60).toFixed(2);
        return `${ms < 0 ? "-" : "+"}${min}:${sec.padStart(5, "0")}`;
    };

    const minOffset = -Math.floor(maxDuration / 2);
    const maxOffset = Math.floor(maxDuration / 2);

    return (
        <div className="timeline-section">
            <div className="timeline-header">
                <h4>⏱️ Recording Offset</h4>
                <span className="offset-value">{formatTime(offsetMs)}</span>
            </div>

            <input
                type="range"
                min={minOffset}
                max={maxOffset}
                step={10}
                value={offsetMs}
                onChange={(e) => onOffsetChange(parseInt(e.target.value))}
                className="offset-slider"
            />

            <div className="offset-presets">
                <button
                    onClick={() => onOffsetChange(Math.max(minOffset, offsetMs - 100))}
                    className="preset-btn"
                >
                    -100ms
                </button>
                <button
                    onClick={() => onOffsetChange(Math.max(minOffset, offsetMs - 10))}
                    className="preset-btn"
                >
                    -10ms
                </button>
                <button onClick={() => onOffsetChange(0)} className="preset-btn reset">
                    Reset
                </button>
                <button
                    onClick={() => onOffsetChange(Math.min(maxOffset, offsetMs + 10))}
                    className="preset-btn"
                >
                    +10ms
                </button>
                <button
                    onClick={() => onOffsetChange(Math.min(maxOffset, offsetMs + 100))}
                    className="preset-btn"
                >
                    +100ms
                </button>
            </div>
        </div>
    );
};

export default TimelineSlider;
