import { useState } from "react";
import { Share2 } from "lucide-react";

const ShareLinkButton = () => {
    const [hovered, setHovered] = useState(false);

    const copyLink = () => {
        const currentUrl = window.location.href;
        navigator.clipboard
            .writeText(currentUrl)
            .then(() => alert("Link copied to clipboard!"))
            .catch(() => alert("Failed to copy link."));
    };

    return (
        <div
            className="relative z-50"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <button
                onClick={copyLink}
                className={`
          flex items-center justify-center px-3 py-2 rounded-lg
          text-white border-none cursor-pointer
          transition-all duration-200
          ${hovered ? "bg-gray-800" : ""}
        `}
            >
                <Share2 size={18} />
                <span className="ml-2 text-sm whitespace-nowrap">Share</span>
            </button>
        </div>
    );
};

export default ShareLinkButton;
