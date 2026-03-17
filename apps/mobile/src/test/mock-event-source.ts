import { vi } from "vitest";

type Listener = (event: { data: string }) => void;

export class MockEventSource {
  static instances: MockEventSource[] = [];

  url: string;
  readyState = 0;
  onopen: (() => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  private listeners = new Map<string, Listener[]>();

  constructor(url: string) {
    this.url = url;
    this.readyState = 1;
    MockEventSource.instances.push(this);
    queueMicrotask(() => this.onopen?.());
  }

  addEventListener(name: string, handler: Listener) {
    const list = this.listeners.get(name) ?? [];
    list.push(handler);
    this.listeners.set(name, list);
  }

  removeEventListener(name: string, handler: Listener) {
    const list = this.listeners.get(name) ?? [];
    this.listeners.set(
      name,
      list.filter((h) => h !== handler),
    );
  }

  close() {
    this.readyState = 2;
    this.listeners.clear();
  }

  emit(eventName: string, data: unknown) {
    const handlers = this.listeners.get(eventName) ?? [];
    const event = { data: JSON.stringify(data) };
    for (const handler of handlers) {
      handler(event);
    }
  }

  static reset() {
    MockEventSource.instances = [];
  }

  static latest() {
    return MockEventSource.instances[MockEventSource.instances.length - 1] ?? null;
  }
}

export function installMockEventSource() {
  MockEventSource.reset();
  (globalThis as any).EventSource = MockEventSource;
  return MockEventSource;
}

export function uninstallMockEventSource() {
  delete (globalThis as any).EventSource;
  MockEventSource.reset();
}
