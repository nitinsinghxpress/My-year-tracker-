import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height, drawFn) {
  // Simple uncompressed or deflated raw RGBA PNG writer
  const rowSize = width * 4;
  const rawData = Buffer.alloc((rowSize + 1) * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rowSize + 1);
    rawData[rowOffset] = 0; // Filter byte 0 (None)
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  function crc32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ -1) >>> 0;
  }

  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }

  function makeChunk(type, data) {
    const len = data.length;
    const chunk = Buffer.alloc(12 + len);
    chunk.writeUInt32BE(len, 0);
    chunk.write(type, 4, 4, 'ascii');
    data.copy(chunk, 8);
    const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = crc32(typeAndData);
    chunk.writeUInt32BE(crc, 8 + len);
    return chunk;
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bit depth
  ihdr[9] = 6; // color type 6: RGBA
  ihdr[10] = 0; // compression method
  ihdr[11] = 0; // filter method
  ihdr[12] = 0; // interlace method

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const outDir = path.resolve('public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 1. App Icon Generator (Modern Emerald Green to Teal gradient with Year Tracker check & badge)
function drawAppIcon(x, y, w, h, isMaskable = false) {
  const nx = x / w;
  const ny = y / h;

  // Background: Rich deep slate dark background (#0e1726 to #090d16) or vibrant emerald gradient
  // Let's create an emerald brand aesthetic
  // Radial/linear gradient from #10b981 (emerald) to #047857 (deep emerald)
  const grad = (nx * 0.4 + ny * 0.6);
  const rBg = Math.round(16 * (1 - grad) + 5 * grad);
  const gBg = Math.round(185 * (1 - grad) + 120 * grad);
  const bBg = Math.round(129 * (1 - grad) + 87 * grad);

  // If not maskable, round corners nicely
  if (!isMaskable) {
    const cornerRadius = w * 0.22;
    const inCornerX = x < cornerRadius ? cornerRadius - x : (x > w - cornerRadius ? x - (w - cornerRadius) : 0);
    const inCornerY = y < cornerRadius ? cornerRadius - y : (y > h - cornerRadius ? y - (h - cornerRadius) : 0);
    if (inCornerX > 0 && inCornerY > 0) {
      const dist = Math.sqrt(inCornerX * inCornerX + inCornerY * inCornerY);
      if (dist > cornerRadius) {
        return [0, 0, 0, 0]; // transparent outside rounded corner
      }
    }
  }

  // Draw 365 calendar grid / checkmark in safe zone (center 60%)
  const cx = w / 2;
  const cy = h / 2;
  const dx = (x - cx) / (w * 0.35);
  const dy = (y - cy) / (h * 0.35);

  // Calendar outline
  const calW = w * 0.34;
  const calH = h * 0.34;
  const inCalX = Math.abs(x - cx) < calW;
  const inCalY = Math.abs(y - cy + h * 0.02) < calH;

  // Let's draw clean minimalist year tracker glyph: White calendar with checkmark
  if (inCalX && inCalY) {
    // Header bar of calendar
    if (y < cy - calH + h * 0.14) {
      return [255, 255, 255, 240];
    }
    // Calendar body background (translucent white)
    if (Math.abs(x - cx) < calW - 2 && Math.abs(y - cy + h * 0.02) < calH - 2) {
      // Checkmark geometry
      // Vertex 1: cx - calW*0.4, cy + calH*0.05
      // Vertex 2: cx - calW*0.05, cy + calH*0.4
      // Vertex 3: cx + calW*0.45, cy - calH*0.3
      const lx = (x - cx) / calW;
      const ly = (y - cy) / calH;

      // Draw checkmark stroke
      const checkDist = Math.min(
        distToSegment(lx, ly, -0.4, 0.05, -0.1, 0.42),
        distToSegment(lx, ly, -0.1, 0.42, 0.45, -0.28)
      );
      if (checkDist < 0.12) {
        return [16, 185, 129, 255]; // Vivid emerald checkmark
      }

      // Small dots or calendar grid slots in background
      const gridX = Math.floor((lx + 0.8) / 0.4);
      const gridY = Math.floor((ly + 0.8) / 0.4);
      if (gridX >= 0 && gridX < 4 && gridY >= 0 && gridY < 4) {
        return [255, 255, 255, 210];
      }
      return [255, 255, 255, 230];
    }
    return [255, 255, 255, 255];
  }

  // Ring around calendar for aesthetic depth
  const rDist = Math.sqrt(dx * dx + dy * dy);
  if (rDist > 1.25 && rDist < 1.35) {
    return [255, 255, 255, 120];
  }

  return [rBg, gBg, bBg, 255];
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

// Write PNG files
fs.writeFileSync(path.join(outDir, 'pwa-192x192.png'), createPNG(192, 192, (x, y, w, h) => drawAppIcon(x, y, w, h, false)));
fs.writeFileSync(path.join(outDir, 'pwa-512x512.png'), createPNG(512, 512, (x, y, w, h) => drawAppIcon(x, y, w, h, false)));
fs.writeFileSync(path.join(outDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, (x, y, w, h) => drawAppIcon(x, y, w, h, true)));
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), createPNG(180, 180, (x, y, w, h) => drawAppIcon(x, y, w, h, false)));

// Write SVG icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.25"/>
    </filter>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bg)"/>
  <rect x="96" y="96" width="320" height="320" rx="36" fill="#ffffff" filter="url(#shadow)"/>
  <path d="M96 156 C96 116 116 96 156 96 L356 96 C396 96 416 116 416 156 L416 172 L96 172 Z" fill="#0f172a"/>
  <!-- Spiral binders -->
  <circle cx="160" cy="118" r="10" fill="#ffffff" opacity="0.9"/>
  <circle cx="256" cy="118" r="10" fill="#ffffff" opacity="0.9"/>
  <circle cx="352" cy="118" r="10" fill="#ffffff" opacity="0.9"/>
  <text x="256" y="148" font-family="system-ui, sans-serif" font-size="22" font-weight="800" fill="#10b981" text-anchor="middle" letter-spacing="3">365 DAYS</text>
  <!-- Main Checkmark -->
  <path d="M168 288 L232 352 L344 236" fill="none" stroke="#10b981" stroke-width="38" stroke-linecap="round" stroke-linejoin="round"/>
  <!-- Mini day streak dots -->
  <circle cx="160" cy="208" r="8" fill="#10b981"/>
  <circle cx="208" cy="208" r="8" fill="#10b981"/>
  <circle cx="256" cy="208" r="8" fill="#10b981"/>
  <circle cx="304" cy="208" r="8" fill="#ef4444"/>
  <circle cx="352" cy="208" r="8" fill="#10b981"/>
</svg>`;

fs.writeFileSync(path.join(outDir, 'icon.svg'), svgContent);
fs.writeFileSync(path.join(outDir, 'favicon.ico'), createPNG(64, 64, (x, y, w, h) => drawAppIcon(x, y, w, h, false)));

console.log('PWA icons successfully generated in public/ directory!');
