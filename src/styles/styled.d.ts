import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    mode: "light" | "dark";
    colors: {
      background: string;
      surface: string;
      surfaceRaised: string;
      glass: string;
      glassHover: string;
      glassBorder: string;
      headerBg: string;
      textPrimary: string;
      textSecondary: string;
      accent: string;
      accentText: string;
      accentHover: string;
      onAccent: string;
      border: string;
      focus: string;
      star: string;
      danger: string;
      dangerSurface: string;
      onImage: string;
      onImageMuted: string;
      onImageBorder: string;
      onImageSurface: string;
      onImageSurfaceHover: string;
    };
    shadows: {
      card: string;
      cardHover: string;
    };
  }
}
