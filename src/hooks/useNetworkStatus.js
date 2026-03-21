import { useState, useEffect } from "react";
import network from "../utils/network";

/**
 * Hook to monitor the user's online/offline status
 * @returns {boolean} True if the user is online, false otherwise
 */
const useNetworkStatus = () => {
  // Use network.isOnline() for the initial status when the app loads
  const [isOnline, setIsOnline] = useState(network.isOnline());

  useEffect(() => {
    // Event listeners to detect changes after load
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check just in case it changed between mounting and effect
    setIsOnline(network.isOnline());

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
};

export default useNetworkStatus;
