const path = require('node:path');
const ts = require('typescript');

console.log('TypeScript version:', ts.version);
console.log('TypeScript path:', path.dirname(require.resolve('typescript')));
