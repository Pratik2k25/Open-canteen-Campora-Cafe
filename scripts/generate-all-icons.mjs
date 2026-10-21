import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
}

const crcTable = createCRC32Table();

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcPayload = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(crcPayload);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function createPng(width, height, isMaskable = false, mode = 'campora') {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const ihdrChunk = makeChunk('IHDR', ihdr);

  const rawBytes = Buffer.alloc(height * (width * 4 + 1));
  let offset = 0;

  const cx = width / 2;
  const cy = height / 2;
  const outerRadius = width * (isMaskable ? 0.48 : 0.42);
  const innerRadius = width * 0.28;

  for (let y = 0; y < height; y++) {
    rawBytes[offset++] = 0;
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let r = 18;
      let g = 21;
      let b = 27;
      let a = 255;

      if (!isMaskable && dist > outerRadius + 2) {
        a = 0;
      } else if (dist <= innerRadius) {
        // Base badge color: Coral #FF5C38
        r = 255;
        g = 92;
        b = 56;

        if (mode === 'campora') {
          // Campora 'C' motif inside badge
          const cupRadius = width * 0.16;
          const cdist = Math.sqrt(dx * dx + dy * dy);
          if (
            cdist >= cupRadius * 0.55 &&
            cdist <= cupRadius &&
            Math.atan2(dy, dx) > -2.2 &&
            Math.atan2(dy, dx) < 2.2
          ) {
            r = 255;
            g = 255;
            b = 255;
          }
        } else {
          // Neutral Open Canteen Cloche & Tray motif
          // Handle: circle at (cx, cy - width * 0.14)
          const hDist = Math.sqrt(dx * dx + (dy + width * 0.14) ** 2);
          // Cloche Dome: upper hemisphere
          const domeY = dy + width * 0.02;
          const domeDist = Math.sqrt(dx * dx + domeY * domeY);

          // Tray: horizontal bar at dy: +width*0.06 to +width*0.11
          const isTray =
            Math.abs(dx) <= width * 0.22 &&
            dy >= width * 0.05 &&
            dy <= width * 0.10;

          // Base foot: dy: +width*0.12 to +width*0.14
          const isFoot =
            Math.abs(dx) <= width * 0.16 &&
            dy > width * 0.10 &&
            dy <= width * 0.14;

          if (hDist <= width * 0.035) {
            // White cloche handle
            r = 255;
            g = 255;
            b = 255;
          } else if (domeDist <= width * 0.18 && domeY <= 0) {
            // White cloche dome
            r = 255;
            g = 255;
            b = 255;

            // Cutout inner dome in coral for contrast
            if (domeDist >= width * 0.06 && domeDist <= width * 0.12 && Math.abs(dx) <= width * 0.08) {
              r = 255;
              g = 92;
              b = 56;
            }
          } else if (isTray) {
            r = 255;
            g = 255;
            b = 255;
          } else if (isFoot) {
            r = 255;
            g = 255;
            b = 255;
            a = 180;
          }
        }
      } else if (dist <= innerRadius + width * 0.03) {
        // White border ring around badge
        r = 255;
        g = 255;
        b = 255;
        a = 230;
      }

      rawBytes[offset++] = r;
      rawBytes[offset++] = g;
      rawBytes[offset++] = b;
      rawBytes[offset++] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawBytes, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const rootPublic = path.resolve('public');
const camporaDir = path.resolve('public/icons/campora');
const neutralDir = path.resolve('public/icons/neutral');

for (const dir of [rootPublic, camporaDir, neutralDir]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// 1. Generate Campora icons in /public/icons/campora/ and root /public/
for (const dir of [rootPublic, camporaDir]) {
  fs.writeFileSync(path.join(dir, 'pwa-192x192.png'), createPng(192, 192, false, 'campora'));
  fs.writeFileSync(path.join(dir, 'pwa-512x512.png'), createPng(512, 512, false, 'campora'));
  fs.writeFileSync(path.join(dir, 'pwa-maskable-512x512.png'), createPng(512, 512, true, 'campora'));
  fs.writeFileSync(path.join(dir, 'apple-touch-icon.png'), createPng(180, 180, false, 'campora'));
  fs.writeFileSync(path.join(dir, 'favicon.ico'), createPng(32, 32, false, 'campora'));
}

// 2. Generate Neutral Open Canteen icons in /public/icons/neutral/
fs.writeFileSync(path.join(neutralDir, 'pwa-192x192.png'), createPng(192, 192, false, 'neutral'));
fs.writeFileSync(path.join(neutralDir, 'pwa-512x512.png'), createPng(512, 512, false, 'neutral'));
fs.writeFileSync(path.join(neutralDir, 'pwa-maskable-512x512.png'), createPng(512, 512, true, 'neutral'));
fs.writeFileSync(path.join(neutralDir, 'apple-touch-icon.png'), createPng(180, 180, false, 'neutral'));
fs.writeFileSync(path.join(neutralDir, 'favicon.ico'), createPng(32, 32, false, 'neutral'));

console.log('Successfully generated both Campora and Neutral PWA icons!');
