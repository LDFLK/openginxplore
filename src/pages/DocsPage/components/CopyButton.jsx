import { Link2 } from "lucide-react";
import { useState } from "react";

export const CopyButton = ({ link }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    return (
        <div className="relative flex items-center">
            <button
                onClick={handleCopy}
                title="Copy link"
                className="p-1 transition-opacity duration-200 opacity-0 group-hover:opacity-100 hover:cursor-pointer"
            >
                <Link2 size={18} className="text-gray-400 hover:text-blue-500" />
            </button>
            {copied && (
                <span className="absolute left-6 text-xs bg-gray-800 text-white px-2 py-1 rounded-md shadow-md animate-fade-in-out">
                    Copied!
                </span>
            )}
        </div>
    );
};