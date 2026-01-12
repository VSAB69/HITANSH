import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import { User, Lock } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    await loginUser(username, password);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-navy-night p-6">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-crimson-pink/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-royal-blue/10 rounded-full blur-3xl" />
      </div>

      {/* Logo */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-4xl font-bold mb-8"
      >
        <span className="text-gradient">Cadencea</span>
      </motion.h1>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md card-glass p-8"
      >
        <h2 className="text-2xl font-bold text-foreground text-center mb-2">
          Welcome Back
        </h2>
        <p className="text-muted-foreground text-center mb-8">
          Sing. Record. Relive your voice.
        </p>

        <div className="space-y-4">
          {/* Username */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              className="w-full pl-11 pr-4 py-3 rounded-lg bg-secondary/30 border border-border/50 focus:border-crimson-pink/50 transition-colors text-foreground placeholder-muted-foreground focus:outline-none"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              className="w-full pl-11 pr-4 py-3 rounded-lg bg-secondary/30 border border-border/50 focus:border-crimson-pink/50 transition-colors text-foreground placeholder-muted-foreground focus:outline-none"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Login Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogin}
            className="w-full btn-gradient py-3 rounded-lg font-semibold mt-2"
          >
            Login
          </motion.button>

          <p className="text-center text-muted-foreground mt-4">
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-crimson-pink hover:text-crimson-pink/80 cursor-pointer font-medium"
            >
              Sign up
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
