import { useEffect, useState } from "react";

export default function LandscapeRequired({
  smallMaxWidth = 768,
  children,
  message = "Rotate your device to landscape 📱↔️"
}) {
  // Initialize with safe defaults
  const [isLandscape, setIsLandscape] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const updateSizes = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
      setIsSmallScreen(window.innerWidth < smallMaxWidth);
    };

    // Set initial values on mount
    updateSizes();

    window.addEventListener("resize", updateSizes);
    return () => window.removeEventListener("resize", updateSizes);
  }, [smallMaxWidth]); // depend on smallMaxWidth prop

  if (isSmallScreen && !isLandscape) {
    return <div style={overlayStyle}>{message}</div>;
  }

  return children;
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "rgba(0,0,0,0.9)",
  color: "#fff",
  fontSize: "20px",
  textAlign: "center",
  zIndex: 9999,
  padding: "16px"
};
