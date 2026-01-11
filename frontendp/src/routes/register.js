import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User } from "lucide-react";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");

  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async () => {
    setError("");

    if (password !== passwordConfirm) {
      setError("Passwords do not match");
      return;
    }

    await registerUser(username, email, password, passwordConfirm);
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
        <span className="text-crimson-pink">Caden</span>
        <span className="text-accent">cea</span>
      </motion.h1>

      {/* Register Card */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md card-glass p-8"
      >
        <h2 className="text-2xl font-bold text-foreground text-center mb-2">
          Create Account
        </h2>
        <p className="text-muted-foreground text-center mb-8">
          Join Cadencea and start singing
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

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              className="w-full pl-11 pr-4 py-3 rounded-lg bg-secondary/30 border border-border/50 focus:border-crimson-pink/50 transition-colors text-foreground placeholder-muted-foreground focus:outline-none"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

          {/* Confirm Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              className="w-full pl-11 pr-4 py-3 rounded-lg bg-secondary/30 border border-border/50 focus:border-crimson-pink/50 transition-colors text-foreground placeholder-muted-foreground focus:outline-none"
              placeholder="Confirm Password"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
          </div>

          {/* Error */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-crimson-pink text-sm text-center"
            >
              {error}
            </motion.p>
          )}

          {/* Register Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRegister}
            className="w-full btn-gradient py-3 rounded-lg font-semibold mt-2"
          >
            Register
          </motion.button>

          <p className="text-center text-muted-foreground mt-4">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-crimson-pink hover:text-crimson-pink/80 cursor-pointer font-medium"
            >
              Sign in
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
