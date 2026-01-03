import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import ClientService from "../ClientService";
import AudioPlayer from "./AudioPlayer";
import LyricsDisplay from "./LyricsDisplay";
import AudioRecorder from "./AudioRecorder";
import { appApiClient } from "../../../api/endpoints";

const SongPlayerPage = () => {
  const { id } = useParams();
  const [song, setSong] = useState(null);
  const [coverUrl, setCoverUrl] = useState(null);

  // ✅ SINGLE SOURCE OF TRUTH
  const audioRef = useRef(null);

  useEffect(() => {
    ClientService.getSongById(id).then((res) => {
      setSong(res.data);
    });
  }, [id]);

  useEffect(() => {
    if (!song?.cover_key) return;

    appApiClient
      .get(`/api/media/secure/?key=${encodeURIComponent(song.cover_key)}`)
      .then((res) => setCoverUrl(res.data.url));
  }, [song?.cover_key]);

  if (!song) {
    return <div className="text-white text-center mt-20">Loading...</div>;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white flex flex-col items-center p-6">
      {/* 🔐 SINGLE AUDIO ELEMENT */}
      <audio ref={audioRef} preload="metadata" />

      {/* Cover */}
      <div className="mt-6">
        {coverUrl ? (
          <img
            src={coverUrl}
            crossOrigin="anonymous"
            className="w-56 h-56 rounded-2xl shadow-lg"
            alt="cover"
          />
        ) : (
          <div className="w-56 h-56 bg-gray-800 animate-pulse rounded-2xl" />
        )}
      </div>

      <h1 className="mt-6 text-4xl font-extrabold">{song.title}</h1>

      {/* Controls */}
      <div className="w-full max-w-2xl mt-8">
        <AudioPlayer audioKey={song.audio_key} audioRef={audioRef} />
      </div>

      {/* Recorder */}
      <div className="w-full max-w-2xl mt-8">
        <AudioRecorder songId={song.id} audioRef={audioRef} />
      </div>

      {/* Lyrics */}
      <div className="w-full max-w-2xl mt-8">
        <LyricsDisplay lyrics={song.lyrics} audioRef={audioRef} />
      </div>
    </div>
  );
};

export default SongPlayerPage;
