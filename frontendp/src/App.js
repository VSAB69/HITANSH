import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./context/useAuth";
import { QueueProvider } from "./context/QueueContext";
import PrivateRoute from "./components/private_route";
import ProfilePage from "./components/home/ProfilePage";
import RecordingsPage from "./components/client/Recordings/RecordingsPage";

import NavBar from "./components/NavBar";

import Login from "./routes/login";
import Register from "./routes/register";

import { Home } from "./components/home/Home";

// 🎤 Karaoke pages
import SongSelectionPage from "./components/client/SongSelection/SongSelectionPage";
import SongPlayerPage from "./components/client/SongPlayer/SongPlayerPage";

function App() {
  return (
    <Router>
      <AuthProvider>
        <QueueProvider>
          <Routes>
            {/* ---------- PUBLIC ROUTES ---------- */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* ---------- PRIVATE ROUTES ---------- */}
            <Route
              path="/home"
              element={
                <PrivateRoute allowedRoles={["admin", "client"]}>
                  <NavBar content={<Home />} />
                </PrivateRoute>
              }
            />

            <Route
              path="/recordings"
              element={
                <PrivateRoute
                  allowedRoles={["admin", "client", "participant", "organiser"]}
                >
                  <NavBar content={<RecordingsPage />} />
                </PrivateRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <PrivateRoute
                  allowedRoles={["admin", "participant", "organiser", "client"]}
                >
                  <NavBar content={<ProfilePage />} />
                </PrivateRoute>
              }
            />

            {/* ---------- KARAOKE ROUTES ---------- */}
            {/* Song selection list */}
            <Route
              path="/songs"
              element={
                <PrivateRoute
                  allowedRoles={["admin", "participant", "organiser", "client"]}
                >
                  <NavBar content={<SongSelectionPage />} />
                </PrivateRoute>
              }
            />

            {/* Song player */}
            <Route
              path="/songs/:id"
              element={
                <PrivateRoute
                  allowedRoles={["admin", "participant", "organiser", "client"]}
                >
                  <SongPlayerPage />
                </PrivateRoute>
              }
            />

            {/* ---------- DEFAULT ROUTE ---------- */}
            <Route path="/" element={<Navigate to="/home" replace />} />
          </Routes>
        </QueueProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
