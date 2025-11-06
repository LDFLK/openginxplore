import { useEffect, useRef, useState } from "react";

export default function PresidentialTimeline() {
    const totalDots = 25;
    const accent = "#06B6D4";

    const [revealedCount, setRevealedCount] = useState(0);
    const [startAnimation, setStartAnimation] = useState(false);

    const dotRefs = useRef([]);
    const scrollContainerRef = useRef(null);
    const timelineRef = useRef(null);

    // Trigger animation when visible
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) setStartAnimation(true);
                });
            },
            { threshold: 0.3 }
        );
        if (timelineRef.current) observer.observe(timelineRef.current);
        return () => observer.disconnect();
    }, []);

    // Reveal dots one by one
    useEffect(() => {
        if (!startAnimation) return;

        let i = 0;
        const interval = setInterval(() => {
            i++;
            setRevealedCount(i);
            if (i >= totalDots) {
                setTimeout(() => {
                    i = 0;
                    setRevealedCount(0);
                }, 1000);
            }
        }, 800);

        return () => clearInterval(interval);
    }, [startAnimation]);

    // Scroll current dot into center
    useEffect(() => {
        if (!scrollContainerRef.current || !dotRefs.current[revealedCount - 1]) return;
        const activeDot = dotRefs.current[revealedCount - 1];
        const container = scrollContainerRef.current;
        const dotPosition = activeDot.offsetLeft + activeDot.offsetWidth / 2;
        const targetScroll = dotPosition - container.offsetWidth / 2 + 150;
        container.scrollTo({ left: targetScroll, behavior: "smooth" });
    }, [revealedCount]);

    return (
        <div
            ref={timelineRef}
            className="relative rounded-xl p-1 mt-6 overflow-hidden transition-colors duration-300"
        >
            {/* --- Title Section --- */}
            <div className="mb-3">
                <div className="text-sm text-primary font-accent">Official Gazette Timeline</div>
                <div className="text-xs text-primary/70">
                    timeline with key gazette publication dates
                </div>
            </div>

            {/* --- Image Section--- */}
            <div className="relative w-full">
                {/* Top strip that matches theme background */}
                <div className="h-5 w-full bg-background rounded-t-xl"></div>

                {/* Light mode image */}
                <img
                    src="public/tl-light.PNG"
                    alt="Range Selector Light"
                    className="block dark:hidden w-full"
                />

                {/* Dark mode image */}
                <img
                    src="public/tl-dark.PNG"
                    alt="Range Selector Dark"
                    className="hidden dark:block w-full"
                />
                  <div className="h-3 w-full bg-background"></div>
            </div>

            {/* --- Timeline Container --- */}
            <div className="relative bg-background h-18 rounded-b-xl">
                {/* Base Line */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-foreground/30 z-0"></div>

                {/* Scrollable dots */}
                <div
                    ref={scrollContainerRef}
                    className="overflow-x-auto pb-4 p-6 relative scrollbar-thin scrollbar-thumb-foreground/40 scrollbar-track-transparent"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    <div
                        className="flex items-center space-x-4 relative"
                        style={{ minWidth: "max-content" }}
                    >
                        {/* --- Animated Progress Line --- */}
                        {dotRefs.current[0] &&
                            dotRefs.current[revealedCount - 1] &&
                            revealedCount > 0 && (
                                <div
                                    className="absolute -mt-11.5 h-0.5 rounded-full transition-all duration-500 ease-out z-10"
                                    style={{
                                        left:
                                            dotRefs.current[0].offsetLeft +
                                            dotRefs.current[0].offsetWidth / 2,
                                        width:
                                            dotRefs.current[revealedCount - 1].offsetLeft +
                                            dotRefs.current[revealedCount - 1].offsetWidth / 2 -
                                            (dotRefs.current[0].offsetLeft +
                                                dotRefs.current[0].offsetWidth / 2),
                                        backgroundColor: accent,
                                        boxShadow: `0 0 10px ${accent}60`,
                                    }}
                                ></div>
                            )}

                        {/* --- Dots + Date Labels --- */}
                        {Array.from({ length: totalDots }).map((_, i) => {
                            const active = i < revealedCount;
                            const current = i === revealedCount - 1;

                            // Generate sequential fake dates
                            const startDate = new Date("2022-09-18");
                            const date = new Date(startDate);
                            date.setDate(startDate.getDate() + i * 24);
                            const day = String(date.getDate()).padStart(2, "0");
                            const month = date.toLocaleString("en-US", { month: "short" });
                            const year = date.getFullYear();
                            const dateLabel = `${day} ${month} ${year}`;

                            return (
                                <div
                                    key={i}
                                    ref={(el) => (dotRefs.current[i] = el)}
                                    className="relative flex flex-col items-center z-20"
                                    style={{ minHeight: "2.5rem" }}
                                >
                                    {/* Dot container keeps layout stable */}
                                    <div className="flex items-center justify-center -mt-2.5" style={{ height: "1rem" }}>
                                        <div
                                            className={`rounded-full border border-border transition-all duration-500 ${current ? "w-4 h-4" : "w-3 h-3"
                                                }`}
                                            style={{
                                                backgroundColor: active ? accent : "var(--muted-foreground)",
                                                boxShadow: current ? `0 0 15px ${accent}80` : "none",
                                            }}
                                        ></div>
                                    </div>

                                    {/* Date label */}
                                    <span
                                        className={`text-xs mt-1 transition-all duration-300 ${active ? "font-medium" : ""
                                            }`}
                                        style={{
                                            color: active
                                                ? accent
                                                : "var(--muted-foreground)",
                                        }}
                                    >
                                        {dateLabel}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
