// CommonJS resolver for Jest
const path = require('path');
const fs = require('fs');

module.exports = (request, options) => {
  // For TypeScript ES modules, resolve .js imports to .ts files
  if (request.endsWith('.js')) {
    const tsFile = request.replace(/\.js$/, '.ts');
    const fullTsPath = path.resolve(options.basedir, tsFile);
    
    // Only resolve to .ts if the .ts file exists and we're in our source code (not node_modules)
    if (fs.existsSync(fullTsPath) && !options.basedir.includes('node_modules')) {
      return fullTsPath;
    }
  }
  
  // Default Jest resolver
  return options.defaultResolver(request, options);
};