import { useEffect, useMemo, useState, useRef } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import formatText from "../../utils/common_functions";

const COLORS = [
  "#00bcd4", "#8bc34a", "#ffc107", "#ff9800", "#e91e63", "#9c27b0",
];

export function ChartVisualization({ columns, rows, yearlyData }) {
  const [xAxis, setXAxis] = useState("district");
  const [selectedYColumns, setSelectedYColumns] = useState([]);
  const [numericColumns, setNumericColumns] = useState([]);
  const [stringColumns, setStringColumns] = useState([]);
  const [detectedTicks, setDetectedTicks] = useState([]);
  const [chartType, setChartType] = useState("bar");
  const chartRef = useRef(null);

  const normalizedYearlyData = useMemo(() => {
    if (yearlyData?.length > 0) {
      return yearlyData;
    } else if (rows?.length > 0) {
      return [{ year: "single", rows: rows }];
    }
    return [];
  }, [yearlyData, rows]);

  // Detect columns
  useEffect(() => {
    const stringCols = [];
    const numericCols = [];
    const sampleRows =
      normalizedYearlyData.length > 0 ? normalizedYearlyData[0].rows : [];

    if (!sampleRows || sampleRows.length === 0 || !columns.length) {
      setNumericColumns([]);
      setStringColumns([]);
      return;
    }

    columns.forEach((col, idx) => {
      const isNumeric = sampleRows.some((row) => {
        const val = row[idx];
        return (
          typeof val === "number" ||
          (!isNaN(Number(val)) && val !== null && val !== "")
        );
      });

      if (isNumeric) numericCols.push(col);
      else stringCols.push(col);
    });

    setNumericColumns(numericCols);
    setStringColumns(stringCols);

    setSelectedYColumns((prev) =>
      prev.filter((col) => numericCols.includes(col))
    );
  }, [columns, normalizedYearlyData]);

  const normalizeString = (str) => {
    if (str === null || str === undefined) return "";
    return String(str)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, "");
  };

  const chartData = useMemo(() => {
    if (normalizedYearlyData.length === 0 || selectedYColumns.length === 0) {
      return [];
    }

    const dataMap = new Map();

    normalizedYearlyData.forEach((dataset) => {
      let yearXIndex = -1;

      if (dataset.rows.length > 0) {
        const firstRow = dataset.rows[0];
        firstRow.forEach((val, idx) => {
          if (typeof val === "string" && val.length > 2 &&
            isNaN(parseFloat(val))
          ) {
            yearXIndex = idx;
          }
        });
      }

      if (yearXIndex === -1) return;

      const globalXIndex = columns.indexOf(xAxis);

      dataset.rows.forEach((row) => {
        const rawXVal = row[yearXIndex];
        const normalizedXVal = normalizeString(rawXVal);
        if (!normalizedXVal) return;

        if (!dataMap.has(normalizedXVal)) {
          dataMap.set(normalizedXVal, { [xAxis]: rawXVal });
        }

        const dataPoint = dataMap.get(normalizedXVal);

        selectedYColumns.forEach((col) => {
          const globalYIndex = columns.indexOf(col);
          const offset = yearXIndex - globalXIndex;
          const actualYIndex = globalYIndex + offset;

          const value = row[actualYIndex];
          const key = `${dataset.year}_${col}`;
          const numValue = Number(value) || 0;

          dataPoint[key] = numValue;
        });
      });
    });

    const result = Array.from(dataMap.values());
    result.forEach((dataPoint) => {
      normalizedYearlyData.forEach((dataset) => {
        selectedYColumns.forEach((col) => {
          const key = `${dataset.year}_${col}`;
          if (dataPoint[key] === undefined) dataPoint[key] = 0;
        });
      });
    });

    // Sort for highest total
    result.sort((a, b) => {
      const sumA = selectedYColumns.reduce((acc, col) => {
        return acc + normalizedYearlyData.reduce((yearAcc, d) => {
          return yearAcc + (a[`${d.year}_${col}`] || 0);
        }, 0);
      }, 0);

      const sumB = selectedYColumns.reduce((acc, col) => {
        return acc + normalizedYearlyData.reduce((yearAcc, d) => {
          return yearAcc + (b[`${d.year}_${col}`] || 0);
        }, 0);
      }, 0);

      return sumB - sumA; // Highest first
    });
    return result;

  }, [columns, xAxis, selectedYColumns, normalizedYearlyData]);

  // Extract Y-axis ticks
  useEffect(() => {
    if (!chartRef.current) return;

    const timer = setTimeout(() => {
      try {
        const svg = chartRef.current.querySelector("svg");
        if (!svg) return;

        const yAxisTicks = svg.querySelectorAll(
          ".recharts-yAxis .recharts-cartesian-axis-tick"
        );
        const ticks = Array.from(yAxisTicks)
          .map((tick) => {
            const text = tick.querySelector("text");
            return text ? parseFloat(text.textContent) : 0;
          })
          .filter((val) => !isNaN(val))
          .sort((a, b) => b - a);

        if (ticks.length > 0) setDetectedTicks(ticks);
      } catch (e) {
        console.log("Could not extract ticks", e);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [chartData, selectedYColumns]);

  const isMultiYear = normalizedYearlyData.length > 1;

  const barsPerCategory = normalizedYearlyData.length * selectedYColumns.length;

  const barWidth = 40;
  const barGap = -20;
  const categoryGap = 60;

  const widthPerCategory = (barsPerCategory * (barWidth + barGap)) + categoryGap;

  const totalChartWidth = Math.max(chartData.length * widthPerCategory, 1200);

  return (
    <>
      {numericColumns.length > 0 &&
        !(numericColumns.length === 1 && numericColumns[0].toLowerCase() === "id") &&
        stringColumns.length !== 0 && (
          <div className="space-y-6 w-full">
            {/* Controls */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-semibold text-gray-300">
                Visualizations
              </h3>

              <h3 className="text-sm font-semibold mb-2 text-gray-400">
                Select Chart Data
              </h3>

              {/* X-axis selector */}
              <div>
                <label className="text-sm font-medium text-gray-400">
                  X-Axis (Category):
                </label>
                <select
                  value={xAxis}
                  onChange={(e) => setXAxis(e.target.value)}
                  className="mt-1 block w-full border text-gray-400 border-gray-700 rounded-md p-2 text-sm bg-gray-800"
                >
                  <option value="">Select column</option>
                  {stringColumns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>

              {/* Y-axis checkboxes */}
              <div className="bg-gray-800">
                <label className="text-sm font-medium text-gray-400">
                  Y-Axis (Values):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mt-2 bg-gray-800">
                  {numericColumns
                    .filter((col) => {
                      const lower = col.toLowerCase();
                      return lower !== "id";
                    })
                    .map((col) => (
                      <label
                        key={col}
                        className="flex items-start space-x-2 text-sm break-words"
                      >
                        <input
                          type="checkbox"
                          checked={selectedYColumns.includes(col)}
                          onChange={(e) => {
                            setSelectedYColumns((prev) =>
                              e.target.checked
                                ? [...prev, col]
                                : prev.filter((c) => c !== col)
                            );
                          }}
                        />
                        <span className="break-words max-w-[220px] text-gray-400">
                          {formatText({ name: col })}
                        </span>
                      </label>
                    ))}
                </div>
              </div>

              {/* Chart type selector */}
              <div className="flex items-center gap-3 mt-3">
                <label className="text-sm font-medium text-gray-400">
                  Chart Type:
                </label>
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                  className="border text-gray-400 border-gray-700 rounded-md p-1.5 text-sm bg-gray-800"
                >
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                </select>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-4 text-gray-400">
                {chartType === "bar" ? "Bar Chart" : "Line Chart"}
              </h3>

              {chartData.length > 0 ? (
                <div className="space-y-4">
                  {/* Legend */}
                  <div className="flex justify-center items-center gap-4 flex-wrap pb-2 border-border">
                    {isMultiYear
                      ? normalizedYearlyData.map((d, yearIdx) => (
                        <div key={d.year} className="flex items-center gap-2">
                          <div
                            style={{
                              width: 12,
                              height: 12,
                              backgroundColor:
                                COLORS[yearIdx % COLORS.length],
                            }}
                          />
                          <span className="text-sm text-gray-300">
                            {d.year}
                          </span>
                        </div>
                      ))
                      : selectedYColumns.map((col, i) => (
                        <div key={col} className="flex items-center gap-2">
                          <div
                            style={{
                              width: 12,
                              height: 12,
                              backgroundColor:
                                COLORS[i % COLORS.length],
                            }}
                          />
                          <span className="text-sm text-gray-300">
                            {formatText({ name: col })}
                          </span>
                        </div>
                      ))}
                  </div>

                  <div className="flex">
                    {/* Sticky Y-axis */}
                    <div
                      className="flex-shrink-0 bg-gray-800"
                      style={{
                        width: 60,
                        position: "relative",
                        height: 425,
                        left: 0,
                        zIndex: 10,
                        borderRight: "1px solid #374151",
                        marginBottom: 60,
                      }}
                    >
                      {detectedTicks.length > 0 &&
                        detectedTicks.map((tickVal, i) => {
                          const totalTicks = detectedTicks.length;
                          const percentage = (i / (totalTicks - 1)) * 100;
                          return (
                            <div
                              key={`${tickVal}-${i}`}
                              className="text-xs text-right pr-1 text-gray-300"
                              style={{
                                position: "absolute",
                                top: `${percentage}%`,
                                transform: "translateY(-50%)",
                                width: "100%",
                                paddingRight: "4px",
                              }}
                            >
                              {Math.round(tickVal)}
                            </div>
                          );
                        })}
                    </div>

                    {/* Scrollable chart area */}
                    <div className="overflow-x-auto flex-1" ref={chartRef}>
                      <div
                        style={{
                          minWidth: `${totalChartWidth}px`,
                          height: 455,
                          overflow: "hidden",
                        }}
                      >
                        {chartType === "bar" ? (
                          <BarChart
                            data={chartData}
                            width={totalChartWidth}
                            height={450}
                            margin={{ left: -60, bottom: -60 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#374151"
                              strokeOpacity={0.5}
                            />
                            <XAxis
                              dataKey={xAxis}
                              stroke="white"
                              interval={0}
                              height={86}
                              tickLine={false}
                              axisLine={{ stroke: "#374151" }}
                              tick={({ x, y, payload }) => {
                                const maxCharsPerLine = 13;
                                const text = payload.value;
                                let line1 = text;
                                let line2 = "";
                                if (text.length > maxCharsPerLine) {
                                  const splitIndex = text.lastIndexOf(" ", maxCharsPerLine);
                                  if (splitIndex > 0) {
                                    line1 = text.slice(0, splitIndex);
                                    line2 = text.slice(splitIndex + 1);
                                  } else {
                                    line1 = text.slice(0, maxCharsPerLine);
                                    line2 = text.slice(maxCharsPerLine);
                                  }
                                }
                                return (
                                  <g transform={`translate(${x},${y + 2.5})`}>
                                    <text
                                      x={0}
                                      y={0}
                                      textAnchor="middle"
                                      fontSize={11.5}
                                      fill="white"
                                      fillOpacity={0.7}
                                    >
                                      {line1}
                                    </text>
                                    {line2 && (
                                      <text
                                        x={0}
                                        y={12}
                                        textAnchor="middle"
                                        fontSize={11.5}
                                        fill="white"
                                        fillOpacity={0.7}
                                      >
                                        {line2}
                                      </text>
                                    )}
                                  </g>
                                );
                              }}
                            />
                            <YAxis
                              stroke="transparent"
                              tickLine={false}
                              axisLine={false}
                              tick={{ fill: "transparent" }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1f2937",
                                border: "1px solid #374151",
                                borderRadius: "0.5rem",
                              }}
                              formatter={(value, name) => [value, formatText({ name: name })]}
                              shared={false}
                            />
                            {selectedYColumns.map((col, colIdx) =>
                              normalizedYearlyData.map((d, yearIdx) => (
                                <Bar
                                  key={`${d.year}_${col}`}
                                  dataKey={`${d.year}_${col}`}
                                  fill={
                                    isMultiYear
                                      ? COLORS[yearIdx % COLORS.length]
                                      : COLORS[colIdx % COLORS.length]
                                  }
                                  maxBarSize={barWidth}
                                />
                              ))
                            )}
                          </BarChart>
                        ) : (
                          <LineChart
                            data={chartData}
                            width={totalChartWidth}
                            height={450}
                            margin={{ left: -25, bottom: -60, right: 50 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#374151"
                              strokeOpacity={0.5}
                            />
                            <XAxis
                              dataKey={xAxis}
                              stroke="white"
                              interval={0}
                              height={86}
                              tickLine={false}
                              axisLine={{ stroke: "#374151" }}
                              tick={({ x, y, payload }) => {
                                const maxCharsPerLine = 13;
                                const text = payload.value;
                                let line1 = text;
                                let line2 = "";
                                if (text.length > maxCharsPerLine) {
                                  const splitIndex = text.lastIndexOf(" ", maxCharsPerLine);
                                  if (splitIndex > 0) {
                                    line1 = text.slice(0, splitIndex);
                                    line2 = text.slice(splitIndex + 1);
                                  } else {
                                    line1 = text.slice(0, maxCharsPerLine);
                                    line2 = text.slice(maxCharsPerLine);
                                  }
                                }
                                return (
                                  <g transform={`translate(${x},${y + 2.5})`}>
                                    <text
                                      x={0}
                                      y={0}
                                      textAnchor="middle"
                                      fontSize={11.5}
                                      fill="white"
                                      fillOpacity={0.7}
                                    >
                                      {line1}
                                    </text>
                                    {line2 && (
                                      <text
                                        x={0}
                                        y={12}
                                        textAnchor="middle"
                                        fontSize={11.5}
                                        fill="white"
                                        fillOpacity={0.7}
                                      >
                                        {line2}
                                      </text>
                                    )}
                                  </g>
                                );
                              }}
                            />
                            <YAxis
                              stroke="transparent"
                              tickLine={false}
                              axisLine={false}
                              tick={{ fill: "transparent" }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1f2937",
                                border: "1px solid #374151",
                                borderRadius: "0.5rem",
                              }}
                              formatter={(value, name) => [value, formatText({ name: name })]}
                              shared={false}
                            />
                            {selectedYColumns.map((col, colIdx) =>
                              normalizedYearlyData.map((d, yearIdx) => (
                                <Line
                                  key={`${d.year}_${col}`}
                                  type="monotone"
                                  dataKey={`${d.year}_${col}`}
                                  stroke={
                                    isMultiYear
                                      ? COLORS[yearIdx % COLORS.length]
                                      : COLORS[colIdx % COLORS.length]
                                  }
                                  strokeWidth={2}
                                  dot={{ r: 2 }}
                                  activeDot={{ r: 4 }}
                                />
                              ))
                            )}
                          </LineChart>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-400 text-sm">
                  Select X and Y columns to generate the chart.
                </p>
              )}
            </div>
          </div>
        )}
    </>
  );
}