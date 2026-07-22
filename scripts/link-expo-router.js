// apps/mobile pins an exact react/react-dom version (React Native requires
// an exact match), which differs from whatever npm hoists to the workspace
// root — so npm correctly keeps expo-router (and react/react-dom/react-is)
// nested under apps/mobile/node_modules rather than hoisting them. But
// @expo/cli's own bundled @expo/router-server package does a plain Node
// require("expo-router/...") from deep inside the hoisted root
// node_modules, and Node's CJS resolution only walks upward through
// ancestor node_modules directories — it never reaches sideways into
// apps/mobile/node_modules. Without this link, `expo start` crashes on
// startup (typed-routes generation) and, even with that experiment
// disabled, continuously spams "Metro error: Cannot find module
// 'expo-router/...'" (the SSR route-manifest middleware). A directory
// junction at the root pointing at the real nested package fixes this
// without disturbing the exact-version pin: Node resolves through the
// junction to expo-router's real on-disk location, so its own nested
// dependencies (react-is@19, etc.) still resolve relative to itself, not
// the root. See context/progress-tracker.md, feature 14, for the full
// investigation.
const fs = require("fs");
const path = require("path");

const target = path.join(__dirname, "..", "apps", "mobile", "node_modules", "expo-router");
const linkPath = path.join(__dirname, "..", "node_modules", "expo-router");

if (!fs.existsSync(target)) {
  process.exit(0);
}

try {
  fs.lstatSync(linkPath);
  process.exit(0);
} catch {
  // Nothing at linkPath yet — proceed to create it.
}

fs.symlinkSync(target, linkPath, process.platform === "win32" ? "junction" : "dir");
console.log("[postinstall] linked node_modules/expo-router -> apps/mobile/node_modules/expo-router");
