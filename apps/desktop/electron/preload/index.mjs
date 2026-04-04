import { contextBridge, ipcRenderer, webUtils } from "electron";
var IPCMode;
(function(IPCMode2) {
  IPCMode2[IPCMode2["Classic"] = 1] = "Classic";
  IPCMode2[IPCMode2["Protocol"] = 2] = "Protocol";
  IPCMode2[IPCMode2["Both"] = 3] = "Both";
})(IPCMode || (IPCMode = {}));
function ipcChannelUtils(namespace) {
  return {
    createUrl: (channel) => {
      return `${namespace}://${channel}/sentry_key`;
    },
    urlMatches: function(url, channel) {
      return url.startsWith(this.createUrl(channel));
    },
    createKey: (channel) => {
      return `${namespace}.${channel}`;
    },
    namespace
  };
}
function hookupIpc(namespace = "sentry-ipc") {
  const ipcUtil = ipcChannelUtils(namespace);
  window.__SENTRY_IPC__ = window.__SENTRY_IPC__ || {};
  if (window.__SENTRY_IPC__[ipcUtil.namespace]) {
    console.log("Sentry Electron preload has already been run");
  } else {
    const ipcObject = {
      sendRendererStart: () => ipcRenderer.send(ipcUtil.createKey("start")),
      sendScope: (scopeJson) => ipcRenderer.send(ipcUtil.createKey("scope"), scopeJson),
      sendEnvelope: (envelope) => ipcRenderer.send(ipcUtil.createKey("envelope"), envelope),
      sendStatus: (status) => ipcRenderer.send(ipcUtil.createKey("status"), status),
      sendStructuredLog: (log) => ipcRenderer.send(ipcUtil.createKey("structured-log"), log),
      sendMetric: (metric) => ipcRenderer.send(ipcUtil.createKey("metric"), metric)
    };
    window.__SENTRY_IPC__[ipcUtil.namespace] = ipcObject;
    if (contextBridge) {
      try {
        contextBridge.exposeInMainWorld("__SENTRY_IPC__", window.__SENTRY_IPC__);
      } catch (e) {
      }
    }
  }
}
hookupIpc();
const D = "trpc-electron";
var z, K;
(z = Symbol).dispose ?? (z.dispose = Symbol());
(K = Symbol).asyncDispose ?? (K.asyncDispose = Symbol());
var q, X, ee, re, te, se;
typeof window > "u" || "Deno" in window || // eslint-disable-next-line @typescript-eslint/dot-notation
((X = (q = globalThis.process) == null ? void 0 : q.env) == null ? void 0 : X.NODE_ENV) === "test" || (re = (ee = globalThis.process) == null ? void 0 : ee.env) != null && re.JEST_WORKER_ID || (se = (te = globalThis.process) == null ? void 0 : te.env) != null && se.VITEST_WORKER_ID;
const Qe = () => {
  const r = {
    sendMessage: (e) => ipcRenderer.send(D, e),
    onMessage: (e) => ipcRenderer.on(D, (t, s) => e(s))
  };
  contextBridge.exposeInMainWorld("electronTRPC", r);
};
const API = {
  sayHelloFromBridge: () => console.log("\nHello from bridgeAPI! 👋\n\n"),
  username: process.env.USER,
  appVersion: "0.1.0"
};
const listenerMap = /* @__PURE__ */ new WeakMap();
const ipcRendererAPI = {
  // biome-ignore lint/suspicious/noExplicitAny: IPC invoke requires any for dynamic channel types
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  // biome-ignore lint/suspicious/noExplicitAny: IPC send requires any for dynamic channel types
  send: (channel, ...args) => ipcRenderer.send(channel, ...args),
  // biome-ignore lint/suspicious/noExplicitAny: IPC listener requires any for dynamic event types
  on: (channel, listener) => {
    const wrappedListener = (_event, ...args) => {
      listener(...args);
    };
    listenerMap.set(listener, wrappedListener);
    ipcRenderer.on(channel, wrappedListener);
  },
  // biome-ignore lint/suspicious/noExplicitAny: IPC listener requires any for dynamic event types
  off: (channel, listener) => {
    const wrappedListener = listenerMap.get(listener);
    if (wrappedListener) {
      ipcRenderer.removeListener(channel, wrappedListener);
      listenerMap.delete(listener);
    }
  }
};
Qe();
contextBridge.exposeInMainWorld("App", API);
contextBridge.exposeInMainWorld("ipcRenderer", ipcRendererAPI);
contextBridge.exposeInMainWorld("webUtils", {
  getPathForFile: (file) => webUtils.getPathForFile(file)
});
