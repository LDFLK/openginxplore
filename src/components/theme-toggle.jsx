import { Moon, Sun } from "lucide-react";
import { useThemeContext } from "../themeContext";

export default function ThemeToggle() {
  
    const {isDark, toggleTheme} = useThemeContext();

  return (
    <button
      onClick={() => { toggleTheme() }}
      className="rounded-full relative top-0 hover:cursor-pointer"
    >
      {isDark ? <Sun className="w-6 h-6 text-foreground/75" /> : <Moon className="w-6 h-6 text-primary/75" />}
    </button>
  );
}
