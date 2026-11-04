import type { DefaultTheme } from "styled-components";

/**
 * Design tokens. Every colour in a component should come from here; literal
 * rgba(255,255,255,…) values assume a dark page and break the light theme.
 *
 * `onImage*` tokens are for text and controls sitting on top of photography
 * (the hero). They stay light in both themes because the photo stays dark.
 */

const accent = "#E2A506";
const onImage = {
  onImage: "#ffffff",
  onImageMuted: "rgba(255, 255, 255, 0.85)",
  onImageBorder: "rgba(255, 255, 255, 0.55)",
  onImageSurface: "rgba(10, 12, 16, 0.45)",
  onImageSurfaceHover: "rgba(10, 12, 16, 0.65)",
};

export const lightTheme: DefaultTheme = {
  mode: "light",
  colors: {
    background: "#fbfaf7",
    surface: "#f1efe9",
    surfaceRaised: "#ffffff",
    glass: "rgba(255, 255, 255, 0.72)",
    glassHover: "rgba(255, 255, 255, 0.9)",
    glassBorder: "rgba(31, 31, 31, 0.10)",
    headerBg: "rgba(251, 250, 247, 0.82)",
    textPrimary: "#1c1c1f",
    textSecondary: "#56565f",
    accent,
    /** Accent dark enough for text on light backgrounds (4.5:1 on #fbfaf7). */
    accentText: "#8a6100",
    accentHover: "#c89505",
    onAccent: "#1c1c1f",
    border: "#dedbd2",
    focus: "#1c1c1f",
    star: "#b87f00",
    danger: "#b3261e",
    dangerSurface: "#fdecea",
    ...onImage,
  },
  shadows: {
    card: "0 4px 16px rgba(28, 28, 31, 0.08)",
    cardHover: "0 10px 28px rgba(28, 28, 31, 0.14)",
  },
};

export const darkTheme: DefaultTheme = {
  mode: "dark",
  colors: {
    background: "#0f1116",
    surface: "#1a1d24",
    surfaceRaised: "#21252e",
    glass: "rgba(255, 255, 255, 0.06)",
    glassHover: "rgba(255, 255, 255, 0.10)",
    glassBorder: "rgba(255, 255, 255, 0.14)",
    headerBg: "rgba(15, 17, 22, 0.78)",
    textPrimary: "#f5f5f5",
    textSecondary: "#c4c7d0",
    accent,
    accentText: accent,
    accentHover: "#f5b815",
    onAccent: "#0f1116",
    border: "#2d313a",
    focus: accent,
    star: "#f5b815",
    danger: "#ff8a80",
    dangerSurface: "rgba(255, 138, 128, 0.12)",
    ...onImage,
  },
  shadows: {
    card: "0 4px 16px rgba(0, 0, 0, 0.4)",
    cardHover: "0 10px 28px rgba(0, 0, 0, 0.55)",
  },
};
