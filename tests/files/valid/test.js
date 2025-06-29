#!/usr/bin/env node
const fs = require('fs');
console.log('Hello from JavaScript script');
fs.mkdirSync('test-dir', { recursive: true });
console.log('Script completed');