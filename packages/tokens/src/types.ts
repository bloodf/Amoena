export type ThemeMode = "dark" | "light";

export type TokenScale = Record<string, string>;

export interface ThemeTokenGroup {
  dark: TokenScale;
  light: TokenScale;
}

export interface SemanticTokenMap {
  [category: string]: Record<string, string>;
}

export interface FontSizeEntry {
  size: string;
  lineHeight: string;
  letterSpacing: string;
}

export interface CssVariableOptions {
  prefix?: string;
}

export interface AmoenaThemeTokens {
  colors: ThemeTokenGroup;
  typography: {
    fontFamily: Record<string, string>;
    fontWeight: Record<string, string>;
    fontSize: Record<string, FontSizeEntry>;
  };
  spacing: Record<string, string>;
  radius: Record<string, string>;
  shadows: { light: Record<string, string>; dark: Record<string, string> };
  zIndex: Record<string, string>;
  borderWidth: Record<string, string>;
  opacity: Record<string, string>;
  transitions: Record<string, string>;
  motion: {
    duration: Record<string, string>;
    easing: Record<string, string>;
    keyframes: Record<string, string>;
  };
}
