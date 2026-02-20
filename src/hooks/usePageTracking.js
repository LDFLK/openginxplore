import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const usePageTracking = () => {
    const location = useLocation();

    useEffect(() => {
        const pagePath = location.pathname + location.search + location.hash;

        // Skip tracking if measurement ID is not configured in config.js
        const measurementId = window.configs && window.configs.gaMeasurementId;
        if (!measurementId) {
            console.warn("⚠️ Measurement ID is not available");
            return;
        }

        if (typeof window.gtag === "function") {
            window.gtag("event", "page_view", {
                page_path: pagePath,
                page_location: window.location.href,
                page_title: document.title,
            });
        } else {
            console.warn("⚠️ window.gtag is NOT available");
        }
    }, [location.pathname, location.search, location.hash]);
};