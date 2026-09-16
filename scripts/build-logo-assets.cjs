/**
 * Regenerates every logo asset from the master artwork in brand/.
 *
 *   node scripts/build-logo-assets.cjs
 *
 * The source is a flat two-tone raster (olive ink on cream), so the cut-outs
 * are derived rather than hand-traced. Re-run this after replacing
 * brand/logo-source.webp; do not hand-edit the generated PNGs.
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'brand', 'logo-source.webp');
const OUT = path.join(__dirname, '..', 'public');
const APP = path.join(__dirname, '..', 'src', 'app');
fs.mkdirSync(OUT, { recursive: true });

const INK = [60, 70, 36];          // #3C4624
const CREAM = [249, 245, 238];     // #F9F5EE
const L = (r, g, b) => 0.299*r + 0.587*g + 0.114*b;
const BG_LUMA = L(...CREAM);
const INK_LUMA = L(...INK);

/**
 * Drop connected blobs smaller than `minPx`. Only used on the logo mark, where
 * the geometry is solid and anything tiny is a sliver of the neighbouring
 * wordmark. The wordmark itself is never despeckled — its dry-brush spray is
 * made of small detached flecks that are part of the artwork.
 */
function despeckle(buf, W, H, minPx) {
  const seen = new Uint8Array(W * H);
  const on = (x, y) => x >= 0 && y >= 0 && x < W && y < H && buf[(y*W+x)*4+3] > 38;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!on(x, y) || seen[y*W+x]) continue;
    const stack = [[x, y]], cells = [];
    seen[y*W+x] = 1;
    while (stack.length) {
      const [cx, cy] = stack.pop();
      cells.push(cy*W + cx);
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const nx = cx+dx, ny = cy+dy;
        if (on(nx, ny) && !seen[ny*W+nx]) { seen[ny*W+nx] = 1; stack.push([nx, ny]); }
      }
    }
    if (cells.length < minPx) for (const c of cells) buf[c*4+3] = 0;
  }
}

/**
 * Two-tone separation: the source is flat cream behind flat olive ink, so a
 * pixel's luminance tells us how much ink covers it. Mapping luminance onto
 * alpha keeps the dry-brush texture (light streaks inside strokes stay
 * partially transparent) instead of flattening it to a solid silhouette.
 */
async function extract({ left, width, tint, file, resizeTo, minPx }) {
  const { data, info } = await sharp(SRC)
    .extract({ left, top: 0, width, height: 1024 })
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;

  const out = Buffer.alloc(W * H * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * C;
    const a = Math.max(0, Math.min(1,
      (BG_LUMA - L(data[i], data[i+1], data[i+2])) / (BG_LUMA - INK_LUMA)));
    const o = (y * W + x) * 4;
    out[o] = tint[0]; out[o+1] = tint[1]; out[o+2] = tint[2];
    out[o+3] = Math.round(a * 255);
  }

  if (minPx) despeckle(out, W, H, minPx);

  // Trim to the artwork's own bounds so layout can size it directly.
  let minX = W, maxX = -1, minY = H, maxY = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (out[(y*W+x)*4+3] > 15) {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }

  let pipe = sharp(out, { raw: { width: W, height: H, channels: 4 } })
    .extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 });
  if (resizeTo) pipe = pipe.resize({ width: resizeTo, withoutEnlargement: true });

  const dest = path.join(OUT, file);
  await pipe.png({ compressionLevel: 9 }).toFile(dest);
  const m = await sharp(dest).metadata();
  console.log(`  ${file.padEnd(26)} ${String(m.width).padStart(5)}x${String(m.height).padEnd(5)} ${(fs.statSync(dest).size/1024).toFixed(1)} KB`);
}

const MARK_LIGHT = path.join(OUT, 'logo-mark-light.png');
const INK_HEX = '#3C4624';

/**
 * Favicon: the logo mark in cream on the brand olive. Inverting the logo's own
 * two colours keeps it on-brand while giving the mark enough contrast to stay
 * legible against both light and dark browser chrome at 32px.
 */
async function icon(size, radiusRatio, dest) {
  const pad = Math.round(size * 0.17);
  const inner = size - pad * 2;
  const r = Math.round(size * radiusRatio);

  const bg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
       <rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="${INK_HEX}"/>
     </svg>`
  );
  const mark = await sharp(MARK_LIGHT)
    .resize({ width: inner, height: inner, fit: 'contain',
              background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp(bg)
    .composite([{ input: mark, left: pad, top: pad }])
    .png({ compressionLevel: 9 })
    .toFile(dest);
  console.log('  ' + path.relative(path.join(__dirname, '..'), dest).padEnd(28) + size + 'x' + size);
}


(async () => {
  // Column-density analysis puts the mark at x 46..449 and the wordmark from
  // x 450 to the right edge.
  const FULL = { left: 40, width: 1496 };
  const MARK = { left: 40, width: 410, minPx: 300 };
  const WORD = { left: 450, width: 1086 };

  console.log('olive ink — for light backgrounds:');
  await extract({ ...FULL, tint: INK,   file: 'logo.png',              resizeTo: 1200 });
  await extract({ ...MARK, tint: INK,   file: 'logo-mark.png',         resizeTo: 512 });
  await extract({ ...WORD, tint: INK,   file: 'logo-wordmark.png',     resizeTo: 900 });

  console.log('cream — for dark backgrounds:');
  await extract({ ...FULL, tint: CREAM, file: 'logo-light.png',          resizeTo: 1200 });
  await extract({ ...MARK, tint: CREAM, file: 'logo-mark-light.png',     resizeTo: 512 });
  await extract({ ...WORD, tint: CREAM, file: 'logo-wordmark-light.png', resizeTo: 900 });

  console.log('app + manifest icons:');
  await icon(512, 0.22, path.join(APP, 'icon.png'));
  await icon(180, 0.22, path.join(APP, 'apple-icon.png'));
  await icon(192, 0.22, path.join(OUT, 'icon-192.png'));
  await icon(512, 0.22, path.join(OUT, 'icon-512.png'));
  // Maskable: Android crops to a circle, so bleed the olive to the edges and
  // keep the mark well inside the safe zone.
  await icon(512, 0, path.join(OUT, 'icon-maskable-512.png'));
})();
