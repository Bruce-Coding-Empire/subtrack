const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Let Metro see the hoisted root node_modules, not just apps/mobile's own
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// apps/mobile pins an exact react version for React Native, which differs
// from the react version apps/web needs — npm nests a separate react copy
// under apps/mobile/node_modules instead of hoisting a single copy to the
// workspace root. Packages hoisted to the root (e.g. @react-navigation,
// react-native-css-interop) resolve require("react") to the root's copy
// via Metro's normal node_modules walk, while app code (and "react/jsx-
// runtime", used by every file's JSX transform) resolves to the nested
// one — two live React instances, "Invalid hook call" at runtime. Force
// every "react" and "react/*" require in the graph through the nested
// copy by resolving it up front and handing Metro the absolute path,
// which bypasses package resolution entirely.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "react" || moduleName.startsWith("react/")) {
    const resolved = require.resolve(moduleName, { paths: [projectRoot] });
    return context.resolveRequest(context, resolved, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });
