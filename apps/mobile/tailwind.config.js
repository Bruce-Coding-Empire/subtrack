/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Inter ships as separate static weight files (no variable font), so
      // React Native needs a distinct fontFamily per weight rather than the
      // web's single --font-sans + font-weight utility approach.
      fontFamily: {
        sans: ["Inter_400Regular"],
        "sans-medium": ["Inter_500Medium"],
        "sans-semibold": ["Inter_600SemiBold"],
        "sans-bold": ["Inter_700Bold"],
      },
      colors: {
        background: "#f6f8f7",
        surface: "#ffffff",
        "surface-secondary": "#f9fafb",
        border: "#e5ebe8",
        "text-primary": "#10241e",
        "text-secondary": "#5c6b65",
        "text-muted": "#94a39c",
        accent: "#0f9d78",
        "accent-dark": "#0b7a5c",
        "accent-light": "#e3f6ee",
        "accent-foreground": "#ffffff",
        success: "#16a34a",
        "success-light": "#dcfce7",
        warning: "#f59e0b",
        "warning-light": "#fef3c7",
        error: "#ef4444",
        "error-light": "#fee2e2",
        info: "#3b82f6",
        "info-light": "#dbeafe",
        "category-entertainment": "#0f9d78",
        "category-software": "#3b82f6",
        "category-fitness": "#f59e0b",
        "category-utilities": "#8b5cf6",
        "category-other": "#94a39c",
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        full: "9999px",
      },
    },
  },
  plugins: [],
};
