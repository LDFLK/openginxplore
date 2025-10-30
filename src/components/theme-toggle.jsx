import { Moon, Sun } from "lucide-react";
import React from "react";

export default function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      onClick={() => onToggle(!isDark)}
      className="rounded-full relative top-0 hover:cursor-pointer"
    >
      {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
    </button>
  );
}
