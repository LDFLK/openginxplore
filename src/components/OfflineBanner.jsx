import { WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useNetworkStatus from "../hooks/useNetworkStatus";

/**
 * OfflineBanner component that appears when the user is offline
 */
const OfflineBanner = () => {
  const isOnline = useNetworkStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed top-0 left-0 w-full z-[9999] bg-[#FEF08A] text-[#713f12] overflow-hidden shadow-sm border-b border-[#713f12]/10 backdrop-blur-md"
        >
          <div className="flex items-center justify-center gap-3 py-2 px-4 text-sm font-semibold">
            <WifiOff size={18} className="animate-pulse" />
            <span>You are currently offline. Some features may not be available.</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineBanner;
