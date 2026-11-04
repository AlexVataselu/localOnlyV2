import { DefaultTheme } from "styled-components";

export const lightTheme: DefaultTheme = {
  colors: {
    background: "#ffffff",
    surface: "#f7f7f9",
    textPrimary: "#1f1f1f",
    textSecondary: "#5f5f70",
    accent: "#E2A506",
    accentHover: "#c89505",
    onAccent: "#1f1f1f",
    border: "#e0e0e6",
    cardBackground: "#ffffff",
    /** Accent for text/links on light surfaces: #E2A506 is only 2.2:1 on white. */
    accentText: "#8a6100",
    /** Translucent card fill + edge that read on the light page. */
    glass: "rgba(255, 255, 255, 0.85)",
    glassBorder: "rgba(31, 31, 31, 0.10)",
    focus: "#1f1f1f",
  },
  shadows: {
    card: "0 4px 16px rgba(0, 0, 0, 0.08)",
    cardHover: "0 8px 24px rgba(0, 0, 0, 0.16)",
  },
};

export const darkTheme: DefaultTheme = {
  colors: {
    background: "#0f1116",
    surface: "#1a1d24",
    textPrimary: "#f5f5f5",
    textSecondary: "#c4c7d0",
    accent: "#E2A506",
    accentHover: "#f5b815",
    onAccent: "#0f1116",
    border: "#2d313a",
    cardBackground: "#1c1f26",
    accentText: "#E2A506",
    glass: "rgba(255, 255, 255, 0.08)",
    glassBorder: "rgba(255, 255, 255, 0.2)",
    focus: "#E2A506",
  },
  shadows: {
    card: "0 4px 16px rgba(0, 0, 0, 0.4)",
    cardHover: "0 8px 24px rgba(0, 0, 0, 0.55)",
  },
};

