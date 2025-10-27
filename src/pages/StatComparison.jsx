"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie, Bubble, Line } from "react-chartjs-2";

import { useHumanReadable } from "../components/statistics_components/HumanReadable";

import StatisticTimeline from "../components/statistics_components/StatisticTimeline";

export default function StatComparison() {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Tooltip,
    Legend
  );
  const humanReadable = useHumanReadable();
  const [userSelectedDateRange, setUserSelectedDateRange] = useState([
    null,
    null,
  ]);
  const [rangeYears, setRangeYears] = useState([]);
  const [allAttributes, setAllAttributes] = useState({});
  const [selectedEntity, setSelectedEntity] = useState("");
  const [selectedStatistic, setSelectedStatistic] = useState("");
  const [viewData, setViewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeView, setActiveView] = useState("table");
  const [chartType, setChartType] = useState("bar");
  const [xColumn, setXColumn] = useState("");
  const [yColumn, setYColumn] = useState("");
  const [bubbleX, setBubbleX] = useState("");
  const [bubbleY, setBubbleY] = useState("");
  const [bubbleR, setBubbleR] = useState("");
  const [chartError, setChartError] = useState("");

  const apiUrlService = window?.configs?.apiUrlService
    ? window.configs.apiUrlService
    : "/";

  const handleDateRangeChange = useCallback((dateRange) => {
    const [startDate, endDate] = dateRange;
    setUserSelectedDateRange([startDate, endDate]);

    if (startDate && endDate) {
      const startYear = startDate.getUTCFullYear();
      const endYear = endDate.getUTCFullYear();
      const yearsInRange = Array.from(
        { length: endYear - startYear + 1 },
        (_, i) => startYear + i
      );
      setRangeYears(yearsInRange);

      // Reset selections when date range changes
      setSelectedEntity("");
      setSelectedStatistic("");
      setViewData(null);
    }
  }, []);

  const categorizedEntities = useMemo(() => {
    const categorized = {};

    if (rangeYears.length === 0) return categorized;

    rangeYears.forEach((year) => {
      if (allAttributes[year]) {
        allAttributes[year].forEach((attr) => {
          const categoryId = attr.parent_of_parent_category_id;

          if (!categorized[categoryId]) {
            categorized[categoryId] = {
              name: categoryId,
              statistics: new Set(),
            };
          }

          categorized[categoryId].statistics.add(
            JSON.stringify({
              id: attr.id,
              name: attr.name,
              parent_entity_id: attr.parent_entity_id,
              attribute_hash_name: attr.attribute_hash_name,
              created: attr.created,
            })
          );
        });
      }
    });

    // Convert Sets back to arrays for easier consumption
    Object.keys(categorized).forEach((key) => {
      categorized[key].statistics = Array.from(categorized[key].statistics).map(
        (item) => JSON.parse(item)
      );
    });

    return categorized;
  }, [allAttributes, rangeYears]);

  const availableStatistics = useMemo(() => {
    if (!selectedEntity || !categorizedEntities[selectedEntity]) {
      return [];
    }
    return categorizedEntities[selectedEntity].statistics;
  }, [selectedEntity, categorizedEntities]);

  const fetchAllAttributes = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${apiUrlService}/allAttributes`, {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch attributes");
      }

      const data = await response.json();
      setAllAttributes(data.attributes || {});
    } catch (err) {
      setError("Failed to load data: " + err.message);
      console.error("Error fetching attributes:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleEntityChange = useCallback((entityId) => {
    setSelectedEntity(entityId);
    setSelectedStatistic("");
    setViewData(null);
  }, []);

  const handleViewData = async () => {
    if (!selectedEntity || !selectedStatistic) {
      setError("Please select both Entity and Statistic");
      return;
    }

    try {
      setDataLoading(true);
      setError("");

      const selectedStat = availableStatistics.find(
        (stat) => stat.id === selectedStatistic
      );

      const response = await fetch(
        `${apiUrlService}/data/attribute/${selectedStat.parent_entity_id}`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            attribute_name: selectedStat.name,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();
      setViewData(data);
      setActiveView("table");
    } catch (err) {
      setError("Failed to load data: " + err.message);
      console.error("Error fetching data:", err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAttributes();
  }, []);

  const hasDataInRange =
    rangeYears.length > 0 && Object.keys(categorizedEntities).length > 0;

  const columnInfo = useMemo(() => {
    if (!viewData || !viewData.columns || !viewData.rows)
      return { numeric: [], stringish: [], indicesByName: {} };
    const indicesByName = {};
    viewData.columns.forEach((name, idx) => {
      indicesByName[name] = idx;
    });
    const numeric = [];
    const stringish = [];
    for (let c = 0; c < viewData.columns.length; c++) {
      let isNumeric = true;
      for (let r = 0; r < viewData.rows.length; r++) {
        const val = viewData.rows[r][c];
        if (val === null || val === undefined || val === "") continue;
        if (typeof val === "number") continue;
        const num = Number(val);
        if (Number.isNaN(num)) {
          isNumeric = false;
          break;
        }
      }
      if (isNumeric) numeric.push(viewData.columns[c]);
      else stringish.push(viewData.columns[c]);
    }
    return { numeric, stringish, indicesByName };
  }, [viewData]);

  useEffect(() => {
    // Initialize sensible defaults when data is loaded or when toggling chart type
    if (
      !viewData ||
      !viewData.columns ||
      !viewData.rows ||
      !viewData.columns.length
    )
      return;
    if (activeView !== "chart") return;
    setChartError("");
    if (chartType === "bar" || chartType === "pie" || chartType === "line") {
      if (!xColumn) setXColumn(columnInfo.stringish[0] || viewData.columns[0]);
      if (!yColumn) setYColumn(columnInfo.numeric[0] || "");
    } else if (chartType === "bubble") {
      if (!bubbleX) setBubbleX(columnInfo.numeric[0] || "");
      if (!bubbleY)
        setBubbleY(columnInfo.numeric[1] || columnInfo.numeric[0] || "");
      if (!bubbleR)
        setBubbleR(
          columnInfo.numeric[2] ||
            columnInfo.numeric[1] ||
            columnInfo.numeric[0] ||
            ""
        );
    }
  }, [
    activeView,
    chartType,
    viewData,
    columnInfo,
    xColumn,
    yColumn,
    bubbleX,
    bubbleY,
    bubbleR,
  ]);

  const aggregatedByLabel = useMemo(() => {
    if (!viewData || !xColumn || !yColumn) return {};
    const xIdx = columnInfo.indicesByName[xColumn];
    const yIdx = columnInfo.indicesByName[yColumn];
    if (xIdx === undefined || yIdx === undefined) return {};
    const map = new Map();
    for (const row of viewData.rows) {
      const label = row[xIdx];
      const raw = row[yIdx];
      const value = typeof raw === "number" ? raw : Number(raw);
      if (label === null || label === undefined || label === "") continue;
      if (!Number.isFinite(value)) continue;
      map.set(label, (map.get(label) || 0) + value);
    }
    return Object.fromEntries(map);
  }, [viewData, xColumn, yColumn, columnInfo]);

  const bubblePoints = useMemo(() => {
    if (!viewData || !bubbleX || !bubbleY || !bubbleR) return [];
    const xi = columnInfo.indicesByName[bubbleX];
    const yi = columnInfo.indicesByName[bubbleY];
    const ri = columnInfo.indicesByName[bubbleR];
    if ([xi, yi, ri].some((v) => v === undefined)) return [];
    const points = [];
    let maxR = 0;
    for (const row of viewData.rows) {
      const x = typeof row[xi] === "number" ? row[xi] : Number(row[xi]);
      const y = typeof row[yi] === "number" ? row[yi] : Number(row[yi]);
      const r = typeof row[ri] === "number" ? row[ri] : Number(row[ri]);
      if ([x, y, r].some((n) => !Number.isFinite(n))) continue;
      if (r > maxR) maxR = r;
      points.push({ x, y, r });
    }
    // Scale radii to reasonable pixel sizes (3..25)
    const scaled = points.map((p) => ({
      x: p.x,
      y: p.y,
      r: maxR > 0 ? 3 + (p.r / maxR) * 22 : 5,
    }));
    return scaled;
  }, [viewData, bubbleX, bubbleY, bubbleR, columnInfo]);

  const chartData = useMemo(() => {
    if (!viewData) return null;
    const baseColors = {
      border: "rgba(59, 130, 246, 0.6)", // blue-500
      fill: "rgba(59, 130, 246, 0.2)",
      piePalette: [
        "#60A5FA",
        "#93C5FD",
        "#3B82F6",
        "#1D4ED8",
        "#2563EB",
        "#38BDF8",
        "#7DD3FC",
        "#0EA5E9",
        "#0284C7",
        "#38BDF8",
      ],
    };
    if (chartType === "bar" || chartType === "pie" || chartType === "line") {
      const entries = Object.entries(aggregatedByLabel);
      const labels = entries.map(([k]) => String(k));
      const dataValues = entries.map(([, v]) => v);
      if (chartType === "bar") {
        return {
          type: "bar",
          data: {
            labels,
            datasets: [
              {
                label: yColumn ? humanReadable(yColumn) : "Value",
                data: dataValues,
                backgroundColor: baseColors.fill,
                borderColor: baseColors.border,
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: { labels: { color: "#93c5fd" } },
              tooltip: { enabled: true },
            },
            scales: {
              x: { ticks: { color: "#9CA3AF" }, grid: { color: "#1F2937" } },
              y: { ticks: { color: "#9CA3AF" }, grid: { color: "#1F2937" } },
            },
          },
        };
      } else if (chartType === "pie") {
        return {
          type: "pie",
          data: {
            labels,
            datasets: [
              {
                label: yColumn ? humanReadable(yColumn) : "Value",
                data: dataValues,
                backgroundColor: labels.map(
                  (_, i) =>
                    baseColors.piePalette[i % baseColors.piePalette.length]
                ),
                borderColor: "rgba(17,24,39,0.6)",
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: "right",
                labels: { color: "#93c5fd" },
              },
              tooltip: { enabled: true },
            },
          },
        };
      } else {
        return {
          type: "line",
          data: {
            labels,
            datasets: [
              {
                label: yColumn ? humanReadable(yColumn) : "Value",
                data: dataValues,
                fill: false,
                borderColor: baseColors.border,
                backgroundColor: baseColors.border,
                tension: 0.3,
                pointRadius: 3,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: { labels: { color: "#93c5fd" } },
              tooltip: { enabled: true },
            },
            scales: {
              x: { ticks: { color: "#9CA3AF" }, grid: { color: "#1F2937" } },
              y: { ticks: { color: "#9CA3AF" }, grid: { color: "#1F2937" } },
            },
          },
        };
      }
    }
    if (chartType === "bubble") {
      return {
        type: "bubble",
        data: {
          datasets: [
            {
              label: `${bubbleX || "X"} vs ${bubbleY || "Y"}`,
              data: bubblePoints,
              backgroundColor: "rgba(59, 130, 246, 0.25)",
              borderColor: "rgba(59, 130, 246, 0.6)",
            },
          ],
        },
        options: {
          scales: {
            x: {
              title: { display: true, text: bubbleX, color: "#93c5fd" },
              ticks: { color: "#9CA3AF" },
              grid: { color: "#1F2937" },
            },
            y: {
              title: { display: true, text: bubbleY, color: "#93c5fd" },
              ticks: { color: "#9CA3AF" },
              grid: { color: "#1F2937" },
            },
          },
          plugins: { legend: { labels: { color: "#93c5fd" } } },
        },
      };
    }
    return null;
  }, [
    viewData,
    chartType,
    aggregatedByLabel,
    bubblePoints,
    humanReadable,
    yColumn,
    bubbleX,
    bubbleY,
  ]);

  const validateChartSelections = useCallback(() => {
    if (
      !viewData ||
      !viewData.columns ||
      !viewData.rows ||
      !viewData.rows.length
    ) {
      setChartError("No data available to chart.");
      return false;
    }
    if (chartType === "bar" || chartType === "pie" || chartType === "line") {
      if (!xColumn || !yColumn) {
        setChartError("Please select both label and value columns.");
        return false;
      }
      if (!columnInfo.numeric.includes(yColumn)) {
        setChartError("Selected value column must be numeric.");
        return false;
      }
      setChartError("");
      return true;
    }
    if (chartType === "bubble") {
      if (!bubbleX || !bubbleY || !bubbleR) {
        setChartError("Please select X, Y, and Radius columns.");
        return false;
      }
      const allNumeric = [bubbleX, bubbleY, bubbleR].every((c) =>
        columnInfo.numeric.includes(c)
      );
      if (!allNumeric) {
        setChartError("All bubble chart columns must be numeric.");
        return false;
      }
      setChartError("");
      return true;
    }
    return false;
  }, [
    viewData,
    chartType,
    xColumn,
    yColumn,
    bubbleX,
    bubbleY,
    bubbleR,
    columnInfo,
  ]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-6xl mx-auto px-8 py-12 space-y-12">
        {/* Timeline Section */}
        {/* <Card className="relative overflow-hidden bg-gradient-to-br from-blue-600/10 via-sky-500/5 to-transparent border border-gray-800/60 backdrop-blur-xl shadow-[0_0_0_1px_rgba(59,130,246,0.15)]"> */}
        {/* <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(600px_200px_at_80%_20%, rgba(59,130,246,0.15), transparent), radial-gradient(400px_120px_at_10%_90%, rgba(14,165,233,0.12), transparent)" }} /> */}
        {/* <CardContent className="p-8 relative"> */}
        <div className="mb-3">
          <p className="text-gray-400 text-sm">
            Select the period for data exploration. The selections below adapt
            to your chosen range.
          </p>
        </div>
        {/* <div className="rounded-xl border border-gray-800/60 bg-gray-900/40 p-4 hover:bg-gray-900/50 transition-colors"> */}
        <StatisticTimeline
          startYear={2019}
          onDateChange={handleDateRangeChange}
        />
        {/* </div> */}
        {/* </CardContent> */}
        {/* </Card> */}

        {/* Selection Controls */}
        {rangeYears.length > 0 && (
          <>
            {loading ? (
              <Card className="bg-gray-900/30 border-gray-800/50 backdrop-blur-sm">
                <CardContent className="p-12">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-blue-600/20 rounded-full flex items-center justify-center">
                      <div className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-400 rounded-full animate-spin" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-300">
                      Loading Statistics
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Please wait while we load available stats for you...
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : hasDataInRange ? (
              <Card className="relative overflow-hidden bg-gradient-to-br from-gray-900/60 via-gray-900/40 to-gray-900/20 border border-gray-800/70 backdrop-blur-xl">
                <div
                  className="pointer-events-none absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      "radial-gradient(600px_200px_at_0%_0%, rgba(59,130,246,0.08), transparent), radial-gradient(600px_200px_at_100%_100%, rgba(14,165,233,0.07), transparent)",
                  }}
                />
                <CardContent className="p-10 relative">
                  <div className="max-w-3xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/15 border border-blue-400/20 text-blue-300 text-sm font-semibold">
                          🎯
                        </span>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-100">
                            Selection
                          </h3>
                          <p className="text-gray-400 text-sm">
                            Choose an entity and a statistic to explore insights
                          </p>
                        </div>
                      </div>
                      <div className="hidden md:flex items-center gap-2">
                        {userSelectedDateRange[0] &&
                          userSelectedDateRange[1] && (
                            <div className="px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs">
                              {userSelectedDateRange[0].getUTCFullYear()} –{" "}
                              {userSelectedDateRange[1].getUTCFullYear()}
                            </div>
                          )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Entity Selection */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/15 border border-blue-400/20 text-blue-300 text-xs font-semibold">
                            1
                          </span>
                          <label className="block text-sm font-medium text-gray-300">
                            Entity
                          </label>
                        </div>
                        <div className="rounded-xl border border-gray-800/60 bg-gray-900/40 hover:bg-gray-900/50 transition-colors p-2">
                          <Select
                            value={selectedEntity}
                            onValueChange={handleEntityChange}
                          >
                            <SelectTrigger className="h-14 w-full bg-transparent border-gray-700 text-gray-100 ring-1 ring-transparent focus:ring-blue-500/30 focus:border-blue-500/40 rounded-lg hover:cursor-pointer">
                              <SelectValue placeholder="Choose entity" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-gray-700">
                              {Object.entries(categorizedEntities).map(
                                ([id, entity]) => (
                                  <SelectItem
                                    key={id}
                                    value={id}
                                    className="text-gray-100 hover:bg-gray-800 cursor-pointer focus:bg-gray-800 focus:text-white"
                                  >
                                    {entity.name}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <p className="text-xs text-gray-500">
                          Categories available for the selected time range
                        </p>
                      </div>

                      {/* Statistics Selection */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/15 border border-blue-400/20 text-blue-300 text-xs font-semibold">
                            2
                          </span>
                          <label className="block text-sm font-medium text-gray-300">
                            Statistic
                          </label>
                        </div>
                        <div className="rounded-xl border border-gray-800/60 bg-gray-900/40 hover:bg-gray-900/50 transition-colors p-2">
                          <Select
                            value={selectedStatistic}
                            onValueChange={setSelectedStatistic}
                            disabled={!selectedEntity}
                          >
                            <SelectTrigger className="h-14 w-full bg-transparent border-gray-700 text-gray-100 ring-1 ring-transparent focus:ring-blue-500/30 focus:border-blue-500/40 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer">
                              <SelectValue
                                placeholder={
                                  !selectedEntity
                                    ? "Select entity first"
                                    : availableStatistics.length === 0
                                    ? "No statistics available"
                                    : "Choose statistic"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-gray-700">
                              {availableStatistics.map((stat) => (
                                <SelectItem
                                  key={stat.id}
                                  value={stat.id}
                                  className="text-gray-100 hover:bg-gray-800 cursor-pointer focus:bg-gray-800 focus:text-white"
                                >
                                  {stat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <p className="text-xs text-gray-500">
                          Metrics inside the chosen entity
                        </p>
                      </div>

                      {/* Action Button */}
                      <div className="flex flex-col justify-end gap-2">
                        <Button
                          onClick={handleViewData}
                          disabled={
                            !selectedEntity || !selectedStatistic || dataLoading
                          }
                          className="group h-14 px-8 bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-[0_8px_24px_rgba(59,130,246,0.35)] disabled:opacity-50 disabled:cursor-not-allowed w-full hover:cursor-pointer"
                        >
                          {dataLoading ? (
                            <div className="flex items-center gap-3">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Exploring...
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <span>Explore Data</span>
                              <span className="opacity-80 group-hover:translate-x-0.5 transition-transform">
                                →
                              </span>
                            </div>
                          )}
                        </Button>
                        <p className="text-[11px] text-gray-500 text-center">
                          You can switch between Table and Chart after loading
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gray-900/30 border-gray-800/50 backdrop-blur-sm">
                <CardContent className="p-12">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-gray-800 rounded-full flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-gray-600 rounded-full" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-300">
                      No Data Available
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      There's no data available for the selected time range.
                      Please choose a different period.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Error Display */}
        {error && (
          <Card className="bg-red-950/30 border-red-800/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-red-400">
                <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Display */}
        {(viewData || dataLoading) && (
          <Card className="bg-gray-900/30 border-gray-800/50 backdrop-blur-sm">
            <CardContent className="p-8">
              {dataLoading ? (
                // Loading State
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-6 bg-blue-600/20 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-400 rounded-full animate-spin" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-300 mb-2">
                    Loading Data
                  </h4>
                  <p className="text-gray-500">
                    Please wait while we fetch your data...
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex items-center pb-10 gap-3 border-b border-gray-800">
                    <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0" />
                    <h3 className="text-xl font-medium text-gray-200">
                      {viewData.attributeName}
                    </h3>
                    {selectedEntity &&
                      categorizedEntities[selectedEntity] &&
                      (() => {
                        const match = categorizedEntities[
                          selectedEntity
                        ].statistics.find(
                          (stat) => stat.name === viewData.attributeName
                        );
                        const formattedDate = match
                          ? new Date(match.created).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )
                          : null;
                        return (
                          <div className="flex flex-wrap gap-2">
                            <span className="px-4 py-2 bg-blue-600/20 border border-blue-600/30 rounded-full text-blue-300 text-sm font-medium">
                              {categorizedEntities[selectedEntity].name}
                            </span>
                            {match && (
                              <span className="px-4 py-2 bg-blue-600/20 border border-blue-600/30 rounded-full text-blue-300 text-sm font-medium">
                                {formattedDate}
                              </span>
                            )}
                          </div>
                        );
                      })()}
                  </div>

                  {/* View Toggle */}
                  {viewData.columns &&
                    viewData.columns.length > 0 &&
                    viewData.rows &&
                    viewData.rows.length > 0 && (
                      <div className="flex items-center justify-between pb-4 border-b border-gray-800">
                        <div className="flex gap-2 bg-gray-800/50 p-1 rounded-lg">
                          <button
                            onClick={() => setActiveView("table")}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border ${
                              activeView === "table"
                                ? "bg-blue-600/20 text-blue-300 border-blue-600/30"
                                : "text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 border-transparent"
                            }`}
                          >
                            Table
                          </button>
                          <button
                            onClick={() => setActiveView("chart")}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border ${
                              activeView === "chart"
                                ? "bg-blue-600/20 text-blue-300 border-blue-600/30"
                                : "text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 border-transparent"
                            }`}
                          >
                            Chart
                          </button>
                        </div>
                      </div>
                    )}

                  {/* Table View */}
                  {activeView === "table" &&
                    viewData.columns &&
                    viewData.columns.length > 0 &&
                    viewData.rows &&
                    viewData.rows.length > 0 && (
                      <div className="space-y-4">
                        <div className="bg-gray-950/50 rounded-xl border border-gray-800/50 overflow-hidden">
                          <div className="overflow-auto max-h-[600px]">
                            <table className="w-full border-collapse">
                              <thead className="sticky top-0 z-10">
                                <tr className="bg-gray-800/90 backdrop-blur-sm border-b border-gray-700">
                                  {viewData.columns.map((column, index) => (
                                    <th
                                      key={index}
                                      className="px-6 py-4 text-left text-sm font-semibold text-blue-400 border-r border-gray-700/50 last:border-r-0"
                                    >
                                      {humanReadable(column)}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-800/50">
                                {viewData.rows.map((row, rowIndex) => (
                                  <tr
                                    key={rowIndex}
                                    className="hover:bg-gray-800/30 transition-colors duration-150"
                                  >
                                    {row.map((cellValue, colIndex) => (
                                      <td
                                        key={colIndex}
                                        className="px-6 py-4 text-sm text-gray-300 border-r border-gray-700/30 last:border-r-0"
                                      >
                                        {cellValue !== null &&
                                        cellValue !== undefined
                                          ? typeof cellValue === "number"
                                            ? cellValue.toLocaleString()
                                            : String(cellValue)
                                          : "-"}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {viewData.rows.length > 0 && (
                            <div className="bg-gray-800/30 px-6 py-3 border-t border-gray-800/50">
                              <p className="text-sm text-gray-400">
                                Showing{" "}
                                <span className="font-medium text-blue-400">
                                  {viewData.rows.length}
                                </span>{" "}
                                rows
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  {/* Chart View */}
                  {activeView === "chart" &&
                    viewData.columns &&
                    viewData.columns.length > 0 &&
                    viewData.rows &&
                    viewData.rows.length > 0 && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">
                              Chart Type
                            </label>
                            <Select
                              value={chartType}
                              onValueChange={(v) => {
                                setChartType(v);
                              }}
                            >
                              <SelectTrigger className="h-12 w-full bg-gray-900/50 border-gray-700 text-gray-100 hover:bg-gray-800/50 focus:border-blue-500 transition-all duration-200 hover:cursor-pointer">
                                <SelectValue placeholder="Choose chart type" />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-900 border-gray-700">
                                <SelectItem
                                  value="bar"
                                  className="text-gray-100 hover:bg-gray-800 cursor-pointer"
                                >
                                  Bar
                                </SelectItem>
                                <SelectItem
                                  value="pie"
                                  className="text-gray-100 hover:bg-gray-800 cursor-pointer"
                                >
                                  Pie
                                </SelectItem>
                                <SelectItem
                                  value="line"
                                  className="text-gray-100 hover:bg-gray-800 cursor-pointer"
                                >
                                  Line
                                </SelectItem>
                                <SelectItem
                                  value="bubble"
                                  className="text-gray-100 hover:bg-gray-800 cursor-pointer"
                                >
                                  Bubble
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {(chartType === "bar" ||
                            chartType === "pie" ||
                            chartType === "line") && (
                            <>
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">
                                  Label Column
                                </label>
                                <Select
                                  value={xColumn}
                                  onValueChange={setXColumn}
                                >
                                  <SelectTrigger className="h-12 w-full bg-gray-900/50 border-gray-700 text-gray-100 hover:bg-gray-800/50 focus:border-blue-500 transition-all duration-200 hover:cursor-pointer">
                                    <SelectValue placeholder="Select label column" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-gray-900 border-gray-700">
                                    {[
                                      ...columnInfo.stringish,
                                      ...columnInfo.numeric,
                                    ].map((c) => (
                                      <SelectItem
                                        key={c}
                                        value={c}
                                        className="text-gray-100 hover:bg-gray-800 cursor-pointer"
                                      >
                                        {humanReadable(c)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-300">
                                  Value Column
                                </label>
                                <Select
                                  value={yColumn}
                                  onValueChange={setYColumn}
                                >
                                  <SelectTrigger className="h-12 w-full bg-gray-900/50 border-gray-700 text-gray-100 hover:bg-gray-800/50 focus:border-blue-500 transition-all duration-200 hover:cursor-pointer">
                                    <SelectValue placeholder="Select numeric value column" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-gray-900 border-gray-700">
                                    {columnInfo.numeric.map((c) => (
                                      <SelectItem
                                        key={c}
                                        value={c}
                                        className="text-gray-100 hover:bg-gray-800 cursor-pointer"
                                      >
                                        {humanReadable(c)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </>
                          )}

                          {chartType === "bubble" && (
                            <>
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">
                                  X (numeric)
                                </label>
                                <Select
                                  value={bubbleX}
                                  onValueChange={setBubbleX}
                                >
                                  <SelectTrigger className="h-12 w-full bg-gray-900/50 border-gray-700 text-gray-100 hover:bg-gray-800/50 focus:border-blue-500 transition-all duration-200 hover:cursor-pointer">
                                    <SelectValue placeholder="Select numeric X" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-gray-900 border-gray-700">
                                    {columnInfo.numeric.map((c) => (
                                      <SelectItem
                                        key={c}
                                        value={c}
                                        className="text-gray-100 hover:bg-gray-800 cursor-pointer"
                                      >
                                        {humanReadable(c)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">
                                  Y (numeric)
                                </label>
                                <Select
                                  value={bubbleY}
                                  onValueChange={setBubbleY}
                                >
                                  <SelectTrigger className="h-12 w-full bg-gray-900/50 border-gray-700 text-gray-100 hover:bg-gray-800/50 focus:border-blue-500 transition-all duration-200 hover:cursor-pointer">
                                    <SelectValue placeholder="Select numeric Y" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-gray-900 border-gray-700">
                                    {columnInfo.numeric.map((c) => (
                                      <SelectItem
                                        key={c}
                                        value={c}
                                        className="text-gray-100 hover:bg-gray-800 cursor-pointer"
                                      >
                                        {humanReadable(c)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-300">
                                  Radius (numeric)
                                </label>
                                <Select
                                  value={bubbleR}
                                  onValueChange={setBubbleR}
                                >
                                  <SelectTrigger className="h-12 w-full bg-gray-900/50 border-gray-700 text-gray-100 hover:bg-gray-800/50 focus:border-blue-500 transition-all duration-200 hover:cursor-pointer">
                                    <SelectValue placeholder="Select numeric radius" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-gray-900 border-gray-700">
                                    {columnInfo.numeric.map((c) => (
                                      <SelectItem
                                        key={c}
                                        value={c}
                                        className="text-gray-100 hover:bg-gray-800 cursor-pointer"
                                      >
                                        {humanReadable(c)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </>
                          )}
                        </div>

                        {chartError && (
                          <div className="bg-red-950/30 border border-red-800/50 text-red-300 px-4 py-3 rounded-lg">
                            {chartError}
                          </div>
                        )}

                        <div className="flex justify-end">
                          <Button
                            onClick={() => {
                              if (validateChartSelections()) {
                                // noop, chartData memo will recompute and chart will render
                                setChartError("");
                              }
                            }}
                            className="h-auto px-6 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-all duration-200"
                          >
                            Render Chart
                          </Button>
                        </div>

                        <div className="bg-gray-950/50 rounded-xl border border-gray-800/50 p-4">
                          {chartType === "bar" &&
                            chartData &&
                            chartData.type === "bar" && (
                              <Bar
                                data={chartData.data}
                                options={chartData.options}
                              />
                            )}
                          {chartType === "pie" &&
                            chartData &&
                            chartData.type === "pie" && (
                              <Pie
                                data={chartData.data}
                                options={chartData.options}
                              />
                            )}
                          {chartType === "line" &&
                            chartData &&
                            chartData.type === "line" && (
                              <Line
                                data={chartData.data}
                                options={chartData.options}
                              />
                            )}
                          {chartType === "bubble" &&
                            chartData &&
                            chartData.type === "bubble" && (
                              <Bubble
                                data={chartData.data}
                                options={chartData.options}
                              />
                            )}
                          {!chartError &&
                            (!chartData ||
                              (chartType !== "bubble" &&
                                Object.keys(aggregatedByLabel).length ===
                                  0)) && (
                              <div className="text-gray-400 text-sm">
                                No chartable data for current selections.
                              </div>
                            )}
                        </div>
                      </div>
                    )}

                  {/* No data message - only shown when not loading and no data exists */}
                  {!dataLoading &&
                    (!viewData.columns || viewData.columns.length === 0) &&
                    (!viewData.rows || viewData.rows.length === 0) && (
                      <div className="text-center py-12 text-gray-500">
                        <div className="w-16 h-16 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
                          <div className="w-8 h-8 border-2 border-gray-600 rounded-full" />
                        </div>
                        <h4 className="text-lg font-medium text-gray-400 mb-2">
                          No Data Found
                        </h4>
                        <p>No data available for the selected criteria</p>
                      </div>
                    )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
