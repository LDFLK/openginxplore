import { useEffect, useState } from "react";

export default function Version() {
  const [version, setVersion] = useState("");

  useEffect(() => {
    const version = window?.configs?.version
      ? window.configs.version
      : "rc-1-1";
    setVersion(version);
  }, []);

  return (
    <div className="text-center inline-flex items-center space-x-2 bg-blue-900/20 border border-blue-800/30 rounded-full px-4 py-1 text-blue-400 text-sm font-mono mb-4">
      <span className="text-xs">{version}</span>
    </div>
  );
}
