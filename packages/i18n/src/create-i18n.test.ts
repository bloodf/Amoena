import { describe, expect, it } from "vitest";

import { createAmoenaI18n, normalizeLocale } from "./create-i18n";

describe("createAmoenaI18n", () => {
  it("normalizes supported locale variants", () => {
    expect(normalizeLocale("pt")).toBe("pt-BR");
    expect(normalizeLocale("pt-PT")).toBe("pt-BR");
    expect(normalizeLocale("fr-CA")).toBe("fr");
    expect(normalizeLocale("unknown")).toBe("en");
  });

  it("loads translated resources for the requested locale", () => {
    const i18n = createAmoenaI18n({ locale: "pt-BR" });

    expect(i18n.t("app.runtimeEyebrow")).toBe("Runtime Desktop");
    expect(i18n.t("app.connecting")).toContain("localhost");
    expect(i18n.t("app.bootstrapFailed")).toBe("Falha na Inicializacao");
  });
});
