import React from "react";

export default function BackgroundGradientEffect() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(128, 131, 133, 0.1)_0%,transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.1)_0%,transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_90%,rgba(168,85,247,0.25)_0%,rgba(34,211,238,0.15)_30%,transparent_60%)]"></div>
    </div>
  );
}
