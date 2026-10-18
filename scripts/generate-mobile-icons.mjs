import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j += 1) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePng(width, height, paint) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const row = y * (width * 4 + 1);
    raw[row] = 0;
    for (let x = 0; x < width; x += 1) {
      const [r, g, b, a] = paint(x, y, width, height);
      const i = row + 1 + x * 4;
      raw[i] = r;
      raw[i + 1] = g;
      raw[i + 2] = b;
      raw[i + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function inCircle(x, y, cx, cy, r) {
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= r * r;
}

function inRoundedRect(x, y, size, radius) {
  const r = Math.min(radius, size / 2);
  if (x >= r && x < size - r) return y >= 0 && y < size;
  if (y >= r && y < size - r) return x >= 0 && x < size;
  return (
    inCircle(x, y, r, r, r) ||
    inCircle(x, y, size - 1 - r, r, r) ||
    inCircle(x, y, r, size - 1 - r, r) ||
    inCircle(x, y, size - 1 - r, size - 1 - r, r)
  );
}

function paintIcon(x, y, size) {
  if (!inRoundedRect(x, y, size, size * (14 / 64))) return [0, 0, 0, 0];
  const s = size / 64;
  if (inCircle(x, y, 22 * s, 26 * s, 8 * s)) return [255, 143, 171, 255];
  if (inCircle(x, y, 42 * s, 26 * s, 8 * s)) return [245, 213, 106, 255];
  if (inCircle(x, y, 32 * s, 42 * s, 8 * s)) return [196, 43, 84, 255];
  return [30, 20, 70, 255];
}

function paintSplash(x, y, width, height) {
  const size = Math.min(width, height) * 0.28;
  const ox = (width - size) / 2;
  const oy = (height - size) / 2;
  if (x >= ox && x < ox + size && y >= oy && y < oy + size) {
    return paintIcon(x - ox, y - oy, size);
  }
  return [20, 12, 51, 255];
}

function paintForeground(x, y, size) {
  const inner = size * 0.62;
  const ox = (size - inner) / 2;
  const oy = (size - inner) / 2;
  if (x >= ox && x < ox + inner && y >= oy && y < oy + inner) {
    return paintIcon(x - ox, y - oy, inner);
  }
  return [0, 0, 0, 0];
}

function writePng(path, width, height, paint) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, encodePng(width, height, paint));
}

const assets = join(root, "assets");
writePng(join(assets, "icon.png"), 1024, 1024, (x, y, w) => paintIcon(x, y, w));
writePng(join(assets, "splash.png"), 1080, 1920, paintSplash);

const res = join(root, "android/app/src/main/res");
const densities = [
  ["mdpi", 48, 108],
  ["hdpi", 72, 162],
  ["xhdpi", 96, 216],
  ["xxhdpi", 144, 324],
  ["xxxhdpi", 192, 432],
];
for (const [name, launcher, foreground] of densities) {
  const dir = join(res, `mipmap-${name}`);
  writePng(join(dir, "ic_launcher.png"), launcher, launcher, (x, y, w) => paintIcon(x, y, w));
  writePng(join(dir, "ic_launcher_round.png"), launcher, launcher, (x, y, w) => paintIcon(x, y, w));
  writePng(join(dir, "ic_launcher_foreground.png"), foreground, foreground, (x, y, w) => paintForeground(x, y, w));
}
writePng(join(res, "drawable/splash.png"), 1080, 1920, paintSplash);
console.log("íconos y splash de La Previa listos");
