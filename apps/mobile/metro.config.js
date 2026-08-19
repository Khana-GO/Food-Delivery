const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  input: path.resolve(__dirname, "global.css"),
  configPath: path.resolve(__dirname, "tailwind.config.js"),
  typescriptEnvPath: path.resolve(__dirname, "nativewind-env.d.ts"),
});
