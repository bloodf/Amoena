import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  test,
  vi,
} from "vitest";

function mock<T extends (...args: any[]) => any>(implementation?: T) {
  return vi.fn(implementation);
}

mock.module = vi.mock;

export { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, mock, test, vi };
