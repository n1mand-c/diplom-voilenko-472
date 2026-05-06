const fs = require('fs');
const path = require('path');

const historyDir = path.join(process.env.APPDATA, 'Code', 'User', 'History');
const targetFiles = [
  'admin/page.tsx',
  'my-bookings/page.tsx',
  'booking/page.tsx',
  'hotels/page.tsx',
  'api/admin/hotels/[id]/route.ts',
  'api/hotels/[id]/route.ts',
  'api/room-types/[id]/route.ts',
  'api/room-types/route.ts',
  'components/ui/date-picker.tsx',
  'components/ui/navbar.tsx',
  'scripts/init-db.mjs'
];

let bestMatches = {};

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      const entriesFile = path.join(fullPath, 'entries.json');
      if (fs.existsSync(entriesFile)) {
        try {
          const data = JSON.parse(fs.readFileSync(entriesFile, 'utf8'));
          if (data.resource && data.resource.includes('red-bull-hotel22')) {
            const decodedResource = decodeURIComponent(data.resource);
            for (const target of targetFiles) {
              if (decodedResource.replace(/\\/g, '/').endsWith(target.replace(/\\/g, '/'))) {
                const entries = data.entries || [];
                if (entries.length > 0) {
                  const latestEntry = entries[entries.length - 1];
                  const entryFile = path.join(fullPath, latestEntry.id);
                  if (fs.existsSync(entryFile)) {
                    if (!bestMatches[target] || bestMatches[target].timestamp < latestEntry.timestamp) {
                      bestMatches[target] = {
                        timestamp: latestEntry.timestamp,
                        file: entryFile,
                        resource: decodedResource
                      };
                    }
                  }
                }
              }
            }
          }
        } catch (e) {}
      }
    }
  }
}

scanDir(historyDir);

for (const target in bestMatches) {
  console.log(`\nTARGET: ${target}`);
  console.log(`BACKUP FILE: ${bestMatches[target].file}`);
  console.log(`TIME: ${new Date(bestMatches[target].timestamp).toISOString()}`);
  
  // Create a copy in scratch directory
  const outPath = path.join(__dirname, target.replace(/[\/\\]/g, '_'));
  fs.copyFileSync(bestMatches[target].file, outPath);
  console.log(`Copied to ${outPath}`);
}
