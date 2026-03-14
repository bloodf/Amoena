import { describe, expect, test } from "bun:test";

import {
  lovableMotionTokens,
  lovableThemeTokens,
  lovableTypographyTokens,
  lunariaBorderWidthTokens,
  lunariaMotionTokens,
  lunariaOpacityTokens,
  lunariaRadiusTokens,
  lunariaShadowTokens,
  lunariaSpacingTokens,
  lunariaThemeTokens,
  lunariaTokens,
  lunariaTransitionTokens,
  lunariaTypographyTokens,
  lunariaZIndexTokens,
  permissionStateTokens,
  providerIdentityTokens,
  rateLimitPressureTokens,
  stateTokens,
  statusBarTokens,
  themeCssBlock,
  themeModeSelector,
  toCssVariables,
  workspaceMergeStateTokens,
  buildWebCSS,
  buildNativeTokens,
  buildDesignTokensJSON,
  hslToHex,
} from "./index";

describe("@lunaria/tokens", () => {
  test("exports both dark and light lovable theme token groups", () => {
    expect(lovableThemeTokens.dark.background).toBe("270 7% 7%");
    expect(lovableThemeTokens.light.background).toBe("0 0% 98%");
    expect(lovableThemeTokens.dark["tui-claude"]).toBeDefined();
    expect(lovableThemeTokens.light["sidebar-background"]).toBeDefined();
  });

  test("backward compat aliases point to the same objects", () => {
    expect(lovableThemeTokens).toBe(lunariaThemeTokens);
    expect(lovableTypographyTokens).toBe(lunariaTypographyTokens);
    expect(lovableMotionTokens).toBe(lunariaMotionTokens);
  });

  test("generates css variable declarations", () => {
    const css = toCssVariables(
      {
        background: "270 7% 7%",
        foreground: "0 0% 88%",
      },
      { prefix: "lunaria" },
    );

    expect(css).toContain("--lunaria-background: 270 7% 7%;");
    expect(css).toContain("--lunaria-foreground: 0 0% 88%;");
  });

  test("builds theme-specific css blocks with correct selectors", () => {
    expect(themeModeSelector("dark")).toBe(":root");
    expect(themeModeSelector("light")).toBe(".light");

    const darkBlock = themeCssBlock("dark");
    const lightBlock = themeCssBlock("light");

    expect(darkBlock).toContain(":root");
    expect(darkBlock).toContain("--background: 270 7% 7%;");
    expect(lightBlock).toContain(".light");
    expect(lightBlock).toContain("--background: 0 0% 98%;");
  });

  test("exposes provider identity colors for all primary runtimes", () => {
    expect(providerIdentityTokens.claude).toBe("hsl(var(--tui-claude))");
    expect(providerIdentityTokens.opencode).toBe("hsl(var(--tui-opencode))");
    expect(providerIdentityTokens.codex).toBe("hsl(var(--tui-codex))");
    expect(providerIdentityTokens.gemini).toBe("hsl(var(--tui-gemini))");
    expect(providerIdentityTokens.ollama).toBe("hsl(var(--green))");
  });

  test("includes semantic state and pressure tokens required by Lunaria", () => {
    expect(stateTokens.streaming).toBe("hsl(var(--magenta))");
    expect(stateTokens.waitingApproval).toBe("hsl(var(--warning))");
    expect(rateLimitPressureTokens.safe).toBe("hsl(var(--success))");
    expect(rateLimitPressureTokens.exhausted).toBe("hsl(var(--destructive))");
    expect(permissionStateTokens.fullAccess).toBe("hsl(var(--magenta))");
    expect(workspaceMergeStateTokens.conflicted).toBe("hsl(var(--destructive))");
    expect(statusBarTokens.runtimeRelay).toBe("hsl(var(--deep-purple))");
  });

  test("preserves typography and motion metadata from the lovable design system", () => {
    expect(lovableTypographyTokens.fontFamily.sans).toContain("Inter");
    expect(lovableTypographyTokens.fontFamily.mono).toContain("JetBrains Mono");
    expect(lovableMotionTokens.keyframes.pulseMagenta).toContain("pulse-magenta");
    expect(lovableMotionTokens.duration.normal).toBe("200ms");
  });

  test("typography font sizes have size, lineHeight, and letterSpacing", () => {
    const sizes = lunariaTypographyTokens.fontSize;
    expect(sizes.xs.size).toBe("0.75rem");
    expect(sizes.xs.lineHeight).toBe("1rem");
    expect(sizes.xs.letterSpacing).toBe("0.01em");
    expect(sizes.base.size).toBe("1rem");
    expect(sizes.base.lineHeight).toBe("1.5rem");
    expect(sizes["4xl"].size).toBe("2.25rem");
    expect(sizes["4xl"].letterSpacing).toBe("-0.03em");
    expect(Object.keys(sizes)).toHaveLength(8);
  });

  test("spacing tokens exist and have expected values", () => {
    expect(lunariaSpacingTokens["0"]).toBe("0px");
    expect(lunariaSpacingTokens.px).toBe("1px");
    expect(lunariaSpacingTokens["4"]).toBe("16px");
    expect(lunariaSpacingTokens["24"]).toBe("96px");
    expect(Object.keys(lunariaSpacingTokens).length).toBeGreaterThanOrEqual(21);
  });

  test("radius tokens exist and have expected values", () => {
    expect(lunariaRadiusTokens.none).toBe("0");
    expect(lunariaRadiusTokens.DEFAULT).toBe("0.25rem");
    expect(lunariaRadiusTokens.full).toBe("9999px");
    expect(lunariaRadiusTokens.lg).toBe("0.5rem");
  });

  test("shadow tokens have both light and dark variants", () => {
    expect(lunariaShadowTokens.light).toBeDefined();
    expect(lunariaShadowTokens.dark).toBeDefined();
    expect(lunariaShadowTokens.light.sm).toContain("rgb(0 0 0 / 0.1)");
    expect(lunariaShadowTokens.dark.sm).toContain("rgb(0 0 0 / 0.4)");
    expect(lunariaShadowTokens.light.none).toBe("0 0 #0000");
    expect(lunariaShadowTokens.dark.none).toBe("0 0 #0000");
    expect(lunariaShadowTokens.light.inner).toContain("inset");
    expect(lunariaShadowTokens.dark.inner).toContain("inset");
  });

  test("z-index tokens have expected ordering", () => {
    const z = lunariaZIndexTokens;
    expect(Number(z.base)).toBeLessThan(Number(z.raised));
    expect(Number(z.raised)).toBeLessThan(Number(z.dropdown));
    expect(Number(z.dropdown)).toBeLessThan(Number(z.sticky));
    expect(Number(z.sticky)).toBeLessThan(Number(z.overlay));
    expect(Number(z.overlay)).toBeLessThan(Number(z.modal));
    expect(Number(z.modal)).toBeLessThan(Number(z.popover));
    expect(Number(z.popover)).toBeLessThan(Number(z.toast));
    expect(Number(z.toast)).toBeLessThan(Number(z.command));
    expect(Number(z.command)).toBeLessThan(Number(z.max));
  });

  test("border width tokens exist", () => {
    expect(lunariaBorderWidthTokens.DEFAULT).toBe("1px");
    expect(lunariaBorderWidthTokens["0"]).toBe("0px");
    expect(lunariaBorderWidthTokens["2"]).toBe("2px");
    expect(lunariaBorderWidthTokens["4"]).toBe("4px");
    expect(lunariaBorderWidthTokens["8"]).toBe("8px");
  });

  test("opacity tokens have expected values", () => {
    expect(lunariaOpacityTokens["0"]).toBe("0");
    expect(lunariaOpacityTokens["50"]).toBe("0.5");
    expect(lunariaOpacityTokens["100"]).toBe("1");
    expect(lunariaOpacityTokens["75"]).toBe("0.75");
    expect(Object.keys(lunariaOpacityTokens).length).toBeGreaterThanOrEqual(16);
  });

  test("transition presets exist", () => {
    expect(lunariaTransitionTokens.none).toBe("none");
    expect(lunariaTransitionTokens.all).toContain("200ms");
    expect(lunariaTransitionTokens.colors).toContain("background-color");
    expect(lunariaTransitionTokens.opacity).toContain("opacity");
    expect(lunariaTransitionTokens.shadow).toContain("box-shadow");
    expect(lunariaTransitionTokens.transform).toContain("transform");
  });

  // ─── Build pipeline tests ─────────────────────────────────────────────

  describe("buildWebCSS", () => {
    const css = buildWebCSS(lunariaTokens);

    test("outputs a :root block with dark-mode color variables", () => {
      expect(css).toContain(":root {");
      expect(css).toContain("--background: 270 7% 7%;");
      expect(css).toContain("--primary: 300 100% 36%;");
    });

    test("outputs a .light block with light-mode color variables", () => {
      expect(css).toContain(".light {");
      expect(css).toContain("--background: 0 0% 98%;");
    });

    test("includes spacing variables", () => {
      expect(css).toContain("--spacing-0: 0px;");
      expect(css).toContain("--spacing-px: 1px;");
      expect(css).toContain("--spacing-4: 16px;");
    });

    test("includes radius variables with DEFAULT handled", () => {
      expect(css).toContain("--radius: 0.25rem;");
      expect(css).toContain("--radius-sm: 0.125rem;");
      expect(css).toContain("--radius-full: 9999px;");
    });

    test("includes shadow variables for both modes", () => {
      expect(css).toContain("--shadow-xs:");
      expect(css).toContain("--shadow-none: 0 0 #0000;");
    });

    test("includes z-index variables", () => {
      expect(css).toContain("--z-base: 0;");
      expect(css).toContain("--z-modal: 50;");
    });

    test("includes border-width variables", () => {
      expect(css).toContain("--border-width: 1px;");
      expect(css).toContain("--border-width-2: 2px;");
    });

    test("includes opacity variables", () => {
      expect(css).toContain("--opacity-50: 0.5;");
    });

    test("includes transition variables", () => {
      expect(css).toContain("--transition-none: none;");
      expect(css).toContain("--transition-all:");
    });

    test("includes typography variables", () => {
      expect(css).toContain('--font-family-sans: "Inter", sans-serif;');
      expect(css).toContain("--font-weight-bold: 700;");
      expect(css).toContain("--font-size-xs: 0.75rem;");
      expect(css).toContain("--line-height-xs: 1rem;");
      expect(css).toContain("--letter-spacing-xs: 0.01em;");
    });

    test("includes motion variables", () => {
      expect(css).toContain("--duration-fast: 150ms;");
      expect(css).toContain("--easing-default: ease;");
    });
  });

  describe("buildNativeTokens", () => {
    const native = buildNativeTokens(lunariaTokens);

    test("converts dark-mode HSL colors to hex", () => {
      expect(native.colorBackground).toBe("#121113");
      expect(native.colorPrimaryForeground).toBe("#ffffff");
    });

    test("converts light-mode HSL colors to hex under colorLight prefix", () => {
      expect(native.colorLightBackground).toBe("#fafafa");
      expect(native.colorLightPrimaryForeground).toBe("#ffffff");
    });

    test("converts spacing to numeric px values", () => {
      expect(native.spacing0).toBe(0);
      expect(native.spacingPx).toBe(1);
      expect(native.spacing4).toBe(16);
    });

    test("converts radius rem values to numeric px", () => {
      expect(native.radiusSm).toBe(2);
      expect(native.radius).toBe(4); // DEFAULT = 0.25rem
      expect(native.radiusFull).toBe(9999);
    });

    test("converts z-index to numbers", () => {
      expect(native.zIndexBase).toBe(0);
      expect(native.zIndexModal).toBe(50);
    });

    test("converts font weight to numbers", () => {
      expect(native.fontWeightBold).toBe(700);
      expect(native.fontWeightRegular).toBe(400);
    });

    test("converts font size rem to px number", () => {
      expect(native.fontSizeXs).toBe(12);
      expect(native.fontSizeBase).toBe(16);
    });

    test("includes shadows as strings", () => {
      expect(typeof native.shadowXs).toBe("string");
      expect(typeof native.shadowLightXs).toBe("string");
    });

    test("includes opacity as float numbers", () => {
      expect(native.opacity50).toBe(0.5);
      expect(native.opacity100).toBe(1);
    });

    test("handles non-HSL values in color tokens gracefully", () => {
      // radius: "0.25rem" is mixed into theme color tokens
      expect(native.colorRadius).toBe(4);
    });
  });

  describe("buildDesignTokensJSON", () => {
    const json = buildDesignTokensJSON(lunariaTokens) as Record<string, any>;

    test("outputs DTCG-formatted color tokens with $value and $type", () => {
      expect(json.color.dark.background.$type).toBe("color");
      expect(json.color.dark.background.$value).toBe("hsl(270, 7%, 7%)");
      expect(json.color.light.background.$value).toBe("hsl(0, 0%, 98%)");
    });

    test("outputs spacing tokens as dimension type", () => {
      expect(json.spacing["4"].$value).toBe("16px");
      expect(json.spacing["4"].$type).toBe("dimension");
    });

    test("outputs radius tokens as dimension type", () => {
      expect(json.radius.sm.$value).toBe("0.125rem");
      expect(json.radius.sm.$type).toBe("dimension");
    });

    test("outputs shadow tokens for both modes", () => {
      expect(json.shadow.dark.xs.$type).toBe("shadow");
      expect(json.shadow.light.xs.$type).toBe("shadow");
    });

    test("outputs z-index tokens as number type", () => {
      expect(json.zIndex.base.$type).toBe("number");
      expect(json.zIndex.base.$value).toBe("0");
    });

    test("outputs typography with nested font-size entries", () => {
      expect(json.typography.fontFamily.sans.$type).toBe("fontFamily");
      expect(json.typography.fontWeight.bold.$type).toBe("fontWeight");
      expect(json.typography.fontSize.xs.size.$value).toBe("0.75rem");
      expect(json.typography.fontSize.xs.lineHeight.$value).toBe("1rem");
    });

    test("outputs motion tokens", () => {
      expect(json.motion.duration.fast.$value).toBe("150ms");
      expect(json.motion.duration.fast.$type).toBe("duration");
      expect(json.motion.easing.default.$type).toBe("cubicBezier");
    });

    test("handles non-HSL values in color tokens with correct type", () => {
      // radius value in theme tokens gets dimension type, not color
      expect(json.color.dark.radius.$type).toBe("dimension");
      expect(json.color.dark.radius.$value).toBe("0.25rem");
    });
  });

  describe("hslToHex", () => {
    test("converts white correctly", () => {
      expect(hslToHex("0 0% 100%")).toBe("#ffffff");
    });

    test("converts black correctly", () => {
      expect(hslToHex("0 0% 0%")).toBe("#000000");
    });

    test("converts magenta correctly", () => {
      expect(hslToHex("300 100% 36%")).toBe("#b800b8");
    });
  });
});
