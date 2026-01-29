import { useEffect, useState } from "react";
import { RotateCw, ArrowLeft } from "lucide-react";
import { HiOutlineDevicePhoneMobile } from "react-icons/hi2";

export default function LandscapeRequired({
    smallMaxWidth = 768,
    children,
    message = "Please rotate your device to landscape mode",
    backgroundColor = "rgba(255, 255, 255, 0.95)",
    onBack = null
}) {
    const [isLandscape, setIsLandscape] = useState(false);
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    useEffect(() => {
        const updateSizes = () => {
            setIsLandscape(window.innerWidth > window.innerHeight);
            setIsSmallScreen(window.innerWidth < smallMaxWidth);
        };

        updateSizes();

        window.addEventListener("resize", updateSizes);
        return () => window.removeEventListener("resize", updateSizes);
    }, [smallMaxWidth]);

    if (isSmallScreen && !isLandscape) {
        return (
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    background: backgroundColor,
                    zIndex: 9999,
                    padding: "20px"
                }}
            >
                {onBack && (
                    <button
                        onClick={onBack}
                        style={{
                            position: "absolute",
                            top: "20px",
                            left: "20px",
                            background: "rgba(0, 0, 0, 0.1)",
                            border: "none",
                            borderRadius: "8px",
                            padding: "10px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "background 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0, 0, 0, 0.15)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "rgba(0, 0, 0, 0.1)"}
                    >
                        <ArrowLeft size={24} color="#333" />
                    </button>
                )}

                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "24px",
                        textAlign: "center"
                    }}
                >
                    <div
                        style={{
                            animation: "rotate 2s ease-in-out infinite",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        <HiOutlineDevicePhoneMobile size={64} style={{ color: "var(--accent)" }} strokeWidth={1.5} />
                    </div>

                    <p
                        style={{
                            fontSize: "18px",
                            color: "#333",
                            maxWidth: "300px",
                            lineHeight: "1.6",
                            margin: 0,
                            fontWeight: 500
                        }}
                    >
                        {message}
                    </p>
                </div>

                <style>{`
          @keyframes rotate {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(92deg); }
          }
        `}</style>
            </div>
        );
    }

    return children;
}

