import { User2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function PersonAvatar({ isOnline, imageUrl, image, name, className = "" }) {
  const [imgError, setImgError] = useState(false);
  const src = imageUrl || image;

  useEffect(() => {
    setImgError(false);
  }, [src]);

  return isOnline && src && !imgError ? (
    <img
      src={src}
      alt={name}
      onError={() => setImgError(true)}
      className={`object-cover rounded-full border border-border flex-shrink-0 ${className}`}
    />
  ) : (
    <div className={`rounded-full border border-border flex-shrink-0 flex items-center justify-center bg-foreground/10 ${className}`}>
      <User2 className="text-primary/40 w-6 h-6" />
    </div>
  );
}
