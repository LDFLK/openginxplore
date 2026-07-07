import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";
import { useEffect, useRef } from "react";

export default function SankeyChart({ data, width, height, isDarkMode, onNodeClick, onNodeNavigate, onLinkClick, onClearSelection, selectedLink, selectedNode }) {
  const containerRef = useRef();
  const svgRef = useRef();

  useEffect(() => {
    if (!data) return;

    const handleNodeClick = (event, d) => {
      event.stopPropagation();
      onNodeClick?.(d);
    };

    const topMargin = 48;
    const bottomMargin = 24;
    const parseDate = d3.utcParse("%Y-%m-%d");
    const formatDate = d3.utcFormat("%b %d %Y");

    // Clear any existing SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("cursor", "default")
      .on("click", () => onClearSelection?.());

    const normalizeDate = (d) => (typeof d === "string" ? d.split("T")[0] : d);
    const chartDates = (data.dates || []).filter((d) => d.status === "ok");
    if (chartDates.length < 2) return;

    const dateToLayer = {};
    chartDates.forEach((d, i) => {
      dateToLayer[normalizeDate(d.date)] = i;
    });

    const { nodes, links } = sankey()
      .nodeWidth(20)
      .nodePadding(15)
      .nodeAlign((node) => dateToLayer[normalizeDate(node.time)] ?? 0)
      .extent([
        [1, topMargin],
        [width - 1, height - bottomMargin],
      ])({
        nodes: data.nodes.map((d) => Object.assign({}, d)),
        links: data.links.map((d) => Object.assign({}, d)),
      });

    // Responsive label truncation
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

    const totalLayers = chartDates.length;

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

    // Color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Identifies a link by its source/target node ids — links are rebuilt
    // fresh on every render, so we can't compare object references.
    const linkKey = (d) => `${d.source.id ?? d.source}->${d.target.id ?? d.target}`;
    const selectedKey = selectedLink
      ? `${selectedLink.source?.id ?? selectedLink.source}->${selectedLink.target?.id ?? selectedLink.target}`
      : null;
    const isSelectedLink = (d) => !!selectedKey && linkKey(d) === selectedKey;
    const isLinkedToSelectedNode = (d) =>
      !!selectedNode && (d.source.id === selectedNode.id || d.target.id === selectedNode.id);
    const isHighlighted = (d) => isSelectedLink(d) || isLinkedToSelectedNode(d);
    const hasActiveSelection = !!selectedKey || !!selectedNode;

    const relevantNodeIds = new Set();
    if (selectedNode) relevantNodeIds.add(selectedNode.id);
    links.forEach((d) => {
      if (isHighlighted(d)) {
        relevantNodeIds.add(d.source.id);
        relevantNodeIds.add(d.target.id);
      }
    });
    const isRelevantNode = (d) => !hasActiveSelection || relevantNodeIds.has(d.id);

    const greyColor = isDarkMode ? "#4b5563" : "#64748b";
    const greyColorHover = isDarkMode ? "#6b7280" : "#c0c7d1";
    const restingOpacity = (d) => {
      if (!hasActiveSelection) return 0.4;
      return isHighlighted(d) ? 0.85 : 0.12;
    };
    // Gradient defs
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

    // Links
    svg
      .append("g")
      .attr("fill", "none")
      .selectAll("path")
      .data(links)
      .join("path")
      .attr("class", "sankey-link")
      .attr("d", sankeyLinkHorizontal())
      .attr("stroke", (d, i) => (isHighlighted(d) || !hasActiveSelection ? `url(#gradient-${i})` : greyColor))
      .attr("stroke-opacity", restingOpacity)
      .attr("stroke-width", (d) => Math.max(1, d.width))
      .style("cursor", onLinkClick ? "pointer" : "default")
      .on("mouseover", (event, d) => {
        const link = d3.select(event.target).transition().duration(200).attr("stroke-opacity", 0.9);
        if (!isHighlighted(d) && hasActiveSelection) {
          link.attr("stroke", greyColorHover);
        }
      })
      .on("mouseout", (event, d) => {
        const link = d3.select(event.target).transition().duration(200).attr("stroke-opacity", restingOpacity(d));
        if (!isHighlighted(d) && hasActiveSelection) {
          link.attr("stroke", greyColor);
        }
      })
      .on("click", (event, d) => {
        event.stopPropagation();
        if (isSelectedLink(d)) {
          onClearSelection?.();
        } else {
          onLinkClick?.(d);
        }
      });

    // Column date labels
    const columnData = d3
      .groups(nodes, (d) => d.layer)
      .map(([layer, nodesInLayer]) => {
        const numericLayer = Number(layer);
        const x = d3.mean(nodesInLayer, (node) => (node.x0 + node.x1) / 2);

        const payloadDate = chartDates[numericLayer]?.date;
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
      .style("fill", !isDarkMode ? "#1f2933" : "#fff") 
      .attr("text-anchor", "middle")
      .selectAll("text")
      .data(columnData)
      .join("text")
      .attr("x", (d) => d.x)
      .text((d) => d.displayLabel);

    // Nodes
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
      .attr("fill-opacity", (d) => (isRelevantNode(d) ? 1 : 0.25))
      .attr("stroke", (d) => (selectedNode?.id === d.id ? (isDarkMode ? "#fff" : "#1f2933") : "none"))
      .attr("stroke-width", (d) => (selectedNode?.id === d.id ? 0 : 0))
      .style("cursor", onNodeClick ? "pointer" : "default")
      .on("click", handleNodeClick)
      .append("title")
      .text((d) => `${d.id}\n${d.value} total`);

    // Node labels 
    svg
      .append("g")
      .style("font", "12px poppins")
      .style("fill", !isDarkMode ? "#1f2933" : "#fff")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("x", (d) => (d.x0 < width / 2 ? d.x1 + LABEL_PADDING : d.x0 - LABEL_PADDING))
      .attr("y", (d) => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", (d) => (d.x0 < width / 2 ? "start" : "end"))
      .attr("fill-opacity", (d) => (isRelevantNode(d) ? 1 : 0.35))
      .text((d) => {
        // compute limit dynamically based on available space for EVERY column
        const limit = labelCharLimit(d);
        return d.name.length > limit
          ? d.name.substring(0, limit) + "…"
          : d.name;
      })
      .style("cursor", onNodeNavigate ? "pointer" : "default")
      .on("click", (event, d) => {
        event.stopPropagation();
        onNodeNavigate?.(d);
      })
      .on("mouseenter", function () {
        if (!onNodeNavigate) return;
        d3.select(this).style("text-decoration", "underline");
      })
      .on("mouseleave", function () {
        d3.select(this).style("text-decoration", null);
      });
  }, [data, width, height, isDarkMode, onNodeClick, onNodeNavigate, onLinkClick, onClearSelection, selectedLink, selectedNode]);

  return (
    <div ref={containerRef} style={{ position: "relative", overflow: "hidden" }}>
      <svg ref={svgRef}></svg>
    </div>
  );
}