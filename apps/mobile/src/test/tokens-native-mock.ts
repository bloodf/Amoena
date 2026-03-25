/**
 * Mock native tokens for vitest. Provides stub values for all token keys
 * used by mobile components so they can render in tests without building
 * the full tokens package.
 */
export const tokens: Record<string, string | number> = new Proxy(
  {} as Record<string, string | number>,
  {
    get(_target, prop: string) {
      // Color tokens return hex strings
      if (prop.startsWith("color")) return "#888888";
      // Spacing/radius/fontSize tokens return numbers
      if (prop.startsWith("spacing")) return 8;
      if (prop.startsWith("radius")) return 4;
      if (prop.startsWith("fontSize")) return 14;
      if (prop.startsWith("lineHeight")) return 20;
      if (prop.startsWith("fontWeight")) return 400;
      if (prop.startsWith("borderWidth")) return 1;
      if (prop.startsWith("opacity")) return 1;
      if (prop.startsWith("zIndex")) return 1;
      // Default
      return 0;
    },
  },
);

export type TokenKey = string;
