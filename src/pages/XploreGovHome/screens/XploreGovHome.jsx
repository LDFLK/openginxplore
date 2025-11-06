import { useEffect, useRef, useState } from "react";
import {
  ChevronRight,
  TrendingUp,
  Clock,
  Network,
  Users,
  Building2,
  History,
  Calendar,
  GitBranch,
  BookOpenText,
} from "lucide-react";
import ForceGraph3D from "react-force-graph-3d";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../../../components/theme-toggle";
import Footer from "../components/footer";
import BackgroundGradientEffect from "../components/backgroundGradientEffect";
import AnimatedDots from "../components/animatedDots";
import TextLogo from "../components/textLogo";
import PresidentialTimeline from "../components/PresidentialTimeline";
import { useThemeContext } from '../../../themeContext';

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
  const cards = [0,1];

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
      <div className="relative h-60 rounded-xl bg-gradient-to-br from-gray-900/50 to-gray-800/50 overflow-hidden">
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
            Live Government Structure
          </div>
          <div className="flex space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              <span className="text-gray-400">Ministries</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-400">Departments</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-400">Officials</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // // Mock presidential data
  // const mockPresidents = [
  //   {
  //     id: 1,
  //     name: "Gotabaya Rajapaksa",
  //     period: "2019-2022",
  //     image:
  //       "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcTR_zSNgCuFpF49ySrhR_-q7mxorbdoN0Qoc5UEWtUu1QlAujj0Iw9NQnhSStCi3kQnlKoxf575IGSUnqEJgYt1tmoUG2VhV5qxHjAPiXY",
  //     color: "#3B82F6",
  //     gazetteDates: ["2020-02-10", "2020-07-18"],
  //   },
  //   {
  //     id: 2,
  //     name: "Ranil Wickremesinge",
  //     period: "2022-2024",
  //     image:
  //       "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScNPacYVOfZ9gU6__kTKX5wL1oe_G1GzoRdRKo5AwEx0v9bLmcmVouGrlerNu1IxIZ_OUvMfLh6y-eQcPWnWtAs9Ut0s4Kp71UOfJuquc",
  //     color: "#8B5CF6",
  //     gazetteDates: ["2022-08-20", "2023-05-30"],
  //   },
  //   {
  //     id: 3,
  //     name: "Anura Kumara Dissanayaka",
  //     period: "2024-Present",
  //     image:
  //       "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdOoGPxjbGmDh3erxJupQRQRIDT7IwIBNwbw&s",
  //     color: "#06B6D4",
  //     active: true,
  //     gazetteDates: ["2024-07-25", "2024-10-12", "2025-02-05"],
  //   },
  // ];

  // const [selectedPresident, setSelectedPresident] = useState(mockPresidents[0]); // Start with first president
  // const [selectedDate, setSelectedDate] = useState(null);
  // const [revealedCount, setRevealedCount] = useState(0);
  // const [startAnimation, setStartAnimation] = useState(false);
  // const [currentPresidentIndex, setCurrentPresidentIndex] = useState(0);

  // const avatarRef = useRef(null);
  // const dotRefs = useRef([]);
  // const timelineRef = useRef(null);
  // const scrollContainerRef = useRef(null);

  // useEffect(() => {
  //   const observer = new IntersectionObserver(
  //     (entries) => {
  //       entries.forEach((entry) => {
  //         if (entry.isIntersecting) {
  //           setStartAnimation(true);
  //         }
  //       });
  //     },
  //     { threshold: 0.3 }
  //   );

  //   if (timelineRef.current) {
  //     observer.observe(timelineRef.current);
  //   }

  //   return () => observer.disconnect();
  // }, []);

  // useEffect(() => {
  //   if (
  //     revealedCount > 0 &&
  //     dotRefs.current &&
  //     dotRefs.current[revealedCount - 1] &&
  //     scrollContainerRef.current
  //   ) {
  //     const activeDot = dotRefs.current[revealedCount - 1];
  //     const container = scrollContainerRef.current;

  //     // Additional safety checks
  //     if (!activeDot || !container) return;

  //     const scrollToDot = () => {
  //       // Check if elements still exist before accessing properties
  //       if (!activeDot || !container || !activeDot.offsetLeft) return;

  //       try {
  //         const dotPosition = activeDot.offsetLeft + activeDot.offsetWidth / 2;
  //         const containerWidth = container.offsetWidth;
  //         const targetScroll = dotPosition - containerWidth / 2 + 200;

  //         container.scrollTo({
  //           left: targetScroll,
  //           behavior: "smooth",
  //         });
  //       } catch (error) {
  //         console.warn("Scroll animation error:", error);
  //       }
  //     };

  //     const timeoutId = setTimeout(scrollToDot, 50); // Small delay to ensure DOM is ready

  //     return () => clearTimeout(timeoutId);
  //   }
  // }, [revealedCount]);

  // // Auto-cycling animation through all presidents
  // useEffect(() => {
  //   if (!startAnimation) return;

  //   const runPresidentCycle = async () => {
  //     for (let presIndex = 0; presIndex < mockPresidents.length; presIndex++) {
  //       const president = mockPresidents[presIndex];

  //       // Set current president
  //       setCurrentPresidentIndex(presIndex);
  //       setSelectedPresident(president);

  //       // Immediately show first dot and connecting line
  //       setRevealedCount(1);
  //       setSelectedDate(president.gazetteDates[0]);

  //       // Wait a moment for president selection to settle
  //       await new Promise((resolve) => setTimeout(resolve, 800));

  //       // Animate through remaining gazette dates (starting from index 1)
  //       for (
  //         let dateIndex = 1;
  //         dateIndex < president.gazetteDates.length;
  //         dateIndex++
  //       ) {
  //         setRevealedCount(dateIndex + 1);
  //         setSelectedDate(president.gazetteDates[dateIndex]);

  //         // Wait before revealing next dot
  //         await new Promise((resolve) => setTimeout(resolve, 2000));
  //       }

  //       // Wait a bit longer after completing a president's timeline before moving to next
  //       await new Promise((resolve) => setTimeout(resolve, 1500));
  //     }

  //     // Optional: Loop back to start or stop here
  //     // To loop continuously, you could reset and start over:
  //     setCurrentPresidentIndex(0);
  //     setSelectedPresident(mockPresidents[0]);
  //     setRevealedCount(0);
  //     setSelectedDate(null);
  //     runPresidentCycle(); // Restart the cycle
  //   };

  //   runPresidentCycle();
  // }, [startAnimation]);

  // const PresidentialTimeline = () => (
  //   <div
  //     ref={timelineRef}
  //     className="relative rounded-xl p-6 mt-6 overflow-hidden"
  //   >
  //     <div className="mb-6">
  //       <div className="text-sm text-primary font-accent">
  //         Gazette Publication Timeline
  //       </div>
  //       <div className="text-xs text-primary/75">
  //         Timeline showing presidential governance periods and gazette
  //         publications
  //       </div>
  //     </div>

  //     <div className="relative">
  //       {/* Base timeline line */}
  //       <div className="absolute top-14 left-0 right-0 h-0.5 bg-foreground"></div>

  //       {/* Scrollable container for presidents and gazette dots */}
  //       <div
  //         ref={scrollContainerRef}
  //         className="overflow-x-auto pb-4 p-6 relative scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
  //         style={{
  //           scrollbarWidth: "none", // Firefox
  //           msOverflowStyle: "none", // IE/Edge
  //         }}
  //       >
  //         <div
  //           className="flex items-center space-x-12 relative"
  //           style={{ minWidth: "max-content" }}
  //         >
  //           {mockPresidents.map((president, presIndex) => {
  //             const isSelected = selectedPresident.id === president.id;
  //             const isActive = presIndex === currentPresidentIndex;

  //             return (
  //               <div
  //                 key={president.id}
  //                 className="flex items-center space-x-6 flex-shrink-0 relative"
  //               >
  //                 {/* President Avatar */}
  //                 <div className="relative flex flex-col items-center group z-10">
  //                   <div
  //                     className={`relative transition-all duration-500 ${
  //                       isActive ? "transform scale-125" : "transform scale-100"
  //                     }`}
  //                   >
  //                     <div
  //                       ref={isSelected ? avatarRef : null}
  //                       className="w-12 h-12 rounded-full border-3 overflow-hidden transition-all duration-500"
  //                       style={{
  //                         borderColor: isActive ? president.color : "#4B5563",
  //                         boxShadow: isActive
  //                           ? `0 0 20px ${president.color}40`
  //                           : "none",
  //                       }}
  //                     >
  //                       <img
  //                         src={president.image}
  //                         alt={president.name}
  //                         className={`w-full h-full object-cover transition-all duration-500 ${
  //                           isActive ? "filter-none" : "grayscale"
  //                         }`}
  //                       />
  //                     </div>
  //                     {president.active && isActive && (
  //                       <div className="absolute -bottom-0 right-1 w-3 h-3 border border-border rounded-full animate-pulse bg-active-green"></div>
  //                     )}
  //                   </div>

  //                   <div className="text-center mt-2">
  //                     <div
  //                       className={`text-xs font-medium transition-all duration-500 ${
  //                         isActive
  //                           ? "text-primary/90 transform scale-110"
  //                           : "text-primary/90"
  //                       }`}
  //                       style={{
  //                         color: isActive ? president.color : undefined,
  //                       }}
  //                     >
  //                       {president.name.split(" ").slice(-1)[0]}
  //                     </div>
  //                     <div
  //                       className={`text-xs transition-colors duration-500 ${
  //                         isActive ? "text-primary/75" : "text-primary/75"
  //                       }`}
  //                     >
  //                       {president.period}
  //                     </div>
  //                   </div>
  //                 </div>

  //                 {/* Gazette dots for selected president */}
  //                 {isSelected && (
  //                   <div className="flex items-center space-x-6 relative">
  //                     {/* Line connecting avatar to first dot */}
  //                     {revealedCount > 0 &&
  //                       avatarRef.current &&
  //                       dotRefs.current[0] && (
  //                         <div
  //                           className="absolute top-3 h-0.5 z-0 rounded-full transition-all duration-500"
  //                           style={{
  //                             left: "-45px",
  //                             width: "75px",
  //                             backgroundColor: president.color,
  //                           }}
  //                         />
  //                       )}

  //                     {/* Progress line starting from first dot */}
  //                     {dotRefs.current[0] &&
  //                       dotRefs.current[revealedCount - 1] &&
  //                       revealedCount > 0 &&
  //                       dotRefs.current[0].offsetLeft !== undefined &&
  //                       dotRefs.current[revealedCount - 1].offsetLeft !==
  //                         undefined && (
  //                         <div
  //                           className="absolute top-3 h-0.5 z-0 rounded-full"
  //                           style={{
  //                             left:
  //                               dotRefs.current[0].offsetLeft +
  //                               dotRefs.current[0].offsetWidth / 2,
  //                             width:
  //                               dotRefs.current[revealedCount - 1].offsetLeft +
  //                               dotRefs.current[revealedCount - 1].offsetWidth /
  //                                 2 -
  //                               (dotRefs.current[0].offsetLeft +
  //                                 dotRefs.current[0].offsetWidth / 2),
  //                             backgroundColor: president.color,
  //                             transition: "width 0.5s ease",
  //                           }}
  //                         />
  //                       )}

  //                     {selectedPresident.gazetteDates.map((date, dateIndex) => {
  //                       const active = dateIndex < revealedCount;

  //                       return (
  //                         <div
  //                           key={date}
  //                           ref={(el) => (dotRefs.current[dateIndex] = el)}
  //                           className="relative flex flex-col items-center z-10 group"
  //                         >
  //                           <div
  //                             className={`rounded-full border border-border transition-all duration-500 ${
  //                               selectedDate === date
  //                                 ? "w-6 h-6 transform scale-80 shadow-lg"
  //                                 : "w-4 h-4"
  //                             }`}
  //                             style={{
  //                               backgroundColor: active
  //                                 ? president.color
  //                                 : "#6B7280",
  //                               boxShadow:
  //                                 selectedDate === date
  //                                   ? `0 0 15px ${president.color}60`
  //                                   : "none",
  //                             }}
  //                           ></div>

  //                           <div
  //                             className={`text-xs mt-2 transition-all duration-200 text-center ${
  //                               selectedDate === date
  //                                 ? "font-semibold transform scale-100"
  //                                 : "text-primary/75"
  //                             }`}
  //                             style={{
  //                               color:
  //                                 selectedDate === date
  //                                   ? president.color
  //                                   : undefined,
  //                             }}
  //                           >
  //                             {date}
  //                           </div>
  //                         </div>
  //                       );
  //                     })}
  //                   </div>
  //                 )}
  //               </div>
  //             );
  //           })}
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Background Effects */}
      <BackgroundGradientEffect />

      <div className="relative z-10 px-2 lg:px-6">
        <div className="p-2 md:px-14 lg:px-24 xl:px-56 mx-auto">
          {/* Hero Section */}
          <div className="py-2 md:py-4 lg:py-6 justify-between flex">
            <div className="pt-2 pb-4 text-left flex items-center space-x-3">
            <TextLogo />
            </div>
            <ThemeToggle/>
          </div>

          {/* Modern Split Section */}
          <div className="flex flex-col lg:flex-row justify-between gap-2 mt-0 lg:mt-6">
            {/* Left Text Section */}
            <div className="flex-1 justify-center text-center lg:text-left mt-10 xl:mt-22">
              <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-primary leading-tight">
                Explore Sri Lanka’s <br />
                <span className="text-accent">Government Structure</span>
              </h2>
              <div className="w-full flex justify-center lg:justify-start">
                <p className="text-muted-foreground text-sm text-center lg:text-left md:text-md xl:text-lg max-w-lg mt-2 flex justify-center">
                  Gain deep insights into how ministries, departments, and
                  officials are connected and how they evolve through time.
                </p>
              </div>
              <div className="flex mt-6 justify-center lg:justify-start">
                <button
                  className="bg-accent text-accent-foreground px-2.5 py-2 rounded-lg font-normal text-lg hover:scale-105 transition transform inline-flex items-center hover:cursor-pointer"
                  onClick={() => navigate("/organization")}
                >
                  <History className="w-6 h-6 mr-2" />
                  <span className="text-sm md:text-normal">Xplore</span>
                  <ChevronRight className="w-6 h-6" />
                </button>
                <button
                  className="bg-none border mx-3 border-accent cursor-pointer text-accent px-3.5 py-2 rounded-lg font-normal text-lg hover:scale-105 transition transform inline-flex items-center hover:cursor-pointer"
                  onClick={() =>
                    window.open("/docs?file=information-pane", "_blank")
                  }
                >
                  <BookOpenText className="w-6 h-6 mr-2" />
                  <span className="text-sm md:text-normal">Learn</span>
                </button>
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
                  <div className="min-w-full xl:h-[66vh] px-2 border rounded-2xl border-border bg-foreground/8 shadow-2xl">
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
                            Organization Structure Visualization
                          </h3>
                          <p className="text-sm md:text-sm text-primary/60">
                            Track changes across leadership and time
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
                            Presidential term transitions
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-purple-500/10 border-l-4 border-purple-400/80 backdrop-blur-sm">
                          <GitBranch className="w-4 h-4 text-purple-400" />
                          <span className="text-sm text-primary/75">
                            Ministry restructuring events
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="min-w-full xl:h-[66vh] px-2 border rounded-2xl border-border bg-foreground/8 shadow-2xl">
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
                            Ministry-Department relationships
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-purple-500/10 border-l-4 border-purple-400/80 backdrop-blur-sm">
                          <Users className="w-4 h-4 text-purple-400" />
                          <span className="text-sm text-primary/75">
                            Official role connections
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
                      currentIndex === idx ? "bg-white" : "bg-gray-500"
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
