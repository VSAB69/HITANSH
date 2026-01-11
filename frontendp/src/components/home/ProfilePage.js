import React from "react";
import { useAuth } from "../../context/useAuth";
import { motion } from "framer-motion";
import { User, Mail, Shield } from "lucide-react";

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-3.5rem)] p-8 flex items-center justify-center">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-crimson-pink/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-royal-blue/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md card-glass p-8"
      >
        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-crimson-pink to-crimson-pink/60 
                       flex items-center justify-center shadow-lg"
          >
            <span className="text-4xl font-bold text-white">
              {user?.username?.charAt(0).toUpperCase()}
            </span>
          </motion.div>
        </div>

        {/* Header */}
        <h1 className="text-2xl font-bold text-center text-foreground mb-8">
          My Profile
        </h1>

        {/* Profile Fields */}
        <div className="space-y-4">
          <ProfileRow
            icon={<User className="w-5 h-5 text-crimson-pink" />}
            label="Username"
            value={user?.username}
          />

          <ProfileRow
            icon={<Mail className="w-5 h-5 text-crimson-pink" />}
            label="Email"
            value={user?.email}
          />

          <ProfileRow
            icon={<Shield className="w-5 h-5 text-crimson-pink" />}
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
      whileHover={{ scale: 1.01 }}
      className="flex items-center gap-4 p-4 rounded-lg 
                 bg-secondary/30 border border-border/50"
    >
      <div className="p-2 rounded-lg bg-crimson-pink/20">{icon}</div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-base font-medium text-foreground">{value || "—"}</p>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
