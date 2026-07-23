// apps/web pins an exact react-dom version that Next.js requires, which
// differs from whatever npm hoists to the workspace root (apps/mobile, via
// Expo, needs a different react-dom) — so npm correctly keeps `next` nested
// under apps/web/node_modules rather than hoisting it. But the hoisted,
// root-level eslint-config-next does a plain Node
// require("next/dist/compiled/babel/eslint-parser") from
// node_modules/eslint-config-next/dist/parser.js, and Node's CJS resolution
// only walks upward through ancestor node_modules directories — it never
// reaches sideways into apps/web/node_modules. Without this link, any
// `eslint`/`next lint` run crashes immediately with "Cannot find module
// 'next/dist/compiled/babel/eslint-parser'". A directory junction at the
// root pointing at the real nested package fixes this without disturbing
// the exact-version pin — same approach as link-expo-router.js.
// See context/progress-tracker.md, feature 19, for the full investigation.
const fs = require("fs");
const path = require("path");

const target = path.join(__dirname, "..", "apps", "web", "node_modules", "next");
const linkPath = path.join(__dirname, "..", "node_modules", "next");

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
console.log("[postinstall] linked node_modules/next -> apps/web/node_modules/next");
