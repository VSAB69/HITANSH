// src/components/NavBar.jsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/useAuth";

import {
  Menu,
  LogOut,
  User,
  Home as HomeIcon,
  Music,
  Mic,
  Settings,
} from "lucide-react";

/* ----------------------------------
   NAV ITEMS (ROLE BASED)
----------------------------------- */
function getNavItems(user) {
  if (!user) return [];

  const clientItems = [
    { text: "Home", path: "/home", icon: <HomeIcon className="w-5 h-5" /> },
    { text: "Songs", path: "/songs", icon: <Music className="w-5 h-5" /> },
    {
      text: "My Recordings",
      path: "/recordings",
      icon: <Mic className="w-5 h-5" />,
    },
  ];

  if (user.role === "admin") {
    return [
      ...clientItems,
      {
        text: "Manage Songs",
        path: "/admin/songs",
        icon: <Settings className="w-5 h-5" />,
      },
    ];
  }

  return clientItems;
}

export default function NavBar({ content }) {
  const { user, logoutUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      {/* ----------------------------------
          TOP NAVBAR
      ----------------------------------- */}
      <header className="fixed inset-x-0 top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* LEFT */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-800"
            >
              <Menu className="w-6 h-6 text-purple-300" />
            </button>

            <Link to="/home" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-extrabold">C</span>
              </div>
              <span className="text-xl font-bold tracking-wide">CADENCEA</span>
            </Link>
          </div>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-2">
            {getNavItems(user).map((item) => (
              <Link
                to={item.path}
                key={item.text}
                className={`relative px-4 py-2 rounded-lg flex items-center gap-2 transition
                  ${
                    isActive(item.path)
                      ? "text-purple-300"
                      : "text-gray-300 hover:text-purple-300"
                  }`}
              >
                {item.icon}
                {item.text}

                {isActive(item.path) && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-purple-500 rounded-full"
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* RIGHT */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/profile" className="p-2 rounded-lg hover:bg-gray-800">
              <User className="w-5 h-5 text-purple-300" />
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-red-900/30"
            >
              <LogOut className="w-5 h-5 text-red-400" />
            </button>
          </div>
        </div>
      </header>

      {/* ----------------------------------
          MOBILE DRAWER
      ----------------------------------- */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 border-r border-purple-500/20"
            >
              <div className="p-4 border-b border-purple-500/20 flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center font-bold">
                  C
                </div>
                <span className="text-lg font-semibold">CADENCEA</span>
              </div>

              <ul className="p-3 space-y-1">
                {getNavItems(user).map((item) => (
                  <li key={item.text}>
                    <Link
                      to={item.path}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition
                        ${
                          isActive(item.path)
                            ? "bg-purple-600/20 text-purple-300"
                            : "text-gray-300 hover:bg-gray-800"
                        }`}
                    >
                      {item.icon}
                      {item.text}
                    </Link>
                  </li>
                ))}

                <button
                  onClick={handleLogout}
                  className="mt-4 flex w-full items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-900/30 text-red-400"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </ul>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ----------------------------------
          MOBILE BOTTOM NAV
      ----------------------------------- */}
      <nav className="md:hidden fixed bottom-4 inset-x-0 z-50 flex justify-center">
        <div className="bg-gray-900/90 backdrop-blur-xl border border-purple-500/20 rounded-3xl px-6 py-3 flex items-center gap-8 shadow-xl">
          {[
            { icon: <HomeIcon />, path: "/home" },
            { icon: <Music />, path: "/songs" },
            { icon: <Mic />, path: "/recordings" },
            { icon: <User />, path: "/profile" },
          ].map((item, i) => {
            const active = isActive(item.path);

            return (
              <Link to={item.path} key={i} className="relative">
                <motion.div
                  animate={{
                    scale: active ? 1.3 : 1,
                    color: active ? "#a855f7" : "#9ca3af",
                  }}
                >
                  {React.cloneElement(item.icon, {
                    className: "w-6 h-6",
                  })}
                </motion.div>

                {active && (
                  <motion.div
                    layoutId="mobile-indicator"
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-purple-500 rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ----------------------------------
          MAIN CONTENT
      ----------------------------------- */}
      <main className="flex-1 pt-16 pb-24 md:pb-0">{content}</main>
    </div>
  );
}
