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
      /** Dark card fill used by the detail-page panels (What's included, booking) in both themes. */
      panel: string;
      onPanel: string;
      /** Secondary text on a panel; >= 4.5:1 on panel. */
      panelMuted: string;
      panelLine: string;
    };
    shadows: {
      card: string;
      cardHover: string;
    };
  }
}

