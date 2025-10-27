import { useRef, useEffect, useState } from "react";
import {
    BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import * as d3 from "d3";

const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#8b5cf6"];

export const SimpleBarChart = ({
  data,
  xDataKey,
  yDataKey,
  barFill = "#2563eb",
  xLabel = "",
  yLabel = "",
  showGrid = true,
  showLegend = false,
}) => {
  // Ensure data is sorted by xDataKey
  const sortedData = [...data].sort((a, b) => {
    const aVal = a[xDataKey];
    const bVal = b[xDataKey];
    if (!isNaN(aVal) && !isNaN(bVal)) return aVal - bVal;
    return aVal.toString().localeCompare(bVal.toString());
  });

  const renderXAxisTick = (props) => {
    const { x, y, payload } = props;
    const fontSize = window.innerWidth < 768 ? 10 : 14;
    return (
      <text
        x={x}
        y={y + 10}
        textAnchor="middle"
        fill="#666"
        fontSize={fontSize}
      >
        {payload.value}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={sortedData} margin={{ top: 20, right: 20, bottom: 40 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis
          dataKey={xDataKey}
          tick={renderXAxisTick}
          label={{ value: xLabel, position: "insideBottom", offset: -5 }}
        />
        <YAxis label={{ value: yLabel, angle: -90, position: "insideLeft" }} />
        <Tooltip />
        {showLegend && <Legend />}
        <Bar dataKey={yDataKey} fill={barFill} />
      </BarChart>
    </ResponsiveContainer>
  );
};


export const SimplePieChart = ({ data, dataKey, nameKey, colors = COLORS }) => (
    <ResponsiveContainer width="100%" height="100%">
        <PieChart>
            <Pie data={data} dataKey={dataKey} nameKey={nameKey} cx="50%" cy="50%" outerRadius={120} label>
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
            </Pie>
            <Tooltip />
        </PieChart>
    </ResponsiveContainer>
);

export const SimpleLineChart = ({ data, xDataKey, lineKeys = [], colors = COLORS, xLabel = "", yLabel = "", showGrid = true, showLegend = true,
}) => (
    <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 25 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xDataKey} label={{ value: xLabel, position: "insideBottom", offset: -15 }} />
            <YAxis label={{ value: yLabel, angle: -90, position: "insideLeft" }} />
            <Tooltip />
            {showLegend && (
                <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ paddingTop: 20 }} />
            )}
            {lineKeys.map((key, i) => (
                <Line key={key} type="monotone" dataKey={key} stroke={colors[i % colors.length]} />
            ))}
        </LineChart>
    </ResponsiveContainer>
);

export const MultiBarChart = ({ data, xDataKey, barKeys = [], colors = COLORS, xLabel = "", yLabel = "", showGrid = true, showLegend = true }) => {
  // Sort data ascending by xDataKey
  const sortedData = [...data].sort((a, b) => {
    const aVal = a[xDataKey];
    const bVal = b[xDataKey];
    if (!isNaN(aVal) && !isNaN(bVal)) return aVal - bVal;
    return aVal.toString().localeCompare(bVal.toString());
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={sortedData} margin={{ top: 20, right: 20, left: 20, bottom: 25 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis dataKey={xDataKey} label={{ value: xLabel, position: "insideBottom", offset: -15 }} />
        <YAxis label={{ value: yLabel, angle: -90, position: "insideLeft" }} />
        <Tooltip />
        {showLegend && (
          <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ paddingTop: 20 }} />
        )}
        {barKeys.map((key, i) => (
          <Bar key={key} dataKey={key} fill={colors[i % colors.length]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};


export const MultiHorizontalBarChart = ({ data, yDataKey, barKeys = [], colors = COLORS, xLabel = "", yLabel = "", showGrid = true, showLegend = true }) => {
  // Sort data ascending by yDataKey
  const sortedData = [...data].sort((a, b) => {
    const aVal = a[yDataKey];
    const bVal = b[yDataKey];
    if (!isNaN(aVal) && !isNaN(bVal)) return aVal - bVal;
    return aVal.toString().localeCompare(bVal.toString());
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart layout="vertical" data={sortedData} margin={{ top: 20, right: 20, left: 55, bottom: 25 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis type="number" label={{ value: xLabel, position: "insideBottom", offset: -15 }} />
        <YAxis type="category" dataKey={yDataKey} label={{ value: yLabel, angle: -90, position: "insideLeft" }} />
        <Tooltip />
        {showLegend && (
          <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ paddingTop: 20 }} />
        )}
        {barKeys.map((key, i) => (
          <Bar key={key} dataKey={key} fill={colors[i % colors.length]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};


export const BubbleChart = ({ data, nameKey = "name", valueKey = "value", width = 300, height = 300 }) => {
    const ref = useRef(null);

    useEffect(() => {
        if (!width || !data?.length) return;

        d3.select(ref.current).selectAll("*").remove();

        const svg = d3
            .select(ref.current)
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        const padding = 10;

        const root = d3.hierarchy({ children: data }).sum((d) => d[valueKey]);
        const pack = d3.pack().size([width - padding * 2, height - padding * 2]).padding(6);
        pack(root);

        const color = d3.scaleOrdinal(d3.schemeTableau10);

        const xOffset = width / 2 - root.x;
        const yOffset = height / 2 - root.y;

        const node = svg
            .selectAll("g")
            .data(root.leaves())
            .join("g")
            .attr("transform", (d) => `translate(${d.x + xOffset},${d.y + yOffset})`);

        node
            .append("circle")
            .attr("r", 0)
            .attr("fill", (d, i) => color(i))
            .attr("opacity", 0.9)
            .transition()
            .duration(800)
            .attr("r", (d) => d.r);

        node
            .append("text")
            .attr("class", "bubble-name")
            .style("text-anchor", "middle")
            .style("font-size", (d) => Math.max(10, d.r / 4))
            .style("pointer-events", "none")
            .text((d) => d.data[nameKey]);

        node
            .append("text")
            .attr("class", "bubble-value")
            .style("text-anchor", "middle")
            .style("font-size", (d) => Math.max(10, d.r / 5))
            .attr("y", (d) => Math.max(10, d.r / 4) + 2)
            .style("opacity", 0)
            .text((d) => d.data[valueKey]);

        node.on("mouseenter", function () {
            d3.select(this).select(".bubble-value").transition().duration(200).style("opacity", 1);
        });
        node.on("mouseleave", function () {
            d3.select(this).select(".bubble-value").transition().duration(200).style("opacity", 0);
        });
    }, [data, nameKey, valueKey, width, height]);

    return <div ref={ref} style={{ width: "100%", height, display: "flex", justifyContent: "center", alignItems: "center" }} />;
};

/* -------------------- D3 Circle Packing -------------------- */
export const CirclePackingChart = ({ data, nameKey = "name", valueKey = "value" }) => {
    const ref = useRef(null);

    useEffect(() => {
        if (!data || !data.children) return;
        const container = ref.current;

        const drawChart = () => {
            if (!container) return;
            d3.select(container).selectAll("*").remove();

            const { width: containerWidth, height: containerHeight } = container.getBoundingClientRect();

            const svg = d3
                .select(container)
                .append("svg")
                .attr("width", containerWidth)
                .attr("height", containerHeight)
                .style("font", "12px sans-serif");

            const root = d3.hierarchy(data).sum(d => d[valueKey]);
            const pack = d3.pack().size([containerWidth, containerHeight]).padding(4);
            pack(root);

            let focus = root;
            const nodes = root.descendants();
            const color = d3.scaleSequential([0, root.height], d3.interpolateMagma);
            const g = svg.append("g");

            const yearColors = d3.scaleOrdinal(d3.schemeTableau10); // or schemeSet2, schemeTableau10, etc.

            // Circles
            g.selectAll("circle")
                .data(nodes)
                .join("circle")
                .attr("transform", d => `translate(${d.x},${d.y})`)
                .attr("r", d => d.r)
                .attr("fill", d => {
                    if (d.depth === 1) {
                        // Year circle → color by name
                        return yearColors(d.data[nameKey]);
                    } else if (!d.children) {
                        // Leaf circle → use parent year color (lighter variant)
                        return d3.color(yearColors(d.parent.data[nameKey])).brighter(1);
                    } else {
                        // Root circle
                        return "#e9c8c8ff";
                    }
                })
                .attr("stroke", "#777")
                .attr("pointer-events", d => (d === root ? "none" : "auto"))
                .on("click", (event, d) => {
                    if (focus !== d) zoom(d);
                    event.stopPropagation();
                });

            // Labels
            const label = g
                .selectAll("text")
                .data(nodes)
                .join("text")
                .attr("text-anchor", "middle")
                .each(function (d) {
                    const text = d3.select(this);

                    if (!d.children && d.data[nameKey]) {
                        text.attr("transform", `translate(${d.x},${d.y})`);

                        const maxWidth = d.r * 1.6; 
                        const maxHeight = d.r * 1.6; 

                        let fontSize = Math.max(6, d.r / 4);

                        // First line (name)
                        let tspanName = text.append("tspan")
                            .attr("x", 0)
                            .attr("dy", 0)
                            .text(d.data[nameKey]);

                        while (tspanName.node().getComputedTextLength() > maxWidth && fontSize > 4) {
                            fontSize -= 1;
                            tspanName.style("font-size", fontSize);
                        }

                        // Second line (value)
                        let tspanValue = text.append("tspan")
                            .attr("x", 0)
                            .attr("dy", fontSize * 1.2)
                            .style("font-size", fontSize * 0.9)
                            .text(d.data[valueKey]);

                        // Check vertical overflow
                        const totalHeight = fontSize * 2.2; 
                        if (totalHeight > maxHeight) {
                            let scaleFactor = maxHeight / totalHeight;
                            fontSize = fontSize * scaleFactor;
                            tspanName.style("font-size", fontSize);
                            tspanValue
                                .style("font-size", fontSize * 0.9)
                                .attr("dy", fontSize * 1.2);
                        }
                    }
                    // Year / parent labels
                    if (d.children && d.depth === 1 && d.data[nameKey]) {
                        text.attr("transform", `translate(${d.x},${d.y - d.r + 11})`)
                            .style("font-size", 12)
                            .style("font-weight", "bold")
                            .style("fill", "#111010ff")
                            .text(d.data[nameKey]);
                    }
                })
                .on("click", (event, d) => {
                    if (focus !== d) zoom(d);
                    event.stopPropagation();
                });

            svg.on("click", () => zoom(root));

            function zoom(d) {
                const focus0 = focus;
                focus = d;

                svg.transition()
                    .duration(750)
                    .tween("zoom", () => {
                        const i = d3.interpolateZoom(
                            [focus0.x, focus0.y, focus0.r * 2],
                            [focus.x, focus.y, focus.r * 2]
                        );
                        return t => {
                            const v = i(t);
                            const k = Math.min(containerWidth, containerHeight) / v[2];

                            const tx = containerWidth / 2 - v[0] * k;
                            const ty = containerHeight / 2 - v[1] * k;
                            g.attr("transform", `translate(${tx},${ty}) scale(${k})`);

                            label.attr("transform", node => {
                                if (node.children && node.depth === 1) {
                                    return `translate(${node.x},${node.y - node.r + 11})`;
                                } else if (!node.children) {
                                    return `translate(${node.x},${node.y})`;
                                }
                                return null;
                            });
                        };
                    });

                label.style("display", "block");
            }
            const initScale = Math.min(containerWidth, containerHeight) / (root.r * 2);
            g.attr(
                "transform",
                `translate(${containerWidth / 2 - root.x * initScale},${containerHeight / 2 - root.y * initScale}) scale(${initScale})`
            );
        };

        drawChart();
        const resizeObserver = new ResizeObserver(() => drawChart());
        resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
            d3.select(container).selectAll("*").remove();
        };
    }, [data, nameKey, valueKey]);

    return <div ref={ref} style={{ width: "100%", height: "100%" }} />;
};
