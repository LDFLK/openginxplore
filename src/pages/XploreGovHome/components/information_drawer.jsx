import { BookOpenText, X, ArrowRight, Sparkles, BookA, Network } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function InformationDrawer({ onClose }) {
  const drawerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsOpen(true), 1);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (drawerRef.current && !drawerRef.current.contains(event.target)) {
        if (onClose) onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex justify-end">
      <div
        ref={drawerRef}
        className={`bg-gray-900/95 backdrop-blur-xl w-full max-w-2xl h-full shadow-2xl transform transition-all duration-700 ease-out flex flex-col border-l border-cyan-400/20 ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          }`}
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(56,189,248,0.1)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.08)_0%,transparent_50%)]"></div>

        {/* Animated particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 300}ms`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Header */}
        <div className="relative flex items-center justify-between px-8 py-6 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-400/30">
              <BookOpenText className="w-6 h-6 text-cyan-400" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              About
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800/50 rounded-xl transition-all duration-300 border border-transparent hover:border-cyan-400/30"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-gray-400 hover:text-cyan-400 transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div className="relative flex-1 overflow-y-auto px-8 py-8">
          <div className="space-y-8">
            <p className="text-gray-300 text-lg leading-relaxed">
              Explore the evolution of Sri Lanka's government through structural visualizations,
              presidential timelines, and ministry networks. Track changes across presidencies,
              understand ministry-department relationships, and gain insights into official roles
              and governance patterns.
            </p>

            {/* Additional info section */}
            <div className="mt-12 p-6 rounded-xl bg-gradient-to-br from-cyan-950/20 to-blue-950/20 border border-cyan-400/20">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-cyan-500/10 rounded-lg mt-1">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    Transparency through Data
                  </h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Connecting data, time, and governance to provide unprecedented insights into how Sri Lanka's government evolves and operates.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-8 mt-15 justify-center">
              {/* Button 1 */}
              <a
                href="/docs?file=information-pane"
                target="_blank"
                className="group flex items-center gap-2 px-4 py-2 bg-gray-800/50 backdrop-blur-sm rounded-full border border-gray-700/50 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105"
              >
                <Network className="w-5 h-5 text-cyan-400" />
                <span className="text-white font-semibold text-sm">Sri Lankan Government</span>
                <ArrowRight className="w-4 h-4 text-cyan-400" />
              </a>

              {/* Button 2 */}
              <a
                href="/docs?file=glossary"
                target="_blank"
                className="group flex items-center gap-2 px-4 py-2 bg-gray-800/50 backdrop-blur-sm rounded-full border border-gray-700/50 hover:border-purple-400/50 transition-all duration-300 hover:scale-105"
              >

                <BookA className="w-5 h-5 text-purple-400" />
                <span className="text-white font-semibold text-sm">Glossary</span>
                <ArrowRight className="w-4 h-4 text-purple-400" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}