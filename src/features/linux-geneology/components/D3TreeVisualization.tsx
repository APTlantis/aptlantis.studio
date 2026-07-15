import React, { useEffect, useMemo, useRef, useState } from "react";

interface Distribution {
  name: string;
  year: number;
  color?: string;
  tags?: string[];
  facts?: string[];
  philosophy?: string[];
  technical?: Record<string, unknown>;
  community?: Record<string, unknown>;
  plan?: string;
  children?: Distribution[];
}

interface NodePosition {
  id: string;
  name: string;
  year: number | null;
  depth: number;
  x: number;
  y: number;
  radius: number;
  hasChildren: boolean;
  childCount: number;
}

interface NodeMap {
  width: number;
  height: number;
  nodes: NodePosition[];
}

interface D3TreeVisualizationProps {
  data: Distribution;
}

const MAP_URL = "/data/linux-genealogy/linux-genealogy-map.svg";
const NODE_MAP_URL = "/data/linux-genealogy/linux-genealogy-map-nodes.json";
const DATASET_URL = "/data/linux-genealogy/linux-genealogy-expanded.json";

const getStats = (node: Distribution, depth = 0) => {
  let count = 1;
  let maxDepth = depth;
  let minYear = node.year || Infinity;
  let maxYear = node.year || -Infinity;

  node.children?.forEach((child) => {
    const childStats = getStats(child, depth + 1);
    count += childStats.count;
    maxDepth = Math.max(maxDepth, childStats.maxDepth);
    minYear = Math.min(minYear, childStats.minYear);
    maxYear = Math.max(maxYear, childStats.maxYear);
  });

  return {
    count,
    maxDepth,
    minYear: Number.isFinite(minYear) ? minYear : 1991,
    maxYear: Number.isFinite(maxYear) ? maxYear : 2024,
  };
};

const flattenDistributions = (
  node: Distribution,
  map = new Map<string, Distribution>(),
) => {
  const key = getDistributionKey(node.name, node.year);
  map.set(key, node);
  node.children?.forEach((child) => flattenDistributions(child, map));
  return map;
};

const getDistributionKey = (name: string, year?: number | null) =>
  `${name.toLowerCase()}::${year ?? ""}`;

const D3TreeVisualization: React.FC<D3TreeVisualizationProps> = ({ data }) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.58);
  const [nodeMap, setNodeMap] = useState<NodeMap | null>(null);
  const [selectedNode, setSelectedNode] = useState<Distribution | null>(null);
  const [hoveredNode, setHoveredNode] = useState<NodePosition | null>(null);
  const stats = useMemo(() => getStats(data), [data]);
  const distributionIndex = useMemo(() => flattenDistributions(data), [data]);
  const mapSize = nodeMap?.width ?? 3600;
  const renderedSize = Math.round(mapSize * zoom);
  const scale = renderedSize / mapSize;

  useEffect(() => {
    let isMounted = true;

    fetch(NODE_MAP_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Node map request failed: ${response.status}`);
        }
        return response.json();
      })
      .then((payload: NodeMap) => {
        if (isMounted) {
          setNodeMap(payload);
        }
      })
      .catch((error) => {
        console.error("Unable to load Linux genealogy node map", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const recenter = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    viewport.scrollLeft = Math.max(
      (viewport.scrollWidth - viewport.clientWidth) / 2,
      0,
    );
    viewport.scrollTop = Math.max(
      (viewport.scrollHeight - viewport.clientHeight) / 2,
      0,
    );
  };

  const selectPosition = (node: NodePosition) => {
    const distribution = distributionIndex.get(
      getDistributionKey(node.name, node.year),
    );
    if (distribution) {
      setSelectedNode(distribution);
    }
  };

  return (
    <div className="flex h-full min-h-[720px] overflow-hidden rounded-lg border border-atl-border/70 bg-[#07111c]">
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-atl-border/70 bg-[#101c2a] px-4 py-3">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-atl-muted">
              Static SVG System Map
            </div>
            <div className="mt-1 text-sm text-atl-archive">
              Generated map with clickable node overlays for distribution
              details.
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-atl-muted">
              Zoom
              <input
                type="range"
                min="0.35"
                max="1.25"
                step="0.05"
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                className="w-36 accent-atl-cyan"
              />
              <span className="w-10 text-right text-atl-archive">
                {Math.round(zoom * 100)}%
              </span>
            </label>
            <button
              type="button"
              onClick={recenter}
              className="rounded border border-atl-border/70 px-3 py-2 text-xs font-semibold text-atl-archive hover:border-atl-cyan hover:text-white"
            >
              Center
            </button>
            <a
              href={MAP_URL}
              className="rounded border border-atl-border/70 px-3 py-2 text-xs font-semibold text-atl-archive hover:border-atl-cyan hover:text-white"
            >
              Open SVG
            </a>
            <a
              href={DATASET_URL}
              className="rounded border border-atl-border/70 px-3 py-2 text-xs font-semibold text-atl-archive hover:border-atl-cyan hover:text-white"
            >
              JSON
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 border-b border-atl-border/70 bg-[#0c1723] px-4 py-2 text-xs text-atl-muted sm:grid-cols-4">
          <span>
            Nodes: <strong className="text-atl-archive">{stats.count}</strong>
          </span>
          <span>
            Years:{" "}
            <strong className="text-atl-archive">
              {stats.minYear}-{stats.maxYear}
            </strong>
          </span>
          <span>
            Depth:{" "}
            <strong className="text-atl-archive">{stats.maxDepth}</strong>
          </span>
          <span>
            Hotspots:{" "}
            <strong className="text-atl-archive">
              {nodeMap?.nodes.length ?? "loading"}
            </strong>
          </span>
        </div>

        <div ref={viewportRef} className="min-h-0 flex-1 overflow-auto">
          <div
            className="relative mx-auto my-8"
            style={{ width: renderedSize, height: renderedSize }}
          >
            <img
              src={MAP_URL}
              alt="Radial Linux distribution genealogy map generated from the public Aptlantis Studio dataset"
              className="block max-w-none select-none"
              style={{ width: renderedSize, height: renderedSize }}
              draggable={false}
              onLoad={recenter}
            />

            {nodeMap?.nodes.map((node) => {
              const diameter = Math.max(22, (node.radius + 7) * 2 * scale);
              const left = node.x * scale - diameter / 2;
              const top = node.y * scale - diameter / 2;

              return (
                <button
                  key={`${node.name}-${node.year}-${node.depth}`}
                  type="button"
                  aria-label={`View ${node.name} distribution details`}
                  title={`${node.name}${node.year ? ` (${node.year})` : ""}`}
                  onClick={() => selectPosition(node)}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className="absolute rounded-full border border-transparent bg-transparent transition hover:border-atl-cyan/80 hover:bg-atl-cyan/15 focus:border-atl-cyan focus:bg-atl-cyan/20 focus:outline-none"
                  style={{
                    left,
                    top,
                    width: diameter,
                    height: diameter,
                  }}
                />
              );
            })}

            {hoveredNode && (
              <div
                className="pointer-events-none absolute z-10 rounded border border-atl-border/70 bg-[#101c2a]/95 px-2 py-1 text-xs font-semibold text-atl-archive shadow-lg"
                style={{
                  left: hoveredNode.x * scale + 12,
                  top: hoveredNode.y * scale - 12,
                }}
              >
                {hoveredNode.name}
                {hoveredNode.year ? ` (${hoveredNode.year})` : ""}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedNode && (
        <DistributionPanel
          distribution={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  );
};

const DistributionPanel = ({
  distribution,
  onClose,
}: {
  distribution: Distribution;
  onClose: () => void;
}) => (
  <aside className="w-80 shrink-0 overflow-y-auto border-l border-atl-border/70 bg-[#101c2a] p-4">
    <div className="mb-3 flex items-start justify-between gap-3">
      <div>
        <h3 className="text-xl font-bold text-white">{distribution.name}</h3>
        <p className="text-sm text-atl-muted">{distribution.year}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="rounded border border-atl-border/70 px-2 py-1 text-xs text-atl-muted hover:border-atl-cyan hover:text-white"
      >
        Close
      </button>
    </div>

    <div className="space-y-4">
      {distribution.tags && distribution.tags.length > 0 && (
        <div>
          <div className="mb-2 text-xs uppercase tracking-[0.18em] text-atl-muted">
            Tags
          </div>
          <div className="flex flex-wrap gap-1">
            {distribution.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-atl-border/70 px-2 py-0.5 text-xs text-atl-archive"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {distribution.facts && distribution.facts.length > 0 && (
        <TextList title="Facts" items={distribution.facts} />
      )}

      {distribution.philosophy && distribution.philosophy.length > 0 && (
        <TextList title="Philosophy" items={distribution.philosophy} />
      )}

      {distribution.technical && (
        <ObjectDetail title="Technical" value={distribution.technical} />
      )}

      {distribution.community && (
        <ObjectDetail title="Community" value={distribution.community} />
      )}

      {distribution.plan && (
        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-atl-muted">
            Mission
          </div>
          <p className="text-xs leading-relaxed text-atl-archive">
            {distribution.plan}
          </p>
        </div>
      )}

      {distribution.children && distribution.children.length > 0 && (
        <div className="border-t border-atl-border/70 pt-3 text-xs text-atl-muted">
          {distribution.children.length} child distribution
          {distribution.children.length > 1 ? "s" : ""}
        </div>
      )}
    </div>
  </aside>
);

const TextList = ({ title, items }: { title: string; items: string[] }) => (
  <div>
    <div className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-atl-muted">
      {title}
    </div>
    <ul className="space-y-1 text-xs leading-relaxed text-atl-archive">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </div>
);

const ObjectDetail = ({
  title,
  value,
}: {
  title: string;
  value: Record<string, unknown>;
}) => (
  <div>
    <div className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-atl-muted">
      {title}
    </div>
    <div className="space-y-1 text-xs text-atl-archive">
      {Object.entries(value).map(([key, detail]) => (
        <div key={key}>
          <span className="text-atl-muted">{key.replace(/_/g, " ")}:</span>{" "}
          {Array.isArray(detail) ? detail.join(", ") : String(detail)}
        </div>
      ))}
    </div>
  </div>
);

export default D3TreeVisualization;
