export interface ThemePalette {
  name: string;
  displayName: string;
  colors: {
    primary: string;
    primaryText: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
}