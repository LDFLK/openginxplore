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
  Cell,
} from "recharts";
import formatText from "../../../utils/common_functions";
import { useThemeContext } from "../../../context/themeContext";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";


const COLORS = [
  "#00bcd4", "#8bc34a", "#ffc107", "#ff9800", "#e91e63", "#9c27b0",
];

export function ChartVisualization({ columns, rows, yearlyData }) {
  const [xAxis, setXAxis] = useState("_category");
  const [selectedYColumns, setSelectedYColumns] = useState([]);
  const [numericColumns, setNumericColumns] = useState([]);
  const [stringColumns, setStringColumns] = useState([]);
  const [detectedTicks, setDetectedTicks] = useState([]);
  const [chartType, setChartType] = useState("bar");
  const chartRef = useRef(null);
  const chartContainerRef = useRef(null);


  const { isDark } = useThemeContext()

  const normalizedYearlyData = useMemo(() => {
    if (yearlyData?.length > 0) {
      return yearlyData;
    } else if (rows?.length > 0) {
      return [{ year: "single", rows: rows }];
    }
    return [];
  }, [yearlyData, rows]);

  const isNumericValue = (val) => {
    return (
      typeof val === "number" ||
      (!isNaN(Number(val)) && val !== null && val !== "")
    );
  };


  // Detect columns
  // Detect columns and handle single-row numeric datasets
  useEffect(() => {
    const stringCols = [];
    const numericCols = [];
    const rows =
      normalizedYearlyData.length > 0 ? normalizedYearlyData[0].rows : [];

    if (!rows || rows.length === 0 || !columns.length) {
      setNumericColumns([]);
      setStringColumns([]);
      return;
    }

    // Check if this is a single-row dataset with all numeric values
    const isSingleRowAllNumeric =
      rows.length === 1 &&
      columns.every((_, idx) => isNumericValue(rows[0][idx]));


    if (isSingleRowAllNumeric) {
      // For single-row numeric datasets, treat all columns as potential categories
      // The user will select which columns to visualize
      setStringColumns(["_category"]); // Virtual X-axis
      setNumericColumns(columns);
      setXAxis("_category");
    } else {
      // Normal detection logic
      columns.forEach((col, idx) => {
        const isNumeric = rows.some((row) => isNumericValue(row[idx]));
        if (isNumeric) numericCols.push(col);
        else stringCols.push(col);
      });

      setNumericColumns(numericCols);
      setStringColumns(stringCols);
    }

    setSelectedYColumns((prev) =>
      prev.filter((col) => (isSingleRowAllNumeric ? columns : numericCols).includes(col))
    );
  }, [columns, normalizedYearlyData]);


  const forceRGBColors = () => {
    const style = document.createElement("style");
    style.id = "force-rgb-style";
    style.innerHTML = `
    * {
      --background: #ffffff !important;
      --foreground: #1f2937 !important;
      --muted: #9ca3af !important;
      --muted-foreground: #e5e7eb !important;
      --border: #d1d5db !important;
      --input: #d1d5db !important;
      --ring: #2563eb !important;
      --primary: #2563eb !important;
      --primary-foreground: #ffffff !important;
      --secondary: #6b7280 !important;
      --secondary-foreground: #f9fafb !important;
      --accent: #4b5563 !important;
      --accent-foreground: #ffffff !important;
      --destructive: #ef4444 !important;
      --destructive-foreground: #ffffff !important;
      color-scheme: light !important;
    }

    /* Target only non-legend items */
    :not(.legend-color-box) {
      background: rgb(255,255,255) !important;
      color: rgb(31,41,55) !important;
      border-color: rgb(209,213,219) !important;
      box-shadow: none !important;
    }
    
    /* Fix legend box alignment */
    .legend-color-box {
      display: inline-block !important;
      vertical-align: middle !important;
    }
    
    /* Fix Y-axis label rotation for html2canvas */
    .y-axis-label-export {
      writing-mode: horizontal-tb !important;
      transform: rotate(-90deg) !important;
      transform-origin: center center !important;
    }
  `;
    document.head.appendChild(style);
  };

  const removeForcedRGB = () => {
    const style = document.getElementById("force-rgb-style");
    if (style) style.remove();
  };


  const handleDownloadImage = async () => {
    if (!chartContainerRef.current) return;
    forceRGBColors();

    try {
      const canvas = await html2canvas(chartContainerRef.current, {
        scale: 2,
        backgroundColor: isDark ? "#1f2937" : "#ffffff",
        useCORS: true,
        logging: false,
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = "chart.png";
      link.click();
    } catch (err) {
      console.error("html2canvas failed:", err);
    } finally {
      removeForcedRGB();
    }
  };

  const handleDownloadPDF = async () => {
    if (!chartContainerRef.current) return;
    forceRGBColors();

    try {
      const canvas = await html2canvas(chartContainerRef.current, {
        scale: 2,
        backgroundColor: isDark ? "#1f2937" : "#ffffff",
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save("chart.pdf");
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      removeForcedRGB();
    }
  };



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

    const rows = normalizedYearlyData.length > 0 ? normalizedYearlyData[0].rows : [];

    // Check if single-row all-numeric dataset
    const isSingleRowAllNumeric = rows.length === 1 && xAxis === "_category";

    if (isSingleRowAllNumeric) {
      // Transform: each selected column becomes a data point with values from all years
      return selectedYColumns.map((col) => {
        const dataPoint = {
          [xAxis]: formatText({ name: col }), // Use column name as category
        };

        // Add value for each year - using column name matching
        normalizedYearlyData.forEach((dataset) => {
          // Find the column index in this year's dataset by name
          const colIdx = dataset.columns?.indexOf(col) ?? columns.indexOf(col);

          if (dataset.rows && dataset.rows.length > 0 && colIdx !== -1) {
            const value = dataset.rows[0][colIdx];
            dataPoint[`${dataset.year}_value`] = Number(value) || 0;
          } else {
            dataPoint[`${dataset.year}_value`] = 0; // Column doesn't exist in this year
          }
        });

        return dataPoint;
      });
    }

    // multi-row dataset logic with column name matching
    const dataMap = new Map();

    normalizedYearlyData.forEach((dataset) => {
      // Get this year's column names
      const yearColumns = dataset.columns || columns;

      // Find the x-axis column index in this year's data by name
      const yearXIndex = yearColumns.indexOf(xAxis);

      if (yearXIndex === -1) {
        console.warn(`X-axis column "${xAxis}" not found in ${dataset.year} data`);
        return; // Skip this year if x-axis column doesn't exist
      }

      dataset.rows.forEach((row) => {
        const rawXVal = row[yearXIndex];
        const normalizedXVal = normalizeString(rawXVal);
        if (!normalizedXVal) return;

        // Initialize data point if it doesn't exist
        if (!dataMap.has(normalizedXVal)) {
          dataMap.set(normalizedXVal, { [xAxis]: rawXVal });
        }

        const dataPoint = dataMap.get(normalizedXVal);

        // For each selected Y column, find it by NAME in this year's columns
        selectedYColumns.forEach((col) => {
          const yearYIndex = yearColumns.indexOf(col);

          if (yearYIndex !== -1) {
            // Column exists in this year
            const value = row[yearYIndex];
            const key = `${dataset.year}_${col}`;
            const numValue = Number(value) || 0;
            dataPoint[key] = numValue;
          } else {
            // Column doesn't exist in this year - set to 0
            const key = `${dataset.year}_${col}`;
            dataPoint[key] = 0;
            console.warn(`Column "${col}" not found in ${dataset.year} data`);
          }
        });
      });
    });

    const result = Array.from(dataMap.values());

    // Fill in any missing year/column combinations with 0
    result.forEach((dataPoint) => {
      normalizedYearlyData.forEach((dataset) => {
        selectedYColumns.forEach((col) => {
          const key = `${dataset.year}_${col}`;
          if (dataPoint[key] === undefined) {
            dataPoint[key] = 0;
          }
        });
      });
    });

    // Sort by highest total
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

      return sumB - sumA;
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

  const renderCustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="rounded-lg border border-[#dbdbdb] p-2 text-sm shadow-md"
          style={{
            backgroundColor: !isDark ? "#dbdbdb" : "#1f2937",
            color: isDark ? "#dbdbdb" : "#1f2937",
          }}
        >
          <p className="font-semibold mb-1">{label}</p>
          {payload.map((entry, index) => {
            let finalColor = entry.color;
            if (!isMultiYear && xAxis === "_category") {
              const dataIndex = chartData.findIndex((d) => d[xAxis] === label);
              if (dataIndex !== -1) {
                finalColor = COLORS[dataIndex % COLORS.length];
              }
            }
            return (
              <div key={index} className="flex items-center gap-2">
                <span
                  style={{ backgroundColor: finalColor , width: 8, height: 8, borderRadius: "50%" , display: "inline-block", marginRight: 8}}
                />
                <span>{formatText({ name: entry.name })}:</span>
                <span className="font-medium">{entry.value}</span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {numericColumns.length > 0 &&
        !(numericColumns.length === 1 && numericColumns[0].toLowerCase() === "id") &&
        stringColumns.length !== 0 && (
          <div className="space-y-6 w-full">
            {/* Controls */}
            <div className="bg-background-dark border border-border rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-semibold text-accent/75">
                Visualizations
              </h3>

              <h3 className="text-sm font-semibold mb-2 text-primary/60">
                Select Chart Data
              </h3>

              {/* X-axis selector */}
              <div>
                <label className="text-sm font-medium text-primary/50">
                  X-Axis (Category):
                </label>
                <select
                  value={xAxis}
                  onChange={(e) => setXAxis(e.target.value)}
                  className="mt-1 block w-full border text-primary/75 border-border rounded-md p-2 text-sm bg-background focus:border-none"
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
              <div className="">
                <label className="text-sm font-medium text-primary/60">
                  Y-Axis (Values):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
                  {numericColumns
                    .filter((col) => {
                      const lower = col.toLowerCase();
                      return lower !== "id";
                    })
                    .map((col) => (
                      <label
                        key={col}
                        className="flex justify-start items-center space-x-2 text-sm break-words"
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
                        <span className="break-words max-w-[220px] text-primary">
                          {formatText({ name: col })}
                        </span>
                      </label>
                    ))}
                </div>
              </div>

              {/* Chart type selector */}
              <div className="flex items-center gap-3 mt-3">
                <label className="text-sm font-medium text-primary/75">
                  Chart Type:
                </label>
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                  className="border text-primary bg-background border-border rounded-md p-1.5 text-sm"
                >
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                </select>
              </div>
            </div>

            {/* Chart */}
            <div
              className="bg-background-dark border border-border rounded-lg p-4"
              ref={chartContainerRef}
            >
              <h3 className="text-sm font-semibold mb-4 text-primary/80">
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
                            className="legend-color-box"
                            style={{
                              width: 12,
                              height: 12,
                              backgroundColor: COLORS[yearIdx % COLORS.length],
                            }}
                          />
                          <span className="text-sm text-primary/75">{d.year}</span>
                        </div>

                      ))
                      : selectedYColumns.map((col, i) => (
                        <div key={col} className="flex items-center gap-2">
                          <div
                            className="legend-color-box"
                            style={{
                              width: 12,
                              height: 12,
                              backgroundColor: COLORS[i % COLORS.length],
                            }}
                          />
                          <span className="text-sm text-primary/75">
                            {formatText({ name: col })}
                          </span>
                        </div>
                      ))}
                  </div>

                  {/* Chart */}
                  <div className="flex flex-col">
                    <div className="flex">
                      {/* --- Y-Axis Section --- */}
                      <div
                        className="flex-shrink-0 bg-background-dark flex"
                        style={{
                          position: "relative",
                          height: 425,
                          left: 0,
                          zIndex: 10,
                          borderRight: "1px solid #374151",
                          marginBottom: 0,
                        }}
                      >
                        {/* Y-axis title */}
                        <div
                          className="flex items-center justify-center text-center text-primary/80"
                          style={{
                            width: 20,
                            writingMode: "vertical-rl",
                            transform: "rotate(180deg)",
                            fontSize: "0.85rem",
                            fontWeight: 500,
                          }}
                        >
                          {selectedYColumns.length >= 1 &&
                            "Value"}
                        </div>

                        {/* Y-axis tick labels */}
                        <div
                          style={{
                            width: 60,
                            position: "relative",
                            height: "100%",
                          }}
                        >
                          {detectedTicks.length > 0 &&
                            detectedTicks.map((tickVal, i) => {
                              const totalTicks = detectedTicks.length;
                              const percentage = (i / (totalTicks - 1)) * 100;
                              return (
                                <div
                                  key={`${tickVal}-${i}`}
                                  className="text-xs text-right pr-1 text-primary/75"
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
                      </div>

                      {/* --- Scrollable Chart Area --- */}
                      <div className="overflow-x-auto flex-1 no-scrollbar" ref={chartRef}>
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
                                        fill={isDark ? "white" : "dark"}
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
                                          fill={isDark ? "white" : "dark"}
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
                              <Tooltip content={renderCustomTooltip} />
                              {xAxis === "_category" ? (
                                // Single-row numeric dataset: bars for each year
                                normalizedYearlyData.map((d, yearIdx) => (
                                  <Bar
                                    key={d.year}
                                    dataKey={`${d.year}_value`}
                                    fill={COLORS[yearIdx % COLORS.length]}
                                    maxBarSize={barWidth}
                                  >
                                    {!isMultiYear &&
                                      chartData.map((entry, index) => (
                                        <Cell
                                          key={`cell-${index}`}
                                          fill={COLORS[index % COLORS.length]}
                                        />
                                      ))}
                                  </Bar>
                                ))
                              ) : (
                                // Normal multi-row dataset
                                selectedYColumns.map((col, colIdx) =>
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
                                )
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
                                        fill={isDark ? "white" : "dark"}
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
                                          fill={isDark ? "white" : "dark"}
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
                              <Tooltip content={renderCustomTooltip} shared={false} />


                              {xAxis === "_category" ? (
                                // Single-row numeric dataset: lines for each year
                                normalizedYearlyData.map((d, yearIdx) => (
                                  <Line
                                    key={d.year}
                                    type="monotone"
                                    dataKey={`${d.year}_value`}
                                    stroke={COLORS[yearIdx % COLORS.length]}
                                    strokeWidth={2}
                                    dot={(props) => {
                                      const { cx, cy, index } = props;
                                      return (
                                        <circle
                                          key={`dot-${index}`}
                                          cx={cx}
                                          cy={cy}
                                          r={4}
                                          fill={!isMultiYear ? COLORS[index % COLORS.length] : COLORS[yearIdx % COLORS.length]}
                                          stroke="none"
                                        />
                                      );
                                    }}
                                    activeDot={{ r: 6 }}
                                  />
                                ))
                              ) : (
                                // Normal multi-row dataset
                                selectedYColumns.map((col, colIdx) =>
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
                                )
                              )}
                            </LineChart>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* --- X-axis Title --- */}
                    <div className="text-center mt-1">
                      <span className="text-sm text-primary/80 font-medium">
                        {formatText({ name: xAxis })}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-primary text-sm">
                  Select X and Y columns to generate the chart.
                </p>
              )}
            </div>
          </div>
        )}
    </>
  );
}