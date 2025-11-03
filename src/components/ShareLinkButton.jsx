import { useState } from "react";
import { Share2 } from "lucide-react";

const ShareLinkButton = () => {
  const copyLink = () => {
    const currentUrl = window.location.href;
    navigator.clipboard
      .writeText(currentUrl)
      .then(() => alert("Link copied to clipboard!"))
      .catch(() => alert("Failed to copy link."));
  };

  return (
    <div className="relative z-50">
      <button
        onClick={copyLink}
        className={`
          flex items-center border border-accent text-accent justify-center px-3 py-2 rounded-lg
          cursor-pointer hover:bg-accent hover:text-primary-foreground
          transition-all duration-700
        `}
      >
        <Share2 size={18} />
        <span className="ml-2 text-sm whitespace-nowrap">Share</span>
      </button>
    </div>
  );
};

export default ShareLinkButton;
