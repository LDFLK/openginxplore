import { useEffect, useMemo, useState, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import formatText from "../../utils/common_functions";

const COLORS = [
  "#004c99", "#0066cc", "#007bff", "#3399ff",
  "#66b2ff", "#99ccff", "#cce5ff",
];

export function ChartVisualization({ columns, rows }) {
  const [xAxis, setXAxis] = useState("district");
  const [selectedYColumns, setSelectedYColumns] = useState([]);
  const [numericColumns, setNumericColumns] = useState([]);
  const [stringColumns, setStringColumns] = useState([]);
  const [detectedTicks, setDetectedTicks] = useState([]);
  const chartRef = useRef(null);

  useEffect(() => {
    const stringCols = [];
    const numericCols = [];

    if (!rows || rows.length === 0 || !columns.length) {
      setNumericColumns([]);
      setStringColumns([]);
      return;
    }

    columns.forEach((col, idx) => {
      const isNumeric = rows.some((row) => {
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
    setSelectedYColumns([]);
  }, [columns, rows]);

  const chartData = useMemo(() => {
    if (!xAxis || selectedYColumns.length === 0) return [];
    const xIndex = columns.indexOf(xAxis);
    const yIndexes = selectedYColumns.map((col) => columns.indexOf(col));

    return rows.map((row) => {
      const obj = {};
      obj[xAxis] = row[xIndex];
      yIndexes.forEach((yIdx, i) => {
        obj[selectedYColumns[i]] = Number(row[yIdx]) || 0;
      });
      return obj;
    });
  }, [columns, rows, xAxis, selectedYColumns]);

  // Extract ticks from the actual rendered chart
  useEffect(() => {
    if (!chartRef.current) return;

    const timer = setTimeout(() => {
      try {
        // Find all Y-axis tick elements in the SVG
        const svg = chartRef.current.querySelector('svg');
        if (!svg) return;

        const yAxisTicks = svg.querySelectorAll('.recharts-yAxis .recharts-cartesian-axis-tick');
        const ticks = Array.from(yAxisTicks).map(tick => {
          const text = tick.querySelector('text');
          return text ? parseFloat(text.textContent) : 0;
        }).filter(val => !isNaN(val)).sort((a, b) => b - a);

        if (ticks.length > 0) {
          setDetectedTicks(ticks);
        }
      } catch (e) {
        console.log('Could not extract ticks', e);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [chartData, selectedYColumns]);

  return (
    <>
      {numericColumns.length > 0 && !(numericColumns.length === 1 && numericColumns[0].toLowerCase() === "id") && (
        <div className="space-y-6 w-full">
          {/* Controls */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold text-gray-300">Visualizations</h3>
            <h3 className="text-sm font-semibold mb-2 text-gray-400">Select Chart Data</h3>

            {/* X-axis selector */}
            <div>
              <label className="text-sm font-medium text-gray-400">X-Axis (Category):</label>
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

            {/* Y-axis (multiple) */}
            <div className="bg-gray-800 ">
              <label className="text-sm font-medium text-gray-400">Y-Axis (Values):</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mt-2 bg-gray-800">
                {numericColumns
                  .filter((col) => col !== "id" && col !== "total")
                  .map((col) => (
                    <label
                      key={col}
                      className="flex items-start space-x-2 text-sm break-words "
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
          </div>

          {/* Chart */}
          <div className="bg-gray-800  border border-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-4 text-gray-400">Bar Chart</h3>

            {chartData.length > 0 ? (
              <div className="space-y-4">
                {/* Fixed Legend */}
                <div className="flex justify-center items-center gap-4 flex-wrap pb-2 border-border" >
                  {selectedYColumns.map((col, i) => (
                    <div key={col} className="flex items-center gap-2">
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          backgroundColor: COLORS[i % COLORS.length],
                        }}
                      />
                      <span className="text-sm">{col}</span>
                    </div>
                  ))}
                </div>

                <div className="flex">
                  {/* Y-axis sticky labels */}
                  <div
                    className="flex-shrink-0 bg-gray-800"
                    style={{
                      width: 60,
                      position: "relative",
                      height: 425,
                      left: 0,
                      zIndex: 10,
                      borderRight: "1px solid var(--border)",
                      marginBottom: 60,
                    }}
                  >
                    {detectedTicks.length > 0 ? detectedTicks.map((tickVal, i) => {
                      const totalTicks = detectedTicks.length;
                      const percentage = (i / (totalTicks - 1)) * 100;

                      return (
                        <div
                          key={`${tickVal}-${i}`}
                          className="text-xs text-right pr-1 text-gray-300"
                          style={{
                            position: 'absolute',
                            top: `${percentage}%`,
                            transform: 'translateY(-50%)',
                            width: '100%',
                            paddingRight: '4px',
                          }}
                        >
                          {Math.round(tickVal)}
                        </div>
                      );
                    }) : null}
                  </div>

                  {/* Scrollable chart */}
                  <div className="overflow-x-auto flex-1" ref={chartRef}>
                    <div
                      style={{
                        minWidth: `${chartData.length * 100}px`,
                        height: 455,
                        overflow: "hidden",
                      }}
                    >
                      <div className="overflow-x-auto flex-1">
                        <div
                          style={{
                            minWidth: `${chartData.length * 100}px`,
                            width: Math.max(chartData.length * 100, 1000),
                            height: 455,
                            overflow: "hidden",
                          }}
                        >
                          <BarChart
                            data={chartData}
                            width={Math.max(chartData.length * 100, 1000)}
                            height={450}
                            margin={{ left: -60, bottom: -60 }}
                            barCategoryGap="15%"
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />

                            <XAxis
                              dataKey={xAxis}
                              stroke="var(--foreground)"
                              interval={0}
                              height={86}
                              tickLine={false}
                              axisLine={{ stroke: "var(--border)" }}
                              tick={({ x, y, payload }) => {
                                const maxCharsPerLine = 15;
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
                              tick={{ fill: 'transparent' }}
                            />

                            <Tooltip
                              contentStyle={{
                                backgroundColor: "var(--card)",
                                border: "1px solid var(--border)",
                                borderRadius: "0.5rem",
                              }}
                              formatter={(value, name) => [value, formatText({ name: name })]}
                            />

                            {selectedYColumns.map((col, i) => (
                              <Bar
                                key={col}
                                dataKey={col}
                                fill={COLORS[i % COLORS.length]}
                                stackId="a"
                              />
                            ))}
                          </BarChart>
                        </div>
                      </div>
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