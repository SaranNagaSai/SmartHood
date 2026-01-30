import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd());
const src = path.join(root, 'Memory', 'Address.csv');
const destDir = path.join(root, 'public', 'memory');
const dest = path.join(destDir, 'Address.csv');

function ensure() {
  if (!fs.existsSync(src)) {
    console.warn(`[ensure-address-csv] Source not found: ${src}`);
    process.exit(0);
  }

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const srcStat = fs.statSync(src);

  if (fs.existsSync(dest)) {
    const destStat = fs.statSync(dest);
    // If destination exists and matches size, assume it's fine.
    if (destStat.size === srcStat.size) {
      return;
    }
  }

  fs.copyFileSync(src, dest);
  console.log(`[ensure-address-csv] Copied Address.csv to ${dest}`);
}

ensure();
