// Mirrors apps/mobile/tailwind.config.js's color tokens as plain values, for
// native props that can't take a NativeWind className (placeholderTextColor,
// react-native-chart-kit's chartConfig, etc.) — per ui-tokens.md, never
// hardcode a hex value directly in a component; reference these instead.
// Must stay in sync with tailwind.config.js and ui-tokens.md.
export const Colors = {
  background: "#f6f8f7",
  surface: "#ffffff",
  surfaceSecondary: "#f9fafb",
  border: "#e5ebe8",
  textPrimary: "#10241e",
  textSecondary: "#5c6b65",
  textMuted: "#94a39c",
  accent: "#0f9d78",
  accentDark: "#0b7a5c",
  accentLight: "#e3f6ee",
  accentForeground: "#ffffff",
  success: "#16a34a",
  successLight: "#dcfce7",
  warning: "#f59e0b",
  warningLight: "#fef3c7",
  error: "#ef4444",
  errorLight: "#fee2e2",
  info: "#3b82f6",
  infoLight: "#dbeafe",
  categoryEntertainment: "#0f9d78",
  categorySoftware: "#3b82f6",
  categoryFitness: "#f59e0b",
  categoryUtilities: "#8b5cf6",
  categoryOther: "#94a39c",
} as const;
