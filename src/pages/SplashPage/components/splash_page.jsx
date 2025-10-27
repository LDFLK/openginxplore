import { useState, useEffect } from "react";

const SplashPage = ({ progress, setProgress }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image:
        "/loading_images/loading_image_1.jpg",
      title: "Loading Government Data",
      message: "Gathering information from various ministries...",
      gradient: "from-cyan-500/20 to-blue-500/20",
    },
    {
      image:
        "/loading_images/loading_image_2.jpg",
      title: "Fetching Officials",
      message: "Retrieving profiles and career histories...",
      gradient: "from-purple-500/20 to-pink-500/20",
    },
    {
      image:
        "/loading_images/loading_image_3.jpg",
      title: "Analyzing Statistics",
      message: "Processing organizational relationships...",
      gradient: "from-blue-500/20 to-purple-500/20",
    },
  ];

  useEffect(() => {
    // Slide rotation
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => {
      // clearInterval(progressInterval);
      clearInterval(slideInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Background Effects - matching XploreGov style */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.1)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.1)_0%,transparent_50%)]"></div>
      </div>

      {/* Animated particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 150}ms`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-3xl w-full">
          {/* Slide Container */}
          <div className="relative h-96 mb-8">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-700 ${
                  currentSlide === index
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-95 translate-y-4"
                }`}
              >
                <div className="bg-gray-900/70 backdrop-blur-xl rounded-2xl overflow-hidden border border-gray-700/50 shadow-2xl h-full flex flex-col">
                  {/* Image Section */}
                  <div className="relative flex-1 overflow-hidden">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`}
                    ></div>
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-contain opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                  </div>

                  {/* Text Content */}
                  <div className="p-6 bg-gray-900/90 backdrop-blur-sm">
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                      {slide.title}
                    </h2>
                    <p className="text-gray-400 text-base">{slide.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Loading Progress</span>
                <span className="text-cyan-400 font-semibold">{progress}%</span>
              </div>

              <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-full transition-all duration-500 ease-out shadow-lg shadow-cyan-500/50"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
              </div>
            </div>

            {/* Slide Indicators */}
            <div className="flex justify-center gap-2 pt-4">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentSlide === index
                      ? "w-8 bg-gradient-to-r from-cyan-400 to-purple-600"
                      : "w-1.5 bg-gray-700"
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default SplashPage;
