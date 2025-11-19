import { PiGraph } from "react-icons/pi";
import { MdGridOn } from "react-icons/md";

export default function MinistryViewModeToggleButton({ viewMode, setViewMode }) {
  const isGraph = viewMode === "Graph";

  return (
    <div className="flex justify-end">
      <div className="relative flex bg-transparent border-2 border-foreground/20 rounded-md w-48 h-14.5 select-none">
        <div
          className={`absolute top-0 bottom-0 w-1/2 rounded-md transition-all duration-300
    ${isGraph ? "border-l-2 border-foreground/20" : "border-r-2 border-foreground/20"}
  `}
          style={{ left: isGraph ? "50%" : "0", borderLeftColor: isGraph && "border-2 border-foreground/20", borderRightColor: !isGraph && "border-2 border-foreground/20" }}
        />

        <button
          onClick={() => setViewMode("Grid")}
          className={`relative z-10 flex items-center justify-start gap-1 w-1/2 py-3 px-3  hover: cursor-pointer  text-md font-medium transition-all rounded-md
            ${!isGraph ? "text-primary/80 bg-foreground/10" : "text-primary/50"}
          `}
        >
          <MdGridOn className={`text-lg transition-all ${!isGraph ? "opacity-100" : "opacity-50"}`} />
          List
        </button>

        <button
          onClick={() => setViewMode("Graph")}
          className={`relative z-10 flex items-center justify-center hover: cursor-pointer gap-1 w-1/2 py-3 px-3 text-md font-medium transition-all rounded-md
            ${isGraph ? "text-primary/80 bg-foreground/10" : "text-primary/50"}
          `}
        >
          <PiGraph className={`text-lg transition-all ${isGraph ? "opacity-100" : "opacity-50"}`} />
          Graph
        </button>

      </div>
    </div>
  );
}