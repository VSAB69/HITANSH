// src/components/NavBar.js
// Merged navbar: centered search bar, back/forward nav, icons, opaque dropdown
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/useAuth";
import ClientService from "./client/ClientService";
import Footer from "./Footer";

import {
  Menu,
  LogOut,
  User,
  Home as HomeIcon,
  Music,
  Mic,
  Settings,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

// Navigation history tracking
let navigationHistory = [];
let currentHistoryIndex = -1;
const MAX_HISTORY = 10;

// Tooltip component
const Tooltip = ({ children, content }) => {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 dropdown-opaque px-3 py-1.5 shadow-glass whitespace-nowrap">
          <p className="text-sm text-foreground">{content}</p>
        </div>
      )}
    </div>
  );
};

// Auth Dialog
const AuthDialog = ({ open, onOpenChange }) => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  if (!open) return null;

  const handleLogout = async () => {
    await logoutUser();
    onOpenChange(false);
    navigate("/login");
  };

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
              <h3 className="text-lg font-semibold text-foreground">{user.username}</h3>
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
            <h3 className="text-lg font-semibold text-foreground">Welcome to Cadencea</h3>
            <p className="text-sm text-muted-foreground">Sign in to access all features</p>

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

// Nav items
function getNavItems(user) {
  if (!user) return [];

  const clientItems = [
    { text: "Home", path: "/home", icon: <HomeIcon className="w-5 h-5" /> },
    { text: "Songs", path: "/songs", icon: <Music className="w-5 h-5" /> },
    { text: "My Recordings", path: "/recordings", icon: <Mic className="w-5 h-5" /> },
  ];

  if (user.role === "admin") {
    return [
      ...clientItems,
      { text: "Manage Songs", path: "/admin/songs", icon: <Settings className="w-5 h-5" /> },
    ];
  }

  return clientItems;
}

export default function NavBar({ content }) {
  const { user, logoutUser } = useAuth();
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

  const isActive = (path) => location.pathname.startsWith(path);

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
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
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

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  // Filter songs for search
  const filteredSongs = songs.filter((song) =>
    song.title?.toLowerCase().includes(searchValue.toLowerCase()) ||
    (song.artist?.name || '').toLowerCase().includes(searchValue.toLowerCase())
  ).slice(0, 5);

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
          {/* LEFT: Nav controls + Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* Back/Forward */}
            <button
              onClick={handleBack}
              disabled={!canGoBack}
              className={`p-1.5 rounded-full transition-colors ${canGoBack ? "hover:bg-secondary/30 text-foreground" : "opacity-30 cursor-not-allowed text-muted-foreground"
                }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleForward}
              disabled={!canGoForward}
              className={`p-1.5 rounded-full transition-colors ${canGoForward ? "hover:bg-secondary/30 text-foreground" : "opacity-30 cursor-not-allowed text-muted-foreground"
                }`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Logo */}
            <Link to="/home" className="ml-2">
              <span className="text-gradient text-xl font-bold">
                Cadencea
              </span>
            </Link>
          </div>

          {/* CENTER: Search Bar */}
          <div className="hidden md:flex flex-1 justify-center px-8" ref={searchContainerRef}>
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <input
                type="search"
                placeholder="Search songs, artists, or playlists..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                className="w-full pl-10 pr-4 py-2 rounded-full bg-secondary/30 border border-border/50 focus:border-crimson-pink/50 transition-colors text-foreground placeholder-muted-foreground focus:outline-none text-sm"
              />

              {/* Search Dropdown - OPAQUE */}
              {searchFocused && searchValue.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 dropdown-opaque shadow-glass overflow-hidden z-50 animate-fadeIn">
                  {filteredSongs.length > 0 ? (
                    <div className="py-2">
                      {filteredSongs.map((song) => (
                        <button
                          key={song.id}
                          onClick={() => handleSongClick(song)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/50 transition-colors text-left"
                        >
                          <div className="w-10 h-10 rounded-lg bg-secondary/50 overflow-hidden flex-shrink-0">
                            {song.cover_image ? (
                              <img src={song.cover_image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Music className="w-5 h-5 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{song.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{song.artist?.name || (typeof song.artist === 'string' ? song.artist : 'Unknown Artist')}</p>
                          </div>
                        </button>
                      ))}
                      <div className="border-t border-border/30 mt-2 pt-2 px-2">
                        <button
                          onClick={() => {
                            setSearchFocused(false);
                            setSearchValue("");
                            navigate("/songs");
                          }}
                          className="flex items-center gap-2 text-sm text-crimson-pink hover:text-crimson-pink/80 font-medium px-2 py-1.5 rounded hover:bg-secondary/30 w-full"
                        >
                          Show more
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
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

          {/* RIGHT: Icons (hidden on mobile - shown in bottom nav) */}
          <div className="hidden md:flex items-center gap-1 flex-shrink-0">
            <Tooltip content="All Songs">
              <button
                onClick={() => navigate("/songs")}
                className="p-2 rounded-full hover:bg-secondary/30 transition-colors"
              >
                <Music className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </button>
            </Tooltip>
            <Tooltip content="My Recordings">
              <button
                onClick={() => navigate("/recordings")}
                className="p-2 rounded-full hover:bg-secondary/30 transition-colors"
              >
                <Mic className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </button>
            </Tooltip>
            <button
              onClick={() => setAuthDialogOpen(true)}
              className="p-2 rounded-full hover:bg-secondary/30 transition-colors"
            >
              <User className="h-5 w-5 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
        </div>
      </header>



      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-4 inset-x-0 z-50 flex justify-center">
        <AnimatePresence mode="wait">
          {searchFocused ? (
            // Expanded Search Bar - full width
            <motion.div
              key="search-bar"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="mx-4 bg-navy-night/95 backdrop-blur-xl border border-border/30 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl w-full"
            >
              <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <input
                type="search"
                placeholder="Search songs..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                autoFocus
                className="flex-1 bg-transparent border-none focus:outline-none text-foreground placeholder-muted-foreground text-sm"
              />
              <button
                onClick={() => {
                  setSearchFocused(false);
                  setSearchValue("");
                }}
                className="p-1 rounded-full hover:bg-secondary/30"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </motion.div>
          ) : (
            // Normal Bottom Nav - compact, fits icons only
            <motion.div
              key="nav-icons"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-navy-night/90 backdrop-blur-xl border border-border/30 rounded-full px-5 py-3 flex items-center gap-5 shadow-xl"
            >
              {[
                { icon: <HomeIcon />, path: "/home" },
                { icon: <Music />, path: "/songs" },
                { icon: <Search />, action: () => setSearchFocused(true), isSearch: true },
                { icon: <Mic />, path: "/recordings" },
                { icon: <User />, path: "/profile" },
              ].map((item, i) => {
                const active = item.path ? isActive(item.path) : false;

                if (item.isSearch) {
                  return (
                    <button
                      key={i}
                      onClick={item.action}
                      className="flex items-center justify-center"
                    >
                      <Search className="w-6 h-6 text-muted-foreground hover:text-foreground transition-colors" />
                    </button>
                  );
                }

                return (
                  <Link
                    to={item.path}
                    key={i}
                    className="relative flex items-center justify-center"
                  >
                    <motion.div
                      animate={{
                        scale: active ? 1.15 : 1,
                        color: active ? "#E94560" : "#9ca3af",
                      }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-center"
                    >
                      {React.cloneElement(item.icon, { className: "w-6 h-6" })}
                    </motion.div>
                  </Link>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Search Results Dropdown */}
        {searchFocused && searchValue.length > 0 && (
          <div className="absolute bottom-full mb-2 left-4 right-4 dropdown-opaque shadow-glass overflow-hidden z-50 rounded-xl max-h-64 overflow-y-auto">
            {filteredSongs.length > 0 ? (
              <div className="py-2">
                {filteredSongs.map((song) => (
                  <button
                    key={song.id}
                    onClick={() => handleSongClick(song)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-secondary/50 overflow-hidden flex-shrink-0">
                      {song.cover_image ? (
                        <img src={song.cover_image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{song.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{song.artist?.name || 'Unknown'}</p>
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
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 pt-14 pb-24 md:pb-0">{content}</main>

      {/* FOOTER - hidden on mobile to not overlap with bottom nav */}
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}
