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
    <div className="relative">
      <button
        onClick={copyLink}
        className={`
          flex gap-2 justify-center items-center px-3 py-2 rounded-md text-accent/95 hover:text-accent bg-accent/5 hover:bg-accent/10 border-accent/10 hover:border-accent/15 cursor-pointer border
        `}
      >
        <Share2 size={22} />
        <span className="text-sm whitespace-nowrap hidden md:block">Share</span>
      </button>
    </div>
  );
};

export default ShareLinkButton;
