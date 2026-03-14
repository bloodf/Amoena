import { describe, expect, it } from "vitest";
import { getSeverity, providerRates, runtimeConfig, contextUsage } from "./data";

describe("getSeverity branches", () => {
  it("returns Exhausted at 95%+", () => {
    expect(getSeverity(95)).toEqual({ label: "Exhausted", className: "text-destructive" });
    expect(getSeverity(100)).toEqual({ label: "Exhausted", className: "text-destructive" });
  });

  it("returns Warning at 80-94%", () => {
    expect(getSeverity(80)).toEqual({ label: "Warning", className: "text-destructive" });
    expect(getSeverity(94)).toEqual({ label: "Warning", className: "text-destructive" });
  });

  it("returns Caution at 50-79%", () => {
    expect(getSeverity(50)).toEqual({ label: "Caution", className: "text-warning" });
    expect(getSeverity(79)).toEqual({ label: "Caution", className: "text-warning" });
  });

  it("returns Safe below 50%", () => {
    expect(getSeverity(0)).toEqual({ label: "Safe", className: "text-green" });
    expect(getSeverity(49)).toEqual({ label: "Safe", className: "text-green" });
  });
});

describe("providerRates data", () => {
  it("has three providers", () => {
    expect(providerRates).toHaveLength(3);
  });

  it("each provider has required fields", () => {
    for (const p of providerRates) {
      expect(p.name).toBeTruthy();
      expect(p.used).toBeGreaterThanOrEqual(0);
      expect(p.limit).toBeGreaterThan(0);
    }
  });
});

describe("runtimeConfig data", () => {
  it("has entries for all runtime locations", () => {
    expect(runtimeConfig.local).toBeTruthy();
    expect(runtimeConfig.relay).toBeTruthy();
    expect(runtimeConfig.offline).toBeTruthy();
    expect(runtimeConfig.degraded).toBeTruthy();
  });
});

describe("contextUsage data", () => {
  it("has used and limit values", () => {
    expect(contextUsage.used).toBeGreaterThan(0);
    expect(contextUsage.limit).toBeGreaterThan(0);
  });
});
