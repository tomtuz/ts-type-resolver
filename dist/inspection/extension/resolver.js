const path = require('node:path');
const ts = require('typescript');

const basePath = path.resolve(__dirname);

function resolveTypeScriptModule(moduleName, containingFile) {
  if (moduleName === 'typescript') {
    return path.resolve(basePath, 'node_modules', 'typescript');
  }
  return ts.resolveModuleName(moduleName, containingFile, {}, ts.sys).resolvedModule;
}

module.exports = { resolveTypeScriptModule };
