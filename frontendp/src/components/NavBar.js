// src/components/NavBar.js
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import ClientService from "./client/ClientService";
import Footer from "./Footer";

import {
  User,
  Music,
  Mic,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Navigation history tracking
let navigationHistory = [];
let currentHistoryIndex = -1;
const MAX_HISTORY = 10;

// ─────────────────────────────
// Auth Dialog
// ─────────────────────────────
const AuthDialog = ({ open, onOpenChange }) => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-sm card-glass p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {user ? (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-crimson-pink to-crimson-pink/60 flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {user.username}
              </h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  onOpenChange(false);
                  navigate("/profile");
                }}
                className="w-full py-2.5 px-4 rounded-lg bg-secondary/50 hover:bg-secondary text-foreground transition-colors"
              >
                View Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full py-2.5 px-4 rounded-lg bg-crimson-pink/20 hover:bg-crimson-pink/30 text-crimson-pink transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Welcome to Cadencea
            </h3>
            <p className="text-sm text-muted-foreground">
              Sign in to access all features
            </p>

            <button
              onClick={() => {
                onOpenChange(false);
                navigate("/login");
              }}
              className="w-full btn-gradient py-2.5 px-4 rounded-lg font-semibold"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────
// Main NavBar
// ─────────────────────────────
export default function NavBar({ content }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  // Search state
  const [searchValue, setSearchValue] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [songs, setSongs] = useState([]);
  const searchContainerRef = useRef(null);

  // Navigation state
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  // Fetch songs for search
  useEffect(() => {
    ClientService.getSongs()
      .then((res) => setSongs(res.data || []))
      .catch(console.error);
  }, []);

  // Track navigation history
  useEffect(() => {
    const currentPath = location.pathname;
    if (navigationHistory[currentHistoryIndex] !== currentPath) {
      navigationHistory = navigationHistory.slice(0, currentHistoryIndex + 1);
      navigationHistory.push(currentPath);
      if (navigationHistory.length > MAX_HISTORY) {
        navigationHistory.shift();
      } else {
        currentHistoryIndex++;
      }
    }
    setCanGoBack(currentHistoryIndex > 0);
    setCanGoForward(currentHistoryIndex < navigationHistory.length - 1);
  }, [location.pathname]);

  // Close search on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target)
      ) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBack = () => {
    if (currentHistoryIndex > 0) {
      currentHistoryIndex--;
      navigate(navigationHistory[currentHistoryIndex]);
      setCanGoBack(currentHistoryIndex > 0);
      setCanGoForward(true);
    }
  };

  const handleForward = () => {
    if (currentHistoryIndex < navigationHistory.length - 1) {
      currentHistoryIndex++;
      navigate(navigationHistory[currentHistoryIndex]);
      setCanGoForward(currentHistoryIndex < navigationHistory.length - 1);
      setCanGoBack(true);
    }
  };

  // Filter songs for search
  const filteredSongs = songs
    .filter(
      (song) =>
        song.title?.toLowerCase().includes(searchValue.toLowerCase()) ||
        (song.artist?.name || "")
          .toLowerCase()
          .includes(searchValue.toLowerCase())
    )
    .slice(0, 5);

  const handleSongClick = (song) => {
    setSearchFocused(false);
    setSearchValue("");
    navigate(`/songs/${song.id}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-navy-night text-white">
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />

      {/* TOP NAVBAR */}
      <header className="fixed inset-x-0 top-0 z-50 glass-effect">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center">
          {/* LEFT */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleBack}
              disabled={!canGoBack}
              className={`p-1.5 rounded-full transition-colors ${
                canGoBack
                  ? "hover:bg-secondary/30 text-foreground"
                  : "opacity-30 cursor-not-allowed text-muted-foreground"
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              onClick={handleForward}
              disabled={!canGoForward}
              className={`p-1.5 rounded-full transition-colors ${
                canGoForward
                  ? "hover:bg-secondary/30 text-foreground"
                  : "opacity-30 cursor-not-allowed text-muted-foreground"
              }`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <Link to="/home" className="ml-2">
              <span className="text-gradient text-xl font-bold">Cadencea</span>
            </Link>
          </div>

          {/* CENTER SEARCH */}
          <div
            className="hidden md:flex flex-1 justify-center px-8"
            ref={searchContainerRef}
          >
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <input
                type="search"
                placeholder="Search songs, artists..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                className="w-full pl-10 pr-4 py-2 rounded-full bg-secondary/30 border border-border/50 focus:border-crimson-pink/50 transition-colors text-foreground placeholder-muted-foreground focus:outline-none text-sm"
              />

              {searchFocused && searchValue.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 dropdown-opaque shadow-glass overflow-hidden z-50">
                  {filteredSongs.length > 0 ? (
                    <div className="py-2">
                      {filteredSongs.map((song) => (
                        <button
                          key={song.id}
                          onClick={() => handleSongClick(song)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/50 transition-colors text-left"
                        >
                          <Music className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium truncate">
                              {song.title}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {song.artist?.name || "Unknown"}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      No results found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT ICONS */}
          <div className="hidden md:flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => navigate("/songs")}
              className="p-2 rounded-full hover:bg-secondary/30 transition-colors"
            >
              <Music className="h-5 w-5 text-muted-foreground hover:text-foreground" />
            </button>
            <button
              onClick={() => navigate("/recordings")}
              className="p-2 rounded-full hover:bg-secondary/30 transition-colors"
            >
              <Mic className="h-5 w-5 text-muted-foreground hover:text-foreground" />
            </button>
            <button
              onClick={() => setAuthDialogOpen(true)}
              className="p-2 rounded-full hover:bg-secondary/30 transition-colors"
            >
              <User className="h-5 w-5 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 pt-14 pb-24 md:pb-0">{content}</main>

      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}
