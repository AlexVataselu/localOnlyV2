import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    colors: {
      background: string;
      surface: string;
      textPrimary: string;
      textSecondary: string;
      accent: string;
      accentHover: string;
      onAccent: string;
      border: string;
      cardBackground: string;
      accentText: string;
      glass: string;
      glassBorder: string;
      focus: string;
    };
    shadows: {
      card: string;
      cardHover: string;
    };
  }
}

