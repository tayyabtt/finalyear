const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const exclusionList = require('metro-config/src/defaults/exclusionList');

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.sourceExts.push('cjs');
defaultConfig.resolver.unstable_enablePackageExports = false;

// Exclude admin panel from bundling - AGGRESSIVE BLOCKING
defaultConfig.resolver.blockList = exclusionList([
  // Block entire admin panel directory
  /app\/\(tabs\)\/shaadiset-admin-panel\/.*/,
  /.*\/shaadiset-admin-panel\/.*/,
  
  // Block all admin panel files
  /.*shaadiset-admin-panel.*/,
  
  // Block node_modules inside admin panel
  /.*shaadiset-admin-panel\/node_modules\/.*/,
  
  // Block build files
  /.*shaadiset-admin-panel\/build\/.*/,
  /.*shaadiset-admin-panel\/\.git\/.*/,
]);

module.exports = defaultConfig;  