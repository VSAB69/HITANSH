import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authenticated_user, login, logout, register } from "../api/endpoints";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  const get_authenticated_user = async () => {
    try {
      const fetchedUser = await authenticated_user();
      setUser(fetchedUser);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (username, password) => {
    try {
      // Add try/catch to handle 401 errors
      const data = await login(username, password);
      if (data && data.user) {
        setUser(data.user); // backend sends { user: {...} }
        nav("/");
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("Incorrect username or password");
    }
  };

  const logoutUser = async () => {
    try {
      // Add try/catch in case logout fails
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      nav("/login");
    }
  };

  const registerUser = async (
    username,
    email,
    password,
    confirm_password,
    role = "participant"
  ) => {
    try {
      if (password === confirm_password) {
        const data = await register(username, email, password, role);
        if (data) {
          alert("User successfully registered");
          nav("/login");
        }
      } else {
        alert("Passwords do not match");
      }
    } catch (error) {
      // Catch registration errors (e.g., username taken)
      console.error("Registration failed:", error);
      alert("Error registering user. Please try again.");
    }
  };

  useEffect(() => {
    // FIX: Change dependency to [] to run only ONCE on app load
    get_authenticated_user();
  }, []); // <-- Corrected dependency array

  return (
    <AuthContext.Provider
      value={{ user, loading, loginUser, logoutUser, registerUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
