import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface Distribution {
  name: string;
  year: number;
  color: string;
  tags?: string[];
  facts?: string[];
  philosophy?: string[];
  technical?: any;
  community?: any;
  plan?: string;
  children?: Distribution[];
}

interface D3TreeVisualizationProps {
  data: Distribution;
  width?: number;
  height?: number;
}

const D3TreeVisualization: React.FC<D3TreeVisualizationProps> = ({
  data,
  width = 1400,
  height = 800,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<Distribution | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll("*").remove();

    const margin = { top: 40, right: 120, bottom: 40, left: 120 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    // Create container group for zooming
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create hierarchy
    const root = d3.hierarchy(data);

    // CONTEXT: Calculate min and max years for timeline scaling
    // Machine-readable note: This traverses all nodes to find temporal bounds.
    // Used to create linear time scale (1991-2020+) for x-axis positioning.
    let minYear = Infinity;
    let maxYear = -Infinity;
    root.each((node) => {
      if (node.data.year) {
        minYear = Math.min(minYear, node.data.year);
        maxYear = Math.max(maxYear, node.data.year);
      }
    });

    // CONTEXT: Create tree layout with horizontal orientation
    // DESIGN DECISION: Horizontal (not vertical) emphasizes timeline progression.
    // d3.tree() provides automatic vertical spacing for distribution families.
    const treeLayout = d3.tree<Distribution>().size([innerHeight, innerWidth]);

    const treeData = treeLayout(root);

    // CRITICAL: Adjust x positions based on year (timeline)
    // Machine-readable note: Overrides d3.tree() x-positions with chronological positioning.
    // This transforms hierarchical layout into timeline-based visualization.
    const xScale = d3
      .scaleLinear()
      .domain([minYear, maxYear])
      .range([0, innerWidth]);

    // Update node positions to be timeline-based
    treeData.each((node: any) => {
      node.y = xScale(node.data.year);
    });

    // Add links (connections between nodes)
    g.selectAll(".link")
      .data(treeData.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", (d: any) => {
        return `M${d.source.y},${d.source.x}
                C${(d.source.y + d.target.y) / 2},${d.source.x}
                 ${(d.source.y + d.target.y) / 2},${d.target.x}
                 ${d.target.y},${d.target.x}`;
      })
      .style("fill", "none")
      .style("stroke", (d: any) => d.target.data.color || "#999")
      .style("stroke-width", 2)
      .style("stroke-opacity", 0.5);

    // Add nodes
    const node = g
      .selectAll(".node")
      .data(treeData.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => `translate(${d.y},${d.x})`)
      .style("cursor", "pointer")
      .on("click", (event, d: any) => {
        event.stopPropagation();
        setSelectedNode(d.data);
      })
      .on("mouseover", function () {
        // Highlight on hover
        d3.select(this)
          .select("circle")
          .transition()
          .duration(200)
          .attr("r", 14)
          .style("stroke-width", 4);
      })
      .on("mouseout", function () {
        d3.select(this)
          .select("circle")
          .transition()
          .duration(200)
          .attr("r", 10)
          .style("stroke-width", 3);
      });

    // Add circles for nodes
    node
      .append("circle")
      .attr("r", 10)
      .style("fill", (d: any) => d.data.color || "#999")
      .style("stroke", "#fff")
      .style("stroke-width", 3);

    // Add text labels
    node
      .append("text")
      .attr("dy", ".35em")
      .attr("x", (d: any) => (d.children ? -15 : 15))
      .style("text-anchor", (d: any) => (d.children ? "end" : "start"))
      .style("fill", "#fff")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("text-shadow", "0 1px 2px rgba(0,0,0,0.8)")
      .text((d: any) => `${d.data.name} (${d.data.year})`);

    // Add year axis
    const yearAxis = d3.axisBottom(xScale).ticks(10).tickFormat(d3.format("d"));

    g.append("g")
      .attr("class", "year-axis")
      .attr("transform", `translate(0,${innerHeight + 20})`)
      .call(yearAxis)
      .selectAll("text")
      .style("fill", "#999")
      .style("font-size", "11px");

    // Add zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        g.attr(
          "transform",
          `translate(${margin.left + event.transform.x},${margin.top + event.transform.y}) scale(${event.transform.k})`,
        );
        setZoomLevel(event.transform.k);
      });

    svg.call(zoom as any);

    // Filter functionality
    if (searchTerm) {
      node.style("opacity", (d: any) => {
        const matches =
          d.data.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.data.tags?.some((tag: string) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase()),
          );
        return matches ? 1 : 0.2;
      });
    }
  }, [data, width, height, searchTerm]);

  return (
    <div className="flex gap-4 h-full">
      {/* Main visualization */}
      <div className="flex-grow relative bg-gray-900 rounded-lg overflow-hidden">
        {/* Controls overlay */}
        <div className="absolute top-4 left-4 z-10 bg-gray-800/90 backdrop-blur rounded-lg p-3 shadow-lg">
          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Search distributions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1.5 bg-gray-700 text-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="text-xs text-gray-400">
              Zoom: {(zoomLevel * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-4 z-10 bg-gray-800/90 backdrop-blur rounded-lg p-3 shadow-lg text-xs text-gray-300 max-w-xs">
          <div className="font-semibold mb-1">Controls:</div>
          <ul className="space-y-0.5 text-gray-400">
            <li>• Click nodes for details</li>
            <li>• Scroll to zoom</li>
            <li>• Drag to pan</li>
            <li>• Search to filter</li>
          </ul>
        </div>

        <svg ref={svgRef} className="w-full h-full" />
      </div>

      {/* Details panel */}
      {selectedNode && (
        <div className="w-80 bg-gray-800 rounded-lg p-4 overflow-y-auto max-h-full">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-bold text-white">
              {selectedNode.name}
            </h3>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            {/* Year and color indicator */}
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: selectedNode.color }}
              />
              <span className="text-gray-300 text-sm font-semibold">
                {selectedNode.year}
              </span>
            </div>

            {/* Tags */}
            {selectedNode.tags && selectedNode.tags.length > 0 && (
              <div>
                <div className="text-xs text-gray-400 mb-1">Tags</div>
                <div className="flex flex-wrap gap-1">
                  {selectedNode.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Facts */}
            {selectedNode.facts && selectedNode.facts.length > 0 && (
              <div>
                <div className="text-xs text-gray-400 mb-1 font-semibold">
                  Facts
                </div>
                <ul className="text-sm text-gray-300 space-y-1">
                  {selectedNode.facts.map((fact, i) => (
                    <li key={i} className="text-xs leading-relaxed">
                      • {fact}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Philosophy */}
            {selectedNode.philosophy && selectedNode.philosophy.length > 0 && (
              <div>
                <div className="text-xs text-gray-400 mb-1 font-semibold">
                  Philosophy
                </div>
                <ul className="text-sm text-gray-300 space-y-1">
                  {selectedNode.philosophy.map((item, i) => (
                    <li key={i} className="text-xs leading-relaxed">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Technical details */}
            {selectedNode.technical && (
              <div>
                <div className="text-xs text-gray-400 mb-1 font-semibold">
                  Technical
                </div>
                <div className="text-xs text-gray-300 space-y-1">
                  {Object.entries(selectedNode.technical).map(
                    ([key, value]) => (
                      <div key={key}>
                        <span className="text-gray-400">{key}:</span>{" "}
                        {Array.isArray(value)
                          ? value.join(", ")
                          : String(value)}
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            {/* Community */}
            {selectedNode.community && (
              <div>
                <div className="text-xs text-gray-400 mb-1 font-semibold">
                  Community
                </div>
                <div className="text-xs text-gray-300 space-y-1">
                  {Object.entries(selectedNode.community).map(
                    ([key, value]) => (
                      <div key={key}>
                        <span className="text-gray-400">{key}:</span>{" "}
                        {typeof value === "string" &&
                        value.startsWith("http") ? (
                          <a
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300"
                          >
                            {value}
                          </a>
                        ) : (
                          String(value)
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            {/* Plan */}
            {selectedNode.plan && (
              <div>
                <div className="text-xs text-gray-400 mb-1 font-semibold">
                  Mission
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {selectedNode.plan}
                </p>
              </div>
            )}

            {/* Children count */}
            {selectedNode.children && selectedNode.children.length > 0 && (
              <div className="pt-2 border-t border-gray-700">
                <div className="text-xs text-gray-400">
                  {selectedNode.children.length} child distribution
                  {selectedNode.children.length > 1 ? "s" : ""}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default D3TreeVisualization;
