import React from "react";

const StartRecordingModal = ({ currentTime, onChoose, onClose }) => {
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-purple-400/30 rounded-2xl p-6 w-[340px] shadow-xl">
        <h2 className="text-xl font-semibold text-purple-300 mb-4">
          Start Recording
        </h2>

        <p className="text-gray-300 mb-6 text-sm">
          Where do you want to start recording from?
        </p>

        <div className="space-y-3">
          <button
            onClick={() => onChoose("start")}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 transition text-white font-medium"
          >
            ▶ Start from Beginning (0:00)
          </button>

          <button
            onClick={() => onChoose("current")}
            className="w-full py-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition text-white font-medium"
          >
            ▶ Start from Current Time ({formatTime(currentTime)})
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full text-sm text-gray-400 hover:text-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default StartRecordingModal;
