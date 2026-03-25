import { describe, it, expect } from "vitest";
import { buildMcWsUrl, MC_WS_DEFAULT_PORT } from "./protocol.js";
import type { SubscribeHandshake } from "./protocol.js";

describe("MC_WS_DEFAULT_PORT", () => {
  it("is 7779", () => {
    expect(MC_WS_DEFAULT_PORT).toBe(7779);
  });
});

describe("buildMcWsUrl", () => {
  it("returns default URL with no arguments", () => {
    expect(buildMcWsUrl()).toBe("ws://localhost:7779/mc");
  });

  it("accepts custom host", () => {
    expect(buildMcWsUrl("192.168.1.5")).toBe("ws://192.168.1.5:7779/mc");
  });

  it("accepts custom host and port", () => {
    expect(buildMcWsUrl("10.0.0.1", 8080)).toBe("ws://10.0.0.1:8080/mc");
  });

  it("accepts only port override via default host", () => {
    expect(buildMcWsUrl("localhost", 3000)).toBe("ws://localhost:3000/mc");
  });

  it("handles IPv6 host", () => {
    expect(buildMcWsUrl("::1", 7779)).toBe("ws://::1:7779/mc");
  });

  it("handles empty string host", () => {
    expect(buildMcWsUrl("", 7779)).toBe("ws://:7779/mc");
  });

  it("handles host with trailing dot (FQDN)", () => {
    expect(buildMcWsUrl("example.com.", 443)).toBe("ws://example.com.:443/mc");
  });

  it("handles port 0", () => {
    expect(buildMcWsUrl("localhost", 0)).toBe("ws://localhost:0/mc");
  });

  it("handles large port number", () => {
    expect(buildMcWsUrl("localhost", 65535)).toBe("ws://localhost:65535/mc");
  });

  it("handles subdomain host", () => {
    expect(buildMcWsUrl("mc.internal.example.com")).toBe(
      "ws://mc.internal.example.com:7779/mc",
    );
  });

  it("always appends /mc path", () => {
    const url = buildMcWsUrl("host", 1234);
    expect(url.endsWith("/mc")).toBe(true);
  });

  it("always starts with ws://", () => {
    const url = buildMcWsUrl();
    expect(url.startsWith("ws://")).toBe(true);
  });
});

describe("SubscribeHandshake", () => {
  it("accepts version 1 without goalId", () => {
    const hs: SubscribeHandshake = { version: "1" };
    expect(hs.version).toBe("1");
    expect(hs.goalId).toBeUndefined();
  });

  it("accepts version 1 with goalId", () => {
    const hs: SubscribeHandshake = { version: "1", goalId: "goal-abc" };
    expect(hs.version).toBe("1");
    expect(hs.goalId).toBe("goal-abc");
  });
});
