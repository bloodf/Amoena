import { AppState, type AppStateStatus } from "react-native";

type EventSourceOptions = {
  onEvent?: (eventName: string, data: unknown) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  eventNames?: string[];
};

export function createReconnectingEventSource(url: string, options: EventSourceOptions = {}) {
  let es: EventSource | null = null;
  let retryCount = 0;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;
  let disposed = false;
  let appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;

  const maxRetries = 10;
  const baseDelay = 1000;
  const maxDelay = 30000;

  function getDelay() {
    const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
    return delay + Math.random() * 1000;
  }

  function connect() {
    if (disposed || typeof EventSource === "undefined") return;

    es = new EventSource(url);

    es.onopen = () => {
      retryCount = 0;
      options.onOpen?.();
    };

    es.onerror = (event) => {
      options.onError?.(event);
      es?.close();
      es = null;
      scheduleReconnect();
    };

    for (const name of options.eventNames ?? []) {
      es.addEventListener(name, ((event: MessageEvent<string>) => {
        try {
          const data = JSON.parse(event.data);
          options.onEvent?.(name, data);
        } catch {
          options.onEvent?.(name, event.data);
        }
      }) as EventListener);
    }
  }

  function scheduleReconnect() {
    if (disposed || retryCount >= maxRetries) return;
    retryTimer = setTimeout(() => {
      retryCount++;
      connect();
    }, getDelay());
  }

  function handleAppState(state: AppStateStatus) {
    if (state === "active") {
      if (!es) connect();
    } else {
      es?.close();
      es = null;
      if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }
    }
  }

  connect();
  appStateSubscription = AppState.addEventListener("change", handleAppState);

  return {
    close() {
      disposed = true;
      es?.close();
      es = null;
      if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }
      appStateSubscription?.remove();
    },
  };
}
