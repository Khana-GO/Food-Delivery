const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);
const workspaceRoot = path.resolve(__dirname, "../..");

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
config.resolver.blockList = [
  new RegExp(`${workspaceRoot.replace(/\\/g, "/")}/node_modules/\\.pnpm/.*`),
];

module.exports = withNativeWind(config, {
  input: path.resolve(__dirname, "global.css"),
  configPath: path.resolve(__dirname, "tailwind.config.js"),
  typescriptEnvPath: path.resolve(__dirname, "nativewind-env.d.ts"),
});
