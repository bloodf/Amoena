import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const { cleanup } = await import("@testing-library/react");
const { afterEach, expect } = await import("bun:test");
const matchers = await import("@testing-library/jest-dom/matchers");

expect.extend(((matchers as any).default ?? matchers) as any);

afterEach(() => {
  cleanup();
});
