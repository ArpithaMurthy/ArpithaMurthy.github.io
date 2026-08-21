import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const articlesDirectory = path.resolve("src/articles");
const outputDirectory = path.resolve("public/images/diagrams");
const WIDTH = 1120;
const NODE_HEIGHT = 96;
const LAYER_GAP = 74;
const SIDE_PADDING = 64;
const NODE_GAP = 28;

const diagramFiles = (await readdir(articlesDirectory, { recursive: true }))
  .filter((filename) => path.basename(filename) === "diagram.js");
const diagrams = await Promise.all(diagramFiles.map(async (filename) =>
  (await import(pathToFileURL(path.join(articlesDirectory, filename)))).default,
));

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function wrapText(value, maximumCharacters) {
  const words = String(value).split(/\s+/);
  const lines = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maximumCharacters && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

function normalizeNode(node, layerIndex, nodeIndex, implementation) {
  const [label, technology = ""] = Array.isArray(node) ? node : [node, ""];
  return { id: `layer-${layerIndex}-node-${nodeIndex}`, label, technology, implementation };
}

function buildDiagram({ title, layers, concerns, implementation }) {
  const normalizedLayers = layers.map((layer, layerIndex) =>
    layer.map((node, nodeIndex) => normalizeNode(node, layerIndex, nodeIndex, implementation)),
  );
  const legendHeight = implementation ? 46 : 0;
  const topPadding = 46 + legendHeight;
  const concernsHeight = concerns ? 84 : 30;
  const height = topPadding + normalizedLayers.length * NODE_HEIGHT + (normalizedLayers.length - 1) * LAYER_GAP + concernsHeight;
  const positions = new Map();

  normalizedLayers.forEach((layer, layerIndex) => {
    const availableWidth = WIDTH - SIDE_PADDING * 2;
    const nodeWidth = Math.min(440, (availableWidth - NODE_GAP * (layer.length - 1)) / layer.length);
    const totalWidth = nodeWidth * layer.length + NODE_GAP * (layer.length - 1);
    const startX = (WIDTH - totalWidth) / 2;
    const y = topPadding + layerIndex * (NODE_HEIGHT + LAYER_GAP);
    layer.forEach((node, nodeIndex) => positions.set(node.id, { x: startX + nodeIndex * (nodeWidth + NODE_GAP), y, width: nodeWidth }));
  });

  const edges = [];
  for (let layerIndex = 0; layerIndex < normalizedLayers.length - 1; layerIndex += 1) {
    const sources = normalizedLayers[layerIndex];
    const targets = normalizedLayers[layerIndex + 1];
    for (const source of sources) {
      for (const target of targets) {
        if (sources.length > 1 && targets.length > 1 && sources.indexOf(source) !== targets.indexOf(target)) continue;
        const from = positions.get(source.id);
        const to = positions.get(target.id);
        const startX = from.x + from.width / 2;
        const startY = from.y + NODE_HEIGHT;
        const endX = to.x + to.width / 2;
        const endY = to.y;
        const middleY = startY + (endY - startY) / 2;
        edges.push(`<path class="line" d="M${startX} ${startY} V${middleY} H${endX} V${endY - 8}"/>`);
      }
    }
  }

  const nodes = normalizedLayers.flatMap((layer) => layer.map((node) => {
    const position = positions.get(node.id);
    const labelLines = wrapText(node.label, Math.max(16, Math.floor(position.width / 10)));
    const labelStartY = position.y + (node.technology ? 34 : 50) - (labelLines.length - 1) * 11;
    const label = labelLines.map((line, index) => `<tspan x="${position.x + position.width / 2}" dy="${index === 0 ? 0 : 22}">${escapeXml(line)}</tspan>`).join("");
    const technology = node.technology
      ? `<text class="tech" x="${position.x + position.width / 2}" y="${position.y + 77}">${escapeXml(node.technology)}</text>`
      : "";
    return `<g>
      <rect class="node${node.implementation && normalizedLayers.indexOf(layer) === 1 ? " primary" : ""}" x="${position.x}" y="${position.y}" width="${position.width}" height="${NODE_HEIGHT}" rx="7"/>
      <text class="step" x="${position.x + position.width / 2}" y="${labelStartY}">${label}</text>
      ${technology}
    </g>`;
  })).join("\n");

  const legend = implementation
    ? `<text class="legend-step" x="${SIDE_PADDING}" y="48">Capability</text><text class="legend-tech" x="${SIDE_PADDING + 94}" y="48">Technology</text>`
    : "";
  const boundary = concerns
    ? `<rect class="boundary" x="24" y="18" width="${WIDTH - 48}" height="${height - 36}" rx="9"/>
       <text class="boundary-label" x="${WIDTH / 2}" y="${height - 58}">ACROSS EVERY LAYER</text>
       <text class="note" x="${WIDTH / 2}" y="${height - 32}">${escapeXml(concerns)}</text>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${height}" role="img" aria-labelledby="title description">
  <title id="title">${escapeXml(title)}</title>
  <desc id="description">${escapeXml(implementation ? `One possible implementation of ${title}` : `Reference architecture for ${title}`)}</desc>
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#83796b"/></marker>
    <style>
      .boundary { fill: none; stroke: #b9afa2; stroke-width: 2; stroke-dasharray: 7 7; }
      .node { fill: #fff; stroke: #83796b; stroke-width: 2; }
      .primary { fill: #fbf3f5; stroke: #b11f4b; }
      .line { fill: none; stroke: #83796b; stroke-width: 2.5; marker-end: url(#arrow); }
      .step { fill: #242424; font: 600 18px Manrope, "Segoe UI", sans-serif; text-anchor: middle; }
      .tech { fill: #b11f4b; font: 500 14px Consolas, "Courier New", monospace; text-anchor: middle; }
      .note { fill: #5c5c5c; font: 500 14px Manrope, "Segoe UI", sans-serif; text-anchor: middle; }
      .boundary-label { fill: #b11f4b; font: 600 14px Manrope, "Segoe UI", sans-serif; letter-spacing: .4px; text-anchor: middle; }
      .legend-step { fill: #242424; font: 600 14px Manrope, "Segoe UI", sans-serif; }
      .legend-tech { fill: #b11f4b; font: 500 13px Consolas, "Courier New", monospace; }
    </style>
  </defs>
  ${boundary}
  ${legend}
  ${edges.join("\n")}
  ${nodes}
</svg>\n`;
}

await mkdir(outputDirectory, { recursive: true });

let generatedCount = 0;
for (const diagram of diagrams) {
  if (diagram.reference) {
    await writeFile(
      path.join(outputDirectory, `${diagram.slug}-reference.svg`),
      buildDiagram({ title: diagram.title, layers: diagram.reference, concerns: diagram.concerns, implementation: false }),
    );
    generatedCount += 1;
  }
  if (diagram.implementation) {
    await writeFile(
      path.join(outputDirectory, `${diagram.slug}-implementation.svg`),
      buildDiagram({ title: diagram.title, layers: diagram.implementation, implementation: true }),
    );
    generatedCount += 1;
  }
}

console.log(`Generated ${generatedCount} static SVG diagrams.`);
