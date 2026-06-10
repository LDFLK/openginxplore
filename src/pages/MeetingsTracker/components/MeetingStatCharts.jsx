import { useState } from "react";
import { motion } from "framer-motion";
import { Bar, BarChart, Legend, Pie, PieChart, Tooltip, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";

export default function MeetingStatCharts() {
    const [isBarFlipped, setIsBarFlipped] = useState(false);
    const [isPieFlipped, setIsPieFlipped] = useState(false);

    const barData = [
        { name: 'Not Met', count: 12, fill: '#EF4444' },     // blue-300
        { name: 'Rarely Met', count: 18, fill: '#FBBF24' },  // blue-500
        { name: 'Consistently Met', count: 12, fill: '#22C55E' },   // blue-900
    ];

    const pieData = [
        { name: '80%-100%', value: 15, fill: '#22C55E' }, // Deep Emerald Green (Highest)
        { name: '61%-80%', value: 25, fill: '#4ADE80' }, // Vibrant Light Green
        { name: '41%-60%', value: 35, fill: '#FBBF24' },  // Amber/Yellow (Middle Tier)
        { name: '21%-40%', value: 20, fill: '#F87171' },   // Medium Coral Red
        { name: '0%-20%', value: 15, fill: '#EF4444' },   // Vibrant Red (Lowest)
    ];

    const flipTransition = { duration: 0.6, type: "spring", stiffness: 200, damping: 20 };

    return (
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-2 p-3 bg-card border border-border mb-4 rounded-md border-primary/10 transition-all">

            {/* Bar Chart Flip Container */}
            <div className="relative w-full h-[280px]" style={{ perspective: "1000px" }}>
                <motion.div
                    className="w-full h-full relative"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateY: isBarFlipped ? 180 : 0 }}
                    transition={flipTransition}
                >
                    {/* Front */}
                    <div
                        className="absolute inset-0 bg-primary/5 p-4 rounded-md flex flex-col items-center justify-between cursor-pointer"
                        style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
                        onClick={() => setIsBarFlipped(true)}
                    >
                        <h3 className="text-lg font-semibold text-primary mb-2">Meetings Score</h3>
                        <div className="w-full flex-1 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height={180}>
                                <BarChart
                                    layout="vertical"
                                    data={barData}
                                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                                >
                                    <XAxis
                                        type="number"
                                        axisLine={{ stroke: 'currentColor', opacity: 0.2 }}
                                        tickLine={{ stroke: 'currentColor', opacity: 0.2 }}
                                        tick={{ fill: 'currentColor', opacity: 0.8, fontSize: 12 }}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        width={120}
                                        axisLine={{ stroke: 'currentColor', opacity: 0.2 }}
                                        tickLine={{ stroke: 'currentColor', opacity: 0.2 }}
                                        tick={{ fill: 'currentColor', opacity: 0.8, fontSize: 12 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
                                    />
                                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                                        {barData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-xs text-primary/60 mt-2">
                            <p className="text-accent font-normal hover:underline">How is this calculated?</p>
                        </div>
                    </div>

                    {/* Back */}
                    <div
                        className="absolute inset-0 bg-primary/5 border border-primary/20 p-6 rounded-md flex flex-col items-center justify-center cursor-pointer shadow-inner"
                        style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                        onClick={() => setIsBarFlipped(false)}
                    >
                        <h3 className="text-lg font-semibold text-primary mb-4 text-center">Meetings Score Calculation</h3>
                        <p className="text-sm text-primary/80 text-center leading-relaxed">
                            This score evaluates how consistently each ministry fulfils its legal meetings mandate.
                            "Consistently Met" indicates meetings held within their mandate, "Rarely Met" indicates meetings partially meeting their mandate,
                            while "Not Met" indicates meetings not held within their mandate.
                        </p>
                        <p className="text-xs text-accent mt-6 hover:underline">Go back</p>
                    </div>
                </motion.div>
            </div>

            {/* Pie Chart Flip Container */}
            <div className="relative w-full h-[280px]" style={{ perspective: "1000px" }}>
                <motion.div
                    className="w-full h-full relative"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateY: isPieFlipped ? 180 : 0 }}
                    transition={flipTransition}
                >
                    {/* Front */}
                    <div
                        className="absolute inset-0 bg-primary/5 p-4 rounded-md flex flex-col items-center justify-between cursor-pointer"
                        style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
                        onClick={() => setIsPieFlipped(true)}
                    >
                        <h3 className="text-lg font-semibold text-primary mb-2">RTI Responsiveness</h3>
                        <div className="w-full flex-1 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={20}
                                        outerRadius={75}
                                        stroke="var(--card)"
                                        strokeWidth={2}
                                        startAngle={90}
                                        endAngle={-270}
                                        isAnimationActive={true}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Custom legend in correct low→high order */}
                        <div className="flex flex-wrap justify-center gap-x-3">
                            {[...pieData].reverse().map((entry) => (
                                <div key={entry.name} className="flex items-center gap-1">
                                    <span className="w-2.5 h-2.5 rounded-sm inline-block shrink-0" style={{ backgroundColor: entry.fill }} />
                                    <span className="text-xs" style={{ color: 'var(--primary)' }}>{entry.name}</span>
                                </div>
                            ))}
                        </div>
                        <div className="text-xs text-primary/60 mt-2">
                            <p className="text-accent font-normal hover:underline">How is this calculated?</p>
                        </div>
                    </div>

                    {/* Back */}
                    <div
                        className="absolute inset-0 bg-primary/5 border border-primary/20 p-6 rounded-md flex flex-col items-center justify-center cursor-pointer shadow-inner"
                        style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                        onClick={() => setIsPieFlipped(false)}
                    >
                        <h3 className="text-lg font-semibold text-primary mb-4 text-center">RTI Responsiveness Calculation</h3>
                        <p className="text-sm text-primary/80 text-center leading-relaxed">
                            This score evaluates the digital readiness and responsiveness of the bodies of which each RTI request was sent to,
                            in accordance with the RTI Act.
                            A higher score (80%-100%) reflects exceptional transparency and timely disclosures.
                        </p>
                        <p className="text-xs text-accent mt-6 hover:underline">Go back</p>
                    </div>
                </motion.div>
            </div>

        </div>
    );
}
