const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'dist');
const publicDir = path.join(root, 'public');
const indexPath = path.join(distDir, 'index.html');

for (const fileName of ['icon.png', 'manifest.webmanifest', 'service-worker.js']) {
  fs.copyFileSync(path.join(publicDir, fileName), path.join(distDir, fileName));
}

let html = fs.readFileSync(indexPath, 'utf8');

const headTags = [
  '<meta name="theme-color" content="#D64535" />',
  '<meta name="apple-mobile-web-app-capable" content="yes" />',
  '<meta name="apple-mobile-web-app-title" content="بيتزا الفرن" />',
  '<link rel="manifest" href="/manifest.webmanifest" />',
  '<link rel="apple-touch-icon" href="/icon.png" />',
];

const missingTags = headTags.filter((tag) => !html.includes(tag));

if (missingTags.length > 0) {
  html = html.replace('</head>', `  ${missingTags.join('\n  ')}\n</head>`);
  fs.writeFileSync(indexPath, html);
}
