import { useEffect, useRef, useState } from "react";
import { useCabinetFlow } from "../../../hooks/useCabinetFlow";
import SankeyChart from "./SankyChart";
import { BarChart2 } from "lucide-react";

const CabinetFlowPanel = ({ presidentId, dates }) => {
    const containerRef = useRef(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const { data: cabinetFlow, isLoading, error } = useCabinetFlow(presidentId, dates);

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver(([entry]) => {
            setContainerWidth(entry.contentRect.width);
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [cabinetFlow]);

    const calculateHeight = (data) => {
        if (!data) return 600;
        const nodeCount = data.nodes?.length ?? 0;
        const minHeight = 600;
        const heightPerNode = 40;
        return Math.max(minHeight, nodeCount * heightPerNode);
    };

    if (isLoading) {
        return (
            <div className="w-full flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading cabinet flow…</p>
            </div>
        );
    }

    if (error || !cabinetFlow) {
        return (
            <div className="w-full rounded-xl border border-dashed border-border flex flex-col items-center justify-center py-20 gap-3">
                <BarChart2 size={36} className="text-gray-300 dark:text-gray-600" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Could not load cabinet flow
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs text-center">
                    Something went wrong fetching the data. Try different dates or reload the page.
                </p>
            </div>
        );
    }

    const noDataDates = (cabinetFlow?.dates || []).filter((d) => d?.status === "no_data");
    const okDates = (cabinetFlow?.dates || []).filter((d) => d?.status === "ok");
    const hasLinks = Array.isArray(cabinetFlow?.links) && cabinetFlow.links.length > 0;

    return (
        <div ref={containerRef} className="w-full mt-2">
            {noDataDates.length > 0 && (
                <div className="mt-4 mb-4 ms-0 me-0 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
                    <p className="text-sm font-medium">
                        Some selected dates don’t have active departments data.
                    </p>
                    <p className="mt-0.5 text-xs opacity-80">
                        Please deselect the following date(s):{" "}
                        <span className="font-semibold">
                            {noDataDates.map((d) => d.date).join(", ")}
                        </span>
                    </p>
                </div>
            )}
            {hasLinks ? (
                <SankeyChart data={cabinetFlow} width={containerWidth} height={calculateHeight(cabinetFlow)} />
            ) : (
                <div className="mt-4 mb-4 ms-0 me-0 rounded-xl border border-dashed border-border bg-gray-50 dark:bg-gray-900/50 flex flex-col items-center justify-center gap-2 py-10 px-6 text-center">
                    <BarChart2 size={28} className="text-gray-300 dark:text-gray-600" />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        No data available for this comparison
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 max-w-md">
                        {dates?.length === 1
                            ? "Select at least two dates to compare cabinet changes."
                            : okDates.length <= 1
                                ? "Only one selected date has usable data, so there’s nothing to compare. Try selecting another date with available data."
                                : "Try different dates or adjust the selected range."}
                    </p>
                </div>
            )}
        </div>
    );
};

export default CabinetFlowPanel;