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

    // ─── Responsive label truncation ────────────────────────────────────────
    // Determine how much horizontal space is available for labels on each side.
    // First-column labels render to the RIGHT of their node (node.x1 → next column or edge).
    // Last-column labels render to the LEFT of their node (0 → node.x0).
    // Middle-column labels: whichever side they're on, use half the inter-column gap.
    const CHAR_WIDTH_PX = 7;
    const LABEL_PADDING = 6; // gap between node edge and label start

    const layerBounds = {};
    nodes.forEach((n) => {
      const l = n.layer;
      if (!layerBounds[l]) layerBounds[l] = { x0: n.x0, x1: n.x1 };
      else {
        layerBounds[l].x0 = Math.min(layerBounds[l].x0, n.x0);
        layerBounds[l].x1 = Math.max(layerBounds[l].x1, n.x1);
      }
    });

    const totalLayers = data.dates.length;

    function labelCharLimit(node) {
      const layer = node.layer;
      let availablePx;

      if (totalLayers === 2) {
        // 2 column layout: split the single gap 50/50 between both columns
        const gap = layerBounds[1].x0 - layerBounds[0].x1;
        availablePx = gap / 2 - LABEL_PADDING;
      } else {
        // 3 column layout:
        // for col 1 -> full gaap to col 2
        // for col 2 to col 3 -> split the gap by 50/50 and use for both col 2 and col 3
        if (layer === 0) {
          const nextX0 = layerBounds[1]?.x0 ?? width;
          availablePx = nextX0 - layerBounds[0].x1 - LABEL_PADDING;
        } else {
          const prevX1 = layerBounds[layer - 1]?.x1 ?? 0;
          const gap = layerBounds[layer].x0 - prevX1;
          availablePx = gap / 2 - LABEL_PADDING;
        }
      }

      return Math.max(8, Math.floor(availablePx / CHAR_WIDTH_PX));
    }

    // ─── Color scale ─────────────────────────────────────────────────────────
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // ─── Gradient defs ───────────────────────────────────────────────────────
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

    // ─── Tooltip ─────────────────────────────────────────────────────────────
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
      // FIX: constrain width so it never exceeds the container
      .style("max-width", "min(260px, 80%)")
      .style("word-wrap", "break-word")
      .style("white-space", "normal")
      .style("line-height", "1.5")
      // Prevent the tooltip itself from causing the container to grow
      .style("box-sizing", "border-box");

    // ─── Tooltip positioning helper ──────────────────────────────────────────
    // Keeps the tooltip fully inside the container on all four sides.
    function positionTooltip(event) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const tooltipNode = tooltip.node();
      const tooltipWidth = tooltipNode.offsetWidth;
      const tooltipHeight = tooltipNode.offsetHeight;
      const MARGIN = 8; // breathing room from container edges

      // Preferred: above-right of cursor
      let x = event.clientX - containerRect.left + 12;
      let y = event.clientY - containerRect.top - tooltipHeight - 8;

      // Overflow right → flip to left of cursor
      if (x + tooltipWidth + MARGIN > containerRect.width) {
        x = event.clientX - containerRect.left - tooltipWidth - 12;
      }

      // Overflow left → clamp to left edge
      if (x < MARGIN) {
        x = MARGIN;
      }

      // Overflow top → flip to below cursor
      if (y < MARGIN) {
        y = event.clientY - containerRect.top + 12;
      }

      // Overflow bottom → clamp to bottom edge
      if (y + tooltipHeight + MARGIN > containerRect.height) {
        y = containerRect.height - tooltipHeight - MARGIN;
      }

      tooltip
        .style("left", `${x}px`)
        .style("top", `${y}px`);
    }

    // ─── Links ───────────────────────────────────────────────────────────────
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
          .style("cursor", "pointer")
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
        positionTooltip(event);
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

    // ─── Column date labels ───────────────────────────────────────────────────
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

    // ─── Nodes ───────────────────────────────────────────────────────────────
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

    // ─── Node labels ─────────────────────────────────────────────────────────
    svg
      .append("g")
      .style("font", "12px sans-serif")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("x", (d) => (d.x0 < width / 2 ? d.x1 + LABEL_PADDING : d.x0 - LABEL_PADDING))
      .attr("y", (d) => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", (d) => (d.x0 < width / 2 ? "start" : "end"))
      .text((d) => {
        // compute limit dynamically based on available space for EVERY column
        const limit = labelCharLimit(d);
        return d.name.length > limit
          ? d.name.substring(0, limit) + "…"
          : d.name;
      });

    return () => {
      tooltip.remove();
    };
  }, [data, width, height]);

  return (
    <div ref={containerRef} style={{ position: "relative", overflow: "hidden" }}>
      <svg ref={svgRef}></svg>
    </div>
  );
}