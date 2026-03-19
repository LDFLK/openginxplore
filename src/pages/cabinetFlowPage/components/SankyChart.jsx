import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";
import { useEffect, useRef } from "react";

export default function SankeyChart({ data, width, height }) {
  const containerRef = useRef();
  const svgRef = useRef();

  useEffect(() => {
    if (!data) return;

    const topMargin = 48;
    const bottomMargin = 24;
    const parseDate = d3.utcParse("%Y-%m-%d");
    const formatDate = d3.utcFormat("%b %d %Y");

    const container = d3.select(containerRef.current);

    // Clear any existing SVG content & tooltips
    d3.select(svgRef.current).selectAll("*").remove();
    container.selectAll(".sankey-tooltip").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);
    
    const dateToLayer = {};
    data.dates.forEach((d, i) => { dateToLayer[d.date] = i; });

    const { nodes, links } = sankey()
      .nodeWidth(20)
      .nodePadding(15)
      .nodeAlign((node) => dateToLayer[node.time] ?? 0)
      .extent([
        [1, topMargin],
        [width - 1, height - bottomMargin],
      ])({
        nodes: data.nodes.map((d) => Object.assign({}, d)),
        links: data.links.map((d) => Object.assign({}, d)),
      });

    // Defines a color scale.
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Create gradient defs
    const defs = svg.append("defs");
    const linkGradients = defs
      .selectAll("linearGradient")
      .data(links)
      .join("linearGradient")
      .attr("id", (d, i) => `gradient-${i}`)
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", (d) => d.source.x1)
      .attr("x2", (d) => d.target.x0);

    linkGradients
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", (d) => color(d.source.id));

    linkGradients
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", (d) => color(d.target.id));

    // Create tooltip appended to containerRef
    const tooltip = container
      .append("div")
      .attr("class", "sankey-tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.7)")
      .style("color", "#fff")
      .style("padding", "6px 10px")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("max-width", "500px")
      .style("word-wrap", "break-word")
      .style("line-height", "1.5");

    // Draw links
    svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke-opacity", 0.4)
      .selectAll("path")
      .data(links)
      .join("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("stroke", (d, i) => `url(#gradient-${i})`)
      .attr("stroke-width", (d) => Math.max(1, d.width))
      .on("mouseover", (event, d) => {
        d3.select(event.target)
          .transition()
          .duration(300)
          .attr("stroke-opacity", 0.8);

        tooltip
          .style("opacity", 0)
          .html(`
            <strong>${d.source.name}</strong> → <strong>${d.target.name}</strong><br/>
            ${d.value} Departments moved
        `)
          .transition()
          .duration(200)
          .style("opacity", 1);
      })
      .on("mousemove", (event) => {
        const containerRect = containerRef.current.getBoundingClientRect();
        const tooltipNode = tooltip.node();
        const tooltipWidth = tooltipNode.offsetWidth;
        const tooltipHeight = tooltipNode.offsetHeight;

        // Position relative to container
        let x = event.clientX - containerRect.left + 12;
        let y = event.clientY - containerRect.top - tooltipHeight - 8;

        // Flip horizontally if overflowing right edge
        if (x + tooltipWidth > containerRect.width) {
          x = event.clientX - containerRect.left - tooltipWidth - 12;
        }

        // Flip vertically if overflowing top edge
        if (y < 0) {
          y = event.clientY - containerRect.top + 12;
        }

        tooltip
          .style("left", `${x}px`)
          .style("top", `${y}px`);
      })
      .on("mouseout", (event) => {
        d3.select(event.target)
          .transition()
          .duration(300)
          .attr("stroke-opacity", 0.4);

        tooltip
          .transition()
          .duration(200)
          .style("opacity", 0);
      });

    // Add column labels (dates).
    // Important: use the authoritative payload `data.dates` instead of guessing from node metadata,
    // otherwise labels can be duplicated/wrong when nodes don't carry unique date info.
    const columnData = d3
      .groups(nodes, (d) => d.layer)
      .map(([layer, nodesInLayer]) => {
        const numericLayer = Number(layer);
        const x = d3.mean(nodesInLayer, (node) => (node.x0 + node.x1) / 2);

        const payloadDate = data?.dates?.[numericLayer]?.date;
        const representative = nodesInLayer[0];
        const rawLabel =
          payloadDate ??
          representative?.time ??
          representative?.date ??
          representative?.group ??
          `Step ${numericLayer + 1}`;

        let displayLabel = rawLabel;
        if (typeof rawLabel === "string") {
          const parsed = parseDate(rawLabel);
          if (parsed) displayLabel = formatDate(parsed);
        }

        const clampedX = Math.max(
          60,
          Math.min(width - 60, Number.isFinite(x) ? x : 0)
        );

        return { layer: numericLayer, x: clampedX, displayLabel };
      })
      .filter((d) => Number.isFinite(d.x))
      .sort((a, b) => a.layer - b.layer);

    svg
      .append("g")
      .attr("transform", `translate(0, ${topMargin - 24})`)
      .style("font", "12px sans-serif")
      .style("font-weight", "600")
      .style("fill", "#1f2933")
      .attr("text-anchor", "middle")
      .selectAll("text")
      .data(columnData)
      .join("text")
      .attr("x", (d) => d.x)
      .text((d) => d.displayLabel);

    // Draw nodes
    svg
      .append("g")
      .selectAll("rect")
      .data(nodes)
      .join("rect")
      .attr("x", (d) => d.x0)
      .attr("y", (d) => d.y0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("width", (d) => d.x1 - d.x0)
      .attr("fill", (d) => color(d.id))
      .append("title")
      .text((d) => `${d.id}\n${d.value} total`);

    // Add node labels

    svg
      .append("g")
      .style("font", "12px sans-serif")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("x", (d) => (d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6))
      .attr("y", (d) => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", (d) => (d.x0 < width / 2 ? "start" : "end"))
      .text((d) => {
        const limit = d.layer === 0 ? 100 : 40;
        return d.name.length > limit ? d.name.substring(0, limit) + "..." : d.name;
      })

    return () => {
      tooltip.remove();
    };
  }, [data, width, height]);

  // Wrap SVG inside a div for tooltip positioning
  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <svg ref={svgRef}></svg>
    </div>
  );
}
