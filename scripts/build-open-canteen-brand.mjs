import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const brandingDir = path.resolve('public/assets/branding');
  const neutralDir = path.resolve('public/icons/neutral');
  if (!fs.existsSync(brandingDir)) fs.mkdirSync(brandingDir, { recursive: true });
  if (!fs.existsSync(neutralDir)) fs.mkdirSync(neutralDir, { recursive: true });

  // 1. Copy pristine original sources to permanent branding directory
  fs.copyFileSync('icon/full-icon-with-name.png', path.join(brandingDir, 'open-canteen-logo-source.png'));
  fs.copyFileSync('icon/only-icon.png', path.join(brandingDir, 'open-canteen-icon-source.png'));
  fs.copyFileSync('icon/app-icon.png', path.join(brandingDir, 'open-canteen-app-icon-source.png'));

  const logoDataUrl = 'data:image/png;base64,' + fs.readFileSync('icon/full-icon-with-name.png').toString('base64');
  const iconDataUrl = 'data:image/png;base64,' + fs.readFileSync('icon/only-icon.png').toString('base64');
  const appDataUrl = 'data:image/png;base64,' + fs.readFileSync('icon/app-icon.png').toString('base64');

  // 2. Generate transparent Full Logo (open-canteen-logo.png)
  const logoPngData = await page.evaluate(async (url) => {
    const img = new Image();
    img.src = url;
    await new Promise((r) => (img.onload = r));

    const padX = 28;
    const padY = 20;
    const cropX = Math.max(0, 98 - padX);
    const cropY = Math.max(0, 398 - padY);
    const cropW = 1355 - 98 + 1 + padX * 2;
    const cropH = 651 - 398 + 1 + padY * 2;

    const canvas = document.createElement('canvas');
    canvas.width = cropW;
    canvas.height = cropH;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    const imgData = ctx.getImageData(0, 0, cropW, cropH);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i],
        g = d[i + 1],
        b = d[i + 2];
      const distFromWhite = Math.sqrt((255 - r) ** 2 + (255 - g) ** 2 + (255 - b) ** 2);
      if (distFromWhite < 18) {
        d[i + 3] = 0;
      } else if (distFromWhite < 45) {
        const alpha = (distFromWhite - 18) / (45 - 18);
        d[i + 3] = Math.round(d[i + 3] * alpha);
      }
    }
    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL('image/png');
  }, logoDataUrl);

  fs.writeFileSync(
    path.join(brandingDir, 'open-canteen-logo.png'),
    Buffer.from(logoPngData.split(',')[1], 'base64')
  );

  // 3. Generate transparent Standalone Icon (open-canteen-icon.png)
  const iconPngData = await page.evaluate(async (url) => {
    const img = new Image();
    img.src = url;
    await new Promise((r) => (img.onload = r));

    const pad = 36;
    const cropX = Math.max(0, 283 - pad);
    const cropY = Math.max(0, 272 - pad);
    const cropW = 972 - 283 + 1 + pad * 2;
    const cropH = 966 - 272 + 1 + pad * 2;
    const size = Math.max(cropW, cropH);

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const offsetX = (size - cropW) / 2;
    const offsetY = (size - cropH) / 2;
    ctx.drawImage(img, cropX, cropY, cropW, cropH, offsetX, offsetY, cropW, cropH);

    const imgData = ctx.getImageData(0, 0, size, size);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i],
        g = d[i + 1],
        b = d[i + 2];
      const distFromWhite = Math.sqrt((255 - r) ** 2 + (255 - g) ** 2 + (255 - b) ** 2);
      if (distFromWhite < 18) {
        d[i + 3] = 0;
      } else if (distFromWhite < 45) {
        const alpha = (distFromWhite - 18) / (45 - 18);
        d[i + 3] = Math.round(d[i + 3] * alpha);
      }
    }
    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL('image/png');
  }, iconDataUrl);

  fs.writeFileSync(
    path.join(brandingDir, 'open-canteen-icon.png'),
    Buffer.from(iconPngData.split(',')[1], 'base64')
  );

  // 4. Generate App Icon (open-canteen-app-icon.png) & PWA 512x512
  const appPng512 = await page.evaluate(
    async ({ url, targetSize }) => {
      const img = new Image();
      img.src = url;
      await new Promise((r) => (img.onload = r));

      const canvas = document.createElement('canvas');
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const pad = 12;
      const cropX = Math.max(0, 217 - pad);
      const cropY = Math.max(0, 222 - pad);
      const cropW = 1036 - 217 + 1 + pad * 2;
      const cropH = 1043 - 222 + 1 + pad * 2;

      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, targetSize, targetSize);
      return canvas.toDataURL('image/png');
    },
    { url: appDataUrl, targetSize: 512 }
  );

  fs.writeFileSync(
    path.join(brandingDir, 'open-canteen-app-icon.png'),
    Buffer.from(appPng512.split(',')[1], 'base64')
  );
  fs.writeFileSync(
    path.join(neutralDir, 'pwa-512x512.png'),
    Buffer.from(appPng512.split(',')[1], 'base64')
  );

  // 5. Generate 192x192 PWA Icon
  const appPng192 = await page.evaluate(
    async ({ url, targetSize }) => {
      const img = new Image();
      img.src = url;
      await new Promise((r) => (img.onload = r));

      const canvas = document.createElement('canvas');
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const pad = 12;
      const cropX = Math.max(0, 217 - pad);
      const cropY = Math.max(0, 222 - pad);
      const cropW = 1036 - 217 + 1 + pad * 2;
      const cropH = 1043 - 222 + 1 + pad * 2;
      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, targetSize, targetSize);
      return canvas.toDataURL('image/png');
    },
    { url: appDataUrl, targetSize: 192 }
  );

  fs.writeFileSync(
    path.join(brandingDir, 'open-canteen-app-icon-192.png'),
    Buffer.from(appPng192.split(',')[1], 'base64')
  );
  fs.writeFileSync(
    path.join(neutralDir, 'pwa-192x192.png'),
    Buffer.from(appPng192.split(',')[1], 'base64')
  );

  // 6. Generate 180x180 Apple Touch Icon
  const appleTouchPng = await page.evaluate(
    async ({ url, targetSize }) => {
      const img = new Image();
      img.src = url;
      await new Promise((r) => (img.onload = r));

      const canvas = document.createElement('canvas');
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const pad = 12;
      const cropX = Math.max(0, 217 - pad);
      const cropY = Math.max(0, 222 - pad);
      const cropW = 1036 - 217 + 1 + pad * 2;
      const cropH = 1043 - 222 + 1 + pad * 2;
      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, targetSize, targetSize);
      return canvas.toDataURL('image/png');
    },
    { url: appDataUrl, targetSize: 180 }
  );

  fs.writeFileSync(
    path.join(neutralDir, 'apple-touch-icon.png'),
    Buffer.from(appleTouchPng.split(',')[1], 'base64')
  );

  // 7. Generate 512x512 Maskable Icon (safe zone inside 80% circle)
  const appMaskable512 = await page.evaluate(
    async ({ url, targetSize }) => {
      const img = new Image();
      img.src = url;
      await new Promise((r) => (img.onload = r));

      const canvas = document.createElement('canvas');
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetSize, targetSize);

      const pad = targetSize * 0.12;
      const tileSize = targetSize - pad * 2;
      ctx.drawImage(img, 217, 222, 820, 822, pad, pad, tileSize, tileSize);
      return canvas.toDataURL('image/png');
    },
    { url: appDataUrl, targetSize: 512 }
  );

  fs.writeFileSync(
    path.join(neutralDir, 'pwa-maskable-512x512.png'),
    Buffer.from(appMaskable512.split(',')[1], 'base64')
  );

  // 8. Generate 32x32 Favicon
  const favicon32 = await page.evaluate(
    async ({ url, targetSize }) => {
      const img = new Image();
      img.src = url;
      await new Promise((r) => (img.onload = r));

      const canvas = document.createElement('canvas');
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const pad = 12;
      const cropX = Math.max(0, 217 - pad);
      const cropY = Math.max(0, 222 - pad);
      const cropW = 1036 - 217 + 1 + pad * 2;
      const cropH = 1043 - 222 + 1 + pad * 2;
      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, targetSize, targetSize);
      return canvas.toDataURL('image/png');
    },
    { url: appDataUrl, targetSize: 32 }
  );

  fs.writeFileSync(
    path.join(neutralDir, 'favicon.ico'),
    Buffer.from(favicon32.split(',')[1], 'base64')
  );

  // 9. Generate Vector SVGs
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <filter id="ocShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#1C6943" flood-opacity="0.15"/>
    </filter>
  </defs>
  <rect width="512" height="512" rx="112" fill="#FFFFFF" filter="url(#ocShadow)"/>
  <image href="${iconPngData}" x="64" y="64" width="384" height="384" preserveAspectRatio="xMidYMid meet"/>
</svg>`;

  fs.writeFileSync(path.join(neutralDir, 'icon.svg'), svgContent, 'utf-8');
  fs.writeFileSync(path.join(brandingDir, 'open-canteen-icon.svg'), svgContent, 'utf-8');

  const logoSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1318 301" width="1318" height="301">
  <image href="${logoPngData}" x="0" y="0" width="1318" height="301" preserveAspectRatio="xMidYMid meet"/>
</svg>`;
  fs.writeFileSync(path.join(brandingDir, 'open-canteen-logo.svg'), logoSvgContent, 'utf-8');

  console.log('Open Canteen branding assets and PWA icons generated successfully!');
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
