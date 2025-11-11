import { useEffect, useRef, useState } from "react";
import {
  ChevronRight,
  TrendingUp,
  Network,
  Users,
  Building2,
  History,
  Calendar,
  GitBranch,
  FileText,
} from "lucide-react";
import ForceGraph3D from "react-force-graph-3d";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "../../../components/theme-toggle";
import Footer from "../components/footer";
import BackgroundGradientEffect from "../components/backgroundGradientEffect";
import AnimatedDots from "../components/animatedDots";
import PresidentialTimeline from "../components/PresidentialTimeline";
import { useThemeContext } from "../../../themeContext";

// Simulate the 3D network data structure
const genRandomTree = (N = 100) => {
  return {
    nodes: [...Array(N).keys()].map((i) => ({
      id: i,
      type: i < 20 ? "ministry" : i < 60 ? "department" : "person",
    })),
    links: [...Array(N).keys()]
      .filter((id) => id)
      .map((id) => ({
        source: id,
        target: Math.round(Math.random() * (id - 1)),
      })),
  };
};

const XploreGovHomepage = () => {
  const navigate = useNavigate();
  const graphData = genRandomTree();
  const { colors, isDark } = useThemeContext();

  const COLORS = isDark
    ? ["#22d3ee", "#3b82f6", "#a855f7"] // cyan, blue, purple for dark mode
    : ["#06b6d4", "#60a5fa", "#c084fc"]; // lighter versions for light mode

  const [currentIndex, setCurrentIndex] = useState(0);
  const cards = [0, 1];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const NetworkVisualization = () => {
    const graphRef = useRef();

    useEffect(() => {
      return () => {
        if (graphRef.current) {
          try {
            const renderer = graphRef.current._renderer;
            if (renderer) {
              renderer.dispose();
              renderer.forceContextLoss();
            }
          } catch (e) {
            console.warn("Error cleaning up ForceGraph3D:", e);
          }
        }
      };
    }, []);
    return (
      <div className="relative h-40 rounded-xl bg-gradient-to-br from-gray-900/50 to-gray-800/50 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <ForceGraph3D
            ref={graphRef}
            graphData={graphData}
            backgroundColor={isDark ? colors.backgroundBlue : "#fff"}
            linkColor={() => (isDark ? "#e4dcdcff" : "#1c1a1aff")}
            nodeColor={() => COLORS[Math.floor(Math.random() * COLORS.length)]}
            enableNodeDrag={false}
            enableNavigationControls={false}
            showNavInfo={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="text-xs text-gray-300 mb-2">
            Live Organizational Structure
          </div>
          <div className="flex space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              <span className="text-gray-400">Personal</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-400">Organization</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-400">Geo-Location</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Background Effects */}
      <BackgroundGradientEffect />

      <div className="relative z-10 px-2 lg:px-6">
        <div className="p-2 md:px-14 lg:px-24 xl:px-56 mx-auto">
          {/* Hero Section */}
          <div className="py-2 md:py-4 lg:py-6 justify-between flex">
            <div className="pt-2 pb-4 text-left flex items-center space-x-3">
              <Link to={"/"}>
                <h2 className="text-normal md:text-2xl font-semibold">
                  <span className="text-accent">
                    OpenGIN<span className="text-primary">Xplore</span>
                  </span>
                </h2>
              </Link>
            </div>
            <ThemeToggle />
          </div>

          {/* Modern Split Section */}
          <div className="flex flex-col lg:flex-row justify-between gap-2 mt-0 lg:mt-6">
            {/* Left Text Section */}
            <div className="flex-1 justify-center text-center lg:text-left mt-8 lg:mt-12">
              <h2 className="text-3xl md:text-4xl lg:text-4xl xl:text-4xl font-bold text-primary leading-tight">
                Explore and Ignite <br />
                <span className="text-accent"> Insights from Data</span>
              </h2>
              <div className="w-full flex justify-center lg:justify-start px-3 md:px-0">
                <p className="text-muted-foreground text-sm text-center lg:text-left md:text-md xl:text-lg max-w-lg mt-4 flex justify-center">
                  OpenGINXplore is your entry point into the OpenGIN ecosystem -
                  an open environment for exploring, connecting, and
                  understanding data through interactive applications that turn
                  information into insights.
                </p>
              </div>
              <div className="flex mt-6 justify-center lg:justify-start">
                <button
                  className="bg-accent text-accent-foreground px-2.5 py-2 rounded-lg font-normal text-lg hover:scale-105 transition transform inline-flex items-center hover:cursor-pointer"
                  onClick={() => navigate("/organization")}
                >
                  <History className="w-6 h-6 mr-2" />
                  <span className="text-sm md:text-normal">
                    Quick Application
                  </span>
                  <ChevronRight className="w-6 h-6" />
                </button>
                <Link
                  to={"https://ldflk.github.io/nexoan/"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-none border mx-3 border-accent cursor-pointer text-accent px-3.5 py-2 rounded-lg font-normal text-lg hover:scale-105 transition transform inline-flex items-center hover:cursor-pointer"
                >
                  <FileText className="w-6 h-6 mr-2" />
                  <span className="text-sm md:text-normal">Docs</span>
                </Link>
              </div>
            </div>

            {/* Right Cards Section (Auto Slideshow) */}
            <div className="flex-1 w-full lg:w-1/2 mt-8">
              <div className="relative overflow-hidden rounded-xl">
                {/* Carousel container */}
                <div
                  className="flex transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                  {/* Card 1 */}
                  <div className="min-w-full px-2 border rounded-2xl border-border bg-foreground/8 shadow-2xl">
                    {/* Soft light gradient overlay for frosted effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

                    <div className="relative z-10 rounded-2xl px-1 py-2 md:p-4 lg:p-6 flex flex-col h-full">
                      {/* Header */}
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-500/15 border-blue-400/80 backdrop-blur-sm">
                          <TrendingUp className="w-3 md:w-6 h-3 md:h-6 text-accent" />
                        </div>
                        <div>
                          <h3 className="text-normal md:text-xl font-semibold text-primary/80">
                            Data Evolution Tracking
                          </h3>
                          <p className="text-sm md:text-sm text-primary/60">
                            Track how entities and their connections evolve over
                            time
                          </p>
                        </div>
                      </div>

                      {/* Main Timeline Content */}
                      <PresidentialTimeline />

                      {/* Footer */}
                      <div className="space-y-4 mt-6">
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-500/10 border-l-4 border-blue-400/80 backdrop-blur-sm">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          <span className="text-sm text-primary/75">
                            Role Transitions
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-purple-500/10 border-l-4 border-purple-400/80 backdrop-blur-sm">
                          <GitBranch className="w-4 h-4 text-purple-400" />
                          <span className="text-sm text-primary/75">
                            Organizational Restructuring
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="min-w-full  px-2 border rounded-2xl border-border bg-foreground/8 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

                    <div className="rounded-2xl px-1 py-2 md:p-4 lg:p-6 transition-all duration-300 group">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-dark-2/20 to-purple-dark/20">
                          <Network className="w-3 md:w-6 h-3 md:h-6 text-purple-light" />
                        </div>
                        <div>
                          <h3 className="text-normal md:text-xl font-semibold text-primary/80">
                            Organization Network Mapping
                          </h3>
                          <p className="text-sm md:text-sm text-primary/60">
                            Visualize connections and hierarchies
                          </p>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto">
                        <NetworkVisualization />
                      </div>
                      <div className="mt-6 space-y-4">
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-500/10 border-l-4 border-blue-400/80 backdrop-blur-sm">
                          <Building2 className="w-4 h-4 text-blue-400" />
                          <span className="text-sm text-primary/75">
                            Relationships Between Elements
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-purple-500/10 border-l-4 border-purple-400/80 backdrop-blur-sm">
                          <Users className="w-4 h-4 text-purple-400" />
                          <span className="text-sm text-primary/75">
                            Role and Connection Mapping
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Dots */}
              <div className="mt-15 w-full flex justify-center space-x-2">
                {cards.map((_, idx) => (
                  <span
                    key={idx}
                    className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                      currentIndex === idx ? "bg-accent" : "bg-accent/25"
                    }`}
                    onClick={() => setCurrentIndex(idx)}
                  ></span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animated particles */}
      <AnimatedDots />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default XploreGovHomepage;
