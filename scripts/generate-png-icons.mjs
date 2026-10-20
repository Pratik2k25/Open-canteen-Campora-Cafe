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

function createPng(width, height, isMaskable = false) {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth: 8
  ihdr[9] = 6; // color type: 6 (RGBA)
  ihdr[10] = 0; // compression method
  ihdr[11] = 0; // filter method
  ihdr[12] = 0; // interlace method

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Generate image data
  // Background: dark charcoal #12151B (RGB: 18, 21, 27)
  // Center circle/accent: coral #FF5C38 (RGB: 255, 92, 56)
  // Inner cup / symbol: warm white #FFFFFF
  const rawBytes = Buffer.alloc(height * (width * 4 + 1));
  let offset = 0;

  const cx = width / 2;
  const cy = height / 2;
  const outerRadius = width * (isMaskable ? 0.48 : 0.42);
  const innerRadius = width * 0.28;

  for (let y = 0; y < height; y++) {
    rawBytes[offset++] = 0; // Filter byte: 0 (None)
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Default background color: #12151B
      let r = 18;
      let g = 21;
      let b = 27;
      let a = 255;

      if (!isMaskable && dist > outerRadius + 2) {
        // Transparent outside rounded icon on non-maskable
        a = 0;
      } else if (dist <= innerRadius) {
        // Inner badge: Coral #FF5C38
        r = 255;
        g = 92;
        b = 56;

        // Cup silhouette / C motif inside inner badge
        const cdx = x - cx;
        const cdy = y - cy;
        const cupRadius = width * 0.16;
        const cdist = Math.sqrt(cdx * cdx + cdy * cdy);

        // 'C' letter cut out
        if (cdist >= cupRadius * 0.55 && cdist <= cupRadius && Math.atan2(cdy, cdx) > -2.2 && Math.atan2(cdy, cdx) < 2.2) {
          r = 255;
          g = 255;
          b = 255;
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

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPng(32, 32, false));

console.log('Successfully generated all PWA PNG icons in /public.');
