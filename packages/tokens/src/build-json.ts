import type { AmoenaThemeTokens } from "./types";

interface DTCGToken {
  $value: string | number;
  $type: string;
}

interface DTCGGroup {
  [key: string]: DTCGToken | DTCGGroup;
}

function token(value: string | number, type: string): DTCGToken {
  return { $value: value, $type: type };
}

function mapToGroup(
  entries: Record<string, string>,
  type: string,
  transform?: (v: string) => string,
): DTCGGroup {
  const group: DTCGGroup = {};
  for (const [key, value] of Object.entries(entries)) {
    group[key] = token(transform ? transform(value) : value, type);
  }
  return group;
}

function isHslValue(value: string): boolean {
  return /^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/.test(value.trim());
}

/** Wraps a bare HSL triplet in the `hsl()` CSS function for DTCG output. */
function toHslFunction(value: string): string {
  if (!isHslValue(value)) return value;
  const parts = value.trim().split(/\s+/);
  return `hsl(${parts[0]}, ${parts[1]}, ${parts[2]})`;
}

/**
 * Maps color theme tokens to DTCG entries, using "color" for HSL values
 * and "dimension" for non-color values mixed into the theme group (e.g. radius).
 */
function mapColorGroup(entries: Record<string, string>): DTCGGroup {
  const group: DTCGGroup = {};
  for (const [key, value] of Object.entries(entries)) {
    if (isHslValue(value)) {
      group[key] = token(toHslFunction(value), "color");
    } else {
      group[key] = token(value, "dimension");
    }
  }
  return group;
}

/**
 * Generates a Design Tokens Community Group (DTCG) formatted object
 * suitable for Figma / design-tool sync.
 */
export function buildDesignTokensJSON(tokens: AmoenaThemeTokens): DTCGGroup {
  const output: DTCGGroup = {};

  // Colors (light / dark)
  output.color = {
    dark: mapColorGroup(tokens.colors.dark),
    light: mapColorGroup(tokens.colors.light),
  };

  // Spacing
  output.spacing = mapToGroup(tokens.spacing, "dimension");

  // Radius
  output.radius = mapToGroup(tokens.radius, "dimension");

  // Shadows (light / dark)
  output.shadow = {
    dark: mapToGroup(tokens.shadows.dark, "shadow"),
    light: mapToGroup(tokens.shadows.light, "shadow"),
  };

  // Z-Index
  output.zIndex = mapToGroup(tokens.zIndex, "number");

  // Border Width
  output.borderWidth = mapToGroup(tokens.borderWidth, "dimension");

  // Opacity
  output.opacity = mapToGroup(tokens.opacity, "number");

  // Transitions
  output.transition = mapToGroup(tokens.transitions, "transition");

  // Typography
  const fontSizeGroup: DTCGGroup = {};
  for (const [key, entry] of Object.entries(tokens.typography.fontSize)) {
    fontSizeGroup[key] = {
      size: token(entry.size, "dimension"),
      lineHeight: token(entry.lineHeight, "dimension"),
      letterSpacing: token(entry.letterSpacing, "dimension"),
    };
  }

  output.typography = {
    fontFamily: mapToGroup(tokens.typography.fontFamily, "fontFamily"),
    fontWeight: mapToGroup(tokens.typography.fontWeight, "fontWeight"),
    fontSize: fontSizeGroup,
  };

  // Motion
  output.motion = {
    duration: mapToGroup(tokens.motion.duration, "duration"),
    easing: mapToGroup(tokens.motion.easing, "cubicBezier"),
    keyframes: mapToGroup(tokens.motion.keyframes, "other"),
  };

  return output;
}
