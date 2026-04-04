/**
 * Vitest setup file for desktop app tests
 *
 * Provides browser globals (window, document) for tests that import
 * production code which depends on browser APIs.
 */
import { vi } from 'vitest';

// Mock window global with amoena property for Electron bridge
const mockWindow = {
  amoena: undefined,
};

Object.defineProperty(globalThis, 'window', {
  value: mockWindow,
  writable: true,
  configurable: true,
});

// Mock document global
const mockStyleMap = new Map<string, string>();
const mockClassList = new Set<string>();

const mockHead = {
  appendChild: vi.fn(() => ({})),
  removeChild: vi.fn(() => ({})),
};

const mockDocument = {
  documentElement: {
    style: {
      setProperty: (key: string, value: string) => mockStyleMap.set(key, value),
      getPropertyValue: (key: string) => mockStyleMap.get(key) || '',
    },
    classList: {
      add: (className: string) => mockClassList.add(className),
      remove: (className: string) => mockClassList.delete(className),
      toggle: (className: string) => {
        mockClassList.has(className)
          ? mockClassList.delete(className)
          : mockClassList.add(className);
      },
      contains: (className: string) => mockClassList.has(className),
    },
  },
  head: mockHead,
  getElementsByTagName: vi.fn((tag: string) => {
    if (tag === 'head') return [mockHead];
    return [];
  }),
  createElement: vi.fn((_tag: string) => ({
    setAttribute: vi.fn(() => {}),
    appendChild: vi.fn(() => ({})),
    textContent: '',
    type: '',
  })),
  createTextNode: vi.fn((text: string) => ({
    textContent: text,
  })),
};

Object.defineProperty(globalThis, 'document', {
  value: mockDocument,
  writable: true,
  configurable: true,
});

// Mock EventSource for tests that use server-sent events
class MockEventSource extends EventTarget {
  readyState: number = 0;
  url: string;
  onopen: ((event: MessageEvent) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(url: string) {
    super();
    this.url = url;
  }

  close(): void {
    this.readyState = 2;
  }
}

Object.defineProperty(globalThis, 'EventSource', {
  value: MockEventSource,
  writable: true,
  configurable: true,
});
