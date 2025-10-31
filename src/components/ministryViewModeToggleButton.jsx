import { PiGraph } from "react-icons/pi";
import { MdGridOn } from "react-icons/md";
import { useThemeContext } from "../themeContext";

export default function MinistryViewModeToggleButton({
  viewMode,
  setViewMode,
}) {
  return (
    <div className="flex justify-end">
      <button
        className={`flex justify-center items-center py-3 px-4 cursor-pointer transition-all duration-200 ease-in-out rounded-l-sm ${
          viewMode == "Grid" ? "text-primary bg-foreground/10" : "text-primary"
        }`}
        onClick={() => setViewMode("Grid")}
      >
        <MdGridOn className="mr-2 text-xl" />
        List
      </button>
      <button
        className={`flex justify-center items-center py-3 px-4 cursor-pointer transition-all duration-200 ease-in-out rounded-r-sm ${
          viewMode == "Graph" ? "text-primary bg-foreground/10" : "text-primary"
        }`}
        onClick={() => setViewMode("Graph")}
      >
        <PiGraph className="mr-2 text-xl" />
        Graph
      </button>
    </div>
  );
}
