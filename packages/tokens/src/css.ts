import { lunariaThemeTokens } from "./lunaria-theme";
import type { CssVariableOptions, ThemeMode, TokenScale } from "./types";

export function toCssVariables(tokens: TokenScale, options: CssVariableOptions = {}): string {
  const prefix = options.prefix ? `${options.prefix}-` : "";
  return Object.entries(tokens)
    .map(([key, value]) => `--${prefix}${key}: ${value};`)
    .join("\n");
}

export function themeModeSelector(mode: ThemeMode): string {
  return mode === "dark" ? ":root" : ".light";
}

export function themeCssBlock(mode: ThemeMode, options: CssVariableOptions = {}): string {
  const selector = themeModeSelector(mode);
  return `${selector} {\n${toCssVariables(lunariaThemeTokens[mode], options)}\n}`;
}
