import { useThemeContext } from "../themeContext";

export default function LoadingComponent({ size = 40, OsColorMode = true }) {
  const { colors } = useThemeContext();

  return (
    <div
      className={`flex flex-col justify-center items-center w-full h-screen ${
        OsColorMode &&
        "bg-[#EBF2F5] dark:bg-[#181818] text-[#181818] dark:text-[#EBF2F5]"
      }`}
      style={{ color: OsColorMode ? "" : colors.textPrimary }}
    >
      {/* Loading Spinner */}
      <div className="flex justify-center mt-8">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-gray-700"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-500 border-r-purple-500 animate-spin"></div>
        </div>
      </div>

      {/* Please Wait Message */}
      <div className="text-center mt-8">
        <p className="text-gray-500 text-sm animate-pulse">
          Please wait while we prepare everything for you...
        </p>
      </div>
    </div>
  );
}
