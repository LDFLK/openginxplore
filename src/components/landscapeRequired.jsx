import { useEffect, useState } from "react";

export default function LandscapeRequired({
  smallMaxWidth = 768,
  children,
  message = "Rotate your device to landscape 📱↔️"
}) {
  const [isLandscape, setIsLandscape] = useState(
    window.innerWidth > window.innerHeight
  );

  const isSmallScreen = window.innerWidth < smallMaxWidth;

  useEffect(() => {
    const onResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (isSmallScreen && !isLandscape) {
    return (
      <div style={overlayStyle}>
        {message}
      </div>
    );
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
