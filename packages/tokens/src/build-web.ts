import type { AmoenaThemeTokens } from "./types";

function varLine(prefix: string, key: string, value: string): string {
  let name: string;
  if (key === "DEFAULT") {
    name = `--${prefix}`;
  } else if (prefix) {
    name = `--${prefix}-${key.replace(/\./g, "_")}`;
  } else {
    name = `--${key}`;
  }
  return `  ${name}: ${value};`;
}

function section(
  comment: string,
  prefix: string,
  entries: Record<string, string>,
): string[] {
  const lines: string[] = [`  /* ${comment} */`];
  for (const [key, value] of Object.entries(entries)) {
    lines.push(varLine(prefix, key, value));
  }
  return lines;
}

/**
 * Generates a CSS string of custom properties from all token groups.
 * Dark mode colors are the `:root` default; light mode overrides live under `.light`.
 */
export function buildWebCSS(tokens: AmoenaThemeTokens): string {
  const rootLines: string[] = [];
  const lightLines: string[] = [];

  // Theme colors
  rootLines.push(...section("Theme colors (dark)", "", tokens.colors.dark));
  rootLines.push("");
  lightLines.push(...section("Theme colors (light)", "", tokens.colors.light));
  lightLines.push("");

  // Shadows (mode-dependent)
  rootLines.push(
    ...section("Shadows (dark)", "shadow", tokens.shadows.dark),
  );
  rootLines.push("");
  lightLines.push(
    ...section("Shadows (light)", "shadow", tokens.shadows.light),
  );

  // Spacing
  rootLines.push(...section("Spacing", "spacing", tokens.spacing));
  rootLines.push("");

  // Radius
  rootLines.push(...section("Radius", "radius", tokens.radius));
  rootLines.push("");

  // Z-Index
  rootLines.push(...section("Z-Index", "z", tokens.zIndex));
  rootLines.push("");

  // Border width
  rootLines.push(
    ...section("Border width", "border-width", tokens.borderWidth),
  );
  rootLines.push("");

  // Opacity
  rootLines.push(...section("Opacity", "opacity", tokens.opacity));
  rootLines.push("");

  // Transitions
  rootLines.push(
    ...section("Transitions", "transition", tokens.transitions),
  );
  rootLines.push("");

  // Typography
  rootLines.push(
    ...section("Font family", "font-family", tokens.typography.fontFamily),
  );
  rootLines.push("");
  rootLines.push(
    ...section("Font weight", "font-weight", tokens.typography.fontWeight),
  );
  rootLines.push("");

  const fontSizeLines: string[] = ["  /* Font size */"];
  for (const [key, entry] of Object.entries(tokens.typography.fontSize)) {
    fontSizeLines.push(varLine("font-size", key, entry.size));
    fontSizeLines.push(varLine("line-height", key, entry.lineHeight));
    fontSizeLines.push(varLine("letter-spacing", key, entry.letterSpacing));
  }
  rootLines.push(...fontSizeLines);
  rootLines.push("");

  // Motion
  rootLines.push(
    ...section("Duration", "duration", tokens.motion.duration),
  );
  rootLines.push("");
  rootLines.push(...section("Easing", "easing", tokens.motion.easing));

  return [
    "/* @lunaria/tokens — auto-generated, do not edit */",
    "",
    `:root {`,
    rootLines.join("\n"),
    `}`,
    "",
    `.light {`,
    lightLines.join("\n"),
    `}`,
    "",
  ].join("\n");
}
