import { Moon, Sun } from "lucide-react";
import { useThemeContext } from "../context/themeContext";

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useThemeContext();

  return (
    <button
      onClick={() => {
        toggleTheme();
      }}
      className="rounded-full relative top-0 cursor-pointer mx-2"
    >
      {isDark ? (
        <Sun className="w-6 h-6 text-foreground/75 hover:text-primary/95" />
      ) : (
        <Moon className="w-6 h-6 text-primary/75 hover:text-primary/95" />
      )}
    </button>
  );
}
