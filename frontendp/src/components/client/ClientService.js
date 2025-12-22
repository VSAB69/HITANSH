import { appApiClient } from "../../api/endpoints";

const ClientService = {
  // ------------------------------------
  // 🎵 SONGS
  // ------------------------------------
  getSongs: () => appApiClient.get("/api/songs/"),
  getSongById: (songId) => appApiClient.get(`/api/songs/${songId}/`),

  // ------------------------------------
  // 🎤 RECORDINGS
  // ------------------------------------
  uploadRecording: (formData) =>
    appApiClient.post("/api/recordings/upload/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  getMyRecordings: () => appApiClient.get("/api/recordings/"),
};

export default ClientService;
