'use strict';
const fs = require('fs');
const path = require('path');

let errors = 0;
let checked = 0;

function checkDir(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const full = path.join(dir, f.name);
    if (f.isDirectory() && f.name !== 'node_modules' && f.name !== 'prisma' && f.name !== 'scripts') {
      checkDir(full);
    } else if (f.isFile() && f.name.endsWith('.js') && f.name !== 'server.js') {
      try {
        checked++;
        require(full);
      } catch (err) {
        errors++;
        console.error(`[FAIL] ${path.relative(__dirname, full)}: ${err.message}`);
      }
    }
  }
}

console.log('Validating backend modules...');
checkDir(path.resolve(__dirname, '..'));
console.log(`Checked ${checked} files. Errors found: ${errors}`);
if (errors > 0) process.exit(1);
