import { PiGraph } from "react-icons/pi";
import { MdGridOn } from "react-icons/md";
import { useThemeContext } from "../context/themeContext";

export default function MinistryViewModeToggleButton({ viewMode, setViewMode }) {
  const { colors } = useThemeContext();
  const isGraph = viewMode === "Graph";

  return (
    <div className="flex justify-end w-full sm:w-auto landscape:w-auto portrait:w-auto">
      <div
        className="relative flex bg-transparent rounded-sm w-20 md:w-38 h-10 select-none"
        style={{ border: `1px solid ${colors.textMuted}` }}>
        <div
          className={`absolute top-0 bottom-0 w-1/2 rounded-md transition-all duration-300`}
          style={{
            left: isGraph ? "50%" : "0",
            borderLeft: isGraph ? `1px solid ${colors.textMuted}` : undefined,
            borderRight: !isGraph ? `1px solid ${colors.textMuted}` : undefined,
          }}
        />

        {/* List Button */}
        <button
          onClick={() => setViewMode("Grid")}
          className={`hover:cursor-pointer relative z-10 flex items-center justify-center gap-1 w-1/2 text-sm font-medium transition-all rounded-md ${!isGraph ? "text-primary/80 bg-foreground/10" : "text-primary/50"
            }`}
        >
          <MdGridOn className={"text-base transition-all opacity-80"} />
          <span className="hidden md:block">List</span>
        </button>

        {/* Graph Button */}
        <button
          onClick={() => setViewMode("Graph")}
          className={`hover:cursor-pointer relative z-10 flex items-center justify-center gap-1 w-1/2 text-sm font-medium transition-all rounded-md ${isGraph ? "text-primary/80 bg-foreground/10" : "text-primary/50"
            }`}
        >
          <PiGraph className={"text-base transition-all opacity-80"} />
          <span className="hidden md:block">Graph</span>
        </button>
      </div>
    </div>
  );
}
