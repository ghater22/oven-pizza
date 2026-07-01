// يولّد أصول الأيقونات (icon/adaptive-icon/favicon/splash) من design/logo.svg.
// شغّله عبر `npm run icons` بعد أي تعديل على الشعار المصدري.
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const svgPath = path.join(ROOT, 'design', 'logo.svg');
const assetsDir = path.join(ROOT, 'assets');

const CREAM = '#FFF8F1';
const RED = '#D64535';

async function renderLogoOnTransparent(size, marginRatio) {
  const inner = Math.round(size * (1 - marginRatio * 2));
  const logoBuf = await sharp(svgPath).resize(inner, inner).png().toBuffer();
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: logoBuf, gravity: 'center' }])
    .png()
    .toBuffer();
}

async function main() {
  const iconTransparent = await renderLogoOnTransparent(1024, 0.12);
  await sharp({
    create: { width: 1024, height: 1024, channels: 4, background: CREAM },
  })
    .composite([{ input: iconTransparent }])
    .png()
    .toFile(path.join(assetsDir, 'icon.png'));

  const foreground = await renderLogoOnTransparent(1024, 0.22);
  fs.writeFileSync(path.join(assetsDir, 'android-icon-foreground.png'), foreground);

  await sharp({
    create: { width: 1024, height: 1024, channels: 4, background: RED },
  })
    .png()
    .toFile(path.join(assetsDir, 'android-icon-background.png'));

  const alpha = await sharp(foreground).ensureAlpha().extractChannel('alpha').raw().toBuffer();
  const white = await sharp({
    create: { width: 1024, height: 1024, channels: 3, background: { r: 255, g: 255, b: 255 } },
  })
    .raw()
    .toBuffer();
  await sharp(white, { raw: { width: 1024, height: 1024, channels: 3 } })
    .joinChannel(alpha, { raw: { width: 1024, height: 1024, channels: 1 } })
    .png()
    .toFile(path.join(assetsDir, 'android-icon-monochrome.png'));

  const faviconTransparent = await renderLogoOnTransparent(48, 0.1);
  await sharp({
    create: { width: 48, height: 48, channels: 4, background: CREAM },
  })
    .composite([{ input: faviconTransparent }])
    .png()
    .toFile(path.join(assetsDir, 'favicon.png'));

  const splash = await renderLogoOnTransparent(1024, 0.28);
  fs.writeFileSync(path.join(assetsDir, 'splash-icon.png'), splash);

  console.log('تم توليد جميع الأيقونات بنجاح');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
