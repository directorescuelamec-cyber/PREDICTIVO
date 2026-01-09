import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { GraphNode, GraphLink } from '../types';

interface NetworkGraphProps {
  nodes: GraphNode[];
  links: GraphLink[];
  width?: number;
  height?: number;
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({ nodes, links, width = 600, height = 400 }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    // CRITICAL FIX: Clone data to avoid "Cannot assign to read only property" errors.
    // D3 mutates these objects (adds x, y, vx, vy, index), but React props/state are immutable.
    const simulationNodes = nodes.map(d => ({ ...d }));
    const simulationLinks = links.map(d => ({ ...d }));

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    // Color scales
    const riskColorScale = d3.scaleLinear<string>()
      .domain([0, 50, 100])
      .range(["#10B981", "#F59E0B", "#EF4444"]); // Green to Red

    // Simulation Setup
    const simulation = d3.forceSimulation(simulationNodes as d3.SimulationNodeDatum[])
      .force("link", d3.forceLink(simulationLinks).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(25));

    // Arrow markers
    svg.append("defs").selectAll("marker")
      .data(["POSITIVE", "NEGATIVE"])
      .enter().append("marker")
      .attr("id", d => `arrow-${d}`)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 25) // Offset for node radius
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", d => d === "POSITIVE" ? "#9CA3AF" : "#EF4444")
      .attr("d", "M0,-5L10,0L0,5");

    // Draw Links
    const link = svg.append("g")
      .selectAll("line")
      .data(simulationLinks)
      .join("line")
      .attr("stroke", d => d.type === "POSITIVE" ? "#9CA3AF" : "#EF4444") // Grey for affinity, Red for conflict
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", d => d.weight)
      .attr("marker-end", d => `url(#arrow-${d.type})`);

    // Draw Nodes
    const node = svg.append("g")
      .selectAll("g")
      .data(simulationNodes)
      .join("g")
      .call(d3.drag<any, any>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    // Node Circles (Risk Colored)
    node.append("circle")
      .attr("r", 15)
      .attr("fill", (d: any) => riskColorScale(d.riskScore))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    // Node Labels
    node.append("text")
      .text((d: any) => d.name.split(' ')[0]) // First name only for cleaner graph
      .attr("x", 18)
      .attr("y", 5)
      .style("font-size", "10px")
      .style("font-family", "sans-serif")
      .style("fill", "#374151");

    // Simulation Tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, links, width, height]);

  return (
    <div className="border rounded-lg bg-white shadow-sm overflow-hidden flex justify-center items-center">
      <svg ref={svgRef} width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" />
    </div>
  );
};

export default NetworkGraph;