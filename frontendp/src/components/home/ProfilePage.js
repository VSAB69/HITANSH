import React from "react";
import { useAuth } from "../../context/useAuth";
import { motion } from "framer-motion";
import { User, Mail, Shield } from "lucide-react";

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-8 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-gray-900/50 backdrop-blur-xl 
                   border border-purple-400/20 rounded-2xl p-8 shadow-xl"
      >
        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-24 h-24 rounded-full bg-purple-600 
                       flex items-center justify-center shadow-lg"
          >
            <span className="text-4xl font-extrabold">
              {user?.username?.charAt(0).toUpperCase()}
            </span>
          </motion.div>
        </div>

        {/* Header */}
        <h1 className="text-3xl font-extrabold text-center text-purple-300 mb-8">
          My Profile
        </h1>

        {/* Profile Fields */}
        <div className="space-y-5">
          <ProfileRow
            icon={<User className="w-5 h-5 text-purple-300" />}
            label="Username"
            value={user?.username}
          />

          <ProfileRow
            icon={<Mail className="w-5 h-5 text-purple-300" />}
            label="Email"
            value={user?.email}
          />

          <ProfileRow
            icon={<Shield className="w-5 h-5 text-purple-300" />}
            label="Role"
            value={user?.role}
          />
        </div>
      </motion.div>
    </div>
  );
};

const ProfileRow = ({ icon, label, value }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="flex items-center gap-4 p-4 rounded-xl 
                 bg-gray-800/50 border border-purple-400/10"
    >
      <div className="p-2 rounded-lg bg-purple-600/20">{icon}</div>
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-lg font-semibold text-white">{value || "—"}</p>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
