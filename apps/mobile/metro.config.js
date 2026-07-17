const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// 1. Find your project root and the workspace root
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 2. Explicitly watch the entire monorepo workspace folder
config.watchFolders = [workspaceRoot];

// 3. Force Metro to resolve modules via local and root node_modules paths
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 4. Block Metro from crawling nested, redundant .pnpm symlink tracks
config.resolver.blockList = [
  new RegExp(`${workspaceRoot.replace(/\\/g, '/')}\/node_modules\/\.pnpm\/.*`),
];

module.exports = config;