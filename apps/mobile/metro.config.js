const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
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
// Removing blockList as it breaks pnpm module resolution for symlinks like react-native-css-interop

module.exports = withNativeWind(config, { input: './src/global.css' });