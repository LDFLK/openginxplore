
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
  ResponsiveContainer,
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
  const [detectedXTicks, setDetectedXTicks] = useState([]);
  const [tickRevision, setTickRevision] = useState(0);
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

  const normalizeString = (str) => {
    if (str === null || str === undefined) return "";
    return String(str)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, "");
  };

  const isXString = useMemo(() => stringColumns.includes(xAxis), [xAxis, stringColumns]);
  const yStringColumn = useMemo(() => selectedYColumns.find(col => stringColumns.includes(col)), [selectedYColumns, stringColumns]);
  const isAnyYString = !!yStringColumn;

  // Determine layout: Horizontal if Y has a string and X doesn't
  const chartLayout = (isAnyYString && !isXString) ? 'horizontal' : 'vertical';

  // For data transformation
  const categoryAxisKey = chartLayout === 'horizontal' ? yStringColumn : xAxis;
  const valueColumns = useMemo(() => {
    if (chartLayout === 'horizontal') {
      // If layout is horizontal, X is always a measure, plus any numeric Y columns
      const cols = [xAxis, ...selectedYColumns.filter(col => numericColumns.includes(col))].filter(Boolean);
      return [...new Set(cols)]; // Remove duplicates
    } else {
      // If layout is vertical, only numeric Y columns are measures
      return selectedYColumns.filter(col => numericColumns.includes(col));
    }
  }, [chartLayout, xAxis, selectedYColumns, numericColumns]);

  const chartData = useMemo(() => {
    if (normalizedYearlyData.length === 0 || (selectedYColumns.length === 0 && !isAnyYString)) {
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
      const yearColumns = dataset.columns || columns;
      const yearCategoryIndex = yearColumns.indexOf(categoryAxisKey);

      if (yearCategoryIndex === -1) {
        console.warn(`Category column "${categoryAxisKey}" not found in ${dataset.year} data`);
        return;
      }

      dataset.rows.forEach((row) => {
        const rawCategoryVal = row[yearCategoryIndex];
        const normalizedCategoryVal = normalizeString(rawCategoryVal);
        if (!normalizedCategoryVal) return;

        if (!dataMap.has(normalizedCategoryVal)) {
          dataMap.set(normalizedCategoryVal, { [categoryAxisKey]: rawCategoryVal });
        }

        const dataPoint = dataMap.get(normalizedCategoryVal);

        valueColumns.forEach((col) => {
          const yearValueIndex = yearColumns.indexOf(col);
          const key = `${dataset.year}_${col}`;

          if (yearValueIndex !== -1) {
            const value = row[yearValueIndex];
            dataPoint[key] = Number(value) || 0;
          } else {
            dataPoint[key] = 0;
          }
        });
      });
    });

    const result = Array.from(dataMap.values());

    // Fill missing values
    result.forEach((dataPoint) => {
      normalizedYearlyData.forEach((dataset) => {
        valueColumns.forEach((col) => {
          const key = `${dataset.year}_${col}`;
          if (dataPoint[key] === undefined) dataPoint[key] = 0;
        });
      });
    });

    // Sort by highest total
    result.sort((a, b) => {
      const sumA = valueColumns.reduce((acc, col) => {
        return acc + normalizedYearlyData.reduce((yearAcc, d) => {
          return yearAcc + (a[`${d.year}_${col}`] || 0);
        }, 0);
      }, 0);

      const sumB = valueColumns.reduce((acc, col) => {
        return acc + normalizedYearlyData.reduce((yearAcc, d) => {
          return yearAcc + (b[`${d.year}_${col}`] || 0);
        }, 0);
      }, 0);

      return sumB - sumA;
    });

    return result;
  }, [columns, xAxis, selectedYColumns, normalizedYearlyData, categoryAxisKey, valueColumns, isAnyYString]);

  // Extract labels from the fixed Y-axis (left axis) for manual rendering
  useEffect(() => {
    if (!chartRef.current) return;

    const timer = setTimeout(() => {
      try {
        const svg = chartRef.current.querySelector("svg");
        if (!svg) return;

        // The sticky left axis is always the Recharts YAxis
        const yAxisTicksNodes = svg.querySelectorAll(".recharts-yAxis .recharts-cartesian-axis-tick");
        const ticks = Array.from(yAxisTicksNodes)
          .map((tick) => {
            const text = tick.querySelector("text");
            const transform = tick.getAttribute("transform");
            let y = 0;
            if (transform && transform.includes("translate")) {
              const parts = transform.replace("translate(", "").replace(")", "").split(/[\s,]+/);
              if (parts.length >= 2) {
                y = parseFloat(parts[1]);
              } else if (parts.length === 1) {
                y = parseFloat(parts[0]);
              }
            } else if (text) {
              const attrY = text.getAttribute("y");
              if (attrY) y = parseFloat(attrY);
            }

            // Extract label, preserving spaces between tspans (Recharts' default wrapping)
            let label = "";
            if (text) {
              if (text.childNodes.length > 0) {
                label = Array.from(text.childNodes)
                  .map(node => node.textContent)
                  .join(" ")
                  .trim()
                  .replace(/\s+/g, " "); // collapse multiple spaces
              } else {
                label = text.textContent;
              }
            }

            return {
              label: label,
              y: y
            };
          })
          .filter((t) => t.label !== "");

        if (ticks.length > 0) {
          setDetectedTicks(ticks);
        }

        // Extract X-axis ticks for horizontal sticky axis
        const xAxisTicksNodes = svg.querySelectorAll(".recharts-xAxis .recharts-cartesian-axis-tick");
        const xTicks = Array.from(xAxisTicksNodes)
          .map((tick) => {
            const text = tick.querySelector("text");
            const transform = tick.getAttribute("transform");
            let x = 0;
            if (transform && transform.includes("translate")) {
              const parts = transform.replace("translate(", "").replace(")", "").split(/[\s,]+/);
              if (parts.length >= 1) {
                x = parseFloat(parts[0]);
              }
            } else if (text) {
              const attrX = text.getAttribute("x");
              if (attrX) x = parseFloat(attrX);
            }
            // Extract label, preserving spaces
            let label = "";
            if (text) {
              if (text.childNodes.length > 0) {
                label = Array.from(text.childNodes)
                  .map(node => node.textContent)
                  .join(" ")
                  .trim()
                  .replace(/\s+/g, " ");
              } else {
                label = text.textContent;
              }
            }

            return {
              label: label,
              x: x
            };
          })
          .filter((t) => t.label !== "");

        setDetectedXTicks(xTicks);
      } catch (e) {
        console.log("Could not extract ticks", e);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [chartData, selectedYColumns, chartLayout, chartType, tickRevision]);

  const isMultiYear = normalizedYearlyData.length > 1;

  // Layout constants
  const yAxisGutterWidth = chartLayout === 'horizontal' ? 150 : 100;
  const yAxisLabelSectionWidth = yAxisGutterWidth - 25; // Reserve space for title

  const barsPerCategory = normalizedYearlyData.length * valueColumns.length;

  const barWidth = 40;
  const barGap = -20;
  const categoryGap = 60;

  const widthPerCategory = (barsPerCategory * (barWidth + barGap)) + categoryGap;

  const totalChartWidth = chartLayout === 'vertical'
    ? Math.max(chartData.length * widthPerCategory, 1200)
    : "100%"; // Responsive width for horizontal bars

  const totalChartHeight = chartLayout === 'horizontal'
    ? Math.max(chartData.length * widthPerCategory, 450)
    : 450;

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
                  style={{ backgroundColor: finalColor, width: 8, height: 8, borderRadius: "50%", display: "inline-block", marginRight: 8 }}
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
                  onChange={(e) => {
                    const newX = e.target.value;
                    setXAxis(newX);
                    // If new X is string, remove any strings from selectedYColumns to enforce "no two string axes" rule
                    if (stringColumns.includes(newX)) {
                      setSelectedYColumns(prev => prev.filter(col => !stringColumns.includes(col)));
                    }
                  }}
                  className="mt-1 block w-full border text-primary/75 border-border rounded-md p-2 text-sm bg-background focus:border-none"
                >
                  <option value="">Select column</option>
                  {/* Allow selecting both string and numeric columns for X-axis */}
                  {stringColumns.map((col) => (
                    <option key={col} value={col}>
                      {col} (String)
                    </option>
                  ))}
                  {numericColumns.filter(col => col.toLowerCase() !== "id").map((col) => (
                    <option key={col} value={col}>
                      {col} (Numeric)
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
                  {/* Allow selecting both numeric and string columns for Y-axis */}
                  {columns
                    .filter((col) => {
                      const lower = col.toLowerCase();
                      return lower !== "id";
                    })
                    .map((col) => {
                      const isString = stringColumns.includes(col);
                      const isXString = stringColumns.includes(xAxis);
                      const isAlreadySelectedString = selectedYColumns.some(c => stringColumns.includes(c) && c !== col);

                      // Disable string column if X is already string OR another string is already selected in Y
                      const isDisabled = isString && (isXString || isAlreadySelectedString);

                      return (
                        <label
                          key={col}
                          className={`flex justify-start items-center space-x-2 text-sm break-words ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <input
                            type="checkbox"
                            disabled={isDisabled}
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
                            {formatText({ name: col })} {isString ? "(String)" : "(Num)"}
                          </span>
                        </label>
                      );
                    })}
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
                      : valueColumns.map((col, i) => (
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

                  {/* Chart Area */}
                  <div className="relative">
                    {/* Fixed Y-Axis Title for Horizontal Layout */}
                    {chartLayout === 'horizontal' && (
                      <div
                        className="absolute left-0 top-0 z-50 bg-background-dark py-4 ml-5 pointer-events-none"
                        style={{
                          width: 20,
                          height: 455
                        }}
                      >
                        <div
                          className="flex items-center justify-center text-center text-primary/80"
                          style={{
                            writingMode: "vertical-rl",
                            transform: "rotate(180deg)",
                            fontSize: "0.85rem",
                            fontWeight: 500,
                            height: "100%",
                            minHeight: "100px"
                          }}
                        >
                          {formatText({ name: categoryAxisKey })}
                        </div>
                      </div>
                    )}
                    <div
                      className={`relative border border-border rounded-lg no-scrollbar ${chartLayout === 'horizontal' ? 'overflow-x-hidden overflow-y-auto' : 'overflow-auto'}`}
                      ref={chartRef}
                      style={{ height: 455 }}
                    >
                      <div
                        className="flex flex-row"
                        style={{
                          minWidth: chartLayout === 'vertical' ? `${totalChartWidth + yAxisGutterWidth + 40}px` : "100%",
                          height: `${totalChartHeight}px`,
                          width: chartLayout === 'horizontal' ? "100%" : "auto"
                        }}
                      >
                        {/* --- Y-Axis Section --- */}
                        <div
                          className="sticky left-0 bg-background-dark flex z-60"
                          style={{
                            height: "100%",


                          }}
                        >

                          <div
                            className="sticky left-0 bg-background-dark flex z-60"
                            style={{
                              height: chartLayout === 'vertical' ? "94%" : "100%",
                              borderRight: "1px solid #374151",
                              width: yAxisGutterWidth,
                            }}
                          >
                            {/* Y-axis title (only shown in vertical layout, horizontal uses fixed overlay) */}
                            {chartLayout === 'vertical' && (
                              <div
                                className="sticky ml-5 z-30 bg-background-dark py-4"
                                style={{ width: 20 }}
                              >
                                <div
                                  className="flex items-center justify-center text-center text-primary/80"
                                  style={{
                                    writingMode: "vertical-rl",
                                    transform: "rotate(180deg)",
                                    fontSize: "0.85rem",
                                    fontWeight: 500,
                                    height: "100%",
                                    minHeight: "100px"
                                  }}
                                >
                                  {valueColumns.length === 1 ? formatText({ name: valueColumns[0] }) : (valueColumns.length > 1 ? "Value" : "")}
                                </div>
                              </div>
                            )}

                            {/* Y-axis labels */}
                            <div
                              style={{
                                width: yAxisLabelSectionWidth,
                                position: "relative",
                                height: "100%",
                              }}
                            >
                              {detectedTicks.map((tick, i) => {
                                const text = (tick.label || "").trim();
                                const words = text.split(/\s+/);
                                const maxChars = 13;
                                const lines = [];
                                let currentLine = "";

                                words.forEach((word) => {
                                  if (!currentLine) {
                                    currentLine = word;
                                  } else if ((currentLine + " " + word).length <= maxChars) {
                                    currentLine += " " + word;
                                  } else {
                                    lines.push(currentLine);
                                    currentLine = word;
                                  }
                                });
                                if (currentLine) lines.push(currentLine);

                                return (
                                  <div
                                    key={i}
                                    className="text-[11px] text-right pr-2 text-primary/75 absolute w-full flex flex-col justify-center"
                                    style={{
                                      top: `${tick.y}px`,
                                      transform: "translateY(-50%)",
                                      lineHeight: "1.1",
                                    }}
                                    title={text}
                                  >
                                    {lines.map((line, idx) => (
                                      <div key={idx} className="truncate">{line}</div>
                                    ))}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* --- Chart Content --- */}
                        <div
                          className="flex-1 relative z-10"
                          style={{
                            width: chartLayout === 'horizontal' ? "100%" : totalChartWidth,
                            height: totalChartHeight
                          }}
                        >
                          <div
                            style={{
                              width: "100%",
                              height: `${totalChartHeight}px`,
                              overflow: "hidden",
                            }}
                          >
                            {chartType === "bar" ? (
                              <ResponsiveContainer width="100%" height="100%" onResize={() => setTickRevision(r => r + 1)}>
                                <BarChart
                                  data={chartData}
                                  layout={chartLayout === 'horizontal' ? 'vertical' : 'horizontal'}
                                  margin={{
                                    left: -40,
                                    bottom: chartLayout === "horizontal" ? -40 : -60,
                                    right: 40,
                                    top: 10
                                  }}
                                >
                                  <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#374151"
                                    strokeOpacity={0.5}
                                  />
                                  <XAxis
                                    dataKey={chartLayout === "horizontal" ? undefined : categoryAxisKey}
                                    type={chartLayout === "horizontal" ? "number" : "category"}
                                    domain={chartLayout === "horizontal" ? [0, 'auto'] : undefined}
                                    nice={chartLayout === "horizontal"}
                                    stroke="white"
                                    interval={0}
                                    height={chartLayout === "horizontal" ? 30 : 86}
                                    tickLine={false}
                                    axisLine={{ stroke: "#374151" }}
                                    tick={chartLayout === "horizontal" ? { fill: "transparent" } : ({ x, y, payload }) => {
                                      const maxCharsPerLine = 8;
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
                                    dataKey={chartLayout === 'horizontal' ? categoryAxisKey : undefined}
                                    type={chartLayout === 'horizontal' ? 'category' : 'number'}
                                    domain={chartLayout === 'vertical' ? [0, 'auto'] : undefined}
                                    nice={chartLayout === 'vertical'}
                                    stroke="transparent"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: "transparent" }}
                                    width={40}
                                    interval={chartLayout === 'horizontal' ? 0 : "preserveEnd"}
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
                                    valueColumns.map((col, colIdx) =>
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
                              </ResponsiveContainer>
                            ) : (
                              <ResponsiveContainer width="100%" height="100%" onResize={() => setTickRevision(r => r + 1)}>
                                <LineChart
                                  data={chartData}
                                  layout={chartLayout === "horizontal" ? "vertical" : "horizontal"}
                                  margin={{ left: 0, bottom: chartLayout === "horizontal" ? 0 : -60, right: 50, top: 10 }}
                                >
                                  <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#374151"
                                    strokeOpacity={0.5}
                                  />
                                  <XAxis
                                    dataKey={chartLayout === "horizontal" ? undefined : categoryAxisKey}
                                    type={chartLayout === "horizontal" ? "number" : "category"}
                                    domain={chartLayout === "horizontal" ? [0, 'auto'] : undefined}
                                    nice={chartLayout === "horizontal"}
                                    stroke="white"
                                    interval={0}
                                    height={chartLayout === "horizontal" ? 30 : 86}
                                    tickLine={false}
                                    axisLine={{ stroke: "#374151" }}
                                    tick={chartLayout === "horizontal" ? { fill: "transparent" } : ({ x, y, payload }) => {
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
                                    dataKey={chartLayout === 'horizontal' ? categoryAxisKey : undefined}
                                    type={chartLayout === 'horizontal' ? 'category' : 'number'}
                                    domain={chartLayout === 'vertical' ? [0, 'auto'] : undefined}
                                    nice={chartLayout === 'vertical'}
                                    stroke="transparent"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: "transparent" }}
                                    width={40}
                                    interval={chartLayout === 'horizontal' ? 0 : "preserveEnd"}
                                  />
                                  <Tooltip content={renderCustomTooltip} />


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
                                    valueColumns.map((col, colIdx) =>
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
                              </ResponsiveContainer>
                            )}

                            {/* End of Bars/Lines */}
                          </div>

                        </div>
                      </div>
                      {/* Sticky X-Axis Labels (Numerical Axis in Horizontal Layout) */}
                      {chartLayout === "horizontal" && detectedXTicks.length > 0 && (
                        <div
                          className="bg-background-dark sticky bottom-0 left-0 right-0 flex z-[1000] overflow-visible"
                          style={{
                            height: 35,
                            width: "100%",
                            pointerEvents: "none"
                          }}
                        >
                          {/* Spacer for Y-axis - No visual elements here */}
                          <div style={{ width: yAxisGutterWidth }} />

                          {/* The actual axis area - only this part has border and background */}
                          <div
                            className="bg-background-dark flex-1 relative border-t border-[#374151] flex items-end pointer-events-auto"
                          >
                            {detectedXTicks.map((tick, i) => (
                              <div
                                key={i}
                                className="absolute text-[11px] text-primary/75 whitespace-nowrap"
                                style={{
                                  left: `${tick.x}px`,
                                  transform: "translateX(-50%)",
                                  bottom: 6,
                                }}
                              >
                                {tick.label}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* --- X-axis Title --- */}
                  <div className="text-center mt-1">
                    <span className="text-sm text-primary/80 font-medium">
                      {chartLayout === "horizontal" && valueColumns.length > 0
                        ? valueColumns.length > 1
                          ? "Value"
                          : formatText({ name: valueColumns[0] })
                        : xAxis === "_category"
                          ? "Categories"
                          : formatText({ name: xAxis })}
                    </span>
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