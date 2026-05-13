import { User2 } from "lucide-react";

export default function PersonAvatar({ isOnline, imageUrl, image, name, className = "" }) {
  const src = imageUrl || image;
  return isOnline && src ? (
    <img
      src={src}
      alt={name}
      className={`object-cover rounded-full border border-border flex-shrink-0 ${className}`}
    />
  ) : (
    <div className={`rounded-full border border-border flex-shrink-0 flex items-center justify-center bg-foreground/10 ${className}`}>
      <User2 className="text-primary/40 w-6 h-6" />
    </div>
  );
}
