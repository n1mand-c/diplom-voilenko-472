const fs = require('fs');
const path = require('path');
const dir = path.join(process.env.APPDATA, 'Code', 'User', 'History');
let count = 0;
fs.readdirSync(dir).forEach(d => {
  try {
    const p = path.join(dir, d, 'entries.json');
    if (fs.existsSync(p)) {
      const j = JSON.parse(fs.readFileSync(p, 'utf8'));
      if (j.resource && j.resource.includes('red-bull-hotel22')) {
        console.log(j.resource);
        count++;
        if (j.resource.includes('admin') && j.resource.includes('page.tsx')) {
           console.log("FOUND ADMIN PAGE: ", p);
           console.log("ENTRIES: ", j.entries);
        }
      }
    }
  } catch(e) {}
});
console.log('Total files found:', count);
