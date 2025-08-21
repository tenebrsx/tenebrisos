import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cloud,
  CloudOff,
  Loader,
  CheckCircle,
  AlertTriangle,
  Wifi,
  WifiOff,
} from "lucide-react";
import clsx from "clsx";
import { useCloudStorage } from "../firebase/dataService";
import { useAuth } from "../contexts/AuthContext";

const SyncStatus = ({ className = "" }) => {
  const { isAuthenticated, currentUser } = useAuth();
  const { syncStatus } = useCloudStorage();
  const [showDetails, setShowDetails] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Update last sync time when status changes
  useEffect(() => {
    if (syncStatus.pendingSyncs === 0 && syncStatus.cloudAvailable) {
      setLastSyncTime(new Date());
    }
  }, [syncStatus.pendingSyncs, syncStatus.cloudAvailable]);

  // Get sync status info
  const getSyncInfo = () => {
    if (!isAuthenticated) {
      return {
        status: "offline",
        icon: CloudOff,
        color: "text-dark-text-muted",
        bgColor: "bg-dark-text-muted/10",
        message: "Sign in required",
        description: "Sign in to enable cloud sync",
      };
    }

    if (!syncStatus.isOnline) {
      return {
        status: "no-connection",
        icon: WifiOff,
        color: "text-accent-orange",
        bgColor: "bg-accent-orange/10",
        message: "No connection",
        description: "Changes will sync when online",
      };
    }

    if (!syncStatus.cloudAvailable) {
      return {
        status: "cloud-unavailable",
        icon: AlertTriangle,
        color: "text-accent-orange",
        bgColor: "bg-accent-orange/10",
        message: "Sync unavailable",
        description: isAuthenticated
          ? "Cloud service temporarily unavailable"
          : "Authentication required for cloud sync",
      };
    }

    if (syncStatus.pendingSyncs > 0) {
      return {
        status: "syncing",
        icon: Loader,
        color: "text-accent-blue",
        bgColor: "bg-accent-blue/10",
        message: "Syncing...",
        description: `${syncStatus.pendingSyncs} changes pending`,
      };
    }

    return {
      status: "synced",
      icon: CheckCircle,
      color: "text-accent-green",
      bgColor: "bg-accent-green/10",
      message: "Synced",
      description: lastSyncTime
        ? `Last sync: ${lastSyncTime.toLocaleTimeString()}`
        : "All data synced",
    };
  };

  const syncInfo = getSyncInfo();
  const Icon = syncInfo.icon;

  return (
    <div className={clsx("relative", className)}>
      <motion.button
        onClick={() => setShowDetails(!showDetails)}
        className={clsx(
          "flex items-center space-x-2 px-3 py-2 rounded-lg",
          "transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-accent-blue/50",
          "hover:bg-white/5",
          syncInfo.bgColor,
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={syncInfo.description}
      >
        <Icon
          className={clsx(
            syncInfo.color,
            syncInfo.status === "syncing" && "animate-spin",
          )}
          size={16}
        />
        <span className={clsx("text-xs font-medium", syncInfo.color)}>
          {syncInfo.message}
        </span>
      </motion.button>

      {/* Detailed Status Dropdown */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-64 bg-dark-surface border border-dark-border rounded-xl shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10">
              <h4 className="text-sm font-semibold text-dark-text">
                Sync Status
              </h4>
            </div>

            {/* Status Details */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-text-muted">Account</span>
                <div className="flex items-center space-x-2">
                  {isAuthenticated ? (
                    <>
                      <CheckCircle className="text-accent-green" size={14} />
                      <span className="text-sm text-accent-green">
                        Signed in
                      </span>
                    </>
                  ) : (
                    <>
                      <CloudOff className="text-dark-text-muted" size={14} />
                      <span className="text-sm text-dark-text-muted">
                        Not signed in
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-text-muted">Connection</span>
                <div className="flex items-center space-x-2">
                  {syncStatus.isOnline ? (
                    <>
                      <Wifi className="text-accent-green" size={14} />
                      <span className="text-sm text-accent-green">Online</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="text-accent-orange" size={14} />
                      <span className="text-sm text-accent-orange">
                        Offline
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-text-muted">
                  Cloud Storage
                </span>
                <div className="flex items-center space-x-2">
                  {syncStatus.cloudAvailable ? (
                    <>
                      <Cloud className="text-accent-blue" size={14} />
                      <span className="text-sm text-accent-blue">
                        Available
                      </span>
                    </>
                  ) : (
                    <>
                      <CloudOff className="text-dark-text-muted" size={14} />
                      <span className="text-sm text-dark-text-muted">
                        Unavailable
                      </span>
                    </>
                  )}
                </div>
              </div>

              {syncStatus.pendingSyncs > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-dark-text-muted">
                    Pending Changes
                  </span>
                  <span className="text-sm text-accent-orange">
                    {syncStatus.pendingSyncs}
                  </span>
                </div>
              )}

              {isAuthenticated && currentUser && (
                <div className="pt-3 border-t border-white/10">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-accent-blue/20 rounded-full flex items-center justify-center">
                      <span className="text-xs text-accent-blue font-medium">
                        {currentUser.email?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-dark-text truncate">
                        {currentUser.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {!isAuthenticated && (
              <div className="px-4 py-3 bg-dark-bg/50 border-t border-white/10">
                <button
                  onClick={() => {
                    setShowDetails(false);
                    // Navigate to login page
                    window.location.href = "/login";
                  }}
                  className="w-full text-sm text-accent-blue hover:text-accent-blue/80 transition-colors"
                >
                  Sign in to enable cloud sync
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {showDetails && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDetails(false)}
        />
      )}
    </div>
  );
};

export default SyncStatus;
