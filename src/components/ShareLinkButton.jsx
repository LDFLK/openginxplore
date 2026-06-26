import { Share2, Check } from "lucide-react";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard";

const ShareLinkButton = () => {
  const { copied, copy } = useCopyToClipboard(2000);

  const copyLink = async () => {
    const currentUrl = window.location.href;
    const success = await copy(currentUrl);
    if (!success) {
      alert("Failed to copy link.");
    }
  };

  return (
    <div className="relative z-50">
      <button
        onClick={copyLink}
        className={`
          flex gap-2 justify-center items-center px-2 md:px-3 py-1 md:py-2 rounded-md text-accent/95 hover:text-accent bg-accent/5 hover:bg-accent/10 border-accent/10 hover:border-accent/15 cursor-pointer border transition-all
          ${copied ? 'bg-accent/10 border-accent/15' : ''}
        `}
      >
        {copied ? <Check size={22} className="text-green-500" /> : <Share2 size={22} />}
        <span className="text-xs md:text-sm whitespace-nowrap hidden md:block">
          {copied ? "Copied!" : "Share"}
        </span>
      </button>
    </div>
  );
};

export default ShareLinkButton;

