import { X } from "lucide-react";
import { useThemeContext } from "../context/themeContext";

/**
 * Generic right-side sliding panel. Pure presentation - the caller owns
 * open/close state and supplies content via props/children.
 *
 * Usage:
 *   const [open, setOpen] = useState(false);
 *   <button onClick={() => setOpen(true)}>Open</button>
 *   <RightSidePanel isOpen={open} onClose={() => setOpen(false)} title="Details">
 *     ...content...
 *   </RightSidePanel>
 */
export default function RightSidePanel({
  isOpen,
  onClose,
  title,
  children,
  footer,
  width = "w-full md:w-1/2 lg:w-1/3",
}) {
  const { isDark } = useThemeContext();

  return (
    <>
      {/* Backdrop (mobile only, so the page content stays interactive on desktop) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`${isOpen ? `${width} p-3 md:p-4` : "w-0 p-0"
          } transition-all duration-300 ease-in-out overflow-hidden border-border md:border-l flex-shrink-0 bg-background-dark fixed md:sticky right-0 top-0 md:top-4 h-full md:h-[calc(100vh-2rem)] z-50 md:z-auto shadow-2xl md:shadow-none`}
      >
        {isOpen && (
          <div className="flex flex-col h-full min-w-[260px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 md:mb-4 shrink-0">
              {title && (
                <h2 className="text-base md:text-lg font-semibold tracking-tight text-foreground dark:text-white">
                  {title}
                </h2>
              )}
              <button
                onClick={onClose}
                aria-label="Close panel"
                className="ml-auto text-foreground/70 dark:text-white/70 hover:text-foreground dark:hover:text-white p-1 rounded-sm cursor-pointer transition-colors"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto pr-1 md:pr-2 custom-scrollbar">
              {children}
            </div>

            {/* Optional footer */}
            {footer && (
              <div className="shrink-0 pt-2 md:pt-3 mt-2 border-t border-border">
                {footer}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
