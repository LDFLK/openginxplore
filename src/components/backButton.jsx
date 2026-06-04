import { ArrowLeftIcon } from "lucide-react";

export default function BackButton({ onClick, text = "Go Back" }) {

    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 text-primary/70 hover:text-primary mb-2 transition-colors text-sm cursor-pointer">
            <ArrowLeftIcon className="w-4 h-4" />
            <span className="font-medium">{text}</span>
        </button>
    );
}