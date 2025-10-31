import { Moon, Sun } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useThemeContext } from "../themeContext";

export default function ThemeToggle() {
  
    const [isDark, setIsDark] = useState(false);
    const {toggleTheme} = useThemeContext();
  
    useEffect(() => {
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }, [isDark]);

  return (
    <button
      onClick={() => {setIsDark(!isDark); toggleTheme() }}
      className="rounded-full relative top-0 hover:cursor-pointer"
    >
      {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
    </button>
  );
}
