const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Prevent Metro watcher from crashing on pnpm temp dirs like ws_tmp_XXXX and from watching api's server-only ws
// https://github.com/expo/expo/issues/27881
config.watchFolders = [path.resolve(__dirname, "../../")];
config.resolver = config.resolver || {};
config.resolver.blockList = [
  /.*\/\.pnpm\/ws_tmp_.*/,
  /.*\/apps\/api\/node_modules\/ws\/.*/,
  /.*\/apps\/api\/.*/,
];
config.watcher = {
  ...(config.watcher || {}),
  healthCheck: { enabled: true },
};

module.exports = withNativeWind(config, {
  input: path.resolve(__dirname, "global.css"),
  configPath: path.resolve(__dirname, "tailwind.config.js"),
  typescriptEnvPath: path.resolve(__dirname, "nativewind-env.d.ts"),
});
