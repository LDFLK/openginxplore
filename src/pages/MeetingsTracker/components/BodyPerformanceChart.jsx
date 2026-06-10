import { Info } from "lucide-react";

const sections = [
    {
        title: "Website & contact details",
        items: [
            "Website with correct contact details",
            "Website without outdated contact details",
            "Website existed, but RTI officer details not mentioned",
            "No website but partial/incorrect contact details",
            "No website or contact details",
        ],
    },
    {
        title: "Email responsiveness",
        items: [
            "Prompt reply with any follow ups",
            "Delayed response",
            "Required one reminder",
            "Required phone call or referral",
            "No response or email returned",
        ],
    },
    {
        title: "Acknowledgement & response",
        items: [
            "Prompt acknowledgement and prompt reply",
            "Delayed act or reply after phone reminder",
            "Acknowledgement only, no substantive reply",
            "No response until multiple reminders sent",
            "No acknowledgement or response at all",
        ],
    },
    {
        title: "Quality of response",
        items: [
            "Full answer provided",
            "Partial answer with legal justification",
            "Partial answer, no justification given",
            "Delayed partial answer only",
            "No answer/refusal without justification",
        ],
    },
];

// Colors per row index (score 5 → 1)
const BAR_COLORS = ["#1D9E75", "#5DCAA5", "#EF9F27", "#D85A30", "#E24B4A"];

function RatingSection({ title, items, score, isLast }) {
    return (
        <div style={{ marginBottom: isLast ? 0 : 24 }}>
            <p
                style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: "#888",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    margin: "0 0 10px",
                }}
            >
                {title}
            </p>

            {items.map((label, i) => {
                const rowScore = 5 - i;
                const isActive = rowScore === score;
                const pct = (rowScore / 5) * 100;

                return (
                    <div
                        key={i}
                        className="grid grid-cols-3"
                    >
                        {/* Label */}
                        <span
                            style={{
                                fontSize: 13,
                                lineHeight: 1.4,

                                fontWeight: isActive ? 500 : 400,
                                color: isActive ? "#111" : "#aaa",
                            }}
                        >
                            {label}
                        </span>

                        {/* Bar track */}
                        <div
                            style={{
                                flex: 1,
                                height: 8,
                                background: "#e5e7eb",
                                borderRadius: 4,
                                overflow: "hidden",
                            }}
                        >
                            <div
                                style={{
                                    width: `${pct}%`,
                                    height: "100%",
                                    borderRadius: 4,
                                    background: BAR_COLORS[i],
                                    opacity: isActive ? 1 : 0.2,
                                    transition: "opacity 0.3s ease, width 0.3s ease",
                                }}
                            />
                        </div>

                        {/* Score tag */}
                        <span
                            style={{
                                fontSize: 12,
                                fontWeight: 500,
                                minWidth: 28,
                                textAlign: "right",
                                color: isActive ? "#111" : "#bbb",
                            }}
                        >
                            {rowScore}/5
                        </span>
                    </div>
                );
            })}

            {!isLast && (
                <hr
                    style={{
                        border: "none",
                        borderTop: "0.5px solid #e5e7eb",
                        margin: "16px 0 0",
                    }}
                />
            )}
        </div>
    );
}


export default function BodyPerformanceCharts({ scores = [3, 2, 4, 5] }) {
    const clamped = scores.map((s) => Math.min(5, Math.max(1, Math.round(s))));

    return (
        <div className="bg-card rounded-md border border-border p-4 space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-slate-900" />
                <h3 className="text-lg font-semibold text-slate-900">Body Performance</h3>
            </div>

            {/* RTI Responsiveness */}
            {/* <div style={{ padding: "1rem 0" }}>
                {sections.map((sec, si) => (
                    <RatingSection
                        key={si}
                        title={sec.title}
                        items={sec.items}
                        score={clamped[si]}
                        isLast={si === sections.length - 1}
                    />
                ))}
            </div> */}
        </div>
    )
}