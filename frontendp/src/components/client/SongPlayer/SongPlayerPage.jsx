import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import ClientService from "../ClientService";
import AudioPlayer from "./AudioPlayer";
import LyricsDisplay from "./LyricsDisplay";
import AudioRecorder from "./AudioRecorder";

const SongPlayerPage = () => {
  const { id } = useParams();
  const [song, setSong] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    ClientService.getSongById(id).then((res) => {
      setSong(res.data);
    });
  }, [id]);

  if (!song)
    return <div className="text-white text-center mt-20">Loading...</div>;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white flex flex-col items-center p-6">
      {/* Cover Art */}
      <div className="mt-6">
        <img
          src={song.cover_image}
          className="w-56 h-56 rounded-2xl shadow-lg shadow-purple-500/40 animate-pulse"
          alt="cover"
        />
      </div>

      {/* Song Info */}
      <h1 className="mt-6 text-4xl font-extrabold tracking-wide drop-shadow-lg">
        {song.title}
      </h1>

      {/* Modern Audio Player */}
      <div className="w-full max-w-2xl mt-8">
        <AudioPlayer audioUrl={song.audio_file} audioRef={audioRef} />
      </div>
      <div className="w-full max-w-2xl mt-8">
        <AudioRecorder songId={song.id} audioRef={audioRef} />
      </div>

      {/* Lyrics Section */}
      <div className="w-full max-w-2xl mt-8">
        <LyricsDisplay lyrics={song.lyrics} audioRef={audioRef} />
      </div>
    </div>
  );
};

export default SongPlayerPage;
