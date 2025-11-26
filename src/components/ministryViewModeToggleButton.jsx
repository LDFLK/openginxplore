import { PiGraph } from "react-icons/pi";
import { MdGridOn } from "react-icons/md";

export default function MinistryViewModeToggleButton({ viewMode, setViewMode }) {
  const isGraph = viewMode === "Graph";

  return (
    <div className="flex justify-end w-full sm:w-auto">
      <div className="relative flex bg-transparent border border-foreground/80 rounded-md w-38 h-10 select-none">
        <div
          className={`absolute top-0 bottom-0 w-1/2 rounded-md transition-all duration-300 ${
            isGraph ? "border-l-1 border-foreground/80" : "border-r-1 border-foreground/80"
          }`}
          style={{
            left: isGraph ? "50%" : "0",
            borderLeftColor: isGraph && "border-2 border-foreground/20",
            borderRightColor: !isGraph && "border-2 border-foreground/20",
          }}
        />

        {/* List Button */}
        <button
          onClick={() => setViewMode("Grid")}
          className={`hover:cursor-pointer relative z-10 flex items-center justify-center gap-1 w-1/2 text-sm font-medium transition-all rounded-md ${
            !isGraph ? "text-primary/80 bg-foreground/10" : "text-primary/50"
          }`}
        >
          <MdGridOn className={`text-base transition-all ${!isGraph ? "opacity-100" : "opacity-80"}`} />
          List
        </button>

        {/* Graph Button */}
        <button
          onClick={() => setViewMode("Graph")}
          className={`hover:cursor-pointer relative z-10 flex items-center justify-center gap-1 w-1/2 text-sm font-medium transition-all rounded-md ${
            isGraph ? "text-primary/80 bg-foreground/10" : "text-primary/50"
          }`}
        >
          <PiGraph className={`text-base transition-all ${isGraph ? "opacity-100" : "opacity-80"}`} />
          Graph
        </button>
      </div>
    </div>
  );
}
