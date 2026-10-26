// Validate sprites-v2.js: every row must be exactly 16 chars, 16 rows, valid charset
const { MS } = require('./sprites-v2.js');

const CHARS = new Set(['0','1','2','3','4','5','6','.']);
let errors = 0;

if (!MS) { console.log('FATAL: MS not defined'); process.exit(1); }

for (let dex = 1; dex <= 100; dex++) {
  const g = MS[dex];
  if (!g) { console.log(`dex ${dex}: MISSING`); errors++; continue; }
  if (g.length !== 16) { console.log(`dex ${dex}: has ${g.length} rows (need 16)`); errors++; }
  g.forEach((r, i) => {
    if (r.length !== 16) { console.log(`dex ${dex} row ${i}: length ${r.length} "${r}"`); errors++; }
    for (const ch of r) if (!CHARS.has(ch)) { console.log(`dex ${dex} row ${i}: bad char "${ch}" in "${r}"`); errors++; }
  });
}
console.log(errors === 0 ? 'ALL 100 SPRITES VALID' : errors + ' ERRORS FOUND');
process.exit(errors === 0 ? 0 : 1);
