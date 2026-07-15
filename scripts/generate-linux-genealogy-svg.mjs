import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const inputPath = path.join(
  rootDir,
  "public",
  "data",
  "linux-genealogy",
  "linux-genealogy-expanded.json",
);
const outputPath = path.join(
  rootDir,
  "public",
  "data",
  "linux-genealogy",
  "linux-genealogy-map.svg",
);
const nodeMapPath = path.join(
  rootDir,
  "public",
  "data",
  "linux-genealogy",
  "linux-genealogy-map-nodes.json",
);

const raw = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const root = Array.isArray(raw) ? raw[0] : raw;

const size = 3600;
const center = size / 2;
const maxRadius = 1540;
const depthGap = 250;
const labelRadiusPad = 18;
const nodes = [];
const links = [];

const escapeXml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const countLeaves = (node) => {
  if (!node.children?.length) {
    node.leafCount = 1;
    return 1;
  }

  node.leafCount = node.children.reduce(
    (sum, child) => sum + countLeaves(child),
    0,
  );
  return node.leafCount;
};

const collectStats = (node, depth = 0, stats = { count: 0, maxDepth: 0 }) => {
  stats.count += 1;
  stats.maxDepth = Math.max(stats.maxDepth, depth);
  node.children?.forEach((child) => collectStats(child, depth + 1, stats));
  return stats;
};

countLeaves(root);
const stats = collectStats(root);

const place = (node, startAngle, endAngle, depth = 0, parent = null) => {
  const angle = (startAngle + endAngle) / 2;
  const radius =
    depth === 0
      ? 0
      : Math.min(depth * depthGap + Math.max(0, depth - 1) * 28, maxRadius);
  const x = center + Math.cos(angle) * radius;
  const y = center + Math.sin(angle) * radius;
  const placed = { ...node, angle, depth, radius, x, y, parent };

  nodes.push(placed);

  if (parent) {
    links.push({ source: parent, target: placed });
  }

  if (!node.children?.length) return placed;

  let cursor = startAngle;
  const totalLeaves = node.children.reduce(
    (sum, child) => sum + child.leafCount,
    0,
  );
  const gap = depth === 0 ? 0.025 : 0.011;

  for (const child of node.children) {
    const share = (endAngle - startAngle) * (child.leafCount / totalLeaves);
    const childStart = cursor + gap;
    const childEnd = cursor + share - gap;
    place(child, childStart, childEnd, depth + 1, placed);
    cursor += share;
  }

  return placed;
};

place(root, -Math.PI / 2, Math.PI * 1.5);

const nodeRadius = (node) => {
  if (node.depth === 0) return 24;
  if (node.children?.length) return Math.max(8, 16 - node.depth * 1.2);
  return 5.5;
};

const labelFor = (node) => `${node.name}${node.year ? ` (${node.year})` : ""}`;

const pathForLink = ({ source, target }) => {
  const controlRadius = (source.radius + target.radius) / 2;
  const controlAngle = target.angle;
  const cx = center + Math.cos(controlAngle) * controlRadius;
  const cy = center + Math.sin(controlAngle) * controlRadius;

  return `M ${source.x.toFixed(1)} ${source.y.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(
    1,
  )} ${target.x.toFixed(1)} ${target.y.toFixed(1)}`;
};

const rings = Array.from({ length: stats.maxDepth }, (_, index) => {
  const radius = Math.min(
    (index + 1) * depthGap + Math.max(0, index) * 28,
    maxRadius,
  );
  return `<circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="#203040" stroke-width="1" stroke-dasharray="6 18" opacity="0.5" />`;
}).join("\n");

const linkMarkup = links
  .map(
    (link) =>
      `<path d="${pathForLink(link)}" fill="none" stroke="${escapeXml(
        link.target.color || "#5c7484",
      )}" stroke-width="${link.target.children?.length ? 2.2 : 1.2}" opacity="${
        link.target.children?.length ? 0.62 : 0.36
      }" />`,
  )
  .join("\n");

const nodeMarkup = nodes
  .map((node) => {
    const labelRadius = node.radius + nodeRadius(node) + labelRadiusPad;
    const lx = center + Math.cos(node.angle) * labelRadius;
    const ly = center + Math.sin(node.angle) * labelRadius;
    const anchor =
      node.depth === 0 ? "middle" : Math.cos(node.angle) >= 0 ? "start" : "end";
    const labelSize = node.depth === 0 ? 38 : node.children?.length ? 21 : 13;
    const labelWeight = node.depth <= 1 || node.children?.length ? 700 : 500;
    const labelOpacity = node.depth <= 3 || node.children?.length ? 1 : 0.82;

    return `<g id="node-${escapeXml(node.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}">
  <circle cx="${node.x.toFixed(1)}" cy="${node.y.toFixed(1)}" r="${nodeRadius(
    node,
  )}" fill="${escapeXml(node.color || "#75d3e7")}" stroke="#f4fbff" stroke-width="${
    node.depth === 0 ? 5 : 2
  }" />
  <text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}" dominant-baseline="middle" fill="#f2fbff" font-size="${labelSize}" font-weight="${labelWeight}" opacity="${labelOpacity}" paint-order="stroke" stroke="#07111c" stroke-width="${
    node.depth === 0 ? 8 : 4
  }" stroke-linejoin="round">${escapeXml(labelFor(node))}</text>
</g>`;
  })
  .join("\n");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-labelledby="title desc">
<title id="title">Linux Distribution Genealogy Map</title>
<desc id="desc">Radial static map generated from the public Aptlantis Studio Linux genealogy JSON dataset. It contains ${stats.count} distributions across ${stats.maxDepth} relationship levels.</desc>
<defs>
  <radialGradient id="bg" cx="50%" cy="50%" r="58%">
    <stop offset="0%" stop-color="#13283a" />
    <stop offset="55%" stop-color="#0b1724" />
    <stop offset="100%" stop-color="#050b13" />
  </radialGradient>
  <filter id="soft-glow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="5" result="blur" />
    <feMerge>
      <feMergeNode in="blur" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
</defs>
<rect width="${size}" height="${size}" fill="url(#bg)" />
<g opacity="0.45">
${rings}
</g>
<g font-family="Inter, Segoe UI, Arial, sans-serif">
  <text x="120" y="145" fill="#f3fbff" font-size="54" font-weight="800">Linux Distribution Genealogy</text>
  <text x="120" y="205" fill="#94b6c6" font-size="24" letter-spacing="4">PUBLIC JSON DATASET | ${stats.count} NODES | ${stats.maxDepth} LEVELS</text>
  <text x="120" y="${size - 120}" fill="#6f8fa0" font-size="20">Generated from /data/linux-genealogy/linux-genealogy-expanded.json</text>
</g>
<g filter="url(#soft-glow)">
${linkMarkup}
</g>
<g font-family="Inter, Segoe UI, Arial, sans-serif">
${nodeMarkup}
</g>
</svg>
`;

fs.writeFileSync(outputPath, svg, "utf8");
fs.writeFileSync(
  nodeMapPath,
  `${JSON.stringify(
    {
      generatedFrom: "/data/linux-genealogy/linux-genealogy-expanded.json",
      map: "/data/linux-genealogy/linux-genealogy-map.svg",
      width: size,
      height: size,
      nodeCount: stats.count,
      maxDepth: stats.maxDepth,
      nodes: nodes.map((node) => ({
        id: node.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name: node.name,
        year: node.year ?? null,
        depth: node.depth,
        x: Number(node.x.toFixed(2)),
        y: Number(node.y.toFixed(2)),
        radius: Number(nodeRadius(node).toFixed(2)),
        hasChildren: Boolean(node.children?.length),
        childCount: node.children?.length ?? 0,
      })),
    },
    null,
    2,
  )}\n`,
  "utf8",
);
console.log(
  `Generated ${path.relative(rootDir, outputPath)} and ${path.relative(
    rootDir,
    nodeMapPath,
  )} (${stats.count} nodes)`,
);
