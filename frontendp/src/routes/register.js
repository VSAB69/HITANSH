import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User } from "lucide-react";
import "./authbg.css";

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
    <div className="auth-bg-container no-scroll-bg">
      {/* 🌌 CONTINUOUS BACKGROUND LAYERS */}
      <div className="animated-gradient-layer" />
      <div className="animated-mesh" />
      <div className="orb orb1" />
      <div className="orb orb2" />
      <div className="orb orb3" />
      <div className="floating-particles" />

      {/* 🔥 APP TITLE */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="unify-title"
      >
        <motion.span
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
          className="unify-gradient"
        >
          CADENCEA
        </motion.span>
      </motion.h1>

      {/* 📝 REGISTER CARD */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="auth-card relative z-10"
      >
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-sub">Join CADENCEA and start singing 🎶</p>

        <div className="space-y-6">
          {/* Username */}
          <div className="input-wrap">
            <User className="input-icon" />
            <input
              className="auth-input"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="input-wrap">
            <Mail className="input-icon" />
            <input
              className="auth-input"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="input-wrap">
            <Lock className="input-icon" />
            <input
              className="auth-input"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Confirm Password */}
          <div className="input-wrap">
            <Lock className="input-icon" />
            <input
              className="auth-input"
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
              className="auth-error"
            >
              {error}
            </motion.p>
          )}

          {/* Register Button */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRegister}
            className="auth-btn"
          >
            Register
          </motion.button>

          <p className="login-text">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")} className="login-link">
              Sign in
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
