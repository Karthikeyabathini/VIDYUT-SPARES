const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generateLogos() {
  const publicDir = path.join(__dirname, '..', 'public');
  const appDir = path.join(__dirname, '..', 'src', 'app');
  const svgPath = path.join(publicDir, 'vs-logo.svg');

  console.log('Reading SVG from:', svgPath);
  const svgBuffer = fs.readFileSync(svgPath);

  // Generate vs-logo.png (high-res transparent / clean PNG)
  await sharp(svgBuffer)
    .resize(1000, 640)
    .png()
    .toFile(path.join(publicDir, 'vs-logo.png'));
  console.log('Generated vs-logo.png');

  // Generate vs-logo.jpeg (matching existing reference)
  await sharp(svgBuffer)
    .resize(1000, 640)
    .jpeg({ quality: 95 })
    .toFile(path.join(publicDir, 'vs-logo.jpeg'));
  console.log('Generated vs-logo.jpeg');

  // Generate app icon.png for favicon
  await sharp(svgBuffer)
    .resize(512, 512, { fit: 'contain', background: { r: 15, g: 44, b: 89, alpha: 0 } })
    .png()
    .toFile(path.join(appDir, 'icon.png'));
  console.log('Generated icon.png for Next.js app');
}

generateLogos().catch(console.error);
