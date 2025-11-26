import { useState, useEffect } from "react";
import BackgroundGradientEffect from "../../XploreGovHome/components/backgroundGradientEffect";
import AnimatedDots from "../../XploreGovHome/components/animatedDots";
import { Link } from "react-router-dom";

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
    <div className="min-h-screen bg-background relative overflow-hidden">
      <BackgroundGradientEffect/>
      <AnimatedDots/>
      <div className="absolute z-20 p-10 left-20">
        <Link to={"/"}>
          <h2 className="text-normal md:text-2xl font-semibold">
            <span className="text-accent">
              OpenGIN<span className="text-primary">Xplore</span>
            </span>
          </h2>
        </Link>
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
                      className="w-full h-full object-cover opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                  </div>

                  {/* Text Content */}
                  <div className="p-6 bg-gray-900/90 backdrop-blur-sm">
                    <h2 className="text-xl md:text-2xl text-white mb-2">
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
                <span className="text-primary">Loading Progress</span>
                <span className="text-accent font-semibold">{progress}%</span>
              </div>

              <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent via-purple-light to-purple-dark rounded-full transition-all duration-500 ease-out shadow-lg shadow-cyan-500/50"
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
                      ? "w-8 bg-accent"
                      : "w-1.5 bg-muted"
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
