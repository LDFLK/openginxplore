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
        { name: '0-4', value: 15, fill: '#EF4444' },   // Vibrant Red (Lowest)
        { name: '5-8', value: 20, fill: '#F87171' },   // Medium Coral Red
        { name: '9-12', value: 35, fill: '#FBBF24' },  // Amber/Yellow (Middle Tier)
        { name: '13-16', value: 25, fill: '#4ADE80' }, // Vibrant Light Green
        { name: '17-20', value: 15, fill: '#22C55E' }, // Deep Emerald Green (Highest)
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
                            <p className="text-accent font-normal hover:underline">How calculated?</p>
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
                            This score evaluates how consistently each ministry meets its scheduled baseline.
                            "Consistently Met" indicates strict adherence to schedules, while "Not Met" highlights missed commitments.
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
                                        isAnimationActive={true}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={10}
                                        wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-xs text-primary/60 mt-2">
                            <p className="text-accent font-normal hover:underline">How calculated?</p>
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
                            This metric measures the speed and accuracy of responses to Right to Information (RTI) requests.
                            A higher score (17-20) reflects exceptional transparency and timely disclosures.
                        </p>
                        <p className="text-xs text-accent mt-6 hover:underline">Go back</p>
                    </div>
                </motion.div>
            </div>

        </div>
    );
}
