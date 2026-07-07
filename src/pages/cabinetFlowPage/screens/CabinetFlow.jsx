import { useState, useCallback, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Calendar, BarChart2, Building2, ArrowRight } from "lucide-react";
import CabinetFlowPanel from "../components/CabinetFlowPanel";
import RightSidePanel from "../../../components/RightSidePanel";
import { useEntityNames } from "../../../hooks/useEntityNames";

const CabinetFlow = ({ presidentId, dateRange = [null, null], selectedDates = [], onMinistryNodeClick }) => {
    const location = useLocation();
    const { gazetteData } = useSelector((state) => state.gazettes);
    const gazetteDates = Array.isArray(gazetteData) ? gazetteData.map(item => item.date) : [];
    const presidentRelationDict = useSelector(
        (s) => s.presidency.presidentRelationDict
    );
    const presidentRelation = presidentRelationDict[presidentId];

    const sortedDates = [...selectedDates].sort();

    const [selectedLink, setSelectedLink] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);

    useEffect(() => {
        setSelectedLink(null);
        setSelectedNode(null);
    }, [selectedDates, presidentId]);

    const handleLinkClick = useCallback((link) => {
        setSelectedNode(null);
        setSelectedLink((prev) => 
            (prev?.source?.id === link.source?.id && prev?.target?.id === link.target?.id) ? null : link
        );
    }, []);
    const handleNodeClick = useCallback((node) => {
        setSelectedLink(null);
        setSelectedNode((prev) => (prev?.id === node.id ? null : node));
    }, []);
    const handleClosePanel = useCallback(() => {
        setSelectedLink(null);
    }, []);
    const handleClearSelection = useCallback(() => {
        setSelectedLink(null);
        setSelectedNode(null);
    }, []);

    useEffect(() => {
        const onDocumentClick = (event) => {
            if (window.getSelection()?.toString()) return;
            if (event.target.closest("[data-right-panel]")) return;
            handleClearSelection();
        };
        document.addEventListener("click", onDocumentClick);
        return () => document.removeEventListener("click", onDocumentClick);
    }, [handleClearSelection]);

    const { data: departmentNames, isLoading: departmentNamesLoading } = useEntityNames(
        selectedLink?.departmentIds
    );

    return (
        <div className="bg-background min-h-screen rounded-lg border border-border p-8">
            {/* ── Header ── */}
            <div className="w-full mb-6">
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <div className="space-y-1 text-xs md:text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
                            <p>This chart visualizes how ministries and departments evolved during the president's tenure.</p>
                            <ul className="list-disc list-inside space-y-0.5 pl-1">
                                <li>Each column represents a date when one or more changes may have occurred.</li>
                                <li>Hover over a flow to view details about the departments involved.</li>
                                <li>You can select up to 3 dates to compare.</li>
                            </ul>
                        </div>
                    </div>

                    <div>
                        {selectedDates.length > 0 && (
                            <div className="flex flex-wrap gap-2 justify-end pt-1 mb-3">
                                {sortedDates.map((d) => (
                                    <span
                                        key={d}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium mt-1"
                                    >
                                        <Calendar size={11} />
                                        {d}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className={`flex items-stretch ${selectedLink ? "gap-4" : "gap-0"}`}>
                <div className="flex-1 min-w-0">
                    {selectedDates.length > 1 ? (
                        <CabinetFlowPanel
                            presidentId={presidentId}
                            dates={sortedDates}
                            onNodeClick={handleNodeClick}
                            onNodeNavigate={onMinistryNodeClick}
                            onLinkClick={handleLinkClick}
                            onLinkSingleClick={handleNodeClick}
                            onClearSelection={handleClearSelection}
                            selectedLink={selectedLink}
                            selectedNode={selectedNode}
                        />
                    ) : (
                        <div className="mt-4 mb-4 ms-0 me-0 rounded-lg border border-dashed border-border bg-gray-50 dark:bg-gray-900/50 flex flex-col items-center justify-center gap-2 py-20 px-6 text-center">
                            <BarChart2 size={28} className="text-gray-300 dark:text-gray-600" />
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {selectedDates.length === 1 ? "Select at least 2 dates to compare" : "Select up to 3 dates to compare"}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 max-w-md">
                                {selectedDates.length === 1
                                    ? "You have selected 1 date. Please select one more date to view the department flow."
                                    : "The start and end dates of the presidency are selected by default."}
                            </p>
                        </div>
                    )}
                </div>

                <RightSidePanel
                    isOpen={!!selectedLink}
                    onClose={handleClosePanel}
                    title="Departments Moved"
                >
                    {selectedLink && (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 rounded-md border border-border bg-background/60 px-3 py-2">
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">
                                        From
                                    </p>
                                    <p className="text-xs font-medium text-foreground dark:text-white break-words">
                                        {selectedLink.source?.name}
                                    </p>
                                </div>
                                <ArrowRight size={25} className="text-accent shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">
                                        To
                                    </p>
                                    <p className="text-xs font-medium text-foreground dark:text-white break-words">
                                        {selectedLink.target?.name}
                                    </p>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {selectedLink.value} department{selectedLink.value > 1 ? "s" : ""} moved
                            </p>

                            {departmentNamesLoading ? (
                                <div className="flex items-center justify-center py-6">
                                    <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : (
                                <ul className="flex flex-col gap-1.5">
                                    {(selectedLink.departmentIds || []).map((id) => (
                                        <li
                                            key={id}
                                            className="flex items-center gap-2 text-xs text-foreground/90 dark:text-white/90 bg-background/60 border border-border rounded-sm px-2.5 py-1.5"
                                        >
                                            <Building2 size={14} className="text-gray-400 shrink-0" />
                                            <Link
                                                to={`/department-profile/${id}`}
                                                state={{ mode: "back", from: location.pathname + location.search }}
                                                className="break-words text-foreground/90 dark:text-white/90 hover:underline"
                                            >
                                                {departmentNames?.[id] ?? id}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </RightSidePanel>
            </div>
        </div>
    );
};

export default CabinetFlow;