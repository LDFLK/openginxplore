import React from "react";

const ScoreCircle = ({ score, maxScore = 100, size = 120, strokeWidth = 12 }) => {
    // Ensure the score falls strictly within 0 and the maximum limit
    const clampedScore = Math.min(maxScore, Math.max(0, score));

    // Convert the ratio into a 360-degree angle
    const percentage = (clampedScore / maxScore) * 100;
    const degrees = percentage * 3.6;

    const getFillColor = () => {
        if (percentage <= 20) return '#EF4444'; // 0-4 (0-20%)
        if (percentage <= 40) return '#F87171'; // 5-8 (21-40%)
        if (percentage <= 60) return '#FBBF24'; // 9-12 (41-60%)
        if (percentage <= 80) return '#4ADE80'; // 13-16 (61-80%)
        return '#22C55E'; // 17-20 (81-100%)
    };

    return (
        <div
            className="relative flex items-center justify-center rounded-full"
            style={{
                width: `${size}px`,
                height: `${size}px`,
                background: `conic-gradient(
          ${getFillColor()} ${degrees}deg, 
          #e2e8f0 ${degrees}deg 360deg
        )`
            }}
            role="meter"
            aria-valuenow={clampedScore}
            aria-valuemin="0"
            aria-valuemax={maxScore}
        >
            {/* Inner Center Cutout */}
            <div
                className="absolute bg-white dark:bg-slate-800 rounded-full flex flex-col items-center justify-center"
                style={{
                    width: `${size - strokeWidth * 2}px`,
                    height: `${size - strokeWidth * 2}px`
                }}
            >
                {/* Score Value Display */}
                <span
                    className="text-md font-black leading-none"
                    style={{ color: getFillColor() }}
                >
                    {score}
                </span>
                {/* Max Score Label */}
                {/* <span className="text-xs font-semibold text-slate-400 mt-0.5">
                    of {maxScore}
                </span> */}
            </div>
        </div>
    );
};

export default ScoreCircle;
