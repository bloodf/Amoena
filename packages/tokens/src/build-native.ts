import type { AmoenaThemeTokens } from "./types";

/** Returns true when a value looks like a bare HSL triplet (e.g. "270 7% 7%"). */
function isHslValue(value: string): boolean {
  return /^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/.test(value.trim());
}

/** Converts a bare HSL string ("H S% L%") to a hex color ("#rrggbb"). */
export function hslToHex(hslString: string): string {
  const parts = hslString.trim().split(/\s+/);
  const h = parseFloat(parts[0]);
  const s = parseFloat(parts[1]) / 100;
  const l = parseFloat(parts[2]) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  const hex = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

function kebabToCamel(str: string): string {
  return str.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

function nativeKey(prefix: string, key: string): string {
  if (key === "DEFAULT") return prefix;
  const clean = key.replace(/\./g, "_");
  const camel = kebabToCamel(clean);
  const cap = camel.charAt(0).toUpperCase() + camel.slice(1);
  return prefix + cap;
}

function parseDimension(value: string): number {
  if (value.endsWith("rem")) return Math.round(parseFloat(value) * 16 * 100) / 100;
  if (value.endsWith("px")) return parseFloat(value);
  if (value.endsWith("ms")) return parseFloat(value);
  return parseFloat(value);
}

function isDimension(value: string): boolean {
  return /^-?\d+(\.\d+)?(px|rem)$/.test(value.trim());
}

/**
 * Converts all tokens into a flat key-value map suitable for React Native.
 * HSL color strings are converted to hex; dimensions are converted to numbers.
 * Dark mode colors use the `color` prefix; light mode uses `colorLight`.
 */
export function buildNativeTokens(
  tokens: AmoenaThemeTokens,
): Record<string, string | number> {
  const result: Record<string, string | number> = {};

  // Colors — dark (default)
  for (const [key, value] of Object.entries(tokens.colors.dark)) {
    if (isHslValue(value)) {
      result[nativeKey("color", key)] = hslToHex(value);
    } else if (isDimension(value)) {
      result[nativeKey("color", key)] = parseDimension(value);
    } else {
      result[nativeKey("color", key)] = value;
    }
  }

  // Colors — light
  for (const [key, value] of Object.entries(tokens.colors.light)) {
    if (isHslValue(value)) {
      result[nativeKey("colorLight", key)] = hslToHex(value);
    } else if (isDimension(value)) {
      result[nativeKey("colorLight", key)] = parseDimension(value);
    } else {
      result[nativeKey("colorLight", key)] = value;
    }
  }

  // Spacing
  for (const [key, value] of Object.entries(tokens.spacing)) {
    result[nativeKey("spacing", key)] = parseDimension(value);
  }

  // Radius
  for (const [key, value] of Object.entries(tokens.radius)) {
    result[nativeKey("radius", key)] = parseDimension(value);
  }

  // Shadows — dark (default)
  for (const [key, value] of Object.entries(tokens.shadows.dark)) {
    result[nativeKey("shadow", key)] = value;
  }

  // Shadows — light
  for (const [key, value] of Object.entries(tokens.shadows.light)) {
    result[nativeKey("shadowLight", key)] = value;
  }

  // Z-Index
  for (const [key, value] of Object.entries(tokens.zIndex)) {
    result[nativeKey("zIndex", key)] = parseInt(value, 10);
  }

  // Border Width
  for (const [key, value] of Object.entries(tokens.borderWidth)) {
    result[nativeKey("borderWidth", key)] = parseDimension(value);
  }

  // Opacity
  for (const [key, value] of Object.entries(tokens.opacity)) {
    result[nativeKey("opacity", key)] = parseFloat(value);
  }

  // Transitions
  for (const [key, value] of Object.entries(tokens.transitions)) {
    result[nativeKey("transition", key)] = value;
  }

  // Typography — font family
  for (const [key, value] of Object.entries(tokens.typography.fontFamily)) {
    result[nativeKey("fontFamily", key)] = value;
  }

  // Typography — font weight
  for (const [key, value] of Object.entries(tokens.typography.fontWeight)) {
    result[nativeKey("fontWeight", key)] = parseInt(value, 10);
  }

  // Typography — font size (expanded)
  for (const [key, entry] of Object.entries(tokens.typography.fontSize)) {
    result[nativeKey("fontSize", key)] = parseDimension(entry.size);
    result[nativeKey("lineHeight", key)] = parseDimension(entry.lineHeight);
    result[nativeKey("letterSpacing", key)] = entry.letterSpacing;
  }

  // Motion — duration
  for (const [key, value] of Object.entries(tokens.motion.duration)) {
    result[nativeKey("duration", key)] = parseDimension(value);
  }

  // Motion — easing
  for (const [key, value] of Object.entries(tokens.motion.easing)) {
    result[nativeKey("easing", key)] = value;
  }

  return result;
}
