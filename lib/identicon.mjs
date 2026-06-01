const DEFAULT_SEED = "zhanjiang-user";
const GRID_SIZE = 5;
const MIRROR_COLUMNS = 3;

const hashSeed = (seed) => {
  const text = String(seed || DEFAULT_SEED).trim() || DEFAULT_SEED;
  let hash = 0x811c9dc5;

  for (const char of text) {
    hash ^= char.codePointAt(0);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  return hash >>> 0;
};

const nextHash = (hash) => (Math.imul(hash ^ (hash >>> 15), 2246822507) >>> 0);

const escapeXml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

export const createIdenticonSvg = (seed, options = {}) => {
  const normalizedSeed = String(seed || DEFAULT_SEED).trim() || DEFAULT_SEED;
  const baseHash = hashSeed(normalizedSeed);
  const hue = baseHash % 360;
  const saturation = 48 + ((baseHash >>> 8) % 20);
  const lightness = 38 + ((baseHash >>> 16) % 12);
  const foreground = options.color ?? `hsl(${hue} ${saturation}% ${lightness}%)`;
  const background = options.background ?? "hsl(38 36% 95%)";
  let cursor = baseHash;
  const cells = [];

  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < MIRROR_COLUMNS; x += 1) {
      cursor = nextHash(cursor + x + y * GRID_SIZE);
      if ((cursor & 1) === 1) {
        cells.push({ x, y });
        const mirrorX = GRID_SIZE - 1 - x;
        if (mirrorX !== x) {
          cells.push({ x: mirrorX, y });
        }
      }
    }
  }

  if (cells.length === 0) {
    cells.push({ x: 2, y: 2 });
  }

  const rects = cells
    .sort((a, b) => (a.y - b.y) || (a.x - b.x))
    .map(({ x, y }) => `<rect x="${x}" y="${y}" width="1" height="1" rx="0.16" />`)
    .join("");

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${GRID_SIZE} ${GRID_SIZE}" role="img" aria-label="${escapeXml(normalizedSeed)} avatar">`,
    `<rect width="${GRID_SIZE}" height="${GRID_SIZE}" fill="${background}" />`,
    `<g fill="${foreground}">${rects}</g>`,
    "</svg>",
  ].join("");
};

export const createIdenticonDataUrl = (seed, options = {}) => (
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(createIdenticonSvg(seed, options))}`
);
