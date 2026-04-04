import { c as createContextKey, b as baggageEntryMetadataFromString, p as propagation, d as diag, T as TELEMETRY_SDK_LANGUAGE_VALUE_NODEJS, A as ATTR_TELEMETRY_SDK_VERSION, a as ATTR_TELEMETRY_SDK_LANGUAGE, e as ATTR_TELEMETRY_SDK_NAME, t as trace, i as isSpanContextValid, f as TraceFlags, D as DiagLogLevel, g as context, r as require$$0$2, h as require$$2, j as require$$2$1, k as getCurrentScope, l as getTraceData, m as defineIntegration, C as CONSOLE_LEVELS, G as GLOBAL_OBJ, n as addConsoleInstrumentationHandler, o as getClient, w as withScope, q as addExceptionMechanism, s as safeJoin, u as captureException, v as severityLevelFromString, x as DEBUG_BUILD, y as debug, z as getFramesFromEvent, B as isError, E as normalize, F as isPlainObject$1, H as addNonEnumerableProperty, I as truncate, J as relative, K as basename, L as startSpan$1, S as SPAN_STATUS_ERROR, M as SPAN_STATUS_OK, N as SEMANTIC_ATTRIBUTE_SENTRY_OP, O as SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, P as setHttpStatus, Q as addBreadcrumb, R as startSpanManual, U as getActiveSpan, V as spanToJSON, W as fill, X as withIsolationScope, Y as SEMANTIC_ATTRIBUTE_SENTRY_SOURCE, Z as parseStringToURLObject, _ as isURLObjectRelative, $ as getIsolationScope, a0 as startInactiveSpan, a1 as withActiveSpan, a2 as isPrimitive$1, a3 as _INTERNAL_captureLog, a4 as _INTERNAL_captureMetric, a5 as isThenable, a6 as handleCallbackErrors, a7 as DEBUG_BUILD$1, a8 as stripUrlQueryAndFragment, a9 as generateSpanId, aa as SpanKind, ab as RPCType$1, ac as setRPCMetadata$1, ad as getSpanStatusFromHttpCode, ae as isTracingSuppressed$1, af as getRPCMetadata$1, ag as SEMATTRS_NET_HOST_IP, ah as SEMATTRS_NET_HOST_PORT, ai as SEMATTRS_NET_PEER_IP, aj as SEMATTRS_HTTP_STATUS_CODE, ak as ATTR_HTTP_ROUTE, al as ATTR_HTTP_RESPONSE_STATUS_CODE, am as shouldPropagateTraceForUrl, an as mergeBaggageHeaders, ao as parseUrl, ap as getSanitizedUrlString, aq as getBreadcrumbLogLevelFromHttpStatusCode, ar as InstrumentationBase$2, as as SDK_VERSION, at as LRUMap, au as InstrumentationNodeModuleDefinition$2, av as serializeEnvelope, aw as suppressTracing$1, ax as openTelemetrySetupCheck, ay as hasSpansEnabled, az as isWrapped$2, aA as isEnabled, aB as consoleSandbox, aC as getGlobalScope, aD as captureLog, aE as captureMessage, aF as withMonitor, aG as generateInstrumentOnce, aH as NODE_VERSION, aI as stripDataUrlContent, aJ as SEMANTIC_ATTRIBUTE_URL_FULL, aK as require$$1$1, aL as getDefaultIsolationScope, aM as DEBUG_BUILD$2, aN as metrics, aO as requireInTheMiddleExports, aP as importInTheMiddleExports, aQ as SpanStatusCode, aR as safeExecuteInTheMiddle$1, aS as SEMATTRS_HTTP_ROUTE, aT as getRootSpan, aU as SEMANTIC_ATTRIBUTE_SENTRY_GRAPHQL_OPERATION, aV as SEMANTIC_ATTRIBUTE_CACHE_ITEM_SIZE, aW as SEMANTIC_ATTRIBUTE_CACHE_HIT, aX as SEMANTIC_ATTRIBUTE_CACHE_KEY, aY as InstrumentationNodeModuleFile$1, aZ as ATTR_DB_OPERATION_NAME, a_ as ATTR_DB_QUERY_TEXT, a$ as ATTR_DB_SYSTEM_NAME, b0 as ATTR_DB_RESPONSE_STATUS_CODE, b1 as ATTR_ERROR_TYPE, b2 as ATTR_HTTP_REQUEST_METHOD, b3 as instrumentWhenWrapped, b4 as _INTERNAL_shouldSkipAiProviderWrapping, b5 as _INTERNAL_skipAiProviderWrapping, b6 as ATTR_DB_NAMESPACE, b7 as ATTR_DB_COLLECTION_NAME, b8 as ATTR_SERVER_ADDRESS, b9 as ATTR_SERVER_PORT, ba as flush, bb as endSessionOnExit, bc as startSession, bd as endSession, be as CRASH_REASONS, bf as sessionCrashed, bg as unreportedDuringLastSession, bh as checkPreviousSession, bi as addScopeListener, bj as makeDsn, bk as getScopeData, bl as mergeEvents, bm as uuid4, bn as getSdkInfo, bo as getEventDefaults, bp as applyScopeDataToEvent, bq as normalizePaths, br as timestampInSeconds, bs as ipcMainHooks, bt as setMeasurement } from "../index.js";
import { bu, bv, bw, bx, by, bz, bA, bB, bC, bD, bE, bF, bG, bH, bI, bJ, bK, bL, bM, bN, bO, bP, bQ, bR, bS, bT, bU, bV, bW, bX, bY, bZ, b_, b$, c0, c1, c2, c3, c4, c5, c6, c7, c8, c9, ca, cb, cc, cd, ce, cf, cg, ch, ci, cj, ck, cl, cm, cn, co, cp, cq, cr, cs } from "../index.js";
import { app, BrowserWindow, crashReporter } from "electron";
import * as diagnosticsChannel from "node:diagnostics_channel";
import diagnosticsChannel__default, { subscribe, unsubscribe } from "node:diagnostics_channel";
import { g as getAugmentedNamespace } from "./_commonjsHelpers-BVEIagUZ.js";
import * as require$$0 from "path";
import { normalize as normalize$1 } from "path";
import require$$0$1, { inspect, types as types$3 } from "util";
import { readFileSync as readFileSync$1 } from "fs";
import * as net from "node:net";
import require$$0$3 from "events";
import require$$2$2 from "url";
import { errorMonitor } from "node:events";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import * as http$1 from "node:http";
import * as util from "node:util";
import "node:url";
import "@lunaria/local-db";
import "./tree-kill-rAImQljA.js";
import "node:child_process";
import "node:os";
import "./index-d7r8qpVm.js";
import "node:process";
import "./index-5Z96HUq5.js";
import "child_process";
import "node:fs/promises";
import "node:crypto";
import "./parse-status-8uMFNboz.js";
import "node:buffer";
import "tty";
import "os";
import "assert";
import "buffer";
import "stream";
import "constants";
import "crypto";
import "zlib";
import "http";
import "better-sqlite3";
import "tailwindcss/colors";
import "diagnostics_channel";
import "module";
import "worker_threads";
import "node:readline";
import "node:worker_threads";
import "async_hooks";
import "node:async_hooks";
import "@trpc/react-query";
import "@trpc/server";
import "@lunaria/shared/constants";
import "@trpc/server/observable";
import "@lunaria/workspace-fs/host";
import "@lunaria/chat/server/trpc";
import "string_decoder";
import "node:zlib";
import "node:querystring";
import "@lunaria/chat/server/desktop";
import "@lunaria/shared/agent-command";
import "@lunaria/shared/agent-catalog";
import "@lunaria/shared/agent-prompt-template";
import "@lunaria/local-db/schema/zod";
import "culori";
var src$m = {};
var http = {};
const SUPPRESS_TRACING_KEY = createContextKey("OpenTelemetry SDK Context Key SUPPRESS_TRACING");
function suppressTracing(context2) {
  return context2.setValue(SUPPRESS_TRACING_KEY, true);
}
function unsuppressTracing(context2) {
  return context2.deleteValue(SUPPRESS_TRACING_KEY);
}
function isTracingSuppressed(context2) {
  return context2.getValue(SUPPRESS_TRACING_KEY) === true;
}
const BAGGAGE_KEY_PAIR_SEPARATOR = "=";
const BAGGAGE_PROPERTIES_SEPARATOR = ";";
const BAGGAGE_ITEMS_SEPARATOR = ",";
const BAGGAGE_HEADER = "baggage";
const BAGGAGE_MAX_NAME_VALUE_PAIRS = 180;
const BAGGAGE_MAX_PER_NAME_VALUE_PAIRS = 4096;
const BAGGAGE_MAX_TOTAL_LENGTH = 8192;
function serializeKeyPairs(keyPairs) {
  return keyPairs.reduce((hValue, current) => {
    const value = `${hValue}${hValue !== "" ? BAGGAGE_ITEMS_SEPARATOR : ""}${current}`;
    return value.length > BAGGAGE_MAX_TOTAL_LENGTH ? hValue : value;
  }, "");
}
function getKeyPairs(baggage) {
  return baggage.getAllEntries().map(([key, value]) => {
    let entry = `${encodeURIComponent(key)}=${encodeURIComponent(value.value)}`;
    if (value.metadata !== void 0) {
      entry += BAGGAGE_PROPERTIES_SEPARATOR + value.metadata.toString();
    }
    return entry;
  });
}
function parsePairKeyValue(entry) {
  if (!entry)
    return;
  const metadataSeparatorIndex = entry.indexOf(BAGGAGE_PROPERTIES_SEPARATOR);
  const keyPairPart = metadataSeparatorIndex === -1 ? entry : entry.substring(0, metadataSeparatorIndex);
  const separatorIndex = keyPairPart.indexOf(BAGGAGE_KEY_PAIR_SEPARATOR);
  if (separatorIndex <= 0)
    return;
  const rawKey = keyPairPart.substring(0, separatorIndex).trim();
  const rawValue = keyPairPart.substring(separatorIndex + 1).trim();
  if (!rawKey || !rawValue)
    return;
  let key;
  let value;
  try {
    key = decodeURIComponent(rawKey);
    value = decodeURIComponent(rawValue);
  } catch {
    return;
  }
  let metadata;
  if (metadataSeparatorIndex !== -1 && metadataSeparatorIndex < entry.length - 1) {
    const metadataString = entry.substring(metadataSeparatorIndex + 1);
    metadata = baggageEntryMetadataFromString(metadataString);
  }
  return { key, value, metadata };
}
function parseKeyPairsIntoRecord(value) {
  const result = {};
  if (typeof value === "string" && value.length > 0) {
    value.split(BAGGAGE_ITEMS_SEPARATOR).forEach((entry) => {
      const keyPair = parsePairKeyValue(entry);
      if (keyPair !== void 0 && keyPair.value.length > 0) {
        result[keyPair.key] = keyPair.value;
      }
    });
  }
  return result;
}
class W3CBaggagePropagator {
  inject(context2, carrier, setter) {
    const baggage = propagation.getBaggage(context2);
    if (!baggage || isTracingSuppressed(context2))
      return;
    const keyPairs = getKeyPairs(baggage).filter((pair) => {
      return pair.length <= BAGGAGE_MAX_PER_NAME_VALUE_PAIRS;
    }).slice(0, BAGGAGE_MAX_NAME_VALUE_PAIRS);
    const headerValue = serializeKeyPairs(keyPairs);
    if (headerValue.length > 0) {
      setter.set(carrier, BAGGAGE_HEADER, headerValue);
    }
  }
  extract(context2, carrier, getter) {
    const headerValue = getter.get(carrier, BAGGAGE_HEADER);
    const baggageString = Array.isArray(headerValue) ? headerValue.join(BAGGAGE_ITEMS_SEPARATOR) : headerValue;
    if (!baggageString)
      return context2;
    const baggage = {};
    if (baggageString.length === 0) {
      return context2;
    }
    const pairs = baggageString.split(BAGGAGE_ITEMS_SEPARATOR);
    pairs.forEach((entry) => {
      const keyPair = parsePairKeyValue(entry);
      if (keyPair) {
        const baggageEntry = { value: keyPair.value };
        if (keyPair.metadata) {
          baggageEntry.metadata = keyPair.metadata;
        }
        baggage[keyPair.key] = baggageEntry;
      }
    });
    if (Object.entries(baggage).length === 0) {
      return context2;
    }
    return propagation.setBaggage(context2, propagation.createBaggage(baggage));
  }
  fields() {
    return [BAGGAGE_HEADER];
  }
}
class AnchoredClock {
  _monotonicClock;
  _epochMillis;
  _performanceMillis;
  /**
   * Create a new AnchoredClock anchored to the current time returned by systemClock.
   *
   * @param systemClock should be a clock that returns the number of milliseconds since January 1 1970 such as Date
   * @param monotonicClock should be a clock that counts milliseconds monotonically such as window.performance or perf_hooks.performance
   */
  constructor(systemClock, monotonicClock) {
    this._monotonicClock = monotonicClock;
    this._epochMillis = systemClock.now();
    this._performanceMillis = monotonicClock.now();
  }
  /**
   * Returns the current time by adding the number of milliseconds since the
   * AnchoredClock was created to the creation epoch time
   */
  now() {
    const delta = this._monotonicClock.now() - this._performanceMillis;
    return this._epochMillis + delta;
  }
}
function sanitizeAttributes(attributes) {
  const out = {};
  if (typeof attributes !== "object" || attributes == null) {
    return out;
  }
  for (const key in attributes) {
    if (!Object.prototype.hasOwnProperty.call(attributes, key)) {
      continue;
    }
    if (!isAttributeKey(key)) {
      diag.warn(`Invalid attribute key: ${key}`);
      continue;
    }
    const val = attributes[key];
    if (!isAttributeValue(val)) {
      diag.warn(`Invalid attribute value set for key: ${key}`);
      continue;
    }
    if (Array.isArray(val)) {
      out[key] = val.slice();
    } else {
      out[key] = val;
    }
  }
  return out;
}
function isAttributeKey(key) {
  return typeof key === "string" && key !== "";
}
function isAttributeValue(val) {
  if (val == null) {
    return true;
  }
  if (Array.isArray(val)) {
    return isHomogeneousAttributeValueArray(val);
  }
  return isValidPrimitiveAttributeValueType(typeof val);
}
function isHomogeneousAttributeValueArray(arr) {
  let type;
  for (const element of arr) {
    if (element == null)
      continue;
    const elementType = typeof element;
    if (elementType === type) {
      continue;
    }
    if (!type) {
      if (isValidPrimitiveAttributeValueType(elementType)) {
        type = elementType;
        continue;
      }
      return false;
    }
    return false;
  }
  return true;
}
function isValidPrimitiveAttributeValueType(valType) {
  switch (valType) {
    case "number":
    case "boolean":
    case "string":
      return true;
  }
  return false;
}
function loggingErrorHandler() {
  return (ex) => {
    diag.error(stringifyException(ex));
  };
}
function stringifyException(ex) {
  if (typeof ex === "string") {
    return ex;
  } else {
    return JSON.stringify(flattenException(ex));
  }
}
function flattenException(ex) {
  const result = {};
  let current = ex;
  while (current !== null) {
    Object.getOwnPropertyNames(current).forEach((propertyName) => {
      if (result[propertyName])
        return;
      const value = current[propertyName];
      if (value) {
        result[propertyName] = String(value);
      }
    });
    current = Object.getPrototypeOf(current);
  }
  return result;
}
let delegateHandler = loggingErrorHandler();
function setGlobalErrorHandler(handler) {
  delegateHandler = handler;
}
function globalErrorHandler(ex) {
  try {
    delegateHandler(ex);
  } catch {
  }
}
function getNumberFromEnv(key) {
  const raw = process.env[key];
  if (raw == null || raw.trim() === "") {
    return void 0;
  }
  const value = Number(raw);
  if (isNaN(value)) {
    diag.warn(`Unknown value ${inspect(raw)} for ${key}, expected a number, using defaults`);
    return void 0;
  }
  return value;
}
function getStringFromEnv(key) {
  const raw = process.env[key];
  if (raw == null || raw.trim() === "") {
    return void 0;
  }
  return raw;
}
function getBooleanFromEnv(key) {
  const raw = process.env[key]?.trim().toLowerCase();
  if (raw == null || raw === "") {
    return false;
  }
  if (raw === "true") {
    return true;
  } else if (raw === "false") {
    return false;
  } else {
    diag.warn(`Unknown value ${inspect(raw)} for ${key}, expected 'true' or 'false', falling back to 'false' (default)`);
    return false;
  }
}
function getStringListFromEnv(key) {
  return getStringFromEnv(key)?.split(",").map((v) => v.trim()).filter((s) => s !== "");
}
const _globalThis$2 = globalThis;
const VERSION$2 = "2.5.0";
const ATTR_PROCESS_RUNTIME_NAME = "process.runtime.name";
const SDK_INFO = {
  [ATTR_TELEMETRY_SDK_NAME]: "opentelemetry",
  [ATTR_PROCESS_RUNTIME_NAME]: "node",
  [ATTR_TELEMETRY_SDK_LANGUAGE]: TELEMETRY_SDK_LANGUAGE_VALUE_NODEJS,
  [ATTR_TELEMETRY_SDK_VERSION]: VERSION$2
};
const otperformance = performance;
const NANOSECOND_DIGITS = 9;
const NANOSECOND_DIGITS_IN_MILLIS = 6;
const MILLISECONDS_TO_NANOSECONDS = Math.pow(10, NANOSECOND_DIGITS_IN_MILLIS);
const SECOND_TO_NANOSECONDS = Math.pow(10, NANOSECOND_DIGITS);
function millisToHrTime(epochMillis) {
  const epochSeconds = epochMillis / 1e3;
  const seconds = Math.trunc(epochSeconds);
  const nanos = Math.round(epochMillis % 1e3 * MILLISECONDS_TO_NANOSECONDS);
  return [seconds, nanos];
}
function getTimeOrigin() {
  return otperformance.timeOrigin;
}
function hrTime(performanceNow) {
  const timeOrigin = millisToHrTime(otperformance.timeOrigin);
  const now = millisToHrTime(typeof performanceNow === "number" ? performanceNow : otperformance.now());
  return addHrTimes(timeOrigin, now);
}
function timeInputToHrTime(time) {
  if (isTimeInputHrTime(time)) {
    return time;
  } else if (typeof time === "number") {
    if (time < otperformance.timeOrigin) {
      return hrTime(time);
    } else {
      return millisToHrTime(time);
    }
  } else if (time instanceof Date) {
    return millisToHrTime(time.getTime());
  } else {
    throw TypeError("Invalid input type");
  }
}
function hrTimeDuration(startTime, endTime) {
  let seconds = endTime[0] - startTime[0];
  let nanos = endTime[1] - startTime[1];
  if (nanos < 0) {
    seconds -= 1;
    nanos += SECOND_TO_NANOSECONDS;
  }
  return [seconds, nanos];
}
function hrTimeToTimeStamp(time) {
  const precision = NANOSECOND_DIGITS;
  const tmp = `${"0".repeat(precision)}${time[1]}Z`;
  const nanoString = tmp.substring(tmp.length - precision - 1);
  const date = new Date(time[0] * 1e3).toISOString();
  return date.replace("000Z", nanoString);
}
function hrTimeToNanoseconds(time) {
  return time[0] * SECOND_TO_NANOSECONDS + time[1];
}
function hrTimeToMilliseconds(time) {
  return time[0] * 1e3 + time[1] / 1e6;
}
function hrTimeToMicroseconds(time) {
  return time[0] * 1e6 + time[1] / 1e3;
}
function isTimeInputHrTime(value) {
  return Array.isArray(value) && value.length === 2 && typeof value[0] === "number" && typeof value[1] === "number";
}
function isTimeInput(value) {
  return isTimeInputHrTime(value) || typeof value === "number" || value instanceof Date;
}
function addHrTimes(time1, time2) {
  const out = [time1[0] + time2[0], time1[1] + time2[1]];
  if (out[1] >= SECOND_TO_NANOSECONDS) {
    out[1] -= SECOND_TO_NANOSECONDS;
    out[0] += 1;
  }
  return out;
}
function unrefTimer(timer) {
  if (typeof timer !== "number") {
    timer.unref();
  }
}
var ExportResultCode;
(function(ExportResultCode2) {
  ExportResultCode2[ExportResultCode2["SUCCESS"] = 0] = "SUCCESS";
  ExportResultCode2[ExportResultCode2["FAILED"] = 1] = "FAILED";
})(ExportResultCode || (ExportResultCode = {}));
class CompositePropagator {
  _propagators;
  _fields;
  /**
   * Construct a composite propagator from a list of propagators.
   *
   * @param [config] Configuration object for composite propagator
   */
  constructor(config2 = {}) {
    this._propagators = config2.propagators ?? [];
    this._fields = Array.from(new Set(this._propagators.map((p) => typeof p.fields === "function" ? p.fields() : []).reduce((x, y) => x.concat(y), [])));
  }
  /**
   * Run each of the configured propagators with the given context and carrier.
   * Propagators are run in the order they are configured, so if multiple
   * propagators write the same carrier key, the propagator later in the list
   * will "win".
   *
   * @param context Context to inject
   * @param carrier Carrier into which context will be injected
   */
  inject(context2, carrier, setter) {
    for (const propagator2 of this._propagators) {
      try {
        propagator2.inject(context2, carrier, setter);
      } catch (err) {
        diag.warn(`Failed to inject with ${propagator2.constructor.name}. Err: ${err.message}`);
      }
    }
  }
  /**
   * Run each of the configured propagators with the given context and carrier.
   * Propagators are run in the order they are configured, so if multiple
   * propagators write the same context key, the propagator later in the list
   * will "win".
   *
   * @param context Context to add values to
   * @param carrier Carrier from which to extract context
   */
  extract(context2, carrier, getter) {
    return this._propagators.reduce((ctx, propagator2) => {
      try {
        return propagator2.extract(ctx, carrier, getter);
      } catch (err) {
        diag.warn(`Failed to extract with ${propagator2.constructor.name}. Err: ${err.message}`);
      }
      return ctx;
    }, context2);
  }
  fields() {
    return this._fields.slice();
  }
}
const VALID_KEY_CHAR_RANGE = "[_0-9a-z-*/]";
const VALID_KEY = `[a-z]${VALID_KEY_CHAR_RANGE}{0,255}`;
const VALID_VENDOR_KEY = `[a-z0-9]${VALID_KEY_CHAR_RANGE}{0,240}@[a-z]${VALID_KEY_CHAR_RANGE}{0,13}`;
const VALID_KEY_REGEX = new RegExp(`^(?:${VALID_KEY}|${VALID_VENDOR_KEY})$`);
const VALID_VALUE_BASE_REGEX = /^[ -~]{0,255}[!-~]$/;
const INVALID_VALUE_COMMA_EQUAL_REGEX = /,|=/;
function validateKey(key) {
  return VALID_KEY_REGEX.test(key);
}
function validateValue(value) {
  return VALID_VALUE_BASE_REGEX.test(value) && !INVALID_VALUE_COMMA_EQUAL_REGEX.test(value);
}
const MAX_TRACE_STATE_ITEMS = 32;
const MAX_TRACE_STATE_LEN = 512;
const LIST_MEMBERS_SEPARATOR = ",";
const LIST_MEMBER_KEY_VALUE_SPLITTER = "=";
class TraceState {
  _internalState = /* @__PURE__ */ new Map();
  constructor(rawTraceState) {
    if (rawTraceState)
      this._parse(rawTraceState);
  }
  set(key, value) {
    const traceState = this._clone();
    if (traceState._internalState.has(key)) {
      traceState._internalState.delete(key);
    }
    traceState._internalState.set(key, value);
    return traceState;
  }
  unset(key) {
    const traceState = this._clone();
    traceState._internalState.delete(key);
    return traceState;
  }
  get(key) {
    return this._internalState.get(key);
  }
  serialize() {
    return this._keys().reduce((agg, key) => {
      agg.push(key + LIST_MEMBER_KEY_VALUE_SPLITTER + this.get(key));
      return agg;
    }, []).join(LIST_MEMBERS_SEPARATOR);
  }
  _parse(rawTraceState) {
    if (rawTraceState.length > MAX_TRACE_STATE_LEN)
      return;
    this._internalState = rawTraceState.split(LIST_MEMBERS_SEPARATOR).reverse().reduce((agg, part) => {
      const listMember = part.trim();
      const i = listMember.indexOf(LIST_MEMBER_KEY_VALUE_SPLITTER);
      if (i !== -1) {
        const key = listMember.slice(0, i);
        const value = listMember.slice(i + 1, part.length);
        if (validateKey(key) && validateValue(value)) {
          agg.set(key, value);
        }
      }
      return agg;
    }, /* @__PURE__ */ new Map());
    if (this._internalState.size > MAX_TRACE_STATE_ITEMS) {
      this._internalState = new Map(Array.from(this._internalState.entries()).reverse().slice(0, MAX_TRACE_STATE_ITEMS));
    }
  }
  _keys() {
    return Array.from(this._internalState.keys()).reverse();
  }
  _clone() {
    const traceState = new TraceState();
    traceState._internalState = new Map(this._internalState);
    return traceState;
  }
}
const TRACE_PARENT_HEADER = "traceparent";
const TRACE_STATE_HEADER = "tracestate";
const VERSION$1 = "00";
const VERSION_PART = "(?!ff)[\\da-f]{2}";
const TRACE_ID_PART = "(?![0]{32})[\\da-f]{32}";
const PARENT_ID_PART = "(?![0]{16})[\\da-f]{16}";
const FLAGS_PART = "[\\da-f]{2}";
const TRACE_PARENT_REGEX = new RegExp(`^\\s?(${VERSION_PART})-(${TRACE_ID_PART})-(${PARENT_ID_PART})-(${FLAGS_PART})(-.*)?\\s?$`);
function parseTraceParent(traceParent) {
  const match = TRACE_PARENT_REGEX.exec(traceParent);
  if (!match)
    return null;
  if (match[1] === "00" && match[5])
    return null;
  return {
    traceId: match[2],
    spanId: match[3],
    traceFlags: parseInt(match[4], 16)
  };
}
class W3CTraceContextPropagator {
  inject(context2, carrier, setter) {
    const spanContext = trace.getSpanContext(context2);
    if (!spanContext || isTracingSuppressed(context2) || !isSpanContextValid(spanContext))
      return;
    const traceParent = `${VERSION$1}-${spanContext.traceId}-${spanContext.spanId}-0${Number(spanContext.traceFlags || TraceFlags.NONE).toString(16)}`;
    setter.set(carrier, TRACE_PARENT_HEADER, traceParent);
    if (spanContext.traceState) {
      setter.set(carrier, TRACE_STATE_HEADER, spanContext.traceState.serialize());
    }
  }
  extract(context2, carrier, getter) {
    const traceParentHeader = getter.get(carrier, TRACE_PARENT_HEADER);
    if (!traceParentHeader)
      return context2;
    const traceParent = Array.isArray(traceParentHeader) ? traceParentHeader[0] : traceParentHeader;
    if (typeof traceParent !== "string")
      return context2;
    const spanContext = parseTraceParent(traceParent);
    if (!spanContext)
      return context2;
    spanContext.isRemote = true;
    const traceStateHeader = getter.get(carrier, TRACE_STATE_HEADER);
    if (traceStateHeader) {
      const state = Array.isArray(traceStateHeader) ? traceStateHeader.join(",") : traceStateHeader;
      spanContext.traceState = new TraceState(typeof state === "string" ? state : void 0);
    }
    return trace.setSpanContext(context2, spanContext);
  }
  fields() {
    return [TRACE_PARENT_HEADER, TRACE_STATE_HEADER];
  }
}
const RPC_METADATA_KEY = createContextKey("OpenTelemetry SDK Context Key RPC_METADATA");
var RPCType;
(function(RPCType2) {
  RPCType2["HTTP"] = "http";
})(RPCType || (RPCType = {}));
function setRPCMetadata(context2, meta) {
  return context2.setValue(RPC_METADATA_KEY, meta);
}
function deleteRPCMetadata(context2) {
  return context2.deleteValue(RPC_METADATA_KEY);
}
function getRPCMetadata(context2) {
  return context2.getValue(RPC_METADATA_KEY);
}
const objectTag = "[object Object]";
const nullTag = "[object Null]";
const undefinedTag = "[object Undefined]";
const funcProto = Function.prototype;
const funcToString = funcProto.toString;
const objectCtorString = funcToString.call(Object);
const getPrototypeOf = Object.getPrototypeOf;
const objectProto = Object.prototype;
const hasOwnProperty = objectProto.hasOwnProperty;
const symToStringTag = Symbol ? Symbol.toStringTag : void 0;
const nativeObjectToString = objectProto.toString;
function isPlainObject(value) {
  if (!isObjectLike(value) || baseGetTag(value) !== objectTag) {
    return false;
  }
  const proto = getPrototypeOf(value);
  if (proto === null) {
    return true;
  }
  const Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
  return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) === objectCtorString;
}
function isObjectLike(value) {
  return value != null && typeof value == "object";
}
function baseGetTag(value) {
  if (value == null) {
    return value === void 0 ? undefinedTag : nullTag;
  }
  return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
}
function getRawTag(value) {
  const isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
  let unmasked = false;
  try {
    value[symToStringTag] = void 0;
    unmasked = true;
  } catch {
  }
  const result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}
function objectToString(value) {
  return nativeObjectToString.call(value);
}
const MAX_LEVEL = 20;
function merge(...args) {
  let result = args.shift();
  const objects = /* @__PURE__ */ new WeakMap();
  while (args.length > 0) {
    result = mergeTwoObjects(result, args.shift(), 0, objects);
  }
  return result;
}
function takeValue(value) {
  if (isArray(value)) {
    return value.slice();
  }
  return value;
}
function mergeTwoObjects(one, two, level = 0, objects) {
  let result;
  if (level > MAX_LEVEL) {
    return void 0;
  }
  level++;
  if (isPrimitive(one) || isPrimitive(two) || isFunction(two)) {
    result = takeValue(two);
  } else if (isArray(one)) {
    result = one.slice();
    if (isArray(two)) {
      for (let i = 0, j = two.length; i < j; i++) {
        result.push(takeValue(two[i]));
      }
    } else if (isObject$1(two)) {
      const keys = Object.keys(two);
      for (let i = 0, j = keys.length; i < j; i++) {
        const key = keys[i];
        result[key] = takeValue(two[key]);
      }
    }
  } else if (isObject$1(one)) {
    if (isObject$1(two)) {
      if (!shouldMerge(one, two)) {
        return two;
      }
      result = Object.assign({}, one);
      const keys = Object.keys(two);
      for (let i = 0, j = keys.length; i < j; i++) {
        const key = keys[i];
        const twoValue = two[key];
        if (isPrimitive(twoValue)) {
          if (typeof twoValue === "undefined") {
            delete result[key];
          } else {
            result[key] = twoValue;
          }
        } else {
          const obj1 = result[key];
          const obj2 = twoValue;
          if (wasObjectReferenced(one, key, objects) || wasObjectReferenced(two, key, objects)) {
            delete result[key];
          } else {
            if (isObject$1(obj1) && isObject$1(obj2)) {
              const arr1 = objects.get(obj1) || [];
              const arr2 = objects.get(obj2) || [];
              arr1.push({ obj: one, key });
              arr2.push({ obj: two, key });
              objects.set(obj1, arr1);
              objects.set(obj2, arr2);
            }
            result[key] = mergeTwoObjects(result[key], twoValue, level, objects);
          }
        }
      }
    } else {
      result = two;
    }
  }
  return result;
}
function wasObjectReferenced(obj, key, objects) {
  const arr = objects.get(obj[key]) || [];
  for (let i = 0, j = arr.length; i < j; i++) {
    const info = arr[i];
    if (info.key === key && info.obj === obj) {
      return true;
    }
  }
  return false;
}
function isArray(value) {
  return Array.isArray(value);
}
function isFunction(value) {
  return typeof value === "function";
}
function isObject$1(value) {
  return !isPrimitive(value) && !isArray(value) && !isFunction(value) && typeof value === "object";
}
function isPrimitive(value) {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean" || typeof value === "undefined" || value instanceof Date || value instanceof RegExp || value === null;
}
function shouldMerge(one, two) {
  if (!isPlainObject(one) || !isPlainObject(two)) {
    return false;
  }
  return true;
}
class TimeoutError extends Error {
  constructor(message) {
    super(message);
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}
function callWithTimeout(promise, timeout) {
  let timeoutHandle;
  const timeoutPromise = new Promise(function timeoutFunction(_resolve, reject) {
    timeoutHandle = setTimeout(function timeoutHandler() {
      reject(new TimeoutError("Operation timed out."));
    }, timeout);
  });
  return Promise.race([promise, timeoutPromise]).then((result) => {
    clearTimeout(timeoutHandle);
    return result;
  }, (reason) => {
    clearTimeout(timeoutHandle);
    throw reason;
  });
}
function urlMatches(url, urlToMatch) {
  if (typeof urlToMatch === "string") {
    return url === urlToMatch;
  } else {
    return !!url.match(urlToMatch);
  }
}
function isUrlIgnored(url, ignoredUrls) {
  if (!ignoredUrls) {
    return false;
  }
  for (const ignoreUrl of ignoredUrls) {
    if (urlMatches(url, ignoreUrl)) {
      return true;
    }
  }
  return false;
}
class Deferred {
  _promise;
  _resolve;
  _reject;
  constructor() {
    this._promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }
  get promise() {
    return this._promise;
  }
  resolve(val) {
    this._resolve(val);
  }
  reject(err) {
    this._reject(err);
  }
}
class BindOnceFuture {
  _isCalled = false;
  _deferred = new Deferred();
  _callback;
  _that;
  constructor(callback, that) {
    this._callback = callback;
    this._that = that;
  }
  get isCalled() {
    return this._isCalled;
  }
  get promise() {
    return this._deferred.promise;
  }
  call(...args) {
    if (!this._isCalled) {
      this._isCalled = true;
      try {
        Promise.resolve(this._callback.call(this._that, ...args)).then((val) => this._deferred.resolve(val), (err) => this._deferred.reject(err));
      } catch (err) {
        this._deferred.reject(err);
      }
    }
    return this._deferred.promise;
  }
}
const logLevelMap = {
  ALL: DiagLogLevel.ALL,
  VERBOSE: DiagLogLevel.VERBOSE,
  DEBUG: DiagLogLevel.DEBUG,
  INFO: DiagLogLevel.INFO,
  WARN: DiagLogLevel.WARN,
  ERROR: DiagLogLevel.ERROR,
  NONE: DiagLogLevel.NONE
};
function diagLogLevelFromString(value) {
  if (value == null) {
    return void 0;
  }
  const resolvedLogLevel = logLevelMap[value.toUpperCase()];
  if (resolvedLogLevel == null) {
    diag.warn(`Unknown log level "${value}", expected one of ${Object.keys(logLevelMap)}, using default`);
    return DiagLogLevel.INFO;
  }
  return resolvedLogLevel;
}
function _export(exporter, arg) {
  return new Promise((resolve) => {
    context.with(suppressTracing(context.active()), () => {
      exporter.export(arg, (result) => {
        resolve(result);
      });
    });
  });
}
const internal = {
  _export
};
const esm$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AnchoredClock,
  BindOnceFuture,
  CompositePropagator,
  get ExportResultCode() {
    return ExportResultCode;
  },
  get RPCType() {
    return RPCType;
  },
  SDK_INFO,
  TRACE_PARENT_HEADER,
  TRACE_STATE_HEADER,
  TimeoutError,
  TraceState,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
  _globalThis: _globalThis$2,
  addHrTimes,
  callWithTimeout,
  deleteRPCMetadata,
  diagLogLevelFromString,
  getBooleanFromEnv,
  getNumberFromEnv,
  getRPCMetadata,
  getStringFromEnv,
  getStringListFromEnv,
  getTimeOrigin,
  globalErrorHandler,
  hrTime,
  hrTimeDuration,
  hrTimeToMicroseconds,
  hrTimeToMilliseconds,
  hrTimeToNanoseconds,
  hrTimeToTimeStamp,
  internal,
  isAttributeValue,
  isTimeInput,
  isTimeInputHrTime,
  isTracingSuppressed,
  isUrlIgnored,
  loggingErrorHandler,
  merge,
  millisToHrTime,
  otperformance,
  parseKeyPairsIntoRecord,
  parseTraceParent,
  sanitizeAttributes,
  setGlobalErrorHandler,
  setRPCMetadata,
  suppressTracing,
  timeInputToHrTime,
  unrefTimer,
  unsuppressTracing,
  urlMatches
}, Symbol.toStringTag, { value: "Module" }));
const require$$1 = /* @__PURE__ */ getAugmentedNamespace(esm$1);
var version$l = {};
var hasRequiredVersion$k;
function requireVersion$k() {
  if (hasRequiredVersion$k) return version$l;
  hasRequiredVersion$k = 1;
  Object.defineProperty(version$l, "__esModule", { value: true });
  version$l.VERSION = void 0;
  version$l.VERSION = "0.211.0";
  return version$l;
}
var utils$g = {};
var semconv$c = {};
var hasRequiredSemconv$c;
function requireSemconv$c() {
  if (hasRequiredSemconv$c) return semconv$c;
  hasRequiredSemconv$c = 1;
  Object.defineProperty(semconv$c, "__esModule", { value: true });
  semconv$c.HTTP_FLAVOR_VALUE_HTTP_1_1 = semconv$c.NET_TRANSPORT_VALUE_IP_UDP = semconv$c.NET_TRANSPORT_VALUE_IP_TCP = semconv$c.ATTR_NET_TRANSPORT = semconv$c.ATTR_NET_PEER_PORT = semconv$c.ATTR_NET_PEER_NAME = semconv$c.ATTR_NET_PEER_IP = semconv$c.ATTR_NET_HOST_PORT = semconv$c.ATTR_NET_HOST_NAME = semconv$c.ATTR_NET_HOST_IP = semconv$c.ATTR_HTTP_USER_AGENT = semconv$c.ATTR_HTTP_URL = semconv$c.ATTR_HTTP_TARGET = semconv$c.ATTR_HTTP_STATUS_CODE = semconv$c.ATTR_HTTP_SERVER_NAME = semconv$c.ATTR_HTTP_SCHEME = semconv$c.ATTR_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED = semconv$c.ATTR_HTTP_RESPONSE_CONTENT_LENGTH = semconv$c.ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED = semconv$c.ATTR_HTTP_REQUEST_CONTENT_LENGTH = semconv$c.ATTR_HTTP_METHOD = semconv$c.ATTR_HTTP_HOST = semconv$c.ATTR_HTTP_FLAVOR = semconv$c.ATTR_HTTP_CLIENT_IP = semconv$c.USER_AGENT_SYNTHETIC_TYPE_VALUE_TEST = semconv$c.USER_AGENT_SYNTHETIC_TYPE_VALUE_BOT = semconv$c.ATTR_USER_AGENT_SYNTHETIC_TYPE = void 0;
  semconv$c.ATTR_USER_AGENT_SYNTHETIC_TYPE = "user_agent.synthetic.type";
  semconv$c.USER_AGENT_SYNTHETIC_TYPE_VALUE_BOT = "bot";
  semconv$c.USER_AGENT_SYNTHETIC_TYPE_VALUE_TEST = "test";
  semconv$c.ATTR_HTTP_CLIENT_IP = "http.client_ip";
  semconv$c.ATTR_HTTP_FLAVOR = "http.flavor";
  semconv$c.ATTR_HTTP_HOST = "http.host";
  semconv$c.ATTR_HTTP_METHOD = "http.method";
  semconv$c.ATTR_HTTP_REQUEST_CONTENT_LENGTH = "http.request_content_length";
  semconv$c.ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED = "http.request_content_length_uncompressed";
  semconv$c.ATTR_HTTP_RESPONSE_CONTENT_LENGTH = "http.response_content_length";
  semconv$c.ATTR_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED = "http.response_content_length_uncompressed";
  semconv$c.ATTR_HTTP_SCHEME = "http.scheme";
  semconv$c.ATTR_HTTP_SERVER_NAME = "http.server_name";
  semconv$c.ATTR_HTTP_STATUS_CODE = "http.status_code";
  semconv$c.ATTR_HTTP_TARGET = "http.target";
  semconv$c.ATTR_HTTP_URL = "http.url";
  semconv$c.ATTR_HTTP_USER_AGENT = "http.user_agent";
  semconv$c.ATTR_NET_HOST_IP = "net.host.ip";
  semconv$c.ATTR_NET_HOST_NAME = "net.host.name";
  semconv$c.ATTR_NET_HOST_PORT = "net.host.port";
  semconv$c.ATTR_NET_PEER_IP = "net.peer.ip";
  semconv$c.ATTR_NET_PEER_NAME = "net.peer.name";
  semconv$c.ATTR_NET_PEER_PORT = "net.peer.port";
  semconv$c.ATTR_NET_TRANSPORT = "net.transport";
  semconv$c.NET_TRANSPORT_VALUE_IP_TCP = "ip_tcp";
  semconv$c.NET_TRANSPORT_VALUE_IP_UDP = "ip_udp";
  semconv$c.HTTP_FLAVOR_VALUE_HTTP_1_1 = "1.1";
  return semconv$c;
}
var AttributeNames$9 = {};
var hasRequiredAttributeNames$7;
function requireAttributeNames$7() {
  if (hasRequiredAttributeNames$7) return AttributeNames$9;
  hasRequiredAttributeNames$7 = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.AttributeNames = void 0;
    (function(AttributeNames2) {
      AttributeNames2["HTTP_ERROR_NAME"] = "http.error_name";
      AttributeNames2["HTTP_ERROR_MESSAGE"] = "http.error_message";
      AttributeNames2["HTTP_STATUS_TEXT"] = "http.status_text";
    })(exports$1.AttributeNames || (exports$1.AttributeNames = {}));
  })(AttributeNames$9);
  return AttributeNames$9;
}
var internalTypes$8 = {};
var hasRequiredInternalTypes$8;
function requireInternalTypes$8() {
  if (hasRequiredInternalTypes$8) return internalTypes$8;
  hasRequiredInternalTypes$8 = 1;
  Object.defineProperty(internalTypes$8, "__esModule", { value: true });
  internalTypes$8.DEFAULT_QUERY_STRINGS_TO_REDACT = internalTypes$8.STR_REDACTED = internalTypes$8.SYNTHETIC_BOT_NAMES = internalTypes$8.SYNTHETIC_TEST_NAMES = void 0;
  internalTypes$8.SYNTHETIC_TEST_NAMES = ["alwayson"];
  internalTypes$8.SYNTHETIC_BOT_NAMES = ["googlebot", "bingbot"];
  internalTypes$8.STR_REDACTED = "REDACTED";
  internalTypes$8.DEFAULT_QUERY_STRINGS_TO_REDACT = [
    "sig",
    "Signature",
    "AWSAccessKeyId",
    "X-Goog-Signature"
  ];
  return internalTypes$8;
}
var error;
var hasRequiredError;
function requireError() {
  if (hasRequiredError) return error;
  hasRequiredError = 1;
  var util2 = require$$0$1;
  function ParseError(message, input) {
    Error.captureStackTrace(this, ParseError);
    this.name = this.constructor.name;
    this.message = message;
    this.input = input;
  }
  util2.inherits(ParseError, Error);
  error = ParseError;
  return error;
}
var ascii;
var hasRequiredAscii;
function requireAscii() {
  if (hasRequiredAscii) return ascii;
  hasRequiredAscii = 1;
  function isDelimiter(code) {
    return code === 34 || code === 40 || code === 41 || code === 44 || code === 47 || code >= 58 && code <= 64 || code >= 91 && code <= 93 || code === 123 || code === 125;
  }
  function isTokenChar(code) {
    return code === 33 || code >= 35 && code <= 39 || code === 42 || code === 43 || code === 45 || code === 46 || code >= 48 && code <= 57 || code >= 65 && code <= 90 || code >= 94 && code <= 122 || code === 124 || code === 126;
  }
  function isPrint(code) {
    return code >= 32 && code <= 126;
  }
  function isExtended(code) {
    return code >= 128 && code <= 255;
  }
  ascii = {
    isDelimiter,
    isTokenChar,
    isExtended,
    isPrint
  };
  return ascii;
}
var forwardedParse;
var hasRequiredForwardedParse;
function requireForwardedParse() {
  if (hasRequiredForwardedParse) return forwardedParse;
  hasRequiredForwardedParse = 1;
  var util2 = require$$0$1;
  var ParseError = requireError();
  var ascii2 = requireAscii();
  var isDelimiter = ascii2.isDelimiter;
  var isTokenChar = ascii2.isTokenChar;
  var isExtended = ascii2.isExtended;
  var isPrint = ascii2.isPrint;
  function decode(str) {
    return str.replace(/\\(.)/g, "$1");
  }
  function unexpectedCharacterMessage(header, position) {
    return util2.format(
      "Unexpected character '%s' at index %d",
      header.charAt(position),
      position
    );
  }
  function parse(header) {
    var mustUnescape = false;
    var isEscaping = false;
    var inQuotes = false;
    var forwarded = {};
    var output = [];
    var start = -1;
    var end = -1;
    var parameter;
    var code;
    for (var i = 0; i < header.length; i++) {
      code = header.charCodeAt(i);
      if (parameter === void 0) {
        if (i !== 0 && start === -1 && (code === 32 || code === 9)) {
          continue;
        }
        if (isTokenChar(code)) {
          if (start === -1) start = i;
        } else if (code === 61 && start !== -1) {
          parameter = header.slice(start, i).toLowerCase();
          start = -1;
        } else {
          throw new ParseError(unexpectedCharacterMessage(header, i), header);
        }
      } else {
        if (isEscaping && (code === 9 || isPrint(code) || isExtended(code))) {
          isEscaping = false;
        } else if (isTokenChar(code)) {
          if (end !== -1) {
            throw new ParseError(unexpectedCharacterMessage(header, i), header);
          }
          if (start === -1) start = i;
        } else if (isDelimiter(code) || isExtended(code)) {
          if (inQuotes) {
            if (code === 34) {
              inQuotes = false;
              end = i;
            } else if (code === 92) {
              if (start === -1) start = i;
              isEscaping = mustUnescape = true;
            } else if (start === -1) {
              start = i;
            }
          } else if (code === 34 && header.charCodeAt(i - 1) === 61) {
            inQuotes = true;
          } else if ((code === 44 || code === 59) && (start !== -1 || end !== -1)) {
            if (start !== -1) {
              if (end === -1) end = i;
              forwarded[parameter] = mustUnescape ? decode(header.slice(start, end)) : header.slice(start, end);
            } else {
              forwarded[parameter] = "";
            }
            if (code === 44) {
              output.push(forwarded);
              forwarded = {};
            }
            parameter = void 0;
            start = end = -1;
          } else {
            throw new ParseError(unexpectedCharacterMessage(header, i), header);
          }
        } else if (code === 32 || code === 9) {
          if (end !== -1) continue;
          if (inQuotes) {
            if (start === -1) start = i;
          } else if (start !== -1) {
            end = i;
          } else {
            throw new ParseError(unexpectedCharacterMessage(header, i), header);
          }
        } else {
          throw new ParseError(unexpectedCharacterMessage(header, i), header);
        }
      }
    }
    if (parameter === void 0 || inQuotes || start === -1 && end === -1 || code === 32 || code === 9) {
      throw new ParseError("Unexpected end of input", header);
    }
    if (start !== -1) {
      if (end === -1) end = i;
      forwarded[parameter] = mustUnescape ? decode(header.slice(start, end)) : header.slice(start, end);
    } else {
      forwarded[parameter] = "";
    }
    output.push(forwarded);
    return output;
  }
  forwardedParse = parse;
  return forwardedParse;
}
var hasRequiredUtils$g;
function requireUtils$g() {
  if (hasRequiredUtils$g) return utils$g;
  hasRequiredUtils$g = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.headerCapture = exports$1.getIncomingStableRequestMetricAttributesOnResponse = exports$1.getIncomingRequestMetricAttributesOnResponse = exports$1.getIncomingRequestAttributesOnResponse = exports$1.getIncomingRequestMetricAttributes = exports$1.getIncomingRequestAttributes = exports$1.getRemoteClientAddress = exports$1.getOutgoingStableRequestMetricAttributesOnResponse = exports$1.getOutgoingRequestMetricAttributesOnResponse = exports$1.getOutgoingRequestAttributesOnResponse = exports$1.setAttributesFromHttpKind = exports$1.getOutgoingRequestMetricAttributes = exports$1.getOutgoingRequestAttributes = exports$1.extractHostnameAndPort = exports$1.isValidOptionsType = exports$1.getRequestInfo = exports$1.isCompressed = exports$1.setResponseContentLengthAttribute = exports$1.setRequestContentLengthAttribute = exports$1.setSpanWithError = exports$1.satisfiesPattern = exports$1.parseResponseStatus = exports$1.getAbsoluteUrl = void 0;
    const api_1 = require$$0$2;
    const semantic_conventions_1 = require$$2$1;
    const semconv_1 = /* @__PURE__ */ requireSemconv$c();
    const core_1 = require$$1;
    const instrumentation_1 = require$$2;
    const url = require$$2$2;
    const AttributeNames_1 = /* @__PURE__ */ requireAttributeNames$7();
    const internal_types_1 = /* @__PURE__ */ requireInternalTypes$8();
    const internal_types_2 = /* @__PURE__ */ requireInternalTypes$8();
    const forwardedParse2 = requireForwardedParse();
    const getAbsoluteUrl2 = (requestUrl, headers, fallbackProtocol = "http:", redactedQueryParams = Array.from(internal_types_2.DEFAULT_QUERY_STRINGS_TO_REDACT)) => {
      const reqUrlObject = requestUrl || {};
      const protocol = reqUrlObject.protocol || fallbackProtocol;
      const port = (reqUrlObject.port || "").toString();
      let path = reqUrlObject.path || "/";
      let host = reqUrlObject.host || reqUrlObject.hostname || headers.host || "localhost";
      if (host.indexOf(":") === -1 && port && port !== "80" && port !== "443") {
        host += `:${port}`;
      }
      if (path.includes("?")) {
        try {
          const parsedUrl = new URL(path, "http://localhost");
          const sensitiveParamsToRedact = redactedQueryParams || [];
          for (const sensitiveParam of sensitiveParamsToRedact) {
            if (parsedUrl.searchParams.get(sensitiveParam)) {
              parsedUrl.searchParams.set(sensitiveParam, internal_types_2.STR_REDACTED);
            }
          }
          path = `${parsedUrl.pathname}${parsedUrl.search}`;
        } catch {
        }
      }
      const authPart = reqUrlObject.auth ? `${internal_types_2.STR_REDACTED}:${internal_types_2.STR_REDACTED}@` : "";
      return `${protocol}//${authPart}${host}${path}`;
    };
    exports$1.getAbsoluteUrl = getAbsoluteUrl2;
    const parseResponseStatus = (kind, statusCode) => {
      const upperBound = kind === api_1.SpanKind.CLIENT ? 400 : 500;
      if (statusCode && statusCode >= 100 && statusCode < upperBound) {
        return api_1.SpanStatusCode.UNSET;
      }
      return api_1.SpanStatusCode.ERROR;
    };
    exports$1.parseResponseStatus = parseResponseStatus;
    const satisfiesPattern = (constant, pattern) => {
      if (typeof pattern === "string") {
        return pattern === constant;
      } else if (pattern instanceof RegExp) {
        return pattern.test(constant);
      } else if (typeof pattern === "function") {
        return pattern(constant);
      } else {
        throw new TypeError("Pattern is in unsupported datatype");
      }
    };
    exports$1.satisfiesPattern = satisfiesPattern;
    const setSpanWithError = (span, error2, semconvStability) => {
      const message = error2.message;
      if (semconvStability & instrumentation_1.SemconvStability.OLD) {
        span.setAttribute(AttributeNames_1.AttributeNames.HTTP_ERROR_NAME, error2.name);
        span.setAttribute(AttributeNames_1.AttributeNames.HTTP_ERROR_MESSAGE, message);
      }
      if (semconvStability & instrumentation_1.SemconvStability.STABLE) {
        span.setAttribute(semantic_conventions_1.ATTR_ERROR_TYPE, error2.name);
      }
      span.setStatus({ code: api_1.SpanStatusCode.ERROR, message });
      span.recordException(error2);
    };
    exports$1.setSpanWithError = setSpanWithError;
    const setRequestContentLengthAttribute = (request, attributes) => {
      const length = getContentLength2(request.headers);
      if (length === null)
        return;
      if ((0, exports$1.isCompressed)(request.headers)) {
        attributes[semconv_1.ATTR_HTTP_REQUEST_CONTENT_LENGTH] = length;
      } else {
        attributes[semconv_1.ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED] = length;
      }
    };
    exports$1.setRequestContentLengthAttribute = setRequestContentLengthAttribute;
    const setResponseContentLengthAttribute = (response, attributes) => {
      const length = getContentLength2(response.headers);
      if (length === null)
        return;
      if ((0, exports$1.isCompressed)(response.headers)) {
        attributes[semconv_1.ATTR_HTTP_RESPONSE_CONTENT_LENGTH] = length;
      } else {
        attributes[semconv_1.ATTR_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED] = length;
      }
    };
    exports$1.setResponseContentLengthAttribute = setResponseContentLengthAttribute;
    function getContentLength2(headers) {
      const contentLengthHeader = headers["content-length"];
      if (contentLengthHeader === void 0)
        return null;
      const contentLength = parseInt(contentLengthHeader, 10);
      if (isNaN(contentLength))
        return null;
      return contentLength;
    }
    const isCompressed2 = (headers) => {
      const encoding = headers["content-encoding"];
      return !!encoding && encoding !== "identity";
    };
    exports$1.isCompressed = isCompressed2;
    function stringUrlToHttpOptions(stringUrl) {
      const { hostname, pathname, port, username, password, search, protocol, hash, href, origin, host } = new URL(stringUrl);
      const options = {
        protocol,
        hostname: hostname && hostname[0] === "[" ? hostname.slice(1, -1) : hostname,
        hash,
        search,
        pathname,
        path: `${pathname || ""}${search || ""}`,
        href,
        origin,
        host
      };
      if (port !== "") {
        options.port = Number(port);
      }
      if (username || password) {
        options.auth = `${decodeURIComponent(username)}:${decodeURIComponent(password)}`;
      }
      return options;
    }
    const getRequestInfo = (logger2, options, extraOptions) => {
      let pathname;
      let origin;
      let optionsParsed;
      let invalidUrl = false;
      if (typeof options === "string") {
        try {
          const convertedOptions = stringUrlToHttpOptions(options);
          optionsParsed = convertedOptions;
          pathname = convertedOptions.pathname || "/";
        } catch (e) {
          invalidUrl = true;
          logger2.verbose("Unable to parse URL provided to HTTP request, using fallback to determine path. Original error:", e);
          optionsParsed = {
            path: options
          };
          pathname = optionsParsed.path || "/";
        }
        origin = `${optionsParsed.protocol || "http:"}//${optionsParsed.host}`;
        if (extraOptions !== void 0) {
          Object.assign(optionsParsed, extraOptions);
        }
      } else if (options instanceof url.URL) {
        optionsParsed = {
          protocol: options.protocol,
          hostname: typeof options.hostname === "string" && options.hostname.startsWith("[") ? options.hostname.slice(1, -1) : options.hostname,
          path: `${options.pathname || ""}${options.search || ""}`
        };
        if (options.port !== "") {
          optionsParsed.port = Number(options.port);
        }
        if (options.username || options.password) {
          optionsParsed.auth = `${options.username}:${options.password}`;
        }
        pathname = options.pathname;
        origin = options.origin;
        if (extraOptions !== void 0) {
          Object.assign(optionsParsed, extraOptions);
        }
      } else {
        optionsParsed = Object.assign({ protocol: options.host ? "http:" : void 0 }, options);
        const hostname = optionsParsed.host || (optionsParsed.port != null ? `${optionsParsed.hostname}${optionsParsed.port}` : optionsParsed.hostname);
        origin = `${optionsParsed.protocol || "http:"}//${hostname}`;
        pathname = options.pathname;
        if (!pathname && optionsParsed.path) {
          try {
            const parsedUrl = new URL(optionsParsed.path, origin);
            pathname = parsedUrl.pathname || "/";
          } catch {
            pathname = "/";
          }
        }
      }
      const method = optionsParsed.method ? optionsParsed.method.toUpperCase() : "GET";
      return { origin, pathname, method, optionsParsed, invalidUrl };
    };
    exports$1.getRequestInfo = getRequestInfo;
    const isValidOptionsType = (options) => {
      if (!options) {
        return false;
      }
      const type = typeof options;
      return type === "string" || type === "object" && !Array.isArray(options);
    };
    exports$1.isValidOptionsType = isValidOptionsType;
    const extractHostnameAndPort = (requestOptions) => {
      if (requestOptions.hostname && requestOptions.port) {
        return { hostname: requestOptions.hostname, port: requestOptions.port };
      }
      const matches = requestOptions.host?.match(/^([^:/ ]+)(:\d{1,5})?/) || null;
      const hostname = requestOptions.hostname || (matches === null ? "localhost" : matches[1]);
      let port = requestOptions.port;
      if (!port) {
        if (matches && matches[2]) {
          port = matches[2].substring(1);
        } else {
          port = requestOptions.protocol === "https:" ? "443" : "80";
        }
      }
      return { hostname, port };
    };
    exports$1.extractHostnameAndPort = extractHostnameAndPort;
    const getOutgoingRequestAttributes = (requestOptions, options, semconvStability, enableSyntheticSourceDetection) => {
      const hostname = options.hostname;
      const port = options.port;
      const method = requestOptions.method ?? "GET";
      const normalizedMethod = normalizeMethod(method);
      const headers = requestOptions.headers || {};
      const userAgent = headers["user-agent"];
      const urlFull = (0, exports$1.getAbsoluteUrl)(requestOptions, headers, `${options.component}:`, options.redactedQueryParams);
      const oldAttributes = {
        [semconv_1.ATTR_HTTP_URL]: urlFull,
        [semconv_1.ATTR_HTTP_METHOD]: method,
        [semconv_1.ATTR_HTTP_TARGET]: requestOptions.path || "/",
        [semconv_1.ATTR_NET_PEER_NAME]: hostname,
        [semconv_1.ATTR_HTTP_HOST]: headers.host ?? `${hostname}:${port}`
      };
      const newAttributes = {
        // Required attributes
        [semantic_conventions_1.ATTR_HTTP_REQUEST_METHOD]: normalizedMethod,
        [semantic_conventions_1.ATTR_SERVER_ADDRESS]: hostname,
        [semantic_conventions_1.ATTR_SERVER_PORT]: Number(port),
        [semantic_conventions_1.ATTR_URL_FULL]: urlFull,
        [semantic_conventions_1.ATTR_USER_AGENT_ORIGINAL]: userAgent
        // leaving out protocol version, it is not yet negotiated
        // leaving out protocol name, it is only required when protocol version is set
        // retries and redirects not supported
        // Opt-in attributes left off for now
      };
      if (method !== normalizedMethod) {
        newAttributes[semantic_conventions_1.ATTR_HTTP_REQUEST_METHOD_ORIGINAL] = method;
      }
      if (enableSyntheticSourceDetection && userAgent) {
        newAttributes[semconv_1.ATTR_USER_AGENT_SYNTHETIC_TYPE] = getSyntheticType(userAgent);
      }
      if (userAgent !== void 0) {
        oldAttributes[semconv_1.ATTR_HTTP_USER_AGENT] = userAgent;
      }
      switch (semconvStability) {
        case instrumentation_1.SemconvStability.STABLE:
          return Object.assign(newAttributes, options.hookAttributes);
        case instrumentation_1.SemconvStability.OLD:
          return Object.assign(oldAttributes, options.hookAttributes);
      }
      return Object.assign(oldAttributes, newAttributes, options.hookAttributes);
    };
    exports$1.getOutgoingRequestAttributes = getOutgoingRequestAttributes;
    const getOutgoingRequestMetricAttributes = (spanAttributes) => {
      const metricAttributes = {};
      metricAttributes[semconv_1.ATTR_HTTP_METHOD] = spanAttributes[semconv_1.ATTR_HTTP_METHOD];
      metricAttributes[semconv_1.ATTR_NET_PEER_NAME] = spanAttributes[semconv_1.ATTR_NET_PEER_NAME];
      return metricAttributes;
    };
    exports$1.getOutgoingRequestMetricAttributes = getOutgoingRequestMetricAttributes;
    const setAttributesFromHttpKind = (kind, attributes) => {
      if (kind) {
        attributes[semconv_1.ATTR_HTTP_FLAVOR] = kind;
        if (kind.toUpperCase() !== "QUIC") {
          attributes[semconv_1.ATTR_NET_TRANSPORT] = semconv_1.NET_TRANSPORT_VALUE_IP_TCP;
        } else {
          attributes[semconv_1.ATTR_NET_TRANSPORT] = semconv_1.NET_TRANSPORT_VALUE_IP_UDP;
        }
      }
    };
    exports$1.setAttributesFromHttpKind = setAttributesFromHttpKind;
    const getSyntheticType = (userAgent) => {
      const userAgentString = String(userAgent).toLowerCase();
      for (const name2 of internal_types_1.SYNTHETIC_TEST_NAMES) {
        if (userAgentString.includes(name2)) {
          return semconv_1.USER_AGENT_SYNTHETIC_TYPE_VALUE_TEST;
        }
      }
      for (const name2 of internal_types_1.SYNTHETIC_BOT_NAMES) {
        if (userAgentString.includes(name2)) {
          return semconv_1.USER_AGENT_SYNTHETIC_TYPE_VALUE_BOT;
        }
      }
      return;
    };
    const getOutgoingRequestAttributesOnResponse = (response, semconvStability) => {
      const { statusCode, statusMessage, httpVersion, socket } = response;
      const oldAttributes = {};
      const stableAttributes = {};
      if (statusCode != null) {
        stableAttributes[semantic_conventions_1.ATTR_HTTP_RESPONSE_STATUS_CODE] = statusCode;
      }
      if (socket) {
        const { remoteAddress, remotePort } = socket;
        oldAttributes[semconv_1.ATTR_NET_PEER_IP] = remoteAddress;
        oldAttributes[semconv_1.ATTR_NET_PEER_PORT] = remotePort;
        stableAttributes[semantic_conventions_1.ATTR_NETWORK_PEER_ADDRESS] = remoteAddress;
        stableAttributes[semantic_conventions_1.ATTR_NETWORK_PEER_PORT] = remotePort;
        stableAttributes[semantic_conventions_1.ATTR_NETWORK_PROTOCOL_VERSION] = response.httpVersion;
      }
      (0, exports$1.setResponseContentLengthAttribute)(response, oldAttributes);
      if (statusCode) {
        oldAttributes[semconv_1.ATTR_HTTP_STATUS_CODE] = statusCode;
        oldAttributes[AttributeNames_1.AttributeNames.HTTP_STATUS_TEXT] = (statusMessage || "").toUpperCase();
      }
      (0, exports$1.setAttributesFromHttpKind)(httpVersion, oldAttributes);
      switch (semconvStability) {
        case instrumentation_1.SemconvStability.STABLE:
          return stableAttributes;
        case instrumentation_1.SemconvStability.OLD:
          return oldAttributes;
      }
      return Object.assign(oldAttributes, stableAttributes);
    };
    exports$1.getOutgoingRequestAttributesOnResponse = getOutgoingRequestAttributesOnResponse;
    const getOutgoingRequestMetricAttributesOnResponse = (spanAttributes) => {
      const metricAttributes = {};
      metricAttributes[semconv_1.ATTR_NET_PEER_PORT] = spanAttributes[semconv_1.ATTR_NET_PEER_PORT];
      metricAttributes[semconv_1.ATTR_HTTP_STATUS_CODE] = spanAttributes[semconv_1.ATTR_HTTP_STATUS_CODE];
      metricAttributes[semconv_1.ATTR_HTTP_FLAVOR] = spanAttributes[semconv_1.ATTR_HTTP_FLAVOR];
      return metricAttributes;
    };
    exports$1.getOutgoingRequestMetricAttributesOnResponse = getOutgoingRequestMetricAttributesOnResponse;
    const getOutgoingStableRequestMetricAttributesOnResponse = (spanAttributes) => {
      const metricAttributes = {};
      if (spanAttributes[semantic_conventions_1.ATTR_NETWORK_PROTOCOL_VERSION]) {
        metricAttributes[semantic_conventions_1.ATTR_NETWORK_PROTOCOL_VERSION] = spanAttributes[semantic_conventions_1.ATTR_NETWORK_PROTOCOL_VERSION];
      }
      if (spanAttributes[semantic_conventions_1.ATTR_HTTP_RESPONSE_STATUS_CODE]) {
        metricAttributes[semantic_conventions_1.ATTR_HTTP_RESPONSE_STATUS_CODE] = spanAttributes[semantic_conventions_1.ATTR_HTTP_RESPONSE_STATUS_CODE];
      }
      return metricAttributes;
    };
    exports$1.getOutgoingStableRequestMetricAttributesOnResponse = getOutgoingStableRequestMetricAttributesOnResponse;
    function parseHostHeader(hostHeader, proto) {
      const parts = hostHeader.split(":");
      if (parts.length === 1) {
        if (proto === "http") {
          return { host: parts[0], port: "80" };
        }
        if (proto === "https") {
          return { host: parts[0], port: "443" };
        }
        return { host: parts[0] };
      }
      if (parts.length === 2) {
        return {
          host: parts[0],
          port: parts[1]
        };
      }
      if (parts[0].startsWith("[")) {
        if (parts[parts.length - 1].endsWith("]")) {
          if (proto === "http") {
            return { host: hostHeader, port: "80" };
          }
          if (proto === "https") {
            return { host: hostHeader, port: "443" };
          }
        } else if (parts[parts.length - 2].endsWith("]")) {
          return {
            host: parts.slice(0, -1).join(":"),
            port: parts[parts.length - 1]
          };
        }
      }
      return { host: hostHeader };
    }
    function getServerAddress(request, component) {
      const forwardedHeader = request.headers["forwarded"];
      if (forwardedHeader) {
        for (const entry of parseForwardedHeader2(forwardedHeader)) {
          if (entry.host) {
            return parseHostHeader(entry.host, entry.proto);
          }
        }
      }
      const xForwardedHost = request.headers["x-forwarded-host"];
      if (typeof xForwardedHost === "string") {
        if (typeof request.headers["x-forwarded-proto"] === "string") {
          return parseHostHeader(xForwardedHost, request.headers["x-forwarded-proto"]);
        }
        if (Array.isArray(request.headers["x-forwarded-proto"])) {
          return parseHostHeader(xForwardedHost, request.headers["x-forwarded-proto"][0]);
        }
        return parseHostHeader(xForwardedHost);
      } else if (Array.isArray(xForwardedHost) && typeof xForwardedHost[0] === "string" && xForwardedHost[0].length > 0) {
        if (typeof request.headers["x-forwarded-proto"] === "string") {
          return parseHostHeader(xForwardedHost[0], request.headers["x-forwarded-proto"]);
        }
        if (Array.isArray(request.headers["x-forwarded-proto"])) {
          return parseHostHeader(xForwardedHost[0], request.headers["x-forwarded-proto"][0]);
        }
        return parseHostHeader(xForwardedHost[0]);
      }
      const host = request.headers["host"];
      if (typeof host === "string" && host.length > 0) {
        return parseHostHeader(host, component);
      }
      return null;
    }
    function getRemoteClientAddress(request) {
      const forwardedHeader = request.headers["forwarded"];
      if (forwardedHeader) {
        for (const entry of parseForwardedHeader2(forwardedHeader)) {
          if (entry.for) {
            return removePortFromAddress(entry.for);
          }
        }
      }
      const xForwardedFor = request.headers["x-forwarded-for"];
      if (xForwardedFor) {
        let xForwardedForVal;
        if (typeof xForwardedFor === "string") {
          xForwardedForVal = xForwardedFor;
        } else if (Array.isArray(xForwardedFor)) {
          xForwardedForVal = xForwardedFor[0];
        }
        if (typeof xForwardedForVal === "string") {
          xForwardedForVal = xForwardedForVal.split(",")[0].trim();
          return removePortFromAddress(xForwardedForVal);
        }
      }
      const remote = request.socket.remoteAddress;
      if (remote) {
        return remote;
      }
      return null;
    }
    exports$1.getRemoteClientAddress = getRemoteClientAddress;
    function removePortFromAddress(input) {
      try {
        const { hostname: address } = new URL(`http://${input}`);
        if (address.startsWith("[") && address.endsWith("]")) {
          return address.slice(1, -1);
        }
        return address;
      } catch {
        return input;
      }
    }
    function getInfoFromIncomingMessage(component, request, logger2) {
      try {
        if (request.headers.host) {
          return new URL(request.url ?? "/", `${component}://${request.headers.host}`);
        } else {
          const unsafeParsedUrl = new URL(
            request.url ?? "/",
            // using localhost as a workaround to still use the URL constructor for parsing
            `${component}://localhost`
          );
          return {
            pathname: unsafeParsedUrl.pathname,
            search: unsafeParsedUrl.search,
            toString: function() {
              return unsafeParsedUrl.pathname + unsafeParsedUrl.search;
            }
          };
        }
      } catch (e) {
        logger2.verbose("Unable to get URL from request", e);
        return {};
      }
    }
    const getIncomingRequestAttributes = (request, options, logger2) => {
      const { component, enableSyntheticSourceDetection, hookAttributes, semconvStability, serverName } = options;
      const { headers, httpVersion, method } = request;
      const { host, "user-agent": userAgent, "x-forwarded-for": ips } = headers;
      const parsedUrl = getInfoFromIncomingMessage(component, request, logger2);
      let newAttributes;
      let oldAttributes;
      if (semconvStability !== instrumentation_1.SemconvStability.OLD) {
        const normalizedMethod = normalizeMethod(method);
        const serverAddress = getServerAddress(request, component);
        const remoteClientAddress = getRemoteClientAddress(request);
        newAttributes = {
          [semantic_conventions_1.ATTR_HTTP_REQUEST_METHOD]: normalizedMethod,
          [semantic_conventions_1.ATTR_URL_SCHEME]: component,
          [semantic_conventions_1.ATTR_SERVER_ADDRESS]: serverAddress?.host,
          [semantic_conventions_1.ATTR_NETWORK_PEER_ADDRESS]: request.socket.remoteAddress,
          [semantic_conventions_1.ATTR_NETWORK_PEER_PORT]: request.socket.remotePort,
          [semantic_conventions_1.ATTR_NETWORK_PROTOCOL_VERSION]: request.httpVersion,
          [semantic_conventions_1.ATTR_USER_AGENT_ORIGINAL]: userAgent
        };
        if (parsedUrl.pathname != null) {
          newAttributes[semantic_conventions_1.ATTR_URL_PATH] = parsedUrl.pathname;
        }
        if (parsedUrl.search) {
          newAttributes[semantic_conventions_1.ATTR_URL_QUERY] = parsedUrl.search.slice(1);
        }
        if (remoteClientAddress != null) {
          newAttributes[semantic_conventions_1.ATTR_CLIENT_ADDRESS] = remoteClientAddress;
        }
        if (serverAddress?.port != null) {
          newAttributes[semantic_conventions_1.ATTR_SERVER_PORT] = Number(serverAddress.port);
        }
        if (method !== normalizedMethod) {
          newAttributes[semantic_conventions_1.ATTR_HTTP_REQUEST_METHOD_ORIGINAL] = method;
        }
        if (enableSyntheticSourceDetection && userAgent) {
          newAttributes[semconv_1.ATTR_USER_AGENT_SYNTHETIC_TYPE] = getSyntheticType(userAgent);
        }
      }
      if (semconvStability !== instrumentation_1.SemconvStability.STABLE) {
        const hostname = host?.replace(/^(.*)(:[0-9]{1,5})/, "$1") || "localhost";
        oldAttributes = {
          [semconv_1.ATTR_HTTP_URL]: parsedUrl.toString(),
          [semconv_1.ATTR_HTTP_HOST]: host,
          [semconv_1.ATTR_NET_HOST_NAME]: hostname,
          [semconv_1.ATTR_HTTP_METHOD]: method,
          [semconv_1.ATTR_HTTP_SCHEME]: component
        };
        if (typeof ips === "string") {
          oldAttributes[semconv_1.ATTR_HTTP_CLIENT_IP] = ips.split(",")[0];
        }
        if (typeof serverName === "string") {
          oldAttributes[semconv_1.ATTR_HTTP_SERVER_NAME] = serverName;
        }
        if (parsedUrl.pathname) {
          oldAttributes[semconv_1.ATTR_HTTP_TARGET] = parsedUrl.pathname + parsedUrl.search || "/";
        }
        if (userAgent !== void 0) {
          oldAttributes[semconv_1.ATTR_HTTP_USER_AGENT] = userAgent;
        }
        (0, exports$1.setRequestContentLengthAttribute)(request, oldAttributes);
        (0, exports$1.setAttributesFromHttpKind)(httpVersion, oldAttributes);
      }
      switch (semconvStability) {
        case instrumentation_1.SemconvStability.STABLE:
          return Object.assign(newAttributes, hookAttributes);
        case instrumentation_1.SemconvStability.OLD:
          return Object.assign(oldAttributes, hookAttributes);
        default:
          return Object.assign(oldAttributes, newAttributes, hookAttributes);
      }
    };
    exports$1.getIncomingRequestAttributes = getIncomingRequestAttributes;
    const getIncomingRequestMetricAttributes = (spanAttributes) => {
      const metricAttributes = {};
      metricAttributes[semconv_1.ATTR_HTTP_SCHEME] = spanAttributes[semconv_1.ATTR_HTTP_SCHEME];
      metricAttributes[semconv_1.ATTR_HTTP_METHOD] = spanAttributes[semconv_1.ATTR_HTTP_METHOD];
      metricAttributes[semconv_1.ATTR_NET_HOST_NAME] = spanAttributes[semconv_1.ATTR_NET_HOST_NAME];
      metricAttributes[semconv_1.ATTR_HTTP_FLAVOR] = spanAttributes[semconv_1.ATTR_HTTP_FLAVOR];
      return metricAttributes;
    };
    exports$1.getIncomingRequestMetricAttributes = getIncomingRequestMetricAttributes;
    const getIncomingRequestAttributesOnResponse2 = (request, response, semconvStability) => {
      const { socket } = request;
      const { statusCode, statusMessage } = response;
      const newAttributes = {
        [semantic_conventions_1.ATTR_HTTP_RESPONSE_STATUS_CODE]: statusCode
      };
      const rpcMetadata = (0, core_1.getRPCMetadata)(api_1.context.active());
      const oldAttributes = {};
      if (socket) {
        const { localAddress, localPort, remoteAddress, remotePort } = socket;
        oldAttributes[semconv_1.ATTR_NET_HOST_IP] = localAddress;
        oldAttributes[semconv_1.ATTR_NET_HOST_PORT] = localPort;
        oldAttributes[semconv_1.ATTR_NET_PEER_IP] = remoteAddress;
        oldAttributes[semconv_1.ATTR_NET_PEER_PORT] = remotePort;
      }
      oldAttributes[semconv_1.ATTR_HTTP_STATUS_CODE] = statusCode;
      oldAttributes[AttributeNames_1.AttributeNames.HTTP_STATUS_TEXT] = (statusMessage || "").toUpperCase();
      if (rpcMetadata?.type === core_1.RPCType.HTTP && rpcMetadata.route !== void 0) {
        oldAttributes[semantic_conventions_1.ATTR_HTTP_ROUTE] = rpcMetadata.route;
        newAttributes[semantic_conventions_1.ATTR_HTTP_ROUTE] = rpcMetadata.route;
      }
      switch (semconvStability) {
        case instrumentation_1.SemconvStability.STABLE:
          return newAttributes;
        case instrumentation_1.SemconvStability.OLD:
          return oldAttributes;
      }
      return Object.assign(oldAttributes, newAttributes);
    };
    exports$1.getIncomingRequestAttributesOnResponse = getIncomingRequestAttributesOnResponse2;
    const getIncomingRequestMetricAttributesOnResponse = (spanAttributes) => {
      const metricAttributes = {};
      metricAttributes[semconv_1.ATTR_HTTP_STATUS_CODE] = spanAttributes[semconv_1.ATTR_HTTP_STATUS_CODE];
      metricAttributes[semconv_1.ATTR_NET_HOST_PORT] = spanAttributes[semconv_1.ATTR_NET_HOST_PORT];
      if (spanAttributes[semantic_conventions_1.ATTR_HTTP_ROUTE] !== void 0) {
        metricAttributes[semantic_conventions_1.ATTR_HTTP_ROUTE] = spanAttributes[semantic_conventions_1.ATTR_HTTP_ROUTE];
      }
      return metricAttributes;
    };
    exports$1.getIncomingRequestMetricAttributesOnResponse = getIncomingRequestMetricAttributesOnResponse;
    const getIncomingStableRequestMetricAttributesOnResponse = (spanAttributes) => {
      const metricAttributes = {};
      if (spanAttributes[semantic_conventions_1.ATTR_HTTP_ROUTE] !== void 0) {
        metricAttributes[semantic_conventions_1.ATTR_HTTP_ROUTE] = spanAttributes[semantic_conventions_1.ATTR_HTTP_ROUTE];
      }
      if (spanAttributes[semantic_conventions_1.ATTR_HTTP_RESPONSE_STATUS_CODE]) {
        metricAttributes[semantic_conventions_1.ATTR_HTTP_RESPONSE_STATUS_CODE] = spanAttributes[semantic_conventions_1.ATTR_HTTP_RESPONSE_STATUS_CODE];
      }
      return metricAttributes;
    };
    exports$1.getIncomingStableRequestMetricAttributesOnResponse = getIncomingStableRequestMetricAttributesOnResponse;
    function headerCapture(type, headers) {
      const normalizedHeaders = /* @__PURE__ */ new Map();
      for (let i = 0, len = headers.length; i < len; i++) {
        const capturedHeader = headers[i].toLowerCase();
        normalizedHeaders.set(capturedHeader, capturedHeader.replace(/-/g, "_"));
      }
      return (span, getHeader) => {
        for (const capturedHeader of normalizedHeaders.keys()) {
          const value = getHeader(capturedHeader);
          if (value === void 0) {
            continue;
          }
          const normalizedHeader = normalizedHeaders.get(capturedHeader);
          const key = `http.${type}.header.${normalizedHeader}`;
          if (typeof value === "string") {
            span.setAttribute(key, [value]);
          } else if (Array.isArray(value)) {
            span.setAttribute(key, value);
          } else {
            span.setAttribute(key, [value]);
          }
        }
      };
    }
    exports$1.headerCapture = headerCapture;
    const KNOWN_METHODS = /* @__PURE__ */ new Set([
      // methods from https://www.rfc-editor.org/rfc/rfc9110.html#name-methods
      "GET",
      "HEAD",
      "POST",
      "PUT",
      "DELETE",
      "CONNECT",
      "OPTIONS",
      "TRACE",
      // PATCH from https://www.rfc-editor.org/rfc/rfc5789.html
      "PATCH",
      // QUERY from https://datatracker.ietf.org/doc/draft-ietf-httpbis-safe-method-w-body/
      "QUERY"
    ]);
    function normalizeMethod(method) {
      if (method == null) {
        return "GET";
      }
      const upper = method.toUpperCase();
      if (KNOWN_METHODS.has(upper)) {
        return upper;
      }
      return "_OTHER";
    }
    function parseForwardedHeader2(header) {
      try {
        return forwardedParse2(header);
      } catch {
        return [];
      }
    }
  })(utils$g);
  return utils$g;
}
var hasRequiredHttp;
function requireHttp() {
  if (hasRequiredHttp) return http;
  hasRequiredHttp = 1;
  Object.defineProperty(http, "__esModule", { value: true });
  http.HttpInstrumentation = void 0;
  const api_1 = require$$0$2;
  const core_1 = require$$1;
  const url = require$$2$2;
  const version_1 = /* @__PURE__ */ requireVersion$k();
  const instrumentation_1 = require$$2;
  const events_1 = require$$0$3;
  const semantic_conventions_1 = require$$2$1;
  const utils_1 = /* @__PURE__ */ requireUtils$g();
  class HttpInstrumentation extends instrumentation_1.InstrumentationBase {
    /** keep track on spans not ended */
    _spanNotEnded = /* @__PURE__ */ new WeakSet();
    _headerCapture;
    _semconvStability = instrumentation_1.SemconvStability.OLD;
    constructor(config2 = {}) {
      super("@opentelemetry/instrumentation-http", version_1.VERSION, config2);
      this._headerCapture = this._createHeaderCapture();
      this._semconvStability = (0, instrumentation_1.semconvStabilityFromStr)("http", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
    }
    _updateMetricInstruments() {
      this._oldHttpServerDurationHistogram = this.meter.createHistogram("http.server.duration", {
        description: "Measures the duration of inbound HTTP requests.",
        unit: "ms",
        valueType: api_1.ValueType.DOUBLE
      });
      this._oldHttpClientDurationHistogram = this.meter.createHistogram("http.client.duration", {
        description: "Measures the duration of outbound HTTP requests.",
        unit: "ms",
        valueType: api_1.ValueType.DOUBLE
      });
      this._stableHttpServerDurationHistogram = this.meter.createHistogram(semantic_conventions_1.METRIC_HTTP_SERVER_REQUEST_DURATION, {
        description: "Duration of HTTP server requests.",
        unit: "s",
        valueType: api_1.ValueType.DOUBLE,
        advice: {
          explicitBucketBoundaries: [
            5e-3,
            0.01,
            0.025,
            0.05,
            0.075,
            0.1,
            0.25,
            0.5,
            0.75,
            1,
            2.5,
            5,
            7.5,
            10
          ]
        }
      });
      this._stableHttpClientDurationHistogram = this.meter.createHistogram(semantic_conventions_1.METRIC_HTTP_CLIENT_REQUEST_DURATION, {
        description: "Duration of HTTP client requests.",
        unit: "s",
        valueType: api_1.ValueType.DOUBLE,
        advice: {
          explicitBucketBoundaries: [
            5e-3,
            0.01,
            0.025,
            0.05,
            0.075,
            0.1,
            0.25,
            0.5,
            0.75,
            1,
            2.5,
            5,
            7.5,
            10
          ]
        }
      });
    }
    _recordServerDuration(durationMs, oldAttributes, stableAttributes) {
      if (this._semconvStability & instrumentation_1.SemconvStability.OLD) {
        this._oldHttpServerDurationHistogram.record(durationMs, oldAttributes);
      }
      if (this._semconvStability & instrumentation_1.SemconvStability.STABLE) {
        this._stableHttpServerDurationHistogram.record(durationMs / 1e3, stableAttributes);
      }
    }
    _recordClientDuration(durationMs, oldAttributes, stableAttributes) {
      if (this._semconvStability & instrumentation_1.SemconvStability.OLD) {
        this._oldHttpClientDurationHistogram.record(durationMs, oldAttributes);
      }
      if (this._semconvStability & instrumentation_1.SemconvStability.STABLE) {
        this._stableHttpClientDurationHistogram.record(durationMs / 1e3, stableAttributes);
      }
    }
    setConfig(config2 = {}) {
      super.setConfig(config2);
      this._headerCapture = this._createHeaderCapture();
    }
    init() {
      return [this._getHttpsInstrumentation(), this._getHttpInstrumentation()];
    }
    _getHttpInstrumentation() {
      return new instrumentation_1.InstrumentationNodeModuleDefinition("http", ["*"], (moduleExports) => {
        const isESM = moduleExports[Symbol.toStringTag] === "Module";
        if (!this.getConfig().disableOutgoingRequestInstrumentation) {
          const patchedRequest = this._wrap(moduleExports, "request", this._getPatchOutgoingRequestFunction("http"));
          const patchedGet = this._wrap(moduleExports, "get", this._getPatchOutgoingGetFunction(patchedRequest));
          if (isESM) {
            moduleExports.default.request = patchedRequest;
            moduleExports.default.get = patchedGet;
          }
        }
        if (!this.getConfig().disableIncomingRequestInstrumentation) {
          this._wrap(moduleExports.Server.prototype, "emit", this._getPatchIncomingRequestFunction("http"));
        }
        return moduleExports;
      }, (moduleExports) => {
        if (moduleExports === void 0)
          return;
        if (!this.getConfig().disableOutgoingRequestInstrumentation) {
          this._unwrap(moduleExports, "request");
          this._unwrap(moduleExports, "get");
        }
        if (!this.getConfig().disableIncomingRequestInstrumentation) {
          this._unwrap(moduleExports.Server.prototype, "emit");
        }
      });
    }
    _getHttpsInstrumentation() {
      return new instrumentation_1.InstrumentationNodeModuleDefinition("https", ["*"], (moduleExports) => {
        const isESM = moduleExports[Symbol.toStringTag] === "Module";
        if (!this.getConfig().disableOutgoingRequestInstrumentation) {
          const patchedRequest = this._wrap(moduleExports, "request", this._getPatchHttpsOutgoingRequestFunction("https"));
          const patchedGet = this._wrap(moduleExports, "get", this._getPatchHttpsOutgoingGetFunction(patchedRequest));
          if (isESM) {
            moduleExports.default.request = patchedRequest;
            moduleExports.default.get = patchedGet;
          }
        }
        if (!this.getConfig().disableIncomingRequestInstrumentation) {
          this._wrap(moduleExports.Server.prototype, "emit", this._getPatchIncomingRequestFunction("https"));
        }
        return moduleExports;
      }, (moduleExports) => {
        if (moduleExports === void 0)
          return;
        if (!this.getConfig().disableOutgoingRequestInstrumentation) {
          this._unwrap(moduleExports, "request");
          this._unwrap(moduleExports, "get");
        }
        if (!this.getConfig().disableIncomingRequestInstrumentation) {
          this._unwrap(moduleExports.Server.prototype, "emit");
        }
      });
    }
    /**
     * Creates spans for incoming requests, restoring spans' context if applied.
     */
    _getPatchIncomingRequestFunction(component) {
      return (original) => {
        return this._incomingRequestFunction(component, original);
      };
    }
    /**
     * Creates spans for outgoing requests, sending spans' context for distributed
     * tracing.
     */
    _getPatchOutgoingRequestFunction(component) {
      return (original) => {
        return this._outgoingRequestFunction(component, original);
      };
    }
    _getPatchOutgoingGetFunction(clientRequest) {
      return (_original) => {
        return function outgoingGetRequest(options, ...args) {
          const req = clientRequest(options, ...args);
          req.end();
          return req;
        };
      };
    }
    /** Patches HTTPS outgoing requests */
    _getPatchHttpsOutgoingRequestFunction(component) {
      return (original) => {
        const instrumentation2 = this;
        return function httpsOutgoingRequest(options, ...args) {
          if (component === "https" && typeof options === "object" && options?.constructor?.name !== "URL") {
            options = Object.assign({}, options);
            instrumentation2._setDefaultOptions(options);
          }
          return instrumentation2._getPatchOutgoingRequestFunction(component)(original)(options, ...args);
        };
      };
    }
    _setDefaultOptions(options) {
      options.protocol = options.protocol || "https:";
      options.port = options.port || 443;
    }
    /** Patches HTTPS outgoing get requests */
    _getPatchHttpsOutgoingGetFunction(clientRequest) {
      return (original) => {
        const instrumentation2 = this;
        return function httpsOutgoingRequest(options, ...args) {
          return instrumentation2._getPatchOutgoingGetFunction(clientRequest)(original)(options, ...args);
        };
      };
    }
    /**
     * Attach event listeners to a client request to end span and add span attributes.
     *
     * @param request The original request object.
     * @param span representing the current operation
     * @param startTime representing the start time of the request to calculate duration in Metric
     * @param oldMetricAttributes metric attributes for old semantic conventions
     * @param stableMetricAttributes metric attributes for new semantic conventions
     */
    _traceClientRequest(request, span, startTime, oldMetricAttributes, stableMetricAttributes) {
      if (this.getConfig().requestHook) {
        this._callRequestHook(span, request);
      }
      let responseFinished = false;
      request.prependListener("response", (response) => {
        this._diag.debug("outgoingRequest on response()");
        if (request.listenerCount("response") <= 1) {
          response.resume();
        }
        const responseAttributes = (0, utils_1.getOutgoingRequestAttributesOnResponse)(response, this._semconvStability);
        span.setAttributes(responseAttributes);
        oldMetricAttributes = Object.assign(oldMetricAttributes, (0, utils_1.getOutgoingRequestMetricAttributesOnResponse)(responseAttributes));
        stableMetricAttributes = Object.assign(stableMetricAttributes, (0, utils_1.getOutgoingStableRequestMetricAttributesOnResponse)(responseAttributes));
        if (this.getConfig().responseHook) {
          this._callResponseHook(span, response);
        }
        this._headerCapture.client.captureRequestHeaders(span, (header) => request.getHeader(header));
        this._headerCapture.client.captureResponseHeaders(span, (header) => response.headers[header]);
        api_1.context.bind(api_1.context.active(), response);
        const endHandler = () => {
          this._diag.debug("outgoingRequest on end()");
          if (responseFinished) {
            return;
          }
          responseFinished = true;
          let status;
          if (response.aborted && !response.complete) {
            status = { code: api_1.SpanStatusCode.ERROR };
          } else {
            status = {
              code: (0, utils_1.parseResponseStatus)(api_1.SpanKind.CLIENT, response.statusCode)
            };
          }
          span.setStatus(status);
          if (this.getConfig().applyCustomAttributesOnSpan) {
            (0, instrumentation_1.safeExecuteInTheMiddle)(() => this.getConfig().applyCustomAttributesOnSpan(span, request, response), () => {
            }, true);
          }
          this._closeHttpSpan(span, api_1.SpanKind.CLIENT, startTime, oldMetricAttributes, stableMetricAttributes);
        };
        response.on("end", endHandler);
        response.on(events_1.errorMonitor, (error2) => {
          this._diag.debug("outgoingRequest on error()", error2);
          if (responseFinished) {
            return;
          }
          responseFinished = true;
          this._onOutgoingRequestError(span, oldMetricAttributes, stableMetricAttributes, startTime, error2);
        });
      });
      request.on("close", () => {
        this._diag.debug("outgoingRequest on request close()");
        if (request.aborted || responseFinished) {
          return;
        }
        responseFinished = true;
        this._closeHttpSpan(span, api_1.SpanKind.CLIENT, startTime, oldMetricAttributes, stableMetricAttributes);
      });
      request.on(events_1.errorMonitor, (error2) => {
        this._diag.debug("outgoingRequest on request error()", error2);
        if (responseFinished) {
          return;
        }
        responseFinished = true;
        this._onOutgoingRequestError(span, oldMetricAttributes, stableMetricAttributes, startTime, error2);
      });
      this._diag.debug("http.ClientRequest return request");
      return request;
    }
    _incomingRequestFunction(component, original) {
      const instrumentation2 = this;
      return function incomingRequest(event, ...args) {
        if (event !== "request") {
          return original.apply(this, [event, ...args]);
        }
        const request = args[0];
        const response = args[1];
        const method = request.method || "GET";
        instrumentation2._diag.debug(`${component} instrumentation incomingRequest`);
        if ((0, instrumentation_1.safeExecuteInTheMiddle)(() => instrumentation2.getConfig().ignoreIncomingRequestHook?.(request), (e) => {
          if (e != null) {
            instrumentation2._diag.error("caught ignoreIncomingRequestHook error: ", e);
          }
        }, true)) {
          return api_1.context.with((0, core_1.suppressTracing)(api_1.context.active()), () => {
            api_1.context.bind(api_1.context.active(), request);
            api_1.context.bind(api_1.context.active(), response);
            return original.apply(this, [event, ...args]);
          });
        }
        const headers = request.headers;
        const spanAttributes = (0, utils_1.getIncomingRequestAttributes)(request, {
          component,
          serverName: instrumentation2.getConfig().serverName,
          hookAttributes: instrumentation2._callStartSpanHook(request, instrumentation2.getConfig().startIncomingSpanHook),
          semconvStability: instrumentation2._semconvStability,
          enableSyntheticSourceDetection: instrumentation2.getConfig().enableSyntheticSourceDetection || false
        }, instrumentation2._diag);
        const spanOptions = {
          kind: api_1.SpanKind.SERVER,
          attributes: spanAttributes
        };
        const startTime = (0, core_1.hrTime)();
        const oldMetricAttributes = (0, utils_1.getIncomingRequestMetricAttributes)(spanAttributes);
        const stableMetricAttributes = {
          [semantic_conventions_1.ATTR_HTTP_REQUEST_METHOD]: spanAttributes[semantic_conventions_1.ATTR_HTTP_REQUEST_METHOD],
          [semantic_conventions_1.ATTR_URL_SCHEME]: spanAttributes[semantic_conventions_1.ATTR_URL_SCHEME]
        };
        if (spanAttributes[semantic_conventions_1.ATTR_NETWORK_PROTOCOL_VERSION]) {
          stableMetricAttributes[semantic_conventions_1.ATTR_NETWORK_PROTOCOL_VERSION] = spanAttributes[semantic_conventions_1.ATTR_NETWORK_PROTOCOL_VERSION];
        }
        const ctx = api_1.propagation.extract(api_1.ROOT_CONTEXT, headers);
        const span = instrumentation2._startHttpSpan(method, spanOptions, ctx);
        const rpcMetadata = {
          type: core_1.RPCType.HTTP,
          span
        };
        return api_1.context.with((0, core_1.setRPCMetadata)(api_1.trace.setSpan(ctx, span), rpcMetadata), () => {
          api_1.context.bind(api_1.context.active(), request);
          api_1.context.bind(api_1.context.active(), response);
          if (instrumentation2.getConfig().requestHook) {
            instrumentation2._callRequestHook(span, request);
          }
          if (instrumentation2.getConfig().responseHook) {
            instrumentation2._callResponseHook(span, response);
          }
          instrumentation2._headerCapture.server.captureRequestHeaders(span, (header) => request.headers[header]);
          let hasError = false;
          response.on("close", () => {
            if (hasError) {
              return;
            }
            instrumentation2._onServerResponseFinish(request, response, span, oldMetricAttributes, stableMetricAttributes, startTime);
          });
          response.on(events_1.errorMonitor, (err) => {
            hasError = true;
            instrumentation2._onServerResponseError(span, oldMetricAttributes, stableMetricAttributes, startTime, err);
          });
          return (0, instrumentation_1.safeExecuteInTheMiddle)(() => original.apply(this, [event, ...args]), (error2) => {
            if (error2) {
              instrumentation2._onServerResponseError(span, oldMetricAttributes, stableMetricAttributes, startTime, error2);
              throw error2;
            }
          });
        });
      };
    }
    _outgoingRequestFunction(component, original) {
      const instrumentation2 = this;
      return function outgoingRequest(options, ...args) {
        if (!(0, utils_1.isValidOptionsType)(options)) {
          return original.apply(this, [options, ...args]);
        }
        const extraOptions = typeof args[0] === "object" && (typeof options === "string" || options instanceof url.URL) ? args.shift() : void 0;
        const { method, invalidUrl, optionsParsed } = (0, utils_1.getRequestInfo)(instrumentation2._diag, options, extraOptions);
        if ((0, instrumentation_1.safeExecuteInTheMiddle)(() => instrumentation2.getConfig().ignoreOutgoingRequestHook?.(optionsParsed), (e) => {
          if (e != null) {
            instrumentation2._diag.error("caught ignoreOutgoingRequestHook error: ", e);
          }
        }, true)) {
          return original.apply(this, [optionsParsed, ...args]);
        }
        const { hostname, port } = (0, utils_1.extractHostnameAndPort)(optionsParsed);
        const attributes = (0, utils_1.getOutgoingRequestAttributes)(optionsParsed, {
          component,
          port,
          hostname,
          hookAttributes: instrumentation2._callStartSpanHook(optionsParsed, instrumentation2.getConfig().startOutgoingSpanHook),
          redactedQueryParams: instrumentation2.getConfig().redactedQueryParams
          // Added config for adding custom query strings
        }, instrumentation2._semconvStability, instrumentation2.getConfig().enableSyntheticSourceDetection || false);
        const startTime = (0, core_1.hrTime)();
        const oldMetricAttributes = (0, utils_1.getOutgoingRequestMetricAttributes)(attributes);
        const stableMetricAttributes = {
          [semantic_conventions_1.ATTR_HTTP_REQUEST_METHOD]: attributes[semantic_conventions_1.ATTR_HTTP_REQUEST_METHOD],
          [semantic_conventions_1.ATTR_SERVER_ADDRESS]: attributes[semantic_conventions_1.ATTR_SERVER_ADDRESS],
          [semantic_conventions_1.ATTR_SERVER_PORT]: attributes[semantic_conventions_1.ATTR_SERVER_PORT]
        };
        if (attributes[semantic_conventions_1.ATTR_HTTP_RESPONSE_STATUS_CODE]) {
          stableMetricAttributes[semantic_conventions_1.ATTR_HTTP_RESPONSE_STATUS_CODE] = attributes[semantic_conventions_1.ATTR_HTTP_RESPONSE_STATUS_CODE];
        }
        if (attributes[semantic_conventions_1.ATTR_NETWORK_PROTOCOL_VERSION]) {
          stableMetricAttributes[semantic_conventions_1.ATTR_NETWORK_PROTOCOL_VERSION] = attributes[semantic_conventions_1.ATTR_NETWORK_PROTOCOL_VERSION];
        }
        const spanOptions = {
          kind: api_1.SpanKind.CLIENT,
          attributes
        };
        const span = instrumentation2._startHttpSpan(method, spanOptions);
        const parentContext = api_1.context.active();
        const requestContext = api_1.trace.setSpan(parentContext, span);
        if (!optionsParsed.headers) {
          optionsParsed.headers = {};
        } else {
          optionsParsed.headers = Object.assign({}, optionsParsed.headers);
        }
        api_1.propagation.inject(requestContext, optionsParsed.headers);
        return api_1.context.with(requestContext, () => {
          const cb2 = args[args.length - 1];
          if (typeof cb2 === "function") {
            args[args.length - 1] = api_1.context.bind(parentContext, cb2);
          }
          const request = (0, instrumentation_1.safeExecuteInTheMiddle)(() => {
            if (invalidUrl) {
              return original.apply(this, [options, ...args]);
            } else {
              return original.apply(this, [optionsParsed, ...args]);
            }
          }, (error2) => {
            if (error2) {
              instrumentation2._onOutgoingRequestError(span, oldMetricAttributes, stableMetricAttributes, startTime, error2);
              throw error2;
            }
          });
          instrumentation2._diag.debug(`${component} instrumentation outgoingRequest`);
          api_1.context.bind(parentContext, request);
          return instrumentation2._traceClientRequest(request, span, startTime, oldMetricAttributes, stableMetricAttributes);
        });
      };
    }
    _onServerResponseFinish(request, response, span, oldMetricAttributes, stableMetricAttributes, startTime) {
      const attributes = (0, utils_1.getIncomingRequestAttributesOnResponse)(request, response, this._semconvStability);
      oldMetricAttributes = Object.assign(oldMetricAttributes, (0, utils_1.getIncomingRequestMetricAttributesOnResponse)(attributes));
      stableMetricAttributes = Object.assign(stableMetricAttributes, (0, utils_1.getIncomingStableRequestMetricAttributesOnResponse)(attributes));
      this._headerCapture.server.captureResponseHeaders(span, (header) => response.getHeader(header));
      span.setAttributes(attributes).setStatus({
        code: (0, utils_1.parseResponseStatus)(api_1.SpanKind.SERVER, response.statusCode)
      });
      const route = attributes[semantic_conventions_1.ATTR_HTTP_ROUTE];
      if (route) {
        span.updateName(`${request.method || "GET"} ${route}`);
      }
      if (this.getConfig().applyCustomAttributesOnSpan) {
        (0, instrumentation_1.safeExecuteInTheMiddle)(() => this.getConfig().applyCustomAttributesOnSpan(span, request, response), () => {
        }, true);
      }
      this._closeHttpSpan(span, api_1.SpanKind.SERVER, startTime, oldMetricAttributes, stableMetricAttributes);
    }
    _onOutgoingRequestError(span, oldMetricAttributes, stableMetricAttributes, startTime, error2) {
      (0, utils_1.setSpanWithError)(span, error2, this._semconvStability);
      stableMetricAttributes[semantic_conventions_1.ATTR_ERROR_TYPE] = error2.name;
      this._closeHttpSpan(span, api_1.SpanKind.CLIENT, startTime, oldMetricAttributes, stableMetricAttributes);
    }
    _onServerResponseError(span, oldMetricAttributes, stableMetricAttributes, startTime, error2) {
      (0, utils_1.setSpanWithError)(span, error2, this._semconvStability);
      stableMetricAttributes[semantic_conventions_1.ATTR_ERROR_TYPE] = error2.name;
      this._closeHttpSpan(span, api_1.SpanKind.SERVER, startTime, oldMetricAttributes, stableMetricAttributes);
    }
    _startHttpSpan(name2, options, ctx = api_1.context.active()) {
      const requireParent = options.kind === api_1.SpanKind.CLIENT ? this.getConfig().requireParentforOutgoingSpans : this.getConfig().requireParentforIncomingSpans;
      let span;
      const currentSpan = api_1.trace.getSpan(ctx);
      if (requireParent === true && (!currentSpan || !api_1.trace.isSpanContextValid(currentSpan.spanContext()))) {
        span = api_1.trace.wrapSpanContext(api_1.INVALID_SPAN_CONTEXT);
      } else if (requireParent === true && currentSpan?.spanContext().isRemote) {
        span = currentSpan;
      } else {
        span = this.tracer.startSpan(name2, options, ctx);
      }
      this._spanNotEnded.add(span);
      return span;
    }
    _closeHttpSpan(span, spanKind, startTime, oldMetricAttributes, stableMetricAttributes) {
      if (!this._spanNotEnded.has(span)) {
        return;
      }
      span.end();
      this._spanNotEnded.delete(span);
      const duration = (0, core_1.hrTimeToMilliseconds)((0, core_1.hrTimeDuration)(startTime, (0, core_1.hrTime)()));
      if (spanKind === api_1.SpanKind.SERVER) {
        this._recordServerDuration(duration, oldMetricAttributes, stableMetricAttributes);
      } else if (spanKind === api_1.SpanKind.CLIENT) {
        this._recordClientDuration(duration, oldMetricAttributes, stableMetricAttributes);
      }
    }
    _callResponseHook(span, response) {
      (0, instrumentation_1.safeExecuteInTheMiddle)(() => this.getConfig().responseHook(span, response), () => {
      }, true);
    }
    _callRequestHook(span, request) {
      (0, instrumentation_1.safeExecuteInTheMiddle)(() => this.getConfig().requestHook(span, request), () => {
      }, true);
    }
    _callStartSpanHook(request, hookFunc) {
      if (typeof hookFunc === "function") {
        return (0, instrumentation_1.safeExecuteInTheMiddle)(() => hookFunc(request), () => {
        }, true);
      }
    }
    _createHeaderCapture() {
      const config2 = this.getConfig();
      return {
        client: {
          captureRequestHeaders: (0, utils_1.headerCapture)("request", config2.headersToSpanAttributes?.client?.requestHeaders ?? []),
          captureResponseHeaders: (0, utils_1.headerCapture)("response", config2.headersToSpanAttributes?.client?.responseHeaders ?? [])
        },
        server: {
          captureRequestHeaders: (0, utils_1.headerCapture)("request", config2.headersToSpanAttributes?.server?.requestHeaders ?? []),
          captureResponseHeaders: (0, utils_1.headerCapture)("response", config2.headersToSpanAttributes?.server?.responseHeaders ?? [])
        }
      };
    }
  }
  http.HttpInstrumentation = HttpInstrumentation;
  return http;
}
var hasRequiredSrc$m;
function requireSrc$m() {
  if (hasRequiredSrc$m) return src$m;
  hasRequiredSrc$m = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.HttpInstrumentation = void 0;
    var http_1 = /* @__PURE__ */ requireHttp();
    Object.defineProperty(exports$1, "HttpInstrumentation", { enumerable: true, get: function() {
      return http_1.HttpInstrumentation;
    } });
  })(src$m);
  return src$m;
}
var srcExports$k = /* @__PURE__ */ requireSrc$m();
function setCurrentClient(client) {
  getCurrentScope().setClient(client);
}
function getTraceMetaTags(traceData) {
  return Object.entries(traceData || getTraceData()).map(([key, value]) => `<meta name="${key}" content="${value}"/>`).join("\n");
}
function winterCGHeadersToDict(winterCGHeaders) {
  const headers = {};
  try {
    winterCGHeaders.forEach((value, key) => {
      if (typeof value === "string") {
        headers[key] = value;
      }
    });
  } catch {
  }
  return headers;
}
function headersToDict(reqHeaders) {
  const headers = /* @__PURE__ */ Object.create(null);
  try {
    Object.entries(reqHeaders).forEach(([key, value]) => {
      if (typeof value === "string") {
        headers[key] = value;
      }
    });
  } catch {
  }
  return headers;
}
function httpRequestToRequestData(request) {
  const headers = request.headers || {};
  const forwardedHost = typeof headers["x-forwarded-host"] === "string" ? headers["x-forwarded-host"] : void 0;
  const host = forwardedHost || (typeof headers.host === "string" ? headers.host : void 0);
  const forwardedProto = typeof headers["x-forwarded-proto"] === "string" ? headers["x-forwarded-proto"] : void 0;
  const protocol = forwardedProto || request.protocol || (request.socket?.encrypted ? "https" : "http");
  const url = request.url || "";
  const absoluteUrl = getAbsoluteUrl({
    url,
    host,
    protocol
  });
  const data = request.body || void 0;
  const cookies = request.cookies;
  return {
    url: absoluteUrl,
    method: request.method,
    query_string: extractQueryParamsFromUrl(url),
    headers: headersToDict(headers),
    cookies,
    data
  };
}
function getAbsoluteUrl({
  url,
  protocol,
  host
}) {
  if (url?.startsWith("http")) {
    return url;
  }
  if (url && host) {
    return `${protocol}://${host}${url}`;
  }
  return void 0;
}
const SENSITIVE_HEADER_SNIPPETS = [
  "auth",
  "token",
  "secret",
  "session",
  // for the user_session cookie
  "password",
  "passwd",
  "pwd",
  "key",
  "jwt",
  "bearer",
  "sso",
  "saml",
  "csrf",
  "xsrf",
  "credentials",
  // Always treat cookie headers as sensitive in case individual key-value cookie pairs cannot properly be extracted
  "set-cookie",
  "cookie"
];
const PII_HEADER_SNIPPETS = ["x-forwarded-", "-user"];
function httpHeadersToSpanAttributes(headers, sendDefaultPii = false) {
  const spanAttributes = {};
  try {
    Object.entries(headers).forEach(([key, value]) => {
      if (value == null) {
        return;
      }
      const lowerCasedHeaderKey = key.toLowerCase();
      const isCookieHeader = lowerCasedHeaderKey === "cookie" || lowerCasedHeaderKey === "set-cookie";
      if (isCookieHeader && typeof value === "string" && value !== "") {
        const isSetCookie = lowerCasedHeaderKey === "set-cookie";
        const semicolonIndex = value.indexOf(";");
        const cookieString = isSetCookie && semicolonIndex !== -1 ? value.substring(0, semicolonIndex) : value;
        const cookies = isSetCookie ? [cookieString] : cookieString.split("; ");
        for (const cookie of cookies) {
          const equalSignIndex = cookie.indexOf("=");
          const cookieKey = equalSignIndex !== -1 ? cookie.substring(0, equalSignIndex) : cookie;
          const cookieValue = equalSignIndex !== -1 ? cookie.substring(equalSignIndex + 1) : "";
          const lowerCasedCookieKey = cookieKey.toLowerCase();
          addSpanAttribute(spanAttributes, lowerCasedHeaderKey, lowerCasedCookieKey, cookieValue, sendDefaultPii);
        }
      } else {
        addSpanAttribute(spanAttributes, lowerCasedHeaderKey, "", value, sendDefaultPii);
      }
    });
  } catch {
  }
  return spanAttributes;
}
function normalizeAttributeKey(key) {
  return key.replace(/-/g, "_");
}
function addSpanAttribute(spanAttributes, headerKey, cookieKey, value, sendPii) {
  const normalizedKey = cookieKey ? `http.request.header.${normalizeAttributeKey(headerKey)}.${normalizeAttributeKey(cookieKey)}` : `http.request.header.${normalizeAttributeKey(headerKey)}`;
  const headerValue = handleHttpHeader(cookieKey || headerKey, value, sendPii);
  if (headerValue !== void 0) {
    spanAttributes[normalizedKey] = headerValue;
  }
}
function handleHttpHeader(lowerCasedKey, value, sendPii) {
  const isSensitive = sendPii ? SENSITIVE_HEADER_SNIPPETS.some((snippet) => lowerCasedKey.includes(snippet)) : [...PII_HEADER_SNIPPETS, ...SENSITIVE_HEADER_SNIPPETS].some((snippet) => lowerCasedKey.includes(snippet));
  if (isSensitive) {
    return "[Filtered]";
  } else if (Array.isArray(value)) {
    return value.map((v) => v != null ? String(v) : v).join(";");
  } else if (typeof value === "string") {
    return value;
  }
  return void 0;
}
function extractQueryParamsFromUrl(url) {
  if (!url) {
    return;
  }
  try {
    const queryParams = new URL(url, "http://s.io").search.slice(1);
    return queryParams.length ? queryParams : void 0;
  } catch {
    return void 0;
  }
}
function parseCookie(str) {
  const obj = {};
  let index = 0;
  while (index < str.length) {
    const eqIdx = str.indexOf("=", index);
    if (eqIdx === -1) {
      break;
    }
    let endIdx = str.indexOf(";", index);
    if (endIdx === -1) {
      endIdx = str.length;
    } else if (endIdx < eqIdx) {
      index = str.lastIndexOf(";", eqIdx - 1) + 1;
      continue;
    }
    const key = str.slice(index, eqIdx).trim();
    if (void 0 === obj[key]) {
      let val = str.slice(eqIdx + 1, endIdx).trim();
      if (val.charCodeAt(0) === 34) {
        val = val.slice(1, -1);
      }
      try {
        obj[key] = val.indexOf("%") !== -1 ? decodeURIComponent(val) : val;
      } catch {
        obj[key] = val;
      }
    }
    index = endIdx + 1;
  }
  return obj;
}
const ipHeaderNames = [
  "X-Client-IP",
  "X-Forwarded-For",
  "Fly-Client-IP",
  "CF-Connecting-IP",
  "Fastly-Client-Ip",
  "True-Client-Ip",
  "X-Real-IP",
  "X-Cluster-Client-IP",
  "X-Forwarded",
  "Forwarded-For",
  "Forwarded",
  "X-Vercel-Forwarded-For"
];
function getClientIPAddress(headers) {
  const lowerCaseHeaders = {};
  for (const key of Object.keys(headers)) {
    lowerCaseHeaders[key.toLowerCase()] = headers[key];
  }
  const headerValues = ipHeaderNames.map((headerName) => {
    const rawValue = lowerCaseHeaders[headerName.toLowerCase()];
    const value = Array.isArray(rawValue) ? rawValue.join(";") : rawValue;
    if (headerName === "Forwarded") {
      return parseForwardedHeader(value);
    }
    return value?.split(",").map((v) => v.trim());
  });
  const flattenedHeaderValues = headerValues.reduce((acc, val) => {
    if (!val) {
      return acc;
    }
    return acc.concat(val);
  }, []);
  const ipAddress = flattenedHeaderValues.find((ip) => ip !== null && isIP(ip));
  return ipAddress || null;
}
function parseForwardedHeader(value) {
  if (!value) {
    return null;
  }
  for (const part of value.split(";")) {
    if (part.startsWith("for=")) {
      return part.slice(4);
    }
  }
  return null;
}
function isIP(str) {
  const regex = /(?:^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}$)|(?:^(?:(?:[a-fA-F\d]{1,4}:){7}(?:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){6}(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){5}(?::(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,2}|:)|(?:[a-fA-F\d]{1,4}:){4}(?:(?::[a-fA-F\d]{1,4}){0,1}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,3}|:)|(?:[a-fA-F\d]{1,4}:){3}(?:(?::[a-fA-F\d]{1,4}){0,2}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,4}|:)|(?:[a-fA-F\d]{1,4}:){2}(?:(?::[a-fA-F\d]{1,4}){0,3}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,5}|:)|(?:[a-fA-F\d]{1,4}:){1}(?:(?::[a-fA-F\d]{1,4}){0,4}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,6}|:)|(?::(?:(?::[a-fA-F\d]{1,4}){0,5}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,7}|:)))(?:%[0-9a-zA-Z]{1,})?$)/;
  return regex.test(str);
}
const DEFAULT_INCLUDE = {
  cookies: true,
  data: true,
  headers: true,
  query_string: true,
  url: true
};
const INTEGRATION_NAME$C = "RequestData";
const _requestDataIntegration = ((options = {}) => {
  const include = {
    ...DEFAULT_INCLUDE,
    ...options.include
  };
  return {
    name: INTEGRATION_NAME$C,
    processEvent(event, _hint, client) {
      const { sdkProcessingMetadata = {} } = event;
      const { normalizedRequest, ipAddress } = sdkProcessingMetadata;
      const includeWithDefaultPiiApplied = {
        ...include,
        ip: include.ip ?? client.getOptions().sendDefaultPii
      };
      if (normalizedRequest) {
        addNormalizedRequestDataToEvent(event, normalizedRequest, { ipAddress }, includeWithDefaultPiiApplied);
      }
      return event;
    }
  };
});
const requestDataIntegration = defineIntegration(_requestDataIntegration);
function addNormalizedRequestDataToEvent(event, req, additionalData, include) {
  event.request = {
    ...event.request,
    ...extractNormalizedRequestData(req, include)
  };
  if (include.ip) {
    const ip = req.headers && getClientIPAddress(req.headers) || additionalData.ipAddress;
    if (ip) {
      event.user = {
        ...event.user,
        ip_address: ip
      };
    }
  }
}
function extractNormalizedRequestData(normalizedRequest, include) {
  const requestData = {};
  const headers = { ...normalizedRequest.headers };
  if (include.headers) {
    requestData.headers = headers;
    if (!include.cookies) {
      delete headers.cookie;
    }
    if (!include.ip) {
      ipHeaderNames.forEach((ipHeaderName) => {
        delete headers[ipHeaderName];
      });
    }
  }
  requestData.method = normalizedRequest.method;
  if (include.url) {
    requestData.url = normalizedRequest.url;
  }
  if (include.cookies) {
    const cookies = normalizedRequest.cookies || (headers?.cookie ? parseCookie(headers.cookie) : void 0);
    requestData.cookies = cookies || {};
  }
  if (include.query_string) {
    requestData.query_string = normalizedRequest.query_string;
  }
  if (include.data) {
    requestData.data = normalizedRequest.data;
  }
  return requestData;
}
const INTEGRATION_NAME$B = "CaptureConsole";
const _captureConsoleIntegration = ((options = {}) => {
  const levels = options.levels || CONSOLE_LEVELS;
  const handled = options.handled ?? true;
  return {
    name: INTEGRATION_NAME$B,
    setup(client) {
      if (!("console" in GLOBAL_OBJ)) {
        return;
      }
      addConsoleInstrumentationHandler(({ args, level }) => {
        if (getClient() !== client || !levels.includes(level)) {
          return;
        }
        consoleHandler(args, level, handled);
      });
    }
  };
});
const captureConsoleIntegration = defineIntegration(_captureConsoleIntegration);
function consoleHandler(args, level, handled) {
  const severityLevel = severityLevelFromString(level);
  const syntheticException = new Error();
  const captureContext = {
    level: severityLevelFromString(level),
    extra: {
      arguments: args
    }
  };
  withScope((scope) => {
    scope.addEventProcessor((event) => {
      event.logger = "console";
      addExceptionMechanism(event, {
        handled,
        type: "auto.core.capture_console"
      });
      return event;
    });
    if (level === "assert") {
      if (!args[0]) {
        const message2 = `Assertion failed: ${safeJoin(args.slice(1), " ") || "console.assert"}`;
        scope.setExtra("arguments", args.slice(1));
        scope.captureMessage(message2, severityLevel, { captureContext, syntheticException });
      }
      return;
    }
    const error2 = args.find((arg) => arg instanceof Error);
    if (error2) {
      captureException(error2, captureContext);
      return;
    }
    const message = safeJoin(args, " ");
    scope.captureMessage(message, severityLevel, { captureContext, syntheticException });
  });
}
const INTEGRATION_NAME$A = "Dedupe";
const _dedupeIntegration = (() => {
  let previousEvent;
  return {
    name: INTEGRATION_NAME$A,
    processEvent(currentEvent) {
      if (currentEvent.type) {
        return currentEvent;
      }
      try {
        if (_shouldDropEvent(currentEvent, previousEvent)) {
          DEBUG_BUILD && debug.warn("Event dropped due to being a duplicate of previously captured event.");
          return null;
        }
      } catch {
      }
      return previousEvent = currentEvent;
    }
  };
});
const dedupeIntegration = defineIntegration(_dedupeIntegration);
function _shouldDropEvent(currentEvent, previousEvent) {
  if (!previousEvent) {
    return false;
  }
  if (_isSameMessageEvent(currentEvent, previousEvent)) {
    return true;
  }
  if (_isSameExceptionEvent(currentEvent, previousEvent)) {
    return true;
  }
  return false;
}
function _isSameMessageEvent(currentEvent, previousEvent) {
  const currentMessage = currentEvent.message;
  const previousMessage = previousEvent.message;
  if (!currentMessage && !previousMessage) {
    return false;
  }
  if (currentMessage && !previousMessage || !currentMessage && previousMessage) {
    return false;
  }
  if (currentMessage !== previousMessage) {
    return false;
  }
  if (!_isSameFingerprint(currentEvent, previousEvent)) {
    return false;
  }
  if (!_isSameStacktrace(currentEvent, previousEvent)) {
    return false;
  }
  return true;
}
function _isSameExceptionEvent(currentEvent, previousEvent) {
  const previousException = _getExceptionFromEvent(previousEvent);
  const currentException = _getExceptionFromEvent(currentEvent);
  if (!previousException || !currentException) {
    return false;
  }
  if (previousException.type !== currentException.type || previousException.value !== currentException.value) {
    return false;
  }
  if (!_isSameFingerprint(currentEvent, previousEvent)) {
    return false;
  }
  if (!_isSameStacktrace(currentEvent, previousEvent)) {
    return false;
  }
  return true;
}
function _isSameStacktrace(currentEvent, previousEvent) {
  let currentFrames = getFramesFromEvent(currentEvent);
  let previousFrames = getFramesFromEvent(previousEvent);
  if (!currentFrames && !previousFrames) {
    return true;
  }
  if (currentFrames && !previousFrames || !currentFrames && previousFrames) {
    return false;
  }
  currentFrames = currentFrames;
  previousFrames = previousFrames;
  if (previousFrames.length !== currentFrames.length) {
    return false;
  }
  for (let i = 0; i < previousFrames.length; i++) {
    const frameA = previousFrames[i];
    const frameB = currentFrames[i];
    if (frameA.filename !== frameB.filename || frameA.lineno !== frameB.lineno || frameA.colno !== frameB.colno || frameA.function !== frameB.function) {
      return false;
    }
  }
  return true;
}
function _isSameFingerprint(currentEvent, previousEvent) {
  let currentFingerprint = currentEvent.fingerprint;
  let previousFingerprint = previousEvent.fingerprint;
  if (!currentFingerprint && !previousFingerprint) {
    return true;
  }
  if (currentFingerprint && !previousFingerprint || !currentFingerprint && previousFingerprint) {
    return false;
  }
  currentFingerprint = currentFingerprint;
  previousFingerprint = previousFingerprint;
  try {
    return !!(currentFingerprint.join("") === previousFingerprint.join(""));
  } catch {
    return false;
  }
}
function _getExceptionFromEvent(event) {
  return event.exception?.values?.[0];
}
const INTEGRATION_NAME$z = "ExtraErrorData";
const _extraErrorDataIntegration = ((options = {}) => {
  const { depth = 3, captureErrorCause = true } = options;
  return {
    name: INTEGRATION_NAME$z,
    processEvent(event, hint, client) {
      const { maxValueLength } = client.getOptions();
      return _enhanceEventWithErrorData(event, hint, depth, captureErrorCause, maxValueLength);
    }
  };
});
const extraErrorDataIntegration = defineIntegration(_extraErrorDataIntegration);
function _enhanceEventWithErrorData(event, hint = {}, depth, captureErrorCause, maxValueLength) {
  if (!hint.originalException || !isError(hint.originalException)) {
    return event;
  }
  const exceptionName = hint.originalException.name || hint.originalException.constructor.name;
  const errorData = _extractErrorData(hint.originalException, captureErrorCause, maxValueLength);
  if (errorData) {
    const contexts = {
      ...event.contexts
    };
    const normalizedErrorData = normalize(errorData, depth);
    if (isPlainObject$1(normalizedErrorData)) {
      addNonEnumerableProperty(normalizedErrorData, "__sentry_skip_normalization__", true);
      contexts[exceptionName] = normalizedErrorData;
    }
    return {
      ...event,
      contexts
    };
  }
  return event;
}
function _extractErrorData(error2, captureErrorCause, maxValueLength) {
  try {
    const nativeKeys = [
      "name",
      "message",
      "stack",
      "line",
      "column",
      "fileName",
      "lineNumber",
      "columnNumber",
      "toJSON"
    ];
    const extraErrorInfo = {};
    for (const key of Object.keys(error2)) {
      if (nativeKeys.indexOf(key) !== -1) {
        continue;
      }
      const value = error2[key];
      extraErrorInfo[key] = isError(value) || typeof value === "string" ? maxValueLength ? truncate(`${value}`, maxValueLength) : `${value}` : value;
    }
    if (captureErrorCause && error2.cause !== void 0) {
      if (isError(error2.cause)) {
        const errorName = error2.cause.name || error2.cause.constructor.name;
        extraErrorInfo.cause = { [errorName]: _extractErrorData(error2.cause, false, maxValueLength) };
      } else {
        extraErrorInfo.cause = error2.cause;
      }
    }
    if (typeof error2.toJSON === "function") {
      const serializedError = error2.toJSON();
      for (const key of Object.keys(serializedError)) {
        const value = serializedError[key];
        extraErrorInfo[key] = isError(value) ? value.toString() : value;
      }
    }
    return extraErrorInfo;
  } catch (oO) {
    DEBUG_BUILD && debug.error("Unable to extract extra data from the Error object:", oO);
  }
  return null;
}
const INTEGRATION_NAME$y = "RewriteFrames";
const rewriteFramesIntegration = defineIntegration((options = {}) => {
  const root = options.root;
  const prefix = options.prefix || "app:///";
  const isBrowser2 = "window" in GLOBAL_OBJ && !!GLOBAL_OBJ.window;
  const iteratee = options.iteratee || generateIteratee({ isBrowser: isBrowser2, root, prefix });
  function _processExceptionsEvent(event) {
    try {
      return {
        ...event,
        exception: {
          ...event.exception,
          // The check for this is performed inside `process` call itself, safe to skip here
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          values: event.exception.values.map((value) => ({
            ...value,
            ...value.stacktrace && { stacktrace: _processStacktrace(value.stacktrace) }
          }))
        }
      };
    } catch {
      return event;
    }
  }
  function _processStacktrace(stacktrace) {
    return {
      ...stacktrace,
      frames: stacktrace?.frames?.map((f) => iteratee(f))
    };
  }
  return {
    name: INTEGRATION_NAME$y,
    processEvent(originalEvent) {
      let processedEvent = originalEvent;
      if (originalEvent.exception && Array.isArray(originalEvent.exception.values)) {
        processedEvent = _processExceptionsEvent(processedEvent);
      }
      return processedEvent;
    }
  };
});
function generateIteratee({
  isBrowser: isBrowser2,
  root,
  prefix
}) {
  return (frame) => {
    if (!frame.filename) {
      return frame;
    }
    const isWindowsFrame = /^[a-zA-Z]:\\/.test(frame.filename) || // or the presence of a backslash without a forward slash (which are not allowed on Windows)
    frame.filename.includes("\\") && !frame.filename.includes("/");
    const startsWithSlash = /^\//.test(frame.filename);
    if (isBrowser2) {
      if (root) {
        const oldFilename = frame.filename;
        if (oldFilename.indexOf(root) === 0) {
          frame.filename = oldFilename.replace(root, prefix);
        }
      }
    } else {
      if (isWindowsFrame || startsWithSlash) {
        const filename = isWindowsFrame ? frame.filename.replace(/^[a-zA-Z]:/, "").replace(/\\/g, "/") : frame.filename;
        const base = root ? relative(root, filename) : basename(filename);
        frame.filename = `${prefix}${base}`;
      }
    }
    return frame;
  };
}
const AUTH_OPERATIONS_TO_INSTRUMENT = [
  "reauthenticate",
  "signInAnonymously",
  "signInWithOAuth",
  "signInWithIdToken",
  "signInWithOtp",
  "signInWithPassword",
  "signInWithSSO",
  "signOut",
  "signUp",
  "verifyOtp"
];
const AUTH_ADMIN_OPERATIONS_TO_INSTRUMENT = [
  "createUser",
  "deleteUser",
  "listUsers",
  "getUserById",
  "updateUserById",
  "inviteUserByEmail"
];
const FILTER_MAPPINGS = {
  eq: "eq",
  neq: "neq",
  gt: "gt",
  gte: "gte",
  lt: "lt",
  lte: "lte",
  like: "like",
  "like(all)": "likeAllOf",
  "like(any)": "likeAnyOf",
  ilike: "ilike",
  "ilike(all)": "ilikeAllOf",
  "ilike(any)": "ilikeAnyOf",
  is: "is",
  in: "in",
  cs: "contains",
  cd: "containedBy",
  sr: "rangeGt",
  nxl: "rangeGte",
  sl: "rangeLt",
  nxr: "rangeLte",
  adj: "rangeAdjacent",
  ov: "overlaps",
  fts: "",
  plfts: "plain",
  phfts: "phrase",
  wfts: "websearch",
  not: "not"
};
const DB_OPERATIONS_TO_INSTRUMENT = ["select", "insert", "upsert", "update", "delete"];
function markAsInstrumented(fn) {
  try {
    fn.__SENTRY_INSTRUMENTED__ = true;
  } catch {
  }
}
function isInstrumented(fn) {
  try {
    return fn.__SENTRY_INSTRUMENTED__;
  } catch {
    return false;
  }
}
function extractOperation(method, headers = {}) {
  switch (method) {
    case "GET": {
      return "select";
    }
    case "POST": {
      if (headers["Prefer"]?.includes("resolution=")) {
        return "upsert";
      } else {
        return "insert";
      }
    }
    case "PATCH": {
      return "update";
    }
    case "DELETE": {
      return "delete";
    }
    default: {
      return "<unknown-op>";
    }
  }
}
function translateFiltersIntoMethods(key, query) {
  if (query === "" || query === "*") {
    return "select(*)";
  }
  if (key === "select") {
    return `select(${query})`;
  }
  if (key === "or" || key.endsWith(".or")) {
    return `${key}${query}`;
  }
  const [filter, ...value] = query.split(".");
  let method;
  if (filter?.startsWith("fts")) {
    method = "textSearch";
  } else if (filter?.startsWith("plfts")) {
    method = "textSearch[plain]";
  } else if (filter?.startsWith("phfts")) {
    method = "textSearch[phrase]";
  } else if (filter?.startsWith("wfts")) {
    method = "textSearch[websearch]";
  } else {
    method = filter && FILTER_MAPPINGS[filter] || "filter";
  }
  return `${method}(${key}, ${value.join(".")})`;
}
function instrumentAuthOperation(operation, isAdmin = false) {
  return new Proxy(operation, {
    apply(target, thisArg, argumentsList) {
      return startSpan$1(
        {
          name: `auth ${isAdmin ? "(admin) " : ""}${operation.name}`,
          attributes: {
            [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.db.supabase",
            [SEMANTIC_ATTRIBUTE_SENTRY_OP]: "db",
            "db.system": "postgresql",
            "db.operation": `auth.${isAdmin ? "admin." : ""}${operation.name}`
          }
        },
        (span) => {
          return Reflect.apply(target, thisArg, argumentsList).then((res) => {
            if (res && typeof res === "object" && "error" in res && res.error) {
              span.setStatus({ code: SPAN_STATUS_ERROR });
              captureException(res.error, {
                mechanism: {
                  handled: false,
                  type: "auto.db.supabase.auth"
                }
              });
            } else {
              span.setStatus({ code: SPAN_STATUS_OK });
            }
            span.end();
            return res;
          }).catch((err) => {
            span.setStatus({ code: SPAN_STATUS_ERROR });
            span.end();
            captureException(err, {
              mechanism: {
                handled: false,
                type: "auto.db.supabase.auth"
              }
            });
            throw err;
          }).then(...argumentsList);
        }
      );
    }
  });
}
function instrumentSupabaseAuthClient(supabaseClientInstance) {
  const auth = supabaseClientInstance.auth;
  if (!auth || isInstrumented(supabaseClientInstance.auth)) {
    return;
  }
  for (const operation of AUTH_OPERATIONS_TO_INSTRUMENT) {
    const authOperation = auth[operation];
    if (!authOperation) {
      continue;
    }
    if (typeof supabaseClientInstance.auth[operation] === "function") {
      supabaseClientInstance.auth[operation] = instrumentAuthOperation(authOperation);
    }
  }
  for (const operation of AUTH_ADMIN_OPERATIONS_TO_INSTRUMENT) {
    const authOperation = auth.admin[operation];
    if (!authOperation) {
      continue;
    }
    if (typeof supabaseClientInstance.auth.admin[operation] === "function") {
      supabaseClientInstance.auth.admin[operation] = instrumentAuthOperation(authOperation, true);
    }
  }
  markAsInstrumented(supabaseClientInstance.auth);
}
function instrumentSupabaseClientConstructor(SupabaseClient) {
  if (isInstrumented(SupabaseClient.prototype.from)) {
    return;
  }
  SupabaseClient.prototype.from = new Proxy(
    SupabaseClient.prototype.from,
    {
      apply(target, thisArg, argumentsList) {
        const rv = Reflect.apply(target, thisArg, argumentsList);
        const PostgRESTQueryBuilder = rv.constructor;
        instrumentPostgRESTQueryBuilder(PostgRESTQueryBuilder);
        return rv;
      }
    }
  );
  markAsInstrumented(SupabaseClient.prototype.from);
}
function instrumentPostgRESTFilterBuilder(PostgRESTFilterBuilder) {
  if (isInstrumented(PostgRESTFilterBuilder.prototype.then)) {
    return;
  }
  PostgRESTFilterBuilder.prototype.then = new Proxy(
    PostgRESTFilterBuilder.prototype.then,
    {
      apply(target, thisArg, argumentsList) {
        const operations = DB_OPERATIONS_TO_INSTRUMENT;
        const typedThis = thisArg;
        const operation = extractOperation(typedThis.method, typedThis.headers);
        if (!operations.includes(operation)) {
          return Reflect.apply(target, thisArg, argumentsList);
        }
        if (!typedThis?.url?.pathname || typeof typedThis.url.pathname !== "string") {
          return Reflect.apply(target, thisArg, argumentsList);
        }
        const pathParts = typedThis.url.pathname.split("/");
        const table = pathParts.length > 0 ? pathParts[pathParts.length - 1] : "";
        const queryItems = [];
        for (const [key, value] of typedThis.url.searchParams.entries()) {
          queryItems.push(translateFiltersIntoMethods(key, value));
        }
        const body = /* @__PURE__ */ Object.create(null);
        if (isPlainObject$1(typedThis.body)) {
          for (const [key, value] of Object.entries(typedThis.body)) {
            body[key] = value;
          }
        }
        const description = `${operation === "select" ? "" : `${operation}${body ? "(...) " : ""}`}${queryItems.join(
          " "
        )} from(${table})`;
        const attributes = {
          "db.table": table,
          "db.schema": typedThis.schema,
          "db.url": typedThis.url.origin,
          "db.sdk": typedThis.headers["X-Client-Info"],
          "db.system": "postgresql",
          "db.operation": operation,
          [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.db.supabase",
          [SEMANTIC_ATTRIBUTE_SENTRY_OP]: "db"
        };
        if (queryItems.length) {
          attributes["db.query"] = queryItems;
        }
        if (Object.keys(body).length) {
          attributes["db.body"] = body;
        }
        return startSpan$1(
          {
            name: description,
            attributes
          },
          (span) => {
            return Reflect.apply(target, thisArg, []).then(
              (res) => {
                if (span) {
                  if (res && typeof res === "object" && "status" in res) {
                    setHttpStatus(span, res.status || 500);
                  }
                  span.end();
                }
                if (res.error) {
                  const err = new Error(res.error.message);
                  if (res.error.code) {
                    err.code = res.error.code;
                  }
                  if (res.error.details) {
                    err.details = res.error.details;
                  }
                  const supabaseContext = {};
                  if (queryItems.length) {
                    supabaseContext.query = queryItems;
                  }
                  if (Object.keys(body).length) {
                    supabaseContext.body = body;
                  }
                  captureException(err, (scope) => {
                    scope.addEventProcessor((e) => {
                      addExceptionMechanism(e, {
                        handled: false,
                        type: "auto.db.supabase.postgres"
                      });
                      return e;
                    });
                    scope.setContext("supabase", supabaseContext);
                    return scope;
                  });
                }
                const breadcrumb = {
                  type: "supabase",
                  category: `db.${operation}`,
                  message: description
                };
                const data = {};
                if (queryItems.length) {
                  data.query = queryItems;
                }
                if (Object.keys(body).length) {
                  data.body = body;
                }
                if (Object.keys(data).length) {
                  breadcrumb.data = data;
                }
                addBreadcrumb(breadcrumb);
                return res;
              },
              (err) => {
                if (span) {
                  setHttpStatus(span, 500);
                  span.end();
                }
                throw err;
              }
            ).then(...argumentsList);
          }
        );
      }
    }
  );
  markAsInstrumented(PostgRESTFilterBuilder.prototype.then);
}
function instrumentPostgRESTQueryBuilder(PostgRESTQueryBuilder) {
  for (const operation of DB_OPERATIONS_TO_INSTRUMENT) {
    if (isInstrumented(PostgRESTQueryBuilder.prototype[operation])) {
      continue;
    }
    PostgRESTQueryBuilder.prototype[operation] = new Proxy(
      PostgRESTQueryBuilder.prototype[operation],
      {
        apply(target, thisArg, argumentsList) {
          const rv = Reflect.apply(target, thisArg, argumentsList);
          const PostgRESTFilterBuilder = rv.constructor;
          DEBUG_BUILD && debug.log(`Instrumenting ${operation} operation's PostgRESTFilterBuilder`);
          instrumentPostgRESTFilterBuilder(PostgRESTFilterBuilder);
          return rv;
        }
      }
    );
    markAsInstrumented(PostgRESTQueryBuilder.prototype[operation]);
  }
}
const instrumentSupabaseClient = (supabaseClient) => {
  if (!supabaseClient) {
    DEBUG_BUILD && debug.warn("Supabase integration was not installed because no Supabase client was provided.");
    return;
  }
  const SupabaseClientConstructor = supabaseClient.constructor === Function ? supabaseClient : supabaseClient.constructor;
  instrumentSupabaseClientConstructor(SupabaseClientConstructor);
  instrumentSupabaseAuthClient(supabaseClient);
};
const INTEGRATION_NAME$x = "Supabase";
const _supabaseIntegration = ((supabaseClient) => {
  return {
    setupOnce() {
      instrumentSupabaseClient(supabaseClient);
    },
    name: INTEGRATION_NAME$x
  };
});
const supabaseIntegration = defineIntegration((options) => {
  return _supabaseIntegration(options.supabaseClient);
});
const SQL_OPERATION_REGEX$1 = /^(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)/i;
const CONNECTION_CONTEXT_SYMBOL = Symbol("sentryPostgresConnectionContext");
const INSTRUMENTED_MARKER = Symbol.for("sentry.instrumented.postgresjs");
const QUERY_FROM_INSTRUMENTED_SQL$1 = Symbol.for("sentry.query.from.instrumented.sql");
function instrumentPostgresJsSql(sql, options) {
  if (!sql || typeof sql !== "function") {
    DEBUG_BUILD && debug.warn("instrumentPostgresJsSql: provided value is not a valid postgres.js sql instance");
    return sql;
  }
  return _instrumentSqlInstance(sql, { requireParentSpan: true, ...options });
}
function _instrumentSqlInstance(sql, options, parentConnectionContext) {
  if (sql[INSTRUMENTED_MARKER]) {
    return sql;
  }
  const proxiedSql = new Proxy(sql, {
    apply(target, thisArg, argumentsList) {
      const query = Reflect.apply(target, thisArg, argumentsList);
      if (query && typeof query === "object" && "handle" in query) {
        _wrapSingleQueryHandle(query, proxiedSql, options);
      }
      return query;
    },
    get(target, prop) {
      const original = target[prop];
      if (typeof prop !== "string" || typeof original !== "function") {
        return original;
      }
      if (prop === "unsafe" || prop === "file") {
        return _wrapQueryMethod(original, target, proxiedSql, options);
      }
      if (prop === "begin" || prop === "reserve") {
        return _wrapCallbackMethod(original, target, proxiedSql, options);
      }
      return original;
    }
  });
  if (parentConnectionContext) {
    proxiedSql[CONNECTION_CONTEXT_SYMBOL] = parentConnectionContext;
  } else {
    _attachConnectionContext(sql, proxiedSql);
  }
  sql[INSTRUMENTED_MARKER] = true;
  proxiedSql[INSTRUMENTED_MARKER] = true;
  return proxiedSql;
}
function _wrapQueryMethod(original, target, proxiedSql, options) {
  return function(...args) {
    const query = Reflect.apply(original, target, args);
    if (query && typeof query === "object" && "handle" in query) {
      _wrapSingleQueryHandle(query, proxiedSql, options);
    }
    return query;
  };
}
function _wrapCallbackMethod(original, target, parentSqlInstance, options) {
  return function(...args) {
    const parentContext = parentSqlInstance[CONNECTION_CONTEXT_SYMBOL];
    const isCallbackBased = typeof args[args.length - 1] === "function";
    if (!isCallbackBased) {
      const result = Reflect.apply(original, target, args);
      if (result && typeof result.then === "function") {
        return result.then((sqlInstance) => {
          return _instrumentSqlInstance(sqlInstance, options, parentContext);
        });
      }
      return result;
    }
    const callback = args.length === 1 ? args[0] : args[1];
    const wrappedCallback = function(sqlInstance) {
      const instrumentedSql = _instrumentSqlInstance(sqlInstance, options, parentContext);
      return callback(instrumentedSql);
    };
    const newArgs = args.length === 1 ? [wrappedCallback] : [args[0], wrappedCallback];
    return Reflect.apply(original, target, newArgs);
  };
}
function _wrapSingleQueryHandle(query, sqlInstance, options) {
  if (query.handle?.__sentryWrapped) {
    return;
  }
  query[QUERY_FROM_INSTRUMENTED_SQL$1] = true;
  const originalHandle = query.handle;
  const wrappedHandle = async function(...args) {
    if (!_shouldCreateSpans(options)) {
      return originalHandle.apply(this, args);
    }
    const fullQuery = _reconstructQuery(query.strings);
    const sanitizedSqlQuery = _sanitizeSqlQuery(fullQuery);
    return startSpanManual(
      {
        name: sanitizedSqlQuery || "postgresjs.query",
        op: "db"
      },
      (span) => {
        span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, "auto.db.postgresjs");
        span.setAttributes({
          "db.system.name": "postgres",
          "db.query.text": sanitizedSqlQuery
        });
        const connectionContext = sqlInstance ? sqlInstance[CONNECTION_CONTEXT_SYMBOL] : void 0;
        _setConnectionAttributes(span, connectionContext);
        if (options.requestHook) {
          try {
            options.requestHook(span, sanitizedSqlQuery, connectionContext);
          } catch (e) {
            span.setAttribute("sentry.hook.error", "requestHook failed");
            DEBUG_BUILD && debug.error("Error in requestHook for PostgresJs instrumentation:", e);
          }
        }
        const queryWithCallbacks = this;
        queryWithCallbacks.resolve = new Proxy(queryWithCallbacks.resolve, {
          apply: (resolveTarget, resolveThisArg, resolveArgs) => {
            try {
              _setOperationName(span, sanitizedSqlQuery, resolveArgs?.[0]?.command);
              span.end();
            } catch (e) {
              DEBUG_BUILD && debug.error("Error ending span in resolve callback:", e);
            }
            return Reflect.apply(resolveTarget, resolveThisArg, resolveArgs);
          }
        });
        queryWithCallbacks.reject = new Proxy(queryWithCallbacks.reject, {
          apply: (rejectTarget, rejectThisArg, rejectArgs) => {
            try {
              span.setStatus({
                code: SPAN_STATUS_ERROR,
                message: rejectArgs?.[0]?.message || "unknown_error"
              });
              span.setAttribute("db.response.status_code", rejectArgs?.[0]?.code || "unknown");
              span.setAttribute("error.type", rejectArgs?.[0]?.name || "unknown");
              _setOperationName(span, sanitizedSqlQuery);
              span.end();
            } catch (e) {
              DEBUG_BUILD && debug.error("Error ending span in reject callback:", e);
            }
            return Reflect.apply(rejectTarget, rejectThisArg, rejectArgs);
          }
        });
        try {
          return originalHandle.apply(this, args);
        } catch (e) {
          span.setStatus({
            code: SPAN_STATUS_ERROR,
            message: e instanceof Error ? e.message : "unknown_error"
          });
          span.end();
          throw e;
        }
      }
    );
  };
  wrappedHandle.__sentryWrapped = true;
  query.handle = wrappedHandle;
}
function _shouldCreateSpans(options) {
  const hasParentSpan = getActiveSpan() !== void 0;
  return hasParentSpan || !options.requireParentSpan;
}
function _reconstructQuery(strings) {
  if (!strings?.length) {
    return void 0;
  }
  if (strings.length === 1) {
    return strings[0] || void 0;
  }
  return strings.reduce((acc, str, i) => i === 0 ? str : `${acc}$${i}${str}`, "");
}
function _sanitizeSqlQuery(sqlQuery) {
  if (!sqlQuery) {
    return "Unknown SQL Query";
  }
  return sqlQuery.replace(/--.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/;\s*$/, "").replace(/\s+/g, " ").trim().replace(/\bX'[0-9A-Fa-f]*'/gi, "?").replace(/\bB'[01]*'/gi, "?").replace(/'(?:[^']|'')*'/g, "?").replace(/\b0x[0-9A-Fa-f]+/gi, "?").replace(/\b(?:TRUE|FALSE)\b/gi, "?").replace(/-?\b\d+\.?\d*[eE][+-]?\d+\b/g, "?").replace(/-?\b\d+\.\d+\b/g, "?").replace(/-?\.\d+\b/g, "?").replace(/(?<!\$)-?\b\d+\b/g, "?").replace(/\bIN\b\s*\(\s*\?(?:\s*,\s*\?)*\s*\)/gi, "IN (?)").replace(/\bIN\b\s*\(\s*\$\d+(?:\s*,\s*\$\d+)*\s*\)/gi, "IN ($?)");
}
function _setConnectionAttributes(span, connectionContext) {
  if (!connectionContext) {
    return;
  }
  if (connectionContext.ATTR_DB_NAMESPACE) {
    span.setAttribute("db.namespace", connectionContext.ATTR_DB_NAMESPACE);
  }
  if (connectionContext.ATTR_SERVER_ADDRESS) {
    span.setAttribute("server.address", connectionContext.ATTR_SERVER_ADDRESS);
  }
  if (connectionContext.ATTR_SERVER_PORT !== void 0) {
    const portNumber = parseInt(connectionContext.ATTR_SERVER_PORT, 10);
    if (!isNaN(portNumber)) {
      span.setAttribute("server.port", portNumber);
    }
  }
}
function _setOperationName(span, sanitizedQuery, command) {
  if (command) {
    span.setAttribute("db.operation.name", command);
    return;
  }
  const operationMatch = sanitizedQuery?.match(SQL_OPERATION_REGEX$1);
  if (operationMatch?.[1]) {
    span.setAttribute("db.operation.name", operationMatch[1].toUpperCase());
  }
}
function _attachConnectionContext(sql, proxiedSql) {
  const sqlInstance = sql;
  if (!sqlInstance.options || typeof sqlInstance.options !== "object") {
    return;
  }
  const opts = sqlInstance.options;
  const host = opts.host?.[0] || "localhost";
  const port = opts.port?.[0] || 5432;
  const connectionContext = {
    ATTR_DB_NAMESPACE: typeof opts.database === "string" && opts.database !== "" ? opts.database : void 0,
    ATTR_SERVER_ADDRESS: host,
    ATTR_SERVER_PORT: String(port)
  };
  proxiedSql[CONNECTION_CONTEXT_SYMBOL] = connectionContext;
}
const DEFAULT_LIMIT = 10;
const INTEGRATION_NAME$w = "ZodErrors";
function originalExceptionIsZodError(originalException) {
  return isError(originalException) && originalException.name === "ZodError" && Array.isArray(originalException.issues);
}
function flattenIssue(issue) {
  return {
    ...issue,
    path: "path" in issue && Array.isArray(issue.path) ? issue.path.join(".") : void 0,
    keys: "keys" in issue ? JSON.stringify(issue.keys) : void 0,
    unionErrors: "unionErrors" in issue ? JSON.stringify(issue.unionErrors) : void 0
  };
}
function flattenIssuePath(path) {
  return path.map((p) => {
    if (typeof p === "number") {
      return "<array>";
    } else {
      return p;
    }
  }).join(".");
}
function formatIssueMessage(zodError) {
  const errorKeyMap = /* @__PURE__ */ new Set();
  for (const iss of zodError.issues) {
    const issuePath = flattenIssuePath(iss.path);
    if (issuePath.length > 0) {
      errorKeyMap.add(issuePath);
    }
  }
  const errorKeys = Array.from(errorKeyMap);
  if (errorKeys.length === 0) {
    let rootExpectedType = "variable";
    if (zodError.issues.length > 0) {
      const iss = zodError.issues[0];
      if (iss !== void 0 && "expected" in iss && typeof iss.expected === "string") {
        rootExpectedType = iss.expected;
      }
    }
    return `Failed to validate ${rootExpectedType}`;
  }
  return `Failed to validate keys: ${truncate(errorKeys.join(", "), 100)}`;
}
function applyZodErrorsToEvent(limit, saveZodIssuesAsAttachment = false, event, hint) {
  if (!event.exception?.values || !hint.originalException || !originalExceptionIsZodError(hint.originalException) || hint.originalException.issues.length === 0) {
    return event;
  }
  try {
    const issuesToFlatten = saveZodIssuesAsAttachment ? hint.originalException.issues : hint.originalException.issues.slice(0, limit);
    const flattenedIssues = issuesToFlatten.map(flattenIssue);
    if (saveZodIssuesAsAttachment) {
      if (!Array.isArray(hint.attachments)) {
        hint.attachments = [];
      }
      hint.attachments.push({
        filename: "zod_issues.json",
        data: JSON.stringify({
          issues: flattenedIssues
        })
      });
    }
    return {
      ...event,
      exception: {
        ...event.exception,
        values: [
          {
            ...event.exception.values[0],
            value: formatIssueMessage(hint.originalException)
          },
          ...event.exception.values.slice(1)
        ]
      },
      extra: {
        ...event.extra,
        "zoderror.issues": flattenedIssues.slice(0, limit)
      }
    };
  } catch (e) {
    return {
      ...event,
      extra: {
        ...event.extra,
        "zoderrors sentry integration parse error": {
          message: "an exception was thrown while processing ZodError within applyZodErrorsToEvent()",
          error: e instanceof Error ? `${e.name}: ${e.message}
${e.stack}` : "unknown"
        }
      }
    };
  }
}
const _zodErrorsIntegration = ((options = {}) => {
  const limit = options.limit ?? DEFAULT_LIMIT;
  return {
    name: INTEGRATION_NAME$w,
    processEvent(originalEvent, hint) {
      const processedEvent = applyZodErrorsToEvent(limit, options.saveZodIssuesAsAttachment, originalEvent, hint);
      return processedEvent;
    }
  };
});
const zodErrorsIntegration = defineIntegration(_zodErrorsIntegration);
const _INTERNAL_FLAG_BUFFER_SIZE = 100;
const _INTERNAL_MAX_FLAGS_PER_SPAN = 10;
const SPAN_FLAG_ATTRIBUTE_PREFIX = "flag.evaluation.";
function _INTERNAL_copyFlagsFromScopeToEvent(event) {
  const scope = getCurrentScope();
  const flagContext = scope.getScopeData().contexts.flags;
  const flagBuffer = flagContext ? flagContext.values : [];
  if (!flagBuffer.length) {
    return event;
  }
  if (event.contexts === void 0) {
    event.contexts = {};
  }
  event.contexts.flags = { values: [...flagBuffer] };
  return event;
}
function _INTERNAL_insertFlagToScope(name2, value, maxSize = _INTERNAL_FLAG_BUFFER_SIZE) {
  const scopeContexts = getCurrentScope().getScopeData().contexts;
  if (!scopeContexts.flags) {
    scopeContexts.flags = { values: [] };
  }
  const flags = scopeContexts.flags.values;
  _INTERNAL_insertToFlagBuffer(flags, name2, value, maxSize);
}
function _INTERNAL_insertToFlagBuffer(flags, name2, value, maxSize) {
  if (typeof value !== "boolean") {
    return;
  }
  if (flags.length > maxSize) {
    DEBUG_BUILD && debug.error(`[Feature Flags] insertToFlagBuffer called on a buffer larger than maxSize=${maxSize}`);
    return;
  }
  const index = flags.findIndex((f) => f.flag === name2);
  if (index !== -1) {
    flags.splice(index, 1);
  }
  if (flags.length === maxSize) {
    flags.shift();
  }
  flags.push({
    flag: name2,
    result: value
  });
}
function _INTERNAL_addFeatureFlagToActiveSpan(name2, value, maxFlagsPerSpan = _INTERNAL_MAX_FLAGS_PER_SPAN) {
  if (typeof value !== "boolean") {
    return;
  }
  const span = getActiveSpan();
  if (!span) {
    return;
  }
  const attributes = spanToJSON(span).data;
  if (`${SPAN_FLAG_ATTRIBUTE_PREFIX}${name2}` in attributes) {
    span.setAttribute(`${SPAN_FLAG_ATTRIBUTE_PREFIX}${name2}`, value);
    return;
  }
  const numOfAddedFlags = Object.keys(attributes).filter((key) => key.startsWith(SPAN_FLAG_ATTRIBUTE_PREFIX)).length;
  if (numOfAddedFlags < maxFlagsPerSpan) {
    span.setAttribute(`${SPAN_FLAG_ATTRIBUTE_PREFIX}${name2}`, value);
  }
}
const featureFlagsIntegration = defineIntegration(() => {
  return {
    name: "FeatureFlags",
    processEvent(event, _hint, _client) {
      return _INTERNAL_copyFlagsFromScopeToEvent(event);
    },
    addFeatureFlag(name2, value) {
      _INTERNAL_insertFlagToScope(name2, value);
      _INTERNAL_addFeatureFlagToActiveSpan(name2, value);
    }
  };
});
const growthbookIntegration = defineIntegration(
  ({ growthbookClass }) => {
    return {
      name: "GrowthBook",
      setupOnce() {
        const proto = growthbookClass.prototype;
        if (typeof proto.isOn === "function") {
          fill(proto, "isOn", _wrapAndCaptureBooleanResult);
        }
        if (typeof proto.getFeatureValue === "function") {
          fill(proto, "getFeatureValue", _wrapAndCaptureBooleanResult);
        }
      },
      processEvent(event, _hint, _client) {
        return _INTERNAL_copyFlagsFromScopeToEvent(event);
      }
    };
  }
);
function _wrapAndCaptureBooleanResult(original) {
  return function(...args) {
    const flagName = args[0];
    const result = original.apply(this, args);
    if (typeof flagName === "string" && typeof result === "boolean") {
      _INTERNAL_insertFlagToScope(flagName, result);
      _INTERNAL_addFeatureFlagToActiveSpan(flagName, result);
    }
    return result;
  };
}
function isProfilingIntegrationWithProfiler(integration) {
  return !!integration && typeof integration["_profiler"] !== "undefined" && typeof integration["_profiler"]["start"] === "function" && typeof integration["_profiler"]["stop"] === "function";
}
function startProfiler() {
  const client = getClient();
  if (!client) {
    DEBUG_BUILD && debug.warn("No Sentry client available, profiling is not started");
    return;
  }
  const integration = client.getIntegrationByName("ProfilingIntegration");
  if (!integration) {
    DEBUG_BUILD && debug.warn("ProfilingIntegration is not available");
    return;
  }
  if (!isProfilingIntegrationWithProfiler(integration)) {
    DEBUG_BUILD && debug.warn("Profiler is not available on profiling integration.");
    return;
  }
  integration._profiler.start();
}
function stopProfiler() {
  const client = getClient();
  if (!client) {
    DEBUG_BUILD && debug.warn("No Sentry client available, profiling is not started");
    return;
  }
  const integration = client.getIntegrationByName("ProfilingIntegration");
  if (!integration) {
    DEBUG_BUILD && debug.warn("ProfilingIntegration is not available");
    return;
  }
  if (!isProfilingIntegrationWithProfiler(integration)) {
    DEBUG_BUILD && debug.warn("Profiler is not available on profiling integration.");
    return;
  }
  integration._profiler.stop();
}
const profiler = {
  startProfiler,
  stopProfiler
};
const trpcCaptureContext = { mechanism: { handled: false, type: "auto.rpc.trpc.middleware" } };
function captureIfError(nextResult) {
  if (typeof nextResult === "object" && nextResult !== null && "ok" in nextResult && !nextResult.ok && "error" in nextResult) {
    captureException(nextResult.error, trpcCaptureContext);
  }
}
function trpcMiddleware(options = {}) {
  return async function(opts) {
    const { path, type, next, rawInput, getRawInput } = opts;
    const client = getClient();
    const clientOptions = client?.getOptions();
    const trpcContext = {
      procedure_path: path,
      procedure_type: type
    };
    addNonEnumerableProperty(
      trpcContext,
      "__sentry_override_normalization_depth__",
      1 + // 1 for context.input + the normal normalization depth
      (clientOptions?.normalizeDepth ?? 5)
      // 5 is a sane depth
    );
    if (options.attachRpcInput !== void 0 ? options.attachRpcInput : clientOptions?.sendDefaultPii) {
      if (rawInput !== void 0) {
        trpcContext.input = normalize(rawInput);
      }
      if (getRawInput !== void 0 && typeof getRawInput === "function") {
        try {
          const rawRes = await getRawInput();
          trpcContext.input = normalize(rawRes);
        } catch {
        }
      }
    }
    return withIsolationScope((scope) => {
      scope.setContext("trpc", trpcContext);
      return startSpanManual(
        {
          name: `trpc/${path}`,
          op: "rpc.server",
          attributes: {
            [SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: "route",
            [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.rpc.trpc"
          },
          forceTransaction: !!options.forceTransaction
        },
        async (span) => {
          try {
            const nextResult = await next();
            captureIfError(nextResult);
            span.end();
            return nextResult;
          } catch (e) {
            captureException(e, trpcCaptureContext);
            span.end();
            throw e;
          }
        }
      );
    });
  };
}
function captureError(error2, errorType, extraData) {
  try {
    const client = getClient();
    if (!client) {
      return;
    }
    const activeSpan = getActiveSpan();
    if (activeSpan?.isRecording()) {
      activeSpan.setStatus({
        code: SPAN_STATUS_ERROR,
        message: "internal_error"
      });
    }
    captureException(error2, {
      mechanism: {
        type: "auto.ai.mcp_server",
        handled: false,
        data: {
          error_type: errorType || "handler_execution",
          ...extraData
        }
      }
    });
  } catch {
  }
}
function wrapMethodHandler(serverInstance, methodName) {
  fill(serverInstance, methodName, (originalMethod) => {
    return function(name2, ...args) {
      const handler = args[args.length - 1];
      if (typeof handler !== "function") {
        return originalMethod.call(this, name2, ...args);
      }
      const wrappedHandler = createWrappedHandler(handler, methodName, name2);
      return originalMethod.call(this, name2, ...args.slice(0, -1), wrappedHandler);
    };
  });
}
function createWrappedHandler(originalHandler, methodName, handlerName) {
  return function(...handlerArgs) {
    try {
      return createErrorCapturingHandler.call(this, originalHandler, methodName, handlerName, handlerArgs);
    } catch (error2) {
      DEBUG_BUILD && debug.warn("MCP handler wrapping failed:", error2);
      return originalHandler.apply(this, handlerArgs);
    }
  };
}
function createErrorCapturingHandler(originalHandler, methodName, handlerName, handlerArgs) {
  try {
    const result = originalHandler.apply(this, handlerArgs);
    if (result && typeof result === "object" && typeof result.then === "function") {
      return Promise.resolve(result).catch((error2) => {
        captureHandlerError(error2, methodName, handlerName);
        throw error2;
      });
    }
    return result;
  } catch (error2) {
    captureHandlerError(error2, methodName, handlerName);
    throw error2;
  }
}
function captureHandlerError(error2, methodName, handlerName) {
  try {
    const extraData = {};
    if (methodName === "tool") {
      extraData.tool_name = handlerName;
      if (error2.name === "ProtocolValidationError" || error2.message.includes("validation") || error2.message.includes("protocol")) {
        captureError(error2, "validation", extraData);
      } else if (error2.name === "ServerTimeoutError" || error2.message.includes("timed out") || error2.message.includes("timeout")) {
        captureError(error2, "timeout", extraData);
      } else {
        captureError(error2, "tool_execution", extraData);
      }
    } else if (methodName === "resource") {
      extraData.resource_uri = handlerName;
      captureError(error2, "resource_execution", extraData);
    } else if (methodName === "prompt") {
      extraData.prompt_name = handlerName;
      captureError(error2, "prompt_execution", extraData);
    }
  } catch (captureErr) {
  }
}
function wrapToolHandlers(serverInstance) {
  wrapMethodHandler(serverInstance, "tool");
}
function wrapResourceHandlers(serverInstance) {
  wrapMethodHandler(serverInstance, "resource");
}
function wrapPromptHandlers(serverInstance) {
  wrapMethodHandler(serverInstance, "prompt");
}
function wrapAllMCPHandlers(serverInstance) {
  wrapToolHandlers(serverInstance);
  wrapResourceHandlers(serverInstance);
  wrapPromptHandlers(serverInstance);
}
const MCP_METHOD_NAME_ATTRIBUTE = "mcp.method.name";
const MCP_REQUEST_ID_ATTRIBUTE = "mcp.request.id";
const MCP_SESSION_ID_ATTRIBUTE = "mcp.session.id";
const MCP_TRANSPORT_ATTRIBUTE = "mcp.transport";
const MCP_SERVER_NAME_ATTRIBUTE = "mcp.server.name";
const MCP_SERVER_TITLE_ATTRIBUTE = "mcp.server.title";
const MCP_SERVER_VERSION_ATTRIBUTE = "mcp.server.version";
const MCP_PROTOCOL_VERSION_ATTRIBUTE = "mcp.protocol.version";
const MCP_TOOL_NAME_ATTRIBUTE = "mcp.tool.name";
const MCP_RESOURCE_URI_ATTRIBUTE = "mcp.resource.uri";
const MCP_PROMPT_NAME_ATTRIBUTE = "mcp.prompt.name";
const MCP_TOOL_RESULT_IS_ERROR_ATTRIBUTE = "mcp.tool.result.is_error";
const MCP_TOOL_RESULT_CONTENT_COUNT_ATTRIBUTE = "mcp.tool.result.content_count";
const MCP_PROMPT_RESULT_DESCRIPTION_ATTRIBUTE = "mcp.prompt.result.description";
const MCP_PROMPT_RESULT_MESSAGE_COUNT_ATTRIBUTE = "mcp.prompt.result.message_count";
const MCP_REQUEST_ARGUMENT = "mcp.request.argument";
const MCP_LOGGING_LEVEL_ATTRIBUTE = "mcp.logging.level";
const MCP_LOGGING_LOGGER_ATTRIBUTE = "mcp.logging.logger";
const MCP_LOGGING_DATA_TYPE_ATTRIBUTE = "mcp.logging.data_type";
const MCP_LOGGING_MESSAGE_ATTRIBUTE = "mcp.logging.message";
const NETWORK_TRANSPORT_ATTRIBUTE = "network.transport";
const NETWORK_PROTOCOL_VERSION_ATTRIBUTE = "network.protocol.version";
const CLIENT_ADDRESS_ATTRIBUTE = "client.address";
const CLIENT_PORT_ATTRIBUTE = "client.port";
const MCP_SERVER_OP_VALUE = "mcp.server";
const MCP_NOTIFICATION_CLIENT_TO_SERVER_OP_VALUE = "mcp.notification.client_to_server";
const MCP_NOTIFICATION_SERVER_TO_CLIENT_OP_VALUE = "mcp.notification.server_to_client";
const MCP_FUNCTION_ORIGIN_VALUE = "auto.function.mcp_server";
const MCP_NOTIFICATION_ORIGIN_VALUE = "auto.mcp.notification";
const MCP_ROUTE_SOURCE_VALUE = "route";
function isJsonRpcRequest(message) {
  return typeof message === "object" && message !== null && "jsonrpc" in message && message.jsonrpc === "2.0" && "method" in message && "id" in message;
}
function isJsonRpcNotification(message) {
  return typeof message === "object" && message !== null && "jsonrpc" in message && message.jsonrpc === "2.0" && "method" in message && !("id" in message);
}
function isJsonRpcResponse(message) {
  return typeof message === "object" && message !== null && "jsonrpc" in message && message.jsonrpc === "2.0" && "id" in message && ("result" in message || "error" in message);
}
function validateMcpServerInstance(instance) {
  if (typeof instance === "object" && instance !== null && "resource" in instance && "tool" in instance && "prompt" in instance && "connect" in instance) {
    return true;
  }
  DEBUG_BUILD && debug.warn("Did not patch MCP server. Interface is incompatible.");
  return false;
}
function isValidContentItem(item) {
  return item != null && typeof item === "object";
}
function buildAllContentItemAttributes(content, includeContent) {
  const attributes = {
    [MCP_TOOL_RESULT_CONTENT_COUNT_ATTRIBUTE]: content.length
  };
  for (const [i, item] of content.entries()) {
    if (!isValidContentItem(item)) {
      continue;
    }
    const prefix = content.length === 1 ? "mcp.tool.result" : `mcp.tool.result.${i}`;
    if (typeof item.type === "string") {
      attributes[`${prefix}.content_type`] = item.type;
    }
    if (includeContent) {
      const safeSet = (key, value) => {
        if (typeof value === "string") {
          attributes[`${prefix}.${key}`] = value;
        }
      };
      safeSet("mime_type", item.mimeType);
      safeSet("uri", item.uri);
      safeSet("name", item.name);
      if (typeof item.text === "string") {
        attributes[`${prefix}.content`] = item.text;
      }
      if (typeof item.data === "string") {
        attributes[`${prefix}.data_size`] = item.data.length;
      }
      const resource = item.resource;
      if (isValidContentItem(resource)) {
        safeSet("resource_uri", resource.uri);
        safeSet("resource_mime_type", resource.mimeType);
      }
    }
  }
  return attributes;
}
function extractToolResultAttributes(result, recordOutputs) {
  if (!isValidContentItem(result)) {
    return {};
  }
  const attributes = Array.isArray(result.content) ? buildAllContentItemAttributes(result.content, recordOutputs) : {};
  if (typeof result.isError === "boolean") {
    attributes[MCP_TOOL_RESULT_IS_ERROR_ATTRIBUTE] = result.isError;
  }
  return attributes;
}
function extractPromptResultAttributes(result, recordOutputs) {
  const attributes = {};
  if (!isValidContentItem(result)) {
    return attributes;
  }
  if (recordOutputs && typeof result.description === "string") {
    attributes[MCP_PROMPT_RESULT_DESCRIPTION_ATTRIBUTE] = result.description;
  }
  if (Array.isArray(result.messages)) {
    attributes[MCP_PROMPT_RESULT_MESSAGE_COUNT_ATTRIBUTE] = result.messages.length;
    if (recordOutputs) {
      const messages = result.messages;
      for (const [i, message] of messages.entries()) {
        if (!isValidContentItem(message)) {
          continue;
        }
        const prefix = messages.length === 1 ? "mcp.prompt.result" : `mcp.prompt.result.${i}`;
        const safeSet = (key, value) => {
          if (typeof value === "string") {
            const attrName = messages.length === 1 ? `${prefix}.message_${key}` : `${prefix}.${key}`;
            attributes[attrName] = value;
          }
        };
        safeSet("role", message.role);
        if (isValidContentItem(message.content)) {
          const content = message.content;
          if (typeof content.text === "string") {
            const attrName = messages.length === 1 ? `${prefix}.message_content` : `${prefix}.content`;
            attributes[attrName] = content.text;
          }
        }
      }
    }
  }
  return attributes;
}
const sessionToSessionData = /* @__PURE__ */ new Map();
const statelessSessionData = /* @__PURE__ */ new WeakMap();
function getSessionData(transport) {
  const sessionId = transport.sessionId;
  if (sessionId) {
    return sessionToSessionData.get(sessionId);
  }
  return statelessSessionData.get(transport);
}
function setSessionData(transport, data) {
  const sessionId = transport.sessionId;
  if (sessionId) {
    sessionToSessionData.set(sessionId, data);
  } else {
    statelessSessionData.set(transport, data);
  }
}
function storeSessionDataForTransport(transport, sessionData) {
  setSessionData(transport, sessionData);
}
function updateSessionDataForTransport(transport, partialSessionData) {
  const existingData = getSessionData(transport) || {};
  setSessionData(transport, { ...existingData, ...partialSessionData });
}
function getClientInfoForTransport(transport) {
  return getSessionData(transport)?.clientInfo;
}
function getProtocolVersionForTransport(transport) {
  return getSessionData(transport)?.protocolVersion;
}
function getSessionDataForTransport(transport) {
  return getSessionData(transport);
}
function cleanupSessionDataForTransport(transport) {
  const sessionId = transport.sessionId;
  if (sessionId) {
    sessionToSessionData.delete(sessionId);
  }
}
function extractPartyInfo(obj) {
  const partyInfo = {};
  if (isValidContentItem(obj)) {
    if (typeof obj.name === "string") {
      partyInfo.name = obj.name;
    }
    if (typeof obj.title === "string") {
      partyInfo.title = obj.title;
    }
    if (typeof obj.version === "string") {
      partyInfo.version = obj.version;
    }
  }
  return partyInfo;
}
function extractSessionDataFromInitializeRequest(request) {
  const sessionData = {};
  if (isValidContentItem(request.params)) {
    if (typeof request.params.protocolVersion === "string") {
      sessionData.protocolVersion = request.params.protocolVersion;
    }
    if (request.params.clientInfo) {
      sessionData.clientInfo = extractPartyInfo(request.params.clientInfo);
    }
  }
  return sessionData;
}
function extractSessionDataFromInitializeResponse(result) {
  const sessionData = {};
  if (isValidContentItem(result)) {
    if (typeof result.protocolVersion === "string") {
      sessionData.protocolVersion = result.protocolVersion;
    }
    if (result.serverInfo) {
      sessionData.serverInfo = extractPartyInfo(result.serverInfo);
    }
  }
  return sessionData;
}
function getClientAttributes(transport) {
  const clientInfo = getClientInfoForTransport(transport);
  const attributes = {};
  if (clientInfo?.name) {
    attributes["mcp.client.name"] = clientInfo.name;
  }
  if (clientInfo?.title) {
    attributes["mcp.client.title"] = clientInfo.title;
  }
  if (clientInfo?.version) {
    attributes["mcp.client.version"] = clientInfo.version;
  }
  return attributes;
}
function buildClientAttributesFromInfo(clientInfo) {
  const attributes = {};
  if (clientInfo?.name) {
    attributes["mcp.client.name"] = clientInfo.name;
  }
  if (clientInfo?.title) {
    attributes["mcp.client.title"] = clientInfo.title;
  }
  if (clientInfo?.version) {
    attributes["mcp.client.version"] = clientInfo.version;
  }
  return attributes;
}
function getServerAttributes(transport) {
  const serverInfo = getSessionDataForTransport(transport)?.serverInfo;
  const attributes = {};
  if (serverInfo?.name) {
    attributes[MCP_SERVER_NAME_ATTRIBUTE] = serverInfo.name;
  }
  if (serverInfo?.title) {
    attributes[MCP_SERVER_TITLE_ATTRIBUTE] = serverInfo.title;
  }
  if (serverInfo?.version) {
    attributes[MCP_SERVER_VERSION_ATTRIBUTE] = serverInfo.version;
  }
  return attributes;
}
function buildServerAttributesFromInfo(serverInfo) {
  const attributes = {};
  if (serverInfo?.name) {
    attributes[MCP_SERVER_NAME_ATTRIBUTE] = serverInfo.name;
  }
  if (serverInfo?.title) {
    attributes[MCP_SERVER_TITLE_ATTRIBUTE] = serverInfo.title;
  }
  if (serverInfo?.version) {
    attributes[MCP_SERVER_VERSION_ATTRIBUTE] = serverInfo.version;
  }
  return attributes;
}
function extractClientInfo(extra) {
  return {
    address: extra?.requestInfo?.remoteAddress || extra?.clientAddress || extra?.request?.ip || extra?.request?.connection?.remoteAddress,
    port: extra?.requestInfo?.remotePort || extra?.clientPort || extra?.request?.connection?.remotePort
  };
}
function getTransportTypes(transport) {
  if (!transport?.constructor) {
    return { mcpTransport: "unknown", networkTransport: "unknown" };
  }
  const transportName = typeof transport.constructor?.name === "string" ? transport.constructor.name : "unknown";
  let networkTransport = "unknown";
  const lowerTransportName = transportName.toLowerCase();
  if (lowerTransportName.includes("stdio")) {
    networkTransport = "pipe";
  } else if (lowerTransportName.includes("http") || lowerTransportName.includes("sse")) {
    networkTransport = "tcp";
  }
  return {
    mcpTransport: transportName,
    networkTransport
  };
}
function buildTransportAttributes(transport, extra) {
  const sessionId = transport && "sessionId" in transport ? transport.sessionId : void 0;
  const clientInfo = extra ? extractClientInfo(extra) : {};
  const { mcpTransport, networkTransport } = getTransportTypes(transport);
  const clientAttributes = getClientAttributes(transport);
  const serverAttributes = getServerAttributes(transport);
  const protocolVersion = getProtocolVersionForTransport(transport);
  const attributes = {
    ...sessionId && { [MCP_SESSION_ID_ATTRIBUTE]: sessionId },
    ...clientInfo.address && { [CLIENT_ADDRESS_ATTRIBUTE]: clientInfo.address },
    ...clientInfo.port && { [CLIENT_PORT_ATTRIBUTE]: clientInfo.port },
    [MCP_TRANSPORT_ATTRIBUTE]: mcpTransport,
    [NETWORK_TRANSPORT_ATTRIBUTE]: networkTransport,
    [NETWORK_PROTOCOL_VERSION_ATTRIBUTE]: "2.0",
    ...protocolVersion && { [MCP_PROTOCOL_VERSION_ATTRIBUTE]: protocolVersion },
    ...clientAttributes,
    ...serverAttributes
  };
  return attributes;
}
const sessionToSpanMap = /* @__PURE__ */ new Map();
const statelessSpanMap = /* @__PURE__ */ new WeakMap();
function getOrCreateSpanMap(transport) {
  const sessionId = transport.sessionId;
  if (sessionId) {
    let spanMap2 = sessionToSpanMap.get(sessionId);
    if (!spanMap2) {
      spanMap2 = /* @__PURE__ */ new Map();
      sessionToSpanMap.set(sessionId, spanMap2);
    }
    return spanMap2;
  }
  let spanMap = statelessSpanMap.get(transport);
  if (!spanMap) {
    spanMap = /* @__PURE__ */ new Map();
    statelessSpanMap.set(transport, spanMap);
  }
  return spanMap;
}
function storeSpanForRequest(transport, requestId, span, method) {
  const spanMap = getOrCreateSpanMap(transport);
  spanMap.set(requestId, {
    span,
    method,
    // eslint-disable-next-line @sentry-internal/sdk/no-unsafe-random-apis
    startTime: Date.now()
  });
}
function completeSpanWithResults(transport, requestId, result, options) {
  const spanMap = getOrCreateSpanMap(transport);
  const spanData = spanMap.get(requestId);
  if (spanData) {
    const { span, method } = spanData;
    if (method === "initialize") {
      const sessionData = extractSessionDataFromInitializeResponse(result);
      const serverAttributes = buildServerAttributesFromInfo(sessionData.serverInfo);
      const initAttributes = {
        ...serverAttributes
      };
      if (sessionData.protocolVersion) {
        initAttributes[MCP_PROTOCOL_VERSION_ATTRIBUTE] = sessionData.protocolVersion;
      }
      span.setAttributes(initAttributes);
    } else if (method === "tools/call") {
      const toolAttributes = extractToolResultAttributes(result, options.recordOutputs);
      span.setAttributes(toolAttributes);
    } else if (method === "prompts/get") {
      const promptAttributes = extractPromptResultAttributes(result, options.recordOutputs);
      span.setAttributes(promptAttributes);
    }
    span.end();
    spanMap.delete(requestId);
  }
}
function cleanupPendingSpansForTransport(transport) {
  const sessionId = transport.sessionId;
  if (sessionId) {
    const spanMap2 = sessionToSpanMap.get(sessionId);
    if (spanMap2) {
      for (const [, spanData] of spanMap2) {
        spanData.span.setStatus({
          code: SPAN_STATUS_ERROR,
          message: "cancelled"
        });
        spanData.span.end();
      }
      sessionToSpanMap.delete(sessionId);
    }
    return;
  }
  const spanMap = statelessSpanMap.get(transport);
  if (spanMap) {
    for (const [, spanData] of spanMap) {
      spanData.span.setStatus({
        code: SPAN_STATUS_ERROR,
        message: "cancelled"
      });
      spanData.span.end();
    }
    spanMap.clear();
  }
}
const METHOD_CONFIGS = {
  "tools/call": {
    targetField: "name",
    targetAttribute: MCP_TOOL_NAME_ATTRIBUTE,
    captureArguments: true,
    argumentsField: "arguments"
  },
  "resources/read": {
    targetField: "uri",
    targetAttribute: MCP_RESOURCE_URI_ATTRIBUTE,
    captureUri: true
  },
  "resources/subscribe": {
    targetField: "uri",
    targetAttribute: MCP_RESOURCE_URI_ATTRIBUTE
  },
  "resources/unsubscribe": {
    targetField: "uri",
    targetAttribute: MCP_RESOURCE_URI_ATTRIBUTE
  },
  "prompts/get": {
    targetField: "name",
    targetAttribute: MCP_PROMPT_NAME_ATTRIBUTE,
    captureName: true,
    captureArguments: true,
    argumentsField: "arguments"
  }
};
function extractTargetInfo(method, params) {
  const config2 = METHOD_CONFIGS[method];
  if (!config2) {
    return { attributes: {} };
  }
  const target = config2.targetField && typeof params?.[config2.targetField] === "string" ? params[config2.targetField] : void 0;
  return {
    target,
    attributes: target && config2.targetAttribute ? { [config2.targetAttribute]: target } : {}
  };
}
function getRequestArguments(method, params) {
  const args = {};
  const config2 = METHOD_CONFIGS[method];
  if (!config2) {
    return args;
  }
  if (config2.captureArguments && config2.argumentsField && params?.[config2.argumentsField]) {
    const argumentsObj = params[config2.argumentsField];
    if (typeof argumentsObj === "object" && argumentsObj !== null) {
      for (const [key, value] of Object.entries(argumentsObj)) {
        args[`${MCP_REQUEST_ARGUMENT}.${key.toLowerCase()}`] = JSON.stringify(value);
      }
    }
  }
  if (config2.captureUri && params?.uri) {
    args[`${MCP_REQUEST_ARGUMENT}.uri`] = JSON.stringify(params.uri);
  }
  if (config2.captureName && params?.name) {
    args[`${MCP_REQUEST_ARGUMENT}.name`] = JSON.stringify(params.name);
  }
  return args;
}
function formatLoggingData(data) {
  return typeof data === "string" ? data : JSON.stringify(data);
}
function getNotificationAttributes(method, params, recordInputs) {
  const attributes = {};
  switch (method) {
    case "notifications/cancelled":
      if (params?.requestId) {
        attributes["mcp.cancelled.request_id"] = String(params.requestId);
      }
      if (params?.reason) {
        attributes["mcp.cancelled.reason"] = String(params.reason);
      }
      break;
    case "notifications/message":
      if (params?.level) {
        attributes[MCP_LOGGING_LEVEL_ATTRIBUTE] = String(params.level);
      }
      if (params?.logger) {
        attributes[MCP_LOGGING_LOGGER_ATTRIBUTE] = String(params.logger);
      }
      if (params?.data !== void 0) {
        attributes[MCP_LOGGING_DATA_TYPE_ATTRIBUTE] = typeof params.data;
        if (recordInputs) {
          attributes[MCP_LOGGING_MESSAGE_ATTRIBUTE] = formatLoggingData(params.data);
        }
      }
      break;
    case "notifications/progress":
      if (params?.progressToken) {
        attributes["mcp.progress.token"] = String(params.progressToken);
      }
      if (typeof params?.progress === "number") {
        attributes["mcp.progress.current"] = params.progress;
      }
      if (typeof params?.total === "number") {
        attributes["mcp.progress.total"] = params.total;
        if (typeof params?.progress === "number") {
          attributes["mcp.progress.percentage"] = params.progress / params.total * 100;
        }
      }
      if (params?.message) {
        attributes["mcp.progress.message"] = String(params.message);
      }
      break;
    case "notifications/resources/updated":
      if (params?.uri) {
        attributes[MCP_RESOURCE_URI_ATTRIBUTE] = String(params.uri);
        const urlObject = parseStringToURLObject(String(params.uri));
        if (urlObject && !isURLObjectRelative(urlObject)) {
          attributes["mcp.resource.protocol"] = urlObject.protocol.replace(":", "");
        }
      }
      break;
    case "notifications/initialized":
      attributes["mcp.lifecycle.phase"] = "initialization_complete";
      attributes["mcp.protocol.ready"] = 1;
      break;
  }
  return attributes;
}
function buildTypeSpecificAttributes(type, message, params, recordInputs) {
  if (type === "request") {
    const request = message;
    const targetInfo = extractTargetInfo(request.method, params || {});
    return {
      ...request.id !== void 0 && { [MCP_REQUEST_ID_ATTRIBUTE]: String(request.id) },
      ...targetInfo.attributes,
      ...recordInputs ? getRequestArguments(request.method, params || {}) : {}
    };
  }
  return getNotificationAttributes(message.method, params || {}, recordInputs);
}
const NETWORK_PII_ATTRIBUTES = /* @__PURE__ */ new Set([CLIENT_ADDRESS_ATTRIBUTE, CLIENT_PORT_ATTRIBUTE, MCP_RESOURCE_URI_ATTRIBUTE]);
function isNetworkPiiAttribute(key) {
  return NETWORK_PII_ATTRIBUTES.has(key);
}
function filterMcpPiiFromSpanData(spanData, sendDefaultPii) {
  if (sendDefaultPii) {
    return spanData;
  }
  return Object.entries(spanData).reduce(
    (acc, [key, value]) => {
      if (!isNetworkPiiAttribute(key)) {
        acc[key] = value;
      }
      return acc;
    },
    {}
  );
}
function createSpanName(method, target) {
  return target ? `${method} ${target}` : method;
}
function buildSentryAttributes(type) {
  let op;
  let origin;
  switch (type) {
    case "request":
      op = MCP_SERVER_OP_VALUE;
      origin = MCP_FUNCTION_ORIGIN_VALUE;
      break;
    case "notification-incoming":
      op = MCP_NOTIFICATION_CLIENT_TO_SERVER_OP_VALUE;
      origin = MCP_NOTIFICATION_ORIGIN_VALUE;
      break;
    case "notification-outgoing":
      op = MCP_NOTIFICATION_SERVER_TO_CLIENT_OP_VALUE;
      origin = MCP_NOTIFICATION_ORIGIN_VALUE;
      break;
  }
  return {
    [SEMANTIC_ATTRIBUTE_SENTRY_OP]: op,
    [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: origin,
    [SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: MCP_ROUTE_SOURCE_VALUE
  };
}
function createMcpSpan(config2) {
  const { type, message, transport, extra, callback, options } = config2;
  const { method } = message;
  const params = message.params;
  let spanName;
  if (type === "request") {
    const targetInfo = extractTargetInfo(method, params || {});
    spanName = createSpanName(method, targetInfo.target);
  } else {
    spanName = method;
  }
  const rawAttributes = {
    ...buildTransportAttributes(transport, extra),
    [MCP_METHOD_NAME_ATTRIBUTE]: method,
    ...buildTypeSpecificAttributes(type, message, params, options?.recordInputs),
    ...buildSentryAttributes(type)
  };
  const client = getClient();
  const sendDefaultPii = Boolean(client?.getOptions().sendDefaultPii);
  const attributes = filterMcpPiiFromSpanData(rawAttributes, sendDefaultPii);
  return startSpan$1(
    {
      name: spanName,
      forceTransaction: true,
      attributes
    },
    callback
  );
}
function createMcpNotificationSpan(jsonRpcMessage, transport, extra, options, callback) {
  return createMcpSpan({
    type: "notification-incoming",
    message: jsonRpcMessage,
    transport,
    extra,
    callback,
    options
  });
}
function createMcpOutgoingNotificationSpan(jsonRpcMessage, transport, options, callback) {
  return createMcpSpan({
    type: "notification-outgoing",
    message: jsonRpcMessage,
    transport,
    options,
    callback
  });
}
function buildMcpServerSpanConfig(jsonRpcMessage, transport, extra, options) {
  const { method } = jsonRpcMessage;
  const params = jsonRpcMessage.params;
  const targetInfo = extractTargetInfo(method, params || {});
  const spanName = createSpanName(method, targetInfo.target);
  const rawAttributes = {
    ...buildTransportAttributes(transport, extra),
    [MCP_METHOD_NAME_ATTRIBUTE]: method,
    ...buildTypeSpecificAttributes("request", jsonRpcMessage, params, options?.recordInputs),
    ...buildSentryAttributes("request")
  };
  const client = getClient();
  const sendDefaultPii = Boolean(client?.getOptions().sendDefaultPii);
  const attributes = filterMcpPiiFromSpanData(rawAttributes, sendDefaultPii);
  return {
    name: spanName,
    op: MCP_SERVER_OP_VALUE,
    forceTransaction: true,
    attributes
  };
}
function wrapTransportOnMessage(transport, options) {
  if (transport.onmessage) {
    fill(transport, "onmessage", (originalOnMessage) => {
      return function(message, extra) {
        if (isJsonRpcRequest(message)) {
          const isInitialize = message.method === "initialize";
          let initSessionData;
          if (isInitialize) {
            try {
              initSessionData = extractSessionDataFromInitializeRequest(message);
              storeSessionDataForTransport(this, initSessionData);
            } catch {
            }
          }
          const isolationScope = getIsolationScope().clone();
          return withIsolationScope(isolationScope, () => {
            const spanConfig = buildMcpServerSpanConfig(message, this, extra, options);
            const span = startInactiveSpan(spanConfig);
            if (isInitialize && initSessionData) {
              span.setAttributes({
                ...buildClientAttributesFromInfo(initSessionData.clientInfo),
                ...initSessionData.protocolVersion && {
                  [MCP_PROTOCOL_VERSION_ATTRIBUTE]: initSessionData.protocolVersion
                }
              });
            }
            storeSpanForRequest(this, message.id, span, message.method);
            return withActiveSpan(span, () => {
              return originalOnMessage.call(this, message, extra);
            });
          });
        }
        if (isJsonRpcNotification(message)) {
          return createMcpNotificationSpan(message, this, extra, options, () => {
            return originalOnMessage.call(this, message, extra);
          });
        }
        return originalOnMessage.call(this, message, extra);
      };
    });
  }
}
function wrapTransportSend(transport, options) {
  if (transport.send) {
    fill(transport, "send", (originalSend) => {
      return async function(...args) {
        const [message] = args;
        if (isJsonRpcNotification(message)) {
          return createMcpOutgoingNotificationSpan(message, this, options, () => {
            return originalSend.call(this, ...args);
          });
        }
        if (isJsonRpcResponse(message)) {
          if (message.id !== null && message.id !== void 0) {
            if (message.error) {
              captureJsonRpcErrorResponse(message.error);
            }
            if (isValidContentItem(message.result)) {
              if (message.result.protocolVersion || message.result.serverInfo) {
                try {
                  const serverData = extractSessionDataFromInitializeResponse(message.result);
                  updateSessionDataForTransport(this, serverData);
                } catch {
                }
              }
            }
            completeSpanWithResults(this, message.id, message.result, options);
          }
        }
        return originalSend.call(this, ...args);
      };
    });
  }
}
function wrapTransportOnClose(transport) {
  if (transport.onclose) {
    fill(transport, "onclose", (originalOnClose) => {
      return function(...args) {
        cleanupPendingSpansForTransport(this);
        cleanupSessionDataForTransport(this);
        return originalOnClose.call(this, ...args);
      };
    });
  }
}
function wrapTransportError(transport) {
  if (transport.onerror) {
    fill(transport, "onerror", (originalOnError) => {
      return function(error2) {
        captureTransportError(error2);
        return originalOnError.call(this, error2);
      };
    });
  }
}
function captureJsonRpcErrorResponse(errorResponse) {
  try {
    if (errorResponse && typeof errorResponse === "object" && "code" in errorResponse && "message" in errorResponse) {
      const jsonRpcError = errorResponse;
      const isServerError = jsonRpcError.code === -32603 || jsonRpcError.code >= -32099 && jsonRpcError.code <= -32e3;
      if (isServerError) {
        const error2 = new Error(jsonRpcError.message);
        error2.name = `JsonRpcError_${jsonRpcError.code}`;
        captureError(error2, "protocol");
      }
    }
  } catch {
  }
}
function captureTransportError(error2) {
  try {
    captureError(error2, "transport");
  } catch {
  }
}
const wrappedMcpServerInstances = /* @__PURE__ */ new WeakSet();
function wrapMcpServerWithSentry(mcpServerInstance, options) {
  if (wrappedMcpServerInstances.has(mcpServerInstance)) {
    return mcpServerInstance;
  }
  if (!validateMcpServerInstance(mcpServerInstance)) {
    return mcpServerInstance;
  }
  const serverInstance = mcpServerInstance;
  const client = getClient();
  const sendDefaultPii = Boolean(client?.getOptions().sendDefaultPii);
  const resolvedOptions = {
    recordInputs: options?.recordInputs ?? sendDefaultPii,
    recordOutputs: options?.recordOutputs ?? sendDefaultPii
  };
  fill(serverInstance, "connect", (originalConnect) => {
    return async function(transport, ...restArgs) {
      const result = await originalConnect.call(
        this,
        transport,
        ...restArgs
      );
      wrapTransportOnMessage(transport, resolvedOptions);
      wrapTransportSend(transport, resolvedOptions);
      wrapTransportOnClose(transport);
      wrapTransportError(transport);
      return result;
    };
  });
  wrapAllMCPHandlers(serverInstance);
  wrappedMcpServerInstances.add(mcpServerInstance);
  return mcpServerInstance;
}
function captureFeedback(params, hint = {}, scope = getCurrentScope()) {
  const { message, name: name2, email, url, source, associatedEventId, tags } = params;
  const feedbackEvent = {
    contexts: {
      feedback: {
        contact_email: email,
        name: name2,
        message,
        url,
        source,
        associated_event_id: associatedEventId
      }
    },
    type: "feedback",
    level: "info",
    tags
  };
  const client = scope?.getClient() || getClient();
  if (client) {
    client.emit("beforeSendFeedback", feedbackEvent, hint);
  }
  const eventId = scope.captureEvent(feedbackEvent, hint);
  return eventId;
}
function formatConsoleArgs(values, normalizeDepth, normalizeMaxBreadth) {
  return "util" in GLOBAL_OBJ && typeof GLOBAL_OBJ.util.format === "function" ? GLOBAL_OBJ.util.format(...values) : safeJoinConsoleArgs(values, normalizeDepth, normalizeMaxBreadth);
}
function safeJoinConsoleArgs(values, normalizeDepth, normalizeMaxBreadth) {
  return values.map(
    (value) => isPrimitive$1(value) ? String(value) : JSON.stringify(normalize(value, normalizeDepth, normalizeMaxBreadth))
  ).join(" ");
}
function hasConsoleSubstitutions(str) {
  return /%[sdifocO]/.test(str);
}
function createConsoleTemplateAttributes(firstArg, followingArgs) {
  const attributes = {};
  const template = new Array(followingArgs.length).fill("{}").join(" ");
  attributes["sentry.message.template"] = `${firstArg} ${template}`;
  followingArgs.forEach((arg, index) => {
    attributes[`sentry.message.parameter.${index}`] = arg;
  });
  return attributes;
}
const INTEGRATION_NAME$v = "ConsoleLogs";
const DEFAULT_ATTRIBUTES = {
  [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.log.console"
};
const _consoleLoggingIntegration = ((options = {}) => {
  const levels = options.levels || CONSOLE_LEVELS;
  return {
    name: INTEGRATION_NAME$v,
    setup(client) {
      const { enableLogs, normalizeDepth = 3, normalizeMaxBreadth = 1e3 } = client.getOptions();
      if (!enableLogs) {
        DEBUG_BUILD && debug.warn("`enableLogs` is not enabled, ConsoleLogs integration disabled");
        return;
      }
      addConsoleInstrumentationHandler(({ args, level }) => {
        if (getClient() !== client || !levels.includes(level)) {
          return;
        }
        const firstArg = args[0];
        const followingArgs = args.slice(1);
        if (level === "assert") {
          if (!firstArg) {
            const assertionMessage = followingArgs.length > 0 ? `Assertion failed: ${formatConsoleArgs(followingArgs, normalizeDepth, normalizeMaxBreadth)}` : "Assertion failed";
            _INTERNAL_captureLog({ level: "error", message: assertionMessage, attributes: DEFAULT_ATTRIBUTES });
          }
          return;
        }
        const isLevelLog = level === "log";
        const shouldGenerateTemplate = args.length > 1 && typeof args[0] === "string" && !hasConsoleSubstitutions(args[0]);
        const attributes = {
          ...DEFAULT_ATTRIBUTES,
          ...shouldGenerateTemplate ? createConsoleTemplateAttributes(firstArg, followingArgs) : {}
        };
        _INTERNAL_captureLog({
          level: isLevelLog ? "info" : level,
          message: formatConsoleArgs(args, normalizeDepth, normalizeMaxBreadth),
          severityNumber: isLevelLog ? 10 : void 0,
          attributes
        });
      });
    }
  };
});
const consoleLoggingIntegration = defineIntegration(_consoleLoggingIntegration);
function captureMetric(type, name2, value, options) {
  _INTERNAL_captureMetric(
    { type, name: name2, value, unit: options?.unit, attributes: options?.attributes },
    { scope: options?.scope }
  );
}
function count(name2, value = 1, options) {
  captureMetric("counter", name2, value, options);
}
function gauge(name2, value, options) {
  captureMetric("gauge", name2, value, options);
}
function distribution(name2, value, options) {
  captureMetric("distribution", name2, value, options);
}
const publicApi = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  count,
  distribution,
  gauge
}, Symbol.toStringTag, { value: "Module" }));
const DEFAULT_CAPTURED_LEVELS$1 = ["trace", "debug", "info", "warn", "error", "fatal"];
function createConsolaReporter(options = {}) {
  const levels = new Set(options.levels ?? DEFAULT_CAPTURED_LEVELS$1);
  const providedClient = options.client;
  return {
    log(logObj) {
      const { type, level, message: consolaMessage, args, tag, date: _date, ...rest } = logObj;
      const client = providedClient || getClient();
      if (!client) {
        return;
      }
      const logSeverityLevel = getLogSeverityLevel(type, level);
      if (!levels.has(logSeverityLevel)) {
        return;
      }
      const { normalizeDepth = 3, normalizeMaxBreadth = 1e3 } = client.getOptions();
      const attributes = {};
      for (const [key, value] of Object.entries(rest)) {
        attributes[key] = normalize(value, normalizeDepth, normalizeMaxBreadth);
      }
      attributes["sentry.origin"] = "auto.log.consola";
      if (tag) {
        attributes["consola.tag"] = tag;
      }
      if (type) {
        attributes["consola.type"] = type;
      }
      if (level != null && typeof level === "number") {
        attributes["consola.level"] = level;
      }
      const extractionResult = processExtractedAttributes(
        defaultExtractAttributes(args, normalizeDepth, normalizeMaxBreadth),
        normalizeDepth,
        normalizeMaxBreadth
      );
      if (extractionResult?.attributes) {
        Object.assign(attributes, extractionResult.attributes);
      }
      _INTERNAL_captureLog({
        level: logSeverityLevel,
        message: extractionResult?.message || consolaMessage || args && formatConsoleArgs(args, normalizeDepth, normalizeMaxBreadth) || "",
        attributes
      });
    }
  };
}
const CONSOLA_TYPE_TO_LOG_SEVERITY_LEVEL_MAP = {
  // Consola built-in types
  silent: "trace",
  fatal: "fatal",
  error: "error",
  warn: "warn",
  log: "info",
  info: "info",
  success: "info",
  fail: "error",
  ready: "info",
  start: "info",
  box: "info",
  debug: "debug",
  trace: "trace",
  verbose: "debug",
  // Custom types that might exist
  critical: "fatal",
  notice: "info"
};
const CONSOLA_LEVEL_TO_LOG_SEVERITY_LEVEL_MAP = {
  0: "fatal",
  // Fatal and Error
  1: "warn",
  // Warnings
  2: "info",
  // Normal logs
  3: "info",
  // Informational logs, success, fail, ready, start, ...
  4: "debug",
  // Debug logs
  5: "trace"
  // Trace logs
};
function getLogSeverityLevel(type, level) {
  if (type === "verbose") {
    return "debug";
  }
  if (type === "silent") {
    return "trace";
  }
  if (type) {
    const mappedLevel = CONSOLA_TYPE_TO_LOG_SEVERITY_LEVEL_MAP[type];
    if (mappedLevel) {
      return mappedLevel;
    }
  }
  if (typeof level === "number") {
    const mappedLevel = CONSOLA_LEVEL_TO_LOG_SEVERITY_LEVEL_MAP[level];
    if (mappedLevel) {
      return mappedLevel;
    }
  }
  return "info";
}
function defaultExtractAttributes(args, normalizeDepth, normalizeMaxBreadth) {
  if (!args?.length) {
    return { message: "" };
  }
  const message = formatConsoleArgs(args, normalizeDepth, normalizeMaxBreadth);
  const firstArg = args[0];
  if (isPlainObject$1(firstArg)) {
    const remainingArgsStartIndex = typeof args[1] === "string" ? 2 : 1;
    const remainingArgs = args.slice(remainingArgsStartIndex);
    return {
      message,
      // Object content from first arg is added as attributes
      attributes: firstArg,
      // Add remaining args as message parameters
      messageParameters: remainingArgs
    };
  } else {
    const followingArgs = args.slice(1);
    const shouldAddTemplateAttr = followingArgs.length > 0 && typeof firstArg === "string" && !hasConsoleSubstitutions(firstArg);
    return {
      message,
      messageTemplate: shouldAddTemplateAttr ? firstArg : void 0,
      messageParameters: shouldAddTemplateAttr ? followingArgs : void 0
    };
  }
}
function processExtractedAttributes(extractionResult, normalizeDepth, normalizeMaxBreadth) {
  const { message, attributes, messageTemplate, messageParameters } = extractionResult;
  const messageParamAttributes = {};
  if (messageTemplate && messageParameters) {
    const templateAttrs = createConsoleTemplateAttributes(messageTemplate, messageParameters);
    for (const [key, value] of Object.entries(templateAttrs)) {
      messageParamAttributes[key] = key.startsWith("sentry.message.parameter.") ? normalize(value, normalizeDepth, normalizeMaxBreadth) : value;
    }
  } else if (messageParameters && messageParameters.length > 0) {
    messageParameters.forEach((arg, index) => {
      messageParamAttributes[`sentry.message.parameter.${index}`] = normalize(arg, normalizeDepth, normalizeMaxBreadth);
    });
  }
  return {
    message,
    attributes: {
      ...normalize(attributes, normalizeDepth, normalizeMaxBreadth),
      ...messageParamAttributes
    }
  };
}
const GEN_AI_PROMPT_ATTRIBUTE = "gen_ai.prompt";
const GEN_AI_SYSTEM_ATTRIBUTE = "gen_ai.system";
const GEN_AI_REQUEST_MODEL_ATTRIBUTE = "gen_ai.request.model";
const GEN_AI_REQUEST_STREAM_ATTRIBUTE = "gen_ai.request.stream";
const GEN_AI_REQUEST_TEMPERATURE_ATTRIBUTE = "gen_ai.request.temperature";
const GEN_AI_REQUEST_MAX_TOKENS_ATTRIBUTE = "gen_ai.request.max_tokens";
const GEN_AI_REQUEST_FREQUENCY_PENALTY_ATTRIBUTE = "gen_ai.request.frequency_penalty";
const GEN_AI_REQUEST_PRESENCE_PENALTY_ATTRIBUTE = "gen_ai.request.presence_penalty";
const GEN_AI_REQUEST_TOP_P_ATTRIBUTE = "gen_ai.request.top_p";
const GEN_AI_REQUEST_TOP_K_ATTRIBUTE = "gen_ai.request.top_k";
const GEN_AI_REQUEST_ENCODING_FORMAT_ATTRIBUTE = "gen_ai.request.encoding_format";
const GEN_AI_REQUEST_DIMENSIONS_ATTRIBUTE = "gen_ai.request.dimensions";
const GEN_AI_RESPONSE_FINISH_REASONS_ATTRIBUTE = "gen_ai.response.finish_reasons";
const GEN_AI_RESPONSE_MODEL_ATTRIBUTE = "gen_ai.response.model";
const GEN_AI_RESPONSE_ID_ATTRIBUTE = "gen_ai.response.id";
const GEN_AI_RESPONSE_STOP_REASON_ATTRIBUTE = "gen_ai.response.stop_reason";
const GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE = "gen_ai.usage.input_tokens";
const GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE = "gen_ai.usage.output_tokens";
const GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE = "gen_ai.usage.total_tokens";
const GEN_AI_OPERATION_NAME_ATTRIBUTE = "gen_ai.operation.name";
const GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE = "sentry.sdk_meta.gen_ai.input.messages.original_length";
const GEN_AI_INPUT_MESSAGES_ATTRIBUTE = "gen_ai.input.messages";
const GEN_AI_SYSTEM_INSTRUCTIONS_ATTRIBUTE = "gen_ai.system_instructions";
const GEN_AI_RESPONSE_TEXT_ATTRIBUTE = "gen_ai.response.text";
const GEN_AI_REQUEST_AVAILABLE_TOOLS_ATTRIBUTE = "gen_ai.request.available_tools";
const GEN_AI_RESPONSE_STREAMING_ATTRIBUTE = "gen_ai.response.streaming";
const GEN_AI_RESPONSE_TOOL_CALLS_ATTRIBUTE = "gen_ai.response.tool_calls";
const GEN_AI_AGENT_NAME_ATTRIBUTE = "gen_ai.agent.name";
const GEN_AI_PIPELINE_NAME_ATTRIBUTE = "gen_ai.pipeline.name";
const GEN_AI_CONVERSATION_ID_ATTRIBUTE = "gen_ai.conversation.id";
const GEN_AI_USAGE_CACHE_CREATION_INPUT_TOKENS_ATTRIBUTE = "gen_ai.usage.cache_creation_input_tokens";
const GEN_AI_USAGE_CACHE_READ_INPUT_TOKENS_ATTRIBUTE = "gen_ai.usage.cache_read_input_tokens";
const GEN_AI_USAGE_INPUT_TOKENS_CACHE_WRITE_ATTRIBUTE = "gen_ai.usage.input_tokens.cache_write";
const GEN_AI_USAGE_INPUT_TOKENS_CACHED_ATTRIBUTE = "gen_ai.usage.input_tokens.cached";
const GEN_AI_INVOKE_AGENT_OPERATION_ATTRIBUTE = "gen_ai.invoke_agent";
const GEN_AI_GENERATE_TEXT_DO_GENERATE_OPERATION_ATTRIBUTE = "gen_ai.generate_text";
const GEN_AI_STREAM_TEXT_DO_STREAM_OPERATION_ATTRIBUTE = "gen_ai.stream_text";
const GEN_AI_GENERATE_OBJECT_DO_GENERATE_OPERATION_ATTRIBUTE = "gen_ai.generate_object";
const GEN_AI_STREAM_OBJECT_DO_STREAM_OPERATION_ATTRIBUTE = "gen_ai.stream_object";
const GEN_AI_EMBEDDINGS_INPUT_ATTRIBUTE = "gen_ai.embeddings.input";
const GEN_AI_EMBED_DO_EMBED_OPERATION_ATTRIBUTE = "gen_ai.embed";
const GEN_AI_EMBED_MANY_DO_EMBED_OPERATION_ATTRIBUTE = "gen_ai.embed_many";
const GEN_AI_RERANK_DO_RERANK_OPERATION_ATTRIBUTE = "gen_ai.rerank";
const GEN_AI_EXECUTE_TOOL_OPERATION_ATTRIBUTE = "gen_ai.execute_tool";
const GEN_AI_TOOL_NAME_ATTRIBUTE = "gen_ai.tool.name";
const GEN_AI_TOOL_CALL_ID_ATTRIBUTE = "gen_ai.tool.call.id";
const GEN_AI_TOOL_TYPE_ATTRIBUTE = "gen_ai.tool.type";
const GEN_AI_TOOL_INPUT_ATTRIBUTE = "gen_ai.tool.input";
const GEN_AI_TOOL_OUTPUT_ATTRIBUTE = "gen_ai.tool.output";
const OPENAI_RESPONSE_ID_ATTRIBUTE = "openai.response.id";
const OPENAI_RESPONSE_MODEL_ATTRIBUTE = "openai.response.model";
const OPENAI_RESPONSE_TIMESTAMP_ATTRIBUTE = "openai.response.timestamp";
const OPENAI_USAGE_COMPLETION_TOKENS_ATTRIBUTE = "openai.usage.completion_tokens";
const OPENAI_USAGE_PROMPT_TOKENS_ATTRIBUTE = "openai.usage.prompt_tokens";
const OPENAI_OPERATIONS = {
  CHAT: "chat",
  EMBEDDINGS: "embeddings"
};
const ANTHROPIC_AI_RESPONSE_TIMESTAMP_ATTRIBUTE = "anthropic.response.timestamp";
const toolCallSpanMap = /* @__PURE__ */ new Map();
const INVOKE_AGENT_OPS = /* @__PURE__ */ new Set([
  "ai.generateText",
  "ai.streamText",
  "ai.generateObject",
  "ai.streamObject",
  "ai.embed",
  "ai.embedMany",
  "ai.rerank"
]);
const GENERATE_CONTENT_OPS = /* @__PURE__ */ new Set([
  "ai.generateText.doGenerate",
  "ai.streamText.doStream",
  "ai.generateObject.doGenerate",
  "ai.streamObject.doStream"
]);
const EMBEDDINGS_OPS = /* @__PURE__ */ new Set(["ai.embed.doEmbed", "ai.embedMany.doEmbed"]);
const RERANK_OPS = /* @__PURE__ */ new Set(["ai.rerank.doRerank"]);
function isContentMedia(part) {
  if (!part || typeof part !== "object") return false;
  return isContentMediaSource(part) || hasInlineData(part) || hasImageUrl(part) || hasInputAudio(part) || hasFileData(part) || hasMediaTypeData(part) || hasBlobOrBase64Type(part) || hasB64Json(part) || hasImageGenerationResult(part) || hasDataUri(part);
}
function hasImageUrl(part) {
  if (!("image_url" in part)) return false;
  if (typeof part.image_url === "string") return part.image_url.startsWith("data:");
  return hasNestedImageUrl(part);
}
function hasNestedImageUrl(part) {
  return "image_url" in part && !!part.image_url && typeof part.image_url === "object" && "url" in part.image_url && typeof part.image_url.url === "string" && part.image_url.url.startsWith("data:");
}
function isContentMediaSource(part) {
  return "type" in part && typeof part.type === "string" && "source" in part && isContentMedia(part.source);
}
function hasInlineData(part) {
  return "inlineData" in part && !!part.inlineData && typeof part.inlineData === "object" && "data" in part.inlineData && typeof part.inlineData.data === "string";
}
function hasInputAudio(part) {
  return "type" in part && part.type === "input_audio" && "input_audio" in part && !!part.input_audio && typeof part.input_audio === "object" && "data" in part.input_audio && typeof part.input_audio.data === "string";
}
function hasFileData(part) {
  return "type" in part && part.type === "file" && "file" in part && !!part.file && typeof part.file === "object" && "file_data" in part.file && typeof part.file.file_data === "string";
}
function hasMediaTypeData(part) {
  return "media_type" in part && typeof part.media_type === "string" && "data" in part;
}
function hasBlobOrBase64Type(part) {
  return "type" in part && (part.type === "blob" || part.type === "base64");
}
function hasB64Json(part) {
  return "b64_json" in part;
}
function hasImageGenerationResult(part) {
  return "type" in part && "result" in part && part.type === "image_generation";
}
function hasDataUri(part) {
  return "uri" in part && typeof part.uri === "string" && part.uri.startsWith("data:");
}
const REMOVED_STRING = "[Blob substitute]";
const MEDIA_FIELDS = ["image_url", "data", "content", "b64_json", "result", "uri"];
function stripInlineMediaFromSingleMessage(part) {
  const strip = { ...part };
  if (isContentMedia(strip.source)) {
    strip.source = stripInlineMediaFromSingleMessage(strip.source);
  }
  if (hasInlineData(part)) {
    strip.inlineData = { ...part.inlineData, data: REMOVED_STRING };
  }
  if (hasNestedImageUrl(part)) {
    strip.image_url = { ...part.image_url, url: REMOVED_STRING };
  }
  if (hasInputAudio(part)) {
    strip.input_audio = { ...part.input_audio, data: REMOVED_STRING };
  }
  if (hasFileData(part)) {
    strip.file = { ...part.file, file_data: REMOVED_STRING };
  }
  for (const field of MEDIA_FIELDS) {
    if (typeof strip[field] === "string") strip[field] = REMOVED_STRING;
  }
  return strip;
}
const DEFAULT_GEN_AI_MESSAGES_BYTE_LIMIT = 2e4;
const utf8Bytes = (text) => {
  return new TextEncoder().encode(text).length;
};
const jsonBytes = (value) => {
  return utf8Bytes(JSON.stringify(value));
};
function truncateTextByBytes(text, maxBytes) {
  if (utf8Bytes(text) <= maxBytes) {
    return text;
  }
  let low = 0;
  let high = text.length;
  let bestFit = "";
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const candidate = text.slice(0, mid);
    const byteSize = utf8Bytes(candidate);
    if (byteSize <= maxBytes) {
      bestFit = candidate;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return bestFit;
}
function getPartText(part) {
  if (typeof part === "string") {
    return part;
  }
  if ("text" in part) return part.text;
  return "";
}
function withPartText(part, text) {
  if (typeof part === "string") {
    return text;
  }
  return { ...part, text };
}
function isContentMessage(message) {
  return message !== null && typeof message === "object" && "content" in message && typeof message.content === "string";
}
function isContentArrayMessage(message) {
  return message !== null && typeof message === "object" && "content" in message && Array.isArray(message.content);
}
function isPartsMessage(message) {
  return message !== null && typeof message === "object" && "parts" in message && Array.isArray(message.parts) && message.parts.length > 0;
}
function truncateContentMessage(message, maxBytes) {
  const emptyMessage = { ...message, content: "" };
  const overhead = jsonBytes(emptyMessage);
  const availableForContent = maxBytes - overhead;
  if (availableForContent <= 0) {
    return [];
  }
  const truncatedContent = truncateTextByBytes(message.content, availableForContent);
  return [{ ...message, content: truncatedContent }];
}
function truncatePartsMessage(message, maxBytes) {
  const { parts } = message;
  const emptyParts = parts.map((part) => withPartText(part, ""));
  const overhead = jsonBytes({ ...message, parts: emptyParts });
  let remainingBytes = maxBytes - overhead;
  if (remainingBytes <= 0) {
    return [];
  }
  const includedParts = [];
  for (const part of parts) {
    const text = getPartText(part);
    const textSize = utf8Bytes(text);
    if (textSize <= remainingBytes) {
      includedParts.push(part);
      remainingBytes -= textSize;
    } else if (includedParts.length === 0) {
      const truncated = truncateTextByBytes(text, remainingBytes);
      if (truncated) {
        includedParts.push(withPartText(part, truncated));
      }
      break;
    } else {
      break;
    }
  }
  if (includedParts.length <= 0) {
    return [];
  } else {
    return [{ ...message, parts: includedParts }];
  }
}
function truncateSingleMessage(message, maxBytes) {
  if (!message) return [];
  if (typeof message === "string") {
    const truncated = truncateTextByBytes(message, maxBytes);
    return truncated ? [truncated] : [];
  }
  if (typeof message !== "object") {
    return [];
  }
  if (isContentMessage(message)) {
    return truncateContentMessage(message, maxBytes);
  }
  if (isPartsMessage(message)) {
    return truncatePartsMessage(message, maxBytes);
  }
  return [];
}
function stripInlineMediaFromMessages(messages) {
  const stripped = messages.map((message) => {
    let newMessage = void 0;
    if (!!message && typeof message === "object") {
      if (isContentArrayMessage(message)) {
        newMessage = {
          ...message,
          content: stripInlineMediaFromMessages(message.content)
        };
      } else if ("content" in message && isContentMedia(message.content)) {
        newMessage = {
          ...message,
          content: stripInlineMediaFromSingleMessage(message.content)
        };
      }
      if (isPartsMessage(message)) {
        newMessage = {
          // might have to strip content AND parts
          ...newMessage ?? message,
          parts: stripInlineMediaFromMessages(message.parts)
        };
      }
      if (isContentMedia(newMessage)) {
        newMessage = stripInlineMediaFromSingleMessage(newMessage);
      } else if (isContentMedia(message)) {
        newMessage = stripInlineMediaFromSingleMessage(message);
      }
    }
    return newMessage ?? message;
  });
  return stripped;
}
function truncateMessagesByBytes(messages, maxBytes) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return messages;
  }
  const effectiveMaxBytes = maxBytes - 2;
  const lastMessage = messages[messages.length - 1];
  const stripped = stripInlineMediaFromMessages([lastMessage]);
  const strippedMessage = stripped[0];
  const messageBytes = jsonBytes(strippedMessage);
  if (messageBytes <= effectiveMaxBytes) {
    return stripped;
  }
  return truncateSingleMessage(strippedMessage, effectiveMaxBytes);
}
function truncateGenAiMessages(messages) {
  return truncateMessagesByBytes(messages, DEFAULT_GEN_AI_MESSAGES_BYTE_LIMIT);
}
function truncateGenAiStringInput(input) {
  return truncateTextByBytes(input, DEFAULT_GEN_AI_MESSAGES_BYTE_LIMIT);
}
function getFinalOperationName(methodPath) {
  if (methodPath.includes("messages")) {
    return "chat";
  }
  if (methodPath.includes("completions")) {
    return "text_completion";
  }
  if (methodPath.includes("generateContent")) {
    return "generate_content";
  }
  if (methodPath.includes("models")) {
    return "models";
  }
  if (methodPath.includes("chat")) {
    return "chat";
  }
  return methodPath.split(".").pop() || "unknown";
}
function getSpanOperation$1(methodPath) {
  return `gen_ai.${getFinalOperationName(methodPath)}`;
}
function buildMethodPath$1(currentPath, prop) {
  return currentPath ? `${currentPath}.${prop}` : prop;
}
function setTokenUsageAttributes$1(span, promptTokens, completionTokens, cachedInputTokens, cachedOutputTokens) {
  if (promptTokens !== void 0) {
    span.setAttributes({
      [GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE]: promptTokens
    });
  }
  if (completionTokens !== void 0) {
    span.setAttributes({
      [GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE]: completionTokens
    });
  }
  if (promptTokens !== void 0 || completionTokens !== void 0 || cachedInputTokens !== void 0 || cachedOutputTokens !== void 0) {
    const totalTokens = (promptTokens ?? 0) + (completionTokens ?? 0) + (cachedInputTokens ?? 0) + (cachedOutputTokens ?? 0);
    span.setAttributes({
      [GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE]: totalTokens
    });
  }
}
function getTruncatedJsonString(value) {
  if (typeof value === "string") {
    return truncateGenAiStringInput(value);
  }
  if (Array.isArray(value)) {
    const truncatedMessages = truncateGenAiMessages(value);
    return JSON.stringify(truncatedMessages);
  }
  return JSON.stringify(value);
}
function extractSystemInstructions(messages) {
  if (!Array.isArray(messages)) {
    return { systemInstructions: void 0, filteredMessages: messages };
  }
  const systemMessageIndex = messages.findIndex(
    (msg) => msg && typeof msg === "object" && "role" in msg && msg.role === "system"
  );
  if (systemMessageIndex === -1) {
    return { systemInstructions: void 0, filteredMessages: messages };
  }
  const systemMessage = messages[systemMessageIndex];
  const systemContent = typeof systemMessage.content === "string" ? systemMessage.content : systemMessage.content !== void 0 ? JSON.stringify(systemMessage.content) : void 0;
  if (!systemContent) {
    return { systemInstructions: void 0, filteredMessages: messages };
  }
  const systemInstructions = JSON.stringify([{ type: "text", content: systemContent }]);
  const filteredMessages = [...messages.slice(0, systemMessageIndex), ...messages.slice(systemMessageIndex + 1)];
  return { systemInstructions, filteredMessages };
}
const OPERATION_NAME_ATTRIBUTE = "operation.name";
const AI_OPERATION_ID_ATTRIBUTE = "ai.operationId";
const AI_PROMPT_ATTRIBUTE = "ai.prompt";
const AI_SCHEMA_ATTRIBUTE = "ai.schema";
const AI_RESPONSE_OBJECT_ATTRIBUTE = "ai.response.object";
const AI_RESPONSE_TEXT_ATTRIBUTE = "ai.response.text";
const AI_RESPONSE_TOOL_CALLS_ATTRIBUTE = "ai.response.toolCalls";
const AI_PROMPT_MESSAGES_ATTRIBUTE = "ai.prompt.messages";
const AI_PROMPT_TOOLS_ATTRIBUTE = "ai.prompt.tools";
const AI_MODEL_ID_ATTRIBUTE = "ai.model.id";
const AI_RESPONSE_PROVIDER_METADATA_ATTRIBUTE = "ai.response.providerMetadata";
const AI_USAGE_CACHED_INPUT_TOKENS_ATTRIBUTE = "ai.usage.cachedInputTokens";
const AI_TELEMETRY_FUNCTION_ID_ATTRIBUTE = "ai.telemetry.functionId";
const AI_USAGE_COMPLETION_TOKENS_ATTRIBUTE = "ai.usage.completionTokens";
const AI_USAGE_PROMPT_TOKENS_ATTRIBUTE = "ai.usage.promptTokens";
const AI_TOOL_CALL_NAME_ATTRIBUTE = "ai.toolCall.name";
const AI_TOOL_CALL_ID_ATTRIBUTE = "ai.toolCall.id";
const AI_TOOL_CALL_ARGS_ATTRIBUTE = "ai.toolCall.args";
const AI_TOOL_CALL_RESULT_ATTRIBUTE = "ai.toolCall.result";
function accumulateTokensForParent(span, tokenAccumulator) {
  const parentSpanId = span.parent_span_id;
  if (!parentSpanId) {
    return;
  }
  const inputTokens = span.data[GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE];
  const outputTokens = span.data[GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE];
  if (typeof inputTokens === "number" || typeof outputTokens === "number") {
    const existing = tokenAccumulator.get(parentSpanId) || { inputTokens: 0, outputTokens: 0 };
    if (typeof inputTokens === "number") {
      existing.inputTokens += inputTokens;
    }
    if (typeof outputTokens === "number") {
      existing.outputTokens += outputTokens;
    }
    tokenAccumulator.set(parentSpanId, existing);
  }
}
function applyAccumulatedTokens(spanOrTrace, tokenAccumulator) {
  const accumulated = tokenAccumulator.get(spanOrTrace.span_id);
  if (!accumulated || !spanOrTrace.data) {
    return;
  }
  if (accumulated.inputTokens > 0) {
    spanOrTrace.data[GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE] = accumulated.inputTokens;
  }
  if (accumulated.outputTokens > 0) {
    spanOrTrace.data[GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE] = accumulated.outputTokens;
  }
  if (accumulated.inputTokens > 0 || accumulated.outputTokens > 0) {
    spanOrTrace.data["gen_ai.usage.total_tokens"] = accumulated.inputTokens + accumulated.outputTokens;
  }
}
function _INTERNAL_getSpanForToolCallId(toolCallId) {
  return toolCallSpanMap.get(toolCallId);
}
function _INTERNAL_cleanupToolCallSpan(toolCallId) {
  toolCallSpanMap.delete(toolCallId);
}
function convertAvailableToolsToJsonString(tools) {
  const toolObjects = tools.map((tool) => {
    if (typeof tool === "string") {
      try {
        return JSON.parse(tool);
      } catch {
        return tool;
      }
    }
    return tool;
  });
  return JSON.stringify(toolObjects);
}
function filterMessagesArray(input) {
  return input.filter(
    (m) => !!m && typeof m === "object" && "role" in m && "content" in m
  );
}
function convertUserInputToMessagesFormat(userInput) {
  try {
    const p = JSON.parse(userInput);
    if (!!p && typeof p === "object") {
      let { messages } = p;
      const { prompt, system } = p;
      const result = [];
      if (typeof system === "string") {
        result.push({ role: "system", content: system });
      }
      if (typeof messages === "string") {
        try {
          messages = JSON.parse(messages);
        } catch {
        }
      }
      if (Array.isArray(messages)) {
        result.push(...filterMessagesArray(messages));
        return result;
      }
      if (Array.isArray(prompt)) {
        result.push(...filterMessagesArray(prompt));
        return result;
      }
      if (typeof prompt === "string") {
        result.push({ role: "user", content: prompt });
      }
      if (result.length > 0) {
        return result;
      }
    }
  } catch {
  }
  return [];
}
function requestMessagesFromPrompt(span, attributes) {
  if (typeof attributes[AI_PROMPT_ATTRIBUTE] === "string" && !attributes[GEN_AI_INPUT_MESSAGES_ATTRIBUTE] && !attributes[AI_PROMPT_MESSAGES_ATTRIBUTE]) {
    const userInput = attributes[AI_PROMPT_ATTRIBUTE];
    const messages = convertUserInputToMessagesFormat(userInput);
    if (messages.length) {
      const { systemInstructions, filteredMessages } = extractSystemInstructions(messages);
      if (systemInstructions) {
        span.setAttribute(GEN_AI_SYSTEM_INSTRUCTIONS_ATTRIBUTE, systemInstructions);
      }
      const filteredLength = Array.isArray(filteredMessages) ? filteredMessages.length : 0;
      const truncatedMessages = getTruncatedJsonString(filteredMessages);
      span.setAttributes({
        [AI_PROMPT_ATTRIBUTE]: truncatedMessages,
        [GEN_AI_INPUT_MESSAGES_ATTRIBUTE]: truncatedMessages,
        [GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE]: filteredLength
      });
    }
  } else if (typeof attributes[AI_PROMPT_MESSAGES_ATTRIBUTE] === "string") {
    try {
      const messages = JSON.parse(attributes[AI_PROMPT_MESSAGES_ATTRIBUTE]);
      if (Array.isArray(messages)) {
        const { systemInstructions, filteredMessages } = extractSystemInstructions(messages);
        if (systemInstructions) {
          span.setAttribute(GEN_AI_SYSTEM_INSTRUCTIONS_ATTRIBUTE, systemInstructions);
        }
        const filteredLength = Array.isArray(filteredMessages) ? filteredMessages.length : 0;
        const truncatedMessages = getTruncatedJsonString(filteredMessages);
        span.setAttributes({
          [AI_PROMPT_MESSAGES_ATTRIBUTE]: truncatedMessages,
          [GEN_AI_INPUT_MESSAGES_ATTRIBUTE]: truncatedMessages,
          [GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE]: filteredLength
        });
      }
    } catch {
    }
  }
}
function getSpanOpFromName(name2) {
  switch (name2) {
    case "ai.generateText":
    case "ai.streamText":
    case "ai.generateObject":
    case "ai.streamObject":
    case "ai.embed":
    case "ai.embedMany":
    case "ai.rerank":
      return GEN_AI_INVOKE_AGENT_OPERATION_ATTRIBUTE;
    case "ai.generateText.doGenerate":
      return GEN_AI_GENERATE_TEXT_DO_GENERATE_OPERATION_ATTRIBUTE;
    case "ai.streamText.doStream":
      return GEN_AI_STREAM_TEXT_DO_STREAM_OPERATION_ATTRIBUTE;
    case "ai.generateObject.doGenerate":
      return GEN_AI_GENERATE_OBJECT_DO_GENERATE_OPERATION_ATTRIBUTE;
    case "ai.streamObject.doStream":
      return GEN_AI_STREAM_OBJECT_DO_STREAM_OPERATION_ATTRIBUTE;
    case "ai.embed.doEmbed":
      return GEN_AI_EMBED_DO_EMBED_OPERATION_ATTRIBUTE;
    case "ai.embedMany.doEmbed":
      return GEN_AI_EMBED_MANY_DO_EMBED_OPERATION_ATTRIBUTE;
    case "ai.rerank.doRerank":
      return GEN_AI_RERANK_DO_RERANK_OPERATION_ATTRIBUTE;
    case "ai.toolCall":
      return GEN_AI_EXECUTE_TOOL_OPERATION_ATTRIBUTE;
    default:
      if (name2.startsWith("ai.stream")) {
        return "ai.run";
      }
      return void 0;
  }
}
function addOriginToSpan$1(span, origin) {
  span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, origin);
}
function mapVercelAiOperationName(operationName) {
  if (INVOKE_AGENT_OPS.has(operationName)) {
    return "invoke_agent";
  }
  if (GENERATE_CONTENT_OPS.has(operationName)) {
    return "generate_content";
  }
  if (EMBEDDINGS_OPS.has(operationName)) {
    return "embeddings";
  }
  if (RERANK_OPS.has(operationName)) {
    return "rerank";
  }
  if (operationName === "ai.toolCall") {
    return "execute_tool";
  }
  return operationName;
}
function onVercelAiSpanStart(span) {
  const { data: attributes, description: name2 } = spanToJSON(span);
  if (!name2) {
    return;
  }
  if (attributes[AI_TOOL_CALL_NAME_ATTRIBUTE] && attributes[AI_TOOL_CALL_ID_ATTRIBUTE] && name2 === "ai.toolCall") {
    processToolCallSpan(span, attributes);
    return;
  }
  if (!attributes[AI_OPERATION_ID_ATTRIBUTE] && !name2.startsWith("ai.")) {
    return;
  }
  processGenerateSpan(span, name2, attributes);
}
function vercelAiEventProcessor(event) {
  if (event.type === "transaction" && event.spans) {
    const tokenAccumulator = /* @__PURE__ */ new Map();
    for (const span of event.spans) {
      processEndedVercelAiSpan(span);
      accumulateTokensForParent(span, tokenAccumulator);
    }
    for (const span of event.spans) {
      if (span.op !== "gen_ai.invoke_agent") {
        continue;
      }
      applyAccumulatedTokens(span, tokenAccumulator);
    }
    const trace2 = event.contexts?.trace;
    if (trace2 && trace2.op === "gen_ai.invoke_agent") {
      applyAccumulatedTokens(trace2, tokenAccumulator);
    }
  }
  return event;
}
function processEndedVercelAiSpan(span) {
  const { data: attributes, origin } = span;
  if (origin !== "auto.vercelai.otel") {
    return;
  }
  renameAttributeKey(attributes, AI_USAGE_COMPLETION_TOKENS_ATTRIBUTE, GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE);
  renameAttributeKey(attributes, AI_USAGE_PROMPT_TOKENS_ATTRIBUTE, GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE);
  renameAttributeKey(attributes, AI_USAGE_CACHED_INPUT_TOKENS_ATTRIBUTE, GEN_AI_USAGE_INPUT_TOKENS_CACHED_ATTRIBUTE);
  renameAttributeKey(attributes, "ai.usage.inputTokens", GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE);
  renameAttributeKey(attributes, "ai.usage.outputTokens", GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE);
  renameAttributeKey(attributes, "ai.response.avgOutputTokensPerSecond", "ai.response.avgCompletionTokensPerSecond");
  if (typeof attributes[GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE] === "number" && typeof attributes[GEN_AI_USAGE_INPUT_TOKENS_CACHED_ATTRIBUTE] === "number") {
    attributes[GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE] = attributes[GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE] + attributes[GEN_AI_USAGE_INPUT_TOKENS_CACHED_ATTRIBUTE];
  }
  if (typeof attributes[GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE] === "number" && typeof attributes[GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE] === "number") {
    attributes[GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE] = attributes[GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE] + attributes[GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE];
  }
  if (attributes[AI_PROMPT_TOOLS_ATTRIBUTE] && Array.isArray(attributes[AI_PROMPT_TOOLS_ATTRIBUTE])) {
    attributes[AI_PROMPT_TOOLS_ATTRIBUTE] = convertAvailableToolsToJsonString(
      attributes[AI_PROMPT_TOOLS_ATTRIBUTE]
    );
  }
  if (attributes[OPERATION_NAME_ATTRIBUTE]) {
    const operationName = mapVercelAiOperationName(attributes[OPERATION_NAME_ATTRIBUTE]);
    attributes[GEN_AI_OPERATION_NAME_ATTRIBUTE] = operationName;
    delete attributes[OPERATION_NAME_ATTRIBUTE];
  }
  renameAttributeKey(attributes, AI_PROMPT_MESSAGES_ATTRIBUTE, GEN_AI_INPUT_MESSAGES_ATTRIBUTE);
  renameAttributeKey(attributes, AI_RESPONSE_TEXT_ATTRIBUTE, "gen_ai.response.text");
  renameAttributeKey(attributes, AI_RESPONSE_TOOL_CALLS_ATTRIBUTE, "gen_ai.response.tool_calls");
  renameAttributeKey(attributes, AI_RESPONSE_OBJECT_ATTRIBUTE, "gen_ai.response.object");
  renameAttributeKey(attributes, AI_PROMPT_TOOLS_ATTRIBUTE, "gen_ai.request.available_tools");
  renameAttributeKey(attributes, AI_TOOL_CALL_ARGS_ATTRIBUTE, GEN_AI_TOOL_INPUT_ATTRIBUTE);
  renameAttributeKey(attributes, AI_TOOL_CALL_RESULT_ATTRIBUTE, GEN_AI_TOOL_OUTPUT_ATTRIBUTE);
  renameAttributeKey(attributes, AI_SCHEMA_ATTRIBUTE, "gen_ai.request.schema");
  renameAttributeKey(attributes, AI_MODEL_ID_ATTRIBUTE, GEN_AI_REQUEST_MODEL_ATTRIBUTE);
  addProviderMetadataToAttributes(attributes);
  for (const key of Object.keys(attributes)) {
    if (key.startsWith("ai.")) {
      renameAttributeKey(attributes, key, `vercel.${key}`);
    }
  }
}
function renameAttributeKey(attributes, oldKey, newKey) {
  if (attributes[oldKey] != null) {
    attributes[newKey] = attributes[oldKey];
    delete attributes[oldKey];
  }
}
function processToolCallSpan(span, attributes) {
  addOriginToSpan$1(span, "auto.vercelai.otel");
  span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_OP, "gen_ai.execute_tool");
  span.setAttribute(GEN_AI_OPERATION_NAME_ATTRIBUTE, "execute_tool");
  renameAttributeKey(attributes, AI_TOOL_CALL_NAME_ATTRIBUTE, GEN_AI_TOOL_NAME_ATTRIBUTE);
  renameAttributeKey(attributes, AI_TOOL_CALL_ID_ATTRIBUTE, GEN_AI_TOOL_CALL_ID_ATTRIBUTE);
  const toolCallId = attributes[GEN_AI_TOOL_CALL_ID_ATTRIBUTE];
  if (typeof toolCallId === "string") {
    toolCallSpanMap.set(toolCallId, span);
  }
  if (!attributes[GEN_AI_TOOL_TYPE_ATTRIBUTE]) {
    span.setAttribute(GEN_AI_TOOL_TYPE_ATTRIBUTE, "function");
  }
  const toolName = attributes[GEN_AI_TOOL_NAME_ATTRIBUTE];
  if (toolName) {
    span.updateName(`execute_tool ${toolName}`);
  }
}
function processGenerateSpan(span, name2, attributes) {
  addOriginToSpan$1(span, "auto.vercelai.otel");
  const nameWthoutAi = name2.replace("ai.", "");
  span.setAttribute("ai.pipeline.name", nameWthoutAi);
  span.updateName(nameWthoutAi);
  const functionId = attributes[AI_TELEMETRY_FUNCTION_ID_ATTRIBUTE];
  if (functionId && typeof functionId === "string") {
    span.updateName(`${nameWthoutAi} ${functionId}`);
    span.setAttribute("gen_ai.function_id", functionId);
  }
  requestMessagesFromPrompt(span, attributes);
  if (attributes[AI_MODEL_ID_ATTRIBUTE] && !attributes[GEN_AI_RESPONSE_MODEL_ATTRIBUTE]) {
    span.setAttribute(GEN_AI_RESPONSE_MODEL_ATTRIBUTE, attributes[AI_MODEL_ID_ATTRIBUTE]);
  }
  span.setAttribute("ai.streaming", name2.includes("stream"));
  const op = getSpanOpFromName(name2);
  if (op) {
    span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_OP, op);
  }
  const modelId = attributes[AI_MODEL_ID_ATTRIBUTE];
  if (modelId) {
    switch (name2) {
      case "ai.generateText.doGenerate":
        span.updateName(`generate_text ${modelId}`);
        break;
      case "ai.streamText.doStream":
        span.updateName(`stream_text ${modelId}`);
        break;
      case "ai.generateObject.doGenerate":
        span.updateName(`generate_object ${modelId}`);
        break;
      case "ai.streamObject.doStream":
        span.updateName(`stream_object ${modelId}`);
        break;
      case "ai.embed.doEmbed":
        span.updateName(`embed ${modelId}`);
        break;
      case "ai.embedMany.doEmbed":
        span.updateName(`embed_many ${modelId}`);
        break;
      case "ai.rerank.doRerank":
        span.updateName(`rerank ${modelId}`);
        break;
    }
  }
}
function addVercelAiProcessors(client) {
  client.on("spanStart", onVercelAiSpanStart);
  client.addEventProcessor(Object.assign(vercelAiEventProcessor, { id: "VercelAiEventProcessor" }));
}
function addProviderMetadataToAttributes(attributes) {
  const providerMetadata = attributes[AI_RESPONSE_PROVIDER_METADATA_ATTRIBUTE];
  if (providerMetadata) {
    try {
      const providerMetadataObject = JSON.parse(providerMetadata);
      const openaiMetadata = providerMetadataObject.openai ?? providerMetadataObject.azure;
      if (openaiMetadata) {
        setAttributeIfDefined(
          attributes,
          GEN_AI_USAGE_INPUT_TOKENS_CACHED_ATTRIBUTE,
          openaiMetadata.cachedPromptTokens
        );
        setAttributeIfDefined(attributes, "gen_ai.usage.output_tokens.reasoning", openaiMetadata.reasoningTokens);
        setAttributeIfDefined(
          attributes,
          "gen_ai.usage.output_tokens.prediction_accepted",
          openaiMetadata.acceptedPredictionTokens
        );
        setAttributeIfDefined(
          attributes,
          "gen_ai.usage.output_tokens.prediction_rejected",
          openaiMetadata.rejectedPredictionTokens
        );
        setAttributeIfDefined(attributes, "gen_ai.conversation.id", openaiMetadata.responseId);
      }
      if (providerMetadataObject.anthropic) {
        const cachedInputTokens = providerMetadataObject.anthropic.usage?.cache_read_input_tokens ?? providerMetadataObject.anthropic.cacheReadInputTokens;
        setAttributeIfDefined(attributes, GEN_AI_USAGE_INPUT_TOKENS_CACHED_ATTRIBUTE, cachedInputTokens);
        const cacheWriteInputTokens = providerMetadataObject.anthropic.usage?.cache_creation_input_tokens ?? providerMetadataObject.anthropic.cacheCreationInputTokens;
        setAttributeIfDefined(attributes, GEN_AI_USAGE_INPUT_TOKENS_CACHE_WRITE_ATTRIBUTE, cacheWriteInputTokens);
      }
      if (providerMetadataObject.bedrock?.usage) {
        setAttributeIfDefined(
          attributes,
          GEN_AI_USAGE_INPUT_TOKENS_CACHED_ATTRIBUTE,
          providerMetadataObject.bedrock.usage.cacheReadInputTokens
        );
        setAttributeIfDefined(
          attributes,
          GEN_AI_USAGE_INPUT_TOKENS_CACHE_WRITE_ATTRIBUTE,
          providerMetadataObject.bedrock.usage.cacheWriteInputTokens
        );
      }
      if (providerMetadataObject.deepseek) {
        setAttributeIfDefined(
          attributes,
          GEN_AI_USAGE_INPUT_TOKENS_CACHED_ATTRIBUTE,
          providerMetadataObject.deepseek.promptCacheHitTokens
        );
        setAttributeIfDefined(
          attributes,
          "gen_ai.usage.input_tokens.cache_miss",
          providerMetadataObject.deepseek.promptCacheMissTokens
        );
      }
    } catch {
    }
  }
}
function setAttributeIfDefined(attributes, key, value) {
  if (value != null) {
    attributes[key] = value;
  }
}
const OPENAI_INTEGRATION_NAME = "OpenAI";
const INSTRUMENTED_METHODS$1 = [
  "responses.create",
  "chat.completions.create",
  "embeddings.create",
  // Conversations API - for conversation state management
  // https://platform.openai.com/docs/guides/conversation-state
  "conversations.create"
];
const RESPONSES_TOOL_CALL_EVENT_TYPES = [
  "response.output_item.added",
  "response.function_call_arguments.delta",
  "response.function_call_arguments.done",
  "response.output_item.done"
];
const RESPONSE_EVENT_TYPES = [
  "response.created",
  "response.in_progress",
  "response.failed",
  "response.completed",
  "response.incomplete",
  "response.queued",
  "response.output_text.delta",
  ...RESPONSES_TOOL_CALL_EVENT_TYPES
];
function getOperationName(methodPath) {
  if (methodPath.includes("chat.completions")) {
    return OPENAI_OPERATIONS.CHAT;
  }
  if (methodPath.includes("responses")) {
    return OPENAI_OPERATIONS.CHAT;
  }
  if (methodPath.includes("embeddings")) {
    return OPENAI_OPERATIONS.EMBEDDINGS;
  }
  if (methodPath.includes("conversations")) {
    return OPENAI_OPERATIONS.CHAT;
  }
  return methodPath.split(".").pop() || "unknown";
}
function getSpanOperation(methodPath) {
  return `gen_ai.${getOperationName(methodPath)}`;
}
function shouldInstrument$2(methodPath) {
  return INSTRUMENTED_METHODS$1.includes(methodPath);
}
function buildMethodPath(currentPath, prop) {
  return currentPath ? `${currentPath}.${prop}` : prop;
}
function isChatCompletionResponse(response) {
  return response !== null && typeof response === "object" && "object" in response && response.object === "chat.completion";
}
function isResponsesApiResponse(response) {
  return response !== null && typeof response === "object" && "object" in response && response.object === "response";
}
function isEmbeddingsResponse(response) {
  if (response === null || typeof response !== "object" || !("object" in response)) {
    return false;
  }
  const responseObject = response;
  return responseObject.object === "list" && typeof responseObject.model === "string" && responseObject.model.toLowerCase().includes("embedding");
}
function isConversationResponse(response) {
  return response !== null && typeof response === "object" && "object" in response && response.object === "conversation";
}
function isResponsesApiStreamEvent(event) {
  return event !== null && typeof event === "object" && "type" in event && typeof event.type === "string" && event.type.startsWith("response.");
}
function isChatCompletionChunk(event) {
  return event !== null && typeof event === "object" && "object" in event && event.object === "chat.completion.chunk";
}
function addChatCompletionAttributes(span, response, recordOutputs) {
  setCommonResponseAttributes(span, response.id, response.model, response.created);
  if (response.usage) {
    setTokenUsageAttributes(
      span,
      response.usage.prompt_tokens,
      response.usage.completion_tokens,
      response.usage.total_tokens
    );
  }
  if (Array.isArray(response.choices)) {
    const finishReasons = response.choices.map((choice) => choice.finish_reason).filter((reason) => reason !== null);
    if (finishReasons.length > 0) {
      span.setAttributes({
        [GEN_AI_RESPONSE_FINISH_REASONS_ATTRIBUTE]: JSON.stringify(finishReasons)
      });
    }
    if (recordOutputs) {
      const toolCalls = response.choices.map((choice) => choice.message?.tool_calls).filter((calls) => Array.isArray(calls) && calls.length > 0).flat();
      if (toolCalls.length > 0) {
        span.setAttributes({
          [GEN_AI_RESPONSE_TOOL_CALLS_ATTRIBUTE]: JSON.stringify(toolCalls)
        });
      }
    }
  }
}
function addResponsesApiAttributes(span, response, recordOutputs) {
  setCommonResponseAttributes(span, response.id, response.model, response.created_at);
  if (response.status) {
    span.setAttributes({
      [GEN_AI_RESPONSE_FINISH_REASONS_ATTRIBUTE]: JSON.stringify([response.status])
    });
  }
  if (response.usage) {
    setTokenUsageAttributes(
      span,
      response.usage.input_tokens,
      response.usage.output_tokens,
      response.usage.total_tokens
    );
  }
  if (recordOutputs) {
    const responseWithOutput = response;
    if (Array.isArray(responseWithOutput.output) && responseWithOutput.output.length > 0) {
      const functionCalls = responseWithOutput.output.filter(
        (item) => typeof item === "object" && item !== null && item.type === "function_call"
      );
      if (functionCalls.length > 0) {
        span.setAttributes({
          [GEN_AI_RESPONSE_TOOL_CALLS_ATTRIBUTE]: JSON.stringify(functionCalls)
        });
      }
    }
  }
}
function addEmbeddingsAttributes(span, response) {
  span.setAttributes({
    [OPENAI_RESPONSE_MODEL_ATTRIBUTE]: response.model,
    [GEN_AI_RESPONSE_MODEL_ATTRIBUTE]: response.model
  });
  if (response.usage) {
    setTokenUsageAttributes(span, response.usage.prompt_tokens, void 0, response.usage.total_tokens);
  }
}
function addConversationAttributes(span, response) {
  const { id, created_at } = response;
  span.setAttributes({
    [OPENAI_RESPONSE_ID_ATTRIBUTE]: id,
    [GEN_AI_RESPONSE_ID_ATTRIBUTE]: id,
    // The conversation id is used to link messages across API calls
    [GEN_AI_CONVERSATION_ID_ATTRIBUTE]: id
  });
  if (created_at) {
    span.setAttributes({
      [OPENAI_RESPONSE_TIMESTAMP_ATTRIBUTE]: new Date(created_at * 1e3).toISOString()
    });
  }
}
function setTokenUsageAttributes(span, promptTokens, completionTokens, totalTokens) {
  if (promptTokens !== void 0) {
    span.setAttributes({
      [OPENAI_USAGE_PROMPT_TOKENS_ATTRIBUTE]: promptTokens,
      [GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE]: promptTokens
    });
  }
  if (completionTokens !== void 0) {
    span.setAttributes({
      [OPENAI_USAGE_COMPLETION_TOKENS_ATTRIBUTE]: completionTokens,
      [GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE]: completionTokens
    });
  }
  if (totalTokens !== void 0) {
    span.setAttributes({
      [GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE]: totalTokens
    });
  }
}
function setCommonResponseAttributes(span, id, model, timestamp) {
  span.setAttributes({
    [OPENAI_RESPONSE_ID_ATTRIBUTE]: id,
    [GEN_AI_RESPONSE_ID_ATTRIBUTE]: id
  });
  span.setAttributes({
    [OPENAI_RESPONSE_MODEL_ATTRIBUTE]: model,
    [GEN_AI_RESPONSE_MODEL_ATTRIBUTE]: model
  });
  span.setAttributes({
    [OPENAI_RESPONSE_TIMESTAMP_ATTRIBUTE]: new Date(timestamp * 1e3).toISOString()
  });
}
function extractConversationId(params) {
  if ("conversation" in params && typeof params.conversation === "string") {
    return params.conversation;
  }
  if ("previous_response_id" in params && typeof params.previous_response_id === "string") {
    return params.previous_response_id;
  }
  return void 0;
}
function extractRequestParameters(params) {
  const attributes = {
    [GEN_AI_REQUEST_MODEL_ATTRIBUTE]: params.model ?? "unknown"
  };
  if ("temperature" in params) attributes[GEN_AI_REQUEST_TEMPERATURE_ATTRIBUTE] = params.temperature;
  if ("top_p" in params) attributes[GEN_AI_REQUEST_TOP_P_ATTRIBUTE] = params.top_p;
  if ("frequency_penalty" in params) attributes[GEN_AI_REQUEST_FREQUENCY_PENALTY_ATTRIBUTE] = params.frequency_penalty;
  if ("presence_penalty" in params) attributes[GEN_AI_REQUEST_PRESENCE_PENALTY_ATTRIBUTE] = params.presence_penalty;
  if ("stream" in params) attributes[GEN_AI_REQUEST_STREAM_ATTRIBUTE] = params.stream;
  if ("encoding_format" in params) attributes[GEN_AI_REQUEST_ENCODING_FORMAT_ATTRIBUTE] = params.encoding_format;
  if ("dimensions" in params) attributes[GEN_AI_REQUEST_DIMENSIONS_ATTRIBUTE] = params.dimensions;
  const conversationId = extractConversationId(params);
  if (conversationId) {
    attributes[GEN_AI_CONVERSATION_ID_ATTRIBUTE] = conversationId;
  }
  return attributes;
}
function processChatCompletionToolCalls(toolCalls, state) {
  for (const toolCall of toolCalls) {
    const index = toolCall.index;
    if (index === void 0 || !toolCall.function) continue;
    if (!(index in state.chatCompletionToolCalls)) {
      state.chatCompletionToolCalls[index] = {
        ...toolCall,
        function: {
          name: toolCall.function.name,
          arguments: toolCall.function.arguments || ""
        }
      };
    } else {
      const existingToolCall = state.chatCompletionToolCalls[index];
      if (toolCall.function.arguments && existingToolCall?.function) {
        existingToolCall.function.arguments += toolCall.function.arguments;
      }
    }
  }
}
function processChatCompletionChunk(chunk, state, recordOutputs) {
  state.responseId = chunk.id ?? state.responseId;
  state.responseModel = chunk.model ?? state.responseModel;
  state.responseTimestamp = chunk.created ?? state.responseTimestamp;
  if (chunk.usage) {
    state.promptTokens = chunk.usage.prompt_tokens;
    state.completionTokens = chunk.usage.completion_tokens;
    state.totalTokens = chunk.usage.total_tokens;
  }
  for (const choice of chunk.choices ?? []) {
    if (recordOutputs) {
      if (choice.delta?.content) {
        state.responseTexts.push(choice.delta.content);
      }
      if (choice.delta?.tool_calls) {
        processChatCompletionToolCalls(choice.delta.tool_calls, state);
      }
    }
    if (choice.finish_reason) {
      state.finishReasons.push(choice.finish_reason);
    }
  }
}
function processResponsesApiEvent(streamEvent, state, recordOutputs, span) {
  if (!(streamEvent && typeof streamEvent === "object")) {
    state.eventTypes.push("unknown:non-object");
    return;
  }
  if (streamEvent instanceof Error) {
    span.setStatus({ code: SPAN_STATUS_ERROR, message: "internal_error" });
    captureException(streamEvent, {
      mechanism: {
        handled: false,
        type: "auto.ai.openai.stream-response"
      }
    });
    return;
  }
  if (!("type" in streamEvent)) return;
  const event = streamEvent;
  if (!RESPONSE_EVENT_TYPES.includes(event.type)) {
    state.eventTypes.push(event.type);
    return;
  }
  if (recordOutputs) {
    if (event.type === "response.output_item.done" && "item" in event) {
      state.responsesApiToolCalls.push(event.item);
    }
    if (event.type === "response.output_text.delta" && "delta" in event && event.delta) {
      state.responseTexts.push(event.delta);
      return;
    }
  }
  if ("response" in event) {
    const { response } = event;
    state.responseId = response.id ?? state.responseId;
    state.responseModel = response.model ?? state.responseModel;
    state.responseTimestamp = response.created_at ?? state.responseTimestamp;
    if (response.usage) {
      state.promptTokens = response.usage.input_tokens;
      state.completionTokens = response.usage.output_tokens;
      state.totalTokens = response.usage.total_tokens;
    }
    if (response.status) {
      state.finishReasons.push(response.status);
    }
    if (recordOutputs && response.output_text) {
      state.responseTexts.push(response.output_text);
    }
  }
}
async function* instrumentStream$1(stream, span, recordOutputs) {
  const state = {
    eventTypes: [],
    responseTexts: [],
    finishReasons: [],
    responseId: "",
    responseModel: "",
    responseTimestamp: 0,
    promptTokens: void 0,
    completionTokens: void 0,
    totalTokens: void 0,
    chatCompletionToolCalls: {},
    responsesApiToolCalls: []
  };
  try {
    for await (const event of stream) {
      if (isChatCompletionChunk(event)) {
        processChatCompletionChunk(event, state, recordOutputs);
      } else if (isResponsesApiStreamEvent(event)) {
        processResponsesApiEvent(event, state, recordOutputs, span);
      }
      yield event;
    }
  } finally {
    setCommonResponseAttributes(span, state.responseId, state.responseModel, state.responseTimestamp);
    setTokenUsageAttributes(span, state.promptTokens, state.completionTokens, state.totalTokens);
    span.setAttributes({
      [GEN_AI_RESPONSE_STREAMING_ATTRIBUTE]: true
    });
    if (state.finishReasons.length) {
      span.setAttributes({
        [GEN_AI_RESPONSE_FINISH_REASONS_ATTRIBUTE]: JSON.stringify(state.finishReasons)
      });
    }
    if (recordOutputs && state.responseTexts.length) {
      span.setAttributes({
        [GEN_AI_RESPONSE_TEXT_ATTRIBUTE]: state.responseTexts.join("")
      });
    }
    const chatCompletionToolCallsArray = Object.values(state.chatCompletionToolCalls);
    const allToolCalls = [...chatCompletionToolCallsArray, ...state.responsesApiToolCalls];
    if (allToolCalls.length > 0) {
      span.setAttributes({
        [GEN_AI_RESPONSE_TOOL_CALLS_ATTRIBUTE]: JSON.stringify(allToolCalls)
      });
    }
    span.end();
  }
}
function extractAvailableTools(params) {
  const tools = Array.isArray(params.tools) ? params.tools : [];
  const hasWebSearchOptions = params.web_search_options && typeof params.web_search_options === "object";
  const webSearchOptions = hasWebSearchOptions ? [{ type: "web_search_options", ...params.web_search_options }] : [];
  const availableTools = [...tools, ...webSearchOptions];
  if (availableTools.length === 0) {
    return void 0;
  }
  try {
    return JSON.stringify(availableTools);
  } catch (error2) {
    DEBUG_BUILD && debug.error("Failed to serialize OpenAI tools:", error2);
    return void 0;
  }
}
function extractRequestAttributes$2(args, methodPath) {
  const attributes = {
    [GEN_AI_SYSTEM_ATTRIBUTE]: "openai",
    [GEN_AI_OPERATION_NAME_ATTRIBUTE]: getOperationName(methodPath),
    [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.ai.openai"
  };
  if (args.length > 0 && typeof args[0] === "object" && args[0] !== null) {
    const params = args[0];
    const availableTools = extractAvailableTools(params);
    if (availableTools) {
      attributes[GEN_AI_REQUEST_AVAILABLE_TOOLS_ATTRIBUTE] = availableTools;
    }
    Object.assign(attributes, extractRequestParameters(params));
  } else {
    attributes[GEN_AI_REQUEST_MODEL_ATTRIBUTE] = "unknown";
  }
  return attributes;
}
function addResponseAttributes$2(span, result, recordOutputs) {
  if (!result || typeof result !== "object") return;
  const response = result;
  if (isChatCompletionResponse(response)) {
    addChatCompletionAttributes(span, response, recordOutputs);
    if (recordOutputs && response.choices?.length) {
      const responseTexts = response.choices.map((choice) => choice.message?.content || "");
      span.setAttributes({ [GEN_AI_RESPONSE_TEXT_ATTRIBUTE]: JSON.stringify(responseTexts) });
    }
  } else if (isResponsesApiResponse(response)) {
    addResponsesApiAttributes(span, response, recordOutputs);
    if (recordOutputs && response.output_text) {
      span.setAttributes({ [GEN_AI_RESPONSE_TEXT_ATTRIBUTE]: response.output_text });
    }
  } else if (isEmbeddingsResponse(response)) {
    addEmbeddingsAttributes(span, response);
  } else if (isConversationResponse(response)) {
    addConversationAttributes(span, response);
  }
}
function addRequestAttributes(span, params, operationName) {
  if (operationName === OPENAI_OPERATIONS.EMBEDDINGS && "input" in params) {
    const input = params.input;
    if (input == null) {
      return;
    }
    if (typeof input === "string" && input.length === 0) {
      return;
    }
    if (Array.isArray(input) && input.length === 0) {
      return;
    }
    span.setAttribute(GEN_AI_EMBEDDINGS_INPUT_ATTRIBUTE, typeof input === "string" ? input : JSON.stringify(input));
    return;
  }
  const src2 = "input" in params ? params.input : "messages" in params ? params.messages : void 0;
  if (!src2) {
    return;
  }
  if (Array.isArray(src2) && src2.length === 0) {
    return;
  }
  const { systemInstructions, filteredMessages } = extractSystemInstructions(src2);
  if (systemInstructions) {
    span.setAttribute(GEN_AI_SYSTEM_INSTRUCTIONS_ATTRIBUTE, systemInstructions);
  }
  const truncatedInput = getTruncatedJsonString(filteredMessages);
  span.setAttribute(GEN_AI_INPUT_MESSAGES_ATTRIBUTE, truncatedInput);
  if (Array.isArray(filteredMessages)) {
    span.setAttribute(GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE, filteredMessages.length);
  } else {
    span.setAttribute(GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE, 1);
  }
}
async function createWithResponseWrapper(originalWithResponse, instrumentedPromise) {
  const safeOriginalWithResponse = originalWithResponse.catch((error2) => {
    captureException(error2, {
      mechanism: {
        handled: false,
        type: "auto.ai.openai"
      }
    });
    throw error2;
  });
  const instrumentedResult = await instrumentedPromise;
  const originalWrapper = await safeOriginalWithResponse;
  if (originalWrapper && typeof originalWrapper === "object" && "data" in originalWrapper) {
    return {
      ...originalWrapper,
      data: instrumentedResult
    };
  }
  return instrumentedResult;
}
function wrapPromiseWithMethods(originalPromiseLike, instrumentedPromise) {
  if (!isThenable(originalPromiseLike)) {
    return instrumentedPromise;
  }
  return new Proxy(originalPromiseLike, {
    get(target, prop) {
      const useInstrumentedPromise = prop in Promise.prototype || prop === Symbol.toStringTag;
      const source = useInstrumentedPromise ? instrumentedPromise : target;
      const value = Reflect.get(source, prop);
      if (prop === "withResponse" && typeof value === "function") {
        return function wrappedWithResponse() {
          const originalWithResponse = value.call(target);
          return createWithResponseWrapper(originalWithResponse, instrumentedPromise);
        };
      }
      return typeof value === "function" ? value.bind(source) : value;
    }
  });
}
function instrumentMethod$2(originalMethod, methodPath, context2, options) {
  return function instrumentedMethod(...args) {
    const requestAttributes = extractRequestAttributes$2(args, methodPath);
    const model = requestAttributes[GEN_AI_REQUEST_MODEL_ATTRIBUTE] || "unknown";
    const operationName = getOperationName(methodPath);
    const params = args[0];
    const isStreamRequested = params && typeof params === "object" && params.stream === true;
    const spanConfig = {
      name: `${operationName} ${model}`,
      op: getSpanOperation(methodPath),
      attributes: requestAttributes
    };
    if (isStreamRequested) {
      let originalResult2;
      const instrumentedPromise2 = startSpanManual(spanConfig, (span) => {
        originalResult2 = originalMethod.apply(context2, args);
        if (options.recordInputs && params) {
          addRequestAttributes(span, params, operationName);
        }
        return (async () => {
          try {
            const result = await originalResult2;
            return instrumentStream$1(
              result,
              span,
              options.recordOutputs ?? false
            );
          } catch (error2) {
            span.setStatus({ code: SPAN_STATUS_ERROR, message: "internal_error" });
            captureException(error2, {
              mechanism: {
                handled: false,
                type: "auto.ai.openai.stream",
                data: { function: methodPath }
              }
            });
            span.end();
            throw error2;
          }
        })();
      });
      return wrapPromiseWithMethods(originalResult2, instrumentedPromise2);
    }
    let originalResult;
    const instrumentedPromise = startSpan$1(spanConfig, (span) => {
      originalResult = originalMethod.apply(context2, args);
      if (options.recordInputs && params) {
        addRequestAttributes(span, params, operationName);
      }
      return originalResult.then(
        (result) => {
          addResponseAttributes$2(span, result, options.recordOutputs);
          return result;
        },
        (error2) => {
          captureException(error2, {
            mechanism: {
              handled: false,
              type: "auto.ai.openai",
              data: { function: methodPath }
            }
          });
          throw error2;
        }
      );
    });
    return wrapPromiseWithMethods(originalResult, instrumentedPromise);
  };
}
function createDeepProxy$2(target, currentPath = "", options) {
  return new Proxy(target, {
    get(obj, prop) {
      const value = obj[prop];
      const methodPath = buildMethodPath(currentPath, String(prop));
      if (typeof value === "function" && shouldInstrument$2(methodPath)) {
        return instrumentMethod$2(value, methodPath, obj, options);
      }
      if (typeof value === "function") {
        return value.bind(obj);
      }
      if (value && typeof value === "object") {
        return createDeepProxy$2(value, methodPath, options);
      }
      return value;
    }
  });
}
function instrumentOpenAiClient(client, options) {
  const sendDefaultPii = Boolean(getClient()?.getOptions().sendDefaultPii);
  const _options = {
    recordInputs: sendDefaultPii,
    recordOutputs: sendDefaultPii,
    ...options
  };
  return createDeepProxy$2(client, "", _options);
}
function isErrorEvent$1(event, span) {
  if ("type" in event && typeof event.type === "string") {
    if (event.type === "error") {
      span.setStatus({ code: SPAN_STATUS_ERROR, message: event.error?.type ?? "internal_error" });
      captureException(event.error, {
        mechanism: {
          handled: false,
          type: "auto.ai.anthropic.anthropic_error"
        }
      });
      return true;
    }
  }
  return false;
}
function handleMessageMetadata(event, state) {
  if (event.type === "message_delta" && event.usage) {
    if ("output_tokens" in event.usage && typeof event.usage.output_tokens === "number") {
      state.completionTokens = event.usage.output_tokens;
    }
  }
  if (event.message) {
    const message = event.message;
    if (message.id) state.responseId = message.id;
    if (message.model) state.responseModel = message.model;
    if (message.stop_reason) state.finishReasons.push(message.stop_reason);
    if (message.usage) {
      if (typeof message.usage.input_tokens === "number") state.promptTokens = message.usage.input_tokens;
      if (typeof message.usage.cache_creation_input_tokens === "number")
        state.cacheCreationInputTokens = message.usage.cache_creation_input_tokens;
      if (typeof message.usage.cache_read_input_tokens === "number")
        state.cacheReadInputTokens = message.usage.cache_read_input_tokens;
    }
  }
}
function handleContentBlockStart(event, state) {
  if (event.type !== "content_block_start" || typeof event.index !== "number" || !event.content_block) return;
  if (event.content_block.type === "tool_use" || event.content_block.type === "server_tool_use") {
    state.activeToolBlocks[event.index] = {
      id: event.content_block.id,
      name: event.content_block.name,
      inputJsonParts: []
    };
  }
}
function handleContentBlockDelta(event, state, recordOutputs) {
  if (event.type !== "content_block_delta" || !event.delta) return;
  if (typeof event.index === "number" && "partial_json" in event.delta && typeof event.delta.partial_json === "string") {
    const active = state.activeToolBlocks[event.index];
    if (active) {
      active.inputJsonParts.push(event.delta.partial_json);
    }
  }
  if (recordOutputs && typeof event.delta.text === "string") {
    state.responseTexts.push(event.delta.text);
  }
}
function handleContentBlockStop(event, state) {
  if (event.type !== "content_block_stop" || typeof event.index !== "number") return;
  const active = state.activeToolBlocks[event.index];
  if (!active) return;
  const raw = active.inputJsonParts.join("");
  let parsedInput;
  try {
    parsedInput = raw ? JSON.parse(raw) : {};
  } catch {
    parsedInput = { __unparsed: raw };
  }
  state.toolCalls.push({
    type: "tool_use",
    id: active.id,
    name: active.name,
    input: parsedInput
  });
  delete state.activeToolBlocks[event.index];
}
function processEvent(event, state, recordOutputs, span) {
  if (!(event && typeof event === "object")) {
    return;
  }
  const isError2 = isErrorEvent$1(event, span);
  if (isError2) return;
  handleMessageMetadata(event, state);
  handleContentBlockStart(event, state);
  handleContentBlockDelta(event, state, recordOutputs);
  handleContentBlockStop(event, state);
}
function finalizeStreamSpan(state, span, recordOutputs) {
  if (!span.isRecording()) {
    return;
  }
  if (state.responseId) {
    span.setAttributes({
      [GEN_AI_RESPONSE_ID_ATTRIBUTE]: state.responseId
    });
  }
  if (state.responseModel) {
    span.setAttributes({
      [GEN_AI_RESPONSE_MODEL_ATTRIBUTE]: state.responseModel
    });
  }
  setTokenUsageAttributes$1(
    span,
    state.promptTokens,
    state.completionTokens,
    state.cacheCreationInputTokens,
    state.cacheReadInputTokens
  );
  span.setAttributes({
    [GEN_AI_RESPONSE_STREAMING_ATTRIBUTE]: true
  });
  if (state.finishReasons.length > 0) {
    span.setAttributes({
      [GEN_AI_RESPONSE_FINISH_REASONS_ATTRIBUTE]: JSON.stringify(state.finishReasons)
    });
  }
  if (recordOutputs && state.responseTexts.length > 0) {
    span.setAttributes({
      [GEN_AI_RESPONSE_TEXT_ATTRIBUTE]: state.responseTexts.join("")
    });
  }
  if (recordOutputs && state.toolCalls.length > 0) {
    span.setAttributes({
      [GEN_AI_RESPONSE_TOOL_CALLS_ATTRIBUTE]: JSON.stringify(state.toolCalls)
    });
  }
  span.end();
}
async function* instrumentAsyncIterableStream(stream, span, recordOutputs) {
  const state = {
    responseTexts: [],
    finishReasons: [],
    responseId: "",
    responseModel: "",
    promptTokens: void 0,
    completionTokens: void 0,
    cacheCreationInputTokens: void 0,
    cacheReadInputTokens: void 0,
    toolCalls: [],
    activeToolBlocks: {}
  };
  try {
    for await (const event of stream) {
      processEvent(event, state, recordOutputs, span);
      yield event;
    }
  } finally {
    if (state.responseId) {
      span.setAttributes({
        [GEN_AI_RESPONSE_ID_ATTRIBUTE]: state.responseId
      });
    }
    if (state.responseModel) {
      span.setAttributes({
        [GEN_AI_RESPONSE_MODEL_ATTRIBUTE]: state.responseModel
      });
    }
    setTokenUsageAttributes$1(
      span,
      state.promptTokens,
      state.completionTokens,
      state.cacheCreationInputTokens,
      state.cacheReadInputTokens
    );
    span.setAttributes({
      [GEN_AI_RESPONSE_STREAMING_ATTRIBUTE]: true
    });
    if (state.finishReasons.length > 0) {
      span.setAttributes({
        [GEN_AI_RESPONSE_FINISH_REASONS_ATTRIBUTE]: JSON.stringify(state.finishReasons)
      });
    }
    if (recordOutputs && state.responseTexts.length > 0) {
      span.setAttributes({
        [GEN_AI_RESPONSE_TEXT_ATTRIBUTE]: state.responseTexts.join("")
      });
    }
    if (recordOutputs && state.toolCalls.length > 0) {
      span.setAttributes({
        [GEN_AI_RESPONSE_TOOL_CALLS_ATTRIBUTE]: JSON.stringify(state.toolCalls)
      });
    }
    span.end();
  }
}
function instrumentMessageStream(stream, span, recordOutputs) {
  const state = {
    responseTexts: [],
    finishReasons: [],
    responseId: "",
    responseModel: "",
    promptTokens: void 0,
    completionTokens: void 0,
    cacheCreationInputTokens: void 0,
    cacheReadInputTokens: void 0,
    toolCalls: [],
    activeToolBlocks: {}
  };
  stream.on("streamEvent", (event) => {
    processEvent(event, state, recordOutputs, span);
  });
  stream.on("message", () => {
    finalizeStreamSpan(state, span, recordOutputs);
  });
  stream.on("error", (error2) => {
    captureException(error2, {
      mechanism: {
        handled: false,
        type: "auto.ai.anthropic.stream_error"
      }
    });
    if (span.isRecording()) {
      span.setStatus({ code: SPAN_STATUS_ERROR, message: "stream_error" });
      span.end();
    }
  });
  return stream;
}
const ANTHROPIC_AI_INTEGRATION_NAME = "Anthropic_AI";
const ANTHROPIC_AI_INSTRUMENTED_METHODS = [
  "messages.create",
  "messages.stream",
  "messages.countTokens",
  "models.get",
  "completions.create",
  "models.retrieve",
  "beta.messages.create"
];
function shouldInstrument$1(methodPath) {
  return ANTHROPIC_AI_INSTRUMENTED_METHODS.includes(methodPath);
}
function setMessagesAttribute(span, messages) {
  if (Array.isArray(messages) && messages.length === 0) {
    return;
  }
  const { systemInstructions, filteredMessages } = extractSystemInstructions(messages);
  if (systemInstructions) {
    span.setAttributes({
      [GEN_AI_SYSTEM_INSTRUCTIONS_ATTRIBUTE]: systemInstructions
    });
  }
  const filteredLength = Array.isArray(filteredMessages) ? filteredMessages.length : 1;
  span.setAttributes({
    [GEN_AI_INPUT_MESSAGES_ATTRIBUTE]: getTruncatedJsonString(filteredMessages),
    [GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE]: filteredLength
  });
}
function handleResponseError(span, response) {
  if (response.error) {
    span.setStatus({ code: SPAN_STATUS_ERROR, message: response.error.type || "internal_error" });
    captureException(response.error, {
      mechanism: {
        handled: false,
        type: "auto.ai.anthropic.anthropic_error"
      }
    });
  }
}
function messagesFromParams(params) {
  const { system, messages, input } = params;
  const systemMessages = typeof system === "string" ? [{ role: "system", content: params.system }] : [];
  const inputParamMessages = Array.isArray(input) ? input : input != null ? [input] : void 0;
  const messagesParamMessages = Array.isArray(messages) ? messages : messages != null ? [messages] : [];
  const userMessages = inputParamMessages ?? messagesParamMessages;
  return [...systemMessages, ...userMessages];
}
function extractRequestAttributes$1(args, methodPath) {
  const attributes = {
    [GEN_AI_SYSTEM_ATTRIBUTE]: "anthropic",
    [GEN_AI_OPERATION_NAME_ATTRIBUTE]: getFinalOperationName(methodPath),
    [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.ai.anthropic"
  };
  if (args.length > 0 && typeof args[0] === "object" && args[0] !== null) {
    const params = args[0];
    if (params.tools && Array.isArray(params.tools)) {
      attributes[GEN_AI_REQUEST_AVAILABLE_TOOLS_ATTRIBUTE] = JSON.stringify(params.tools);
    }
    attributes[GEN_AI_REQUEST_MODEL_ATTRIBUTE] = params.model ?? "unknown";
    if ("temperature" in params) attributes[GEN_AI_REQUEST_TEMPERATURE_ATTRIBUTE] = params.temperature;
    if ("top_p" in params) attributes[GEN_AI_REQUEST_TOP_P_ATTRIBUTE] = params.top_p;
    if ("stream" in params) attributes[GEN_AI_REQUEST_STREAM_ATTRIBUTE] = params.stream;
    if ("top_k" in params) attributes[GEN_AI_REQUEST_TOP_K_ATTRIBUTE] = params.top_k;
    if ("frequency_penalty" in params)
      attributes[GEN_AI_REQUEST_FREQUENCY_PENALTY_ATTRIBUTE] = params.frequency_penalty;
    if ("max_tokens" in params) attributes[GEN_AI_REQUEST_MAX_TOKENS_ATTRIBUTE] = params.max_tokens;
  } else {
    if (methodPath === "models.retrieve" || methodPath === "models.get") {
      attributes[GEN_AI_REQUEST_MODEL_ATTRIBUTE] = args[0];
    } else {
      attributes[GEN_AI_REQUEST_MODEL_ATTRIBUTE] = "unknown";
    }
  }
  return attributes;
}
function addPrivateRequestAttributes$1(span, params) {
  const messages = messagesFromParams(params);
  setMessagesAttribute(span, messages);
  if ("prompt" in params) {
    span.setAttributes({ [GEN_AI_PROMPT_ATTRIBUTE]: JSON.stringify(params.prompt) });
  }
}
function addContentAttributes(span, response) {
  if ("content" in response) {
    if (Array.isArray(response.content)) {
      span.setAttributes({
        [GEN_AI_RESPONSE_TEXT_ATTRIBUTE]: response.content.map((item) => item.text).filter((text) => !!text).join("")
      });
      const toolCalls = [];
      for (const item of response.content) {
        if (item.type === "tool_use" || item.type === "server_tool_use") {
          toolCalls.push(item);
        }
      }
      if (toolCalls.length > 0) {
        span.setAttributes({ [GEN_AI_RESPONSE_TOOL_CALLS_ATTRIBUTE]: JSON.stringify(toolCalls) });
      }
    }
  }
  if ("completion" in response) {
    span.setAttributes({ [GEN_AI_RESPONSE_TEXT_ATTRIBUTE]: response.completion });
  }
  if ("input_tokens" in response) {
    span.setAttributes({ [GEN_AI_RESPONSE_TEXT_ATTRIBUTE]: JSON.stringify(response.input_tokens) });
  }
}
function addMetadataAttributes(span, response) {
  if ("id" in response && "model" in response) {
    span.setAttributes({
      [GEN_AI_RESPONSE_ID_ATTRIBUTE]: response.id,
      [GEN_AI_RESPONSE_MODEL_ATTRIBUTE]: response.model
    });
    if ("created" in response && typeof response.created === "number") {
      span.setAttributes({
        [ANTHROPIC_AI_RESPONSE_TIMESTAMP_ATTRIBUTE]: new Date(response.created * 1e3).toISOString()
      });
    }
    if ("created_at" in response && typeof response.created_at === "number") {
      span.setAttributes({
        [ANTHROPIC_AI_RESPONSE_TIMESTAMP_ATTRIBUTE]: new Date(response.created_at * 1e3).toISOString()
      });
    }
    if ("usage" in response && response.usage) {
      setTokenUsageAttributes$1(
        span,
        response.usage.input_tokens,
        response.usage.output_tokens,
        response.usage.cache_creation_input_tokens,
        response.usage.cache_read_input_tokens
      );
    }
  }
}
function addResponseAttributes$1(span, response, recordOutputs) {
  if (!response || typeof response !== "object") return;
  if ("type" in response && response.type === "error") {
    handleResponseError(span, response);
    return;
  }
  if (recordOutputs) {
    addContentAttributes(span, response);
  }
  addMetadataAttributes(span, response);
}
function handleStreamingError(error2, span, methodPath) {
  captureException(error2, {
    mechanism: { handled: false, type: "auto.ai.anthropic", data: { function: methodPath } }
  });
  if (span.isRecording()) {
    span.setStatus({ code: SPAN_STATUS_ERROR, message: "internal_error" });
    span.end();
  }
  throw error2;
}
function handleStreamingRequest(originalMethod, target, context2, args, requestAttributes, operationName, methodPath, params, options, isStreamRequested, isStreamingMethod2) {
  const model = requestAttributes[GEN_AI_REQUEST_MODEL_ATTRIBUTE] ?? "unknown";
  const spanConfig = {
    name: `${operationName} ${model}`,
    op: getSpanOperation$1(methodPath),
    attributes: requestAttributes
  };
  if (isStreamRequested && !isStreamingMethod2) {
    return startSpanManual(spanConfig, async (span) => {
      try {
        if (options.recordInputs && params) {
          addPrivateRequestAttributes$1(span, params);
        }
        const result = await originalMethod.apply(context2, args);
        return instrumentAsyncIterableStream(
          result,
          span,
          options.recordOutputs ?? false
        );
      } catch (error2) {
        return handleStreamingError(error2, span, methodPath);
      }
    });
  } else {
    return startSpanManual(spanConfig, (span) => {
      try {
        if (options.recordInputs && params) {
          addPrivateRequestAttributes$1(span, params);
        }
        const messageStream = target.apply(context2, args);
        return instrumentMessageStream(messageStream, span, options.recordOutputs ?? false);
      } catch (error2) {
        return handleStreamingError(error2, span, methodPath);
      }
    });
  }
}
function instrumentMethod$1(originalMethod, methodPath, context2, options) {
  return new Proxy(originalMethod, {
    apply(target, thisArg, args) {
      const requestAttributes = extractRequestAttributes$1(args, methodPath);
      const model = requestAttributes[GEN_AI_REQUEST_MODEL_ATTRIBUTE] ?? "unknown";
      const operationName = getFinalOperationName(methodPath);
      const params = typeof args[0] === "object" ? args[0] : void 0;
      const isStreamRequested = Boolean(params?.stream);
      const isStreamingMethod2 = methodPath === "messages.stream";
      if (isStreamRequested || isStreamingMethod2) {
        return handleStreamingRequest(
          originalMethod,
          target,
          context2,
          args,
          requestAttributes,
          operationName,
          methodPath,
          params,
          options,
          isStreamRequested,
          isStreamingMethod2
        );
      }
      return startSpan$1(
        {
          name: `${operationName} ${model}`,
          op: getSpanOperation$1(methodPath),
          attributes: requestAttributes
        },
        (span) => {
          if (options.recordInputs && params) {
            addPrivateRequestAttributes$1(span, params);
          }
          return handleCallbackErrors(
            () => target.apply(context2, args),
            (error2) => {
              captureException(error2, {
                mechanism: {
                  handled: false,
                  type: "auto.ai.anthropic",
                  data: {
                    function: methodPath
                  }
                }
              });
            },
            () => {
            },
            (result) => addResponseAttributes$1(span, result, options.recordOutputs)
          );
        }
      );
    }
  });
}
function createDeepProxy$1(target, currentPath = "", options) {
  return new Proxy(target, {
    get(obj, prop) {
      const value = obj[prop];
      const methodPath = buildMethodPath$1(currentPath, String(prop));
      if (typeof value === "function" && shouldInstrument$1(methodPath)) {
        return instrumentMethod$1(value, methodPath, obj, options);
      }
      if (typeof value === "function") {
        return value.bind(obj);
      }
      if (value && typeof value === "object") {
        return createDeepProxy$1(value, methodPath, options);
      }
      return value;
    }
  });
}
function instrumentAnthropicAiClient(anthropicAiClient, options) {
  const sendDefaultPii = Boolean(getClient()?.getOptions().sendDefaultPii);
  const _options = {
    recordInputs: sendDefaultPii,
    recordOutputs: sendDefaultPii,
    ...options
  };
  return createDeepProxy$1(anthropicAiClient, "", _options);
}
const GOOGLE_GENAI_INTEGRATION_NAME = "Google_GenAI";
const GOOGLE_GENAI_INSTRUMENTED_METHODS = [
  "models.generateContent",
  "models.generateContentStream",
  "chats.create",
  "sendMessage",
  "sendMessageStream"
];
const GOOGLE_GENAI_SYSTEM_NAME = "google_genai";
const CHATS_CREATE_METHOD = "chats.create";
const CHAT_PATH = "chat";
function isErrorChunk(chunk, span) {
  const feedback = chunk?.promptFeedback;
  if (feedback?.blockReason) {
    const message = feedback.blockReasonMessage ?? feedback.blockReason;
    span.setStatus({ code: SPAN_STATUS_ERROR, message: `Content blocked: ${message}` });
    captureException(`Content blocked: ${message}`, {
      mechanism: { handled: false, type: "auto.ai.google_genai" }
    });
    return true;
  }
  return false;
}
function handleResponseMetadata(chunk, state) {
  if (typeof chunk.responseId === "string") state.responseId = chunk.responseId;
  if (typeof chunk.modelVersion === "string") state.responseModel = chunk.modelVersion;
  const usage = chunk.usageMetadata;
  if (usage) {
    if (typeof usage.promptTokenCount === "number") state.promptTokens = usage.promptTokenCount;
    if (typeof usage.candidatesTokenCount === "number") state.completionTokens = usage.candidatesTokenCount;
    if (typeof usage.totalTokenCount === "number") state.totalTokens = usage.totalTokenCount;
  }
}
function handleCandidateContent(chunk, state, recordOutputs) {
  if (Array.isArray(chunk.functionCalls)) {
    state.toolCalls.push(...chunk.functionCalls);
  }
  for (const candidate of chunk.candidates ?? []) {
    if (candidate?.finishReason && !state.finishReasons.includes(candidate.finishReason)) {
      state.finishReasons.push(candidate.finishReason);
    }
    for (const part of candidate?.content?.parts ?? []) {
      if (recordOutputs && part.text) state.responseTexts.push(part.text);
      if (part.functionCall) {
        state.toolCalls.push({
          type: "function",
          id: part.functionCall.id,
          name: part.functionCall.name,
          arguments: part.functionCall.args
        });
      }
    }
  }
}
function processChunk(chunk, state, recordOutputs, span) {
  if (!chunk || isErrorChunk(chunk, span)) return;
  handleResponseMetadata(chunk, state);
  handleCandidateContent(chunk, state, recordOutputs);
}
async function* instrumentStream(stream, span, recordOutputs) {
  const state = {
    responseTexts: [],
    finishReasons: [],
    toolCalls: []
  };
  try {
    for await (const chunk of stream) {
      processChunk(chunk, state, recordOutputs, span);
      yield chunk;
    }
  } finally {
    const attrs = {
      [GEN_AI_RESPONSE_STREAMING_ATTRIBUTE]: true
    };
    if (state.responseId) attrs[GEN_AI_RESPONSE_ID_ATTRIBUTE] = state.responseId;
    if (state.responseModel) attrs[GEN_AI_RESPONSE_MODEL_ATTRIBUTE] = state.responseModel;
    if (state.promptTokens !== void 0) attrs[GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE] = state.promptTokens;
    if (state.completionTokens !== void 0) attrs[GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE] = state.completionTokens;
    if (state.totalTokens !== void 0) attrs[GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE] = state.totalTokens;
    if (state.finishReasons.length) {
      attrs[GEN_AI_RESPONSE_FINISH_REASONS_ATTRIBUTE] = JSON.stringify(state.finishReasons);
    }
    if (recordOutputs && state.responseTexts.length) {
      attrs[GEN_AI_RESPONSE_TEXT_ATTRIBUTE] = state.responseTexts.join("");
    }
    if (recordOutputs && state.toolCalls.length) {
      attrs[GEN_AI_RESPONSE_TOOL_CALLS_ATTRIBUTE] = JSON.stringify(state.toolCalls);
    }
    span.setAttributes(attrs);
    span.end();
  }
}
function shouldInstrument(methodPath) {
  if (GOOGLE_GENAI_INSTRUMENTED_METHODS.includes(methodPath)) {
    return true;
  }
  const methodName = methodPath.split(".").pop();
  return GOOGLE_GENAI_INSTRUMENTED_METHODS.includes(methodName);
}
function isStreamingMethod(methodPath) {
  return methodPath.includes("Stream");
}
function contentUnionToMessages(content, role = "user") {
  if (typeof content === "string") {
    return [{ role, content }];
  }
  if (Array.isArray(content)) {
    return content.flatMap((content2) => contentUnionToMessages(content2, role));
  }
  if (typeof content !== "object" || !content) return [];
  if ("role" in content && typeof content.role === "string") {
    return [content];
  }
  if ("parts" in content) {
    return [{ ...content, role }];
  }
  return [{ role, content }];
}
function extractModel(params, context2) {
  if ("model" in params && typeof params.model === "string") {
    return params.model;
  }
  if (context2 && typeof context2 === "object") {
    const contextObj = context2;
    if ("model" in contextObj && typeof contextObj.model === "string") {
      return contextObj.model;
    }
    if ("modelVersion" in contextObj && typeof contextObj.modelVersion === "string") {
      return contextObj.modelVersion;
    }
  }
  return "unknown";
}
function extractConfigAttributes(config2) {
  const attributes = {};
  if ("temperature" in config2 && typeof config2.temperature === "number") {
    attributes[GEN_AI_REQUEST_TEMPERATURE_ATTRIBUTE] = config2.temperature;
  }
  if ("topP" in config2 && typeof config2.topP === "number") {
    attributes[GEN_AI_REQUEST_TOP_P_ATTRIBUTE] = config2.topP;
  }
  if ("topK" in config2 && typeof config2.topK === "number") {
    attributes[GEN_AI_REQUEST_TOP_K_ATTRIBUTE] = config2.topK;
  }
  if ("maxOutputTokens" in config2 && typeof config2.maxOutputTokens === "number") {
    attributes[GEN_AI_REQUEST_MAX_TOKENS_ATTRIBUTE] = config2.maxOutputTokens;
  }
  if ("frequencyPenalty" in config2 && typeof config2.frequencyPenalty === "number") {
    attributes[GEN_AI_REQUEST_FREQUENCY_PENALTY_ATTRIBUTE] = config2.frequencyPenalty;
  }
  if ("presencePenalty" in config2 && typeof config2.presencePenalty === "number") {
    attributes[GEN_AI_REQUEST_PRESENCE_PENALTY_ATTRIBUTE] = config2.presencePenalty;
  }
  return attributes;
}
function extractRequestAttributes(methodPath, params, context2) {
  const attributes = {
    [GEN_AI_SYSTEM_ATTRIBUTE]: GOOGLE_GENAI_SYSTEM_NAME,
    [GEN_AI_OPERATION_NAME_ATTRIBUTE]: getFinalOperationName(methodPath),
    [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.ai.google_genai"
  };
  if (params) {
    attributes[GEN_AI_REQUEST_MODEL_ATTRIBUTE] = extractModel(params, context2);
    if ("config" in params && typeof params.config === "object" && params.config) {
      const config2 = params.config;
      Object.assign(attributes, extractConfigAttributes(config2));
      if ("tools" in config2 && Array.isArray(config2.tools)) {
        const functionDeclarations = config2.tools.flatMap(
          (tool) => tool.functionDeclarations
        );
        attributes[GEN_AI_REQUEST_AVAILABLE_TOOLS_ATTRIBUTE] = JSON.stringify(functionDeclarations);
      }
    }
  } else {
    attributes[GEN_AI_REQUEST_MODEL_ATTRIBUTE] = extractModel({}, context2);
  }
  return attributes;
}
function addPrivateRequestAttributes(span, params) {
  const messages = [];
  if ("config" in params && params.config && typeof params.config === "object" && "systemInstruction" in params.config && params.config.systemInstruction) {
    messages.push(...contentUnionToMessages(params.config.systemInstruction, "system"));
  }
  if ("history" in params) {
    messages.push(...contentUnionToMessages(params.history, "user"));
  }
  if ("contents" in params) {
    messages.push(...contentUnionToMessages(params.contents, "user"));
  }
  if ("message" in params) {
    messages.push(...contentUnionToMessages(params.message, "user"));
  }
  if (Array.isArray(messages) && messages.length) {
    const { systemInstructions, filteredMessages } = extractSystemInstructions(messages);
    if (systemInstructions) {
      span.setAttribute(GEN_AI_SYSTEM_INSTRUCTIONS_ATTRIBUTE, systemInstructions);
    }
    const filteredLength = Array.isArray(filteredMessages) ? filteredMessages.length : 0;
    span.setAttributes({
      [GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE]: filteredLength,
      [GEN_AI_INPUT_MESSAGES_ATTRIBUTE]: JSON.stringify(truncateGenAiMessages(filteredMessages))
    });
  }
}
function addResponseAttributes(span, response, recordOutputs) {
  if (!response || typeof response !== "object") return;
  if (response.modelVersion) {
    span.setAttribute(GEN_AI_RESPONSE_MODEL_ATTRIBUTE, response.modelVersion);
  }
  if (response.usageMetadata && typeof response.usageMetadata === "object") {
    const usage = response.usageMetadata;
    if (typeof usage.promptTokenCount === "number") {
      span.setAttributes({
        [GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE]: usage.promptTokenCount
      });
    }
    if (typeof usage.candidatesTokenCount === "number") {
      span.setAttributes({
        [GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE]: usage.candidatesTokenCount
      });
    }
    if (typeof usage.totalTokenCount === "number") {
      span.setAttributes({
        [GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE]: usage.totalTokenCount
      });
    }
  }
  if (recordOutputs && Array.isArray(response.candidates) && response.candidates.length > 0) {
    const responseTexts = response.candidates.map((candidate) => {
      if (candidate.content?.parts && Array.isArray(candidate.content.parts)) {
        return candidate.content.parts.map((part) => typeof part.text === "string" ? part.text : "").filter((text) => text.length > 0).join("");
      }
      return "";
    }).filter((text) => text.length > 0);
    if (responseTexts.length > 0) {
      span.setAttributes({
        [GEN_AI_RESPONSE_TEXT_ATTRIBUTE]: responseTexts.join("")
      });
    }
  }
  if (recordOutputs && response.functionCalls) {
    const functionCalls = response.functionCalls;
    if (Array.isArray(functionCalls) && functionCalls.length > 0) {
      span.setAttributes({
        [GEN_AI_RESPONSE_TOOL_CALLS_ATTRIBUTE]: JSON.stringify(functionCalls)
      });
    }
  }
}
function instrumentMethod(originalMethod, methodPath, context2, options) {
  const isSyncCreate = methodPath === CHATS_CREATE_METHOD;
  return new Proxy(originalMethod, {
    apply(target, _, args) {
      const params = args[0];
      const requestAttributes = extractRequestAttributes(methodPath, params, context2);
      const model = requestAttributes[GEN_AI_REQUEST_MODEL_ATTRIBUTE] ?? "unknown";
      const operationName = getFinalOperationName(methodPath);
      if (isStreamingMethod(methodPath)) {
        return startSpanManual(
          {
            name: `${operationName} ${model}`,
            op: getSpanOperation$1(methodPath),
            attributes: requestAttributes
          },
          async (span) => {
            try {
              if (options.recordInputs && params) {
                addPrivateRequestAttributes(span, params);
              }
              const stream = await target.apply(context2, args);
              return instrumentStream(stream, span, Boolean(options.recordOutputs));
            } catch (error2) {
              span.setStatus({ code: SPAN_STATUS_ERROR, message: "internal_error" });
              captureException(error2, {
                mechanism: {
                  handled: false,
                  type: "auto.ai.google_genai",
                  data: { function: methodPath }
                }
              });
              span.end();
              throw error2;
            }
          }
        );
      }
      return startSpan$1(
        {
          name: isSyncCreate ? `${operationName} ${model} create` : `${operationName} ${model}`,
          op: getSpanOperation$1(methodPath),
          attributes: requestAttributes
        },
        (span) => {
          if (options.recordInputs && params) {
            addPrivateRequestAttributes(span, params);
          }
          return handleCallbackErrors(
            () => target.apply(context2, args),
            (error2) => {
              captureException(error2, {
                mechanism: { handled: false, type: "auto.ai.google_genai", data: { function: methodPath } }
              });
            },
            () => {
            },
            (result) => {
              if (!isSyncCreate) {
                addResponseAttributes(span, result, options.recordOutputs);
              }
            }
          );
        }
      );
    }
  });
}
function createDeepProxy(target, currentPath = "", options) {
  return new Proxy(target, {
    get: (t, prop, receiver) => {
      const value = Reflect.get(t, prop, receiver);
      const methodPath = buildMethodPath$1(currentPath, String(prop));
      if (typeof value === "function" && shouldInstrument(methodPath)) {
        if (methodPath === CHATS_CREATE_METHOD) {
          const instrumentedMethod = instrumentMethod(value, methodPath, t, options);
          return function instrumentedAndProxiedCreate(...args) {
            const result = instrumentedMethod(...args);
            if (result && typeof result === "object") {
              return createDeepProxy(result, CHAT_PATH, options);
            }
            return result;
          };
        }
        return instrumentMethod(value, methodPath, t, options);
      }
      if (typeof value === "function") {
        return value.bind(t);
      }
      if (value && typeof value === "object") {
        return createDeepProxy(value, methodPath, options);
      }
      return value;
    }
  });
}
function instrumentGoogleGenAIClient(client, options) {
  const sendDefaultPii = Boolean(getClient()?.getOptions().sendDefaultPii);
  const _options = {
    recordInputs: sendDefaultPii,
    recordOutputs: sendDefaultPii,
    ...options
  };
  return createDeepProxy(client, "", _options);
}
const LANGCHAIN_INTEGRATION_NAME = "LangChain";
const LANGCHAIN_ORIGIN = "auto.ai.langchain";
const ROLE_MAP = {
  human: "user",
  ai: "assistant",
  assistant: "assistant",
  system: "system",
  function: "function",
  tool: "tool"
};
const setIfDefined = (target, key, value) => {
  if (value != null) target[key] = value;
};
const setNumberIfDefined = (target, key, value) => {
  const n = Number(value);
  if (!Number.isNaN(n)) target[key] = n;
};
function asString(v) {
  if (typeof v === "string") return v;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}
function normalizeContent(v) {
  if (Array.isArray(v)) {
    try {
      const stripped = v.map(
        (part) => part && typeof part === "object" && isContentMedia(part) ? stripInlineMediaFromSingleMessage(part) : part
      );
      return JSON.stringify(stripped);
    } catch {
      return String(v);
    }
  }
  return asString(v);
}
function normalizeMessageRole(role) {
  const normalized = role.toLowerCase();
  return ROLE_MAP[normalized] ?? normalized;
}
function normalizeRoleNameFromCtor(name2) {
  if (name2.includes("System")) return "system";
  if (name2.includes("Human")) return "user";
  if (name2.includes("AI") || name2.includes("Assistant")) return "assistant";
  if (name2.includes("Function")) return "function";
  if (name2.includes("Tool")) return "tool";
  return "user";
}
function getInvocationParams(tags) {
  if (!tags || Array.isArray(tags)) return void 0;
  return tags.invocation_params;
}
function normalizeLangChainMessages(messages) {
  return messages.map((message) => {
    const maybeGetType = message._getType;
    if (typeof maybeGetType === "function") {
      const messageType = maybeGetType.call(message);
      return {
        role: normalizeMessageRole(messageType),
        content: normalizeContent(message.content)
      };
    }
    if (message.lc === 1 && message.kwargs) {
      const id = message.id;
      const messageType = Array.isArray(id) && id.length > 0 ? id[id.length - 1] : "";
      const role = typeof messageType === "string" ? normalizeRoleNameFromCtor(messageType) : "user";
      return {
        role: normalizeMessageRole(role),
        content: normalizeContent(message.kwargs?.content)
      };
    }
    if (message.type) {
      const role = String(message.type).toLowerCase();
      return {
        role: normalizeMessageRole(role),
        content: normalizeContent(message.content)
      };
    }
    if (message.role) {
      return {
        role: normalizeMessageRole(String(message.role)),
        content: normalizeContent(message.content)
      };
    }
    const ctor = message.constructor?.name;
    if (ctor && ctor !== "Object") {
      return {
        role: normalizeMessageRole(normalizeRoleNameFromCtor(ctor)),
        content: normalizeContent(message.content)
      };
    }
    return {
      role: "user",
      content: normalizeContent(message.content)
    };
  });
}
function extractCommonRequestAttributes(serialized, invocationParams, langSmithMetadata) {
  const attrs = {};
  const kwargs = "kwargs" in serialized ? serialized.kwargs : void 0;
  const temperature = invocationParams?.temperature ?? langSmithMetadata?.ls_temperature ?? kwargs?.temperature;
  setNumberIfDefined(attrs, GEN_AI_REQUEST_TEMPERATURE_ATTRIBUTE, temperature);
  const maxTokens = invocationParams?.max_tokens ?? langSmithMetadata?.ls_max_tokens ?? kwargs?.max_tokens;
  setNumberIfDefined(attrs, GEN_AI_REQUEST_MAX_TOKENS_ATTRIBUTE, maxTokens);
  const topP = invocationParams?.top_p ?? kwargs?.top_p;
  setNumberIfDefined(attrs, GEN_AI_REQUEST_TOP_P_ATTRIBUTE, topP);
  const frequencyPenalty = invocationParams?.frequency_penalty;
  setNumberIfDefined(attrs, GEN_AI_REQUEST_FREQUENCY_PENALTY_ATTRIBUTE, frequencyPenalty);
  const presencePenalty = invocationParams?.presence_penalty;
  setNumberIfDefined(attrs, GEN_AI_REQUEST_PRESENCE_PENALTY_ATTRIBUTE, presencePenalty);
  if (invocationParams && "stream" in invocationParams) {
    setIfDefined(attrs, GEN_AI_REQUEST_STREAM_ATTRIBUTE, Boolean(invocationParams.stream));
  }
  return attrs;
}
function baseRequestAttributes(system, modelName, serialized, invocationParams, langSmithMetadata) {
  return {
    [GEN_AI_SYSTEM_ATTRIBUTE]: asString(system ?? "langchain"),
    [GEN_AI_OPERATION_NAME_ATTRIBUTE]: "chat",
    [GEN_AI_REQUEST_MODEL_ATTRIBUTE]: asString(modelName),
    [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: LANGCHAIN_ORIGIN,
    ...extractCommonRequestAttributes(serialized, invocationParams, langSmithMetadata)
  };
}
function extractLLMRequestAttributes(llm, prompts, recordInputs, invocationParams, langSmithMetadata) {
  const system = langSmithMetadata?.ls_provider;
  const modelName = invocationParams?.model ?? langSmithMetadata?.ls_model_name ?? "unknown";
  const attrs = baseRequestAttributes(system, modelName, llm, invocationParams, langSmithMetadata);
  if (recordInputs && Array.isArray(prompts) && prompts.length > 0) {
    setIfDefined(attrs, GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE, prompts.length);
    const messages = prompts.map((p) => ({ role: "user", content: p }));
    setIfDefined(attrs, GEN_AI_INPUT_MESSAGES_ATTRIBUTE, asString(messages));
  }
  return attrs;
}
function extractChatModelRequestAttributes(llm, langChainMessages, recordInputs, invocationParams, langSmithMetadata) {
  const system = langSmithMetadata?.ls_provider ?? llm.id?.[2];
  const modelName = invocationParams?.model ?? langSmithMetadata?.ls_model_name ?? "unknown";
  const attrs = baseRequestAttributes(system, modelName, llm, invocationParams, langSmithMetadata);
  if (recordInputs && Array.isArray(langChainMessages) && langChainMessages.length > 0) {
    const normalized = normalizeLangChainMessages(langChainMessages.flat());
    const { systemInstructions, filteredMessages } = extractSystemInstructions(normalized);
    if (systemInstructions) {
      setIfDefined(attrs, GEN_AI_SYSTEM_INSTRUCTIONS_ATTRIBUTE, systemInstructions);
    }
    const filteredLength = Array.isArray(filteredMessages) ? filteredMessages.length : 0;
    setIfDefined(attrs, GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE, filteredLength);
    const truncated = truncateGenAiMessages(filteredMessages);
    setIfDefined(attrs, GEN_AI_INPUT_MESSAGES_ATTRIBUTE, asString(truncated));
  }
  return attrs;
}
function addToolCallsAttributes(generations, attrs) {
  const toolCalls = [];
  const flatGenerations = generations.flat();
  for (const gen of flatGenerations) {
    const content = gen.message?.content;
    if (Array.isArray(content)) {
      for (const item of content) {
        const t = item;
        if (t.type === "tool_use") toolCalls.push(t);
      }
    }
  }
  if (toolCalls.length > 0) {
    setIfDefined(attrs, GEN_AI_RESPONSE_TOOL_CALLS_ATTRIBUTE, asString(toolCalls));
  }
}
function addTokenUsageAttributes(llmOutput, attrs) {
  if (!llmOutput) return;
  const tokenUsage = llmOutput.tokenUsage;
  const anthropicUsage = llmOutput.usage;
  if (tokenUsage) {
    setNumberIfDefined(attrs, GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE, tokenUsage.promptTokens);
    setNumberIfDefined(attrs, GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE, tokenUsage.completionTokens);
    setNumberIfDefined(attrs, GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE, tokenUsage.totalTokens);
  } else if (anthropicUsage) {
    setNumberIfDefined(attrs, GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE, anthropicUsage.input_tokens);
    setNumberIfDefined(attrs, GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE, anthropicUsage.output_tokens);
    const input = Number(anthropicUsage.input_tokens);
    const output = Number(anthropicUsage.output_tokens);
    const total = (Number.isNaN(input) ? 0 : input) + (Number.isNaN(output) ? 0 : output);
    if (total > 0) setNumberIfDefined(attrs, GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE, total);
    if (anthropicUsage.cache_creation_input_tokens !== void 0)
      setNumberIfDefined(
        attrs,
        GEN_AI_USAGE_CACHE_CREATION_INPUT_TOKENS_ATTRIBUTE,
        anthropicUsage.cache_creation_input_tokens
      );
    if (anthropicUsage.cache_read_input_tokens !== void 0)
      setNumberIfDefined(attrs, GEN_AI_USAGE_CACHE_READ_INPUT_TOKENS_ATTRIBUTE, anthropicUsage.cache_read_input_tokens);
  }
}
function extractLlmResponseAttributes(llmResult, recordOutputs) {
  if (!llmResult) return;
  const attrs = {};
  if (Array.isArray(llmResult.generations)) {
    const finishReasons = llmResult.generations.flat().map((g) => {
      if (g.generationInfo?.finish_reason) {
        return g.generationInfo.finish_reason;
      }
      if (g.generation_info?.finish_reason) {
        return g.generation_info.finish_reason;
      }
      return null;
    }).filter((r) => typeof r === "string");
    if (finishReasons.length > 0) {
      setIfDefined(attrs, GEN_AI_RESPONSE_FINISH_REASONS_ATTRIBUTE, asString(finishReasons));
    }
    addToolCallsAttributes(llmResult.generations, attrs);
    if (recordOutputs) {
      const texts = llmResult.generations.flat().map((gen) => gen.text ?? gen.message?.content).filter((t) => typeof t === "string");
      if (texts.length > 0) {
        setIfDefined(attrs, GEN_AI_RESPONSE_TEXT_ATTRIBUTE, asString(texts));
      }
    }
  }
  addTokenUsageAttributes(llmResult.llmOutput, attrs);
  const llmOutput = llmResult.llmOutput;
  const firstGeneration = llmResult.generations?.[0]?.[0];
  const v1Message = firstGeneration?.message;
  const modelName = llmOutput?.model_name ?? llmOutput?.model ?? v1Message?.response_metadata?.model_name;
  if (modelName) setIfDefined(attrs, GEN_AI_RESPONSE_MODEL_ATTRIBUTE, modelName);
  const responseId = llmOutput?.id ?? v1Message?.id;
  if (responseId) {
    setIfDefined(attrs, GEN_AI_RESPONSE_ID_ATTRIBUTE, responseId);
  }
  const stopReason = llmOutput?.stop_reason ?? v1Message?.response_metadata?.finish_reason;
  if (stopReason) {
    setIfDefined(attrs, GEN_AI_RESPONSE_STOP_REASON_ATTRIBUTE, asString(stopReason));
  }
  return attrs;
}
function createLangChainCallbackHandler(options = {}) {
  const recordInputs = options.recordInputs ?? false;
  const recordOutputs = options.recordOutputs ?? false;
  const spanMap = /* @__PURE__ */ new Map();
  const exitSpan = (runId) => {
    const span = spanMap.get(runId);
    if (span?.isRecording()) {
      span.end();
      spanMap.delete(runId);
    }
  };
  const handler = {
    // Required LangChain BaseCallbackHandler properties
    lc_serializable: false,
    lc_namespace: ["langchain_core", "callbacks", "sentry"],
    lc_secrets: void 0,
    lc_attributes: void 0,
    lc_aliases: void 0,
    lc_serializable_keys: void 0,
    lc_id: ["langchain_core", "callbacks", "sentry"],
    lc_kwargs: {},
    name: "SentryCallbackHandler",
    // BaseCallbackHandlerInput boolean flags
    ignoreLLM: false,
    ignoreChain: false,
    ignoreAgent: false,
    ignoreRetriever: false,
    ignoreCustomEvent: false,
    raiseError: false,
    awaitHandlers: true,
    handleLLMStart(llm, prompts, runId, _parentRunId, _extraParams, tags, metadata, _runName) {
      const invocationParams = getInvocationParams(tags);
      const attributes = extractLLMRequestAttributes(
        llm,
        prompts,
        recordInputs,
        invocationParams,
        metadata
      );
      const modelName = attributes[GEN_AI_REQUEST_MODEL_ATTRIBUTE];
      const operationName = attributes[GEN_AI_OPERATION_NAME_ATTRIBUTE];
      startSpanManual(
        {
          name: `${operationName} ${modelName}`,
          op: "gen_ai.chat",
          attributes: {
            ...attributes,
            [SEMANTIC_ATTRIBUTE_SENTRY_OP]: "gen_ai.chat"
          }
        },
        (span) => {
          spanMap.set(runId, span);
          return span;
        }
      );
    },
    // Chat Model Start Handler
    handleChatModelStart(llm, messages, runId, _parentRunId, _extraParams, tags, metadata, _runName) {
      const invocationParams = getInvocationParams(tags);
      const attributes = extractChatModelRequestAttributes(
        llm,
        messages,
        recordInputs,
        invocationParams,
        metadata
      );
      const modelName = attributes[GEN_AI_REQUEST_MODEL_ATTRIBUTE];
      const operationName = attributes[GEN_AI_OPERATION_NAME_ATTRIBUTE];
      startSpanManual(
        {
          name: `${operationName} ${modelName}`,
          op: "gen_ai.chat",
          attributes: {
            ...attributes,
            [SEMANTIC_ATTRIBUTE_SENTRY_OP]: "gen_ai.chat"
          }
        },
        (span) => {
          spanMap.set(runId, span);
          return span;
        }
      );
    },
    // LLM End Handler - note: handleLLMEnd with capital LLM (used by both LLMs and chat models!)
    handleLLMEnd(output, runId, _parentRunId, _tags, _extraParams) {
      const span = spanMap.get(runId);
      if (span?.isRecording()) {
        const attributes = extractLlmResponseAttributes(output, recordOutputs);
        if (attributes) {
          span.setAttributes(attributes);
        }
        exitSpan(runId);
      }
    },
    // LLM Error Handler - note: handleLLMError with capital LLM
    handleLLMError(error2, runId) {
      const span = spanMap.get(runId);
      if (span?.isRecording()) {
        span.setStatus({ code: SPAN_STATUS_ERROR, message: "llm_error" });
        exitSpan(runId);
      }
      captureException(error2, {
        mechanism: {
          handled: false,
          type: `${LANGCHAIN_ORIGIN}.llm_error_handler`
        }
      });
    },
    // Chain Start Handler
    handleChainStart(chain, inputs, runId, _parentRunId, _tags, _metadata, _runType, runName) {
      const chainName = runName || chain.name || "unknown_chain";
      const attributes = {
        [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.ai.langchain",
        "langchain.chain.name": chainName
      };
      if (recordInputs) {
        attributes["langchain.chain.inputs"] = JSON.stringify(inputs);
      }
      startSpanManual(
        {
          name: `chain ${chainName}`,
          op: "gen_ai.invoke_agent",
          attributes: {
            ...attributes,
            [SEMANTIC_ATTRIBUTE_SENTRY_OP]: "gen_ai.invoke_agent"
          }
        },
        (span) => {
          spanMap.set(runId, span);
          return span;
        }
      );
    },
    // Chain End Handler
    handleChainEnd(outputs, runId) {
      const span = spanMap.get(runId);
      if (span?.isRecording()) {
        if (recordOutputs) {
          span.setAttributes({
            "langchain.chain.outputs": JSON.stringify(outputs)
          });
        }
        exitSpan(runId);
      }
    },
    // Chain Error Handler
    handleChainError(error2, runId) {
      const span = spanMap.get(runId);
      if (span?.isRecording()) {
        span.setStatus({ code: SPAN_STATUS_ERROR, message: "chain_error" });
        exitSpan(runId);
      }
      captureException(error2, {
        mechanism: {
          handled: false,
          type: `${LANGCHAIN_ORIGIN}.chain_error_handler`
        }
      });
    },
    // Tool Start Handler
    handleToolStart(tool, input, runId, _parentRunId) {
      const toolName = tool.name || "unknown_tool";
      const attributes = {
        [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: LANGCHAIN_ORIGIN,
        [GEN_AI_TOOL_NAME_ATTRIBUTE]: toolName
      };
      if (recordInputs) {
        attributes[GEN_AI_TOOL_INPUT_ATTRIBUTE] = input;
      }
      startSpanManual(
        {
          name: `execute_tool ${toolName}`,
          op: "gen_ai.execute_tool",
          attributes: {
            ...attributes,
            [SEMANTIC_ATTRIBUTE_SENTRY_OP]: "gen_ai.execute_tool"
          }
        },
        (span) => {
          spanMap.set(runId, span);
          return span;
        }
      );
    },
    // Tool End Handler
    handleToolEnd(output, runId) {
      const span = spanMap.get(runId);
      if (span?.isRecording()) {
        if (recordOutputs) {
          span.setAttributes({
            [GEN_AI_TOOL_OUTPUT_ATTRIBUTE]: JSON.stringify(output)
          });
        }
        exitSpan(runId);
      }
    },
    // Tool Error Handler
    handleToolError(error2, runId) {
      const span = spanMap.get(runId);
      if (span?.isRecording()) {
        span.setStatus({ code: SPAN_STATUS_ERROR, message: "tool_error" });
        exitSpan(runId);
      }
      captureException(error2, {
        mechanism: {
          handled: false,
          type: `${LANGCHAIN_ORIGIN}.tool_error_handler`
        }
      });
    },
    // LangChain BaseCallbackHandler required methods
    copy() {
      return handler;
    },
    toJSON() {
      return {
        lc: 1,
        type: "not_implemented",
        id: handler.lc_id
      };
    },
    toJSONNotImplemented() {
      return {
        lc: 1,
        type: "not_implemented",
        id: handler.lc_id
      };
    }
  };
  return handler;
}
const LANGGRAPH_INTEGRATION_NAME = "LangGraph";
const LANGGRAPH_ORIGIN = "auto.ai.langgraph";
function extractToolCalls(messages) {
  if (!messages || messages.length === 0) {
    return null;
  }
  const toolCalls = [];
  for (const message of messages) {
    if (message && typeof message === "object") {
      const msgToolCalls = message.tool_calls;
      if (msgToolCalls && Array.isArray(msgToolCalls)) {
        toolCalls.push(...msgToolCalls);
      }
    }
  }
  return toolCalls.length > 0 ? toolCalls : null;
}
function extractTokenUsageFromMessage(message) {
  const msg = message;
  let inputTokens = 0;
  let outputTokens = 0;
  let totalTokens = 0;
  if (msg.usage_metadata && typeof msg.usage_metadata === "object") {
    const usage = msg.usage_metadata;
    if (typeof usage.input_tokens === "number") {
      inputTokens = usage.input_tokens;
    }
    if (typeof usage.output_tokens === "number") {
      outputTokens = usage.output_tokens;
    }
    if (typeof usage.total_tokens === "number") {
      totalTokens = usage.total_tokens;
    }
    return { inputTokens, outputTokens, totalTokens };
  }
  if (msg.response_metadata && typeof msg.response_metadata === "object") {
    const metadata = msg.response_metadata;
    if (metadata.tokenUsage && typeof metadata.tokenUsage === "object") {
      const tokenUsage = metadata.tokenUsage;
      if (typeof tokenUsage.promptTokens === "number") {
        inputTokens = tokenUsage.promptTokens;
      }
      if (typeof tokenUsage.completionTokens === "number") {
        outputTokens = tokenUsage.completionTokens;
      }
      if (typeof tokenUsage.totalTokens === "number") {
        totalTokens = tokenUsage.totalTokens;
      }
    }
  }
  return { inputTokens, outputTokens, totalTokens };
}
function extractModelMetadata(span, message) {
  const msg = message;
  if (msg.response_metadata && typeof msg.response_metadata === "object") {
    const metadata = msg.response_metadata;
    if (metadata.model_name && typeof metadata.model_name === "string") {
      span.setAttribute(GEN_AI_RESPONSE_MODEL_ATTRIBUTE, metadata.model_name);
    }
    if (metadata.finish_reason && typeof metadata.finish_reason === "string") {
      span.setAttribute(GEN_AI_RESPONSE_FINISH_REASONS_ATTRIBUTE, [metadata.finish_reason]);
    }
  }
}
function extractToolsFromCompiledGraph(compiledGraph) {
  if (!compiledGraph.builder?.nodes?.tools?.runnable?.tools) {
    return null;
  }
  const tools = compiledGraph.builder?.nodes?.tools?.runnable?.tools;
  if (!tools || !Array.isArray(tools) || tools.length === 0) {
    return null;
  }
  return tools.map((tool) => ({
    name: tool.lc_kwargs?.name,
    description: tool.lc_kwargs?.description,
    schema: tool.lc_kwargs?.schema
  }));
}
function setResponseAttributes(span, inputMessages, result) {
  const resultObj = result;
  const outputMessages = resultObj?.messages;
  if (!outputMessages || !Array.isArray(outputMessages)) {
    return;
  }
  const inputCount = inputMessages?.length ?? 0;
  const newMessages = outputMessages.length > inputCount ? outputMessages.slice(inputCount) : [];
  if (newMessages.length === 0) {
    return;
  }
  const toolCalls = extractToolCalls(newMessages);
  if (toolCalls) {
    span.setAttribute(GEN_AI_RESPONSE_TOOL_CALLS_ATTRIBUTE, JSON.stringify(toolCalls));
  }
  const normalizedNewMessages = normalizeLangChainMessages(newMessages);
  span.setAttribute(GEN_AI_RESPONSE_TEXT_ATTRIBUTE, JSON.stringify(normalizedNewMessages));
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalTokens = 0;
  for (const message of newMessages) {
    const tokens = extractTokenUsageFromMessage(message);
    totalInputTokens += tokens.inputTokens;
    totalOutputTokens += tokens.outputTokens;
    totalTokens += tokens.totalTokens;
    extractModelMetadata(span, message);
  }
  if (totalInputTokens > 0) {
    span.setAttribute(GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE, totalInputTokens);
  }
  if (totalOutputTokens > 0) {
    span.setAttribute(GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE, totalOutputTokens);
  }
  if (totalTokens > 0) {
    span.setAttribute(GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE, totalTokens);
  }
}
function instrumentStateGraphCompile(originalCompile, options) {
  return new Proxy(originalCompile, {
    apply(target, thisArg, args) {
      return startSpan$1(
        {
          op: "gen_ai.create_agent",
          name: "create_agent",
          attributes: {
            [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: LANGGRAPH_ORIGIN,
            [SEMANTIC_ATTRIBUTE_SENTRY_OP]: "gen_ai.create_agent",
            [GEN_AI_OPERATION_NAME_ATTRIBUTE]: "create_agent"
          }
        },
        (span) => {
          try {
            const compiledGraph = Reflect.apply(target, thisArg, args);
            const compileOptions = args.length > 0 ? args[0] : {};
            if (compileOptions?.name && typeof compileOptions.name === "string") {
              span.setAttribute(GEN_AI_AGENT_NAME_ATTRIBUTE, compileOptions.name);
              span.updateName(`create_agent ${compileOptions.name}`);
            }
            const originalInvoke = compiledGraph.invoke;
            if (originalInvoke && typeof originalInvoke === "function") {
              compiledGraph.invoke = instrumentCompiledGraphInvoke(
                originalInvoke.bind(compiledGraph),
                compiledGraph,
                compileOptions,
                options
              );
            }
            return compiledGraph;
          } catch (error2) {
            span.setStatus({ code: SPAN_STATUS_ERROR, message: "internal_error" });
            captureException(error2, {
              mechanism: {
                handled: false,
                type: "auto.ai.langgraph.error"
              }
            });
            throw error2;
          }
        }
      );
    }
  });
}
function instrumentCompiledGraphInvoke(originalInvoke, graphInstance, compileOptions, options) {
  return new Proxy(originalInvoke, {
    apply(target, thisArg, args) {
      return startSpan$1(
        {
          op: "gen_ai.invoke_agent",
          name: "invoke_agent",
          attributes: {
            [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: LANGGRAPH_ORIGIN,
            [SEMANTIC_ATTRIBUTE_SENTRY_OP]: GEN_AI_INVOKE_AGENT_OPERATION_ATTRIBUTE,
            [GEN_AI_OPERATION_NAME_ATTRIBUTE]: "invoke_agent"
          }
        },
        async (span) => {
          try {
            const graphName = compileOptions?.name;
            if (graphName && typeof graphName === "string") {
              span.setAttribute(GEN_AI_PIPELINE_NAME_ATTRIBUTE, graphName);
              span.setAttribute(GEN_AI_AGENT_NAME_ATTRIBUTE, graphName);
              span.updateName(`invoke_agent ${graphName}`);
            }
            const config2 = args.length > 1 ? args[1] : void 0;
            const configurable = config2?.configurable;
            const threadId = configurable?.thread_id;
            if (threadId && typeof threadId === "string") {
              span.setAttribute(GEN_AI_CONVERSATION_ID_ATTRIBUTE, threadId);
            }
            const tools = extractToolsFromCompiledGraph(graphInstance);
            if (tools) {
              span.setAttribute(GEN_AI_REQUEST_AVAILABLE_TOOLS_ATTRIBUTE, JSON.stringify(tools));
            }
            const recordInputs = options.recordInputs;
            const recordOutputs = options.recordOutputs;
            const inputMessages = args.length > 0 ? args[0]?.messages ?? [] : [];
            if (inputMessages && recordInputs) {
              const normalizedMessages = normalizeLangChainMessages(inputMessages);
              const { systemInstructions, filteredMessages } = extractSystemInstructions(normalizedMessages);
              if (systemInstructions) {
                span.setAttribute(GEN_AI_SYSTEM_INSTRUCTIONS_ATTRIBUTE, systemInstructions);
              }
              const truncatedMessages = truncateGenAiMessages(filteredMessages);
              const filteredLength = Array.isArray(filteredMessages) ? filteredMessages.length : 0;
              span.setAttributes({
                [GEN_AI_INPUT_MESSAGES_ATTRIBUTE]: JSON.stringify(truncatedMessages),
                [GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE]: filteredLength
              });
            }
            const result = await Reflect.apply(target, thisArg, args);
            if (recordOutputs) {
              setResponseAttributes(span, inputMessages ?? null, result);
            }
            return result;
          } catch (error2) {
            span.setStatus({ code: SPAN_STATUS_ERROR, message: "internal_error" });
            captureException(error2, {
              mechanism: {
                handled: false,
                type: "auto.ai.langgraph.error"
              }
            });
            throw error2;
          }
        }
      );
    }
  });
}
function instrumentLangGraph$1(stateGraph, options) {
  const _options = options || {};
  stateGraph.compile = instrumentStateGraphCompile(stateGraph.compile.bind(stateGraph), _options);
  return stateGraph;
}
function isBrowserBundle() {
  return typeof __SENTRY_BROWSER_BUNDLE__ !== "undefined" && !!__SENTRY_BROWSER_BUNDLE__;
}
function isNodeEnv() {
  return !isBrowserBundle() && Object.prototype.toString.call(typeof process !== "undefined" ? process : 0) === "[object process]";
}
function isBrowser() {
  return typeof window !== "undefined" && (!isNodeEnv() || isElectronNodeRenderer());
}
function isElectronNodeRenderer() {
  const process2 = GLOBAL_OBJ.process;
  return process2?.type === "renderer";
}
function replaceExports(exports$1, exportName, wrappedConstructor) {
  const original = exports$1[exportName];
  if (typeof original !== "function") {
    return;
  }
  try {
    exports$1[exportName] = wrappedConstructor;
  } catch (error2) {
    Object.defineProperty(exports$1, exportName, {
      value: wrappedConstructor,
      writable: true,
      configurable: true,
      enumerable: true
    });
  }
  if (exports$1.default === original) {
    try {
      exports$1.default = wrappedConstructor;
    } catch (error2) {
      Object.defineProperty(exports$1, "default", {
        value: wrappedConstructor,
        writable: true,
        configurable: true,
        enumerable: true
      });
    }
  }
}
const INSTRUMENTATION_NAME$1 = "@sentry/instrumentation-http";
const MAX_BODY_BYTE_LENGTH = 1024 * 1024;
function patchRequestToCaptureBody(req, isolationScope, maxIncomingRequestBodySize, integrationName) {
  let bodyByteLength = 0;
  const chunks = [];
  DEBUG_BUILD$1 && debug.log(integrationName, "Patching request.on");
  const callbackMap = /* @__PURE__ */ new WeakMap();
  const maxBodySize = maxIncomingRequestBodySize === "small" ? 1e3 : maxIncomingRequestBodySize === "medium" ? 1e4 : MAX_BODY_BYTE_LENGTH;
  try {
    req.on = new Proxy(req.on, {
      apply: (target, thisArg, args) => {
        const [event, listener, ...restArgs] = args;
        if (event === "data") {
          DEBUG_BUILD$1 && debug.log(integrationName, `Handling request.on("data") with maximum body size of ${maxBodySize}b`);
          const callback = new Proxy(listener, {
            apply: (target2, thisArg2, args2) => {
              try {
                const chunk = args2[0];
                const bufferifiedChunk = Buffer.from(chunk);
                if (bodyByteLength < maxBodySize) {
                  chunks.push(bufferifiedChunk);
                  bodyByteLength += bufferifiedChunk.byteLength;
                } else if (DEBUG_BUILD$1) {
                  debug.log(
                    integrationName,
                    `Dropping request body chunk because maximum body length of ${maxBodySize}b is exceeded.`
                  );
                }
              } catch (err) {
                DEBUG_BUILD$1 && debug.error(integrationName, "Encountered error while storing body chunk.");
              }
              return Reflect.apply(target2, thisArg2, args2);
            }
          });
          callbackMap.set(listener, callback);
          return Reflect.apply(target, thisArg, [event, callback, ...restArgs]);
        }
        return Reflect.apply(target, thisArg, args);
      }
    });
    req.off = new Proxy(req.off, {
      apply: (target, thisArg, args) => {
        const [, listener] = args;
        const callback = callbackMap.get(listener);
        if (callback) {
          callbackMap.delete(listener);
          const modifiedArgs = args.slice();
          modifiedArgs[1] = callback;
          return Reflect.apply(target, thisArg, modifiedArgs);
        }
        return Reflect.apply(target, thisArg, args);
      }
    });
    req.on("end", () => {
      try {
        const body = Buffer.concat(chunks).toString("utf-8");
        if (body) {
          const bodyByteLength2 = Buffer.byteLength(body, "utf-8");
          const truncatedBody = bodyByteLength2 > maxBodySize ? `${Buffer.from(body).subarray(0, maxBodySize - 3).toString("utf-8")}...` : body;
          isolationScope.setSDKProcessingMetadata({ normalizedRequest: { data: truncatedBody } });
        }
      } catch (error2) {
        if (DEBUG_BUILD$1) {
          debug.error(integrationName, "Error building captured request body", error2);
        }
      }
    });
  } catch (error2) {
    if (DEBUG_BUILD$1) {
      debug.error(integrationName, "Error patching request to capture body", error2);
    }
  }
}
const HTTP_SERVER_INSTRUMENTED_KEY = createContextKey("sentry_http_server_instrumented");
const INTEGRATION_NAME$u = "Http.Server";
const clientToRequestSessionAggregatesMap = /* @__PURE__ */ new Map();
const wrappedEmitFns = /* @__PURE__ */ new WeakSet();
function addStartSpanCallback(request, callback) {
  addNonEnumerableProperty(request, "_startSpanCallback", new WeakRef(callback));
}
const _httpServerIntegration = ((options = {}) => {
  const _options = {
    sessions: options.sessions ?? true,
    sessionFlushingDelayMS: options.sessionFlushingDelayMS ?? 6e4,
    maxRequestBodySize: options.maxRequestBodySize ?? "medium",
    ignoreRequestBody: options.ignoreRequestBody
  };
  return {
    name: INTEGRATION_NAME$u,
    setupOnce() {
      const onHttpServerRequestStart = ((_data) => {
        const data = _data;
        instrumentServer(data.server, _options);
      });
      subscribe("http.server.request.start", onHttpServerRequestStart);
    },
    afterAllSetup(client) {
      if (DEBUG_BUILD$1 && client.getIntegrationByName("Http")) {
        debug.warn(
          "It seems that you have manually added `httpServerIntegration` while `httpIntegration` is also present. Make sure to remove `httpServerIntegration` when adding `httpIntegration`."
        );
      }
    }
  };
});
const httpServerIntegration = _httpServerIntegration;
function instrumentServer(server, {
  ignoreRequestBody,
  maxRequestBodySize,
  sessions,
  sessionFlushingDelayMS
}) {
  const originalEmit = server.emit;
  if (wrappedEmitFns.has(originalEmit)) {
    return;
  }
  const newEmit = new Proxy(originalEmit, {
    apply(target, thisArg, args) {
      if (args[0] !== "request") {
        return target.apply(thisArg, args);
      }
      const client = getClient();
      if (context.active().getValue(HTTP_SERVER_INSTRUMENTED_KEY) || !client) {
        return target.apply(thisArg, args);
      }
      DEBUG_BUILD$1 && debug.log(INTEGRATION_NAME$u, "Handling incoming request");
      const isolationScope = getIsolationScope().clone();
      const request = args[1];
      const response = args[2];
      const normalizedRequest = httpRequestToRequestData(request);
      const ipAddress = request.ip || request.socket?.remoteAddress;
      const url = request.url || "/";
      if (maxRequestBodySize !== "none" && !ignoreRequestBody?.(url, request)) {
        patchRequestToCaptureBody(request, isolationScope, maxRequestBodySize, INTEGRATION_NAME$u);
      }
      isolationScope.setSDKProcessingMetadata({ normalizedRequest, ipAddress });
      const httpMethod = (request.method || "GET").toUpperCase();
      const httpTargetWithoutQueryFragment = stripUrlQueryAndFragment(url);
      const bestEffortTransactionName = `${httpMethod} ${httpTargetWithoutQueryFragment}`;
      isolationScope.setTransactionName(bestEffortTransactionName);
      if (sessions && client) {
        recordRequestSession(client, {
          requestIsolationScope: isolationScope,
          response,
          sessionFlushingDelayMS: sessionFlushingDelayMS ?? 6e4
        });
      }
      return withIsolationScope(isolationScope, () => {
        getCurrentScope().getPropagationContext().propagationSpanId = generateSpanId();
        const ctx = propagation.extract(context.active(), normalizedRequest.headers).setValue(HTTP_SERVER_INSTRUMENTED_KEY, true);
        return context.with(ctx, () => {
          client.emit("httpServerRequest", request, response, normalizedRequest);
          const callback = request._startSpanCallback?.deref();
          if (callback) {
            return callback(() => target.apply(thisArg, args));
          }
          return target.apply(thisArg, args);
        });
      });
    }
  });
  wrappedEmitFns.add(newEmit);
  server.emit = newEmit;
}
function recordRequestSession(client, {
  requestIsolationScope,
  response,
  sessionFlushingDelayMS
}) {
  requestIsolationScope.setSDKProcessingMetadata({
    requestSession: { status: "ok" }
  });
  response.once("close", () => {
    const requestSession = requestIsolationScope.getScopeData().sdkProcessingMetadata.requestSession;
    if (client && requestSession) {
      DEBUG_BUILD$1 && debug.log(`Recorded request session with status: ${requestSession.status}`);
      const roundedDate = /* @__PURE__ */ new Date();
      roundedDate.setSeconds(0, 0);
      const dateBucketKey = roundedDate.toISOString();
      const existingClientAggregate = clientToRequestSessionAggregatesMap.get(client);
      const bucket = existingClientAggregate?.[dateBucketKey] || { exited: 0, crashed: 0, errored: 0 };
      bucket[{ ok: "exited", crashed: "crashed", errored: "errored" }[requestSession.status]]++;
      if (existingClientAggregate) {
        existingClientAggregate[dateBucketKey] = bucket;
      } else {
        DEBUG_BUILD$1 && debug.log("Opened new request session aggregate.");
        const newClientAggregate = { [dateBucketKey]: bucket };
        clientToRequestSessionAggregatesMap.set(client, newClientAggregate);
        const flushPendingClientAggregates = () => {
          clearTimeout(timeout);
          unregisterClientFlushHook();
          clientToRequestSessionAggregatesMap.delete(client);
          const aggregatePayload = Object.entries(newClientAggregate).map(
            ([timestamp, value]) => ({
              started: timestamp,
              exited: value.exited,
              errored: value.errored,
              crashed: value.crashed
            })
          );
          client.sendSession({ aggregates: aggregatePayload });
        };
        const unregisterClientFlushHook = client.on("flush", () => {
          DEBUG_BUILD$1 && debug.log("Sending request session aggregate due to client flush");
          flushPendingClientAggregates();
        });
        const timeout = setTimeout(() => {
          DEBUG_BUILD$1 && debug.log("Sending request session aggregate due to flushing schedule");
          flushPendingClientAggregates();
        }, sessionFlushingDelayMS).unref();
      }
    }
  });
}
const INTEGRATION_NAME$t = "Http.ServerSpans";
const _httpServerSpansIntegration = ((options = {}) => {
  const ignoreStaticAssets = options.ignoreStaticAssets ?? true;
  const ignoreIncomingRequests = options.ignoreIncomingRequests;
  const ignoreStatusCodes = options.ignoreStatusCodes ?? [
    [401, 404],
    // 300 and 304 are possibly valid status codes we do not want to filter
    [301, 303],
    [305, 399]
  ];
  const { onSpanCreated } = options;
  const { requestHook: requestHook2, responseHook, applyCustomAttributesOnSpan } = options.instrumentation ?? {};
  return {
    name: INTEGRATION_NAME$t,
    setup(client) {
      if (typeof __SENTRY_TRACING__ !== "undefined" && !__SENTRY_TRACING__) {
        return;
      }
      client.on("httpServerRequest", (_request, _response, normalizedRequest) => {
        const request = _request;
        const response = _response;
        const startSpan2 = (next) => {
          if (shouldIgnoreSpansForIncomingRequest(request, {
            ignoreStaticAssets,
            ignoreIncomingRequests
          })) {
            DEBUG_BUILD$1 && debug.log(INTEGRATION_NAME$t, "Skipping span creation for incoming request", request.url);
            return next();
          }
          const fullUrl = normalizedRequest.url || request.url || "/";
          const urlObj = parseStringToURLObject(fullUrl);
          const headers = request.headers;
          const userAgent = headers["user-agent"];
          const ips = headers["x-forwarded-for"];
          const httpVersion = request.httpVersion;
          const host = headers.host;
          const hostname = host?.replace(/^(.*)(:[0-9]{1,5})/, "$1") || "localhost";
          const tracer = client.tracer;
          const scheme = fullUrl.startsWith("https") ? "https" : "http";
          const method = normalizedRequest.method || request.method?.toUpperCase() || "GET";
          const httpTargetWithoutQueryFragment = urlObj ? urlObj.pathname : stripUrlQueryAndFragment(fullUrl);
          const bestEffortTransactionName = `${method} ${httpTargetWithoutQueryFragment}`;
          const span = tracer.startSpan(bestEffortTransactionName, {
            kind: SpanKind.SERVER,
            attributes: {
              // Sentry specific attributes
              [SEMANTIC_ATTRIBUTE_SENTRY_OP]: "http.server",
              [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.otel.http",
              "sentry.http.prefetch": isKnownPrefetchRequest(request) || void 0,
              // Old Semantic Conventions attributes - added for compatibility with what `@opentelemetry/instrumentation-http` output before
              "http.url": fullUrl,
              "http.method": normalizedRequest.method,
              "http.target": urlObj ? `${urlObj.pathname}${urlObj.search}` : httpTargetWithoutQueryFragment,
              "http.host": host,
              "net.host.name": hostname,
              "http.client_ip": typeof ips === "string" ? ips.split(",")[0] : void 0,
              "http.user_agent": userAgent,
              "http.scheme": scheme,
              "http.flavor": httpVersion,
              "net.transport": httpVersion?.toUpperCase() === "QUIC" ? "ip_udp" : "ip_tcp",
              ...getRequestContentLengthAttribute(request),
              ...httpHeadersToSpanAttributes(
                normalizedRequest.headers || {},
                client.getOptions().sendDefaultPii ?? false
              )
            }
          });
          requestHook2?.(span, request);
          responseHook?.(span, response);
          applyCustomAttributesOnSpan?.(span, request, response);
          onSpanCreated?.(span, request, response);
          const rpcMetadata = {
            type: RPCType$1.HTTP,
            span
          };
          return context.with(setRPCMetadata$1(trace.setSpan(context.active(), span), rpcMetadata), () => {
            context.bind(context.active(), request);
            context.bind(context.active(), response);
            let isEnded = false;
            function endSpan2(status) {
              if (isEnded) {
                return;
              }
              isEnded = true;
              const newAttributes = getIncomingRequestAttributesOnResponse(request, response);
              span.setAttributes(newAttributes);
              span.setStatus(status);
              span.end();
              const route = newAttributes["http.route"];
              if (route) {
                getIsolationScope().setTransactionName(`${request.method?.toUpperCase() || "GET"} ${route}`);
              }
            }
            response.on("close", () => {
              endSpan2(getSpanStatusFromHttpCode(response.statusCode));
            });
            response.on(errorMonitor, () => {
              const httpStatus = getSpanStatusFromHttpCode(response.statusCode);
              endSpan2(httpStatus.code === SPAN_STATUS_ERROR ? httpStatus : { code: SPAN_STATUS_ERROR });
            });
            return next();
          });
        };
        addStartSpanCallback(request, startSpan2);
      });
    },
    processEvent(event) {
      if (event.type === "transaction") {
        const statusCode = event.contexts?.trace?.data?.["http.response.status_code"];
        if (typeof statusCode === "number") {
          const shouldDrop = shouldFilterStatusCode(statusCode, ignoreStatusCodes);
          if (shouldDrop) {
            DEBUG_BUILD$1 && debug.log("Dropping transaction due to status code", statusCode);
            return null;
          }
        }
      }
      return event;
    },
    afterAllSetup(client) {
      if (!DEBUG_BUILD$1) {
        return;
      }
      if (client.getIntegrationByName("Http")) {
        debug.warn(
          "It seems that you have manually added `httpServerSpansIntergation` while `httpIntegration` is also present. Make sure to remove `httpIntegration` when adding `httpServerSpansIntegration`."
        );
      }
      if (!client.getIntegrationByName("Http.Server")) {
        debug.error(
          "It seems that you have manually added `httpServerSpansIntergation` without adding `httpServerIntegration`. This is a requiement for spans to be created - please add the `httpServerIntegration` integration."
        );
      }
    }
  };
});
const httpServerSpansIntegration = _httpServerSpansIntegration;
function isKnownPrefetchRequest(req) {
  return req.headers["next-router-prefetch"] === "1";
}
function isStaticAssetRequest(urlPath) {
  const path = stripUrlQueryAndFragment(urlPath);
  if (path.match(/\.(ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot|webp|avif)$/)) {
    return true;
  }
  if (path.match(/^\/(robots\.txt|sitemap\.xml|manifest\.json|browserconfig\.xml)$/)) {
    return true;
  }
  return false;
}
function shouldIgnoreSpansForIncomingRequest(request, {
  ignoreStaticAssets,
  ignoreIncomingRequests
}) {
  if (isTracingSuppressed$1(context.active())) {
    return true;
  }
  const urlPath = request.url;
  const method = request.method?.toUpperCase();
  if (method === "OPTIONS" || method === "HEAD" || !urlPath) {
    return true;
  }
  if (ignoreStaticAssets && method === "GET" && isStaticAssetRequest(urlPath)) {
    return true;
  }
  if (ignoreIncomingRequests?.(urlPath, request)) {
    return true;
  }
  return false;
}
function getRequestContentLengthAttribute(request) {
  const length = getContentLength(request.headers);
  if (length == null) {
    return {};
  }
  if (isCompressed(request.headers)) {
    return {
      ["http.request_content_length"]: length
    };
  } else {
    return {
      ["http.request_content_length_uncompressed"]: length
    };
  }
}
function getContentLength(headers) {
  const contentLengthHeader = headers["content-length"];
  if (contentLengthHeader === void 0) return null;
  const contentLength = parseInt(contentLengthHeader, 10);
  if (isNaN(contentLength)) return null;
  return contentLength;
}
function isCompressed(headers) {
  const encoding = headers["content-encoding"];
  return !!encoding && encoding !== "identity";
}
function getIncomingRequestAttributesOnResponse(request, response) {
  const { socket } = request;
  const { statusCode, statusMessage } = response;
  const newAttributes = {
    [ATTR_HTTP_RESPONSE_STATUS_CODE]: statusCode,
    // eslint-disable-next-line deprecation/deprecation
    [SEMATTRS_HTTP_STATUS_CODE]: statusCode,
    "http.status_text": statusMessage?.toUpperCase()
  };
  const rpcMetadata = getRPCMetadata$1(context.active());
  if (socket) {
    const { localAddress, localPort, remoteAddress, remotePort } = socket;
    newAttributes[SEMATTRS_NET_HOST_IP] = localAddress;
    newAttributes[SEMATTRS_NET_HOST_PORT] = localPort;
    newAttributes[SEMATTRS_NET_PEER_IP] = remoteAddress;
    newAttributes["net.peer.port"] = remotePort;
  }
  newAttributes[SEMATTRS_HTTP_STATUS_CODE] = statusCode;
  newAttributes["http.status_text"] = (statusMessage || "").toUpperCase();
  if (rpcMetadata?.type === RPCType$1.HTTP && rpcMetadata.route !== void 0) {
    const routeName = rpcMetadata.route;
    newAttributes[ATTR_HTTP_ROUTE] = routeName;
  }
  return newAttributes;
}
function shouldFilterStatusCode(statusCode, dropForStatusCodes) {
  return dropForStatusCodes.some((code) => {
    if (typeof code === "number") {
      return code === statusCode;
    }
    const [min, max] = code;
    return statusCode >= min && statusCode <= max;
  });
}
function getRequestUrl$1(requestOptions) {
  const protocol = requestOptions.protocol || "";
  const hostname = requestOptions.hostname || requestOptions.host || "";
  const port = !requestOptions.port || requestOptions.port === 80 || requestOptions.port === 443 || /^(.*):(\d+)$/.test(hostname) ? "" : `:${requestOptions.port}`;
  const path = requestOptions.path ? requestOptions.path : "/";
  return `${protocol}//${hostname}${port}${path}`;
}
const LOG_PREFIX = "@sentry/instrumentation-http";
function addRequestBreadcrumb(request, response) {
  const data = getBreadcrumbData(request);
  const statusCode = response?.statusCode;
  const level = getBreadcrumbLogLevelFromHttpStatusCode(statusCode);
  addBreadcrumb(
    {
      category: "http",
      data: {
        status_code: statusCode,
        ...data
      },
      type: "http",
      level
    },
    {
      event: "response",
      request,
      response
    }
  );
}
function addTracePropagationHeadersToOutgoingRequest(request, propagationDecisionMap) {
  const url = getRequestUrl(request);
  const { tracePropagationTargets, propagateTraceparent } = getClient()?.getOptions() || {};
  const headersToAdd = shouldPropagateTraceForUrl(url, tracePropagationTargets, propagationDecisionMap) ? getTraceData({ propagateTraceparent }) : void 0;
  if (!headersToAdd) {
    return;
  }
  const { "sentry-trace": sentryTrace, baggage, traceparent } = headersToAdd;
  if (sentryTrace && !request.getHeader("sentry-trace")) {
    try {
      request.setHeader("sentry-trace", sentryTrace);
      DEBUG_BUILD$1 && debug.log(LOG_PREFIX, "Added sentry-trace header to outgoing request");
    } catch (error2) {
      DEBUG_BUILD$1 && debug.error(
        LOG_PREFIX,
        "Failed to add sentry-trace header to outgoing request:",
        isError(error2) ? error2.message : "Unknown error"
      );
    }
  }
  if (traceparent && !request.getHeader("traceparent")) {
    try {
      request.setHeader("traceparent", traceparent);
      DEBUG_BUILD$1 && debug.log(LOG_PREFIX, "Added traceparent header to outgoing request");
    } catch (error2) {
      DEBUG_BUILD$1 && debug.error(
        LOG_PREFIX,
        "Failed to add traceparent header to outgoing request:",
        isError(error2) ? error2.message : "Unknown error"
      );
    }
  }
  if (baggage) {
    const newBaggage = mergeBaggageHeaders(request.getHeader("baggage"), baggage);
    if (newBaggage) {
      try {
        request.setHeader("baggage", newBaggage);
        DEBUG_BUILD$1 && debug.log(LOG_PREFIX, "Added baggage header to outgoing request");
      } catch (error2) {
        DEBUG_BUILD$1 && debug.error(
          LOG_PREFIX,
          "Failed to add baggage header to outgoing request:",
          isError(error2) ? error2.message : "Unknown error"
        );
      }
    }
  }
}
function getBreadcrumbData(request) {
  try {
    const host = request.getHeader("host") || request.host;
    const url = new URL(request.path, `${request.protocol}//${host}`);
    const parsedUrl = parseUrl(url.toString());
    const data = {
      url: getSanitizedUrlString(parsedUrl),
      "http.method": request.method || "GET"
    };
    if (parsedUrl.search) {
      data["http.query"] = parsedUrl.search;
    }
    if (parsedUrl.hash) {
      data["http.fragment"] = parsedUrl.hash;
    }
    return data;
  } catch {
    return {};
  }
}
function getRequestOptions(request) {
  return {
    method: request.method,
    protocol: request.protocol,
    host: request.host,
    hostname: request.host,
    path: request.path,
    headers: request.getHeaders()
  };
}
function getRequestUrl(request) {
  const hostname = request.getHeader("host") || request.host;
  const protocol = request.protocol;
  const path = request.path;
  return `${protocol}//${hostname}${path}`;
}
class SentryHttpInstrumentation extends InstrumentationBase$2 {
  constructor(config2 = {}) {
    super(INSTRUMENTATION_NAME$1, SDK_VERSION, config2);
    this._propagationDecisionMap = new LRUMap(100);
    this._ignoreOutgoingRequestsMap = /* @__PURE__ */ new WeakMap();
  }
  /** @inheritdoc */
  init() {
    let hasRegisteredHandlers = false;
    const onHttpClientResponseFinish = ((_data) => {
      const data = _data;
      this._onOutgoingRequestFinish(data.request, data.response);
    });
    const onHttpClientRequestError = ((_data) => {
      const data = _data;
      this._onOutgoingRequestFinish(data.request, void 0);
    });
    const onHttpClientRequestCreated = ((_data) => {
      const data = _data;
      this._onOutgoingRequestCreated(data.request);
    });
    const wrap2 = (moduleExports) => {
      if (hasRegisteredHandlers) {
        return moduleExports;
      }
      hasRegisteredHandlers = true;
      subscribe("http.client.response.finish", onHttpClientResponseFinish);
      subscribe("http.client.request.error", onHttpClientRequestError);
      if (this.getConfig().propagateTraceInOutgoingRequests) {
        subscribe("http.client.request.created", onHttpClientRequestCreated);
      }
      return moduleExports;
    };
    const unwrap2 = () => {
      unsubscribe("http.client.response.finish", onHttpClientResponseFinish);
      unsubscribe("http.client.request.error", onHttpClientRequestError);
      unsubscribe("http.client.request.created", onHttpClientRequestCreated);
    };
    return [
      new InstrumentationNodeModuleDefinition$2("http", ["*"], wrap2, unwrap2),
      new InstrumentationNodeModuleDefinition$2("https", ["*"], wrap2, unwrap2)
    ];
  }
  /**
   * This is triggered when an outgoing request finishes.
   * It has access to the final request and response objects.
   */
  _onOutgoingRequestFinish(request, response) {
    DEBUG_BUILD$1 && debug.log(INSTRUMENTATION_NAME$1, "Handling finished outgoing request");
    const _breadcrumbs = this.getConfig().breadcrumbs;
    const breadCrumbsEnabled = typeof _breadcrumbs === "undefined" ? true : _breadcrumbs;
    const shouldIgnore = this._ignoreOutgoingRequestsMap.get(request) ?? this._shouldIgnoreOutgoingRequest(request);
    this._ignoreOutgoingRequestsMap.set(request, shouldIgnore);
    if (breadCrumbsEnabled && !shouldIgnore) {
      addRequestBreadcrumb(request, response);
    }
  }
  /**
   * This is triggered when an outgoing request is created.
   * It has access to the request object, and can mutate it before the request is sent.
   */
  _onOutgoingRequestCreated(request) {
    const shouldIgnore = this._ignoreOutgoingRequestsMap.get(request) ?? this._shouldIgnoreOutgoingRequest(request);
    this._ignoreOutgoingRequestsMap.set(request, shouldIgnore);
    if (shouldIgnore) {
      return;
    }
    addTracePropagationHeadersToOutgoingRequest(request, this._propagationDecisionMap);
  }
  /**
   * Check if the given outgoing request should be ignored.
   */
  _shouldIgnoreOutgoingRequest(request) {
    if (isTracingSuppressed$1(context.active())) {
      return true;
    }
    const ignoreOutgoingRequests = this.getConfig().ignoreOutgoingRequests;
    if (!ignoreOutgoingRequests) {
      return false;
    }
    const options = getRequestOptions(request);
    const url = getRequestUrl$1(request);
    return ignoreOutgoingRequests(url, options);
  }
}
function isCjs() {
  try {
    return typeof module !== "undefined" && typeof module.exports !== "undefined";
  } catch {
    return false;
  }
}
let moduleCache;
const INTEGRATION_NAME$s = "Modules";
const SERVER_MODULES = typeof __SENTRY_SERVER_MODULES__ === "undefined" ? {} : __SENTRY_SERVER_MODULES__;
const _modulesIntegration = (() => {
  return {
    name: INTEGRATION_NAME$s,
    processEvent(event) {
      event.modules = {
        ...event.modules,
        ..._getModules()
      };
      return event;
    },
    getModules: _getModules
  };
});
const modulesIntegration = _modulesIntegration;
function getRequireCachePaths() {
  try {
    return require.cache ? Object.keys(require.cache) : [];
  } catch {
    return [];
  }
}
function collectModules() {
  return {
    ...SERVER_MODULES,
    ...getModulesFromPackageJson(),
    ...isCjs() ? collectRequireModules() : {}
  };
}
function collectRequireModules() {
  const mainPaths = require.main?.paths || [];
  const paths = getRequireCachePaths();
  const infos = {};
  const seen = /* @__PURE__ */ new Set();
  paths.forEach((path) => {
    let dir = path;
    const updir = () => {
      const orig = dir;
      dir = dirname(orig);
      if (!dir || orig === dir || seen.has(orig)) {
        return void 0;
      }
      if (mainPaths.indexOf(dir) < 0) {
        return updir();
      }
      const pkgfile = join(orig, "package.json");
      seen.add(orig);
      if (!existsSync(pkgfile)) {
        return updir();
      }
      try {
        const info = JSON.parse(readFileSync(pkgfile, "utf8"));
        infos[info.name] = info.version;
      } catch {
      }
    };
    updir();
  });
  return infos;
}
function _getModules() {
  if (!moduleCache) {
    moduleCache = collectModules();
  }
  return moduleCache;
}
function getPackageJson() {
  try {
    const filePath = join(process.cwd(), "package.json");
    const packageJson = JSON.parse(readFileSync(filePath, "utf8"));
    return packageJson;
  } catch {
    return {};
  }
}
function getModulesFromPackageJson() {
  const packageJson = getPackageJson();
  return {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };
}
const INTEGRATION_NAME$r = "Spotlight";
const _spotlightIntegration = ((options = {}) => {
  const _options = {
    sidecarUrl: options.sidecarUrl || "http://localhost:8969/stream"
  };
  return {
    name: INTEGRATION_NAME$r,
    setup(client) {
      try {
        if (false) ;
      } catch {
      }
      connectToSpotlight(client, _options);
    }
  };
});
const spotlightIntegration = defineIntegration(_spotlightIntegration);
function connectToSpotlight(client, options) {
  const spotlightUrl = parseSidecarUrl(options.sidecarUrl);
  if (!spotlightUrl) {
    return;
  }
  let failedRequests = 0;
  client.on("beforeEnvelope", (envelope) => {
    if (failedRequests > 3) {
      debug.warn("[Spotlight] Disabled Sentry -> Spotlight integration due to too many failed requests");
      return;
    }
    const serializedEnvelope = serializeEnvelope(envelope);
    suppressTracing$1(() => {
      const req = http$1.request(
        {
          method: "POST",
          path: spotlightUrl.pathname,
          hostname: spotlightUrl.hostname,
          port: spotlightUrl.port,
          headers: {
            "Content-Type": "application/x-sentry-envelope"
          }
        },
        (res) => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 400) {
            failedRequests = 0;
          }
          res.on("data", () => {
          });
          res.on("end", () => {
          });
          res.setEncoding("utf8");
        }
      );
      req.on("error", () => {
        failedRequests++;
        debug.warn("[Spotlight] Failed to send envelope to Spotlight Sidecar");
      });
      req.write(serializedEnvelope);
      req.end();
    });
  });
}
function parseSidecarUrl(url) {
  try {
    return new URL(`${url}`);
  } catch {
    debug.warn(`[Spotlight] Invalid sidecar URL: ${url}`);
    return void 0;
  }
}
const INTEGRATION_NAME$q = "NodeSystemError";
function isSystemError(error2) {
  if (!(error2 instanceof Error)) {
    return false;
  }
  if (!("errno" in error2) || typeof error2.errno !== "number") {
    return false;
  }
  return util.getSystemErrorMap().has(error2.errno);
}
const systemErrorIntegration = defineIntegration((options = {}) => {
  return {
    name: INTEGRATION_NAME$q,
    processEvent: (event, hint, client) => {
      if (!isSystemError(hint.originalException)) {
        return event;
      }
      const error2 = hint.originalException;
      const errorContext = {
        ...error2
      };
      if (!client.getOptions().sendDefaultPii && options.includePaths !== true) {
        delete errorContext.path;
        delete errorContext.dest;
      }
      event.contexts = {
        ...event.contexts,
        node_system_error: errorContext
      };
      for (const exception of event.exception?.values || []) {
        if (exception.value) {
          if (error2.path && exception.value.includes(error2.path)) {
            exception.value = exception.value.replace(`'${error2.path}'`, "").trim();
          }
          if (error2.dest && exception.value.includes(error2.dest)) {
            exception.value = exception.value.replace(`'${error2.dest}'`, "").trim();
          }
        }
      }
      return event;
    }
  };
});
function validateOpenTelemetrySetup() {
  if (!DEBUG_BUILD$1) {
    return;
  }
  const setup = openTelemetrySetupCheck();
  const required = ["SentryContextManager", "SentryPropagator"];
  if (hasSpansEnabled()) {
    required.push("SentrySpanProcessor");
  }
  for (const k of required) {
    if (!setup.includes(k)) {
      debug.error(
        `You have to set up the ${k}. Without this, the OpenTelemetry & Sentry integration will not work properly.`
      );
    }
  }
  if (!setup.includes("SentrySampler")) {
    debug.warn(
      "You have to set up the SentrySampler. Without this, the OpenTelemetry & Sentry integration may still work, but sample rates set for the Sentry SDK will not be respected. If you use a custom sampler, make sure to use `wrapSamplingDecision`."
    );
  }
}
const createMissingInstrumentationContext = (pkg) => ({
  package: pkg,
  "javascript.is_cjs": isCjs()
});
function ensureIsWrapped(maybeWrappedFunction, name2) {
  const clientOptions = getClient()?.getOptions();
  if (!clientOptions?.disableInstrumentationWarnings && !isWrapped$2(maybeWrappedFunction) && isEnabled() && hasSpansEnabled(clientOptions)) {
    consoleSandbox(() => {
      if (isCjs()) {
        console.warn(
          `[Sentry] ${name2} is not instrumented. This is likely because you required/imported ${name2} before calling \`Sentry.init()\`.`
        );
      } else {
        console.warn(
          `[Sentry] ${name2} is not instrumented. Please make sure to initialize Sentry in a separate file that you \`--import\` when running node, see: https://docs.sentry.io/platforms/javascript/guides/${name2}/install/esm/.`
        );
      }
    });
    getGlobalScope().setContext("missing_instrumentation", createMissingInstrumentationContext(name2));
  }
}
const DEFAULT_CAPTURED_LEVELS = ["trace", "debug", "info", "warn", "error", "fatal"];
const LEVEL_SYMBOL = Symbol.for("level");
const MESSAGE_SYMBOL = Symbol.for("message");
const SPLAT_SYMBOL = Symbol.for("splat");
function createSentryWinstonTransport(TransportClass, sentryWinstonOptions) {
  class SentryWinstonTransport extends TransportClass {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(options) {
      super(options);
      this._levels = new Set(sentryWinstonOptions?.levels ?? DEFAULT_CAPTURED_LEVELS);
    }
    /**
     * Forwards a winston log to the Sentry SDK.
     */
    log(info, callback) {
      try {
        setImmediate(() => {
          this.emit("logged", info);
        });
        if (!isObject(info)) {
          return;
        }
        const levelFromSymbol = info[LEVEL_SYMBOL];
        const { level, message, timestamp, ...attributes } = info;
        attributes[LEVEL_SYMBOL] = void 0;
        attributes[MESSAGE_SYMBOL] = void 0;
        attributes[SPLAT_SYMBOL] = void 0;
        const customLevel = sentryWinstonOptions?.customLevelMap?.[levelFromSymbol];
        const winstonLogLevel = WINSTON_LEVEL_TO_LOG_SEVERITY_LEVEL_MAP[levelFromSymbol];
        const logSeverityLevel = customLevel ?? winstonLogLevel ?? "info";
        if (this._levels.has(logSeverityLevel)) {
          captureLog(logSeverityLevel, message, {
            ...attributes,
            "sentry.origin": "auto.log.winston"
          });
        } else if (!customLevel && !winstonLogLevel) {
          DEBUG_BUILD$1 && debug.log(
            `Winston log level ${levelFromSymbol} is not captured by Sentry. Please add ${levelFromSymbol} to the "customLevelMap" option of the Sentry Winston transport.`
          );
        }
      } catch {
      }
      if (callback) {
        callback();
      }
    }
  }
  return SentryWinstonTransport;
}
function isObject(anything) {
  return typeof anything === "object" && anything != null;
}
const WINSTON_LEVEL_TO_LOG_SEVERITY_LEVEL_MAP = {
  // npm
  silly: "trace",
  // npm and syslog
  debug: "debug",
  // npm
  verbose: "debug",
  // npm
  http: "debug",
  // npm and syslog
  info: "info",
  // syslog
  notice: "info",
  // npm
  warn: "warn",
  // syslog
  warning: "warn",
  // npm and syslog
  error: "error",
  // syslog
  emerg: "fatal",
  // syslog
  alert: "fatal",
  // syslog
  crit: "fatal"
};
const SENTRY_TRACK_SYMBOL = Symbol("sentry-track-pino-logger");
function getPinoKey(logger2, symbolName, defaultKey) {
  const symbols2 = Object.getOwnPropertySymbols(logger2);
  const symbolString = `Symbol(${symbolName})`;
  for (const sym of symbols2) {
    if (sym.toString() === symbolString) {
      const value = logger2[sym];
      return typeof value === "string" ? value : defaultKey;
    }
  }
  return defaultKey;
}
const DEFAULT_OPTIONS = {
  error: { levels: [], handled: true },
  log: { levels: ["trace", "debug", "info", "warn", "error", "fatal"] }
};
function stripIgnoredFields(result) {
  const { level, time, pid, hostname, ...rest } = result;
  return rest;
}
const _pinoIntegration = defineIntegration((userOptions = {}) => {
  const options = {
    autoInstrument: userOptions.autoInstrument !== false,
    error: { ...DEFAULT_OPTIONS.error, ...userOptions.error },
    log: { ...DEFAULT_OPTIONS.log, ...userOptions.log }
  };
  function shouldTrackLogger(logger2) {
    const override = logger2[SENTRY_TRACK_SYMBOL];
    return override === "track" || override !== "ignore" && options.autoInstrument;
  }
  return {
    name: "Pino",
    setup: (client) => {
      const enableLogs = !!client.getOptions().enableLogs;
      const integratedChannel = diagnosticsChannel.tracingChannel("pino_asJson");
      function onPinoStart(self, args, result) {
        if (!shouldTrackLogger(self)) {
          return;
        }
        const resultObj = stripIgnoredFields(result);
        const [captureObj, message, levelNumber] = args;
        const level = self?.levels?.labels?.[levelNumber] || "info";
        const messageKey = getPinoKey(self, "pino.messageKey", "msg");
        const logMessage = message || resultObj?.[messageKey] || "";
        if (enableLogs && options.log.levels.includes(level)) {
          const attributes = {
            ...resultObj,
            "sentry.origin": "auto.log.pino",
            "pino.logger.level": levelNumber
          };
          _INTERNAL_captureLog({ level, message: logMessage, attributes });
        }
        if (options.error.levels.includes(level)) {
          const captureContext = {
            level: severityLevelFromString(level)
          };
          withScope((scope) => {
            scope.addEventProcessor((event) => {
              event.logger = "pino";
              addExceptionMechanism(event, {
                handled: options.error.handled,
                type: "auto.log.pino"
              });
              return event;
            });
            const error2 = captureObj[getPinoKey(self, "pino.errorKey", "err")];
            if (error2) {
              captureException(error2, captureContext);
              return;
            }
            captureMessage(logMessage, captureContext);
          });
        }
      }
      integratedChannel.end.subscribe((data) => {
        const {
          instance,
          arguments: args,
          result
        } = data;
        onPinoStart(instance, args, JSON.parse(result));
      });
    }
  };
});
const pinoIntegration = Object.assign(_pinoIntegration, {
  trackLogger(logger2) {
    if (logger2 && typeof logger2 === "object" && "levels" in logger2) {
      logger2[SENTRY_TRACK_SYMBOL] = "track";
    }
  },
  untrackLogger(logger2) {
    if (logger2 && typeof logger2 === "object" && "levels" in logger2) {
      logger2[SENTRY_TRACK_SYMBOL] = "ignore";
    }
  }
});
function addOriginToSpan(span, origin) {
  span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, origin);
}
const replacements = [
  ["january", "1"],
  ["february", "2"],
  ["march", "3"],
  ["april", "4"],
  ["may", "5"],
  ["june", "6"],
  ["july", "7"],
  ["august", "8"],
  ["september", "9"],
  ["october", "10"],
  ["november", "11"],
  ["december", "12"],
  ["jan", "1"],
  ["feb", "2"],
  ["mar", "3"],
  ["apr", "4"],
  ["may", "5"],
  ["jun", "6"],
  ["jul", "7"],
  ["aug", "8"],
  ["sep", "9"],
  ["oct", "10"],
  ["nov", "11"],
  ["dec", "12"],
  ["sunday", "0"],
  ["monday", "1"],
  ["tuesday", "2"],
  ["wednesday", "3"],
  ["thursday", "4"],
  ["friday", "5"],
  ["saturday", "6"],
  ["sun", "0"],
  ["mon", "1"],
  ["tue", "2"],
  ["wed", "3"],
  ["thu", "4"],
  ["fri", "5"],
  ["sat", "6"]
];
function replaceCronNames(cronExpression) {
  return replacements.reduce(
    // eslint-disable-next-line @sentry-internal/sdk/no-regexp-constructor
    (acc, [name2, replacement]) => acc.replace(new RegExp(name2, "gi"), replacement),
    cronExpression
  );
}
const ERROR_TEXT = "Automatic instrumentation of CronJob only supports crontab string";
function instrumentCron(lib, monitorSlug) {
  let jobScheduled = false;
  return new Proxy(lib, {
    construct(target, args) {
      const [cronTime, onTick, onComplete, start, timeZone, ...rest] = args;
      if (typeof cronTime !== "string") {
        throw new Error(ERROR_TEXT);
      }
      if (jobScheduled) {
        throw new Error(`A job named '${monitorSlug}' has already been scheduled`);
      }
      jobScheduled = true;
      const cronString = replaceCronNames(cronTime);
      async function monitoredTick(context2, onComplete2) {
        return withMonitor(
          monitorSlug,
          async () => {
            try {
              await onTick(context2, onComplete2);
            } catch (e) {
              captureException(e, {
                mechanism: {
                  handled: false,
                  type: "auto.function.cron.instrumentCron"
                }
              });
              throw e;
            }
          },
          {
            schedule: { type: "crontab", value: cronString },
            timezone: timeZone || void 0
          }
        );
      }
      return new target(cronTime, monitoredTick, onComplete, start, timeZone, ...rest);
    },
    get(target, prop) {
      if (prop === "from") {
        return (param) => {
          const { cronTime, onTick, timeZone } = param;
          if (typeof cronTime !== "string") {
            throw new Error(ERROR_TEXT);
          }
          if (jobScheduled) {
            throw new Error(`A job named '${monitorSlug}' has already been scheduled`);
          }
          jobScheduled = true;
          const cronString = replaceCronNames(cronTime);
          param.onTick = async (context2, onComplete) => {
            return withMonitor(
              monitorSlug,
              async () => {
                try {
                  await onTick(context2, onComplete);
                } catch (e) {
                  captureException(e, {
                    mechanism: {
                      handled: false,
                      type: "auto.function.cron.instrumentCron"
                    }
                  });
                  throw e;
                }
              },
              {
                schedule: { type: "crontab", value: cronString },
                timezone: timeZone || void 0
              }
            );
          };
          return target.from(param);
        };
      } else {
        return target[prop];
      }
    }
  });
}
function instrumentNodeCron(lib, monitorConfig = {}) {
  return new Proxy(lib, {
    get(target, prop) {
      if (prop === "schedule" && target.schedule) {
        return new Proxy(target.schedule, {
          apply(target2, thisArg, argArray) {
            const [expression, callback, options] = argArray;
            const name2 = options?.name;
            const timezone = options?.timezone;
            if (!name2) {
              throw new Error('Missing "name" for scheduled job. A name is required for Sentry check-in monitoring.');
            }
            const monitoredCallback = async (...args) => {
              return withMonitor(
                name2,
                async () => {
                  try {
                    return await callback(...args);
                  } catch (e) {
                    captureException(e, {
                      mechanism: {
                        handled: false,
                        type: "auto.function.node-cron.instrumentNodeCron"
                      }
                    });
                    throw e;
                  }
                },
                {
                  schedule: { type: "crontab", value: replaceCronNames(expression) },
                  timezone,
                  ...monitorConfig
                }
              );
            };
            return target2.apply(thisArg, [expression, monitoredCallback, options]);
          }
        });
      } else {
        return target[prop];
      }
    }
  });
}
function instrumentNodeSchedule(lib) {
  return new Proxy(lib, {
    get(target, prop) {
      if (prop === "scheduleJob") {
        return new Proxy(target.scheduleJob, {
          apply(target2, thisArg, argArray) {
            const [nameOrExpression, expressionOrCallback, callback] = argArray;
            if (typeof nameOrExpression !== "string" || typeof expressionOrCallback !== "string" || typeof callback !== "function") {
              throw new Error(
                "Automatic instrumentation of 'node-schedule' requires the first parameter of 'scheduleJob' to be a job name string and the second parameter to be a crontab string"
              );
            }
            const monitorSlug = nameOrExpression;
            const expression = expressionOrCallback;
            async function monitoredCallback() {
              return withMonitor(
                monitorSlug,
                async () => {
                  await callback?.();
                },
                {
                  schedule: { type: "crontab", value: replaceCronNames(expression) }
                }
              );
            }
            return target2.apply(thisArg, [monitorSlug, expression, monitoredCallback]);
          }
        });
      }
      return target[prop];
    }
  });
}
const cron = {
  instrumentCron,
  instrumentNodeCron,
  instrumentNodeSchedule
};
const INTEGRATION_NAME$p = "Http";
const INSTRUMENTATION_NAME = "@opentelemetry_sentry-patched/instrumentation-http";
const instrumentSentryHttp = generateInstrumentOnce(
  `${INTEGRATION_NAME$p}.sentry`,
  (options) => {
    return new SentryHttpInstrumentation(options);
  }
);
const instrumentOtelHttp = generateInstrumentOnce(INTEGRATION_NAME$p, (config2) => {
  const instrumentation2 = new srcExports$k.HttpInstrumentation({
    ...config2,
    // This is hard-coded and can never be overridden by the user
    disableIncomingRequestInstrumentation: true
  });
  try {
    instrumentation2["_diag"] = diag.createComponentLogger({
      namespace: INSTRUMENTATION_NAME
    });
    instrumentation2.instrumentationName = INSTRUMENTATION_NAME;
  } catch {
  }
  return instrumentation2;
});
function _shouldUseOtelHttpInstrumentation(options, clientOptions = {}) {
  if (typeof options.spans === "boolean") {
    return options.spans;
  }
  if (clientOptions.skipOpenTelemetrySetup) {
    return false;
  }
  if (!hasSpansEnabled(clientOptions) && NODE_VERSION.major >= 22) {
    return false;
  }
  return true;
}
const httpIntegration = defineIntegration((options = {}) => {
  const spans = options.spans ?? true;
  const disableIncomingRequestSpans = options.disableIncomingRequestSpans;
  const serverOptions = {
    sessions: options.trackIncomingRequestsAsSessions,
    sessionFlushingDelayMS: options.sessionFlushingDelayMS,
    ignoreRequestBody: options.ignoreIncomingRequestBody,
    maxRequestBodySize: options.maxIncomingRequestBodySize
  };
  const serverSpansOptions = {
    ignoreIncomingRequests: options.ignoreIncomingRequests,
    ignoreStaticAssets: options.ignoreStaticAssets,
    ignoreStatusCodes: options.dropSpansForIncomingRequestStatusCodes,
    instrumentation: options.instrumentation,
    onSpanCreated: options.incomingRequestSpanHook
  };
  const server = httpServerIntegration(serverOptions);
  const serverSpans = httpServerSpansIntegration(serverSpansOptions);
  const enableServerSpans = spans && !disableIncomingRequestSpans;
  return {
    name: INTEGRATION_NAME$p,
    setup(client) {
      const clientOptions = client.getOptions();
      if (enableServerSpans && hasSpansEnabled(clientOptions)) {
        serverSpans.setup(client);
      }
    },
    setupOnce() {
      const clientOptions = getClient()?.getOptions() || {};
      const useOtelHttpInstrumentation = _shouldUseOtelHttpInstrumentation(options, clientOptions);
      server.setupOnce();
      const sentryHttpInstrumentationOptions = {
        breadcrumbs: options.breadcrumbs,
        propagateTraceInOutgoingRequests: !useOtelHttpInstrumentation,
        ignoreOutgoingRequests: options.ignoreOutgoingRequests
      };
      instrumentSentryHttp(sentryHttpInstrumentationOptions);
      if (useOtelHttpInstrumentation) {
        const instrumentationConfig = getConfigWithDefaults(options);
        instrumentOtelHttp(instrumentationConfig);
      }
    },
    processEvent(event) {
      return serverSpans.processEvent(event);
    }
  };
});
function getConfigWithDefaults(options = {}) {
  const instrumentationConfig = {
    ignoreOutgoingRequestHook: (request) => {
      const url = getRequestUrl$1(request);
      if (!url) {
        return false;
      }
      const _ignoreOutgoingRequests = options.ignoreOutgoingRequests;
      if (_ignoreOutgoingRequests?.(url, request)) {
        return true;
      }
      return false;
    },
    requireParentforOutgoingSpans: false,
    requestHook: (span, req) => {
      addOriginToSpan(span, "auto.http.otel.http");
      const url = getRequestUrl$1(req);
      if (url.startsWith("data:")) {
        const sanitizedUrl = stripDataUrlContent(url);
        span.setAttribute("http.url", sanitizedUrl);
        span.setAttribute(SEMANTIC_ATTRIBUTE_URL_FULL, sanitizedUrl);
        span.updateName(`${req.method || "GET"} ${sanitizedUrl}`);
      }
      options.instrumentation?.requestHook?.(span, req);
    },
    responseHook: (span, res) => {
      options.instrumentation?.responseHook?.(span, res);
    },
    applyCustomAttributesOnSpan: (span, request, response) => {
      options.instrumentation?.applyCustomAttributesOnSpan?.(span, request, response);
    }
  };
  return instrumentationConfig;
}
var src$l = {};
var instrumentation$i = {};
var version$k = {};
var hasRequiredVersion$j;
function requireVersion$j() {
  if (hasRequiredVersion$j) return version$k;
  hasRequiredVersion$j = 1;
  Object.defineProperty(version$k, "__esModule", { value: true });
  version$k.PACKAGE_NAME = version$k.PACKAGE_VERSION = void 0;
  version$k.PACKAGE_VERSION = "0.30.0";
  version$k.PACKAGE_NAME = "@opentelemetry/instrumentation-fs";
  return version$k;
}
var constants$1 = {};
var hasRequiredConstants$1;
function requireConstants$1() {
  if (hasRequiredConstants$1) return constants$1;
  hasRequiredConstants$1 = 1;
  Object.defineProperty(constants$1, "__esModule", { value: true });
  constants$1.SYNC_FUNCTIONS = constants$1.CALLBACK_FUNCTIONS = constants$1.PROMISE_FUNCTIONS = void 0;
  constants$1.PROMISE_FUNCTIONS = [
    "access",
    "appendFile",
    "chmod",
    "chown",
    "copyFile",
    "cp",
    "lchown",
    "link",
    "lstat",
    "lutimes",
    "mkdir",
    "mkdtemp",
    "open",
    "opendir",
    "readdir",
    "readFile",
    "readlink",
    "realpath",
    "rename",
    "rm",
    "rmdir",
    "stat",
    "symlink",
    "truncate",
    "unlink",
    "utimes",
    "writeFile"
    // 'lchmod', // only implemented on macOS
  ];
  constants$1.CALLBACK_FUNCTIONS = [
    "access",
    "appendFile",
    "chmod",
    "chown",
    "copyFile",
    "cp",
    "exists",
    "lchown",
    "link",
    "lstat",
    "lutimes",
    "mkdir",
    "mkdtemp",
    "open",
    "opendir",
    "readdir",
    "readFile",
    "readlink",
    "realpath",
    "realpath.native",
    "rename",
    "rm",
    "rmdir",
    "stat",
    "symlink",
    "truncate",
    "unlink",
    "utimes",
    "writeFile"
    // 'close', // functions on file descriptor
    // 'fchmod', // functions on file descriptor
    // 'fchown', // functions on file descriptor
    // 'fdatasync', // functions on file descriptor
    // 'fstat', // functions on file descriptor
    // 'fsync', // functions on file descriptor
    // 'ftruncate', // functions on file descriptor
    // 'futimes', // functions on file descriptor
    // 'lchmod', // only implemented on macOS
    // 'read', // functions on file descriptor
    // 'readv', // functions on file descriptor
    // 'write', // functions on file descriptor
    // 'writev', // functions on file descriptor
  ];
  constants$1.SYNC_FUNCTIONS = [
    "accessSync",
    "appendFileSync",
    "chmodSync",
    "chownSync",
    "copyFileSync",
    "cpSync",
    "existsSync",
    "lchownSync",
    "linkSync",
    "lstatSync",
    "lutimesSync",
    "mkdirSync",
    "mkdtempSync",
    "opendirSync",
    "openSync",
    "readdirSync",
    "readFileSync",
    "readlinkSync",
    "realpathSync",
    "realpathSync.native",
    "renameSync",
    "rmdirSync",
    "rmSync",
    "statSync",
    "symlinkSync",
    "truncateSync",
    "unlinkSync",
    "utimesSync",
    "writeFileSync"
    // 'closeSync', // functions on file descriptor
    // 'fchmodSync', // functions on file descriptor
    // 'fchownSync', // functions on file descriptor
    // 'fdatasyncSync', // functions on file descriptor
    // 'fstatSync', // functions on file descriptor
    // 'fsyncSync', // functions on file descriptor
    // 'ftruncateSync', // functions on file descriptor
    // 'futimesSync', // functions on file descriptor
    // 'lchmodSync', // only implemented on macOS
    // 'readSync', // functions on file descriptor
    // 'readvSync', // functions on file descriptor
    // 'writeSync', // functions on file descriptor
    // 'writevSync', // functions on file descriptor
  ];
  return constants$1;
}
var utils$f = {};
var hasRequiredUtils$f;
function requireUtils$f() {
  if (hasRequiredUtils$f) return utils$f;
  hasRequiredUtils$f = 1;
  Object.defineProperty(utils$f, "__esModule", { value: true });
  utils$f.indexFs = utils$f.splitTwoLevels = void 0;
  function splitTwoLevels(functionName) {
    const memberParts = functionName.split(".");
    if (memberParts.length > 1) {
      if (memberParts.length !== 2)
        throw Error(`Invalid member function name ${functionName}`);
      return memberParts;
    } else {
      return [functionName];
    }
  }
  utils$f.splitTwoLevels = splitTwoLevels;
  function indexFs(fs, member) {
    if (!member)
      throw new Error(JSON.stringify({ member }));
    const splitResult = splitTwoLevels(member);
    const [functionName1, functionName2] = splitResult;
    if (functionName2) {
      return {
        objectToPatch: fs[functionName1],
        functionNameToPatch: functionName2
      };
    } else {
      return {
        objectToPatch: fs,
        functionNameToPatch: functionName1
      };
    }
  }
  utils$f.indexFs = indexFs;
  return utils$f;
}
var hasRequiredInstrumentation$i;
function requireInstrumentation$i() {
  if (hasRequiredInstrumentation$i) return instrumentation$i;
  hasRequiredInstrumentation$i = 1;
  Object.defineProperty(instrumentation$i, "__esModule", { value: true });
  instrumentation$i.FsInstrumentation = void 0;
  const api = require$$0$2;
  const core_1 = require$$1$1;
  const instrumentation_1 = require$$2;
  const version_1 = requireVersion$j();
  const constants_1 = requireConstants$1();
  const util_1 = require$$0$1;
  const utils_1 = requireUtils$f();
  function patchedFunctionWithOriginalProperties(patchedFunction, original) {
    return Object.assign(patchedFunction, original);
  }
  class FsInstrumentation extends instrumentation_1.InstrumentationBase {
    constructor(config2 = {}) {
      super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config2);
    }
    init() {
      return [
        new instrumentation_1.InstrumentationNodeModuleDefinition("fs", ["*"], (fs) => {
          for (const fName of constants_1.SYNC_FUNCTIONS) {
            const { objectToPatch, functionNameToPatch } = (0, utils_1.indexFs)(fs, fName);
            if ((0, instrumentation_1.isWrapped)(objectToPatch[functionNameToPatch])) {
              this._unwrap(objectToPatch, functionNameToPatch);
            }
            this._wrap(objectToPatch, functionNameToPatch, this._patchSyncFunction.bind(this, fName));
          }
          for (const fName of constants_1.CALLBACK_FUNCTIONS) {
            const { objectToPatch, functionNameToPatch } = (0, utils_1.indexFs)(fs, fName);
            if ((0, instrumentation_1.isWrapped)(objectToPatch[functionNameToPatch])) {
              this._unwrap(objectToPatch, functionNameToPatch);
            }
            if (fName === "exists") {
              this._wrap(objectToPatch, functionNameToPatch, this._patchExistsCallbackFunction.bind(this, fName));
              continue;
            }
            this._wrap(objectToPatch, functionNameToPatch, this._patchCallbackFunction.bind(this, fName));
          }
          for (const fName of constants_1.PROMISE_FUNCTIONS) {
            if ((0, instrumentation_1.isWrapped)(fs.promises[fName])) {
              this._unwrap(fs.promises, fName);
            }
            this._wrap(fs.promises, fName, this._patchPromiseFunction.bind(this, fName));
          }
          return fs;
        }, (fs) => {
          if (fs === void 0)
            return;
          for (const fName of constants_1.SYNC_FUNCTIONS) {
            const { objectToPatch, functionNameToPatch } = (0, utils_1.indexFs)(fs, fName);
            if ((0, instrumentation_1.isWrapped)(objectToPatch[functionNameToPatch])) {
              this._unwrap(objectToPatch, functionNameToPatch);
            }
          }
          for (const fName of constants_1.CALLBACK_FUNCTIONS) {
            const { objectToPatch, functionNameToPatch } = (0, utils_1.indexFs)(fs, fName);
            if ((0, instrumentation_1.isWrapped)(objectToPatch[functionNameToPatch])) {
              this._unwrap(objectToPatch, functionNameToPatch);
            }
          }
          for (const fName of constants_1.PROMISE_FUNCTIONS) {
            if ((0, instrumentation_1.isWrapped)(fs.promises[fName])) {
              this._unwrap(fs.promises, fName);
            }
          }
        }),
        new instrumentation_1.InstrumentationNodeModuleDefinition("fs/promises", ["*"], (fsPromises) => {
          for (const fName of constants_1.PROMISE_FUNCTIONS) {
            if ((0, instrumentation_1.isWrapped)(fsPromises[fName])) {
              this._unwrap(fsPromises, fName);
            }
            this._wrap(fsPromises, fName, this._patchPromiseFunction.bind(this, fName));
          }
          return fsPromises;
        }, (fsPromises) => {
          if (fsPromises === void 0)
            return;
          for (const fName of constants_1.PROMISE_FUNCTIONS) {
            if ((0, instrumentation_1.isWrapped)(fsPromises[fName])) {
              this._unwrap(fsPromises, fName);
            }
          }
        })
      ];
    }
    _patchSyncFunction(functionName, original) {
      const instrumentation2 = this;
      const patchedFunction = function(...args) {
        const activeContext = api.context.active();
        if (!instrumentation2._shouldTrace(activeContext)) {
          return original.apply(this, args);
        }
        if (instrumentation2._runCreateHook(functionName, {
          args
        }) === false) {
          return api.context.with((0, core_1.suppressTracing)(activeContext), original, this, ...args);
        }
        const span = instrumentation2.tracer.startSpan(`fs ${functionName}`);
        try {
          const res = api.context.with((0, core_1.suppressTracing)(api.trace.setSpan(activeContext, span)), original, this, ...args);
          instrumentation2._runEndHook(functionName, { args, span });
          return res;
        } catch (error2) {
          span.recordException(error2);
          span.setStatus({
            message: error2.message,
            code: api.SpanStatusCode.ERROR
          });
          instrumentation2._runEndHook(functionName, { args, span, error: error2 });
          throw error2;
        } finally {
          span.end();
        }
      };
      return patchedFunctionWithOriginalProperties(patchedFunction, original);
    }
    _patchCallbackFunction(functionName, original) {
      const instrumentation2 = this;
      const patchedFunction = function(...args) {
        const activeContext = api.context.active();
        if (!instrumentation2._shouldTrace(activeContext)) {
          return original.apply(this, args);
        }
        if (instrumentation2._runCreateHook(functionName, {
          args
        }) === false) {
          return api.context.with((0, core_1.suppressTracing)(activeContext), original, this, ...args);
        }
        const lastIdx = args.length - 1;
        const cb2 = args[lastIdx];
        if (typeof cb2 === "function") {
          const span = instrumentation2.tracer.startSpan(`fs ${functionName}`);
          args[lastIdx] = api.context.bind(activeContext, function(error2) {
            if (error2) {
              span.recordException(error2);
              span.setStatus({
                message: error2.message,
                code: api.SpanStatusCode.ERROR
              });
            }
            instrumentation2._runEndHook(functionName, {
              args,
              span,
              error: error2
            });
            span.end();
            return cb2.apply(this, arguments);
          });
          try {
            return api.context.with((0, core_1.suppressTracing)(api.trace.setSpan(activeContext, span)), original, this, ...args);
          } catch (error2) {
            span.recordException(error2);
            span.setStatus({
              message: error2.message,
              code: api.SpanStatusCode.ERROR
            });
            instrumentation2._runEndHook(functionName, {
              args,
              span,
              error: error2
            });
            span.end();
            throw error2;
          }
        } else {
          return original.apply(this, args);
        }
      };
      return patchedFunctionWithOriginalProperties(patchedFunction, original);
    }
    _patchExistsCallbackFunction(functionName, original) {
      const instrumentation2 = this;
      const patchedFunction = function(...args) {
        const activeContext = api.context.active();
        if (!instrumentation2._shouldTrace(activeContext)) {
          return original.apply(this, args);
        }
        if (instrumentation2._runCreateHook(functionName, {
          args
        }) === false) {
          return api.context.with((0, core_1.suppressTracing)(activeContext), original, this, ...args);
        }
        const lastIdx = args.length - 1;
        const cb2 = args[lastIdx];
        if (typeof cb2 === "function") {
          const span = instrumentation2.tracer.startSpan(`fs ${functionName}`);
          args[lastIdx] = api.context.bind(activeContext, function() {
            instrumentation2._runEndHook(functionName, {
              args,
              span
            });
            span.end();
            return cb2.apply(this, arguments);
          });
          try {
            return api.context.with((0, core_1.suppressTracing)(api.trace.setSpan(activeContext, span)), original, this, ...args);
          } catch (error2) {
            span.recordException(error2);
            span.setStatus({
              message: error2.message,
              code: api.SpanStatusCode.ERROR
            });
            instrumentation2._runEndHook(functionName, {
              args,
              span,
              error: error2
            });
            span.end();
            throw error2;
          }
        } else {
          return original.apply(this, args);
        }
      };
      const functionWithOriginalProperties = patchedFunctionWithOriginalProperties(patchedFunction, original);
      const promisified = function(path) {
        return new Promise((resolve) => functionWithOriginalProperties(path, resolve));
      };
      Object.defineProperty(promisified, "name", { value: functionName });
      Object.defineProperty(functionWithOriginalProperties, util_1.promisify.custom, {
        value: promisified
      });
      return functionWithOriginalProperties;
    }
    _patchPromiseFunction(functionName, original) {
      const instrumentation2 = this;
      const patchedFunction = async function(...args) {
        const activeContext = api.context.active();
        if (!instrumentation2._shouldTrace(activeContext)) {
          return original.apply(this, args);
        }
        if (instrumentation2._runCreateHook(functionName, {
          args
        }) === false) {
          return api.context.with((0, core_1.suppressTracing)(activeContext), original, this, ...args);
        }
        const span = instrumentation2.tracer.startSpan(`fs ${functionName}`);
        try {
          const res = await api.context.with((0, core_1.suppressTracing)(api.trace.setSpan(activeContext, span)), original, this, ...args);
          instrumentation2._runEndHook(functionName, { args, span });
          return res;
        } catch (error2) {
          span.recordException(error2);
          span.setStatus({
            message: error2.message,
            code: api.SpanStatusCode.ERROR
          });
          instrumentation2._runEndHook(functionName, { args, span, error: error2 });
          throw error2;
        } finally {
          span.end();
        }
      };
      return patchedFunctionWithOriginalProperties(patchedFunction, original);
    }
    _runCreateHook(...args) {
      const { createHook } = this.getConfig();
      if (typeof createHook === "function") {
        try {
          return createHook(...args);
        } catch (e) {
          this._diag.error("caught createHook error", e);
        }
      }
      return true;
    }
    _runEndHook(...args) {
      const { endHook } = this.getConfig();
      if (typeof endHook === "function") {
        try {
          endHook(...args);
        } catch (e) {
          this._diag.error("caught endHook error", e);
        }
      }
    }
    _shouldTrace(context2) {
      if ((0, core_1.isTracingSuppressed)(context2)) {
        return false;
      }
      const { requireParentSpan } = this.getConfig();
      if (requireParentSpan) {
        const parentSpan = api.trace.getSpan(context2);
        if (parentSpan == null) {
          return false;
        }
      }
      return true;
    }
  }
  instrumentation$i.FsInstrumentation = FsInstrumentation;
  return instrumentation$i;
}
var hasRequiredSrc$l;
function requireSrc$l() {
  if (hasRequiredSrc$l) return src$l;
  hasRequiredSrc$l = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.FsInstrumentation = void 0;
    var instrumentation_1 = requireInstrumentation$i();
    Object.defineProperty(exports$1, "FsInstrumentation", { enumerable: true, get: function() {
      return instrumentation_1.FsInstrumentation;
    } });
  })(src$l);
  return src$l;
}
var srcExports$j = requireSrc$l();
const INTEGRATION_NAME$o = "FileSystem";
const fsIntegration = defineIntegration(
  (options = {}) => {
    return {
      name: INTEGRATION_NAME$o,
      setupOnce() {
        generateInstrumentOnce(
          INTEGRATION_NAME$o,
          () => new srcExports$j.FsInstrumentation({
            requireParentSpan: true,
            endHook(functionName, { args, span, error: error2 }) {
              span.updateName(`fs.${functionName}`);
              span.setAttributes({
                [SEMANTIC_ATTRIBUTE_SENTRY_OP]: "file",
                [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.file.fs"
              });
              if (options.recordErrorMessagesAsSpanAttributes) {
                if (typeof args[0] === "string" && FS_OPERATIONS_WITH_PATH_ARG.includes(functionName)) {
                  span.setAttribute("path_argument", args[0]);
                } else if (typeof args[0] === "string" && typeof args[1] === "string" && FS_OPERATIONS_WITH_TARGET_PATH.includes(functionName)) {
                  span.setAttribute("target_argument", args[0]);
                  span.setAttribute("path_argument", args[1]);
                } else if (typeof args[0] === "string" && FS_OPERATIONS_WITH_PREFIX.includes(functionName)) {
                  span.setAttribute("prefix_argument", args[0]);
                } else if (typeof args[0] === "string" && typeof args[1] === "string" && FS_OPERATIONS_WITH_EXISTING_PATH_NEW_PATH.includes(functionName)) {
                  span.setAttribute("existing_path_argument", args[0]);
                  span.setAttribute("new_path_argument", args[1]);
                } else if (typeof args[0] === "string" && typeof args[1] === "string" && FS_OPERATIONS_WITH_SRC_DEST.includes(functionName)) {
                  span.setAttribute("src_argument", args[0]);
                  span.setAttribute("dest_argument", args[1]);
                } else if (typeof args[0] === "string" && typeof args[1] === "string" && FS_OPERATIONS_WITH_OLD_PATH_NEW_PATH.includes(functionName)) {
                  span.setAttribute("old_path_argument", args[0]);
                  span.setAttribute("new_path_argument", args[1]);
                }
              }
              if (error2 && options.recordErrorMessagesAsSpanAttributes) {
                span.setAttribute("fs_error", error2.message);
              }
            }
          })
        )();
      }
    };
  }
);
const FS_OPERATIONS_WITH_OLD_PATH_NEW_PATH = ["rename", "renameSync"];
const FS_OPERATIONS_WITH_SRC_DEST = ["copyFile", "cp", "copyFileSync", "cpSync"];
const FS_OPERATIONS_WITH_EXISTING_PATH_NEW_PATH = ["link", "linkSync"];
const FS_OPERATIONS_WITH_PREFIX = ["mkdtemp", "mkdtempSync"];
const FS_OPERATIONS_WITH_TARGET_PATH = ["symlink", "symlinkSync"];
const FS_OPERATIONS_WITH_PATH_ARG = [
  "access",
  "appendFile",
  "chmod",
  "chown",
  "exists",
  "mkdir",
  "lchown",
  "lstat",
  "lutimes",
  "open",
  "opendir",
  "readdir",
  "readFile",
  "readlink",
  "realpath",
  "realpath.native",
  "rm",
  "rmdir",
  "stat",
  "truncate",
  "unlink",
  "utimes",
  "writeFile",
  "accessSync",
  "appendFileSync",
  "chmodSync",
  "chownSync",
  "existsSync",
  "lchownSync",
  "lstatSync",
  "lutimesSync",
  "opendirSync",
  "mkdirSync",
  "openSync",
  "readdirSync",
  "readFileSync",
  "readlinkSync",
  "realpathSync",
  "realpathSync.native",
  "rmdirSync",
  "rmSync",
  "statSync",
  "truncateSync",
  "unlinkSync",
  "utimesSync",
  "writeFileSync"
];
var src$k = {};
var instrumentation$h = {};
var ExpressLayerType = {};
var hasRequiredExpressLayerType;
function requireExpressLayerType() {
  if (hasRequiredExpressLayerType) return ExpressLayerType;
  hasRequiredExpressLayerType = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.ExpressLayerType = void 0;
    (function(ExpressLayerType2) {
      ExpressLayerType2["ROUTER"] = "router";
      ExpressLayerType2["MIDDLEWARE"] = "middleware";
      ExpressLayerType2["REQUEST_HANDLER"] = "request_handler";
    })(exports$1.ExpressLayerType || (exports$1.ExpressLayerType = {}));
  })(ExpressLayerType);
  return ExpressLayerType;
}
var AttributeNames$8 = {};
var hasRequiredAttributeNames$6;
function requireAttributeNames$6() {
  if (hasRequiredAttributeNames$6) return AttributeNames$8;
  hasRequiredAttributeNames$6 = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.AttributeNames = void 0;
    (function(AttributeNames2) {
      AttributeNames2["EXPRESS_TYPE"] = "express.type";
      AttributeNames2["EXPRESS_NAME"] = "express.name";
    })(exports$1.AttributeNames || (exports$1.AttributeNames = {}));
  })(AttributeNames$8);
  return AttributeNames$8;
}
var utils$e = {};
var internalTypes$7 = {};
var hasRequiredInternalTypes$7;
function requireInternalTypes$7() {
  if (hasRequiredInternalTypes$7) return internalTypes$7;
  hasRequiredInternalTypes$7 = 1;
  Object.defineProperty(internalTypes$7, "__esModule", { value: true });
  internalTypes$7._LAYERS_STORE_PROPERTY = internalTypes$7.kLayerPatched = void 0;
  internalTypes$7.kLayerPatched = Symbol("express-layer-patched");
  internalTypes$7._LAYERS_STORE_PROPERTY = "__ot_middlewares";
  return internalTypes$7;
}
var hasRequiredUtils$e;
function requireUtils$e() {
  if (hasRequiredUtils$e) return utils$e;
  hasRequiredUtils$e = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.getActualMatchedRoute = exports$1.getConstructedRoute = exports$1.getLayerPath = exports$1.asErrorAndMessage = exports$1.isLayerIgnored = exports$1.getLayerMetadata = exports$1.getRouterPath = exports$1.storeLayerPath = void 0;
    const ExpressLayerType_1 = requireExpressLayerType();
    const AttributeNames_1 = requireAttributeNames$6();
    const internal_types_1 = requireInternalTypes$7();
    const storeLayerPath = (request, value) => {
      if (Array.isArray(request[internal_types_1._LAYERS_STORE_PROPERTY]) === false) {
        Object.defineProperty(request, internal_types_1._LAYERS_STORE_PROPERTY, {
          enumerable: false,
          value: []
        });
      }
      if (value === void 0)
        return { isLayerPathStored: false };
      request[internal_types_1._LAYERS_STORE_PROPERTY].push(value);
      return { isLayerPathStored: true };
    };
    exports$1.storeLayerPath = storeLayerPath;
    const getRouterPath = (path, layer) => {
      const stackLayer = layer.handle?.stack?.[0];
      if (stackLayer?.route?.path) {
        return `${path}${stackLayer.route.path}`;
      }
      if (stackLayer?.handle?.stack) {
        return (0, exports$1.getRouterPath)(path, stackLayer);
      }
      return path;
    };
    exports$1.getRouterPath = getRouterPath;
    const getLayerMetadata = (route, layer, layerPath) => {
      if (layer.name === "router") {
        const maybeRouterPath = (0, exports$1.getRouterPath)("", layer);
        const extractedRouterPath = maybeRouterPath ? maybeRouterPath : layerPath || route || "/";
        return {
          attributes: {
            [AttributeNames_1.AttributeNames.EXPRESS_NAME]: extractedRouterPath,
            [AttributeNames_1.AttributeNames.EXPRESS_TYPE]: ExpressLayerType_1.ExpressLayerType.ROUTER
          },
          name: `router - ${extractedRouterPath}`
        };
      } else if (layer.name === "bound dispatch" || layer.name === "handle") {
        return {
          attributes: {
            [AttributeNames_1.AttributeNames.EXPRESS_NAME]: (route || layerPath) ?? "request handler",
            [AttributeNames_1.AttributeNames.EXPRESS_TYPE]: ExpressLayerType_1.ExpressLayerType.REQUEST_HANDLER
          },
          name: `request handler${layer.path ? ` - ${route || layerPath}` : ""}`
        };
      } else {
        return {
          attributes: {
            [AttributeNames_1.AttributeNames.EXPRESS_NAME]: layer.name,
            [AttributeNames_1.AttributeNames.EXPRESS_TYPE]: ExpressLayerType_1.ExpressLayerType.MIDDLEWARE
          },
          name: `middleware - ${layer.name}`
        };
      }
    };
    exports$1.getLayerMetadata = getLayerMetadata;
    const satisfiesPattern = (constant, pattern) => {
      if (typeof pattern === "string") {
        return pattern === constant;
      } else if (pattern instanceof RegExp) {
        return pattern.test(constant);
      } else if (typeof pattern === "function") {
        return pattern(constant);
      } else {
        throw new TypeError("Pattern is in unsupported datatype");
      }
    };
    const isLayerIgnored = (name2, type, config2) => {
      if (Array.isArray(config2?.ignoreLayersType) && config2?.ignoreLayersType?.includes(type)) {
        return true;
      }
      if (Array.isArray(config2?.ignoreLayers) === false)
        return false;
      try {
        for (const pattern of config2.ignoreLayers) {
          if (satisfiesPattern(name2, pattern)) {
            return true;
          }
        }
      } catch (e) {
      }
      return false;
    };
    exports$1.isLayerIgnored = isLayerIgnored;
    const asErrorAndMessage = (error2) => error2 instanceof Error ? [error2, error2.message] : [String(error2), String(error2)];
    exports$1.asErrorAndMessage = asErrorAndMessage;
    const getLayerPath = (args) => {
      const firstArg = args[0];
      if (Array.isArray(firstArg)) {
        return firstArg.map((arg) => extractLayerPathSegment(arg) || "").join(",");
      }
      return extractLayerPathSegment(firstArg);
    };
    exports$1.getLayerPath = getLayerPath;
    const extractLayerPathSegment = (arg) => {
      if (typeof arg === "string") {
        return arg;
      }
      if (arg instanceof RegExp || typeof arg === "number") {
        return arg.toString();
      }
      return;
    };
    function getConstructedRoute(req) {
      const layersStore = Array.isArray(req[internal_types_1._LAYERS_STORE_PROPERTY]) ? req[internal_types_1._LAYERS_STORE_PROPERTY] : [];
      const meaningfulPaths = layersStore.filter((path) => path !== "/" && path !== "/*");
      if (meaningfulPaths.length === 1 && meaningfulPaths[0] === "*") {
        return "*";
      }
      return meaningfulPaths.join("").replace(/\/{2,}/g, "/");
    }
    exports$1.getConstructedRoute = getConstructedRoute;
    function getActualMatchedRoute(req) {
      const layersStore = Array.isArray(req[internal_types_1._LAYERS_STORE_PROPERTY]) ? req[internal_types_1._LAYERS_STORE_PROPERTY] : [];
      if (layersStore.length === 0) {
        return void 0;
      }
      if (layersStore.every((path) => path === "/")) {
        return req.originalUrl === "/" ? "/" : void 0;
      }
      const constructedRoute = getConstructedRoute(req);
      if (constructedRoute === "*") {
        return constructedRoute;
      }
      if (constructedRoute.includes("/") && (constructedRoute.includes(",") || constructedRoute.includes("\\") || constructedRoute.includes("*") || constructedRoute.includes("["))) {
        return constructedRoute;
      }
      const normalizedRoute = constructedRoute.startsWith("/") ? constructedRoute : `/${constructedRoute}`;
      const isValidRoute = normalizedRoute.length > 0 && (req.originalUrl === normalizedRoute || req.originalUrl.startsWith(normalizedRoute) || isRoutePattern(normalizedRoute));
      return isValidRoute ? normalizedRoute : void 0;
    }
    exports$1.getActualMatchedRoute = getActualMatchedRoute;
    function isRoutePattern(route) {
      return route.includes(":") || route.includes("*");
    }
  })(utils$e);
  return utils$e;
}
var version$j = {};
var hasRequiredVersion$i;
function requireVersion$i() {
  if (hasRequiredVersion$i) return version$j;
  hasRequiredVersion$i = 1;
  Object.defineProperty(version$j, "__esModule", { value: true });
  version$j.PACKAGE_NAME = version$j.PACKAGE_VERSION = void 0;
  version$j.PACKAGE_VERSION = "0.59.0";
  version$j.PACKAGE_NAME = "@opentelemetry/instrumentation-express";
  return version$j;
}
var hasRequiredInstrumentation$h;
function requireInstrumentation$h() {
  if (hasRequiredInstrumentation$h) return instrumentation$h;
  hasRequiredInstrumentation$h = 1;
  Object.defineProperty(instrumentation$h, "__esModule", { value: true });
  instrumentation$h.ExpressInstrumentation = void 0;
  const core_1 = require$$1$1;
  const api_1 = require$$0$2;
  const ExpressLayerType_1 = requireExpressLayerType();
  const AttributeNames_1 = requireAttributeNames$6();
  const utils_1 = requireUtils$e();
  const version_1 = requireVersion$i();
  const instrumentation_1 = require$$2;
  const semantic_conventions_1 = require$$2$1;
  const internal_types_1 = requireInternalTypes$7();
  class ExpressInstrumentation extends instrumentation_1.InstrumentationBase {
    constructor(config2 = {}) {
      super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config2);
    }
    init() {
      return [
        new instrumentation_1.InstrumentationNodeModuleDefinition("express", [">=4.0.0 <6"], (moduleExports) => {
          const isExpressWithRouterPrototype = typeof moduleExports?.Router?.prototype?.route === "function";
          const routerProto = isExpressWithRouterPrototype ? moduleExports.Router.prototype : moduleExports.Router;
          if ((0, instrumentation_1.isWrapped)(routerProto.route)) {
            this._unwrap(routerProto, "route");
          }
          this._wrap(routerProto, "route", this._getRoutePatch());
          if ((0, instrumentation_1.isWrapped)(routerProto.use)) {
            this._unwrap(routerProto, "use");
          }
          this._wrap(routerProto, "use", this._getRouterUsePatch());
          if ((0, instrumentation_1.isWrapped)(moduleExports.application.use)) {
            this._unwrap(moduleExports.application, "use");
          }
          this._wrap(
            moduleExports.application,
            "use",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this._getAppUsePatch(isExpressWithRouterPrototype)
          );
          return moduleExports;
        }, (moduleExports) => {
          if (moduleExports === void 0)
            return;
          const isExpressWithRouterPrototype = typeof moduleExports?.Router?.prototype?.route === "function";
          const routerProto = isExpressWithRouterPrototype ? moduleExports.Router.prototype : moduleExports.Router;
          this._unwrap(routerProto, "route");
          this._unwrap(routerProto, "use");
          this._unwrap(moduleExports.application, "use");
        })
      ];
    }
    /**
     * Get the patch for Router.route function
     */
    _getRoutePatch() {
      const instrumentation2 = this;
      return function(original) {
        return function route_trace(...args) {
          const route = original.apply(this, args);
          const layer = this.stack[this.stack.length - 1];
          instrumentation2._applyPatch(layer, (0, utils_1.getLayerPath)(args));
          return route;
        };
      };
    }
    /**
     * Get the patch for Router.use function
     */
    _getRouterUsePatch() {
      const instrumentation2 = this;
      return function(original) {
        return function use(...args) {
          const route = original.apply(this, args);
          const layer = this.stack[this.stack.length - 1];
          instrumentation2._applyPatch(layer, (0, utils_1.getLayerPath)(args));
          return route;
        };
      };
    }
    /**
     * Get the patch for Application.use function
     */
    _getAppUsePatch(isExpressWithRouterPrototype) {
      const instrumentation2 = this;
      return function(original) {
        return function use(...args) {
          const router = isExpressWithRouterPrototype ? this.router : this._router;
          const route = original.apply(this, args);
          if (router) {
            const layer = router.stack[router.stack.length - 1];
            instrumentation2._applyPatch(layer, (0, utils_1.getLayerPath)(args));
          }
          return route;
        };
      };
    }
    /** Patch each express layer to create span and propagate context */
    _applyPatch(layer, layerPath) {
      const instrumentation2 = this;
      if (layer[internal_types_1.kLayerPatched] === true)
        return;
      layer[internal_types_1.kLayerPatched] = true;
      this._wrap(layer, "handle", (original) => {
        if (original.length === 4)
          return original;
        const patched = function(req, res) {
          const { isLayerPathStored } = (0, utils_1.storeLayerPath)(req, layerPath);
          const constructedRoute = (0, utils_1.getConstructedRoute)(req);
          const actualMatchedRoute = (0, utils_1.getActualMatchedRoute)(req);
          const attributes = {
            [semantic_conventions_1.ATTR_HTTP_ROUTE]: actualMatchedRoute
          };
          const metadata = (0, utils_1.getLayerMetadata)(constructedRoute, layer, layerPath);
          const type = metadata.attributes[AttributeNames_1.AttributeNames.EXPRESS_TYPE];
          const rpcMetadata = (0, core_1.getRPCMetadata)(api_1.context.active());
          if (rpcMetadata?.type === core_1.RPCType.HTTP) {
            rpcMetadata.route = actualMatchedRoute;
          }
          if ((0, utils_1.isLayerIgnored)(metadata.name, type, instrumentation2.getConfig())) {
            if (type === ExpressLayerType_1.ExpressLayerType.MIDDLEWARE) {
              req[internal_types_1._LAYERS_STORE_PROPERTY].pop();
            }
            return original.apply(this, arguments);
          }
          if (api_1.trace.getSpan(api_1.context.active()) === void 0) {
            return original.apply(this, arguments);
          }
          const spanName = instrumentation2._getSpanName({
            request: req,
            layerType: type,
            route: constructedRoute
          }, metadata.name);
          const span = instrumentation2.tracer.startSpan(spanName, {
            attributes: Object.assign(attributes, metadata.attributes)
          });
          const parentContext = api_1.context.active();
          let currentContext = api_1.trace.setSpan(parentContext, span);
          const { requestHook: requestHook2 } = instrumentation2.getConfig();
          if (requestHook2) {
            (0, instrumentation_1.safeExecuteInTheMiddle)(() => requestHook2(span, {
              request: req,
              layerType: type,
              route: constructedRoute
            }), (e) => {
              if (e) {
                api_1.diag.error("express instrumentation: request hook failed", e);
              }
            }, true);
          }
          let spanHasEnded = false;
          if (metadata.attributes[AttributeNames_1.AttributeNames.EXPRESS_TYPE] === ExpressLayerType_1.ExpressLayerType.ROUTER) {
            span.end();
            spanHasEnded = true;
            currentContext = parentContext;
          }
          const onResponseFinish = () => {
            if (spanHasEnded === false) {
              spanHasEnded = true;
              span.end();
            }
          };
          const args = Array.from(arguments);
          const callbackIdx = args.findIndex((arg) => typeof arg === "function");
          if (callbackIdx >= 0) {
            arguments[callbackIdx] = function() {
              const maybeError = arguments[0];
              const isError2 = ![void 0, null, "route", "router"].includes(maybeError);
              if (!spanHasEnded && isError2) {
                const [error2, message] = (0, utils_1.asErrorAndMessage)(maybeError);
                span.recordException(error2);
                span.setStatus({
                  code: api_1.SpanStatusCode.ERROR,
                  message
                });
              }
              if (spanHasEnded === false) {
                spanHasEnded = true;
                req.res?.removeListener("finish", onResponseFinish);
                span.end();
              }
              if (!(req.route && isError2) && isLayerPathStored) {
                req[internal_types_1._LAYERS_STORE_PROPERTY].pop();
              }
              const callback = args[callbackIdx];
              return api_1.context.bind(parentContext, callback).apply(this, arguments);
            };
          }
          try {
            return api_1.context.bind(currentContext, original).apply(this, arguments);
          } catch (anyError) {
            const [error2, message] = (0, utils_1.asErrorAndMessage)(anyError);
            span.recordException(error2);
            span.setStatus({
              code: api_1.SpanStatusCode.ERROR,
              message
            });
            throw anyError;
          } finally {
            if (!spanHasEnded) {
              res.once("finish", onResponseFinish);
            }
          }
        };
        for (const key in original) {
          Object.defineProperty(patched, key, {
            get() {
              return original[key];
            },
            set(value) {
              original[key] = value;
            }
          });
        }
        return patched;
      });
    }
    _getSpanName(info, defaultName) {
      const { spanNameHook: spanNameHook2 } = this.getConfig();
      if (!(spanNameHook2 instanceof Function)) {
        return defaultName;
      }
      try {
        return spanNameHook2(info, defaultName) ?? defaultName;
      } catch (err) {
        api_1.diag.error("express instrumentation: error calling span name rewrite hook", err);
        return defaultName;
      }
    }
  }
  instrumentation$h.ExpressInstrumentation = ExpressInstrumentation;
  return instrumentation$h;
}
var hasRequiredSrc$k;
function requireSrc$k() {
  if (hasRequiredSrc$k) return src$k;
  hasRequiredSrc$k = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.AttributeNames = exports$1.ExpressLayerType = exports$1.ExpressInstrumentation = void 0;
    var instrumentation_1 = requireInstrumentation$h();
    Object.defineProperty(exports$1, "ExpressInstrumentation", { enumerable: true, get: function() {
      return instrumentation_1.ExpressInstrumentation;
    } });
    var ExpressLayerType_1 = requireExpressLayerType();
    Object.defineProperty(exports$1, "ExpressLayerType", { enumerable: true, get: function() {
      return ExpressLayerType_1.ExpressLayerType;
    } });
    var AttributeNames_1 = requireAttributeNames$6();
    Object.defineProperty(exports$1, "AttributeNames", { enumerable: true, get: function() {
      return AttributeNames_1.AttributeNames;
    } });
  })(src$k);
  return src$k;
}
var srcExports$i = requireSrc$k();
const INTEGRATION_NAME$n = "Express";
function requestHook(span) {
  addOriginToSpan(span, "auto.http.otel.express");
  const attributes = spanToJSON(span).data;
  const type = attributes["express.type"];
  if (type) {
    span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_OP, `${type}.express`);
  }
  const name2 = attributes["express.name"];
  if (typeof name2 === "string") {
    span.updateName(name2);
  }
}
function spanNameHook(info, defaultName) {
  if (getIsolationScope() === getDefaultIsolationScope()) {
    DEBUG_BUILD$2 && debug.warn("Isolation scope is still default isolation scope - skipping setting transactionName");
    return defaultName;
  }
  if (info.layerType === "request_handler") {
    const req = info.request;
    const method = req.method ? req.method.toUpperCase() : "GET";
    getIsolationScope().setTransactionName(`${method} ${info.route}`);
  }
  return defaultName;
}
const instrumentExpress = generateInstrumentOnce(
  INTEGRATION_NAME$n,
  () => new srcExports$i.ExpressInstrumentation({
    requestHook: (span) => requestHook(span),
    spanNameHook: (info, defaultName) => spanNameHook(info, defaultName)
  })
);
const _expressIntegration = (() => {
  return {
    name: INTEGRATION_NAME$n,
    setupOnce() {
      instrumentExpress();
    }
  };
});
const expressIntegration = defineIntegration(_expressIntegration);
function expressErrorHandler(options) {
  return function sentryErrorMiddleware(error2, request, res, next) {
    const normalizedRequest = httpRequestToRequestData(request);
    getIsolationScope().setSDKProcessingMetadata({ normalizedRequest });
    const shouldHandleError = options?.shouldHandleError || defaultShouldHandleError$2;
    if (shouldHandleError(error2)) {
      const eventId = captureException(error2, { mechanism: { type: "auto.middleware.express", handled: false } });
      res.sentry = eventId;
    }
    next(error2);
  };
}
function expressRequestHandler() {
  return function sentryRequestMiddleware(request, _res, next) {
    const normalizedRequest = httpRequestToRequestData(request);
    getIsolationScope().setSDKProcessingMetadata({ normalizedRequest });
    next();
  };
}
function setupExpressErrorHandler(app2, options) {
  app2.use(expressRequestHandler());
  app2.use(expressErrorHandler(options));
  ensureIsWrapped(app2.use, "express");
}
function getStatusCodeFromResponse(error2) {
  const statusCode = error2.status || error2.statusCode || error2.status_code || error2.output?.statusCode;
  return statusCode ? parseInt(statusCode, 10) : 500;
}
function defaultShouldHandleError$2(error2) {
  const status = getStatusCodeFromResponse(error2);
  return status >= 500;
}
var otel = { exports: {} };
let NoopLogger$1 = class NoopLogger {
  emit(_logRecord) {
  }
};
const NOOP_LOGGER$1 = new NoopLogger$1();
let NoopLoggerProvider$1 = class NoopLoggerProvider {
  getLogger(_name, _version, _options) {
    return new NoopLogger$1();
  }
};
const NOOP_LOGGER_PROVIDER$1 = new NoopLoggerProvider$1();
let ProxyLogger$1 = class ProxyLogger {
  constructor(_provider, name2, version2, options) {
    this._provider = _provider;
    this.name = name2;
    this.version = version2;
    this.options = options;
  }
  /**
   * Emit a log record. This method should only be used by log appenders.
   *
   * @param logRecord
   */
  emit(logRecord) {
    this._getLogger().emit(logRecord);
  }
  /**
   * Try to get a logger from the proxy logger provider.
   * If the proxy logger provider has no delegate, return a noop logger.
   */
  _getLogger() {
    if (this._delegate) {
      return this._delegate;
    }
    const logger2 = this._provider._getDelegateLogger(this.name, this.version, this.options);
    if (!logger2) {
      return NOOP_LOGGER$1;
    }
    this._delegate = logger2;
    return this._delegate;
  }
};
let ProxyLoggerProvider$1 = class ProxyLoggerProvider {
  getLogger(name2, version2, options) {
    var _a;
    return (_a = this._getDelegateLogger(name2, version2, options)) !== null && _a !== void 0 ? _a : new ProxyLogger$1(this, name2, version2, options);
  }
  /**
   * Get the delegate logger provider.
   * Used by tests only.
   * @internal
   */
  _getDelegate() {
    var _a;
    return (_a = this._delegate) !== null && _a !== void 0 ? _a : NOOP_LOGGER_PROVIDER$1;
  }
  /**
   * Set the delegate logger provider
   * @internal
   */
  _setDelegate(delegate) {
    this._delegate = delegate;
  }
  /**
   * @internal
   */
  _getDelegateLogger(name2, version2, options) {
    var _a;
    return (_a = this._delegate) === null || _a === void 0 ? void 0 : _a.getLogger(name2, version2, options);
  }
};
const _globalThis$1 = typeof globalThis === "object" ? globalThis : global;
const GLOBAL_LOGS_API_KEY$1 = Symbol.for("io.opentelemetry.js.api.logs");
const _global$1 = _globalThis$1;
function makeGetter$1(requiredVersion, instance, fallback) {
  return (version2) => version2 === requiredVersion ? instance : fallback;
}
const API_BACKWARDS_COMPATIBILITY_VERSION$1 = 1;
let LogsAPI$1 = class LogsAPI {
  constructor() {
    this._proxyLoggerProvider = new ProxyLoggerProvider$1();
  }
  static getInstance() {
    if (!this._instance) {
      this._instance = new LogsAPI();
    }
    return this._instance;
  }
  setGlobalLoggerProvider(provider) {
    if (_global$1[GLOBAL_LOGS_API_KEY$1]) {
      return this.getLoggerProvider();
    }
    _global$1[GLOBAL_LOGS_API_KEY$1] = makeGetter$1(API_BACKWARDS_COMPATIBILITY_VERSION$1, provider, NOOP_LOGGER_PROVIDER$1);
    this._proxyLoggerProvider._setDelegate(provider);
    return provider;
  }
  /**
   * Returns the global logger provider.
   *
   * @returns LoggerProvider
   */
  getLoggerProvider() {
    var _a, _b;
    return (_b = (_a = _global$1[GLOBAL_LOGS_API_KEY$1]) === null || _a === void 0 ? void 0 : _a.call(_global$1, API_BACKWARDS_COMPATIBILITY_VERSION$1)) !== null && _b !== void 0 ? _b : this._proxyLoggerProvider;
  }
  /**
   * Returns a logger from the global logger provider.
   *
   * @returns Logger
   */
  getLogger(name2, version2, options) {
    return this.getLoggerProvider().getLogger(name2, version2, options);
  }
  /** Remove the global logger provider */
  disable() {
    delete _global$1[GLOBAL_LOGS_API_KEY$1];
    this._proxyLoggerProvider = new ProxyLoggerProvider$1();
  }
};
const logs$1 = LogsAPI$1.getInstance();
function enableInstrumentations(instrumentations, tracerProvider, meterProvider, loggerProvider) {
  for (let i = 0, j = instrumentations.length; i < j; i++) {
    const instrumentation2 = instrumentations[i];
    if (tracerProvider) {
      instrumentation2.setTracerProvider(tracerProvider);
    }
    if (meterProvider) {
      instrumentation2.setMeterProvider(meterProvider);
    }
    if (loggerProvider && instrumentation2.setLoggerProvider) {
      instrumentation2.setLoggerProvider(loggerProvider);
    }
    if (!instrumentation2.getConfig().enabled) {
      instrumentation2.enable();
    }
  }
}
function disableInstrumentations(instrumentations) {
  instrumentations.forEach((instrumentation2) => instrumentation2.disable());
}
function registerInstrumentations(options) {
  const tracerProvider = options.tracerProvider || trace.getTracerProvider();
  const meterProvider = options.meterProvider || metrics.getMeterProvider();
  const loggerProvider = options.loggerProvider || logs$1.getLoggerProvider();
  const instrumentations = options.instrumentations?.flat() ?? [];
  enableInstrumentations(instrumentations, tracerProvider, meterProvider, loggerProvider);
  return () => {
    disableInstrumentations(instrumentations);
  };
}
const VERSION_REGEXP$1 = /^(?:v)?(?<version>(?<major>0|[1-9]\d*)\.(?<minor>0|[1-9]\d*)\.(?<patch>0|[1-9]\d*))(?:-(?<prerelease>(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+(?<build>[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
const RANGE_REGEXP$1 = /^(?<op><|>|=|==|<=|>=|~|\^|~>)?\s*(?:v)?(?<version>(?<major>x|X|\*|0|[1-9]\d*)(?:\.(?<minor>x|X|\*|0|[1-9]\d*))?(?:\.(?<patch>x|X|\*|0|[1-9]\d*))?)(?:-(?<prerelease>(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+(?<build>[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
const operatorResMap$1 = {
  ">": [1],
  ">=": [0, 1],
  "=": [0],
  "<=": [-1, 0],
  "<": [-1],
  "!=": [-1, 1]
};
function satisfies$1(version2, range, options) {
  if (!_validateVersion$1(version2)) {
    diag.error(`Invalid version: ${version2}`);
    return false;
  }
  if (!range) {
    return true;
  }
  range = range.replace(/([<>=~^]+)\s+/g, "$1");
  const parsedVersion = _parseVersion$1(version2);
  if (!parsedVersion) {
    return false;
  }
  const allParsedRanges = [];
  const checkResult = _doSatisfies$1(parsedVersion, range, allParsedRanges, options);
  if (checkResult && !options?.includePrerelease) {
    return _doPreleaseCheck$1(parsedVersion, allParsedRanges);
  }
  return checkResult;
}
function _validateVersion$1(version2) {
  return typeof version2 === "string" && VERSION_REGEXP$1.test(version2);
}
function _doSatisfies$1(parsedVersion, range, allParsedRanges, options) {
  if (range.includes("||")) {
    const ranges = range.trim().split("||");
    for (const r of ranges) {
      if (_checkRange$1(parsedVersion, r, allParsedRanges, options)) {
        return true;
      }
    }
    return false;
  } else if (range.includes(" - ")) {
    range = replaceHyphen$1(range, options);
  } else if (range.includes(" ")) {
    const ranges = range.trim().replace(/\s{2,}/g, " ").split(" ");
    for (const r of ranges) {
      if (!_checkRange$1(parsedVersion, r, allParsedRanges, options)) {
        return false;
      }
    }
    return true;
  }
  return _checkRange$1(parsedVersion, range, allParsedRanges, options);
}
function _checkRange$1(parsedVersion, range, allParsedRanges, options) {
  range = _normalizeRange$1(range, options);
  if (range.includes(" ")) {
    return _doSatisfies$1(parsedVersion, range, allParsedRanges, options);
  } else {
    const parsedRange = _parseRange$1(range);
    allParsedRanges.push(parsedRange);
    return _satisfies$1(parsedVersion, parsedRange);
  }
}
function _satisfies$1(parsedVersion, parsedRange) {
  if (parsedRange.invalid) {
    return false;
  }
  if (!parsedRange.version || _isWildcard$1(parsedRange.version)) {
    return true;
  }
  let comparisonResult = _compareVersionSegments$1(parsedVersion.versionSegments || [], parsedRange.versionSegments || []);
  if (comparisonResult === 0) {
    const versionPrereleaseSegments = parsedVersion.prereleaseSegments || [];
    const rangePrereleaseSegments = parsedRange.prereleaseSegments || [];
    if (!versionPrereleaseSegments.length && !rangePrereleaseSegments.length) {
      comparisonResult = 0;
    } else if (!versionPrereleaseSegments.length && rangePrereleaseSegments.length) {
      comparisonResult = 1;
    } else if (versionPrereleaseSegments.length && !rangePrereleaseSegments.length) {
      comparisonResult = -1;
    } else {
      comparisonResult = _compareVersionSegments$1(versionPrereleaseSegments, rangePrereleaseSegments);
    }
  }
  return operatorResMap$1[parsedRange.op]?.includes(comparisonResult);
}
function _doPreleaseCheck$1(parsedVersion, allParsedRanges) {
  if (parsedVersion.prerelease) {
    return allParsedRanges.some((r) => r.prerelease && r.version === parsedVersion.version);
  }
  return true;
}
function _normalizeRange$1(range, options) {
  range = range.trim();
  range = replaceCaret$1(range, options);
  range = replaceTilde$1(range);
  range = replaceXRange$1(range, options);
  range = range.trim();
  return range;
}
function isX$1(id) {
  return !id || id.toLowerCase() === "x" || id === "*";
}
function _parseVersion$1(versionString) {
  const match = versionString.match(VERSION_REGEXP$1);
  if (!match) {
    diag.error(`Invalid version: ${versionString}`);
    return void 0;
  }
  const version2 = match.groups.version;
  const prerelease = match.groups.prerelease;
  const build = match.groups.build;
  const versionSegments = version2.split(".");
  const prereleaseSegments = prerelease?.split(".");
  return {
    op: void 0,
    version: version2,
    versionSegments,
    versionSegmentCount: versionSegments.length,
    prerelease,
    prereleaseSegments,
    prereleaseSegmentCount: prereleaseSegments ? prereleaseSegments.length : 0,
    build
  };
}
function _parseRange$1(rangeString) {
  if (!rangeString) {
    return {};
  }
  const match = rangeString.match(RANGE_REGEXP$1);
  if (!match) {
    diag.error(`Invalid range: ${rangeString}`);
    return {
      invalid: true
    };
  }
  let op = match.groups.op;
  const version2 = match.groups.version;
  const prerelease = match.groups.prerelease;
  const build = match.groups.build;
  const versionSegments = version2.split(".");
  const prereleaseSegments = prerelease?.split(".");
  if (op === "==") {
    op = "=";
  }
  return {
    op: op || "=",
    version: version2,
    versionSegments,
    versionSegmentCount: versionSegments.length,
    prerelease,
    prereleaseSegments,
    prereleaseSegmentCount: prereleaseSegments ? prereleaseSegments.length : 0,
    build
  };
}
function _isWildcard$1(s) {
  return s === "*" || s === "x" || s === "X";
}
function _parseVersionString$1(v) {
  const n = parseInt(v, 10);
  return isNaN(n) ? v : n;
}
function _normalizeVersionType$1(a, b) {
  if (typeof a === typeof b) {
    if (typeof a === "number") {
      return [a, b];
    } else if (typeof a === "string") {
      return [a, b];
    } else {
      throw new Error("Version segments can only be strings or numbers");
    }
  } else {
    return [String(a), String(b)];
  }
}
function _compareVersionStrings$1(v1, v2) {
  if (_isWildcard$1(v1) || _isWildcard$1(v2)) {
    return 0;
  }
  const [parsedV1, parsedV2] = _normalizeVersionType$1(_parseVersionString$1(v1), _parseVersionString$1(v2));
  if (parsedV1 > parsedV2) {
    return 1;
  } else if (parsedV1 < parsedV2) {
    return -1;
  }
  return 0;
}
function _compareVersionSegments$1(v1, v2) {
  for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
    const res = _compareVersionStrings$1(v1[i] || "0", v2[i] || "0");
    if (res !== 0) {
      return res;
    }
  }
  return 0;
}
const LETTERDASHNUMBER$1 = "[a-zA-Z0-9-]";
const NUMERICIDENTIFIER$1 = "0|[1-9]\\d*";
const NONNUMERICIDENTIFIER$1 = `\\d*[a-zA-Z-]${LETTERDASHNUMBER$1}*`;
const GTLT$1 = "((?:<|>)?=?)";
const PRERELEASEIDENTIFIER$1 = `(?:${NUMERICIDENTIFIER$1}|${NONNUMERICIDENTIFIER$1})`;
const PRERELEASE$1 = `(?:-(${PRERELEASEIDENTIFIER$1}(?:\\.${PRERELEASEIDENTIFIER$1})*))`;
const BUILDIDENTIFIER$1 = `${LETTERDASHNUMBER$1}+`;
const BUILD$1 = `(?:\\+(${BUILDIDENTIFIER$1}(?:\\.${BUILDIDENTIFIER$1})*))`;
const XRANGEIDENTIFIER$1 = `${NUMERICIDENTIFIER$1}|x|X|\\*`;
const XRANGEPLAIN$1 = `[v=\\s]*(${XRANGEIDENTIFIER$1})(?:\\.(${XRANGEIDENTIFIER$1})(?:\\.(${XRANGEIDENTIFIER$1})(?:${PRERELEASE$1})?${BUILD$1}?)?)?`;
const XRANGE$1 = `^${GTLT$1}\\s*${XRANGEPLAIN$1}$`;
const XRANGE_REGEXP$1 = new RegExp(XRANGE$1);
const HYPHENRANGE$1 = `^\\s*(${XRANGEPLAIN$1})\\s+-\\s+(${XRANGEPLAIN$1})\\s*$`;
const HYPHENRANGE_REGEXP$1 = new RegExp(HYPHENRANGE$1);
const LONETILDE$1 = "(?:~>?)";
const TILDE$1 = `^${LONETILDE$1}${XRANGEPLAIN$1}$`;
const TILDE_REGEXP$1 = new RegExp(TILDE$1);
const LONECARET$1 = "(?:\\^)";
const CARET$1 = `^${LONECARET$1}${XRANGEPLAIN$1}$`;
const CARET_REGEXP$1 = new RegExp(CARET$1);
function replaceTilde$1(comp) {
  const r = TILDE_REGEXP$1;
  return comp.replace(r, (_, M, m, p, pr) => {
    let ret;
    if (isX$1(M)) {
      ret = "";
    } else if (isX$1(m)) {
      ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
    } else if (isX$1(p)) {
      ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
    } else if (pr) {
      ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
    } else {
      ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
    }
    return ret;
  });
}
function replaceCaret$1(comp, options) {
  const r = CARET_REGEXP$1;
  const z = options?.includePrerelease ? "-0" : "";
  return comp.replace(r, (_, M, m, p, pr) => {
    let ret;
    if (isX$1(M)) {
      ret = "";
    } else if (isX$1(m)) {
      ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
    } else if (isX$1(p)) {
      if (M === "0") {
        ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
      } else {
        ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
      }
    } else if (pr) {
      if (M === "0") {
        if (m === "0") {
          ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
        } else {
          ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
        }
      } else {
        ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
      }
    } else {
      if (M === "0") {
        if (m === "0") {
          ret = `>=${M}.${m}.${p}${z} <${M}.${m}.${+p + 1}-0`;
        } else {
          ret = `>=${M}.${m}.${p}${z} <${M}.${+m + 1}.0-0`;
        }
      } else {
        ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
      }
    }
    return ret;
  });
}
function replaceXRange$1(comp, options) {
  const r = XRANGE_REGEXP$1;
  return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
    const xM = isX$1(M);
    const xm = xM || isX$1(m);
    const xp = xm || isX$1(p);
    const anyX = xp;
    if (gtlt === "=" && anyX) {
      gtlt = "";
    }
    pr = options?.includePrerelease ? "-0" : "";
    if (xM) {
      if (gtlt === ">" || gtlt === "<") {
        ret = "<0.0.0-0";
      } else {
        ret = "*";
      }
    } else if (gtlt && anyX) {
      if (xm) {
        m = 0;
      }
      p = 0;
      if (gtlt === ">") {
        gtlt = ">=";
        if (xm) {
          M = +M + 1;
          m = 0;
          p = 0;
        } else {
          m = +m + 1;
          p = 0;
        }
      } else if (gtlt === "<=") {
        gtlt = "<";
        if (xm) {
          M = +M + 1;
        } else {
          m = +m + 1;
        }
      }
      if (gtlt === "<") {
        pr = "-0";
      }
      ret = `${gtlt + M}.${m}.${p}${pr}`;
    } else if (xm) {
      ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
    } else if (xp) {
      ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
    }
    return ret;
  });
}
function replaceHyphen$1(comp, options) {
  const r = HYPHENRANGE_REGEXP$1;
  return comp.replace(r, (_, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr) => {
    if (isX$1(fM)) {
      from = "";
    } else if (isX$1(fm)) {
      from = `>=${fM}.0.0${options?.includePrerelease ? "-0" : ""}`;
    } else if (isX$1(fp)) {
      from = `>=${fM}.${fm}.0${options?.includePrerelease ? "-0" : ""}`;
    } else if (fpr) {
      from = `>=${from}`;
    } else {
      from = `>=${from}${options?.includePrerelease ? "-0" : ""}`;
    }
    if (isX$1(tM)) {
      to = "";
    } else if (isX$1(tm)) {
      to = `<${+tM + 1}.0.0-0`;
    } else if (isX$1(tp)) {
      to = `<${tM}.${+tm + 1}.0-0`;
    } else if (tpr) {
      to = `<=${tM}.${tm}.${tp}-${tpr}`;
    } else if (options?.includePrerelease) {
      to = `<${tM}.${tm}.${+tp + 1}-0`;
    } else {
      to = `<=${to}`;
    }
    return `${from} ${to}`.trim();
  });
}
let logger$1 = console.error.bind(console);
function defineProperty$1(obj, name2, value) {
  const enumerable = !!obj[name2] && Object.prototype.propertyIsEnumerable.call(obj, name2);
  Object.defineProperty(obj, name2, {
    configurable: true,
    enumerable,
    writable: true,
    value
  });
}
const wrap$1 = (nodule, name2, wrapper) => {
  if (!nodule || !nodule[name2]) {
    logger$1("no original function " + String(name2) + " to wrap");
    return;
  }
  if (!wrapper) {
    logger$1("no wrapper function");
    logger$1(new Error().stack);
    return;
  }
  const original = nodule[name2];
  if (typeof original !== "function" || typeof wrapper !== "function") {
    logger$1("original object and wrapper must be functions");
    return;
  }
  const wrapped = wrapper(original, name2);
  defineProperty$1(wrapped, "__original", original);
  defineProperty$1(wrapped, "__unwrap", () => {
    if (nodule[name2] === wrapped) {
      defineProperty$1(nodule, name2, original);
    }
  });
  defineProperty$1(wrapped, "__wrapped", true);
  defineProperty$1(nodule, name2, wrapped);
  return wrapped;
};
const massWrap$1 = (nodules, names, wrapper) => {
  if (!nodules) {
    logger$1("must provide one or more modules to patch");
    logger$1(new Error().stack);
    return;
  } else if (!Array.isArray(nodules)) {
    nodules = [nodules];
  }
  if (!(names && Array.isArray(names))) {
    logger$1("must provide one or more functions to wrap on modules");
    return;
  }
  nodules.forEach((nodule) => {
    names.forEach((name2) => {
      wrap$1(nodule, name2, wrapper);
    });
  });
};
const unwrap$1 = (nodule, name2) => {
  if (!nodule || !nodule[name2]) {
    logger$1("no function to unwrap.");
    logger$1(new Error().stack);
    return;
  }
  const wrapped = nodule[name2];
  if (!wrapped.__unwrap) {
    logger$1("no original to unwrap to -- has " + String(name2) + " already been unwrapped?");
  } else {
    wrapped.__unwrap();
    return;
  }
};
const massUnwrap$1 = (nodules, names) => {
  if (!nodules) {
    logger$1("must provide one or more modules to patch");
    logger$1(new Error().stack);
    return;
  } else if (!Array.isArray(nodules)) {
    nodules = [nodules];
  }
  if (!(names && Array.isArray(names))) {
    logger$1("must provide one or more functions to unwrap on modules");
    return;
  }
  nodules.forEach((nodule) => {
    names.forEach((name2) => {
      unwrap$1(nodule, name2);
    });
  });
};
let InstrumentationAbstract$1 = class InstrumentationAbstract {
  instrumentationName;
  instrumentationVersion;
  _config = {};
  _tracer;
  _meter;
  _logger;
  _diag;
  constructor(instrumentationName, instrumentationVersion, config2) {
    this.instrumentationName = instrumentationName;
    this.instrumentationVersion = instrumentationVersion;
    this.setConfig(config2);
    this._diag = diag.createComponentLogger({
      namespace: instrumentationName
    });
    this._tracer = trace.getTracer(instrumentationName, instrumentationVersion);
    this._meter = metrics.getMeter(instrumentationName, instrumentationVersion);
    this._logger = logs$1.getLogger(instrumentationName, instrumentationVersion);
    this._updateMetricInstruments();
  }
  /* Api to wrap instrumented method */
  _wrap = wrap$1;
  /* Api to unwrap instrumented methods */
  _unwrap = unwrap$1;
  /* Api to mass wrap instrumented method */
  _massWrap = massWrap$1;
  /* Api to mass unwrap instrumented methods */
  _massUnwrap = massUnwrap$1;
  /* Returns meter */
  get meter() {
    return this._meter;
  }
  /**
   * Sets MeterProvider to this plugin
   * @param meterProvider
   */
  setMeterProvider(meterProvider) {
    this._meter = meterProvider.getMeter(this.instrumentationName, this.instrumentationVersion);
    this._updateMetricInstruments();
  }
  /* Returns logger */
  get logger() {
    return this._logger;
  }
  /**
   * Sets LoggerProvider to this plugin
   * @param loggerProvider
   */
  setLoggerProvider(loggerProvider) {
    this._logger = loggerProvider.getLogger(this.instrumentationName, this.instrumentationVersion);
  }
  /**
   * @experimental
   *
   * Get module definitions defined by {@link init}.
   * This can be used for experimental compile-time instrumentation.
   *
   * @returns an array of {@link InstrumentationModuleDefinition}
   */
  getModuleDefinitions() {
    const initResult = this.init() ?? [];
    if (!Array.isArray(initResult)) {
      return [initResult];
    }
    return initResult;
  }
  /**
   * Sets the new metric instruments with the current Meter.
   */
  _updateMetricInstruments() {
    return;
  }
  /* Returns InstrumentationConfig */
  getConfig() {
    return this._config;
  }
  /**
   * Sets InstrumentationConfig to this plugin
   * @param config
   */
  setConfig(config2) {
    this._config = {
      enabled: true,
      ...config2
    };
  }
  /**
   * Sets TraceProvider to this plugin
   * @param tracerProvider
   */
  setTracerProvider(tracerProvider) {
    this._tracer = tracerProvider.getTracer(this.instrumentationName, this.instrumentationVersion);
  }
  /* Returns tracer */
  get tracer() {
    return this._tracer;
  }
  /**
   * Execute span customization hook, if configured, and log any errors.
   * Any semantics of the trigger and info are defined by the specific instrumentation.
   * @param hookHandler The optional hook handler which the user has configured via instrumentation config
   * @param triggerName The name of the trigger for executing the hook for logging purposes
   * @param span The span to which the hook should be applied
   * @param info The info object to be passed to the hook, with useful data the hook may use
   */
  _runSpanCustomizationHook(hookHandler, triggerName, span, info) {
    if (!hookHandler) {
      return;
    }
    try {
      hookHandler(span, info);
    } catch (e) {
      this._diag.error(`Error running span customization hook due to exception in handler`, { triggerName }, e);
    }
  }
};
const ModuleNameSeparator$1 = "/";
let ModuleNameTrieNode$1 = class ModuleNameTrieNode {
  hooks = [];
  children = /* @__PURE__ */ new Map();
};
let ModuleNameTrie$1 = class ModuleNameTrie {
  _trie = new ModuleNameTrieNode$1();
  _counter = 0;
  /**
   * Insert a module hook into the trie
   *
   * @param {Hooked} hook Hook
   */
  insert(hook) {
    let trieNode = this._trie;
    for (const moduleNamePart of hook.moduleName.split(ModuleNameSeparator$1)) {
      let nextNode = trieNode.children.get(moduleNamePart);
      if (!nextNode) {
        nextNode = new ModuleNameTrieNode$1();
        trieNode.children.set(moduleNamePart, nextNode);
      }
      trieNode = nextNode;
    }
    trieNode.hooks.push({ hook, insertedId: this._counter++ });
  }
  /**
   * Search for matching hooks in the trie
   *
   * @param {string} moduleName Module name
   * @param {boolean} maintainInsertionOrder Whether to return the results in insertion order
   * @param {boolean} fullOnly Whether to return only full matches
   * @returns {Hooked[]} Matching hooks
   */
  search(moduleName, { maintainInsertionOrder, fullOnly } = {}) {
    let trieNode = this._trie;
    const results = [];
    let foundFull = true;
    for (const moduleNamePart of moduleName.split(ModuleNameSeparator$1)) {
      const nextNode = trieNode.children.get(moduleNamePart);
      if (!nextNode) {
        foundFull = false;
        break;
      }
      if (!fullOnly) {
        results.push(...nextNode.hooks);
      }
      trieNode = nextNode;
    }
    if (fullOnly && foundFull) {
      results.push(...trieNode.hooks);
    }
    if (results.length === 0) {
      return [];
    }
    if (results.length === 1) {
      return [results[0].hook];
    }
    if (maintainInsertionOrder) {
      results.sort((a, b) => a.insertedId - b.insertedId);
    }
    return results.map(({ hook }) => hook);
  }
};
const isMocha$1 = [
  "afterEach",
  "after",
  "beforeEach",
  "before",
  "describe",
  "it"
].every((fn) => {
  return typeof global[fn] === "function";
});
let RequireInTheMiddleSingleton$1 = class RequireInTheMiddleSingleton {
  _moduleNameTrie = new ModuleNameTrie$1();
  static _instance;
  constructor() {
    this._initialize();
  }
  _initialize() {
    new requireInTheMiddleExports.Hook(
      // Intercept all `require` calls; we will filter the matching ones below
      null,
      { internals: true },
      (exports$1, name2, basedir) => {
        const normalizedModuleName = normalizePathSeparators$1(name2);
        const matches = this._moduleNameTrie.search(normalizedModuleName, {
          maintainInsertionOrder: true,
          // For core modules (e.g. `fs`), do not match on sub-paths (e.g. `fs/promises').
          // This matches the behavior of `require-in-the-middle`.
          // `basedir` is always `undefined` for core modules.
          fullOnly: basedir === void 0
        });
        for (const { onRequire } of matches) {
          exports$1 = onRequire(exports$1, name2, basedir);
        }
        return exports$1;
      }
    );
  }
  /**
   * Register a hook with `require-in-the-middle`
   *
   * @param {string} moduleName Module name
   * @param {OnRequireFn} onRequire Hook function
   * @returns {Hooked} Registered hook
   */
  register(moduleName, onRequire) {
    const hooked = { moduleName, onRequire };
    this._moduleNameTrie.insert(hooked);
    return hooked;
  }
  /**
   * Get the `RequireInTheMiddleSingleton` singleton
   *
   * @returns {RequireInTheMiddleSingleton} Singleton of `RequireInTheMiddleSingleton`
   */
  static getInstance() {
    if (isMocha$1)
      return new RequireInTheMiddleSingleton();
    return this._instance = this._instance ?? new RequireInTheMiddleSingleton();
  }
};
function normalizePathSeparators$1(moduleNameOrPath) {
  return require$$0.sep !== ModuleNameSeparator$1 ? moduleNameOrPath.split(require$$0.sep).join(ModuleNameSeparator$1) : moduleNameOrPath;
}
function safeExecuteInTheMiddle(execute, onFinish, preventThrowingError) {
  let error2;
  let result;
  try {
    result = execute();
  } catch (e) {
    error2 = e;
  } finally {
    onFinish(error2, result);
    if (error2 && !preventThrowingError) {
      throw error2;
    }
    return result;
  }
}
async function safeExecuteInTheMiddleAsync(execute, onFinish, preventThrowingError) {
  let error2;
  let result;
  try {
    result = await execute();
  } catch (e) {
    error2 = e;
  } finally {
    await onFinish(error2, result);
    if (error2 && !preventThrowingError) {
      throw error2;
    }
    return result;
  }
}
function isWrapped$1(func) {
  return typeof func === "function" && typeof func.__original === "function" && typeof func.__unwrap === "function" && func.__wrapped === true;
}
let InstrumentationBase$1 = class InstrumentationBase extends InstrumentationAbstract$1 {
  _modules;
  _hooks = [];
  _requireInTheMiddleSingleton = RequireInTheMiddleSingleton$1.getInstance();
  _enabled = false;
  constructor(instrumentationName, instrumentationVersion, config2) {
    super(instrumentationName, instrumentationVersion, config2);
    let modules = this.init();
    if (modules && !Array.isArray(modules)) {
      modules = [modules];
    }
    this._modules = modules || [];
    if (this._config.enabled) {
      this.enable();
    }
  }
  _wrap = (moduleExports, name2, wrapper) => {
    if (isWrapped$1(moduleExports[name2])) {
      this._unwrap(moduleExports, name2);
    }
    if (!types$3.isProxy(moduleExports)) {
      return wrap$1(moduleExports, name2, wrapper);
    } else {
      const wrapped = wrap$1(Object.assign({}, moduleExports), name2, wrapper);
      Object.defineProperty(moduleExports, name2, {
        value: wrapped
      });
      return wrapped;
    }
  };
  _unwrap = (moduleExports, name2) => {
    if (!types$3.isProxy(moduleExports)) {
      return unwrap$1(moduleExports, name2);
    } else {
      return Object.defineProperty(moduleExports, name2, {
        value: moduleExports[name2]
      });
    }
  };
  _massWrap = (moduleExportsArray, names, wrapper) => {
    if (!moduleExportsArray) {
      diag.error("must provide one or more modules to patch");
      return;
    } else if (!Array.isArray(moduleExportsArray)) {
      moduleExportsArray = [moduleExportsArray];
    }
    if (!(names && Array.isArray(names))) {
      diag.error("must provide one or more functions to wrap on modules");
      return;
    }
    moduleExportsArray.forEach((moduleExports) => {
      names.forEach((name2) => {
        this._wrap(moduleExports, name2, wrapper);
      });
    });
  };
  _massUnwrap = (moduleExportsArray, names) => {
    if (!moduleExportsArray) {
      diag.error("must provide one or more modules to patch");
      return;
    } else if (!Array.isArray(moduleExportsArray)) {
      moduleExportsArray = [moduleExportsArray];
    }
    if (!(names && Array.isArray(names))) {
      diag.error("must provide one or more functions to wrap on modules");
      return;
    }
    moduleExportsArray.forEach((moduleExports) => {
      names.forEach((name2) => {
        this._unwrap(moduleExports, name2);
      });
    });
  };
  _warnOnPreloadedModules() {
    this._modules.forEach((module2) => {
      const { name: name2 } = module2;
      try {
        const resolvedModule = require.resolve(name2);
        if (require.cache[resolvedModule]) {
          this._diag.warn(`Module ${name2} has been loaded before ${this.instrumentationName} so it might not work, please initialize it before requiring ${name2}`);
        }
      } catch {
      }
    });
  }
  _extractPackageVersion(baseDir) {
    try {
      const json = readFileSync$1(require$$0.join(baseDir, "package.json"), {
        encoding: "utf8"
      });
      const version2 = JSON.parse(json).version;
      return typeof version2 === "string" ? version2 : void 0;
    } catch {
      diag.warn("Failed extracting version", baseDir);
    }
    return void 0;
  }
  _onRequire(module2, exports$1, name2, baseDir) {
    if (!baseDir) {
      if (typeof module2.patch === "function") {
        module2.moduleExports = exports$1;
        if (this._enabled) {
          this._diag.debug("Applying instrumentation patch for nodejs core module on require hook", {
            module: module2.name
          });
          return module2.patch(exports$1);
        }
      }
      return exports$1;
    }
    const version2 = this._extractPackageVersion(baseDir);
    module2.moduleVersion = version2;
    if (module2.name === name2) {
      if (isSupported$1(module2.supportedVersions, version2, module2.includePrerelease)) {
        if (typeof module2.patch === "function") {
          module2.moduleExports = exports$1;
          if (this._enabled) {
            this._diag.debug("Applying instrumentation patch for module on require hook", {
              module: module2.name,
              version: module2.moduleVersion,
              baseDir
            });
            return module2.patch(exports$1, module2.moduleVersion);
          }
        }
      }
      return exports$1;
    }
    const files = module2.files ?? [];
    const normalizedName = require$$0.normalize(name2);
    const supportedFileInstrumentations = files.filter((f) => f.name === normalizedName).filter((f) => isSupported$1(f.supportedVersions, version2, module2.includePrerelease));
    return supportedFileInstrumentations.reduce((patchedExports, file) => {
      file.moduleExports = patchedExports;
      if (this._enabled) {
        this._diag.debug("Applying instrumentation patch for nodejs module file on require hook", {
          module: module2.name,
          version: module2.moduleVersion,
          fileName: file.name,
          baseDir
        });
        return file.patch(patchedExports, module2.moduleVersion);
      }
      return patchedExports;
    }, exports$1);
  }
  enable() {
    if (this._enabled) {
      return;
    }
    this._enabled = true;
    if (this._hooks.length > 0) {
      for (const module2 of this._modules) {
        if (typeof module2.patch === "function" && module2.moduleExports) {
          this._diag.debug("Applying instrumentation patch for nodejs module on instrumentation enabled", {
            module: module2.name,
            version: module2.moduleVersion
          });
          module2.patch(module2.moduleExports, module2.moduleVersion);
        }
        for (const file of module2.files) {
          if (file.moduleExports) {
            this._diag.debug("Applying instrumentation patch for nodejs module file on instrumentation enabled", {
              module: module2.name,
              version: module2.moduleVersion,
              fileName: file.name
            });
            file.patch(file.moduleExports, module2.moduleVersion);
          }
        }
      }
      return;
    }
    this._warnOnPreloadedModules();
    for (const module2 of this._modules) {
      const hookFn = (exports$1, name2, baseDir) => {
        if (!baseDir && require$$0.isAbsolute(name2)) {
          const parsedPath = require$$0.parse(name2);
          name2 = parsedPath.name;
          baseDir = parsedPath.dir;
        }
        return this._onRequire(module2, exports$1, name2, baseDir);
      };
      const onRequire = (exports$1, name2, baseDir) => {
        return this._onRequire(module2, exports$1, name2, baseDir);
      };
      const hook = require$$0.isAbsolute(module2.name) ? new requireInTheMiddleExports.Hook([module2.name], { internals: true }, onRequire) : this._requireInTheMiddleSingleton.register(module2.name, onRequire);
      this._hooks.push(hook);
      const esmHook = new importInTheMiddleExports.Hook([module2.name], { internals: false }, hookFn);
      this._hooks.push(esmHook);
    }
  }
  disable() {
    if (!this._enabled) {
      return;
    }
    this._enabled = false;
    for (const module2 of this._modules) {
      if (typeof module2.unpatch === "function" && module2.moduleExports) {
        this._diag.debug("Removing instrumentation patch for nodejs module on instrumentation disabled", {
          module: module2.name,
          version: module2.moduleVersion
        });
        module2.unpatch(module2.moduleExports, module2.moduleVersion);
      }
      for (const file of module2.files) {
        if (file.moduleExports) {
          this._diag.debug("Removing instrumentation patch for nodejs module file on instrumentation disabled", {
            module: module2.name,
            version: module2.moduleVersion,
            fileName: file.name
          });
          file.unpatch(file.moduleExports, module2.moduleVersion);
        }
      }
    }
  }
  isEnabled() {
    return this._enabled;
  }
};
function isSupported$1(supportedVersions2, version2, includePrerelease) {
  if (typeof version2 === "undefined") {
    return supportedVersions2.includes("*");
  }
  return supportedVersions2.some((supportedVersion) => {
    return satisfies$1(version2, supportedVersion, { includePrerelease });
  });
}
let InstrumentationNodeModuleDefinition$1 = class InstrumentationNodeModuleDefinition {
  name;
  supportedVersions;
  patch;
  unpatch;
  files;
  constructor(name2, supportedVersions2, patch, unpatch, files) {
    this.name = name2;
    this.supportedVersions = supportedVersions2;
    this.patch = patch;
    this.unpatch = unpatch;
    this.files = files || [];
  }
};
class InstrumentationNodeModuleFile {
  supportedVersions;
  patch;
  unpatch;
  name;
  constructor(name2, supportedVersions2, patch, unpatch) {
    this.supportedVersions = supportedVersions2;
    this.patch = patch;
    this.unpatch = unpatch;
    this.name = normalize$1(name2);
  }
}
var SemconvStability;
(function(SemconvStability2) {
  SemconvStability2[SemconvStability2["STABLE"] = 1] = "STABLE";
  SemconvStability2[SemconvStability2["OLD"] = 2] = "OLD";
  SemconvStability2[SemconvStability2["DUPLICATE"] = 3] = "DUPLICATE";
})(SemconvStability || (SemconvStability = {}));
function semconvStabilityFromStr(namespace, str) {
  let semconvStability = SemconvStability.OLD;
  const entries = str?.split(",").map((v) => v.trim()).filter((s) => s !== "");
  for (const entry of entries ?? []) {
    if (entry.toLowerCase() === namespace + "/dup") {
      semconvStability = SemconvStability.DUPLICATE;
      break;
    } else if (entry.toLowerCase() === namespace) {
      semconvStability = SemconvStability.STABLE;
    }
  }
  return semconvStability;
}
const esm = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  InstrumentationBase: InstrumentationBase$1,
  InstrumentationNodeModuleDefinition: InstrumentationNodeModuleDefinition$1,
  InstrumentationNodeModuleFile,
  get SemconvStability() {
    return SemconvStability;
  },
  isWrapped: isWrapped$1,
  registerInstrumentations,
  safeExecuteInTheMiddle,
  safeExecuteInTheMiddleAsync,
  semconvStabilityFromStr
}, Symbol.toStringTag, { value: "Module" }));
const require$$4 = /* @__PURE__ */ getAugmentedNamespace(esm);
const name = "@fastify/otel";
const version$i = "0.16.0";
const require$$5 = {
  name,
  version: version$i
};
var commonjs$2 = {};
var commonjs$1 = {};
var commonjs = {};
var hasRequiredCommonjs$2;
function requireCommonjs$2() {
  if (hasRequiredCommonjs$2) return commonjs;
  hasRequiredCommonjs$2 = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.range = exports$1.balanced = void 0;
    const balanced = (a, b, str) => {
      const ma = a instanceof RegExp ? maybeMatch(a, str) : a;
      const mb = b instanceof RegExp ? maybeMatch(b, str) : b;
      const r = ma !== null && mb != null && (0, exports$1.range)(ma, mb, str);
      return r && {
        start: r[0],
        end: r[1],
        pre: str.slice(0, r[0]),
        body: str.slice(r[0] + ma.length, r[1]),
        post: str.slice(r[1] + mb.length)
      };
    };
    exports$1.balanced = balanced;
    const maybeMatch = (reg, str) => {
      const m = str.match(reg);
      return m ? m[0] : null;
    };
    const range = (a, b, str) => {
      let begs, beg, left, right = void 0, result;
      let ai = str.indexOf(a);
      let bi = str.indexOf(b, ai + 1);
      let i = ai;
      if (ai >= 0 && bi > 0) {
        if (a === b) {
          return [ai, bi];
        }
        begs = [];
        left = str.length;
        while (i >= 0 && !result) {
          if (i === ai) {
            begs.push(i);
            ai = str.indexOf(a, i + 1);
          } else if (begs.length === 1) {
            const r = begs.pop();
            if (r !== void 0)
              result = [r, bi];
          } else {
            beg = begs.pop();
            if (beg !== void 0 && beg < left) {
              left = beg;
              right = bi;
            }
            bi = str.indexOf(b, i + 1);
          }
          i = ai < bi && ai >= 0 ? ai : bi;
        }
        if (begs.length && right !== void 0) {
          result = [left, right];
        }
      }
      return result;
    };
    exports$1.range = range;
  })(commonjs);
  return commonjs;
}
var hasRequiredCommonjs$1;
function requireCommonjs$1() {
  if (hasRequiredCommonjs$1) return commonjs$1;
  hasRequiredCommonjs$1 = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.EXPANSION_MAX = void 0;
    exports$1.expand = expand;
    const balanced_match_1 = requireCommonjs$2();
    const escSlash = "\0SLASH" + Math.random() + "\0";
    const escOpen = "\0OPEN" + Math.random() + "\0";
    const escClose = "\0CLOSE" + Math.random() + "\0";
    const escComma = "\0COMMA" + Math.random() + "\0";
    const escPeriod = "\0PERIOD" + Math.random() + "\0";
    const escSlashPattern = new RegExp(escSlash, "g");
    const escOpenPattern = new RegExp(escOpen, "g");
    const escClosePattern = new RegExp(escClose, "g");
    const escCommaPattern = new RegExp(escComma, "g");
    const escPeriodPattern = new RegExp(escPeriod, "g");
    const slashPattern = /\\\\/g;
    const openPattern = /\\{/g;
    const closePattern = /\\}/g;
    const commaPattern = /\\,/g;
    const periodPattern = /\\\./g;
    exports$1.EXPANSION_MAX = 1e5;
    function numeric(str) {
      return !isNaN(str) ? parseInt(str, 10) : str.charCodeAt(0);
    }
    function escapeBraces(str) {
      return str.replace(slashPattern, escSlash).replace(openPattern, escOpen).replace(closePattern, escClose).replace(commaPattern, escComma).replace(periodPattern, escPeriod);
    }
    function unescapeBraces(str) {
      return str.replace(escSlashPattern, "\\").replace(escOpenPattern, "{").replace(escClosePattern, "}").replace(escCommaPattern, ",").replace(escPeriodPattern, ".");
    }
    function parseCommaParts(str) {
      if (!str) {
        return [""];
      }
      const parts = [];
      const m = (0, balanced_match_1.balanced)("{", "}", str);
      if (!m) {
        return str.split(",");
      }
      const { pre, body, post } = m;
      const p = pre.split(",");
      p[p.length - 1] += "{" + body + "}";
      const postParts = parseCommaParts(post);
      if (post.length) {
        p[p.length - 1] += postParts.shift();
        p.push.apply(p, postParts);
      }
      parts.push.apply(parts, p);
      return parts;
    }
    function expand(str, options = {}) {
      if (!str) {
        return [];
      }
      const { max = exports$1.EXPANSION_MAX } = options;
      if (str.slice(0, 2) === "{}") {
        str = "\\{\\}" + str.slice(2);
      }
      return expand_(escapeBraces(str), max, true).map(unescapeBraces);
    }
    function embrace(str) {
      return "{" + str + "}";
    }
    function isPadded(el) {
      return /^-?0\d/.test(el);
    }
    function lte(i, y) {
      return i <= y;
    }
    function gte(i, y) {
      return i >= y;
    }
    function expand_(str, max, isTop) {
      const expansions = [];
      const m = (0, balanced_match_1.balanced)("{", "}", str);
      if (!m)
        return [str];
      const pre = m.pre;
      const post = m.post.length ? expand_(m.post, max, false) : [""];
      if (/\$$/.test(m.pre)) {
        for (let k = 0; k < post.length && k < max; k++) {
          const expansion = pre + "{" + m.body + "}" + post[k];
          expansions.push(expansion);
        }
      } else {
        const isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body);
        const isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body);
        const isSequence = isNumericSequence || isAlphaSequence;
        const isOptions = m.body.indexOf(",") >= 0;
        if (!isSequence && !isOptions) {
          if (m.post.match(/,(?!,).*\}/)) {
            str = m.pre + "{" + m.body + escClose + m.post;
            return expand_(str, max, true);
          }
          return [str];
        }
        let n;
        if (isSequence) {
          n = m.body.split(/\.\./);
        } else {
          n = parseCommaParts(m.body);
          if (n.length === 1 && n[0] !== void 0) {
            n = expand_(n[0], max, false).map(embrace);
            if (n.length === 1) {
              return post.map((p) => m.pre + n[0] + p);
            }
          }
        }
        let N;
        if (isSequence && n[0] !== void 0 && n[1] !== void 0) {
          const x = numeric(n[0]);
          const y = numeric(n[1]);
          const width = Math.max(n[0].length, n[1].length);
          let incr = n.length === 3 && n[2] !== void 0 ? Math.abs(numeric(n[2])) : 1;
          let test = lte;
          const reverse = y < x;
          if (reverse) {
            incr *= -1;
            test = gte;
          }
          const pad = n.some(isPadded);
          N = [];
          for (let i = x; test(i, y); i += incr) {
            let c;
            if (isAlphaSequence) {
              c = String.fromCharCode(i);
              if (c === "\\") {
                c = "";
              }
            } else {
              c = String(i);
              if (pad) {
                const need = width - c.length;
                if (need > 0) {
                  const z = new Array(need + 1).join("0");
                  if (i < 0) {
                    c = "-" + z + c.slice(1);
                  } else {
                    c = z + c;
                  }
                }
              }
            }
            N.push(c);
          }
        } else {
          N = [];
          for (let j = 0; j < n.length; j++) {
            N.push.apply(N, expand_(n[j], max, false));
          }
        }
        for (let j = 0; j < N.length; j++) {
          for (let k = 0; k < post.length && expansions.length < max; k++) {
            const expansion = pre + N[j] + post[k];
            if (!isTop || isSequence || expansion) {
              expansions.push(expansion);
            }
          }
        }
      }
      return expansions;
    }
  })(commonjs$1);
  return commonjs$1;
}
var assertValidPattern = {};
var hasRequiredAssertValidPattern;
function requireAssertValidPattern() {
  if (hasRequiredAssertValidPattern) return assertValidPattern;
  hasRequiredAssertValidPattern = 1;
  Object.defineProperty(assertValidPattern, "__esModule", { value: true });
  assertValidPattern.assertValidPattern = void 0;
  const MAX_PATTERN_LENGTH = 1024 * 64;
  const assertValidPattern$1 = (pattern) => {
    if (typeof pattern !== "string") {
      throw new TypeError("invalid pattern");
    }
    if (pattern.length > MAX_PATTERN_LENGTH) {
      throw new TypeError("pattern is too long");
    }
  };
  assertValidPattern.assertValidPattern = assertValidPattern$1;
  return assertValidPattern;
}
var ast = {};
var braceExpressions = {};
var hasRequiredBraceExpressions;
function requireBraceExpressions() {
  if (hasRequiredBraceExpressions) return braceExpressions;
  hasRequiredBraceExpressions = 1;
  Object.defineProperty(braceExpressions, "__esModule", { value: true });
  braceExpressions.parseClass = void 0;
  const posixClasses = {
    "[:alnum:]": ["\\p{L}\\p{Nl}\\p{Nd}", true],
    "[:alpha:]": ["\\p{L}\\p{Nl}", true],
    "[:ascii:]": ["\\x00-\\x7f", false],
    "[:blank:]": ["\\p{Zs}\\t", true],
    "[:cntrl:]": ["\\p{Cc}", true],
    "[:digit:]": ["\\p{Nd}", true],
    "[:graph:]": ["\\p{Z}\\p{C}", true, true],
    "[:lower:]": ["\\p{Ll}", true],
    "[:print:]": ["\\p{C}", true],
    "[:punct:]": ["\\p{P}", true],
    "[:space:]": ["\\p{Z}\\t\\r\\n\\v\\f", true],
    "[:upper:]": ["\\p{Lu}", true],
    "[:word:]": ["\\p{L}\\p{Nl}\\p{Nd}\\p{Pc}", true],
    "[:xdigit:]": ["A-Fa-f0-9", false]
  };
  const braceEscape = (s) => s.replace(/[[\]\\-]/g, "\\$&");
  const regexpEscape = (s) => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  const rangesToString = (ranges) => ranges.join("");
  const parseClass = (glob, position) => {
    const pos = position;
    if (glob.charAt(pos) !== "[") {
      throw new Error("not in a brace expression");
    }
    const ranges = [];
    const negs = [];
    let i = pos + 1;
    let sawStart = false;
    let uflag = false;
    let escaping = false;
    let negate = false;
    let endPos = pos;
    let rangeStart = "";
    WHILE: while (i < glob.length) {
      const c = glob.charAt(i);
      if ((c === "!" || c === "^") && i === pos + 1) {
        negate = true;
        i++;
        continue;
      }
      if (c === "]" && sawStart && !escaping) {
        endPos = i + 1;
        break;
      }
      sawStart = true;
      if (c === "\\") {
        if (!escaping) {
          escaping = true;
          i++;
          continue;
        }
      }
      if (c === "[" && !escaping) {
        for (const [cls, [unip, u, neg]] of Object.entries(posixClasses)) {
          if (glob.startsWith(cls, i)) {
            if (rangeStart) {
              return ["$.", false, glob.length - pos, true];
            }
            i += cls.length;
            if (neg)
              negs.push(unip);
            else
              ranges.push(unip);
            uflag = uflag || u;
            continue WHILE;
          }
        }
      }
      escaping = false;
      if (rangeStart) {
        if (c > rangeStart) {
          ranges.push(braceEscape(rangeStart) + "-" + braceEscape(c));
        } else if (c === rangeStart) {
          ranges.push(braceEscape(c));
        }
        rangeStart = "";
        i++;
        continue;
      }
      if (glob.startsWith("-]", i + 1)) {
        ranges.push(braceEscape(c + "-"));
        i += 2;
        continue;
      }
      if (glob.startsWith("-", i + 1)) {
        rangeStart = c;
        i += 2;
        continue;
      }
      ranges.push(braceEscape(c));
      i++;
    }
    if (endPos < i) {
      return ["", false, 0, false];
    }
    if (!ranges.length && !negs.length) {
      return ["$.", false, glob.length - pos, true];
    }
    if (negs.length === 0 && ranges.length === 1 && /^\\?.$/.test(ranges[0]) && !negate) {
      const r = ranges[0].length === 2 ? ranges[0].slice(-1) : ranges[0];
      return [regexpEscape(r), false, endPos - pos, false];
    }
    const sranges = "[" + (negate ? "^" : "") + rangesToString(ranges) + "]";
    const snegs = "[" + (negate ? "" : "^") + rangesToString(negs) + "]";
    const comb = ranges.length && negs.length ? "(" + sranges + "|" + snegs + ")" : ranges.length ? sranges : snegs;
    return [comb, uflag, endPos - pos, true];
  };
  braceExpressions.parseClass = parseClass;
  return braceExpressions;
}
var _unescape = {};
var hasRequired_unescape;
function require_unescape() {
  if (hasRequired_unescape) return _unescape;
  hasRequired_unescape = 1;
  Object.defineProperty(_unescape, "__esModule", { value: true });
  _unescape.unescape = void 0;
  const unescape = (s, { windowsPathsNoEscape = false, magicalBraces = true } = {}) => {
    if (magicalBraces) {
      return windowsPathsNoEscape ? s.replace(/\[([^\/\\])\]/g, "$1") : s.replace(/((?!\\).|^)\[([^\/\\])\]/g, "$1$2").replace(/\\([^\/])/g, "$1");
    }
    return windowsPathsNoEscape ? s.replace(/\[([^\/\\{}])\]/g, "$1") : s.replace(/((?!\\).|^)\[([^\/\\{}])\]/g, "$1$2").replace(/\\([^\/{}])/g, "$1");
  };
  _unescape.unescape = unescape;
  return _unescape;
}
var hasRequiredAst;
function requireAst() {
  if (hasRequiredAst) return ast;
  hasRequiredAst = 1;
  var _a;
  Object.defineProperty(ast, "__esModule", { value: true });
  ast.AST = void 0;
  const brace_expressions_js_1 = requireBraceExpressions();
  const unescape_js_1 = require_unescape();
  const types2 = /* @__PURE__ */ new Set(["!", "?", "+", "*", "@"]);
  const isExtglobType = (c) => types2.has(c);
  const isExtglobAST = (c) => isExtglobType(c.type);
  const adoptionMap = /* @__PURE__ */ new Map([
    ["!", ["@"]],
    ["?", ["?", "@"]],
    ["@", ["@"]],
    ["*", ["*", "+", "?", "@"]],
    ["+", ["+", "@"]]
  ]);
  const adoptionWithSpaceMap = /* @__PURE__ */ new Map([
    ["!", ["?"]],
    ["@", ["?"]],
    ["+", ["?", "*"]]
  ]);
  const adoptionAnyMap = /* @__PURE__ */ new Map([
    ["!", ["?", "@"]],
    ["?", ["?", "@"]],
    ["@", ["?", "@"]],
    ["*", ["*", "+", "?", "@"]],
    ["+", ["+", "@", "?", "*"]]
  ]);
  const usurpMap = /* @__PURE__ */ new Map([
    ["!", /* @__PURE__ */ new Map([["!", "@"]])],
    [
      "?",
      /* @__PURE__ */ new Map([
        ["*", "*"],
        ["+", "*"]
      ])
    ],
    [
      "@",
      /* @__PURE__ */ new Map([
        ["!", "!"],
        ["?", "?"],
        ["@", "@"],
        ["*", "*"],
        ["+", "+"]
      ])
    ],
    [
      "+",
      /* @__PURE__ */ new Map([
        ["?", "*"],
        ["*", "*"]
      ])
    ]
  ]);
  const startNoTraversal = "(?!(?:^|/)\\.\\.?(?:$|/))";
  const startNoDot = "(?!\\.)";
  const addPatternStart = /* @__PURE__ */ new Set(["[", "."]);
  const justDots = /* @__PURE__ */ new Set(["..", "."]);
  const reSpecials = new Set("().*{}+?[]^$\\!");
  const regExpEscape = (s) => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  const qmark = "[^/]";
  const star = qmark + "*?";
  const starNoEmpty = qmark + "+?";
  let ID = 0;
  class AST {
    type;
    #root;
    #hasMagic;
    #uflag = false;
    #parts = [];
    #parent;
    #parentIndex;
    #negs;
    #filledNegs = false;
    #options;
    #toString;
    // set to true if it's an extglob with no children
    // (which really means one child of '')
    #emptyExt = false;
    id = ++ID;
    get depth() {
      return (this.#parent?.depth ?? -1) + 1;
    }
    [Symbol.for("nodejs.util.inspect.custom")]() {
      return {
        "@@type": "AST",
        id: this.id,
        type: this.type,
        root: this.#root.id,
        parent: this.#parent?.id,
        depth: this.depth,
        partsLength: this.#parts.length,
        parts: this.#parts
      };
    }
    constructor(type, parent, options = {}) {
      this.type = type;
      if (type)
        this.#hasMagic = true;
      this.#parent = parent;
      this.#root = this.#parent ? this.#parent.#root : this;
      this.#options = this.#root === this ? options : this.#root.#options;
      this.#negs = this.#root === this ? [] : this.#root.#negs;
      if (type === "!" && !this.#root.#filledNegs)
        this.#negs.push(this);
      this.#parentIndex = this.#parent ? this.#parent.#parts.length : 0;
    }
    get hasMagic() {
      if (this.#hasMagic !== void 0)
        return this.#hasMagic;
      for (const p of this.#parts) {
        if (typeof p === "string")
          continue;
        if (p.type || p.hasMagic)
          return this.#hasMagic = true;
      }
      return this.#hasMagic;
    }
    // reconstructs the pattern
    toString() {
      if (this.#toString !== void 0)
        return this.#toString;
      if (!this.type) {
        return this.#toString = this.#parts.map((p) => String(p)).join("");
      } else {
        return this.#toString = this.type + "(" + this.#parts.map((p) => String(p)).join("|") + ")";
      }
    }
    #fillNegs() {
      if (this !== this.#root)
        throw new Error("should only call on root");
      if (this.#filledNegs)
        return this;
      this.toString();
      this.#filledNegs = true;
      let n;
      while (n = this.#negs.pop()) {
        if (n.type !== "!")
          continue;
        let p = n;
        let pp = p.#parent;
        while (pp) {
          for (let i = p.#parentIndex + 1; !pp.type && i < pp.#parts.length; i++) {
            for (const part of n.#parts) {
              if (typeof part === "string") {
                throw new Error("string part in extglob AST??");
              }
              part.copyIn(pp.#parts[i]);
            }
          }
          p = pp;
          pp = p.#parent;
        }
      }
      return this;
    }
    push(...parts) {
      for (const p of parts) {
        if (p === "")
          continue;
        if (typeof p !== "string" && !(p instanceof _a && p.#parent === this)) {
          throw new Error("invalid part: " + p);
        }
        this.#parts.push(p);
      }
    }
    toJSON() {
      const ret = this.type === null ? this.#parts.slice().map((p) => typeof p === "string" ? p : p.toJSON()) : [this.type, ...this.#parts.map((p) => p.toJSON())];
      if (this.isStart() && !this.type)
        ret.unshift([]);
      if (this.isEnd() && (this === this.#root || this.#root.#filledNegs && this.#parent?.type === "!")) {
        ret.push({});
      }
      return ret;
    }
    isStart() {
      if (this.#root === this)
        return true;
      if (!this.#parent?.isStart())
        return false;
      if (this.#parentIndex === 0)
        return true;
      const p = this.#parent;
      for (let i = 0; i < this.#parentIndex; i++) {
        const pp = p.#parts[i];
        if (!(pp instanceof _a && pp.type === "!")) {
          return false;
        }
      }
      return true;
    }
    isEnd() {
      if (this.#root === this)
        return true;
      if (this.#parent?.type === "!")
        return true;
      if (!this.#parent?.isEnd())
        return false;
      if (!this.type)
        return this.#parent?.isEnd();
      const pl = this.#parent ? this.#parent.#parts.length : 0;
      return this.#parentIndex === pl - 1;
    }
    copyIn(part) {
      if (typeof part === "string")
        this.push(part);
      else
        this.push(part.clone(this));
    }
    clone(parent) {
      const c = new _a(this.type, parent);
      for (const p of this.#parts) {
        c.copyIn(p);
      }
      return c;
    }
    static #parseAST(str, ast2, pos, opt, extDepth) {
      const maxDepth = opt.maxExtglobRecursion ?? 2;
      let escaping = false;
      let inBrace = false;
      let braceStart = -1;
      let braceNeg = false;
      if (ast2.type === null) {
        let i2 = pos;
        let acc2 = "";
        while (i2 < str.length) {
          const c = str.charAt(i2++);
          if (escaping || c === "\\") {
            escaping = !escaping;
            acc2 += c;
            continue;
          }
          if (inBrace) {
            if (i2 === braceStart + 1) {
              if (c === "^" || c === "!") {
                braceNeg = true;
              }
            } else if (c === "]" && !(i2 === braceStart + 2 && braceNeg)) {
              inBrace = false;
            }
            acc2 += c;
            continue;
          } else if (c === "[") {
            inBrace = true;
            braceStart = i2;
            braceNeg = false;
            acc2 += c;
            continue;
          }
          const doRecurse = !opt.noext && isExtglobType(c) && str.charAt(i2) === "(" && extDepth <= maxDepth;
          if (doRecurse) {
            ast2.push(acc2);
            acc2 = "";
            const ext = new _a(c, ast2);
            i2 = _a.#parseAST(str, ext, i2, opt, extDepth + 1);
            ast2.push(ext);
            continue;
          }
          acc2 += c;
        }
        ast2.push(acc2);
        return i2;
      }
      let i = pos + 1;
      let part = new _a(null, ast2);
      const parts = [];
      let acc = "";
      while (i < str.length) {
        const c = str.charAt(i++);
        if (escaping || c === "\\") {
          escaping = !escaping;
          acc += c;
          continue;
        }
        if (inBrace) {
          if (i === braceStart + 1) {
            if (c === "^" || c === "!") {
              braceNeg = true;
            }
          } else if (c === "]" && !(i === braceStart + 2 && braceNeg)) {
            inBrace = false;
          }
          acc += c;
          continue;
        } else if (c === "[") {
          inBrace = true;
          braceStart = i;
          braceNeg = false;
          acc += c;
          continue;
        }
        const doRecurse = !opt.noext && isExtglobType(c) && str.charAt(i) === "(" && /* c8 ignore start - the maxDepth is sufficient here */
        (extDepth <= maxDepth || ast2 && ast2.#canAdoptType(c));
        if (doRecurse) {
          const depthAdd = ast2 && ast2.#canAdoptType(c) ? 0 : 1;
          part.push(acc);
          acc = "";
          const ext = new _a(c, part);
          part.push(ext);
          i = _a.#parseAST(str, ext, i, opt, extDepth + depthAdd);
          continue;
        }
        if (c === "|") {
          part.push(acc);
          acc = "";
          parts.push(part);
          part = new _a(null, ast2);
          continue;
        }
        if (c === ")") {
          if (acc === "" && ast2.#parts.length === 0) {
            ast2.#emptyExt = true;
          }
          part.push(acc);
          acc = "";
          ast2.push(...parts, part);
          return i;
        }
        acc += c;
      }
      ast2.type = null;
      ast2.#hasMagic = void 0;
      ast2.#parts = [str.substring(pos - 1)];
      return i;
    }
    #canAdoptWithSpace(child) {
      return this.#canAdopt(child, adoptionWithSpaceMap);
    }
    #canAdopt(child, map = adoptionMap) {
      if (!child || typeof child !== "object" || child.type !== null || child.#parts.length !== 1 || this.type === null) {
        return false;
      }
      const gc = child.#parts[0];
      if (!gc || typeof gc !== "object" || gc.type === null) {
        return false;
      }
      return this.#canAdoptType(gc.type, map);
    }
    #canAdoptType(c, map = adoptionAnyMap) {
      return !!map.get(this.type)?.includes(c);
    }
    #adoptWithSpace(child, index) {
      const gc = child.#parts[0];
      const blank = new _a(null, gc, this.options);
      blank.#parts.push("");
      gc.push(blank);
      this.#adopt(child, index);
    }
    #adopt(child, index) {
      const gc = child.#parts[0];
      this.#parts.splice(index, 1, ...gc.#parts);
      for (const p of gc.#parts) {
        if (typeof p === "object")
          p.#parent = this;
      }
      this.#toString = void 0;
    }
    #canUsurpType(c) {
      const m = usurpMap.get(this.type);
      return !!m?.has(c);
    }
    #canUsurp(child) {
      if (!child || typeof child !== "object" || child.type !== null || child.#parts.length !== 1 || this.type === null || this.#parts.length !== 1) {
        return false;
      }
      const gc = child.#parts[0];
      if (!gc || typeof gc !== "object" || gc.type === null) {
        return false;
      }
      return this.#canUsurpType(gc.type);
    }
    #usurp(child) {
      const m = usurpMap.get(this.type);
      const gc = child.#parts[0];
      const nt = m?.get(gc.type);
      if (!nt)
        return false;
      this.#parts = gc.#parts;
      for (const p of this.#parts) {
        if (typeof p === "object") {
          p.#parent = this;
        }
      }
      this.type = nt;
      this.#toString = void 0;
      this.#emptyExt = false;
    }
    static fromGlob(pattern, options = {}) {
      const ast2 = new _a(null, void 0, options);
      _a.#parseAST(pattern, ast2, 0, options, 0);
      return ast2;
    }
    // returns the regular expression if there's magic, or the unescaped
    // string if not.
    toMMPattern() {
      if (this !== this.#root)
        return this.#root.toMMPattern();
      const glob = this.toString();
      const [re, body, hasMagic, uflag] = this.toRegExpSource();
      const anyMagic = hasMagic || this.#hasMagic || this.#options.nocase && !this.#options.nocaseMagicOnly && glob.toUpperCase() !== glob.toLowerCase();
      if (!anyMagic) {
        return body;
      }
      const flags = (this.#options.nocase ? "i" : "") + (uflag ? "u" : "");
      return Object.assign(new RegExp(`^${re}$`, flags), {
        _src: re,
        _glob: glob
      });
    }
    get options() {
      return this.#options;
    }
    // returns the string match, the regexp source, whether there's magic
    // in the regexp (so a regular expression is required) and whether or
    // not the uflag is needed for the regular expression (for posix classes)
    // TODO: instead of injecting the start/end at this point, just return
    // the BODY of the regexp, along with the start/end portions suitable
    // for binding the start/end in either a joined full-path makeRe context
    // (where we bind to (^|/), or a standalone matchPart context (where
    // we bind to ^, and not /).  Otherwise slashes get duped!
    //
    // In part-matching mode, the start is:
    // - if not isStart: nothing
    // - if traversal possible, but not allowed: ^(?!\.\.?$)
    // - if dots allowed or not possible: ^
    // - if dots possible and not allowed: ^(?!\.)
    // end is:
    // - if not isEnd(): nothing
    // - else: $
    //
    // In full-path matching mode, we put the slash at the START of the
    // pattern, so start is:
    // - if first pattern: same as part-matching mode
    // - if not isStart(): nothing
    // - if traversal possible, but not allowed: /(?!\.\.?(?:$|/))
    // - if dots allowed or not possible: /
    // - if dots possible and not allowed: /(?!\.)
    // end is:
    // - if last pattern, same as part-matching mode
    // - else nothing
    //
    // Always put the (?:$|/) on negated tails, though, because that has to be
    // there to bind the end of the negated pattern portion, and it's easier to
    // just stick it in now rather than try to inject it later in the middle of
    // the pattern.
    //
    // We can just always return the same end, and leave it up to the caller
    // to know whether it's going to be used joined or in parts.
    // And, if the start is adjusted slightly, can do the same there:
    // - if not isStart: nothing
    // - if traversal possible, but not allowed: (?:/|^)(?!\.\.?$)
    // - if dots allowed or not possible: (?:/|^)
    // - if dots possible and not allowed: (?:/|^)(?!\.)
    //
    // But it's better to have a simpler binding without a conditional, for
    // performance, so probably better to return both start options.
    //
    // Then the caller just ignores the end if it's not the first pattern,
    // and the start always gets applied.
    //
    // But that's always going to be $ if it's the ending pattern, or nothing,
    // so the caller can just attach $ at the end of the pattern when building.
    //
    // So the todo is:
    // - better detect what kind of start is needed
    // - return both flavors of starting pattern
    // - attach $ at the end of the pattern when creating the actual RegExp
    //
    // Ah, but wait, no, that all only applies to the root when the first pattern
    // is not an extglob. If the first pattern IS an extglob, then we need all
    // that dot prevention biz to live in the extglob portions, because eg
    // +(*|.x*) can match .xy but not .yx.
    //
    // So, return the two flavors if it's #root and the first child is not an
    // AST, otherwise leave it to the child AST to handle it, and there,
    // use the (?:^|/) style of start binding.
    //
    // Even simplified further:
    // - Since the start for a join is eg /(?!\.) and the start for a part
    // is ^(?!\.), we can just prepend (?!\.) to the pattern (either root
    // or start or whatever) and prepend ^ or / at the Regexp construction.
    toRegExpSource(allowDot) {
      const dot = allowDot ?? !!this.#options.dot;
      if (this.#root === this) {
        this.#flatten();
        this.#fillNegs();
      }
      if (!isExtglobAST(this)) {
        const noEmpty = this.isStart() && this.isEnd() && !this.#parts.some((s) => typeof s !== "string");
        const src2 = this.#parts.map((p) => {
          const [re, _, hasMagic, uflag] = typeof p === "string" ? _a.#parseGlob(p, this.#hasMagic, noEmpty) : p.toRegExpSource(allowDot);
          this.#hasMagic = this.#hasMagic || hasMagic;
          this.#uflag = this.#uflag || uflag;
          return re;
        }).join("");
        let start2 = "";
        if (this.isStart()) {
          if (typeof this.#parts[0] === "string") {
            const dotTravAllowed = this.#parts.length === 1 && justDots.has(this.#parts[0]);
            if (!dotTravAllowed) {
              const aps = addPatternStart;
              const needNoTrav = (
                // dots are allowed, and the pattern starts with [ or .
                dot && aps.has(src2.charAt(0)) || // the pattern starts with \., and then [ or .
                src2.startsWith("\\.") && aps.has(src2.charAt(2)) || // the pattern starts with \.\., and then [ or .
                src2.startsWith("\\.\\.") && aps.has(src2.charAt(4))
              );
              const needNoDot = !dot && !allowDot && aps.has(src2.charAt(0));
              start2 = needNoTrav ? startNoTraversal : needNoDot ? startNoDot : "";
            }
          }
        }
        let end = "";
        if (this.isEnd() && this.#root.#filledNegs && this.#parent?.type === "!") {
          end = "(?:$|\\/)";
        }
        const final2 = start2 + src2 + end;
        return [
          final2,
          (0, unescape_js_1.unescape)(src2),
          this.#hasMagic = !!this.#hasMagic,
          this.#uflag
        ];
      }
      const repeated = this.type === "*" || this.type === "+";
      const start = this.type === "!" ? "(?:(?!(?:" : "(?:";
      let body = this.#partsToRegExp(dot);
      if (this.isStart() && this.isEnd() && !body && this.type !== "!") {
        const s = this.toString();
        const me = this;
        me.#parts = [s];
        me.type = null;
        me.#hasMagic = void 0;
        return [s, (0, unescape_js_1.unescape)(this.toString()), false, false];
      }
      let bodyDotAllowed = !repeated || allowDot || dot || !startNoDot ? "" : this.#partsToRegExp(true);
      if (bodyDotAllowed === body) {
        bodyDotAllowed = "";
      }
      if (bodyDotAllowed) {
        body = `(?:${body})(?:${bodyDotAllowed})*?`;
      }
      let final = "";
      if (this.type === "!" && this.#emptyExt) {
        final = (this.isStart() && !dot ? startNoDot : "") + starNoEmpty;
      } else {
        const close = this.type === "!" ? (
          // !() must match something,but !(x) can match ''
          "))" + (this.isStart() && !dot && !allowDot ? startNoDot : "") + star + ")"
        ) : this.type === "@" ? ")" : this.type === "?" ? ")?" : this.type === "+" && bodyDotAllowed ? ")" : this.type === "*" && bodyDotAllowed ? `)?` : `)${this.type}`;
        final = start + body + close;
      }
      return [
        final,
        (0, unescape_js_1.unescape)(body),
        this.#hasMagic = !!this.#hasMagic,
        this.#uflag
      ];
    }
    #flatten() {
      if (!isExtglobAST(this)) {
        for (const p of this.#parts) {
          if (typeof p === "object") {
            p.#flatten();
          }
        }
      } else {
        let iterations = 0;
        let done = false;
        do {
          done = true;
          for (let i = 0; i < this.#parts.length; i++) {
            const c = this.#parts[i];
            if (typeof c === "object") {
              c.#flatten();
              if (this.#canAdopt(c)) {
                done = false;
                this.#adopt(c, i);
              } else if (this.#canAdoptWithSpace(c)) {
                done = false;
                this.#adoptWithSpace(c, i);
              } else if (this.#canUsurp(c)) {
                done = false;
                this.#usurp(c);
              }
            }
          }
        } while (!done && ++iterations < 10);
      }
      this.#toString = void 0;
    }
    #partsToRegExp(dot) {
      return this.#parts.map((p) => {
        if (typeof p === "string") {
          throw new Error("string type in extglob ast??");
        }
        const [re, _, _hasMagic, uflag] = p.toRegExpSource(dot);
        this.#uflag = this.#uflag || uflag;
        return re;
      }).filter((p) => !(this.isStart() && this.isEnd()) || !!p).join("|");
    }
    static #parseGlob(glob, hasMagic, noEmpty = false) {
      let escaping = false;
      let re = "";
      let uflag = false;
      let inStar = false;
      for (let i = 0; i < glob.length; i++) {
        const c = glob.charAt(i);
        if (escaping) {
          escaping = false;
          re += (reSpecials.has(c) ? "\\" : "") + c;
          continue;
        }
        if (c === "*") {
          if (inStar)
            continue;
          inStar = true;
          re += noEmpty && /^[*]+$/.test(glob) ? starNoEmpty : star;
          hasMagic = true;
          continue;
        } else {
          inStar = false;
        }
        if (c === "\\") {
          if (i === glob.length - 1) {
            re += "\\\\";
          } else {
            escaping = true;
          }
          continue;
        }
        if (c === "[") {
          const [src2, needUflag, consumed, magic] = (0, brace_expressions_js_1.parseClass)(glob, i);
          if (consumed) {
            re += src2;
            uflag = uflag || needUflag;
            i += consumed - 1;
            hasMagic = hasMagic || magic;
            continue;
          }
        }
        if (c === "?") {
          re += qmark;
          hasMagic = true;
          continue;
        }
        re += regExpEscape(c);
      }
      return [re, (0, unescape_js_1.unescape)(glob), !!hasMagic, uflag];
    }
  }
  ast.AST = AST;
  _a = AST;
  return ast;
}
var _escape = {};
var hasRequired_escape;
function require_escape() {
  if (hasRequired_escape) return _escape;
  hasRequired_escape = 1;
  Object.defineProperty(_escape, "__esModule", { value: true });
  _escape.escape = void 0;
  const escape = (s, { windowsPathsNoEscape = false, magicalBraces = false } = {}) => {
    if (magicalBraces) {
      return windowsPathsNoEscape ? s.replace(/[?*()[\]{}]/g, "[$&]") : s.replace(/[?*()[\]\\{}]/g, "\\$&");
    }
    return windowsPathsNoEscape ? s.replace(/[?*()[\]]/g, "[$&]") : s.replace(/[?*()[\]\\]/g, "\\$&");
  };
  _escape.escape = escape;
  return _escape;
}
var hasRequiredCommonjs;
function requireCommonjs() {
  if (hasRequiredCommonjs) return commonjs$2;
  hasRequiredCommonjs = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.unescape = exports$1.escape = exports$1.AST = exports$1.Minimatch = exports$1.match = exports$1.makeRe = exports$1.braceExpand = exports$1.defaults = exports$1.filter = exports$1.GLOBSTAR = exports$1.sep = exports$1.minimatch = void 0;
    const brace_expansion_1 = requireCommonjs$1();
    const assert_valid_pattern_js_1 = requireAssertValidPattern();
    const ast_js_1 = requireAst();
    const escape_js_1 = require_escape();
    const unescape_js_1 = require_unescape();
    const minimatch = (p, pattern, options = {}) => {
      (0, assert_valid_pattern_js_1.assertValidPattern)(pattern);
      if (!options.nocomment && pattern.charAt(0) === "#") {
        return false;
      }
      return new Minimatch(pattern, options).match(p);
    };
    exports$1.minimatch = minimatch;
    const starDotExtRE = /^\*+([^+@!?\*\[\(]*)$/;
    const starDotExtTest = (ext2) => (f) => !f.startsWith(".") && f.endsWith(ext2);
    const starDotExtTestDot = (ext2) => (f) => f.endsWith(ext2);
    const starDotExtTestNocase = (ext2) => {
      ext2 = ext2.toLowerCase();
      return (f) => !f.startsWith(".") && f.toLowerCase().endsWith(ext2);
    };
    const starDotExtTestNocaseDot = (ext2) => {
      ext2 = ext2.toLowerCase();
      return (f) => f.toLowerCase().endsWith(ext2);
    };
    const starDotStarRE = /^\*+\.\*+$/;
    const starDotStarTest = (f) => !f.startsWith(".") && f.includes(".");
    const starDotStarTestDot = (f) => f !== "." && f !== ".." && f.includes(".");
    const dotStarRE = /^\.\*+$/;
    const dotStarTest = (f) => f !== "." && f !== ".." && f.startsWith(".");
    const starRE = /^\*+$/;
    const starTest = (f) => f.length !== 0 && !f.startsWith(".");
    const starTestDot = (f) => f.length !== 0 && f !== "." && f !== "..";
    const qmarksRE = /^\?+([^+@!?\*\[\(]*)?$/;
    const qmarksTestNocase = ([$0, ext2 = ""]) => {
      const noext = qmarksTestNoExt([$0]);
      if (!ext2)
        return noext;
      ext2 = ext2.toLowerCase();
      return (f) => noext(f) && f.toLowerCase().endsWith(ext2);
    };
    const qmarksTestNocaseDot = ([$0, ext2 = ""]) => {
      const noext = qmarksTestNoExtDot([$0]);
      if (!ext2)
        return noext;
      ext2 = ext2.toLowerCase();
      return (f) => noext(f) && f.toLowerCase().endsWith(ext2);
    };
    const qmarksTestDot = ([$0, ext2 = ""]) => {
      const noext = qmarksTestNoExtDot([$0]);
      return !ext2 ? noext : (f) => noext(f) && f.endsWith(ext2);
    };
    const qmarksTest = ([$0, ext2 = ""]) => {
      const noext = qmarksTestNoExt([$0]);
      return !ext2 ? noext : (f) => noext(f) && f.endsWith(ext2);
    };
    const qmarksTestNoExt = ([$0]) => {
      const len = $0.length;
      return (f) => f.length === len && !f.startsWith(".");
    };
    const qmarksTestNoExtDot = ([$0]) => {
      const len = $0.length;
      return (f) => f.length === len && f !== "." && f !== "..";
    };
    const defaultPlatform = typeof process === "object" && process ? typeof process.env === "object" && process.env && process.env.__MINIMATCH_TESTING_PLATFORM__ || process.platform : "posix";
    const path = {
      win32: { sep: "\\" },
      posix: { sep: "/" }
    };
    exports$1.sep = defaultPlatform === "win32" ? path.win32.sep : path.posix.sep;
    exports$1.minimatch.sep = exports$1.sep;
    exports$1.GLOBSTAR = Symbol("globstar **");
    exports$1.minimatch.GLOBSTAR = exports$1.GLOBSTAR;
    const qmark = "[^/]";
    const star = qmark + "*?";
    const twoStarDot = "(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?";
    const twoStarNoDot = "(?:(?!(?:\\/|^)\\.).)*?";
    const filter = (pattern, options = {}) => (p) => (0, exports$1.minimatch)(p, pattern, options);
    exports$1.filter = filter;
    exports$1.minimatch.filter = exports$1.filter;
    const ext = (a, b = {}) => Object.assign({}, a, b);
    const defaults = (def) => {
      if (!def || typeof def !== "object" || !Object.keys(def).length) {
        return exports$1.minimatch;
      }
      const orig = exports$1.minimatch;
      const m = (p, pattern, options = {}) => orig(p, pattern, ext(def, options));
      return Object.assign(m, {
        Minimatch: class Minimatch extends orig.Minimatch {
          constructor(pattern, options = {}) {
            super(pattern, ext(def, options));
          }
          static defaults(options) {
            return orig.defaults(ext(def, options)).Minimatch;
          }
        },
        AST: class AST extends orig.AST {
          /* c8 ignore start */
          constructor(type, parent, options = {}) {
            super(type, parent, ext(def, options));
          }
          /* c8 ignore stop */
          static fromGlob(pattern, options = {}) {
            return orig.AST.fromGlob(pattern, ext(def, options));
          }
        },
        unescape: (s, options = {}) => orig.unescape(s, ext(def, options)),
        escape: (s, options = {}) => orig.escape(s, ext(def, options)),
        filter: (pattern, options = {}) => orig.filter(pattern, ext(def, options)),
        defaults: (options) => orig.defaults(ext(def, options)),
        makeRe: (pattern, options = {}) => orig.makeRe(pattern, ext(def, options)),
        braceExpand: (pattern, options = {}) => orig.braceExpand(pattern, ext(def, options)),
        match: (list, pattern, options = {}) => orig.match(list, pattern, ext(def, options)),
        sep: orig.sep,
        GLOBSTAR: exports$1.GLOBSTAR
      });
    };
    exports$1.defaults = defaults;
    exports$1.minimatch.defaults = exports$1.defaults;
    const braceExpand = (pattern, options = {}) => {
      (0, assert_valid_pattern_js_1.assertValidPattern)(pattern);
      if (options.nobrace || !/\{(?:(?!\{).)*\}/.test(pattern)) {
        return [pattern];
      }
      return (0, brace_expansion_1.expand)(pattern, { max: options.braceExpandMax });
    };
    exports$1.braceExpand = braceExpand;
    exports$1.minimatch.braceExpand = exports$1.braceExpand;
    const makeRe = (pattern, options = {}) => new Minimatch(pattern, options).makeRe();
    exports$1.makeRe = makeRe;
    exports$1.minimatch.makeRe = exports$1.makeRe;
    const match = (list, pattern, options = {}) => {
      const mm = new Minimatch(pattern, options);
      list = list.filter((f) => mm.match(f));
      if (mm.options.nonull && !list.length) {
        list.push(pattern);
      }
      return list;
    };
    exports$1.match = match;
    exports$1.minimatch.match = exports$1.match;
    const globMagic = /[?*]|[+@!]\(.*?\)|\[|\]/;
    const regExpEscape = (s) => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    class Minimatch {
      options;
      set;
      pattern;
      windowsPathsNoEscape;
      nonegate;
      negate;
      comment;
      empty;
      preserveMultipleSlashes;
      partial;
      globSet;
      globParts;
      nocase;
      isWindows;
      platform;
      windowsNoMagicRoot;
      maxGlobstarRecursion;
      regexp;
      constructor(pattern, options = {}) {
        (0, assert_valid_pattern_js_1.assertValidPattern)(pattern);
        options = options || {};
        this.options = options;
        this.maxGlobstarRecursion = options.maxGlobstarRecursion ?? 200;
        this.pattern = pattern;
        this.platform = options.platform || defaultPlatform;
        this.isWindows = this.platform === "win32";
        const awe = "allowWindowsEscape";
        this.windowsPathsNoEscape = !!options.windowsPathsNoEscape || options[awe] === false;
        if (this.windowsPathsNoEscape) {
          this.pattern = this.pattern.replace(/\\/g, "/");
        }
        this.preserveMultipleSlashes = !!options.preserveMultipleSlashes;
        this.regexp = null;
        this.negate = false;
        this.nonegate = !!options.nonegate;
        this.comment = false;
        this.empty = false;
        this.partial = !!options.partial;
        this.nocase = !!this.options.nocase;
        this.windowsNoMagicRoot = options.windowsNoMagicRoot !== void 0 ? options.windowsNoMagicRoot : !!(this.isWindows && this.nocase);
        this.globSet = [];
        this.globParts = [];
        this.set = [];
        this.make();
      }
      hasMagic() {
        if (this.options.magicalBraces && this.set.length > 1) {
          return true;
        }
        for (const pattern of this.set) {
          for (const part of pattern) {
            if (typeof part !== "string")
              return true;
          }
        }
        return false;
      }
      debug(..._) {
      }
      make() {
        const pattern = this.pattern;
        const options = this.options;
        if (!options.nocomment && pattern.charAt(0) === "#") {
          this.comment = true;
          return;
        }
        if (!pattern) {
          this.empty = true;
          return;
        }
        this.parseNegate();
        this.globSet = [...new Set(this.braceExpand())];
        if (options.debug) {
          this.debug = (...args) => console.error(...args);
        }
        this.debug(this.pattern, this.globSet);
        const rawGlobParts = this.globSet.map((s) => this.slashSplit(s));
        this.globParts = this.preprocess(rawGlobParts);
        this.debug(this.pattern, this.globParts);
        let set = this.globParts.map((s, _, __) => {
          if (this.isWindows && this.windowsNoMagicRoot) {
            const isUNC = s[0] === "" && s[1] === "" && (s[2] === "?" || !globMagic.test(s[2])) && !globMagic.test(s[3]);
            const isDrive = /^[a-z]:/i.test(s[0]);
            if (isUNC) {
              return [
                ...s.slice(0, 4),
                ...s.slice(4).map((ss) => this.parse(ss))
              ];
            } else if (isDrive) {
              return [s[0], ...s.slice(1).map((ss) => this.parse(ss))];
            }
          }
          return s.map((ss) => this.parse(ss));
        });
        this.debug(this.pattern, set);
        this.set = set.filter((s) => s.indexOf(false) === -1);
        if (this.isWindows) {
          for (let i = 0; i < this.set.length; i++) {
            const p = this.set[i];
            if (p[0] === "" && p[1] === "" && this.globParts[i][2] === "?" && typeof p[3] === "string" && /^[a-z]:$/i.test(p[3])) {
              p[2] = "?";
            }
          }
        }
        this.debug(this.pattern, this.set);
      }
      // various transforms to equivalent pattern sets that are
      // faster to process in a filesystem walk.  The goal is to
      // eliminate what we can, and push all ** patterns as far
      // to the right as possible, even if it increases the number
      // of patterns that we have to process.
      preprocess(globParts) {
        if (this.options.noglobstar) {
          for (let i = 0; i < globParts.length; i++) {
            for (let j = 0; j < globParts[i].length; j++) {
              if (globParts[i][j] === "**") {
                globParts[i][j] = "*";
              }
            }
          }
        }
        const { optimizationLevel = 1 } = this.options;
        if (optimizationLevel >= 2) {
          globParts = this.firstPhasePreProcess(globParts);
          globParts = this.secondPhasePreProcess(globParts);
        } else if (optimizationLevel >= 1) {
          globParts = this.levelOneOptimize(globParts);
        } else {
          globParts = this.adjascentGlobstarOptimize(globParts);
        }
        return globParts;
      }
      // just get rid of adjascent ** portions
      adjascentGlobstarOptimize(globParts) {
        return globParts.map((parts) => {
          let gs = -1;
          while (-1 !== (gs = parts.indexOf("**", gs + 1))) {
            let i = gs;
            while (parts[i + 1] === "**") {
              i++;
            }
            if (i !== gs) {
              parts.splice(gs, i - gs);
            }
          }
          return parts;
        });
      }
      // get rid of adjascent ** and resolve .. portions
      levelOneOptimize(globParts) {
        return globParts.map((parts) => {
          parts = parts.reduce((set, part) => {
            const prev = set[set.length - 1];
            if (part === "**" && prev === "**") {
              return set;
            }
            if (part === "..") {
              if (prev && prev !== ".." && prev !== "." && prev !== "**") {
                set.pop();
                return set;
              }
            }
            set.push(part);
            return set;
          }, []);
          return parts.length === 0 ? [""] : parts;
        });
      }
      levelTwoFileOptimize(parts) {
        if (!Array.isArray(parts)) {
          parts = this.slashSplit(parts);
        }
        let didSomething = false;
        do {
          didSomething = false;
          if (!this.preserveMultipleSlashes) {
            for (let i = 1; i < parts.length - 1; i++) {
              const p = parts[i];
              if (i === 1 && p === "" && parts[0] === "")
                continue;
              if (p === "." || p === "") {
                didSomething = true;
                parts.splice(i, 1);
                i--;
              }
            }
            if (parts[0] === "." && parts.length === 2 && (parts[1] === "." || parts[1] === "")) {
              didSomething = true;
              parts.pop();
            }
          }
          let dd = 0;
          while (-1 !== (dd = parts.indexOf("..", dd + 1))) {
            const p = parts[dd - 1];
            if (p && p !== "." && p !== ".." && p !== "**") {
              didSomething = true;
              parts.splice(dd - 1, 2);
              dd -= 2;
            }
          }
        } while (didSomething);
        return parts.length === 0 ? [""] : parts;
      }
      // First phase: single-pattern processing
      // <pre> is 1 or more portions
      // <rest> is 1 or more portions
      // <p> is any portion other than ., .., '', or **
      // <e> is . or ''
      //
      // **/.. is *brutal* for filesystem walking performance, because
      // it effectively resets the recursive walk each time it occurs,
      // and ** cannot be reduced out by a .. pattern part like a regexp
      // or most strings (other than .., ., and '') can be.
      //
      // <pre>/**/../<p>/<p>/<rest> -> {<pre>/../<p>/<p>/<rest>,<pre>/**/<p>/<p>/<rest>}
      // <pre>/<e>/<rest> -> <pre>/<rest>
      // <pre>/<p>/../<rest> -> <pre>/<rest>
      // **/**/<rest> -> **/<rest>
      //
      // **/*/<rest> -> */**/<rest> <== not valid because ** doesn't follow
      // this WOULD be allowed if ** did follow symlinks, or * didn't
      firstPhasePreProcess(globParts) {
        let didSomething = false;
        do {
          didSomething = false;
          for (let parts of globParts) {
            let gs = -1;
            while (-1 !== (gs = parts.indexOf("**", gs + 1))) {
              let gss = gs;
              while (parts[gss + 1] === "**") {
                gss++;
              }
              if (gss > gs) {
                parts.splice(gs + 1, gss - gs);
              }
              let next = parts[gs + 1];
              const p = parts[gs + 2];
              const p2 = parts[gs + 3];
              if (next !== "..")
                continue;
              if (!p || p === "." || p === ".." || !p2 || p2 === "." || p2 === "..") {
                continue;
              }
              didSomething = true;
              parts.splice(gs, 1);
              const other = parts.slice(0);
              other[gs] = "**";
              globParts.push(other);
              gs--;
            }
            if (!this.preserveMultipleSlashes) {
              for (let i = 1; i < parts.length - 1; i++) {
                const p = parts[i];
                if (i === 1 && p === "" && parts[0] === "")
                  continue;
                if (p === "." || p === "") {
                  didSomething = true;
                  parts.splice(i, 1);
                  i--;
                }
              }
              if (parts[0] === "." && parts.length === 2 && (parts[1] === "." || parts[1] === "")) {
                didSomething = true;
                parts.pop();
              }
            }
            let dd = 0;
            while (-1 !== (dd = parts.indexOf("..", dd + 1))) {
              const p = parts[dd - 1];
              if (p && p !== "." && p !== ".." && p !== "**") {
                didSomething = true;
                const needDot = dd === 1 && parts[dd + 1] === "**";
                const splin = needDot ? ["."] : [];
                parts.splice(dd - 1, 2, ...splin);
                if (parts.length === 0)
                  parts.push("");
                dd -= 2;
              }
            }
          }
        } while (didSomething);
        return globParts;
      }
      // second phase: multi-pattern dedupes
      // {<pre>/*/<rest>,<pre>/<p>/<rest>} -> <pre>/*/<rest>
      // {<pre>/<rest>,<pre>/<rest>} -> <pre>/<rest>
      // {<pre>/**/<rest>,<pre>/<rest>} -> <pre>/**/<rest>
      //
      // {<pre>/**/<rest>,<pre>/**/<p>/<rest>} -> <pre>/**/<rest>
      // ^-- not valid because ** doens't follow symlinks
      secondPhasePreProcess(globParts) {
        for (let i = 0; i < globParts.length - 1; i++) {
          for (let j = i + 1; j < globParts.length; j++) {
            const matched = this.partsMatch(globParts[i], globParts[j], !this.preserveMultipleSlashes);
            if (matched) {
              globParts[i] = [];
              globParts[j] = matched;
              break;
            }
          }
        }
        return globParts.filter((gs) => gs.length);
      }
      partsMatch(a, b, emptyGSMatch = false) {
        let ai = 0;
        let bi = 0;
        let result = [];
        let which = "";
        while (ai < a.length && bi < b.length) {
          if (a[ai] === b[bi]) {
            result.push(which === "b" ? b[bi] : a[ai]);
            ai++;
            bi++;
          } else if (emptyGSMatch && a[ai] === "**" && b[bi] === a[ai + 1]) {
            result.push(a[ai]);
            ai++;
          } else if (emptyGSMatch && b[bi] === "**" && a[ai] === b[bi + 1]) {
            result.push(b[bi]);
            bi++;
          } else if (a[ai] === "*" && b[bi] && (this.options.dot || !b[bi].startsWith(".")) && b[bi] !== "**") {
            if (which === "b")
              return false;
            which = "a";
            result.push(a[ai]);
            ai++;
            bi++;
          } else if (b[bi] === "*" && a[ai] && (this.options.dot || !a[ai].startsWith(".")) && a[ai] !== "**") {
            if (which === "a")
              return false;
            which = "b";
            result.push(b[bi]);
            ai++;
            bi++;
          } else {
            return false;
          }
        }
        return a.length === b.length && result;
      }
      parseNegate() {
        if (this.nonegate)
          return;
        const pattern = this.pattern;
        let negate = false;
        let negateOffset = 0;
        for (let i = 0; i < pattern.length && pattern.charAt(i) === "!"; i++) {
          negate = !negate;
          negateOffset++;
        }
        if (negateOffset)
          this.pattern = pattern.slice(negateOffset);
        this.negate = negate;
      }
      // set partial to true to test if, for example,
      // "/a/b" matches the start of "/*/b/*/d"
      // Partial means, if you run out of file before you run
      // out of pattern, then that's fine, as long as all
      // the parts match.
      matchOne(file, pattern, partial = false) {
        let fileStartIndex = 0;
        let patternStartIndex = 0;
        if (this.isWindows) {
          const fileDrive = typeof file[0] === "string" && /^[a-z]:$/i.test(file[0]);
          const fileUNC = !fileDrive && file[0] === "" && file[1] === "" && file[2] === "?" && /^[a-z]:$/i.test(file[3]);
          const patternDrive = typeof pattern[0] === "string" && /^[a-z]:$/i.test(pattern[0]);
          const patternUNC = !patternDrive && pattern[0] === "" && pattern[1] === "" && pattern[2] === "?" && typeof pattern[3] === "string" && /^[a-z]:$/i.test(pattern[3]);
          const fdi = fileUNC ? 3 : fileDrive ? 0 : void 0;
          const pdi = patternUNC ? 3 : patternDrive ? 0 : void 0;
          if (typeof fdi === "number" && typeof pdi === "number") {
            const [fd, pd] = [
              file[fdi],
              pattern[pdi]
            ];
            if (fd.toLowerCase() === pd.toLowerCase()) {
              pattern[pdi] = fd;
              patternStartIndex = pdi;
              fileStartIndex = fdi;
            }
          }
        }
        const { optimizationLevel = 1 } = this.options;
        if (optimizationLevel >= 2) {
          file = this.levelTwoFileOptimize(file);
        }
        if (pattern.includes(exports$1.GLOBSTAR)) {
          return this.#matchGlobstar(file, pattern, partial, fileStartIndex, patternStartIndex);
        }
        return this.#matchOne(file, pattern, partial, fileStartIndex, patternStartIndex);
      }
      #matchGlobstar(file, pattern, partial, fileIndex, patternIndex) {
        const firstgs = pattern.indexOf(exports$1.GLOBSTAR, patternIndex);
        const lastgs = pattern.lastIndexOf(exports$1.GLOBSTAR);
        const [head, body, tail] = partial ? [
          pattern.slice(patternIndex, firstgs),
          pattern.slice(firstgs + 1),
          []
        ] : [
          pattern.slice(patternIndex, firstgs),
          pattern.slice(firstgs + 1, lastgs),
          pattern.slice(lastgs + 1)
        ];
        if (head.length) {
          const fileHead = file.slice(fileIndex, fileIndex + head.length);
          if (!this.#matchOne(fileHead, head, partial, 0, 0)) {
            return false;
          }
          fileIndex += head.length;
          patternIndex += head.length;
        }
        let fileTailMatch = 0;
        if (tail.length) {
          if (tail.length + fileIndex > file.length)
            return false;
          let tailStart = file.length - tail.length;
          if (this.#matchOne(file, tail, partial, tailStart, 0)) {
            fileTailMatch = tail.length;
          } else {
            if (file[file.length - 1] !== "" || fileIndex + tail.length === file.length) {
              return false;
            }
            tailStart--;
            if (!this.#matchOne(file, tail, partial, tailStart, 0)) {
              return false;
            }
            fileTailMatch = tail.length + 1;
          }
        }
        if (!body.length) {
          let sawSome = !!fileTailMatch;
          for (let i2 = fileIndex; i2 < file.length - fileTailMatch; i2++) {
            const f = String(file[i2]);
            sawSome = true;
            if (f === "." || f === ".." || !this.options.dot && f.startsWith(".")) {
              return false;
            }
          }
          return partial || sawSome;
        }
        const bodySegments = [[[], 0]];
        let currentBody = bodySegments[0];
        let nonGsParts = 0;
        const nonGsPartsSums = [0];
        for (const b of body) {
          if (b === exports$1.GLOBSTAR) {
            nonGsPartsSums.push(nonGsParts);
            currentBody = [[], 0];
            bodySegments.push(currentBody);
          } else {
            currentBody[0].push(b);
            nonGsParts++;
          }
        }
        let i = bodySegments.length - 1;
        const fileLength = file.length - fileTailMatch;
        for (const b of bodySegments) {
          b[1] = fileLength - (nonGsPartsSums[i--] + b[0].length);
        }
        return !!this.#matchGlobStarBodySections(file, bodySegments, fileIndex, 0, partial, 0, !!fileTailMatch);
      }
      // return false for "nope, not matching"
      // return null for "not matching, cannot keep trying"
      #matchGlobStarBodySections(file, bodySegments, fileIndex, bodyIndex, partial, globStarDepth, sawTail) {
        const bs = bodySegments[bodyIndex];
        if (!bs) {
          for (let i = fileIndex; i < file.length; i++) {
            sawTail = true;
            const f = file[i];
            if (f === "." || f === ".." || !this.options.dot && f.startsWith(".")) {
              return false;
            }
          }
          return sawTail;
        }
        const [body, after] = bs;
        while (fileIndex <= after) {
          const m = this.#matchOne(file.slice(0, fileIndex + body.length), body, partial, fileIndex, 0);
          if (m && globStarDepth < this.maxGlobstarRecursion) {
            const sub = this.#matchGlobStarBodySections(file, bodySegments, fileIndex + body.length, bodyIndex + 1, partial, globStarDepth + 1, sawTail);
            if (sub !== false) {
              return sub;
            }
          }
          const f = file[fileIndex];
          if (f === "." || f === ".." || !this.options.dot && f.startsWith(".")) {
            return false;
          }
          fileIndex++;
        }
        return partial || null;
      }
      #matchOne(file, pattern, partial, fileIndex, patternIndex) {
        let fi;
        let pi;
        let pl;
        let fl;
        for (fi = fileIndex, pi = patternIndex, fl = file.length, pl = pattern.length; fi < fl && pi < pl; fi++, pi++) {
          this.debug("matchOne loop");
          let p = pattern[pi];
          let f = file[fi];
          this.debug(pattern, p, f);
          if (p === false || p === exports$1.GLOBSTAR) {
            return false;
          }
          let hit;
          if (typeof p === "string") {
            hit = f === p;
            this.debug("string match", p, f, hit);
          } else {
            hit = p.test(f);
            this.debug("pattern match", p, f, hit);
          }
          if (!hit)
            return false;
        }
        if (fi === fl && pi === pl) {
          return true;
        } else if (fi === fl) {
          return partial;
        } else if (pi === pl) {
          return fi === fl - 1 && file[fi] === "";
        } else {
          throw new Error("wtf?");
        }
      }
      braceExpand() {
        return (0, exports$1.braceExpand)(this.pattern, this.options);
      }
      parse(pattern) {
        (0, assert_valid_pattern_js_1.assertValidPattern)(pattern);
        const options = this.options;
        if (pattern === "**")
          return exports$1.GLOBSTAR;
        if (pattern === "")
          return "";
        let m;
        let fastTest = null;
        if (m = pattern.match(starRE)) {
          fastTest = options.dot ? starTestDot : starTest;
        } else if (m = pattern.match(starDotExtRE)) {
          fastTest = (options.nocase ? options.dot ? starDotExtTestNocaseDot : starDotExtTestNocase : options.dot ? starDotExtTestDot : starDotExtTest)(m[1]);
        } else if (m = pattern.match(qmarksRE)) {
          fastTest = (options.nocase ? options.dot ? qmarksTestNocaseDot : qmarksTestNocase : options.dot ? qmarksTestDot : qmarksTest)(m);
        } else if (m = pattern.match(starDotStarRE)) {
          fastTest = options.dot ? starDotStarTestDot : starDotStarTest;
        } else if (m = pattern.match(dotStarRE)) {
          fastTest = dotStarTest;
        }
        const re = ast_js_1.AST.fromGlob(pattern, this.options).toMMPattern();
        if (fastTest && typeof re === "object") {
          Reflect.defineProperty(re, "test", { value: fastTest });
        }
        return re;
      }
      makeRe() {
        if (this.regexp || this.regexp === false)
          return this.regexp;
        const set = this.set;
        if (!set.length) {
          this.regexp = false;
          return this.regexp;
        }
        const options = this.options;
        const twoStar = options.noglobstar ? star : options.dot ? twoStarDot : twoStarNoDot;
        const flags = new Set(options.nocase ? ["i"] : []);
        let re = set.map((pattern) => {
          const pp = pattern.map((p) => {
            if (p instanceof RegExp) {
              for (const f of p.flags.split(""))
                flags.add(f);
            }
            return typeof p === "string" ? regExpEscape(p) : p === exports$1.GLOBSTAR ? exports$1.GLOBSTAR : p._src;
          });
          pp.forEach((p, i) => {
            const next = pp[i + 1];
            const prev = pp[i - 1];
            if (p !== exports$1.GLOBSTAR || prev === exports$1.GLOBSTAR) {
              return;
            }
            if (prev === void 0) {
              if (next !== void 0 && next !== exports$1.GLOBSTAR) {
                pp[i + 1] = "(?:\\/|" + twoStar + "\\/)?" + next;
              } else {
                pp[i] = twoStar;
              }
            } else if (next === void 0) {
              pp[i - 1] = prev + "(?:\\/|\\/" + twoStar + ")?";
            } else if (next !== exports$1.GLOBSTAR) {
              pp[i - 1] = prev + "(?:\\/|\\/" + twoStar + "\\/)" + next;
              pp[i + 1] = exports$1.GLOBSTAR;
            }
          });
          const filtered = pp.filter((p) => p !== exports$1.GLOBSTAR);
          if (this.partial && filtered.length >= 1) {
            const prefixes = [];
            for (let i = 1; i <= filtered.length; i++) {
              prefixes.push(filtered.slice(0, i).join("/"));
            }
            return "(?:" + prefixes.join("|") + ")";
          }
          return filtered.join("/");
        }).join("|");
        const [open, close] = set.length > 1 ? ["(?:", ")"] : ["", ""];
        re = "^" + open + re + close + "$";
        if (this.partial) {
          re = "^(?:\\/|" + open + re.slice(1, -1) + close + ")$";
        }
        if (this.negate)
          re = "^(?!" + re + ").+$";
        try {
          this.regexp = new RegExp(re, [...flags].join(""));
        } catch (ex) {
          this.regexp = false;
        }
        return this.regexp;
      }
      slashSplit(p) {
        if (this.preserveMultipleSlashes) {
          return p.split("/");
        } else if (this.isWindows && /^\/\/[^\/]+/.test(p)) {
          return ["", ...p.split(/\/+/)];
        } else {
          return p.split(/\/+/);
        }
      }
      match(f, partial = this.partial) {
        this.debug("match", f, this.pattern);
        if (this.comment) {
          return false;
        }
        if (this.empty) {
          return f === "";
        }
        if (f === "/" && partial) {
          return true;
        }
        const options = this.options;
        if (this.isWindows) {
          f = f.split("\\").join("/");
        }
        const ff = this.slashSplit(f);
        this.debug(this.pattern, "split", ff);
        const set = this.set;
        this.debug(this.pattern, "set", set);
        let filename = ff[ff.length - 1];
        if (!filename) {
          for (let i = ff.length - 2; !filename && i >= 0; i--) {
            filename = ff[i];
          }
        }
        for (let i = 0; i < set.length; i++) {
          const pattern = set[i];
          let file = ff;
          if (options.matchBase && pattern.length === 1) {
            file = [filename];
          }
          const hit = this.matchOne(file, pattern, partial);
          if (hit) {
            if (options.flipNegate) {
              return true;
            }
            return !this.negate;
          }
        }
        if (options.flipNegate) {
          return false;
        }
        return this.negate;
      }
      static defaults(def) {
        return exports$1.minimatch.defaults(def).Minimatch;
      }
    }
    exports$1.Minimatch = Minimatch;
    var ast_js_2 = requireAst();
    Object.defineProperty(exports$1, "AST", { enumerable: true, get: function() {
      return ast_js_2.AST;
    } });
    var escape_js_2 = require_escape();
    Object.defineProperty(exports$1, "escape", { enumerable: true, get: function() {
      return escape_js_2.escape;
    } });
    var unescape_js_2 = require_unescape();
    Object.defineProperty(exports$1, "unescape", { enumerable: true, get: function() {
      return unescape_js_2.unescape;
    } });
    exports$1.minimatch.AST = ast_js_1.AST;
    exports$1.minimatch.Minimatch = Minimatch;
    exports$1.minimatch.escape = escape_js_1.escape;
    exports$1.minimatch.unescape = unescape_js_1.unescape;
  })(commonjs$2);
  return commonjs$2;
}
var hasRequiredOtel;
function requireOtel() {
  if (hasRequiredOtel) return otel.exports;
  hasRequiredOtel = 1;
  const dc = diagnosticsChannel__default;
  const { context: context2, trace: trace2, SpanStatusCode: SpanStatusCode2, propagation: propagation2, diag: diag2 } = require$$0$2;
  const { getRPCMetadata: getRPCMetadata2, RPCType: RPCType2 } = require$$1$1;
  const {
    ATTR_HTTP_ROUTE: ATTR_HTTP_ROUTE2,
    ATTR_HTTP_RESPONSE_STATUS_CODE: ATTR_HTTP_RESPONSE_STATUS_CODE2,
    ATTR_HTTP_REQUEST_METHOD: ATTR_HTTP_REQUEST_METHOD2,
    ATTR_URL_PATH
  } = require$$2$1;
  const { InstrumentationBase: InstrumentationBase3 } = require$$4;
  const {
    version: PACKAGE_VERSION2,
    name: PACKAGE_NAME2
  } = require$$5;
  const SUPPORTED_VERSIONS2 = ">=4.0.0 <6";
  const FASTIFY_HOOKS = [
    "onRequest",
    "preParsing",
    "preValidation",
    "preHandler",
    "preSerialization",
    "onSend",
    "onResponse",
    "onError"
  ];
  const ATTRIBUTE_NAMES = {
    HOOK_NAME: "hook.name",
    FASTIFY_TYPE: "fastify.type",
    HOOK_CALLBACK_NAME: "hook.callback.name",
    ROOT: "fastify.root"
  };
  const HOOK_TYPES = {
    ROUTE: "route-hook",
    INSTANCE: "hook",
    HANDLER: "request-handler"
  };
  const ANONYMOUS_FUNCTION_NAME = "anonymous";
  const kInstrumentation = Symbol("fastify otel instance");
  const kRequestSpan = Symbol("fastify otel request spans");
  const kRequestContext = Symbol("fastify otel request context");
  const kAddHookOriginal = Symbol("fastify otel addhook original");
  const kSetNotFoundOriginal = Symbol("fastify otel setnotfound original");
  const kIgnorePaths = Symbol("fastify otel ignore path");
  const kRecordExceptions = Symbol("fastify otel record exceptions");
  class FastifyOtelInstrumentation extends InstrumentationBase3 {
    logger = null;
    _requestHook = null;
    _lifecycleHook = null;
    constructor(config2) {
      super(PACKAGE_NAME2, PACKAGE_VERSION2, config2);
      this.logger = diag2.createComponentLogger({ namespace: PACKAGE_NAME2 });
      this[kIgnorePaths] = null;
      this[kRecordExceptions] = true;
      if (config2?.recordExceptions != null) {
        if (typeof config2.recordExceptions !== "boolean") {
          throw new TypeError("recordExceptions must be a boolean");
        }
        this[kRecordExceptions] = config2.recordExceptions;
      }
      if (typeof config2?.requestHook === "function") {
        this._requestHook = config2.requestHook;
      }
      if (typeof config2?.lifecycleHook === "function") {
        this._lifecycleHook = config2.lifecycleHook;
      }
      if (config2?.ignorePaths != null || process.env.OTEL_FASTIFY_IGNORE_PATHS != null) {
        const ignorePaths = config2?.ignorePaths ?? process.env.OTEL_FASTIFY_IGNORE_PATHS;
        if ((typeof ignorePaths !== "string" || ignorePaths.length === 0) && typeof ignorePaths !== "function") {
          throw new TypeError(
            "ignorePaths must be a string or a function"
          );
        }
        let globMatcher = null;
        this[kIgnorePaths] = (routeOptions) => {
          if (typeof ignorePaths === "function") {
            return ignorePaths(routeOptions);
          } else {
            if (globMatcher == null) {
              globMatcher = requireCommonjs().minimatch;
            }
            return globMatcher(routeOptions.url, ignorePaths);
          }
        };
      }
    }
    enable() {
      if (this._handleInitialization === void 0 && this.getConfig().registerOnInitialization) {
        this._handleInitialization = (message) => {
          this.plugin()(message.fastify, void 0, () => {
          });
          const emptyPlugin = (_, __, done) => {
            done();
          };
          emptyPlugin[Symbol.for("skip-override")] = true;
          emptyPlugin[Symbol.for("fastify.display-name")] = "@fastify/otel";
          message.fastify.register(emptyPlugin);
        };
        dc.subscribe("fastify.initialization", this._handleInitialization);
      }
      return super.enable();
    }
    disable() {
      if (this._handleInitialization) {
        dc.unsubscribe("fastify.initialization", this._handleInitialization);
        this._handleInitialization = void 0;
      }
      return super.disable();
    }
    // We do not do patching in this instrumentation
    init() {
      return [];
    }
    plugin() {
      const instrumentation2 = this;
      FastifyInstrumentationPlugin[Symbol.for("skip-override")] = true;
      FastifyInstrumentationPlugin[Symbol.for("fastify.display-name")] = "@fastify/otel";
      FastifyInstrumentationPlugin[Symbol.for("plugin-meta")] = {
        fastify: SUPPORTED_VERSIONS2,
        name: "@fastify/otel"
      };
      return FastifyInstrumentationPlugin;
      function FastifyInstrumentationPlugin(instance, opts, done) {
        instance.decorate(kInstrumentation, instrumentation2);
        instance.decorate(kAddHookOriginal, instance.addHook);
        instance.decorate(kSetNotFoundOriginal, instance.setNotFoundHandler);
        instance.decorateRequest("opentelemetry", function openetelemetry() {
          const ctx = this[kRequestContext];
          const span = this[kRequestSpan];
          return {
            enabled: this.routeOptions.config?.otel !== false,
            span,
            tracer: instrumentation2.tracer,
            context: ctx,
            inject: (carrier, setter) => {
              return propagation2.inject(ctx, carrier, setter);
            },
            extract: (carrier, getter) => {
              return propagation2.extract(ctx, carrier, getter);
            }
          };
        });
        instance.decorateRequest(kRequestSpan, null);
        instance.decorateRequest(kRequestContext, null);
        instance.addHook("onRoute", function otelWireRoute(routeOptions) {
          if (instrumentation2[kIgnorePaths]?.(routeOptions) === true) {
            instrumentation2.logger.debug(
              `Ignoring route instrumentation ${routeOptions.method} ${routeOptions.url} because it matches the ignore path`
            );
            return;
          }
          if (routeOptions.config?.otel === false) {
            instrumentation2.logger.debug(
              `Ignoring route instrumentation ${routeOptions.method} ${routeOptions.url} because it is disabled`
            );
            return;
          }
          for (const hook of FASTIFY_HOOKS) {
            if (routeOptions[hook] != null) {
              const handlerLike = routeOptions[hook];
              if (typeof handlerLike === "function") {
                routeOptions[hook] = handlerWrapper(handlerLike, hook, {
                  [ATTRIBUTE_NAMES.HOOK_NAME]: `${this.pluginName} - route -> ${hook}`,
                  [ATTRIBUTE_NAMES.FASTIFY_TYPE]: HOOK_TYPES.ROUTE,
                  [ATTR_HTTP_ROUTE2]: routeOptions.url,
                  [ATTRIBUTE_NAMES.HOOK_CALLBACK_NAME]: handlerLike.name?.length > 0 ? handlerLike.name : ANONYMOUS_FUNCTION_NAME
                  /* c8 ignore next */
                });
              } else if (Array.isArray(handlerLike)) {
                const wrappedHandlers = [];
                for (const handler of handlerLike) {
                  wrappedHandlers.push(
                    handlerWrapper(handler, hook, {
                      [ATTRIBUTE_NAMES.HOOK_NAME]: `${this.pluginName} - route -> ${hook}`,
                      [ATTRIBUTE_NAMES.FASTIFY_TYPE]: HOOK_TYPES.ROUTE,
                      [ATTR_HTTP_ROUTE2]: routeOptions.url,
                      [ATTRIBUTE_NAMES.HOOK_CALLBACK_NAME]: handler.name?.length > 0 ? handler.name : ANONYMOUS_FUNCTION_NAME
                    })
                  );
                }
                routeOptions[hook] = wrappedHandlers;
              }
            }
          }
          if (routeOptions.onSend != null) {
            routeOptions.onSend = Array.isArray(routeOptions.onSend) ? [...routeOptions.onSend, finalizeResponseSpanHook] : [routeOptions.onSend, finalizeResponseSpanHook];
          } else {
            routeOptions.onSend = finalizeResponseSpanHook;
          }
          if (routeOptions.onError != null) {
            routeOptions.onError = Array.isArray(routeOptions.onError) ? [...routeOptions.onError, recordErrorInSpanHook] : [routeOptions.onError, recordErrorInSpanHook];
          } else {
            routeOptions.onError = recordErrorInSpanHook;
          }
          routeOptions.handler = handlerWrapper(routeOptions.handler, "handler", {
            [ATTRIBUTE_NAMES.HOOK_NAME]: `${this.pluginName} - route-handler`,
            [ATTRIBUTE_NAMES.FASTIFY_TYPE]: HOOK_TYPES.HANDLER,
            [ATTR_HTTP_ROUTE2]: routeOptions.url,
            [ATTRIBUTE_NAMES.HOOK_CALLBACK_NAME]: routeOptions.handler.name.length > 0 ? routeOptions.handler.name : ANONYMOUS_FUNCTION_NAME
          });
        });
        instance.addHook("onRequest", function startRequestSpanHook(request, _reply, hookDone) {
          if (this[kInstrumentation].isEnabled() === false || request.routeOptions.config?.otel === false) {
            return hookDone();
          }
          if (this[kInstrumentation][kIgnorePaths]?.({
            url: request.url,
            method: request.method
          }) === true) {
            this[kInstrumentation].logger.debug(
              `Ignoring request ${request.method} ${request.url} because it matches the ignore path`
            );
            return hookDone();
          }
          let ctx = context2.active();
          if (trace2.getSpan(ctx) == null) {
            ctx = propagation2.extract(ctx, request.headers);
          }
          const rpcMetadata = getRPCMetadata2(ctx);
          if (request.routeOptions.url != null && rpcMetadata?.type === RPCType2.HTTP) {
            rpcMetadata.route = request.routeOptions.url;
          }
          const attributes = {
            [ATTRIBUTE_NAMES.ROOT]: "@fastify/otel",
            [ATTR_HTTP_REQUEST_METHOD2]: request.method,
            [ATTR_URL_PATH]: request.url
          };
          if (request.routeOptions.url != null) {
            attributes[ATTR_HTTP_ROUTE2] = request.routeOptions.url;
          }
          const span = this[kInstrumentation].tracer.startSpan("request", {
            attributes
          }, ctx);
          try {
            this[kInstrumentation]._requestHook?.(span, request);
          } catch (err) {
            this[kInstrumentation].logger.error({ err }, "requestHook threw");
          }
          request[kRequestContext] = trace2.setSpan(ctx, span);
          request[kRequestSpan] = span;
          context2.with(request[kRequestContext], () => {
            hookDone();
          });
        });
        instance.addHook("onResponse", function finalizeNotFoundSpanHook(request, reply, hookDone) {
          const span = request[kRequestSpan];
          if (span != null) {
            span.setStatus({
              code: SpanStatusCode2.OK,
              message: "OK"
            });
            span.setAttributes({
              [ATTR_HTTP_RESPONSE_STATUS_CODE2]: 404
            });
            span.end();
          }
          request[kRequestSpan] = null;
          hookDone();
        });
        instance.addHook = addHookPatched;
        instance.setNotFoundHandler = setNotFoundHandlerPatched;
        done();
        function finalizeResponseSpanHook(request, reply, payload, hookDone) {
          const span = request[kRequestSpan];
          if (span != null) {
            if (reply.statusCode < 500) {
              span.setStatus({
                code: SpanStatusCode2.OK,
                message: "OK"
              });
            }
            span.setAttributes({
              [ATTR_HTTP_RESPONSE_STATUS_CODE2]: reply.statusCode
            });
            span.end();
          }
          request[kRequestSpan] = null;
          hookDone(null, payload);
        }
        function recordErrorInSpanHook(request, reply, error2, hookDone) {
          const span = request[kRequestSpan];
          if (span != null) {
            span.setStatus({
              code: SpanStatusCode2.ERROR,
              message: error2.message
            });
            if (instrumentation2[kRecordExceptions] !== false) {
              span.recordException(error2);
            }
          }
          hookDone();
        }
        function addHookPatched(name2, hook) {
          const addHookOriginal = this[kAddHookOriginal];
          if (FASTIFY_HOOKS.includes(name2)) {
            return addHookOriginal.call(
              this,
              name2,
              handlerWrapper(hook, name2, {
                [ATTRIBUTE_NAMES.HOOK_NAME]: `${this.pluginName} - ${name2}`,
                [ATTRIBUTE_NAMES.FASTIFY_TYPE]: HOOK_TYPES.INSTANCE,
                [ATTRIBUTE_NAMES.HOOK_CALLBACK_NAME]: hook.name?.length > 0 ? hook.name : ANONYMOUS_FUNCTION_NAME
                /* c8 ignore next */
              })
            );
          } else {
            return addHookOriginal.call(this, name2, hook);
          }
        }
        function setNotFoundHandlerPatched(hooks, handler) {
          const setNotFoundHandlerOriginal = this[kSetNotFoundOriginal];
          if (typeof hooks === "function") {
            handler = handlerWrapper(hooks, "notFoundHandler", {
              [ATTRIBUTE_NAMES.HOOK_NAME]: `${this.pluginName} - not-found-handler`,
              [ATTRIBUTE_NAMES.FASTIFY_TYPE]: HOOK_TYPES.INSTANCE,
              [ATTRIBUTE_NAMES.HOOK_CALLBACK_NAME]: hooks.name?.length > 0 ? hooks.name : ANONYMOUS_FUNCTION_NAME
              /* c8 ignore next */
            });
            setNotFoundHandlerOriginal.call(this, handler);
          } else {
            if (hooks.preValidation != null) {
              hooks.preValidation = handlerWrapper(hooks.preValidation, "notFoundHandler - preValidation", {
                [ATTRIBUTE_NAMES.HOOK_NAME]: `${this.pluginName} - not-found-handler - preValidation`,
                [ATTRIBUTE_NAMES.FASTIFY_TYPE]: HOOK_TYPES.INSTANCE,
                [ATTRIBUTE_NAMES.HOOK_CALLBACK_NAME]: hooks.preValidation.name?.length > 0 ? hooks.preValidation.name : ANONYMOUS_FUNCTION_NAME
                /* c8 ignore next */
              });
            }
            if (hooks.preHandler != null) {
              hooks.preHandler = handlerWrapper(hooks.preHandler, "notFoundHandler - preHandler", {
                [ATTRIBUTE_NAMES.HOOK_NAME]: `${this.pluginName} - not-found-handler - preHandler`,
                [ATTRIBUTE_NAMES.FASTIFY_TYPE]: HOOK_TYPES.INSTANCE,
                [ATTRIBUTE_NAMES.HOOK_CALLBACK_NAME]: hooks.preHandler.name?.length > 0 ? hooks.preHandler.name : ANONYMOUS_FUNCTION_NAME
                /* c8 ignore next */
              });
            }
            handler = handlerWrapper(handler, "notFoundHandler", {
              [ATTRIBUTE_NAMES.HOOK_NAME]: `${this.pluginName} - not-found-handler`,
              [ATTRIBUTE_NAMES.FASTIFY_TYPE]: HOOK_TYPES.INSTANCE,
              [ATTRIBUTE_NAMES.HOOK_CALLBACK_NAME]: handler.name?.length > 0 ? handler.name : ANONYMOUS_FUNCTION_NAME
              /* c8 ignore next */
            });
            setNotFoundHandlerOriginal.call(this, hooks, handler);
          }
        }
        function handlerWrapper(handler, hookName, spanAttributes = {}) {
          return function handlerWrapped(...args) {
            const instrumentation22 = this[kInstrumentation];
            const [request] = args;
            if (instrumentation22.isEnabled() === false || request.routeOptions.config?.otel === false) {
              instrumentation22.logger.debug(
                `Ignoring route instrumentation ${request.routeOptions.method} ${request.routeOptions.url} because it is disabled`
              );
              return handler.call(this, ...args);
            }
            if (instrumentation22[kIgnorePaths]?.({
              url: request.url,
              method: request.method
            }) === true) {
              instrumentation22.logger.debug(
                `Ignoring route instrumentation ${request.routeOptions.method} ${request.routeOptions.url} because it matches the ignore path`
              );
              return handler.call(this, ...args);
            }
            const ctx = request[kRequestContext] ?? context2.active();
            const handlerName = handler.name?.length > 0 ? handler.name : this.pluginName ?? ANONYMOUS_FUNCTION_NAME;
            const span = instrumentation22.tracer.startSpan(
              `${hookName} - ${handlerName}`,
              {
                attributes: spanAttributes
              },
              ctx
            );
            if (instrumentation22._lifecycleHook != null) {
              try {
                instrumentation22._lifecycleHook(span, {
                  hookName,
                  request,
                  handler: handlerName
                });
              } catch (err) {
                instrumentation22.logger.error({ err }, "Execution of lifecycleHook failed");
              }
            }
            return context2.with(
              trace2.setSpan(ctx, span),
              function() {
                try {
                  const res = handler.call(this, ...args);
                  if (typeof res?.then === "function") {
                    return res.then(
                      (result) => {
                        span.end();
                        return result;
                      },
                      (error2) => {
                        span.setStatus({
                          code: SpanStatusCode2.ERROR,
                          message: error2.message
                        });
                        if (instrumentation22[kRecordExceptions] !== false) {
                          span.recordException(error2);
                        }
                        span.end();
                        return Promise.reject(error2);
                      }
                    );
                  }
                  span.end();
                  return res;
                } catch (error2) {
                  span.setStatus({
                    code: SpanStatusCode2.ERROR,
                    message: error2.message
                  });
                  if (instrumentation22[kRecordExceptions] !== false) {
                    span.recordException(error2);
                  }
                  span.end();
                  throw error2;
                }
              },
              this
            );
          };
        }
      }
    }
  }
  otel.exports = FastifyOtelInstrumentation;
  otel.exports.FastifyOtelInstrumentation = FastifyOtelInstrumentation;
  return otel.exports;
}
var otelExports = requireOtel();
var AttributeNames$7;
(function(AttributeNames2) {
  const FASTIFY_NAME = "fastify.name";
  AttributeNames2["FASTIFY_NAME"] = FASTIFY_NAME;
  const FASTIFY_TYPE = "fastify.type";
  AttributeNames2["FASTIFY_TYPE"] = FASTIFY_TYPE;
  const HOOK_NAME = "hook.name";
  AttributeNames2["HOOK_NAME"] = HOOK_NAME;
  const PLUGIN_NAME = "plugin.name";
  AttributeNames2["PLUGIN_NAME"] = PLUGIN_NAME;
})(AttributeNames$7 || (AttributeNames$7 = {}));
var FastifyTypes;
(function(FastifyTypes2) {
  const MIDDLEWARE = "middleware";
  FastifyTypes2["MIDDLEWARE"] = MIDDLEWARE;
  const REQUEST_HANDLER = "request_handler";
  FastifyTypes2["REQUEST_HANDLER"] = REQUEST_HANDLER;
})(FastifyTypes || (FastifyTypes = {}));
var FastifyNames;
(function(FastifyNames2) {
  const MIDDLEWARE = "middleware";
  FastifyNames2["MIDDLEWARE"] = MIDDLEWARE;
  const REQUEST_HANDLER = "request handler";
  FastifyNames2["REQUEST_HANDLER"] = REQUEST_HANDLER;
})(FastifyNames || (FastifyNames = {}));
const spanRequestSymbol = Symbol("opentelemetry.instrumentation.fastify.request_active_span");
function startSpan(reply, tracer, spanName, spanAttributes = {}) {
  const span = tracer.startSpan(spanName, { attributes: spanAttributes });
  const spans = reply[spanRequestSymbol] || [];
  spans.push(span);
  Object.defineProperty(reply, spanRequestSymbol, {
    enumerable: false,
    configurable: true,
    value: spans
  });
  return span;
}
function endSpan$1(reply, err) {
  const spans = reply[spanRequestSymbol] || [];
  if (!spans.length) {
    return;
  }
  spans.forEach((span) => {
    if (err) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: err.message
      });
      span.recordException(err);
    }
    span.end();
  });
  delete reply[spanRequestSymbol];
}
function safeExecuteInTheMiddleMaybePromise(execute, onFinish, preventThrowingError) {
  let error2;
  let result = void 0;
  try {
    result = execute();
    if (isPromise(result)) {
      result.then(
        (res) => onFinish(void 0, res),
        (err) => onFinish(err)
      );
    }
  } catch (e) {
    error2 = e;
  } finally {
    if (!isPromise(result)) {
      onFinish(error2, result);
      if (error2 && true) {
        throw error2;
      }
    }
    return result;
  }
}
function isPromise(val) {
  return typeof val === "object" && val && typeof Object.getOwnPropertyDescriptor(val, "then")?.value === "function" || false;
}
const PACKAGE_VERSION$1 = "0.1.0";
const PACKAGE_NAME$1 = "@sentry/instrumentation-fastify-v3";
const ANONYMOUS_NAME = "anonymous";
const hooksNamesToWrap = /* @__PURE__ */ new Set([
  "onTimeout",
  "onRequest",
  "preParsing",
  "preValidation",
  "preSerialization",
  "preHandler",
  "onSend",
  "onResponse",
  "onError"
]);
class FastifyInstrumentationV3 extends InstrumentationBase$2 {
  constructor(config2 = {}) {
    super(PACKAGE_NAME$1, PACKAGE_VERSION$1, config2);
  }
  init() {
    return [
      new InstrumentationNodeModuleDefinition$2("fastify", [">=3.0.0 <4"], (moduleExports) => {
        return this._patchConstructor(moduleExports);
      })
    ];
  }
  _hookOnRequest() {
    const instrumentation2 = this;
    return function onRequest(request, reply, done) {
      if (!instrumentation2.isEnabled()) {
        return done();
      }
      instrumentation2._wrap(reply, "send", instrumentation2._patchSend());
      const anyRequest = request;
      const rpcMetadata = getRPCMetadata$1(context.active());
      const routeName = anyRequest.routeOptions ? anyRequest.routeOptions.url : request.routerPath;
      if (routeName && rpcMetadata?.type === RPCType$1.HTTP) {
        rpcMetadata.route = routeName;
      }
      const method = request.method || "GET";
      getIsolationScope().setTransactionName(`${method} ${routeName}`);
      done();
    };
  }
  _wrapHandler(pluginName, hookName, original, syncFunctionWithDone) {
    const instrumentation2 = this;
    this._diag.debug("Patching fastify route.handler function");
    return function(...args) {
      if (!instrumentation2.isEnabled()) {
        return original.apply(this, args);
      }
      const name2 = original.name || pluginName || ANONYMOUS_NAME;
      const spanName = `${FastifyNames.MIDDLEWARE} - ${name2}`;
      const reply = args[1];
      const span = startSpan(reply, instrumentation2.tracer, spanName, {
        [AttributeNames$7.FASTIFY_TYPE]: FastifyTypes.MIDDLEWARE,
        [AttributeNames$7.PLUGIN_NAME]: pluginName,
        [AttributeNames$7.HOOK_NAME]: hookName
      });
      const origDone = syncFunctionWithDone && args[args.length - 1];
      if (origDone) {
        args[args.length - 1] = function(...doneArgs) {
          endSpan$1(reply);
          origDone.apply(this, doneArgs);
        };
      }
      return context.with(trace.setSpan(context.active(), span), () => {
        return safeExecuteInTheMiddleMaybePromise(
          () => {
            return original.apply(this, args);
          },
          (err) => {
            if (err instanceof Error) {
              span.setStatus({
                code: SpanStatusCode.ERROR,
                message: err.message
              });
              span.recordException(err);
            }
            if (!syncFunctionWithDone) {
              endSpan$1(reply);
            }
          }
        );
      });
    };
  }
  _wrapAddHook() {
    const instrumentation2 = this;
    this._diag.debug("Patching fastify server.addHook function");
    return function(original) {
      return function wrappedAddHook(...args) {
        const name2 = args[0];
        const handler = args[1];
        const pluginName = this.pluginName;
        if (!hooksNamesToWrap.has(name2)) {
          return original.apply(this, args);
        }
        const syncFunctionWithDone = typeof args[args.length - 1] === "function" && handler.constructor.name !== "AsyncFunction";
        return original.apply(this, [
          name2,
          instrumentation2._wrapHandler(pluginName, name2, handler, syncFunctionWithDone)
        ]);
      };
    };
  }
  _patchConstructor(moduleExports) {
    const instrumentation2 = this;
    function fastify(...args) {
      const app2 = moduleExports.fastify.apply(this, args);
      app2.addHook("onRequest", instrumentation2._hookOnRequest());
      app2.addHook("preHandler", instrumentation2._hookPreHandler());
      instrumentClient$1();
      instrumentation2._wrap(app2, "addHook", instrumentation2._wrapAddHook());
      return app2;
    }
    if (moduleExports.errorCodes !== void 0) {
      fastify.errorCodes = moduleExports.errorCodes;
    }
    fastify.fastify = fastify;
    fastify.default = fastify;
    return fastify;
  }
  _patchSend() {
    const instrumentation2 = this;
    this._diag.debug("Patching fastify reply.send function");
    return function patchSend(original) {
      return function send(...args) {
        const maybeError = args[0];
        if (!instrumentation2.isEnabled()) {
          return original.apply(this, args);
        }
        return safeExecuteInTheMiddle$1(
          () => {
            return original.apply(this, args);
          },
          (err) => {
            if (!err && maybeError instanceof Error) {
              err = maybeError;
            }
            endSpan$1(this, err);
          }
        );
      };
    };
  }
  _hookPreHandler() {
    const instrumentation2 = this;
    this._diag.debug("Patching fastify preHandler function");
    return function preHandler(request, reply, done) {
      if (!instrumentation2.isEnabled()) {
        return done();
      }
      const anyRequest = request;
      const handler = anyRequest.routeOptions?.handler || anyRequest.context?.handler;
      const handlerName = handler?.name.startsWith("bound ") ? handler.name.substring(6) : handler?.name;
      const spanName = `${FastifyNames.REQUEST_HANDLER} - ${handlerName || this.pluginName || ANONYMOUS_NAME}`;
      const spanAttributes = {
        [AttributeNames$7.PLUGIN_NAME]: this.pluginName,
        [AttributeNames$7.FASTIFY_TYPE]: FastifyTypes.REQUEST_HANDLER,
        // eslint-disable-next-line deprecation/deprecation
        [SEMATTRS_HTTP_ROUTE]: anyRequest.routeOptions ? anyRequest.routeOptions.url : request.routerPath
      };
      if (handlerName) {
        spanAttributes[AttributeNames$7.FASTIFY_NAME] = handlerName;
      }
      const span = startSpan(reply, instrumentation2.tracer, spanName, spanAttributes);
      addFastifyV3SpanAttributes(span);
      const { requestHook: requestHook2 } = instrumentation2.getConfig();
      if (requestHook2) {
        safeExecuteInTheMiddle$1(
          () => requestHook2(span, { request }),
          (e) => {
            if (e) {
              instrumentation2._diag.error("request hook failed", e);
            }
          },
          true
        );
      }
      return context.with(trace.setSpan(context.active(), span), () => {
        done();
      });
    };
  }
}
function instrumentClient$1() {
  const client = getClient();
  if (client) {
    client.on("spanStart", (span) => {
      addFastifyV3SpanAttributes(span);
    });
  }
}
function addFastifyV3SpanAttributes(span) {
  const attributes = spanToJSON(span).data;
  const type = attributes["fastify.type"];
  if (attributes[SEMANTIC_ATTRIBUTE_SENTRY_OP] || !type) {
    return;
  }
  span.setAttributes({
    [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.otel.fastify",
    [SEMANTIC_ATTRIBUTE_SENTRY_OP]: `${type}.fastify`
  });
  const name2 = attributes["fastify.name"] || attributes["plugin.name"] || attributes["hook.name"];
  if (typeof name2 === "string") {
    const updatedName = name2.replace(/^fastify -> /, "").replace(/^@fastify\/otel -> /, "");
    span.updateName(updatedName);
  }
}
const INTEGRATION_NAME$m = "Fastify";
const instrumentFastifyV3 = generateInstrumentOnce(
  `${INTEGRATION_NAME$m}.v3`,
  () => new FastifyInstrumentationV3()
);
function getFastifyIntegration() {
  const client = getClient();
  if (!client) {
    return void 0;
  } else {
    return client.getIntegrationByName(INTEGRATION_NAME$m);
  }
}
function handleFastifyError(error2, request, reply, handlerOrigin) {
  const shouldHandleError = getFastifyIntegration()?.getShouldHandleError() || defaultShouldHandleError$1;
  if (handlerOrigin === "diagnostics-channel") {
    this.diagnosticsChannelExists = true;
  }
  if (this.diagnosticsChannelExists && handlerOrigin === "onError-hook") {
    DEBUG_BUILD$2 && debug.warn(
      "Fastify error handler was already registered via diagnostics channel.",
      "You can safely remove `setupFastifyErrorHandler` call and set `shouldHandleError` on the integration options."
    );
    return;
  }
  if (shouldHandleError(error2, request, reply)) {
    captureException(error2, { mechanism: { handled: false, type: "auto.function.fastify" } });
  }
}
const instrumentFastify = generateInstrumentOnce(`${INTEGRATION_NAME$m}.v5`, () => {
  const fastifyOtelInstrumentationInstance = new otelExports.FastifyOtelInstrumentation();
  const plugin = fastifyOtelInstrumentationInstance.plugin();
  diagnosticsChannel.subscribe("fastify.initialization", (message) => {
    const fastifyInstance = message.fastify;
    fastifyInstance?.register(plugin).after((err) => {
      if (err) {
        DEBUG_BUILD$2 && debug.error("Failed to setup Fastify instrumentation", err);
      } else {
        instrumentClient();
        if (fastifyInstance) {
          instrumentOnRequest(fastifyInstance);
        }
      }
    });
  });
  diagnosticsChannel.subscribe("tracing:fastify.request.handler:error", (message) => {
    const { error: error2, request, reply } = message;
    handleFastifyError.call(handleFastifyError, error2, request, reply, "diagnostics-channel");
  });
  return fastifyOtelInstrumentationInstance;
});
const _fastifyIntegration = (({ shouldHandleError }) => {
  let _shouldHandleError;
  return {
    name: INTEGRATION_NAME$m,
    setupOnce() {
      _shouldHandleError = shouldHandleError || defaultShouldHandleError$1;
      instrumentFastifyV3();
      instrumentFastify();
    },
    getShouldHandleError() {
      return _shouldHandleError;
    },
    setShouldHandleError(fn) {
      _shouldHandleError = fn;
    }
  };
});
const fastifyIntegration = defineIntegration(
  (options = {}) => _fastifyIntegration(options)
);
function defaultShouldHandleError$1(_error, _request, reply) {
  const statusCode = reply.statusCode;
  return statusCode >= 500 || statusCode <= 299;
}
function setupFastifyErrorHandler(fastify, options) {
  if (options?.shouldHandleError) {
    getFastifyIntegration()?.setShouldHandleError(options.shouldHandleError);
  }
  const plugin = Object.assign(
    function(fastify2, _options, done) {
      fastify2.addHook("onError", async (request, reply, error2) => {
        handleFastifyError.call(handleFastifyError, error2, request, reply, "onError-hook");
      });
      done();
    },
    {
      [Symbol.for("skip-override")]: true,
      [Symbol.for("fastify.display-name")]: "sentry-fastify-error-handler"
    }
  );
  fastify.register(plugin);
}
function addFastifySpanAttributes(span) {
  const spanJSON = spanToJSON(span);
  const spanName = spanJSON.description;
  const attributes = spanJSON.data;
  const type = attributes["fastify.type"];
  const isHook = type === "hook";
  const isHandler = type === spanName?.startsWith("handler -");
  const isRequestHandler = spanName === "request" || type === "request-handler";
  if (attributes[SEMANTIC_ATTRIBUTE_SENTRY_OP] || !isHandler && !isRequestHandler && !isHook) {
    return;
  }
  const opPrefix = isHook ? "hook" : isHandler ? "middleware" : isRequestHandler ? "request_handler" : "<unknown>";
  span.setAttributes({
    [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.otel.fastify",
    [SEMANTIC_ATTRIBUTE_SENTRY_OP]: `${opPrefix}.fastify`
  });
  const attrName = attributes["fastify.name"] || attributes["plugin.name"] || attributes["hook.name"];
  if (typeof attrName === "string") {
    const updatedName = attrName.replace(/^fastify -> /, "").replace(/^@fastify\/otel -> /, "");
    span.updateName(updatedName);
  }
}
function instrumentClient() {
  const client = getClient();
  if (client) {
    client.on("spanStart", (span) => {
      addFastifySpanAttributes(span);
    });
  }
}
function instrumentOnRequest(fastify) {
  fastify.addHook("onRequest", async (request, _reply) => {
    if (request.opentelemetry) {
      const { span } = request.opentelemetry();
      if (span) {
        addFastifySpanAttributes(span);
      }
    }
    const routeName = request.routeOptions?.url;
    const method = request.method || "GET";
    getIsolationScope().setTransactionName(`${method} ${routeName}`);
  });
}
var src$j = {};
var instrumentation$g = {};
var _enum = {};
var hasRequired_enum;
function require_enum() {
  if (hasRequired_enum) return _enum;
  hasRequired_enum = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.SpanNames = exports$1.TokenKind = exports$1.AllowedOperationTypes = void 0;
    (function(AllowedOperationTypes) {
      AllowedOperationTypes["QUERY"] = "query";
      AllowedOperationTypes["MUTATION"] = "mutation";
      AllowedOperationTypes["SUBSCRIPTION"] = "subscription";
    })(exports$1.AllowedOperationTypes || (exports$1.AllowedOperationTypes = {}));
    (function(TokenKind) {
      TokenKind["SOF"] = "<SOF>";
      TokenKind["EOF"] = "<EOF>";
      TokenKind["BANG"] = "!";
      TokenKind["DOLLAR"] = "$";
      TokenKind["AMP"] = "&";
      TokenKind["PAREN_L"] = "(";
      TokenKind["PAREN_R"] = ")";
      TokenKind["SPREAD"] = "...";
      TokenKind["COLON"] = ":";
      TokenKind["EQUALS"] = "=";
      TokenKind["AT"] = "@";
      TokenKind["BRACKET_L"] = "[";
      TokenKind["BRACKET_R"] = "]";
      TokenKind["BRACE_L"] = "{";
      TokenKind["PIPE"] = "|";
      TokenKind["BRACE_R"] = "}";
      TokenKind["NAME"] = "Name";
      TokenKind["INT"] = "Int";
      TokenKind["FLOAT"] = "Float";
      TokenKind["STRING"] = "String";
      TokenKind["BLOCK_STRING"] = "BlockString";
      TokenKind["COMMENT"] = "Comment";
    })(exports$1.TokenKind || (exports$1.TokenKind = {}));
    (function(SpanNames2) {
      SpanNames2["EXECUTE"] = "graphql.execute";
      SpanNames2["PARSE"] = "graphql.parse";
      SpanNames2["RESOLVE"] = "graphql.resolve";
      SpanNames2["VALIDATE"] = "graphql.validate";
      SpanNames2["SCHEMA_VALIDATE"] = "graphql.validateSchema";
      SpanNames2["SCHEMA_PARSE"] = "graphql.parseSchema";
    })(exports$1.SpanNames || (exports$1.SpanNames = {}));
  })(_enum);
  return _enum;
}
var AttributeNames$6 = {};
var hasRequiredAttributeNames$5;
function requireAttributeNames$5() {
  if (hasRequiredAttributeNames$5) return AttributeNames$6;
  hasRequiredAttributeNames$5 = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.AttributeNames = void 0;
    (function(AttributeNames2) {
      AttributeNames2["SOURCE"] = "graphql.source";
      AttributeNames2["FIELD_NAME"] = "graphql.field.name";
      AttributeNames2["FIELD_PATH"] = "graphql.field.path";
      AttributeNames2["FIELD_TYPE"] = "graphql.field.type";
      AttributeNames2["OPERATION_TYPE"] = "graphql.operation.type";
      AttributeNames2["OPERATION_NAME"] = "graphql.operation.name";
      AttributeNames2["VARIABLES"] = "graphql.variables.";
      AttributeNames2["ERROR_VALIDATION_NAME"] = "graphql.validation.error";
    })(exports$1.AttributeNames || (exports$1.AttributeNames = {}));
  })(AttributeNames$6);
  return AttributeNames$6;
}
var symbols = {};
var hasRequiredSymbols;
function requireSymbols() {
  if (hasRequiredSymbols) return symbols;
  hasRequiredSymbols = 1;
  Object.defineProperty(symbols, "__esModule", { value: true });
  symbols.OTEL_GRAPHQL_DATA_SYMBOL = symbols.OTEL_PATCHED_SYMBOL = void 0;
  symbols.OTEL_PATCHED_SYMBOL = Symbol.for("opentelemetry.patched");
  symbols.OTEL_GRAPHQL_DATA_SYMBOL = Symbol.for("opentelemetry.graphql_data");
  return symbols;
}
var internalTypes$6 = {};
var hasRequiredInternalTypes$6;
function requireInternalTypes$6() {
  if (hasRequiredInternalTypes$6) return internalTypes$6;
  hasRequiredInternalTypes$6 = 1;
  Object.defineProperty(internalTypes$6, "__esModule", { value: true });
  internalTypes$6.OPERATION_NOT_SUPPORTED = void 0;
  requireSymbols();
  internalTypes$6.OPERATION_NOT_SUPPORTED = "Operation$operationName$not supported";
  return internalTypes$6;
}
var utils$d = {};
var hasRequiredUtils$d;
function requireUtils$d() {
  if (hasRequiredUtils$d) return utils$d;
  hasRequiredUtils$d = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.wrapFieldResolver = exports$1.wrapFields = exports$1.getSourceFromLocation = exports$1.getOperation = exports$1.endSpan = exports$1.addSpanSource = exports$1.addInputVariableAttributes = exports$1.isPromise = void 0;
    const api = require$$0$2;
    const enum_1 = require_enum();
    const AttributeNames_1 = requireAttributeNames$5();
    const symbols_1 = requireSymbols();
    const OPERATION_VALUES = Object.values(enum_1.AllowedOperationTypes);
    const isPromise2 = (value) => {
      return typeof value?.then === "function";
    };
    exports$1.isPromise = isPromise2;
    const isObjectLike2 = (value) => {
      return typeof value == "object" && value !== null;
    };
    function addInputVariableAttribute(span, key, variable) {
      if (Array.isArray(variable)) {
        variable.forEach((value, idx) => {
          addInputVariableAttribute(span, `${key}.${idx}`, value);
        });
      } else if (variable instanceof Object) {
        Object.entries(variable).forEach(([nestedKey, value]) => {
          addInputVariableAttribute(span, `${key}.${nestedKey}`, value);
        });
      } else {
        span.setAttribute(`${AttributeNames_1.AttributeNames.VARIABLES}${String(key)}`, variable);
      }
    }
    function addInputVariableAttributes(span, variableValues) {
      Object.entries(variableValues).forEach(([key, value]) => {
        addInputVariableAttribute(span, key, value);
      });
    }
    exports$1.addInputVariableAttributes = addInputVariableAttributes;
    function addSpanSource(span, loc, allowValues, start, end) {
      const source = getSourceFromLocation(loc, allowValues, start, end);
      span.setAttribute(AttributeNames_1.AttributeNames.SOURCE, source);
    }
    exports$1.addSpanSource = addSpanSource;
    function createFieldIfNotExists(tracer, getConfig, contextValue, info, path) {
      let field = getField(contextValue, path);
      if (field) {
        return { field, spanAdded: false };
      }
      const config2 = getConfig();
      const parentSpan = config2.flatResolveSpans ? getRootSpan2(contextValue) : getParentFieldSpan(contextValue, path);
      field = {
        span: createResolverSpan(tracer, getConfig, contextValue, info, path, parentSpan)
      };
      addField(contextValue, path, field);
      return { field, spanAdded: true };
    }
    function createResolverSpan(tracer, getConfig, contextValue, info, path, parentSpan) {
      const attributes = {
        [AttributeNames_1.AttributeNames.FIELD_NAME]: info.fieldName,
        [AttributeNames_1.AttributeNames.FIELD_PATH]: path.join("."),
        [AttributeNames_1.AttributeNames.FIELD_TYPE]: info.returnType.toString()
      };
      const span = tracer.startSpan(`${enum_1.SpanNames.RESOLVE} ${attributes[AttributeNames_1.AttributeNames.FIELD_PATH]}`, {
        attributes
      }, parentSpan ? api.trace.setSpan(api.context.active(), parentSpan) : void 0);
      const document = contextValue[symbols_1.OTEL_GRAPHQL_DATA_SYMBOL].source;
      const fieldNode = info.fieldNodes.find((fieldNode2) => fieldNode2.kind === "Field");
      if (fieldNode) {
        addSpanSource(span, document.loc, getConfig().allowValues, fieldNode.loc?.start, fieldNode.loc?.end);
      }
      return span;
    }
    function endSpan2(span, error2) {
      if (error2) {
        span.recordException(error2);
      }
      span.end();
    }
    exports$1.endSpan = endSpan2;
    function getOperation(document, operationName) {
      if (!document || !Array.isArray(document.definitions)) {
        return void 0;
      }
      if (operationName) {
        return document.definitions.filter((definition) => OPERATION_VALUES.indexOf(definition?.operation) !== -1).find((definition) => operationName === definition?.name?.value);
      } else {
        return document.definitions.find((definition) => OPERATION_VALUES.indexOf(definition?.operation) !== -1);
      }
    }
    exports$1.getOperation = getOperation;
    function addField(contextValue, path, field) {
      return contextValue[symbols_1.OTEL_GRAPHQL_DATA_SYMBOL].fields[path.join(".")] = field;
    }
    function getField(contextValue, path) {
      return contextValue[symbols_1.OTEL_GRAPHQL_DATA_SYMBOL].fields[path.join(".")];
    }
    function getParentFieldSpan(contextValue, path) {
      for (let i = path.length - 1; i > 0; i--) {
        const field = getField(contextValue, path.slice(0, i));
        if (field) {
          return field.span;
        }
      }
      return getRootSpan2(contextValue);
    }
    function getRootSpan2(contextValue) {
      return contextValue[symbols_1.OTEL_GRAPHQL_DATA_SYMBOL].span;
    }
    function pathToArray(mergeItems, path) {
      const flattened = [];
      let curr = path;
      while (curr) {
        let key = curr.key;
        if (mergeItems && typeof key === "number") {
          key = "*";
        }
        flattened.push(String(key));
        curr = curr.prev;
      }
      return flattened.reverse();
    }
    function repeatBreak(i) {
      return repeatChar("\n", i);
    }
    function repeatSpace(i) {
      return repeatChar(" ", i);
    }
    function repeatChar(char, to) {
      let text = "";
      for (let i = 0; i < to; i++) {
        text += char;
      }
      return text;
    }
    const KindsToBeRemoved = [
      enum_1.TokenKind.FLOAT,
      enum_1.TokenKind.STRING,
      enum_1.TokenKind.INT,
      enum_1.TokenKind.BLOCK_STRING
    ];
    function getSourceFromLocation(loc, allowValues = false, inputStart, inputEnd) {
      let source = "";
      if (loc?.startToken) {
        const start = typeof inputStart === "number" ? inputStart : loc.start;
        const end = typeof inputEnd === "number" ? inputEnd : loc.end;
        let next = loc.startToken.next;
        let previousLine = 1;
        while (next) {
          if (next.start < start) {
            next = next.next;
            previousLine = next?.line;
            continue;
          }
          if (next.end > end) {
            next = next.next;
            previousLine = next?.line;
            continue;
          }
          let value = next.value || next.kind;
          let space = "";
          if (!allowValues && KindsToBeRemoved.indexOf(next.kind) >= 0) {
            value = "*";
          }
          if (next.kind === enum_1.TokenKind.STRING) {
            value = `"${value}"`;
          }
          if (next.kind === enum_1.TokenKind.EOF) {
            value = "";
          }
          if (next.line > previousLine) {
            source += repeatBreak(next.line - previousLine);
            previousLine = next.line;
            space = repeatSpace(next.column - 1);
          } else {
            if (next.line === next.prev?.line) {
              space = repeatSpace(next.start - (next.prev?.end || 0));
            }
          }
          source += space + value;
          if (next) {
            next = next.next;
          }
        }
      }
      return source;
    }
    exports$1.getSourceFromLocation = getSourceFromLocation;
    function wrapFields(type, tracer, getConfig) {
      if (!type || type[symbols_1.OTEL_PATCHED_SYMBOL]) {
        return;
      }
      const fields = type.getFields();
      type[symbols_1.OTEL_PATCHED_SYMBOL] = true;
      Object.keys(fields).forEach((key) => {
        const field = fields[key];
        if (!field) {
          return;
        }
        if (field.resolve) {
          field.resolve = wrapFieldResolver(tracer, getConfig, field.resolve);
        }
        if (field.type) {
          const unwrappedTypes = unwrapType(field.type);
          for (const unwrappedType of unwrappedTypes) {
            wrapFields(unwrappedType, tracer, getConfig);
          }
        }
      });
    }
    exports$1.wrapFields = wrapFields;
    function unwrapType(type) {
      if ("ofType" in type) {
        return unwrapType(type.ofType);
      }
      if (isGraphQLUnionType(type)) {
        return type.getTypes();
      }
      if (isGraphQLObjectType(type)) {
        return [type];
      }
      return [];
    }
    function isGraphQLUnionType(type) {
      return "getTypes" in type && typeof type.getTypes === "function";
    }
    function isGraphQLObjectType(type) {
      return "getFields" in type && typeof type.getFields === "function";
    }
    const handleResolveSpanError = (resolveSpan, err, shouldEndSpan) => {
      if (!shouldEndSpan) {
        return;
      }
      resolveSpan.recordException(err);
      resolveSpan.setStatus({
        code: api.SpanStatusCode.ERROR,
        message: err.message
      });
      resolveSpan.end();
    };
    const handleResolveSpanSuccess = (resolveSpan, shouldEndSpan) => {
      if (!shouldEndSpan) {
        return;
      }
      resolveSpan.end();
    };
    function wrapFieldResolver(tracer, getConfig, fieldResolver, isDefaultResolver = false) {
      if (wrappedFieldResolver[symbols_1.OTEL_PATCHED_SYMBOL] || typeof fieldResolver !== "function") {
        return fieldResolver;
      }
      function wrappedFieldResolver(source, args, contextValue, info) {
        if (!fieldResolver) {
          return void 0;
        }
        const config2 = getConfig();
        if (config2.ignoreTrivialResolveSpans && isDefaultResolver && (isObjectLike2(source) || typeof source === "function")) {
          const property = source[info.fieldName];
          if (typeof property !== "function") {
            return fieldResolver.call(this, source, args, contextValue, info);
          }
        }
        if (!contextValue[symbols_1.OTEL_GRAPHQL_DATA_SYMBOL]) {
          return fieldResolver.call(this, source, args, contextValue, info);
        }
        const path = pathToArray(config2.mergeItems, info && info.path);
        const depth = path.filter((item) => typeof item === "string").length;
        let span;
        let shouldEndSpan = false;
        if (config2.depth >= 0 && config2.depth < depth) {
          span = getParentFieldSpan(contextValue, path);
        } else {
          const { field, spanAdded } = createFieldIfNotExists(tracer, getConfig, contextValue, info, path);
          span = field.span;
          shouldEndSpan = spanAdded;
        }
        return api.context.with(api.trace.setSpan(api.context.active(), span), () => {
          try {
            const res = fieldResolver.call(this, source, args, contextValue, info);
            if ((0, exports$1.isPromise)(res)) {
              return res.then((r) => {
                handleResolveSpanSuccess(span, shouldEndSpan);
                return r;
              }, (err) => {
                handleResolveSpanError(span, err, shouldEndSpan);
                throw err;
              });
            } else {
              handleResolveSpanSuccess(span, shouldEndSpan);
              return res;
            }
          } catch (err) {
            handleResolveSpanError(span, err, shouldEndSpan);
            throw err;
          }
        });
      }
      wrappedFieldResolver[symbols_1.OTEL_PATCHED_SYMBOL] = true;
      return wrappedFieldResolver;
    }
    exports$1.wrapFieldResolver = wrapFieldResolver;
  })(utils$d);
  return utils$d;
}
var version$h = {};
var hasRequiredVersion$h;
function requireVersion$h() {
  if (hasRequiredVersion$h) return version$h;
  hasRequiredVersion$h = 1;
  Object.defineProperty(version$h, "__esModule", { value: true });
  version$h.PACKAGE_NAME = version$h.PACKAGE_VERSION = void 0;
  version$h.PACKAGE_VERSION = "0.58.0";
  version$h.PACKAGE_NAME = "@opentelemetry/instrumentation-graphql";
  return version$h;
}
var hasRequiredInstrumentation$g;
function requireInstrumentation$g() {
  if (hasRequiredInstrumentation$g) return instrumentation$g;
  hasRequiredInstrumentation$g = 1;
  Object.defineProperty(instrumentation$g, "__esModule", { value: true });
  instrumentation$g.GraphQLInstrumentation = void 0;
  const api_1 = require$$0$2;
  const instrumentation_1 = require$$2;
  const enum_1 = require_enum();
  const AttributeNames_1 = requireAttributeNames$5();
  const symbols_1 = requireSymbols();
  const internal_types_1 = requireInternalTypes$6();
  const utils_1 = requireUtils$d();
  const version_1 = requireVersion$h();
  const DEFAULT_CONFIG = {
    mergeItems: false,
    depth: -1,
    allowValues: false,
    ignoreResolveSpans: false
  };
  const supportedVersions2 = [">=14.0.0 <17"];
  class GraphQLInstrumentation extends instrumentation_1.InstrumentationBase {
    constructor(config2 = {}) {
      super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, { ...DEFAULT_CONFIG, ...config2 });
    }
    setConfig(config2 = {}) {
      super.setConfig({ ...DEFAULT_CONFIG, ...config2 });
    }
    init() {
      const module2 = new instrumentation_1.InstrumentationNodeModuleDefinition("graphql", supportedVersions2);
      module2.files.push(this._addPatchingExecute());
      module2.files.push(this._addPatchingParser());
      module2.files.push(this._addPatchingValidate());
      return module2;
    }
    _addPatchingExecute() {
      return new instrumentation_1.InstrumentationNodeModuleFile(
        "graphql/execution/execute.js",
        supportedVersions2,
        // cannot make it work with appropriate type as execute function has 2
        //types and/cannot import function but only types
        (moduleExports) => {
          if ((0, instrumentation_1.isWrapped)(moduleExports.execute)) {
            this._unwrap(moduleExports, "execute");
          }
          this._wrap(moduleExports, "execute", this._patchExecute(moduleExports.defaultFieldResolver));
          return moduleExports;
        },
        (moduleExports) => {
          if (moduleExports) {
            this._unwrap(moduleExports, "execute");
          }
        }
      );
    }
    _addPatchingParser() {
      return new instrumentation_1.InstrumentationNodeModuleFile("graphql/language/parser.js", supportedVersions2, (moduleExports) => {
        if ((0, instrumentation_1.isWrapped)(moduleExports.parse)) {
          this._unwrap(moduleExports, "parse");
        }
        this._wrap(moduleExports, "parse", this._patchParse());
        return moduleExports;
      }, (moduleExports) => {
        if (moduleExports) {
          this._unwrap(moduleExports, "parse");
        }
      });
    }
    _addPatchingValidate() {
      return new instrumentation_1.InstrumentationNodeModuleFile("graphql/validation/validate.js", supportedVersions2, (moduleExports) => {
        if ((0, instrumentation_1.isWrapped)(moduleExports.validate)) {
          this._unwrap(moduleExports, "validate");
        }
        this._wrap(moduleExports, "validate", this._patchValidate());
        return moduleExports;
      }, (moduleExports) => {
        if (moduleExports) {
          this._unwrap(moduleExports, "validate");
        }
      });
    }
    _patchExecute(defaultFieldResolved) {
      const instrumentation2 = this;
      return function execute(original) {
        return function patchExecute() {
          let processedArgs;
          if (arguments.length >= 2) {
            const args = arguments;
            processedArgs = instrumentation2._wrapExecuteArgs(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], defaultFieldResolved);
          } else {
            const args = arguments[0];
            processedArgs = instrumentation2._wrapExecuteArgs(args.schema, args.document, args.rootValue, args.contextValue, args.variableValues, args.operationName, args.fieldResolver, args.typeResolver, defaultFieldResolved);
          }
          const operation = (0, utils_1.getOperation)(processedArgs.document, processedArgs.operationName);
          const span = instrumentation2._createExecuteSpan(operation, processedArgs);
          processedArgs.contextValue[symbols_1.OTEL_GRAPHQL_DATA_SYMBOL] = {
            source: processedArgs.document ? processedArgs.document || processedArgs.document[symbols_1.OTEL_GRAPHQL_DATA_SYMBOL] : void 0,
            span,
            fields: {}
          };
          return api_1.context.with(api_1.trace.setSpan(api_1.context.active(), span), () => {
            return (0, instrumentation_1.safeExecuteInTheMiddle)(() => {
              return original.apply(this, [
                processedArgs
              ]);
            }, (err, result) => {
              instrumentation2._handleExecutionResult(span, err, result);
            });
          });
        };
      };
    }
    _handleExecutionResult(span, err, result) {
      const config2 = this.getConfig();
      if (result === void 0 || err) {
        (0, utils_1.endSpan)(span, err);
        return;
      }
      if ((0, utils_1.isPromise)(result)) {
        result.then((resultData) => {
          if (typeof config2.responseHook !== "function") {
            (0, utils_1.endSpan)(span);
            return;
          }
          this._executeResponseHook(span, resultData);
        }, (error2) => {
          (0, utils_1.endSpan)(span, error2);
        });
      } else {
        if (typeof config2.responseHook !== "function") {
          (0, utils_1.endSpan)(span);
          return;
        }
        this._executeResponseHook(span, result);
      }
    }
    _executeResponseHook(span, result) {
      const { responseHook } = this.getConfig();
      if (!responseHook) {
        return;
      }
      (0, instrumentation_1.safeExecuteInTheMiddle)(() => {
        responseHook(span, result);
      }, (err) => {
        if (err) {
          this._diag.error("Error running response hook", err);
        }
        (0, utils_1.endSpan)(span, void 0);
      }, true);
    }
    _patchParse() {
      const instrumentation2 = this;
      return function parse(original) {
        return function patchParse(source, options) {
          return instrumentation2._parse(this, original, source, options);
        };
      };
    }
    _patchValidate() {
      const instrumentation2 = this;
      return function validate(original) {
        return function patchValidate(schema, documentAST, rules, options, typeInfo) {
          return instrumentation2._validate(this, original, schema, documentAST, rules, typeInfo, options);
        };
      };
    }
    _parse(obj, original, source, options) {
      const config2 = this.getConfig();
      const span = this.tracer.startSpan(enum_1.SpanNames.PARSE);
      return api_1.context.with(api_1.trace.setSpan(api_1.context.active(), span), () => {
        return (0, instrumentation_1.safeExecuteInTheMiddle)(() => {
          return original.call(obj, source, options);
        }, (err, result) => {
          if (result) {
            const operation = (0, utils_1.getOperation)(result);
            if (!operation) {
              span.updateName(enum_1.SpanNames.SCHEMA_PARSE);
            } else if (result.loc) {
              (0, utils_1.addSpanSource)(span, result.loc, config2.allowValues);
            }
          }
          (0, utils_1.endSpan)(span, err);
        });
      });
    }
    _validate(obj, original, schema, documentAST, rules, typeInfo, options) {
      const span = this.tracer.startSpan(enum_1.SpanNames.VALIDATE, {});
      return api_1.context.with(api_1.trace.setSpan(api_1.context.active(), span), () => {
        return (0, instrumentation_1.safeExecuteInTheMiddle)(() => {
          return original.call(obj, schema, documentAST, rules, options, typeInfo);
        }, (err, errors) => {
          if (!documentAST.loc) {
            span.updateName(enum_1.SpanNames.SCHEMA_VALIDATE);
          }
          if (errors && errors.length) {
            span.recordException({
              name: AttributeNames_1.AttributeNames.ERROR_VALIDATION_NAME,
              message: JSON.stringify(errors)
            });
          }
          (0, utils_1.endSpan)(span, err);
        });
      });
    }
    _createExecuteSpan(operation, processedArgs) {
      const config2 = this.getConfig();
      const span = this.tracer.startSpan(enum_1.SpanNames.EXECUTE, {});
      if (operation) {
        const { operation: operationType, name: nameNode } = operation;
        span.setAttribute(AttributeNames_1.AttributeNames.OPERATION_TYPE, operationType);
        const operationName = nameNode?.value;
        if (operationName) {
          span.setAttribute(AttributeNames_1.AttributeNames.OPERATION_NAME, operationName);
          span.updateName(`${operationType} ${operationName}`);
        } else {
          span.updateName(operationType);
        }
      } else {
        let operationName = " ";
        if (processedArgs.operationName) {
          operationName = ` "${processedArgs.operationName}" `;
        }
        operationName = internal_types_1.OPERATION_NOT_SUPPORTED.replace("$operationName$", operationName);
        span.setAttribute(AttributeNames_1.AttributeNames.OPERATION_NAME, operationName);
      }
      if (processedArgs.document?.loc) {
        (0, utils_1.addSpanSource)(span, processedArgs.document.loc, config2.allowValues);
      }
      if (processedArgs.variableValues && config2.allowValues) {
        (0, utils_1.addInputVariableAttributes)(span, processedArgs.variableValues);
      }
      return span;
    }
    _wrapExecuteArgs(schema, document, rootValue, contextValue, variableValues, operationName, fieldResolver, typeResolver, defaultFieldResolved) {
      if (!contextValue) {
        contextValue = {};
      }
      if (contextValue[symbols_1.OTEL_GRAPHQL_DATA_SYMBOL] || this.getConfig().ignoreResolveSpans) {
        return {
          schema,
          document,
          rootValue,
          contextValue,
          variableValues,
          operationName,
          fieldResolver,
          typeResolver
        };
      }
      const isUsingDefaultResolver = fieldResolver == null;
      const fieldResolverForExecute = fieldResolver ?? defaultFieldResolved;
      fieldResolver = (0, utils_1.wrapFieldResolver)(this.tracer, () => this.getConfig(), fieldResolverForExecute, isUsingDefaultResolver);
      if (schema) {
        (0, utils_1.wrapFields)(schema.getQueryType(), this.tracer, () => this.getConfig());
        (0, utils_1.wrapFields)(schema.getMutationType(), this.tracer, () => this.getConfig());
      }
      return {
        schema,
        document,
        rootValue,
        contextValue,
        variableValues,
        operationName,
        fieldResolver,
        typeResolver
      };
    }
  }
  instrumentation$g.GraphQLInstrumentation = GraphQLInstrumentation;
  return instrumentation$g;
}
var hasRequiredSrc$j;
function requireSrc$j() {
  if (hasRequiredSrc$j) return src$j;
  hasRequiredSrc$j = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.GraphQLInstrumentation = void 0;
    var instrumentation_1 = requireInstrumentation$g();
    Object.defineProperty(exports$1, "GraphQLInstrumentation", { enumerable: true, get: function() {
      return instrumentation_1.GraphQLInstrumentation;
    } });
  })(src$j);
  return src$j;
}
var srcExports$h = requireSrc$j();
const INTEGRATION_NAME$l = "Graphql";
const instrumentGraphql = generateInstrumentOnce(
  INTEGRATION_NAME$l,
  srcExports$h.GraphQLInstrumentation,
  (_options) => {
    const options = getOptionsWithDefaults(_options);
    return {
      ...options,
      responseHook(span, result) {
        addOriginToSpan(span, "auto.graphql.otel.graphql");
        const resultWithMaybeError = result;
        if (resultWithMaybeError.errors?.length && !spanToJSON(span).status) {
          span.setStatus({ code: SpanStatusCode.ERROR });
        }
        const attributes = spanToJSON(span).data;
        const operationType = attributes["graphql.operation.type"];
        const operationName = attributes["graphql.operation.name"];
        if (options.useOperationNameForRootSpan && operationType) {
          const rootSpan = getRootSpan(span);
          const rootSpanAttributes = spanToJSON(rootSpan).data;
          const existingOperations = rootSpanAttributes[SEMANTIC_ATTRIBUTE_SENTRY_GRAPHQL_OPERATION] || [];
          const newOperation = operationName ? `${operationType} ${operationName}` : `${operationType}`;
          if (Array.isArray(existingOperations)) {
            existingOperations.push(newOperation);
            rootSpan.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_GRAPHQL_OPERATION, existingOperations);
          } else if (typeof existingOperations === "string") {
            rootSpan.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_GRAPHQL_OPERATION, [existingOperations, newOperation]);
          } else {
            rootSpan.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_GRAPHQL_OPERATION, newOperation);
          }
          if (!spanToJSON(rootSpan).data["original-description"]) {
            rootSpan.setAttribute("original-description", spanToJSON(rootSpan).description);
          }
          rootSpan.updateName(
            `${spanToJSON(rootSpan).data["original-description"]} (${getGraphqlOperationNamesFromAttribute(
              existingOperations
            )})`
          );
        }
      }
    };
  }
);
const _graphqlIntegration = ((options = {}) => {
  return {
    name: INTEGRATION_NAME$l,
    setupOnce() {
      instrumentGraphql(getOptionsWithDefaults(options));
    }
  };
});
const graphqlIntegration = defineIntegration(_graphqlIntegration);
function getOptionsWithDefaults(options) {
  return {
    ignoreResolveSpans: true,
    ignoreTrivialResolveSpans: true,
    useOperationNameForRootSpan: true,
    ...options
  };
}
function getGraphqlOperationNamesFromAttribute(attr) {
  if (Array.isArray(attr)) {
    const sorted = attr.slice().sort();
    if (sorted.length <= 5) {
      return sorted.join(", ");
    } else {
      return `${sorted.slice(0, 5).join(", ")}, +${sorted.length - 5}`;
    }
  }
  return `${attr}`;
}
var src$i = {};
var instrumentation$f = {};
var internalTypes$5 = {};
var hasRequiredInternalTypes$5;
function requireInternalTypes$5() {
  if (hasRequiredInternalTypes$5) return internalTypes$5;
  hasRequiredInternalTypes$5 = 1;
  Object.defineProperty(internalTypes$5, "__esModule", { value: true });
  internalTypes$5.EVENT_LISTENERS_SET = void 0;
  internalTypes$5.EVENT_LISTENERS_SET = Symbol("opentelemetry.instrumentation.kafkajs.eventListenersSet");
  return internalTypes$5;
}
var propagator = {};
var hasRequiredPropagator;
function requirePropagator() {
  if (hasRequiredPropagator) return propagator;
  hasRequiredPropagator = 1;
  Object.defineProperty(propagator, "__esModule", { value: true });
  propagator.bufferTextMapGetter = void 0;
  propagator.bufferTextMapGetter = {
    get(carrier, key) {
      if (!carrier) {
        return void 0;
      }
      const keys = Object.keys(carrier);
      for (const carrierKey of keys) {
        if (carrierKey === key || carrierKey.toLowerCase() === key) {
          return carrier[carrierKey]?.toString();
        }
      }
      return void 0;
    },
    keys(carrier) {
      return carrier ? Object.keys(carrier) : [];
    }
  };
  return propagator;
}
var semconv$b = {};
var hasRequiredSemconv$b;
function requireSemconv$b() {
  if (hasRequiredSemconv$b) return semconv$b;
  hasRequiredSemconv$b = 1;
  Object.defineProperty(semconv$b, "__esModule", { value: true });
  semconv$b.METRIC_MESSAGING_PROCESS_DURATION = semconv$b.METRIC_MESSAGING_CLIENT_SENT_MESSAGES = semconv$b.METRIC_MESSAGING_CLIENT_OPERATION_DURATION = semconv$b.METRIC_MESSAGING_CLIENT_CONSUMED_MESSAGES = semconv$b.MESSAGING_SYSTEM_VALUE_KAFKA = semconv$b.MESSAGING_OPERATION_TYPE_VALUE_SEND = semconv$b.MESSAGING_OPERATION_TYPE_VALUE_RECEIVE = semconv$b.MESSAGING_OPERATION_TYPE_VALUE_PROCESS = semconv$b.ATTR_MESSAGING_SYSTEM = semconv$b.ATTR_MESSAGING_OPERATION_TYPE = semconv$b.ATTR_MESSAGING_OPERATION_NAME = semconv$b.ATTR_MESSAGING_KAFKA_OFFSET = semconv$b.ATTR_MESSAGING_KAFKA_MESSAGE_TOMBSTONE = semconv$b.ATTR_MESSAGING_KAFKA_MESSAGE_KEY = semconv$b.ATTR_MESSAGING_DESTINATION_PARTITION_ID = semconv$b.ATTR_MESSAGING_DESTINATION_NAME = semconv$b.ATTR_MESSAGING_BATCH_MESSAGE_COUNT = void 0;
  semconv$b.ATTR_MESSAGING_BATCH_MESSAGE_COUNT = "messaging.batch.message_count";
  semconv$b.ATTR_MESSAGING_DESTINATION_NAME = "messaging.destination.name";
  semconv$b.ATTR_MESSAGING_DESTINATION_PARTITION_ID = "messaging.destination.partition.id";
  semconv$b.ATTR_MESSAGING_KAFKA_MESSAGE_KEY = "messaging.kafka.message.key";
  semconv$b.ATTR_MESSAGING_KAFKA_MESSAGE_TOMBSTONE = "messaging.kafka.message.tombstone";
  semconv$b.ATTR_MESSAGING_KAFKA_OFFSET = "messaging.kafka.offset";
  semconv$b.ATTR_MESSAGING_OPERATION_NAME = "messaging.operation.name";
  semconv$b.ATTR_MESSAGING_OPERATION_TYPE = "messaging.operation.type";
  semconv$b.ATTR_MESSAGING_SYSTEM = "messaging.system";
  semconv$b.MESSAGING_OPERATION_TYPE_VALUE_PROCESS = "process";
  semconv$b.MESSAGING_OPERATION_TYPE_VALUE_RECEIVE = "receive";
  semconv$b.MESSAGING_OPERATION_TYPE_VALUE_SEND = "send";
  semconv$b.MESSAGING_SYSTEM_VALUE_KAFKA = "kafka";
  semconv$b.METRIC_MESSAGING_CLIENT_CONSUMED_MESSAGES = "messaging.client.consumed.messages";
  semconv$b.METRIC_MESSAGING_CLIENT_OPERATION_DURATION = "messaging.client.operation.duration";
  semconv$b.METRIC_MESSAGING_CLIENT_SENT_MESSAGES = "messaging.client.sent.messages";
  semconv$b.METRIC_MESSAGING_PROCESS_DURATION = "messaging.process.duration";
  return semconv$b;
}
var version$g = {};
var hasRequiredVersion$g;
function requireVersion$g() {
  if (hasRequiredVersion$g) return version$g;
  hasRequiredVersion$g = 1;
  Object.defineProperty(version$g, "__esModule", { value: true });
  version$g.PACKAGE_NAME = version$g.PACKAGE_VERSION = void 0;
  version$g.PACKAGE_VERSION = "0.20.0";
  version$g.PACKAGE_NAME = "@opentelemetry/instrumentation-kafkajs";
  return version$g;
}
var hasRequiredInstrumentation$f;
function requireInstrumentation$f() {
  if (hasRequiredInstrumentation$f) return instrumentation$f;
  hasRequiredInstrumentation$f = 1;
  Object.defineProperty(instrumentation$f, "__esModule", { value: true });
  instrumentation$f.KafkaJsInstrumentation = void 0;
  const api_1 = require$$0$2;
  const instrumentation_1 = require$$2;
  const semantic_conventions_1 = require$$2$1;
  const internal_types_1 = requireInternalTypes$5();
  const propagator_1 = requirePropagator();
  const semconv_1 = requireSemconv$b();
  const version_1 = requireVersion$g();
  function prepareCounter(meter, value, attributes) {
    return (errorType) => {
      meter.add(value, {
        ...attributes,
        ...errorType ? { [semantic_conventions_1.ATTR_ERROR_TYPE]: errorType } : {}
      });
    };
  }
  function prepareDurationHistogram(meter, value, attributes) {
    return (errorType) => {
      meter.record((Date.now() - value) / 1e3, {
        ...attributes,
        ...errorType ? { [semantic_conventions_1.ATTR_ERROR_TYPE]: errorType } : {}
      });
    };
  }
  const HISTOGRAM_BUCKET_BOUNDARIES = [
    5e-3,
    0.01,
    0.025,
    0.05,
    0.075,
    0.1,
    0.25,
    0.5,
    0.75,
    1,
    2.5,
    5,
    7.5,
    10
  ];
  class KafkaJsInstrumentation extends instrumentation_1.InstrumentationBase {
    constructor(config2 = {}) {
      super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config2);
    }
    _updateMetricInstruments() {
      this._clientDuration = this.meter.createHistogram(semconv_1.METRIC_MESSAGING_CLIENT_OPERATION_DURATION, { advice: { explicitBucketBoundaries: HISTOGRAM_BUCKET_BOUNDARIES } });
      this._sentMessages = this.meter.createCounter(semconv_1.METRIC_MESSAGING_CLIENT_SENT_MESSAGES);
      this._consumedMessages = this.meter.createCounter(semconv_1.METRIC_MESSAGING_CLIENT_CONSUMED_MESSAGES);
      this._processDuration = this.meter.createHistogram(semconv_1.METRIC_MESSAGING_PROCESS_DURATION, { advice: { explicitBucketBoundaries: HISTOGRAM_BUCKET_BOUNDARIES } });
    }
    init() {
      const unpatch = (moduleExports) => {
        if ((0, instrumentation_1.isWrapped)(moduleExports?.Kafka?.prototype.producer)) {
          this._unwrap(moduleExports.Kafka.prototype, "producer");
        }
        if ((0, instrumentation_1.isWrapped)(moduleExports?.Kafka?.prototype.consumer)) {
          this._unwrap(moduleExports.Kafka.prototype, "consumer");
        }
      };
      const module2 = new instrumentation_1.InstrumentationNodeModuleDefinition("kafkajs", [">=0.3.0 <3"], (moduleExports) => {
        unpatch(moduleExports);
        this._wrap(moduleExports?.Kafka?.prototype, "producer", this._getProducerPatch());
        this._wrap(moduleExports?.Kafka?.prototype, "consumer", this._getConsumerPatch());
        return moduleExports;
      }, unpatch);
      return module2;
    }
    _getConsumerPatch() {
      const instrumentation2 = this;
      return (original) => {
        return function consumer(...args) {
          const newConsumer = original.apply(this, args);
          if ((0, instrumentation_1.isWrapped)(newConsumer.run)) {
            instrumentation2._unwrap(newConsumer, "run");
          }
          instrumentation2._wrap(newConsumer, "run", instrumentation2._getConsumerRunPatch());
          instrumentation2._setKafkaEventListeners(newConsumer);
          return newConsumer;
        };
      };
    }
    _setKafkaEventListeners(kafkaObj) {
      if (kafkaObj[internal_types_1.EVENT_LISTENERS_SET])
        return;
      if (kafkaObj.events?.REQUEST) {
        kafkaObj.on(kafkaObj.events.REQUEST, this._recordClientDurationMetric.bind(this));
      }
      kafkaObj[internal_types_1.EVENT_LISTENERS_SET] = true;
    }
    _recordClientDurationMetric(event) {
      const [address, port] = event.payload.broker.split(":");
      this._clientDuration.record(event.payload.duration / 1e3, {
        [semconv_1.ATTR_MESSAGING_SYSTEM]: semconv_1.MESSAGING_SYSTEM_VALUE_KAFKA,
        [semconv_1.ATTR_MESSAGING_OPERATION_NAME]: `${event.payload.apiName}`,
        [semantic_conventions_1.ATTR_SERVER_ADDRESS]: address,
        [semantic_conventions_1.ATTR_SERVER_PORT]: Number.parseInt(port, 10)
      });
    }
    _getProducerPatch() {
      const instrumentation2 = this;
      return (original) => {
        return function consumer(...args) {
          const newProducer = original.apply(this, args);
          if ((0, instrumentation_1.isWrapped)(newProducer.sendBatch)) {
            instrumentation2._unwrap(newProducer, "sendBatch");
          }
          instrumentation2._wrap(newProducer, "sendBatch", instrumentation2._getSendBatchPatch());
          if ((0, instrumentation_1.isWrapped)(newProducer.send)) {
            instrumentation2._unwrap(newProducer, "send");
          }
          instrumentation2._wrap(newProducer, "send", instrumentation2._getSendPatch());
          if ((0, instrumentation_1.isWrapped)(newProducer.transaction)) {
            instrumentation2._unwrap(newProducer, "transaction");
          }
          instrumentation2._wrap(newProducer, "transaction", instrumentation2._getProducerTransactionPatch());
          instrumentation2._setKafkaEventListeners(newProducer);
          return newProducer;
        };
      };
    }
    _getConsumerRunPatch() {
      const instrumentation2 = this;
      return (original) => {
        return function run(...args) {
          const config2 = args[0];
          if (config2?.eachMessage) {
            if ((0, instrumentation_1.isWrapped)(config2.eachMessage)) {
              instrumentation2._unwrap(config2, "eachMessage");
            }
            instrumentation2._wrap(config2, "eachMessage", instrumentation2._getConsumerEachMessagePatch());
          }
          if (config2?.eachBatch) {
            if ((0, instrumentation_1.isWrapped)(config2.eachBatch)) {
              instrumentation2._unwrap(config2, "eachBatch");
            }
            instrumentation2._wrap(config2, "eachBatch", instrumentation2._getConsumerEachBatchPatch());
          }
          return original.call(this, config2);
        };
      };
    }
    _getConsumerEachMessagePatch() {
      const instrumentation2 = this;
      return (original) => {
        return function eachMessage(...args) {
          const payload = args[0];
          const propagatedContext = api_1.propagation.extract(api_1.ROOT_CONTEXT, payload.message.headers, propagator_1.bufferTextMapGetter);
          const span = instrumentation2._startConsumerSpan({
            topic: payload.topic,
            message: payload.message,
            operationType: semconv_1.MESSAGING_OPERATION_TYPE_VALUE_PROCESS,
            ctx: propagatedContext,
            attributes: {
              [semconv_1.ATTR_MESSAGING_DESTINATION_PARTITION_ID]: String(payload.partition)
            }
          });
          const pendingMetrics = [
            prepareDurationHistogram(instrumentation2._processDuration, Date.now(), {
              [semconv_1.ATTR_MESSAGING_SYSTEM]: semconv_1.MESSAGING_SYSTEM_VALUE_KAFKA,
              [semconv_1.ATTR_MESSAGING_OPERATION_NAME]: "process",
              [semconv_1.ATTR_MESSAGING_DESTINATION_NAME]: payload.topic,
              [semconv_1.ATTR_MESSAGING_DESTINATION_PARTITION_ID]: String(payload.partition)
            }),
            prepareCounter(instrumentation2._consumedMessages, 1, {
              [semconv_1.ATTR_MESSAGING_SYSTEM]: semconv_1.MESSAGING_SYSTEM_VALUE_KAFKA,
              [semconv_1.ATTR_MESSAGING_OPERATION_NAME]: "process",
              [semconv_1.ATTR_MESSAGING_DESTINATION_NAME]: payload.topic,
              [semconv_1.ATTR_MESSAGING_DESTINATION_PARTITION_ID]: String(payload.partition)
            })
          ];
          const eachMessagePromise = api_1.context.with(api_1.trace.setSpan(propagatedContext, span), () => {
            return original.apply(this, args);
          });
          return instrumentation2._endSpansOnPromise([span], pendingMetrics, eachMessagePromise);
        };
      };
    }
    _getConsumerEachBatchPatch() {
      return (original) => {
        const instrumentation2 = this;
        return function eachBatch(...args) {
          const payload = args[0];
          const receivingSpan = instrumentation2._startConsumerSpan({
            topic: payload.batch.topic,
            message: void 0,
            operationType: semconv_1.MESSAGING_OPERATION_TYPE_VALUE_RECEIVE,
            ctx: api_1.ROOT_CONTEXT,
            attributes: {
              [semconv_1.ATTR_MESSAGING_BATCH_MESSAGE_COUNT]: payload.batch.messages.length,
              [semconv_1.ATTR_MESSAGING_DESTINATION_PARTITION_ID]: String(payload.batch.partition)
            }
          });
          return api_1.context.with(api_1.trace.setSpan(api_1.context.active(), receivingSpan), () => {
            const startTime = Date.now();
            const spans = [];
            const pendingMetrics = [
              prepareCounter(instrumentation2._consumedMessages, payload.batch.messages.length, {
                [semconv_1.ATTR_MESSAGING_SYSTEM]: semconv_1.MESSAGING_SYSTEM_VALUE_KAFKA,
                [semconv_1.ATTR_MESSAGING_OPERATION_NAME]: "process",
                [semconv_1.ATTR_MESSAGING_DESTINATION_NAME]: payload.batch.topic,
                [semconv_1.ATTR_MESSAGING_DESTINATION_PARTITION_ID]: String(payload.batch.partition)
              })
            ];
            payload.batch.messages.forEach((message) => {
              const propagatedContext = api_1.propagation.extract(api_1.ROOT_CONTEXT, message.headers, propagator_1.bufferTextMapGetter);
              const spanContext = api_1.trace.getSpan(propagatedContext)?.spanContext();
              let origSpanLink;
              if (spanContext) {
                origSpanLink = {
                  context: spanContext
                };
              }
              spans.push(instrumentation2._startConsumerSpan({
                topic: payload.batch.topic,
                message,
                operationType: semconv_1.MESSAGING_OPERATION_TYPE_VALUE_PROCESS,
                link: origSpanLink,
                attributes: {
                  [semconv_1.ATTR_MESSAGING_DESTINATION_PARTITION_ID]: String(payload.batch.partition)
                }
              }));
              pendingMetrics.push(prepareDurationHistogram(instrumentation2._processDuration, startTime, {
                [semconv_1.ATTR_MESSAGING_SYSTEM]: semconv_1.MESSAGING_SYSTEM_VALUE_KAFKA,
                [semconv_1.ATTR_MESSAGING_OPERATION_NAME]: "process",
                [semconv_1.ATTR_MESSAGING_DESTINATION_NAME]: payload.batch.topic,
                [semconv_1.ATTR_MESSAGING_DESTINATION_PARTITION_ID]: String(payload.batch.partition)
              }));
            });
            const batchMessagePromise = original.apply(this, args);
            spans.unshift(receivingSpan);
            return instrumentation2._endSpansOnPromise(spans, pendingMetrics, batchMessagePromise);
          });
        };
      };
    }
    _getProducerTransactionPatch() {
      const instrumentation2 = this;
      return (original) => {
        return function transaction(...args) {
          const transactionSpan = instrumentation2.tracer.startSpan("transaction");
          const transactionPromise = original.apply(this, args);
          transactionPromise.then((transaction2) => {
            const originalSend = transaction2.send;
            transaction2.send = function send(...args2) {
              return api_1.context.with(api_1.trace.setSpan(api_1.context.active(), transactionSpan), () => {
                const patched = instrumentation2._getSendPatch()(originalSend);
                return patched.apply(this, args2).catch((err) => {
                  transactionSpan.setStatus({
                    code: api_1.SpanStatusCode.ERROR,
                    message: err?.message
                  });
                  transactionSpan.recordException(err);
                  throw err;
                });
              });
            };
            const originalSendBatch = transaction2.sendBatch;
            transaction2.sendBatch = function sendBatch(...args2) {
              return api_1.context.with(api_1.trace.setSpan(api_1.context.active(), transactionSpan), () => {
                const patched = instrumentation2._getSendBatchPatch()(originalSendBatch);
                return patched.apply(this, args2).catch((err) => {
                  transactionSpan.setStatus({
                    code: api_1.SpanStatusCode.ERROR,
                    message: err?.message
                  });
                  transactionSpan.recordException(err);
                  throw err;
                });
              });
            };
            const originalCommit = transaction2.commit;
            transaction2.commit = function commit(...args2) {
              const originCommitPromise = originalCommit.apply(this, args2).then(() => {
                transactionSpan.setStatus({ code: api_1.SpanStatusCode.OK });
              });
              return instrumentation2._endSpansOnPromise([transactionSpan], [], originCommitPromise);
            };
            const originalAbort = transaction2.abort;
            transaction2.abort = function abort(...args2) {
              const originAbortPromise = originalAbort.apply(this, args2);
              return instrumentation2._endSpansOnPromise([transactionSpan], [], originAbortPromise);
            };
          }).catch((err) => {
            transactionSpan.setStatus({
              code: api_1.SpanStatusCode.ERROR,
              message: err?.message
            });
            transactionSpan.recordException(err);
            transactionSpan.end();
          });
          return transactionPromise;
        };
      };
    }
    _getSendBatchPatch() {
      const instrumentation2 = this;
      return (original) => {
        return function sendBatch(...args) {
          const batch = args[0];
          const messages = batch.topicMessages || [];
          const spans = [];
          const pendingMetrics = [];
          messages.forEach((topicMessage) => {
            topicMessage.messages.forEach((message) => {
              spans.push(instrumentation2._startProducerSpan(topicMessage.topic, message));
              pendingMetrics.push(prepareCounter(instrumentation2._sentMessages, 1, {
                [semconv_1.ATTR_MESSAGING_SYSTEM]: semconv_1.MESSAGING_SYSTEM_VALUE_KAFKA,
                [semconv_1.ATTR_MESSAGING_OPERATION_NAME]: "send",
                [semconv_1.ATTR_MESSAGING_DESTINATION_NAME]: topicMessage.topic,
                ...message.partition !== void 0 ? {
                  [semconv_1.ATTR_MESSAGING_DESTINATION_PARTITION_ID]: String(message.partition)
                } : {}
              }));
            });
          });
          const origSendResult = original.apply(this, args);
          return instrumentation2._endSpansOnPromise(spans, pendingMetrics, origSendResult);
        };
      };
    }
    _getSendPatch() {
      const instrumentation2 = this;
      return (original) => {
        return function send(...args) {
          const record = args[0];
          const spans = record.messages.map((message) => {
            return instrumentation2._startProducerSpan(record.topic, message);
          });
          const pendingMetrics = record.messages.map((m) => prepareCounter(instrumentation2._sentMessages, 1, {
            [semconv_1.ATTR_MESSAGING_SYSTEM]: semconv_1.MESSAGING_SYSTEM_VALUE_KAFKA,
            [semconv_1.ATTR_MESSAGING_OPERATION_NAME]: "send",
            [semconv_1.ATTR_MESSAGING_DESTINATION_NAME]: record.topic,
            ...m.partition !== void 0 ? {
              [semconv_1.ATTR_MESSAGING_DESTINATION_PARTITION_ID]: String(m.partition)
            } : {}
          }));
          const origSendResult = original.apply(this, args);
          return instrumentation2._endSpansOnPromise(spans, pendingMetrics, origSendResult);
        };
      };
    }
    _endSpansOnPromise(spans, pendingMetrics, sendPromise) {
      return Promise.resolve(sendPromise).then((result) => {
        pendingMetrics.forEach((m) => m());
        return result;
      }).catch((reason) => {
        let errorMessage;
        let errorType = semantic_conventions_1.ERROR_TYPE_VALUE_OTHER;
        if (typeof reason === "string" || reason === void 0) {
          errorMessage = reason;
        } else if (typeof reason === "object" && Object.prototype.hasOwnProperty.call(reason, "message")) {
          errorMessage = reason.message;
          errorType = reason.constructor.name;
        }
        pendingMetrics.forEach((m) => m(errorType));
        spans.forEach((span) => {
          span.setAttribute(semantic_conventions_1.ATTR_ERROR_TYPE, errorType);
          span.setStatus({
            code: api_1.SpanStatusCode.ERROR,
            message: errorMessage
          });
        });
        throw reason;
      }).finally(() => {
        spans.forEach((span) => span.end());
      });
    }
    _startConsumerSpan({ topic, message, operationType, ctx, link, attributes }) {
      const operationName = operationType === semconv_1.MESSAGING_OPERATION_TYPE_VALUE_RECEIVE ? "poll" : operationType;
      const span = this.tracer.startSpan(`${operationName} ${topic}`, {
        kind: operationType === semconv_1.MESSAGING_OPERATION_TYPE_VALUE_RECEIVE ? api_1.SpanKind.CLIENT : api_1.SpanKind.CONSUMER,
        attributes: {
          ...attributes,
          [semconv_1.ATTR_MESSAGING_SYSTEM]: semconv_1.MESSAGING_SYSTEM_VALUE_KAFKA,
          [semconv_1.ATTR_MESSAGING_DESTINATION_NAME]: topic,
          [semconv_1.ATTR_MESSAGING_OPERATION_TYPE]: operationType,
          [semconv_1.ATTR_MESSAGING_OPERATION_NAME]: operationName,
          [semconv_1.ATTR_MESSAGING_KAFKA_MESSAGE_KEY]: message?.key ? String(message.key) : void 0,
          [semconv_1.ATTR_MESSAGING_KAFKA_MESSAGE_TOMBSTONE]: message?.key && message.value === null ? true : void 0,
          [semconv_1.ATTR_MESSAGING_KAFKA_OFFSET]: message?.offset
        },
        links: link ? [link] : []
      }, ctx);
      const { consumerHook } = this.getConfig();
      if (consumerHook && message) {
        (0, instrumentation_1.safeExecuteInTheMiddle)(() => consumerHook(span, { topic, message }), (e) => {
          if (e)
            this._diag.error("consumerHook error", e);
        }, true);
      }
      return span;
    }
    _startProducerSpan(topic, message) {
      const span = this.tracer.startSpan(`send ${topic}`, {
        kind: api_1.SpanKind.PRODUCER,
        attributes: {
          [semconv_1.ATTR_MESSAGING_SYSTEM]: semconv_1.MESSAGING_SYSTEM_VALUE_KAFKA,
          [semconv_1.ATTR_MESSAGING_DESTINATION_NAME]: topic,
          [semconv_1.ATTR_MESSAGING_KAFKA_MESSAGE_KEY]: message.key ? String(message.key) : void 0,
          [semconv_1.ATTR_MESSAGING_KAFKA_MESSAGE_TOMBSTONE]: message.key && message.value === null ? true : void 0,
          [semconv_1.ATTR_MESSAGING_DESTINATION_PARTITION_ID]: message.partition !== void 0 ? String(message.partition) : void 0,
          [semconv_1.ATTR_MESSAGING_OPERATION_NAME]: "send",
          [semconv_1.ATTR_MESSAGING_OPERATION_TYPE]: semconv_1.MESSAGING_OPERATION_TYPE_VALUE_SEND
        }
      });
      message.headers = message.headers ?? {};
      api_1.propagation.inject(api_1.trace.setSpan(api_1.context.active(), span), message.headers);
      const { producerHook } = this.getConfig();
      if (producerHook) {
        (0, instrumentation_1.safeExecuteInTheMiddle)(() => producerHook(span, { topic, message }), (e) => {
          if (e)
            this._diag.error("producerHook error", e);
        }, true);
      }
      return span;
    }
  }
  instrumentation$f.KafkaJsInstrumentation = KafkaJsInstrumentation;
  return instrumentation$f;
}
var hasRequiredSrc$i;
function requireSrc$i() {
  if (hasRequiredSrc$i) return src$i;
  hasRequiredSrc$i = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.KafkaJsInstrumentation = void 0;
    var instrumentation_1 = requireInstrumentation$f();
    Object.defineProperty(exports$1, "KafkaJsInstrumentation", { enumerable: true, get: function() {
      return instrumentation_1.KafkaJsInstrumentation;
    } });
  })(src$i);
  return src$i;
}
var srcExports$g = requireSrc$i();
const INTEGRATION_NAME$k = "Kafka";
const instrumentKafka = generateInstrumentOnce(
  INTEGRATION_NAME$k,
  () => new srcExports$g.KafkaJsInstrumentation({
    consumerHook(span) {
      addOriginToSpan(span, "auto.kafkajs.otel.consumer");
    },
    producerHook(span) {
      addOriginToSpan(span, "auto.kafkajs.otel.producer");
    }
  })
);
const _kafkaIntegration = (() => {
  return {
    name: INTEGRATION_NAME$k,
    setupOnce() {
      instrumentKafka();
    }
  };
});
const kafkaIntegration = defineIntegration(_kafkaIntegration);
var src$h = {};
var instrumentation$e = {};
var version$f = {};
var hasRequiredVersion$f;
function requireVersion$f() {
  if (hasRequiredVersion$f) return version$f;
  hasRequiredVersion$f = 1;
  Object.defineProperty(version$f, "__esModule", { value: true });
  version$f.PACKAGE_NAME = version$f.PACKAGE_VERSION = void 0;
  version$f.PACKAGE_VERSION = "0.55.0";
  version$f.PACKAGE_NAME = "@opentelemetry/instrumentation-lru-memoizer";
  return version$f;
}
var hasRequiredInstrumentation$e;
function requireInstrumentation$e() {
  if (hasRequiredInstrumentation$e) return instrumentation$e;
  hasRequiredInstrumentation$e = 1;
  Object.defineProperty(instrumentation$e, "__esModule", { value: true });
  instrumentation$e.LruMemoizerInstrumentation = void 0;
  const api_1 = require$$0$2;
  const instrumentation_1 = require$$2;
  const version_1 = requireVersion$f();
  class LruMemoizerInstrumentation extends instrumentation_1.InstrumentationBase {
    constructor(config2 = {}) {
      super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config2);
    }
    init() {
      return [
        new instrumentation_1.InstrumentationNodeModuleDefinition(
          "lru-memoizer",
          [">=1.3 <3"],
          (moduleExports) => {
            const asyncMemoizer = function() {
              const origMemoizer = moduleExports.apply(this, arguments);
              return function() {
                const modifiedArguments = [...arguments];
                const origCallback = modifiedArguments.pop();
                const callbackWithContext = typeof origCallback === "function" ? api_1.context.bind(api_1.context.active(), origCallback) : origCallback;
                modifiedArguments.push(callbackWithContext);
                return origMemoizer.apply(this, modifiedArguments);
              };
            };
            asyncMemoizer.sync = moduleExports.sync;
            return asyncMemoizer;
          },
          void 0
          // no need to disable as this instrumentation does not create any spans
        )
      ];
    }
  }
  instrumentation$e.LruMemoizerInstrumentation = LruMemoizerInstrumentation;
  return instrumentation$e;
}
var hasRequiredSrc$h;
function requireSrc$h() {
  if (hasRequiredSrc$h) return src$h;
  hasRequiredSrc$h = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.LruMemoizerInstrumentation = void 0;
    var instrumentation_1 = requireInstrumentation$e();
    Object.defineProperty(exports$1, "LruMemoizerInstrumentation", { enumerable: true, get: function() {
      return instrumentation_1.LruMemoizerInstrumentation;
    } });
  })(src$h);
  return src$h;
}
var srcExports$f = requireSrc$h();
const INTEGRATION_NAME$j = "LruMemoizer";
const instrumentLruMemoizer = generateInstrumentOnce(INTEGRATION_NAME$j, () => new srcExports$f.LruMemoizerInstrumentation());
const _lruMemoizerIntegration = (() => {
  return {
    name: INTEGRATION_NAME$j,
    setupOnce() {
      instrumentLruMemoizer();
    }
  };
});
const lruMemoizerIntegration = defineIntegration(_lruMemoizerIntegration);
var src$g = {};
var instrumentation$d = {};
var semconv$a = {};
var hasRequiredSemconv$a;
function requireSemconv$a() {
  if (hasRequiredSemconv$a) return semconv$a;
  hasRequiredSemconv$a = 1;
  Object.defineProperty(semconv$a, "__esModule", { value: true });
  semconv$a.METRIC_DB_CLIENT_CONNECTIONS_USAGE = semconv$a.DB_SYSTEM_VALUE_MONGODB = semconv$a.DB_SYSTEM_NAME_VALUE_MONGODB = semconv$a.ATTR_NET_PEER_PORT = semconv$a.ATTR_NET_PEER_NAME = semconv$a.ATTR_DB_SYSTEM = semconv$a.ATTR_DB_STATEMENT = semconv$a.ATTR_DB_OPERATION = semconv$a.ATTR_DB_NAME = semconv$a.ATTR_DB_MONGODB_COLLECTION = semconv$a.ATTR_DB_CONNECTION_STRING = void 0;
  semconv$a.ATTR_DB_CONNECTION_STRING = "db.connection_string";
  semconv$a.ATTR_DB_MONGODB_COLLECTION = "db.mongodb.collection";
  semconv$a.ATTR_DB_NAME = "db.name";
  semconv$a.ATTR_DB_OPERATION = "db.operation";
  semconv$a.ATTR_DB_STATEMENT = "db.statement";
  semconv$a.ATTR_DB_SYSTEM = "db.system";
  semconv$a.ATTR_NET_PEER_NAME = "net.peer.name";
  semconv$a.ATTR_NET_PEER_PORT = "net.peer.port";
  semconv$a.DB_SYSTEM_NAME_VALUE_MONGODB = "mongodb";
  semconv$a.DB_SYSTEM_VALUE_MONGODB = "mongodb";
  semconv$a.METRIC_DB_CLIENT_CONNECTIONS_USAGE = "db.client.connections.usage";
  return semconv$a;
}
var internalTypes$4 = {};
var hasRequiredInternalTypes$4;
function requireInternalTypes$4() {
  if (hasRequiredInternalTypes$4) return internalTypes$4;
  hasRequiredInternalTypes$4 = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.MongodbCommandType = void 0;
    (function(MongodbCommandType) {
      MongodbCommandType["CREATE_INDEXES"] = "createIndexes";
      MongodbCommandType["FIND_AND_MODIFY"] = "findAndModify";
      MongodbCommandType["IS_MASTER"] = "isMaster";
      MongodbCommandType["COUNT"] = "count";
      MongodbCommandType["AGGREGATE"] = "aggregate";
      MongodbCommandType["UNKNOWN"] = "unknown";
    })(exports$1.MongodbCommandType || (exports$1.MongodbCommandType = {}));
  })(internalTypes$4);
  return internalTypes$4;
}
var version$e = {};
var hasRequiredVersion$e;
function requireVersion$e() {
  if (hasRequiredVersion$e) return version$e;
  hasRequiredVersion$e = 1;
  Object.defineProperty(version$e, "__esModule", { value: true });
  version$e.PACKAGE_NAME = version$e.PACKAGE_VERSION = void 0;
  version$e.PACKAGE_VERSION = "0.64.0";
  version$e.PACKAGE_NAME = "@opentelemetry/instrumentation-mongodb";
  return version$e;
}
var hasRequiredInstrumentation$d;
function requireInstrumentation$d() {
  if (hasRequiredInstrumentation$d) return instrumentation$d;
  hasRequiredInstrumentation$d = 1;
  Object.defineProperty(instrumentation$d, "__esModule", { value: true });
  instrumentation$d.MongoDBInstrumentation = void 0;
  const api_1 = require$$0$2;
  const instrumentation_1 = require$$2;
  const semantic_conventions_1 = require$$2$1;
  const semconv_1 = requireSemconv$a();
  const internal_types_1 = requireInternalTypes$4();
  const version_1 = requireVersion$e();
  const DEFAULT_CONFIG = {
    requireParentSpan: true
  };
  class MongoDBInstrumentation extends instrumentation_1.InstrumentationBase {
    _netSemconvStability;
    _dbSemconvStability;
    constructor(config2 = {}) {
      super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, { ...DEFAULT_CONFIG, ...config2 });
      this._setSemconvStabilityFromEnv();
    }
    // Used for testing.
    _setSemconvStabilityFromEnv() {
      this._netSemconvStability = (0, instrumentation_1.semconvStabilityFromStr)("http", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
      this._dbSemconvStability = (0, instrumentation_1.semconvStabilityFromStr)("database", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
    }
    setConfig(config2 = {}) {
      super.setConfig({ ...DEFAULT_CONFIG, ...config2 });
    }
    _updateMetricInstruments() {
      this._connectionsUsage = this.meter.createUpDownCounter(semconv_1.METRIC_DB_CLIENT_CONNECTIONS_USAGE, {
        description: "The number of connections that are currently in state described by the state attribute.",
        unit: "{connection}"
      });
    }
    /**
     * Convenience function for updating the `db.client.connections.usage` metric.
     * The name "count" comes from the eventual replacement for this metric per
     * https://opentelemetry.io/docs/specs/semconv/non-normative/db-migration/#database-client-connection-count
     */
    _connCountAdd(n, poolName, state) {
      this._connectionsUsage?.add(n, { "pool.name": poolName, state });
    }
    init() {
      const { v3PatchConnection, v3UnpatchConnection } = this._getV3ConnectionPatches();
      const { v4PatchConnect, v4UnpatchConnect } = this._getV4ConnectPatches();
      const { v4PatchConnectionCallback, v4PatchConnectionPromise, v4UnpatchConnection } = this._getV4ConnectionPatches();
      const { v4PatchConnectionPool, v4UnpatchConnectionPool } = this._getV4ConnectionPoolPatches();
      const { v4PatchSessions, v4UnpatchSessions } = this._getV4SessionsPatches();
      return [
        new instrumentation_1.InstrumentationNodeModuleDefinition("mongodb", [">=3.3.0 <4"], void 0, void 0, [
          new instrumentation_1.InstrumentationNodeModuleFile("mongodb/lib/core/wireprotocol/index.js", [">=3.3.0 <4"], v3PatchConnection, v3UnpatchConnection)
        ]),
        new instrumentation_1.InstrumentationNodeModuleDefinition("mongodb", [">=4.0.0 <8"], void 0, void 0, [
          new instrumentation_1.InstrumentationNodeModuleFile("mongodb/lib/cmap/connection.js", [">=4.0.0 <6.4"], v4PatchConnectionCallback, v4UnpatchConnection),
          new instrumentation_1.InstrumentationNodeModuleFile("mongodb/lib/cmap/connection.js", [">=6.4.0 <8"], v4PatchConnectionPromise, v4UnpatchConnection),
          new instrumentation_1.InstrumentationNodeModuleFile("mongodb/lib/cmap/connection_pool.js", [">=4.0.0 <6.4"], v4PatchConnectionPool, v4UnpatchConnectionPool),
          new instrumentation_1.InstrumentationNodeModuleFile("mongodb/lib/cmap/connect.js", [">=4.0.0 <8"], v4PatchConnect, v4UnpatchConnect),
          new instrumentation_1.InstrumentationNodeModuleFile("mongodb/lib/sessions.js", [">=4.0.0 <8"], v4PatchSessions, v4UnpatchSessions)
        ])
      ];
    }
    _getV3ConnectionPatches() {
      return {
        v3PatchConnection: (moduleExports) => {
          if ((0, instrumentation_1.isWrapped)(moduleExports.insert)) {
            this._unwrap(moduleExports, "insert");
          }
          this._wrap(moduleExports, "insert", this._getV3PatchOperation("insert"));
          if ((0, instrumentation_1.isWrapped)(moduleExports.remove)) {
            this._unwrap(moduleExports, "remove");
          }
          this._wrap(moduleExports, "remove", this._getV3PatchOperation("remove"));
          if ((0, instrumentation_1.isWrapped)(moduleExports.update)) {
            this._unwrap(moduleExports, "update");
          }
          this._wrap(moduleExports, "update", this._getV3PatchOperation("update"));
          if ((0, instrumentation_1.isWrapped)(moduleExports.command)) {
            this._unwrap(moduleExports, "command");
          }
          this._wrap(moduleExports, "command", this._getV3PatchCommand());
          if ((0, instrumentation_1.isWrapped)(moduleExports.query)) {
            this._unwrap(moduleExports, "query");
          }
          this._wrap(moduleExports, "query", this._getV3PatchFind());
          if ((0, instrumentation_1.isWrapped)(moduleExports.getMore)) {
            this._unwrap(moduleExports, "getMore");
          }
          this._wrap(moduleExports, "getMore", this._getV3PatchCursor());
          return moduleExports;
        },
        v3UnpatchConnection: (moduleExports) => {
          if (moduleExports === void 0)
            return;
          this._unwrap(moduleExports, "insert");
          this._unwrap(moduleExports, "remove");
          this._unwrap(moduleExports, "update");
          this._unwrap(moduleExports, "command");
          this._unwrap(moduleExports, "query");
          this._unwrap(moduleExports, "getMore");
        }
      };
    }
    _getV4SessionsPatches() {
      return {
        v4PatchSessions: (moduleExports) => {
          if ((0, instrumentation_1.isWrapped)(moduleExports.acquire)) {
            this._unwrap(moduleExports, "acquire");
          }
          this._wrap(moduleExports.ServerSessionPool.prototype, "acquire", this._getV4AcquireCommand());
          if ((0, instrumentation_1.isWrapped)(moduleExports.release)) {
            this._unwrap(moduleExports, "release");
          }
          this._wrap(moduleExports.ServerSessionPool.prototype, "release", this._getV4ReleaseCommand());
          return moduleExports;
        },
        v4UnpatchSessions: (moduleExports) => {
          if (moduleExports === void 0)
            return;
          if ((0, instrumentation_1.isWrapped)(moduleExports.acquire)) {
            this._unwrap(moduleExports, "acquire");
          }
          if ((0, instrumentation_1.isWrapped)(moduleExports.release)) {
            this._unwrap(moduleExports, "release");
          }
        }
      };
    }
    _getV4AcquireCommand() {
      const instrumentation2 = this;
      return (original) => {
        return function patchAcquire() {
          const nSessionsBeforeAcquire = this.sessions.length;
          const session = original.call(this);
          const nSessionsAfterAcquire = this.sessions.length;
          if (nSessionsBeforeAcquire === nSessionsAfterAcquire) {
            instrumentation2._connCountAdd(1, instrumentation2._poolName, "used");
          } else if (nSessionsBeforeAcquire - 1 === nSessionsAfterAcquire) {
            instrumentation2._connCountAdd(-1, instrumentation2._poolName, "idle");
            instrumentation2._connCountAdd(1, instrumentation2._poolName, "used");
          }
          return session;
        };
      };
    }
    _getV4ReleaseCommand() {
      const instrumentation2 = this;
      return (original) => {
        return function patchRelease(session) {
          const cmdPromise = original.call(this, session);
          instrumentation2._connCountAdd(-1, instrumentation2._poolName, "used");
          instrumentation2._connCountAdd(1, instrumentation2._poolName, "idle");
          return cmdPromise;
        };
      };
    }
    _getV4ConnectionPoolPatches() {
      return {
        v4PatchConnectionPool: (moduleExports) => {
          const poolPrototype = moduleExports.ConnectionPool.prototype;
          if ((0, instrumentation_1.isWrapped)(poolPrototype.checkOut)) {
            this._unwrap(poolPrototype, "checkOut");
          }
          this._wrap(poolPrototype, "checkOut", this._getV4ConnectionPoolCheckOut());
          return moduleExports;
        },
        v4UnpatchConnectionPool: (moduleExports) => {
          if (moduleExports === void 0)
            return;
          this._unwrap(moduleExports.ConnectionPool.prototype, "checkOut");
        }
      };
    }
    _getV4ConnectPatches() {
      return {
        v4PatchConnect: (moduleExports) => {
          if ((0, instrumentation_1.isWrapped)(moduleExports.connect)) {
            this._unwrap(moduleExports, "connect");
          }
          this._wrap(moduleExports, "connect", this._getV4ConnectCommand());
          return moduleExports;
        },
        v4UnpatchConnect: (moduleExports) => {
          if (moduleExports === void 0)
            return;
          this._unwrap(moduleExports, "connect");
        }
      };
    }
    // This patch will become unnecessary once
    // https://jira.mongodb.org/browse/NODE-5639 is done.
    _getV4ConnectionPoolCheckOut() {
      return (original) => {
        return function patchedCheckout(callback) {
          const patchedCallback = api_1.context.bind(api_1.context.active(), callback);
          return original.call(this, patchedCallback);
        };
      };
    }
    _getV4ConnectCommand() {
      const instrumentation2 = this;
      return (original) => {
        return function patchedConnect(options, callback) {
          if (original.length === 1) {
            const result = original.call(this, options);
            if (result && typeof result.then === "function") {
              result.then(
                () => instrumentation2.setPoolName(options),
                // this handler is set to pass the lint rules
                () => void 0
              );
            }
            return result;
          }
          const patchedCallback = function(err, conn) {
            if (err || !conn) {
              callback(err, conn);
              return;
            }
            instrumentation2.setPoolName(options);
            callback(err, conn);
          };
          return original.call(this, options, patchedCallback);
        };
      };
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _getV4ConnectionPatches() {
      return {
        v4PatchConnectionCallback: (moduleExports) => {
          if ((0, instrumentation_1.isWrapped)(moduleExports.Connection.prototype.command)) {
            this._unwrap(moduleExports.Connection.prototype, "command");
          }
          this._wrap(moduleExports.Connection.prototype, "command", this._getV4PatchCommandCallback());
          return moduleExports;
        },
        v4PatchConnectionPromise: (moduleExports) => {
          if ((0, instrumentation_1.isWrapped)(moduleExports.Connection.prototype.command)) {
            this._unwrap(moduleExports.Connection.prototype, "command");
          }
          this._wrap(moduleExports.Connection.prototype, "command", this._getV4PatchCommandPromise());
          return moduleExports;
        },
        v4UnpatchConnection: (moduleExports) => {
          if (moduleExports === void 0)
            return;
          this._unwrap(moduleExports.Connection.prototype, "command");
        }
      };
    }
    /** Creates spans for common operations */
    _getV3PatchOperation(operationName) {
      const instrumentation2 = this;
      return (original) => {
        return function patchedServerCommand(server, ns, ops, options, callback) {
          const currentSpan = api_1.trace.getSpan(api_1.context.active());
          const skipInstrumentation = instrumentation2._checkSkipInstrumentation(currentSpan);
          const resultHandler = typeof options === "function" ? options : callback;
          if (skipInstrumentation || typeof resultHandler !== "function" || typeof ops !== "object") {
            if (typeof options === "function") {
              return original.call(this, server, ns, ops, options);
            } else {
              return original.call(this, server, ns, ops, options, callback);
            }
          }
          const attributes = instrumentation2._getV3SpanAttributes(
            ns,
            server,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ops[0],
            operationName
          );
          const spanName = instrumentation2._spanNameFromAttrs(attributes);
          const span = instrumentation2.tracer.startSpan(spanName, {
            kind: api_1.SpanKind.CLIENT,
            attributes
          });
          const patchedCallback = instrumentation2._patchEnd(span, resultHandler);
          if (typeof options === "function") {
            return original.call(this, server, ns, ops, patchedCallback);
          } else {
            return original.call(this, server, ns, ops, options, patchedCallback);
          }
        };
      };
    }
    /** Creates spans for command operation */
    _getV3PatchCommand() {
      const instrumentation2 = this;
      return (original) => {
        return function patchedServerCommand(server, ns, cmd, options, callback) {
          const currentSpan = api_1.trace.getSpan(api_1.context.active());
          const skipInstrumentation = instrumentation2._checkSkipInstrumentation(currentSpan);
          const resultHandler = typeof options === "function" ? options : callback;
          if (skipInstrumentation || typeof resultHandler !== "function" || typeof cmd !== "object") {
            if (typeof options === "function") {
              return original.call(this, server, ns, cmd, options);
            } else {
              return original.call(this, server, ns, cmd, options, callback);
            }
          }
          const commandType = MongoDBInstrumentation._getCommandType(cmd);
          const operationName = commandType === internal_types_1.MongodbCommandType.UNKNOWN ? void 0 : commandType;
          const attributes = instrumentation2._getV3SpanAttributes(ns, server, cmd, operationName);
          const spanName = instrumentation2._spanNameFromAttrs(attributes);
          const span = instrumentation2.tracer.startSpan(spanName, {
            kind: api_1.SpanKind.CLIENT,
            attributes
          });
          const patchedCallback = instrumentation2._patchEnd(span, resultHandler);
          if (typeof options === "function") {
            return original.call(this, server, ns, cmd, patchedCallback);
          } else {
            return original.call(this, server, ns, cmd, options, patchedCallback);
          }
        };
      };
    }
    /** Creates spans for command operation */
    _getV4PatchCommandCallback() {
      const instrumentation2 = this;
      return (original) => {
        return function patchedV4ServerCommand(ns, cmd, options, callback) {
          const currentSpan = api_1.trace.getSpan(api_1.context.active());
          const skipInstrumentation = instrumentation2._checkSkipInstrumentation(currentSpan);
          const resultHandler = callback;
          const commandType = Object.keys(cmd)[0];
          if (typeof cmd !== "object" || cmd.ismaster || cmd.hello) {
            return original.call(this, ns, cmd, options, callback);
          }
          let span = void 0;
          if (!skipInstrumentation) {
            const attributes = instrumentation2._getV4SpanAttributes(this, ns, cmd, commandType);
            const spanName = instrumentation2._spanNameFromAttrs(attributes);
            span = instrumentation2.tracer.startSpan(spanName, {
              kind: api_1.SpanKind.CLIENT,
              attributes
            });
          }
          const patchedCallback = instrumentation2._patchEnd(span, resultHandler, this.id, commandType);
          return original.call(this, ns, cmd, options, patchedCallback);
        };
      };
    }
    _getV4PatchCommandPromise() {
      const instrumentation2 = this;
      return (original) => {
        return function patchedV4ServerCommand(...args) {
          const [ns, cmd] = args;
          const currentSpan = api_1.trace.getSpan(api_1.context.active());
          const skipInstrumentation = instrumentation2._checkSkipInstrumentation(currentSpan);
          const commandType = Object.keys(cmd)[0];
          const resultHandler = () => void 0;
          if (typeof cmd !== "object" || cmd.ismaster || cmd.hello) {
            return original.apply(this, args);
          }
          let span = void 0;
          if (!skipInstrumentation) {
            const attributes = instrumentation2._getV4SpanAttributes(this, ns, cmd, commandType);
            const spanName = instrumentation2._spanNameFromAttrs(attributes);
            span = instrumentation2.tracer.startSpan(spanName, {
              kind: api_1.SpanKind.CLIENT,
              attributes
            });
          }
          const patchedCallback = instrumentation2._patchEnd(span, resultHandler, this.id, commandType);
          const result = original.apply(this, args);
          result.then((res) => patchedCallback(null, res), (err) => patchedCallback(err));
          return result;
        };
      };
    }
    /** Creates spans for find operation */
    _getV3PatchFind() {
      const instrumentation2 = this;
      return (original) => {
        return function patchedServerCommand(server, ns, cmd, cursorState, options, callback) {
          const currentSpan = api_1.trace.getSpan(api_1.context.active());
          const skipInstrumentation = instrumentation2._checkSkipInstrumentation(currentSpan);
          const resultHandler = typeof options === "function" ? options : callback;
          if (skipInstrumentation || typeof resultHandler !== "function" || typeof cmd !== "object") {
            if (typeof options === "function") {
              return original.call(this, server, ns, cmd, cursorState, options);
            } else {
              return original.call(this, server, ns, cmd, cursorState, options, callback);
            }
          }
          const attributes = instrumentation2._getV3SpanAttributes(ns, server, cmd, "find");
          const spanName = instrumentation2._spanNameFromAttrs(attributes);
          const span = instrumentation2.tracer.startSpan(spanName, {
            kind: api_1.SpanKind.CLIENT,
            attributes
          });
          const patchedCallback = instrumentation2._patchEnd(span, resultHandler);
          if (typeof options === "function") {
            return original.call(this, server, ns, cmd, cursorState, patchedCallback);
          } else {
            return original.call(this, server, ns, cmd, cursorState, options, patchedCallback);
          }
        };
      };
    }
    /** Creates spans for find operation */
    _getV3PatchCursor() {
      const instrumentation2 = this;
      return (original) => {
        return function patchedServerCommand(server, ns, cursorState, batchSize, options, callback) {
          const currentSpan = api_1.trace.getSpan(api_1.context.active());
          const skipInstrumentation = instrumentation2._checkSkipInstrumentation(currentSpan);
          const resultHandler = typeof options === "function" ? options : callback;
          if (skipInstrumentation || typeof resultHandler !== "function") {
            if (typeof options === "function") {
              return original.call(this, server, ns, cursorState, batchSize, options);
            } else {
              return original.call(this, server, ns, cursorState, batchSize, options, callback);
            }
          }
          const attributes = instrumentation2._getV3SpanAttributes(ns, server, cursorState.cmd, "getMore");
          const spanName = instrumentation2._spanNameFromAttrs(attributes);
          const span = instrumentation2.tracer.startSpan(spanName, {
            kind: api_1.SpanKind.CLIENT,
            attributes
          });
          const patchedCallback = instrumentation2._patchEnd(span, resultHandler);
          if (typeof options === "function") {
            return original.call(this, server, ns, cursorState, batchSize, patchedCallback);
          } else {
            return original.call(this, server, ns, cursorState, batchSize, options, patchedCallback);
          }
        };
      };
    }
    /**
     * Get the mongodb command type from the object.
     * @param command Internal mongodb command object
     */
    static _getCommandType(command) {
      if (command.createIndexes !== void 0) {
        return internal_types_1.MongodbCommandType.CREATE_INDEXES;
      } else if (command.findandmodify !== void 0) {
        return internal_types_1.MongodbCommandType.FIND_AND_MODIFY;
      } else if (command.ismaster !== void 0) {
        return internal_types_1.MongodbCommandType.IS_MASTER;
      } else if (command.count !== void 0) {
        return internal_types_1.MongodbCommandType.COUNT;
      } else if (command.aggregate !== void 0) {
        return internal_types_1.MongodbCommandType.AGGREGATE;
      } else {
        return internal_types_1.MongodbCommandType.UNKNOWN;
      }
    }
    /**
     * Determine a span's attributes by fetching related metadata from the context
     * @param connectionCtx mongodb internal connection context
     * @param ns mongodb namespace
     * @param command mongodb internal representation of a command
     */
    _getV4SpanAttributes(connectionCtx, ns, command, operation) {
      let host, port;
      if (connectionCtx) {
        const hostParts = typeof connectionCtx.address === "string" ? connectionCtx.address.split(":") : "";
        if (hostParts.length === 2) {
          host = hostParts[0];
          port = hostParts[1];
        }
      }
      let commandObj;
      if (command?.documents && command.documents[0]) {
        commandObj = command.documents[0];
      } else if (command?.cursors) {
        commandObj = command.cursors;
      } else {
        commandObj = command;
      }
      return this._getSpanAttributes(ns.db, ns.collection, host, port, commandObj, operation);
    }
    /**
     * Determine a span's attributes by fetching related metadata from the context
     * @param ns mongodb namespace
     * @param topology mongodb internal representation of the network topology
     * @param command mongodb internal representation of a command
     */
    _getV3SpanAttributes(ns, topology, command, operation) {
      let host;
      let port;
      if (topology && topology.s) {
        host = topology.s.options?.host ?? topology.s.host;
        port = (topology.s.options?.port ?? topology.s.port)?.toString();
        if (host == null || port == null) {
          const address = topology.description?.address;
          if (address) {
            const addressSegments = address.split(":");
            host = addressSegments[0];
            port = addressSegments[1];
          }
        }
      }
      const [dbName, dbCollection] = ns.toString().split(".");
      const commandObj = command?.query ?? command?.q ?? command;
      return this._getSpanAttributes(dbName, dbCollection, host, port, commandObj, operation);
    }
    _getSpanAttributes(dbName, dbCollection, host, port, commandObj, operation) {
      const attributes = {};
      if (this._dbSemconvStability & instrumentation_1.SemconvStability.OLD) {
        attributes[semconv_1.ATTR_DB_SYSTEM] = semconv_1.DB_SYSTEM_VALUE_MONGODB;
        attributes[semconv_1.ATTR_DB_NAME] = dbName;
        attributes[semconv_1.ATTR_DB_MONGODB_COLLECTION] = dbCollection;
        attributes[semconv_1.ATTR_DB_OPERATION] = operation;
        attributes[semconv_1.ATTR_DB_CONNECTION_STRING] = `mongodb://${host}:${port}/${dbName}`;
      }
      if (this._dbSemconvStability & instrumentation_1.SemconvStability.STABLE) {
        attributes[semantic_conventions_1.ATTR_DB_SYSTEM_NAME] = semconv_1.DB_SYSTEM_NAME_VALUE_MONGODB;
        attributes[semantic_conventions_1.ATTR_DB_NAMESPACE] = dbName;
        attributes[semantic_conventions_1.ATTR_DB_OPERATION_NAME] = operation;
        attributes[semantic_conventions_1.ATTR_DB_COLLECTION_NAME] = dbCollection;
      }
      if (host && port) {
        if (this._netSemconvStability & instrumentation_1.SemconvStability.OLD) {
          attributes[semconv_1.ATTR_NET_PEER_NAME] = host;
        }
        if (this._netSemconvStability & instrumentation_1.SemconvStability.STABLE) {
          attributes[semantic_conventions_1.ATTR_SERVER_ADDRESS] = host;
        }
        const portNumber = parseInt(port, 10);
        if (!isNaN(portNumber)) {
          if (this._netSemconvStability & instrumentation_1.SemconvStability.OLD) {
            attributes[semconv_1.ATTR_NET_PEER_PORT] = portNumber;
          }
          if (this._netSemconvStability & instrumentation_1.SemconvStability.STABLE) {
            attributes[semantic_conventions_1.ATTR_SERVER_PORT] = portNumber;
          }
        }
      }
      if (commandObj) {
        const { dbStatementSerializer: configDbStatementSerializer } = this.getConfig();
        const dbStatementSerializer = typeof configDbStatementSerializer === "function" ? configDbStatementSerializer : this._defaultDbStatementSerializer.bind(this);
        (0, instrumentation_1.safeExecuteInTheMiddle)(() => {
          const query = dbStatementSerializer(commandObj);
          if (this._dbSemconvStability & instrumentation_1.SemconvStability.OLD) {
            attributes[semconv_1.ATTR_DB_STATEMENT] = query;
          }
          if (this._dbSemconvStability & instrumentation_1.SemconvStability.STABLE) {
            attributes[semantic_conventions_1.ATTR_DB_QUERY_TEXT] = query;
          }
        }, (err) => {
          if (err) {
            this._diag.error("Error running dbStatementSerializer hook", err);
          }
        }, true);
      }
      return attributes;
    }
    _spanNameFromAttrs(attributes) {
      let spanName;
      if (this._dbSemconvStability & instrumentation_1.SemconvStability.STABLE) {
        spanName = [
          attributes[semantic_conventions_1.ATTR_DB_OPERATION_NAME],
          attributes[semantic_conventions_1.ATTR_DB_COLLECTION_NAME]
        ].filter((attr) => attr).join(" ") || semconv_1.DB_SYSTEM_NAME_VALUE_MONGODB;
      } else {
        spanName = `mongodb.${attributes[semconv_1.ATTR_DB_OPERATION] || "command"}`;
      }
      return spanName;
    }
    _getDefaultDbStatementReplacer() {
      const seen = /* @__PURE__ */ new WeakSet();
      return (_key, value) => {
        if (typeof value !== "object" || !value)
          return "?";
        if (seen.has(value))
          return "[Circular]";
        seen.add(value);
        return value;
      };
    }
    _defaultDbStatementSerializer(commandObj) {
      const { enhancedDatabaseReporting } = this.getConfig();
      if (enhancedDatabaseReporting) {
        return JSON.stringify(commandObj);
      }
      return JSON.stringify(commandObj, this._getDefaultDbStatementReplacer());
    }
    /**
     * Triggers the response hook in case it is defined.
     * @param span The span to add the results to.
     * @param result The command result
     */
    _handleExecutionResult(span, result) {
      const { responseHook } = this.getConfig();
      if (typeof responseHook === "function") {
        (0, instrumentation_1.safeExecuteInTheMiddle)(() => {
          responseHook(span, { data: result });
        }, (err) => {
          if (err) {
            this._diag.error("Error running response hook", err);
          }
        }, true);
      }
    }
    /**
     * Ends a created span.
     * @param span The created span to end.
     * @param resultHandler A callback function.
     * @param connectionId: The connection ID of the Command response.
     */
    _patchEnd(span, resultHandler, connectionId, commandType) {
      const activeContext = api_1.context.active();
      const instrumentation2 = this;
      let spanEnded = false;
      return function patchedEnd(...args) {
        if (!spanEnded) {
          spanEnded = true;
          const error2 = args[0];
          if (span) {
            if (error2 instanceof Error) {
              span.setStatus({
                code: api_1.SpanStatusCode.ERROR,
                message: error2.message
              });
            } else {
              const result = args[1];
              instrumentation2._handleExecutionResult(span, result);
            }
            span.end();
          }
          if (commandType === "endSessions") {
            instrumentation2._connCountAdd(-1, instrumentation2._poolName, "idle");
          }
        }
        return api_1.context.with(activeContext, () => {
          return resultHandler.apply(this, args);
        });
      };
    }
    setPoolName(options) {
      const host = options.hostAddress?.host;
      const port = options.hostAddress?.port;
      const database = options.dbName;
      const poolName = `mongodb://${host}:${port}/${database}`;
      this._poolName = poolName;
    }
    _checkSkipInstrumentation(currentSpan) {
      const requireParentSpan = this.getConfig().requireParentSpan;
      const hasNoParentSpan = currentSpan === void 0;
      return requireParentSpan === true && hasNoParentSpan;
    }
  }
  instrumentation$d.MongoDBInstrumentation = MongoDBInstrumentation;
  return instrumentation$d;
}
var types$2 = {};
var hasRequiredTypes$2;
function requireTypes$2() {
  if (hasRequiredTypes$2) return types$2;
  hasRequiredTypes$2 = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.MongodbCommandType = void 0;
    (function(MongodbCommandType) {
      MongodbCommandType["CREATE_INDEXES"] = "createIndexes";
      MongodbCommandType["FIND_AND_MODIFY"] = "findAndModify";
      MongodbCommandType["IS_MASTER"] = "isMaster";
      MongodbCommandType["COUNT"] = "count";
      MongodbCommandType["UNKNOWN"] = "unknown";
    })(exports$1.MongodbCommandType || (exports$1.MongodbCommandType = {}));
  })(types$2);
  return types$2;
}
var hasRequiredSrc$g;
function requireSrc$g() {
  if (hasRequiredSrc$g) return src$g;
  hasRequiredSrc$g = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.MongodbCommandType = exports$1.MongoDBInstrumentation = void 0;
    var instrumentation_1 = requireInstrumentation$d();
    Object.defineProperty(exports$1, "MongoDBInstrumentation", { enumerable: true, get: function() {
      return instrumentation_1.MongoDBInstrumentation;
    } });
    var types_1 = requireTypes$2();
    Object.defineProperty(exports$1, "MongodbCommandType", { enumerable: true, get: function() {
      return types_1.MongodbCommandType;
    } });
  })(src$g);
  return src$g;
}
var srcExports$e = requireSrc$g();
const INTEGRATION_NAME$i = "Mongo";
const instrumentMongo = generateInstrumentOnce(
  INTEGRATION_NAME$i,
  () => new srcExports$e.MongoDBInstrumentation({
    dbStatementSerializer: _defaultDbStatementSerializer,
    responseHook(span) {
      addOriginToSpan(span, "auto.db.otel.mongo");
    }
  })
);
function _defaultDbStatementSerializer(commandObj) {
  const resultObj = _scrubStatement(commandObj);
  return JSON.stringify(resultObj);
}
function _scrubStatement(value) {
  if (Array.isArray(value)) {
    return value.map((element) => _scrubStatement(element));
  }
  if (isCommandObj(value)) {
    const initial = {};
    return Object.entries(value).map(([key, element]) => [key, _scrubStatement(element)]).reduce((prev, current) => {
      if (isCommandEntry(current)) {
        prev[current[0]] = current[1];
      }
      return prev;
    }, initial);
  }
  return "?";
}
function isCommandObj(value) {
  return typeof value === "object" && value !== null && !isBuffer(value);
}
function isBuffer(value) {
  let isBuffer2 = false;
  if (typeof Buffer !== "undefined") {
    isBuffer2 = Buffer.isBuffer(value);
  }
  return isBuffer2;
}
function isCommandEntry(value) {
  return Array.isArray(value);
}
const _mongoIntegration = (() => {
  return {
    name: INTEGRATION_NAME$i,
    setupOnce() {
      instrumentMongo();
    }
  };
});
const mongoIntegration = defineIntegration(_mongoIntegration);
var src$f = {};
var mongoose = {};
var utils$c = {};
var semconv$9 = {};
var hasRequiredSemconv$9;
function requireSemconv$9() {
  if (hasRequiredSemconv$9) return semconv$9;
  hasRequiredSemconv$9 = 1;
  Object.defineProperty(semconv$9, "__esModule", { value: true });
  semconv$9.DB_SYSTEM_NAME_VALUE_MONGODB = semconv$9.ATTR_NET_PEER_PORT = semconv$9.ATTR_NET_PEER_NAME = semconv$9.ATTR_DB_USER = semconv$9.ATTR_DB_SYSTEM = semconv$9.ATTR_DB_STATEMENT = semconv$9.ATTR_DB_OPERATION = semconv$9.ATTR_DB_NAME = semconv$9.ATTR_DB_MONGODB_COLLECTION = void 0;
  semconv$9.ATTR_DB_MONGODB_COLLECTION = "db.mongodb.collection";
  semconv$9.ATTR_DB_NAME = "db.name";
  semconv$9.ATTR_DB_OPERATION = "db.operation";
  semconv$9.ATTR_DB_STATEMENT = "db.statement";
  semconv$9.ATTR_DB_SYSTEM = "db.system";
  semconv$9.ATTR_DB_USER = "db.user";
  semconv$9.ATTR_NET_PEER_NAME = "net.peer.name";
  semconv$9.ATTR_NET_PEER_PORT = "net.peer.port";
  semconv$9.DB_SYSTEM_NAME_VALUE_MONGODB = "mongodb";
  return semconv$9;
}
var hasRequiredUtils$c;
function requireUtils$c() {
  if (hasRequiredUtils$c) return utils$c;
  hasRequiredUtils$c = 1;
  Object.defineProperty(utils$c, "__esModule", { value: true });
  utils$c.handleCallbackResponse = utils$c.handlePromiseResponse = utils$c.getAttributesFromCollection = void 0;
  const api_1 = require$$0$2;
  const instrumentation_1 = require$$2;
  const semconv_1 = requireSemconv$9();
  const semantic_conventions_1 = require$$2$1;
  function getAttributesFromCollection(collection, dbSemconvStability, netSemconvStability) {
    const attrs = {};
    if (dbSemconvStability & instrumentation_1.SemconvStability.OLD) {
      attrs[semconv_1.ATTR_DB_MONGODB_COLLECTION] = collection.name;
      attrs[semconv_1.ATTR_DB_NAME] = collection.conn.name;
      attrs[semconv_1.ATTR_DB_USER] = collection.conn.user;
    }
    if (dbSemconvStability & instrumentation_1.SemconvStability.STABLE) {
      attrs[semantic_conventions_1.ATTR_DB_COLLECTION_NAME] = collection.name;
      attrs[semantic_conventions_1.ATTR_DB_NAMESPACE] = collection.conn.name;
    }
    if (netSemconvStability & instrumentation_1.SemconvStability.OLD) {
      attrs[semconv_1.ATTR_NET_PEER_NAME] = collection.conn.host;
      attrs[semconv_1.ATTR_NET_PEER_PORT] = collection.conn.port;
    }
    if (netSemconvStability & instrumentation_1.SemconvStability.STABLE) {
      attrs[semantic_conventions_1.ATTR_SERVER_ADDRESS] = collection.conn.host;
      attrs[semantic_conventions_1.ATTR_SERVER_PORT] = collection.conn.port;
    }
    return attrs;
  }
  utils$c.getAttributesFromCollection = getAttributesFromCollection;
  function setErrorStatus(span, error2 = {}) {
    span.recordException(error2);
    span.setStatus({
      code: api_1.SpanStatusCode.ERROR,
      message: `${error2.message} ${error2.code ? `
Mongoose Error Code: ${error2.code}` : ""}`
    });
  }
  function applyResponseHook(span, response, responseHook, moduleVersion = void 0) {
    if (!responseHook) {
      return;
    }
    (0, instrumentation_1.safeExecuteInTheMiddle)(() => responseHook(span, { moduleVersion, response }), (e) => {
      if (e) {
        api_1.diag.error("mongoose instrumentation: responseHook error", e);
      }
    }, true);
  }
  function handlePromiseResponse(execResponse, span, responseHook, moduleVersion = void 0) {
    if (!(execResponse instanceof Promise)) {
      applyResponseHook(span, execResponse, responseHook, moduleVersion);
      span.end();
      return execResponse;
    }
    return execResponse.then((response) => {
      applyResponseHook(span, response, responseHook, moduleVersion);
      return response;
    }).catch((err) => {
      setErrorStatus(span, err);
      throw err;
    }).finally(() => span.end());
  }
  utils$c.handlePromiseResponse = handlePromiseResponse;
  function handleCallbackResponse(callback, exec, originalThis, span, args, responseHook, moduleVersion = void 0) {
    let callbackArgumentIndex = 0;
    if (args.length === 2) {
      callbackArgumentIndex = 1;
    } else if (args.length === 3) {
      callbackArgumentIndex = 2;
    }
    args[callbackArgumentIndex] = (err, response) => {
      if (err) {
        setErrorStatus(span, err);
      } else {
        applyResponseHook(span, response, responseHook, moduleVersion);
      }
      span.end();
      return callback(err, response);
    };
    return exec.apply(originalThis, args);
  }
  utils$c.handleCallbackResponse = handleCallbackResponse;
  return utils$c;
}
var version$d = {};
var hasRequiredVersion$d;
function requireVersion$d() {
  if (hasRequiredVersion$d) return version$d;
  hasRequiredVersion$d = 1;
  Object.defineProperty(version$d, "__esModule", { value: true });
  version$d.PACKAGE_NAME = version$d.PACKAGE_VERSION = void 0;
  version$d.PACKAGE_VERSION = "0.57.0";
  version$d.PACKAGE_NAME = "@opentelemetry/instrumentation-mongoose";
  return version$d;
}
var hasRequiredMongoose;
function requireMongoose() {
  if (hasRequiredMongoose) return mongoose;
  hasRequiredMongoose = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.MongooseInstrumentation = exports$1._ALREADY_INSTRUMENTED = exports$1._STORED_PARENT_SPAN = void 0;
    const api_1 = require$$0$2;
    const core_1 = require$$1$1;
    const utils_1 = requireUtils$c();
    const instrumentation_1 = require$$2;
    const version_1 = requireVersion$d();
    const semconv_1 = requireSemconv$9();
    const semantic_conventions_1 = require$$2$1;
    const contextCaptureFunctionsCommon = [
      "deleteOne",
      "deleteMany",
      "find",
      "findOne",
      "estimatedDocumentCount",
      "countDocuments",
      "distinct",
      "where",
      "$where",
      "findOneAndUpdate",
      "findOneAndDelete",
      "findOneAndReplace"
    ];
    const contextCaptureFunctions6 = [
      "remove",
      "count",
      "findOneAndRemove",
      ...contextCaptureFunctionsCommon
    ];
    const contextCaptureFunctions7 = [
      "count",
      "findOneAndRemove",
      ...contextCaptureFunctionsCommon
    ];
    const contextCaptureFunctions8 = [...contextCaptureFunctionsCommon];
    function getContextCaptureFunctions(moduleVersion) {
      if (!moduleVersion) {
        return contextCaptureFunctionsCommon;
      } else if (moduleVersion.startsWith("6.") || moduleVersion.startsWith("5.")) {
        return contextCaptureFunctions6;
      } else if (moduleVersion.startsWith("7.")) {
        return contextCaptureFunctions7;
      } else {
        return contextCaptureFunctions8;
      }
    }
    function instrumentRemove(moduleVersion) {
      return moduleVersion && (moduleVersion.startsWith("5.") || moduleVersion.startsWith("6.")) || false;
    }
    function needsDocumentMethodPatch(moduleVersion) {
      if (!moduleVersion || !moduleVersion.startsWith("8.")) {
        return false;
      }
      const minor = parseInt(moduleVersion.split(".")[1], 10);
      return minor >= 21;
    }
    exports$1._STORED_PARENT_SPAN = Symbol("stored-parent-span");
    exports$1._ALREADY_INSTRUMENTED = Symbol("already-instrumented");
    class MongooseInstrumentation extends instrumentation_1.InstrumentationBase {
      _netSemconvStability;
      _dbSemconvStability;
      constructor(config2 = {}) {
        super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config2);
        this._setSemconvStabilityFromEnv();
      }
      // Used for testing.
      _setSemconvStabilityFromEnv() {
        this._netSemconvStability = (0, instrumentation_1.semconvStabilityFromStr)("http", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
        this._dbSemconvStability = (0, instrumentation_1.semconvStabilityFromStr)("database", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
      }
      init() {
        const module2 = new instrumentation_1.InstrumentationNodeModuleDefinition("mongoose", [">=5.9.7 <9"], this.patch.bind(this), this.unpatch.bind(this));
        return module2;
      }
      patch(module2, moduleVersion) {
        const moduleExports = module2[Symbol.toStringTag] === "Module" ? module2.default : module2;
        this._wrap(moduleExports.Model.prototype, "save", this.patchOnModelMethods("save", moduleVersion));
        moduleExports.Model.prototype.$save = moduleExports.Model.prototype.save;
        if (instrumentRemove(moduleVersion)) {
          this._wrap(moduleExports.Model.prototype, "remove", this.patchOnModelMethods("remove", moduleVersion));
        }
        if (needsDocumentMethodPatch(moduleVersion)) {
          this._wrap(moduleExports.Model.prototype, "updateOne", this._patchDocumentUpdateMethods("updateOne", moduleVersion));
          this._wrap(moduleExports.Model.prototype, "deleteOne", this._patchDocumentUpdateMethods("deleteOne", moduleVersion));
        }
        this._wrap(moduleExports.Query.prototype, "exec", this.patchQueryExec(moduleVersion));
        this._wrap(moduleExports.Aggregate.prototype, "exec", this.patchAggregateExec(moduleVersion));
        const contextCaptureFunctions = getContextCaptureFunctions(moduleVersion);
        contextCaptureFunctions.forEach((funcName) => {
          this._wrap(moduleExports.Query.prototype, funcName, this.patchAndCaptureSpanContext(funcName));
        });
        this._wrap(moduleExports.Model, "aggregate", this.patchModelAggregate());
        this._wrap(moduleExports.Model, "insertMany", this.patchModelStatic("insertMany", moduleVersion));
        this._wrap(moduleExports.Model, "bulkWrite", this.patchModelStatic("bulkWrite", moduleVersion));
        return moduleExports;
      }
      unpatch(module2, moduleVersion) {
        const moduleExports = module2[Symbol.toStringTag] === "Module" ? module2.default : module2;
        const contextCaptureFunctions = getContextCaptureFunctions(moduleVersion);
        this._unwrap(moduleExports.Model.prototype, "save");
        moduleExports.Model.prototype.$save = moduleExports.Model.prototype.save;
        if (instrumentRemove(moduleVersion)) {
          this._unwrap(moduleExports.Model.prototype, "remove");
        }
        if (needsDocumentMethodPatch(moduleVersion)) {
          this._unwrap(moduleExports.Model.prototype, "updateOne");
          this._unwrap(moduleExports.Model.prototype, "deleteOne");
        }
        this._unwrap(moduleExports.Query.prototype, "exec");
        this._unwrap(moduleExports.Aggregate.prototype, "exec");
        contextCaptureFunctions.forEach((funcName) => {
          this._unwrap(moduleExports.Query.prototype, funcName);
        });
        this._unwrap(moduleExports.Model, "aggregate");
        this._unwrap(moduleExports.Model, "insertMany");
        this._unwrap(moduleExports.Model, "bulkWrite");
      }
      patchAggregateExec(moduleVersion) {
        const self = this;
        return (originalAggregate) => {
          return function exec(callback) {
            if (self.getConfig().requireParentSpan && api_1.trace.getSpan(api_1.context.active()) === void 0) {
              return originalAggregate.apply(this, arguments);
            }
            const parentSpan = this[exports$1._STORED_PARENT_SPAN];
            const attributes = {};
            const { dbStatementSerializer } = self.getConfig();
            if (dbStatementSerializer) {
              const statement = dbStatementSerializer("aggregate", {
                options: this.options,
                aggregatePipeline: this._pipeline
              });
              if (self._dbSemconvStability & instrumentation_1.SemconvStability.OLD) {
                attributes[semconv_1.ATTR_DB_STATEMENT] = statement;
              }
              if (self._dbSemconvStability & instrumentation_1.SemconvStability.STABLE) {
                attributes[semantic_conventions_1.ATTR_DB_QUERY_TEXT] = statement;
              }
            }
            const span = self._startSpan(this._model.collection, this._model?.modelName, "aggregate", attributes, parentSpan);
            return self._handleResponse(span, originalAggregate, this, arguments, callback, moduleVersion);
          };
        };
      }
      patchQueryExec(moduleVersion) {
        const self = this;
        return (originalExec) => {
          return function exec(callback) {
            if (this[exports$1._ALREADY_INSTRUMENTED]) {
              return originalExec.apply(this, arguments);
            }
            if (self.getConfig().requireParentSpan && api_1.trace.getSpan(api_1.context.active()) === void 0) {
              return originalExec.apply(this, arguments);
            }
            const parentSpan = this[exports$1._STORED_PARENT_SPAN];
            const attributes = {};
            const { dbStatementSerializer } = self.getConfig();
            if (dbStatementSerializer) {
              const statement = dbStatementSerializer(this.op, {
                // Use public API methods (getFilter/getOptions) for better compatibility
                condition: this.getFilter?.() ?? this._conditions,
                updates: this._update,
                options: this.getOptions?.() ?? this.options,
                fields: this._fields
              });
              if (self._dbSemconvStability & instrumentation_1.SemconvStability.OLD) {
                attributes[semconv_1.ATTR_DB_STATEMENT] = statement;
              }
              if (self._dbSemconvStability & instrumentation_1.SemconvStability.STABLE) {
                attributes[semantic_conventions_1.ATTR_DB_QUERY_TEXT] = statement;
              }
            }
            const span = self._startSpan(this.mongooseCollection, this.model.modelName, this.op, attributes, parentSpan);
            return self._handleResponse(span, originalExec, this, arguments, callback, moduleVersion);
          };
        };
      }
      patchOnModelMethods(op, moduleVersion) {
        const self = this;
        return (originalOnModelFunction) => {
          return function method(options, callback) {
            if (self.getConfig().requireParentSpan && api_1.trace.getSpan(api_1.context.active()) === void 0) {
              return originalOnModelFunction.apply(this, arguments);
            }
            const serializePayload = { document: this };
            if (options && !(options instanceof Function)) {
              serializePayload.options = options;
            }
            const attributes = {};
            const { dbStatementSerializer } = self.getConfig();
            if (dbStatementSerializer) {
              const statement = dbStatementSerializer(op, serializePayload);
              if (self._dbSemconvStability & instrumentation_1.SemconvStability.OLD) {
                attributes[semconv_1.ATTR_DB_STATEMENT] = statement;
              }
              if (self._dbSemconvStability & instrumentation_1.SemconvStability.STABLE) {
                attributes[semantic_conventions_1.ATTR_DB_QUERY_TEXT] = statement;
              }
            }
            const span = self._startSpan(this.constructor.collection, this.constructor.modelName, op, attributes);
            if (options instanceof Function) {
              callback = options;
              options = void 0;
            }
            return self._handleResponse(span, originalOnModelFunction, this, arguments, callback, moduleVersion);
          };
        };
      }
      // Patch document instance methods (doc.updateOne/deleteOne) for Mongoose 8.21.0+.
      _patchDocumentUpdateMethods(op, moduleVersion) {
        const self = this;
        return (originalMethod) => {
          return function method(update, options, callback) {
            if (self.getConfig().requireParentSpan && api_1.trace.getSpan(api_1.context.active()) === void 0) {
              return originalMethod.apply(this, arguments);
            }
            let actualCallback = callback;
            let actualUpdate = update;
            let actualOptions = options;
            if (typeof update === "function") {
              actualCallback = update;
              actualUpdate = void 0;
              actualOptions = void 0;
            } else if (typeof options === "function") {
              actualCallback = options;
              actualOptions = void 0;
            }
            const attributes = {};
            const dbStatementSerializer = self.getConfig().dbStatementSerializer;
            if (dbStatementSerializer) {
              const statement = dbStatementSerializer(op, {
                // Document instance methods automatically use the document's _id as filter
                condition: { _id: this._id },
                updates: actualUpdate,
                options: actualOptions
              });
              if (self._dbSemconvStability & instrumentation_1.SemconvStability.OLD) {
                attributes[semconv_1.ATTR_DB_STATEMENT] = statement;
              }
              if (self._dbSemconvStability & instrumentation_1.SemconvStability.STABLE) {
                attributes[semantic_conventions_1.ATTR_DB_QUERY_TEXT] = statement;
              }
            }
            const span = self._startSpan(this.constructor.collection, this.constructor.modelName, op, attributes);
            const result = self._handleResponse(span, originalMethod, this, arguments, actualCallback, moduleVersion);
            if (result && typeof result === "object") {
              result[exports$1._ALREADY_INSTRUMENTED] = true;
            }
            return result;
          };
        };
      }
      patchModelStatic(op, moduleVersion) {
        const self = this;
        return (original) => {
          return function patchedStatic(docsOrOps, options, callback) {
            if (self.getConfig().requireParentSpan && api_1.trace.getSpan(api_1.context.active()) === void 0) {
              return original.apply(this, arguments);
            }
            if (typeof options === "function") {
              callback = options;
              options = void 0;
            }
            const serializePayload = {};
            switch (op) {
              case "insertMany":
                serializePayload.documents = docsOrOps;
                break;
              case "bulkWrite":
                serializePayload.operations = docsOrOps;
                break;
              default:
                serializePayload.document = docsOrOps;
                break;
            }
            if (options !== void 0) {
              serializePayload.options = options;
            }
            const attributes = {};
            const { dbStatementSerializer } = self.getConfig();
            if (dbStatementSerializer) {
              const statement = dbStatementSerializer(op, serializePayload);
              if (self._dbSemconvStability & instrumentation_1.SemconvStability.OLD) {
                attributes[semconv_1.ATTR_DB_STATEMENT] = statement;
              }
              if (self._dbSemconvStability & instrumentation_1.SemconvStability.STABLE) {
                attributes[semantic_conventions_1.ATTR_DB_QUERY_TEXT] = statement;
              }
            }
            const span = self._startSpan(this.collection, this.modelName, op, attributes);
            return self._handleResponse(span, original, this, arguments, callback, moduleVersion);
          };
        };
      }
      // we want to capture the otel span on the object which is calling exec.
      // in the special case of aggregate, we need have no function to path
      // on the Aggregate object to capture the context on, so we patch
      // the aggregate of Model, and set the context on the Aggregate object
      patchModelAggregate() {
        const self = this;
        return (original) => {
          return function captureSpanContext() {
            const currentSpan = api_1.trace.getSpan(api_1.context.active());
            const aggregate = self._callOriginalFunction(() => original.apply(this, arguments));
            if (aggregate)
              aggregate[exports$1._STORED_PARENT_SPAN] = currentSpan;
            return aggregate;
          };
        };
      }
      patchAndCaptureSpanContext(funcName) {
        const self = this;
        return (original) => {
          return function captureSpanContext() {
            this[exports$1._STORED_PARENT_SPAN] = api_1.trace.getSpan(api_1.context.active());
            return self._callOriginalFunction(() => original.apply(this, arguments));
          };
        };
      }
      _startSpan(collection, modelName, operation, attributes, parentSpan) {
        const finalAttributes = {
          ...attributes,
          ...(0, utils_1.getAttributesFromCollection)(collection, this._dbSemconvStability, this._netSemconvStability)
        };
        if (this._dbSemconvStability & instrumentation_1.SemconvStability.OLD) {
          finalAttributes[semconv_1.ATTR_DB_OPERATION] = operation;
          finalAttributes[semconv_1.ATTR_DB_SYSTEM] = "mongoose";
        }
        if (this._dbSemconvStability & instrumentation_1.SemconvStability.STABLE) {
          finalAttributes[semantic_conventions_1.ATTR_DB_OPERATION_NAME] = operation;
          finalAttributes[semantic_conventions_1.ATTR_DB_SYSTEM_NAME] = semconv_1.DB_SYSTEM_NAME_VALUE_MONGODB;
        }
        const spanName = this._dbSemconvStability & instrumentation_1.SemconvStability.STABLE ? `${operation} ${collection.name}` : `mongoose.${modelName}.${operation}`;
        return this.tracer.startSpan(spanName, {
          kind: api_1.SpanKind.CLIENT,
          attributes: finalAttributes
        }, parentSpan ? api_1.trace.setSpan(api_1.context.active(), parentSpan) : void 0);
      }
      _handleResponse(span, exec, originalThis, args, callback, moduleVersion = void 0) {
        const self = this;
        if (callback instanceof Function) {
          return self._callOriginalFunction(() => (0, utils_1.handleCallbackResponse)(callback, exec, originalThis, span, args, self.getConfig().responseHook, moduleVersion));
        } else {
          const response = self._callOriginalFunction(() => exec.apply(originalThis, args));
          return (0, utils_1.handlePromiseResponse)(response, span, self.getConfig().responseHook, moduleVersion);
        }
      }
      _callOriginalFunction(originalFunction) {
        if (this.getConfig().suppressInternalInstrumentation) {
          return api_1.context.with((0, core_1.suppressTracing)(api_1.context.active()), originalFunction);
        } else {
          return originalFunction();
        }
      }
    }
    exports$1.MongooseInstrumentation = MongooseInstrumentation;
  })(mongoose);
  return mongoose;
}
var hasRequiredSrc$f;
function requireSrc$f() {
  if (hasRequiredSrc$f) return src$f;
  hasRequiredSrc$f = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.MongooseInstrumentation = void 0;
    var mongoose_1 = requireMongoose();
    Object.defineProperty(exports$1, "MongooseInstrumentation", { enumerable: true, get: function() {
      return mongoose_1.MongooseInstrumentation;
    } });
  })(src$f);
  return src$f;
}
var srcExports$d = requireSrc$f();
const INTEGRATION_NAME$h = "Mongoose";
const instrumentMongoose = generateInstrumentOnce(
  INTEGRATION_NAME$h,
  () => new srcExports$d.MongooseInstrumentation({
    responseHook(span) {
      addOriginToSpan(span, "auto.db.otel.mongoose");
    }
  })
);
const _mongooseIntegration = (() => {
  return {
    name: INTEGRATION_NAME$h,
    setupOnce() {
      instrumentMongoose();
    }
  };
});
const mongooseIntegration = defineIntegration(_mongooseIntegration);
var src$e = {};
var instrumentation$c = {};
var semconv$8 = {};
var hasRequiredSemconv$8;
function requireSemconv$8() {
  if (hasRequiredSemconv$8) return semconv$8;
  hasRequiredSemconv$8 = 1;
  Object.defineProperty(semconv$8, "__esModule", { value: true });
  semconv$8.METRIC_DB_CLIENT_CONNECTIONS_USAGE = semconv$8.DB_SYSTEM_VALUE_MYSQL = semconv$8.ATTR_NET_PEER_PORT = semconv$8.ATTR_NET_PEER_NAME = semconv$8.ATTR_DB_USER = semconv$8.ATTR_DB_SYSTEM = semconv$8.ATTR_DB_STATEMENT = semconv$8.ATTR_DB_NAME = semconv$8.ATTR_DB_CONNECTION_STRING = void 0;
  semconv$8.ATTR_DB_CONNECTION_STRING = "db.connection_string";
  semconv$8.ATTR_DB_NAME = "db.name";
  semconv$8.ATTR_DB_STATEMENT = "db.statement";
  semconv$8.ATTR_DB_SYSTEM = "db.system";
  semconv$8.ATTR_DB_USER = "db.user";
  semconv$8.ATTR_NET_PEER_NAME = "net.peer.name";
  semconv$8.ATTR_NET_PEER_PORT = "net.peer.port";
  semconv$8.DB_SYSTEM_VALUE_MYSQL = "mysql";
  semconv$8.METRIC_DB_CLIENT_CONNECTIONS_USAGE = "db.client.connections.usage";
  return semconv$8;
}
var AttributeNames$5 = {};
var hasRequiredAttributeNames$4;
function requireAttributeNames$4() {
  if (hasRequiredAttributeNames$4) return AttributeNames$5;
  hasRequiredAttributeNames$4 = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.AttributeNames = void 0;
    (function(AttributeNames2) {
      AttributeNames2["MYSQL_VALUES"] = "db.mysql.values";
    })(exports$1.AttributeNames || (exports$1.AttributeNames = {}));
  })(AttributeNames$5);
  return AttributeNames$5;
}
var utils$b = {};
var hasRequiredUtils$b;
function requireUtils$b() {
  if (hasRequiredUtils$b) return utils$b;
  hasRequiredUtils$b = 1;
  Object.defineProperty(utils$b, "__esModule", { value: true });
  utils$b.getPoolNameOld = utils$b.arrayStringifyHelper = utils$b.getSpanName = utils$b.getDbValues = utils$b.getDbQueryText = utils$b.getJDBCString = utils$b.getConfig = void 0;
  function getConfig(config2) {
    const { host, port, database, user } = config2 && config2.connectionConfig || config2 || {};
    return { host, port, database, user };
  }
  utils$b.getConfig = getConfig;
  function getJDBCString(host, port, database) {
    let jdbcString = `jdbc:mysql://${host || "localhost"}`;
    if (typeof port === "number") {
      jdbcString += `:${port}`;
    }
    if (typeof database === "string") {
      jdbcString += `/${database}`;
    }
    return jdbcString;
  }
  utils$b.getJDBCString = getJDBCString;
  function getDbQueryText(query) {
    if (typeof query === "string") {
      return query;
    } else {
      return query.sql;
    }
  }
  utils$b.getDbQueryText = getDbQueryText;
  function getDbValues(query, values) {
    if (typeof query === "string") {
      return arrayStringifyHelper(values);
    } else {
      return arrayStringifyHelper(values || query.values);
    }
  }
  utils$b.getDbValues = getDbValues;
  function getSpanName(query) {
    const rawQuery = typeof query === "object" ? query.sql : query;
    const firstSpace = rawQuery?.indexOf(" ");
    if (typeof firstSpace === "number" && firstSpace !== -1) {
      return rawQuery?.substring(0, firstSpace);
    }
    return rawQuery;
  }
  utils$b.getSpanName = getSpanName;
  function arrayStringifyHelper(arr) {
    if (arr)
      return `[${arr.toString()}]`;
    return "";
  }
  utils$b.arrayStringifyHelper = arrayStringifyHelper;
  function getPoolNameOld(pool) {
    const c = pool.config.connectionConfig;
    let poolName = "";
    poolName += c.host ? `host: '${c.host}', ` : "";
    poolName += c.port ? `port: ${c.port}, ` : "";
    poolName += c.database ? `database: '${c.database}', ` : "";
    poolName += c.user ? `user: '${c.user}'` : "";
    if (!c.user) {
      poolName = poolName.substring(0, poolName.length - 2);
    }
    return poolName.trim();
  }
  utils$b.getPoolNameOld = getPoolNameOld;
  return utils$b;
}
var version$c = {};
var hasRequiredVersion$c;
function requireVersion$c() {
  if (hasRequiredVersion$c) return version$c;
  hasRequiredVersion$c = 1;
  Object.defineProperty(version$c, "__esModule", { value: true });
  version$c.PACKAGE_NAME = version$c.PACKAGE_VERSION = void 0;
  version$c.PACKAGE_VERSION = "0.57.0";
  version$c.PACKAGE_NAME = "@opentelemetry/instrumentation-mysql";
  return version$c;
}
var hasRequiredInstrumentation$c;
function requireInstrumentation$c() {
  if (hasRequiredInstrumentation$c) return instrumentation$c;
  hasRequiredInstrumentation$c = 1;
  Object.defineProperty(instrumentation$c, "__esModule", { value: true });
  instrumentation$c.MySQLInstrumentation = void 0;
  const api_1 = require$$0$2;
  const instrumentation_1 = require$$2;
  const semantic_conventions_1 = require$$2$1;
  const semconv_1 = requireSemconv$8();
  const AttributeNames_1 = requireAttributeNames$4();
  const utils_1 = requireUtils$b();
  const version_1 = requireVersion$c();
  class MySQLInstrumentation extends instrumentation_1.InstrumentationBase {
    _netSemconvStability;
    _dbSemconvStability;
    constructor(config2 = {}) {
      super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config2);
      this._setSemconvStabilityFromEnv();
    }
    // Used for testing.
    _setSemconvStabilityFromEnv() {
      this._netSemconvStability = (0, instrumentation_1.semconvStabilityFromStr)("http", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
      this._dbSemconvStability = (0, instrumentation_1.semconvStabilityFromStr)("database", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
    }
    _updateMetricInstruments() {
      this._connectionsUsageOld = this.meter.createUpDownCounter(semconv_1.METRIC_DB_CLIENT_CONNECTIONS_USAGE, {
        description: "The number of connections that are currently in state described by the state attribute.",
        unit: "{connection}"
      });
    }
    /**
     * Convenience function for updating the `db.client.connections.usage` metric.
     * The name "count" comes from the eventually replacement for this metric per
     * https://opentelemetry.io/docs/specs/semconv/non-normative/db-migration/#database-client-connection-count
     */
    _connCountAdd(n, poolNameOld, state) {
      this._connectionsUsageOld?.add(n, { state, name: poolNameOld });
    }
    init() {
      return [
        new instrumentation_1.InstrumentationNodeModuleDefinition("mysql", [">=2.0.0 <3"], (moduleExports) => {
          if ((0, instrumentation_1.isWrapped)(moduleExports.createConnection)) {
            this._unwrap(moduleExports, "createConnection");
          }
          this._wrap(moduleExports, "createConnection", this._patchCreateConnection());
          if ((0, instrumentation_1.isWrapped)(moduleExports.createPool)) {
            this._unwrap(moduleExports, "createPool");
          }
          this._wrap(moduleExports, "createPool", this._patchCreatePool());
          if ((0, instrumentation_1.isWrapped)(moduleExports.createPoolCluster)) {
            this._unwrap(moduleExports, "createPoolCluster");
          }
          this._wrap(moduleExports, "createPoolCluster", this._patchCreatePoolCluster());
          return moduleExports;
        }, (moduleExports) => {
          if (moduleExports === void 0)
            return;
          this._unwrap(moduleExports, "createConnection");
          this._unwrap(moduleExports, "createPool");
          this._unwrap(moduleExports, "createPoolCluster");
        })
      ];
    }
    // global export function
    _patchCreateConnection() {
      return (originalCreateConnection) => {
        const thisPlugin = this;
        return function createConnection(_connectionUri) {
          const originalResult = originalCreateConnection(...arguments);
          thisPlugin._wrap(originalResult, "query", thisPlugin._patchQuery(originalResult));
          return originalResult;
        };
      };
    }
    // global export function
    _patchCreatePool() {
      return (originalCreatePool) => {
        const thisPlugin = this;
        return function createPool(_config) {
          const pool = originalCreatePool(...arguments);
          thisPlugin._wrap(pool, "query", thisPlugin._patchQuery(pool));
          thisPlugin._wrap(pool, "getConnection", thisPlugin._patchGetConnection(pool));
          thisPlugin._wrap(pool, "end", thisPlugin._patchPoolEnd(pool));
          thisPlugin._setPoolCallbacks(pool, "");
          return pool;
        };
      };
    }
    _patchPoolEnd(pool) {
      return (originalPoolEnd) => {
        const thisPlugin = this;
        return function end(callback) {
          const nAll = pool._allConnections.length;
          const nFree = pool._freeConnections.length;
          const nUsed = nAll - nFree;
          const poolNameOld = (0, utils_1.getPoolNameOld)(pool);
          thisPlugin._connCountAdd(-nUsed, poolNameOld, "used");
          thisPlugin._connCountAdd(-nFree, poolNameOld, "idle");
          originalPoolEnd.apply(pool, arguments);
        };
      };
    }
    // global export function
    _patchCreatePoolCluster() {
      return (originalCreatePoolCluster) => {
        const thisPlugin = this;
        return function createPool(_config) {
          const cluster = originalCreatePoolCluster(...arguments);
          thisPlugin._wrap(cluster, "getConnection", thisPlugin._patchGetConnection(cluster));
          thisPlugin._wrap(cluster, "add", thisPlugin._patchAdd(cluster));
          return cluster;
        };
      };
    }
    _patchAdd(cluster) {
      return (originalAdd) => {
        const thisPlugin = this;
        return function add(id, config2) {
          if (!thisPlugin["_enabled"]) {
            thisPlugin._unwrap(cluster, "add");
            return originalAdd.apply(cluster, arguments);
          }
          originalAdd.apply(cluster, arguments);
          const nodes = cluster["_nodes"];
          if (nodes) {
            const nodeId = typeof id === "object" ? "CLUSTER::" + cluster._lastId : String(id);
            const pool = nodes[nodeId].pool;
            thisPlugin._setPoolCallbacks(pool, id);
          }
        };
      };
    }
    // method on cluster or pool
    _patchGetConnection(pool) {
      return (originalGetConnection) => {
        const thisPlugin = this;
        return function getConnection(arg1, arg2, arg3) {
          if (!thisPlugin["_enabled"]) {
            thisPlugin._unwrap(pool, "getConnection");
            return originalGetConnection.apply(pool, arguments);
          }
          if (arguments.length === 1 && typeof arg1 === "function") {
            const patchFn = thisPlugin._getConnectionCallbackPatchFn(arg1);
            return originalGetConnection.call(pool, patchFn);
          }
          if (arguments.length === 2 && typeof arg2 === "function") {
            const patchFn = thisPlugin._getConnectionCallbackPatchFn(arg2);
            return originalGetConnection.call(pool, arg1, patchFn);
          }
          if (arguments.length === 3 && typeof arg3 === "function") {
            const patchFn = thisPlugin._getConnectionCallbackPatchFn(arg3);
            return originalGetConnection.call(pool, arg1, arg2, patchFn);
          }
          return originalGetConnection.apply(pool, arguments);
        };
      };
    }
    _getConnectionCallbackPatchFn(cb2) {
      const thisPlugin = this;
      const activeContext = api_1.context.active();
      return function(err, connection) {
        if (connection) {
          if (!(0, instrumentation_1.isWrapped)(connection.query)) {
            thisPlugin._wrap(connection, "query", thisPlugin._patchQuery(connection));
          }
        }
        if (typeof cb2 === "function") {
          api_1.context.with(activeContext, cb2, this, err, connection);
        }
      };
    }
    _patchQuery(connection) {
      return (originalQuery) => {
        const thisPlugin = this;
        return function query(query, _valuesOrCallback, _callback) {
          if (!thisPlugin["_enabled"]) {
            thisPlugin._unwrap(connection, "query");
            return originalQuery.apply(connection, arguments);
          }
          const attributes = {};
          const { host, port, database, user } = (0, utils_1.getConfig)(connection.config);
          const portNumber = parseInt(port, 10);
          const dbQueryText = (0, utils_1.getDbQueryText)(query);
          if (thisPlugin._dbSemconvStability & instrumentation_1.SemconvStability.OLD) {
            attributes[semconv_1.ATTR_DB_SYSTEM] = semconv_1.DB_SYSTEM_VALUE_MYSQL;
            attributes[semconv_1.ATTR_DB_CONNECTION_STRING] = (0, utils_1.getJDBCString)(host, port, database);
            attributes[semconv_1.ATTR_DB_NAME] = database;
            attributes[semconv_1.ATTR_DB_USER] = user;
            attributes[semconv_1.ATTR_DB_STATEMENT] = dbQueryText;
          }
          if (thisPlugin._dbSemconvStability & instrumentation_1.SemconvStability.STABLE) {
            attributes[semantic_conventions_1.ATTR_DB_SYSTEM_NAME] = semantic_conventions_1.DB_SYSTEM_NAME_VALUE_MYSQL;
            attributes[semantic_conventions_1.ATTR_DB_NAMESPACE] = database;
            attributes[semantic_conventions_1.ATTR_DB_QUERY_TEXT] = dbQueryText;
          }
          if (thisPlugin._netSemconvStability & instrumentation_1.SemconvStability.OLD) {
            attributes[semconv_1.ATTR_NET_PEER_NAME] = host;
            if (!isNaN(portNumber)) {
              attributes[semconv_1.ATTR_NET_PEER_PORT] = portNumber;
            }
          }
          if (thisPlugin._netSemconvStability & instrumentation_1.SemconvStability.STABLE) {
            attributes[semantic_conventions_1.ATTR_SERVER_ADDRESS] = host;
            if (!isNaN(portNumber)) {
              attributes[semantic_conventions_1.ATTR_SERVER_PORT] = portNumber;
            }
          }
          const span = thisPlugin.tracer.startSpan((0, utils_1.getSpanName)(query), {
            kind: api_1.SpanKind.CLIENT,
            attributes
          });
          if (thisPlugin.getConfig().enhancedDatabaseReporting) {
            let values;
            if (Array.isArray(_valuesOrCallback)) {
              values = _valuesOrCallback;
            } else if (arguments[2]) {
              values = [_valuesOrCallback];
            }
            span.setAttribute(AttributeNames_1.AttributeNames.MYSQL_VALUES, (0, utils_1.getDbValues)(query, values));
          }
          const cbIndex = Array.from(arguments).findIndex((arg) => typeof arg === "function");
          const parentContext = api_1.context.active();
          if (cbIndex === -1) {
            const streamableQuery = api_1.context.with(api_1.trace.setSpan(api_1.context.active(), span), () => {
              return originalQuery.apply(connection, arguments);
            });
            api_1.context.bind(parentContext, streamableQuery);
            return streamableQuery.on("error", (err) => span.setStatus({
              code: api_1.SpanStatusCode.ERROR,
              message: err.message
            })).on("end", () => {
              span.end();
            });
          } else {
            thisPlugin._wrap(arguments, cbIndex, thisPlugin._patchCallbackQuery(span, parentContext));
            return api_1.context.with(api_1.trace.setSpan(api_1.context.active(), span), () => {
              return originalQuery.apply(connection, arguments);
            });
          }
        };
      };
    }
    _patchCallbackQuery(span, parentContext) {
      return (originalCallback) => {
        return function(err, results, fields) {
          if (err) {
            span.setStatus({
              code: api_1.SpanStatusCode.ERROR,
              message: err.message
            });
          }
          span.end();
          return api_1.context.with(parentContext, () => originalCallback(...arguments));
        };
      };
    }
    _setPoolCallbacks(pool, id) {
      const poolNameOld = id || (0, utils_1.getPoolNameOld)(pool);
      pool.on("connection", (_connection) => {
        this._connCountAdd(1, poolNameOld, "idle");
      });
      pool.on("acquire", (_connection) => {
        this._connCountAdd(-1, poolNameOld, "idle");
        this._connCountAdd(1, poolNameOld, "used");
      });
      pool.on("release", (_connection) => {
        this._connCountAdd(1, poolNameOld, "idle");
        this._connCountAdd(-1, poolNameOld, "used");
      });
    }
  }
  instrumentation$c.MySQLInstrumentation = MySQLInstrumentation;
  return instrumentation$c;
}
var hasRequiredSrc$e;
function requireSrc$e() {
  if (hasRequiredSrc$e) return src$e;
  hasRequiredSrc$e = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.MySQLInstrumentation = void 0;
    var instrumentation_1 = requireInstrumentation$c();
    Object.defineProperty(exports$1, "MySQLInstrumentation", { enumerable: true, get: function() {
      return instrumentation_1.MySQLInstrumentation;
    } });
  })(src$e);
  return src$e;
}
var srcExports$c = requireSrc$e();
const INTEGRATION_NAME$g = "Mysql";
const instrumentMysql = generateInstrumentOnce(INTEGRATION_NAME$g, () => new srcExports$c.MySQLInstrumentation({}));
const _mysqlIntegration = (() => {
  return {
    name: INTEGRATION_NAME$g,
    setupOnce() {
      instrumentMysql();
    }
  };
});
const mysqlIntegration = defineIntegration(_mysqlIntegration);
var src$d = {};
var instrumentation$b = {};
var semconv$7 = {};
var hasRequiredSemconv$7;
function requireSemconv$7() {
  if (hasRequiredSemconv$7) return semconv$7;
  hasRequiredSemconv$7 = 1;
  Object.defineProperty(semconv$7, "__esModule", { value: true });
  semconv$7.DB_SYSTEM_VALUE_MYSQL = semconv$7.ATTR_NET_PEER_PORT = semconv$7.ATTR_NET_PEER_NAME = semconv$7.ATTR_DB_USER = semconv$7.ATTR_DB_SYSTEM = semconv$7.ATTR_DB_STATEMENT = semconv$7.ATTR_DB_NAME = semconv$7.ATTR_DB_CONNECTION_STRING = void 0;
  semconv$7.ATTR_DB_CONNECTION_STRING = "db.connection_string";
  semconv$7.ATTR_DB_NAME = "db.name";
  semconv$7.ATTR_DB_STATEMENT = "db.statement";
  semconv$7.ATTR_DB_SYSTEM = "db.system";
  semconv$7.ATTR_DB_USER = "db.user";
  semconv$7.ATTR_NET_PEER_NAME = "net.peer.name";
  semconv$7.ATTR_NET_PEER_PORT = "net.peer.port";
  semconv$7.DB_SYSTEM_VALUE_MYSQL = "mysql";
  return semconv$7;
}
var src$c = {};
var hasRequiredSrc$d;
function requireSrc$d() {
  if (hasRequiredSrc$d) return src$c;
  hasRequiredSrc$d = 1;
  Object.defineProperty(src$c, "__esModule", { value: true });
  src$c.addSqlCommenterComment = void 0;
  const api_1 = require$$0$2;
  const core_1 = require$$1$1;
  function hasValidSqlComment(query) {
    const indexOpeningDashDashComment = query.indexOf("--");
    if (indexOpeningDashDashComment >= 0) {
      return true;
    }
    const indexOpeningSlashComment = query.indexOf("/*");
    if (indexOpeningSlashComment < 0) {
      return false;
    }
    const indexClosingSlashComment = query.indexOf("*/");
    return indexOpeningDashDashComment < indexClosingSlashComment;
  }
  function fixedEncodeURIComponent(str) {
    return encodeURIComponent(str).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
  }
  function addSqlCommenterComment(span, query) {
    if (typeof query !== "string" || query.length === 0) {
      return query;
    }
    if (hasValidSqlComment(query)) {
      return query;
    }
    const propagator2 = new core_1.W3CTraceContextPropagator();
    const headers = {};
    propagator2.inject(api_1.trace.setSpan(api_1.ROOT_CONTEXT, span), headers, api_1.defaultTextMapSetter);
    const sortedKeys = Object.keys(headers).sort();
    if (sortedKeys.length === 0) {
      return query;
    }
    const commentString = sortedKeys.map((key) => {
      const encodedValue = fixedEncodeURIComponent(headers[key]);
      return `${key}='${encodedValue}'`;
    }).join(",");
    return `${query} /*${commentString}*/`;
  }
  src$c.addSqlCommenterComment = addSqlCommenterComment;
  return src$c;
}
var utils$a = {};
var hasRequiredUtils$a;
function requireUtils$a() {
  if (hasRequiredUtils$a) return utils$a;
  hasRequiredUtils$a = 1;
  Object.defineProperty(utils$a, "__esModule", { value: true });
  utils$a.getConnectionPrototypeToInstrument = utils$a.once = utils$a.getSpanName = utils$a.getQueryText = utils$a.getConnectionAttributes = void 0;
  const semconv_1 = requireSemconv$7();
  const instrumentation_1 = require$$2;
  const semantic_conventions_1 = require$$2$1;
  function getConnectionAttributes(config2, dbSemconvStability, netSemconvStability) {
    const { host, port, database, user } = getConfig(config2);
    const attrs = {};
    if (dbSemconvStability & instrumentation_1.SemconvStability.OLD) {
      attrs[semconv_1.ATTR_DB_CONNECTION_STRING] = getJDBCString(host, port, database);
      attrs[semconv_1.ATTR_DB_NAME] = database;
      attrs[semconv_1.ATTR_DB_USER] = user;
    }
    if (dbSemconvStability & instrumentation_1.SemconvStability.STABLE) {
      attrs[semantic_conventions_1.ATTR_DB_NAMESPACE] = database;
    }
    const portNumber = parseInt(port, 10);
    if (netSemconvStability & instrumentation_1.SemconvStability.OLD) {
      attrs[semconv_1.ATTR_NET_PEER_NAME] = host;
      if (!isNaN(portNumber)) {
        attrs[semconv_1.ATTR_NET_PEER_PORT] = portNumber;
      }
    }
    if (netSemconvStability & instrumentation_1.SemconvStability.STABLE) {
      attrs[semantic_conventions_1.ATTR_SERVER_ADDRESS] = host;
      if (!isNaN(portNumber)) {
        attrs[semantic_conventions_1.ATTR_SERVER_PORT] = portNumber;
      }
    }
    return attrs;
  }
  utils$a.getConnectionAttributes = getConnectionAttributes;
  function getConfig(config2) {
    const { host, port, database, user } = config2 && config2.connectionConfig || config2 || {};
    return { host, port, database, user };
  }
  function getJDBCString(host, port, database) {
    let jdbcString = `jdbc:mysql://${host || "localhost"}`;
    if (typeof port === "number") {
      jdbcString += `:${port}`;
    }
    if (typeof database === "string") {
      jdbcString += `/${database}`;
    }
    return jdbcString;
  }
  function getQueryText(query, format, values, maskStatement = false, maskStatementHook = defaultMaskingHook) {
    const [querySql, queryValues] = typeof query === "string" ? [query, values] : [query.sql, hasValues(query) ? values || query.values : values];
    try {
      if (maskStatement) {
        return maskStatementHook(querySql);
      } else if (format && queryValues) {
        return format(querySql, queryValues);
      } else {
        return querySql;
      }
    } catch (e) {
      return "Could not determine the query due to an error in masking or formatting";
    }
  }
  utils$a.getQueryText = getQueryText;
  function defaultMaskingHook(query) {
    return query.replace(/\b\d+\b/g, "?").replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, "?");
  }
  function hasValues(obj) {
    return "values" in obj;
  }
  function getSpanName(query) {
    const rawQuery = typeof query === "object" ? query.sql : query;
    const firstSpace = rawQuery?.indexOf(" ");
    if (typeof firstSpace === "number" && firstSpace !== -1) {
      return rawQuery?.substring(0, firstSpace);
    }
    return rawQuery;
  }
  utils$a.getSpanName = getSpanName;
  const once = (fn) => {
    let called = false;
    return (...args) => {
      if (called)
        return;
      called = true;
      return fn(...args);
    };
  };
  utils$a.once = once;
  function getConnectionPrototypeToInstrument(connection) {
    const connectionPrototype = connection.prototype;
    const basePrototype = Object.getPrototypeOf(connectionPrototype);
    if (typeof basePrototype?.query === "function" && typeof basePrototype?.execute === "function") {
      return basePrototype;
    }
    return connectionPrototype;
  }
  utils$a.getConnectionPrototypeToInstrument = getConnectionPrototypeToInstrument;
  return utils$a;
}
var version$b = {};
var hasRequiredVersion$b;
function requireVersion$b() {
  if (hasRequiredVersion$b) return version$b;
  hasRequiredVersion$b = 1;
  Object.defineProperty(version$b, "__esModule", { value: true });
  version$b.PACKAGE_NAME = version$b.PACKAGE_VERSION = void 0;
  version$b.PACKAGE_VERSION = "0.57.0";
  version$b.PACKAGE_NAME = "@opentelemetry/instrumentation-mysql2";
  return version$b;
}
var hasRequiredInstrumentation$b;
function requireInstrumentation$b() {
  if (hasRequiredInstrumentation$b) return instrumentation$b;
  hasRequiredInstrumentation$b = 1;
  Object.defineProperty(instrumentation$b, "__esModule", { value: true });
  instrumentation$b.MySQL2Instrumentation = void 0;
  const api = require$$0$2;
  const instrumentation_1 = require$$2;
  const semconv_1 = requireSemconv$7();
  const sql_common_1 = requireSrc$d();
  const utils_1 = requireUtils$a();
  const version_1 = requireVersion$b();
  const semantic_conventions_1 = require$$2$1;
  const supportedVersions2 = [">=1.4.2 <4"];
  class MySQL2Instrumentation extends instrumentation_1.InstrumentationBase {
    _netSemconvStability;
    _dbSemconvStability;
    constructor(config2 = {}) {
      super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config2);
      this._setSemconvStabilityFromEnv();
    }
    // Used for testing.
    _setSemconvStabilityFromEnv() {
      this._netSemconvStability = (0, instrumentation_1.semconvStabilityFromStr)("http", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
      this._dbSemconvStability = (0, instrumentation_1.semconvStabilityFromStr)("database", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
    }
    init() {
      let format;
      function setFormatFunction(moduleExports) {
        if (!format && moduleExports.format) {
          format = moduleExports.format;
        }
      }
      const patch = (ConnectionPrototype) => {
        if ((0, instrumentation_1.isWrapped)(ConnectionPrototype.query)) {
          this._unwrap(ConnectionPrototype, "query");
        }
        this._wrap(ConnectionPrototype, "query", this._patchQuery(format, false));
        if ((0, instrumentation_1.isWrapped)(ConnectionPrototype.execute)) {
          this._unwrap(ConnectionPrototype, "execute");
        }
        this._wrap(ConnectionPrototype, "execute", this._patchQuery(format, true));
      };
      const unpatch = (ConnectionPrototype) => {
        this._unwrap(ConnectionPrototype, "query");
        this._unwrap(ConnectionPrototype, "execute");
      };
      return [
        new instrumentation_1.InstrumentationNodeModuleDefinition("mysql2", supportedVersions2, (moduleExports) => {
          setFormatFunction(moduleExports);
          return moduleExports;
        }, () => {
        }, [
          new instrumentation_1.InstrumentationNodeModuleFile("mysql2/promise.js", supportedVersions2, (moduleExports) => {
            setFormatFunction(moduleExports);
            return moduleExports;
          }, () => {
          }),
          new instrumentation_1.InstrumentationNodeModuleFile("mysql2/lib/connection.js", supportedVersions2, (moduleExports) => {
            const ConnectionPrototype = (0, utils_1.getConnectionPrototypeToInstrument)(moduleExports);
            patch(ConnectionPrototype);
            return moduleExports;
          }, (moduleExports) => {
            if (moduleExports === void 0)
              return;
            const ConnectionPrototype = (0, utils_1.getConnectionPrototypeToInstrument)(moduleExports);
            unpatch(ConnectionPrototype);
          })
        ])
      ];
    }
    _patchQuery(format, isPrepared) {
      return (originalQuery) => {
        const thisPlugin = this;
        return function query(query, _valuesOrCallback, _callback) {
          let values;
          if (Array.isArray(_valuesOrCallback)) {
            values = _valuesOrCallback;
          } else if (arguments[2]) {
            values = [_valuesOrCallback];
          }
          const { maskStatement, maskStatementHook, responseHook } = thisPlugin.getConfig();
          const attributes = (0, utils_1.getConnectionAttributes)(this.config, thisPlugin._dbSemconvStability, thisPlugin._netSemconvStability);
          const dbQueryText = (0, utils_1.getQueryText)(query, format, values, maskStatement, maskStatementHook);
          if (thisPlugin._dbSemconvStability & instrumentation_1.SemconvStability.OLD) {
            attributes[semconv_1.ATTR_DB_SYSTEM] = semconv_1.DB_SYSTEM_VALUE_MYSQL;
            attributes[semconv_1.ATTR_DB_STATEMENT] = dbQueryText;
          }
          if (thisPlugin._dbSemconvStability & instrumentation_1.SemconvStability.STABLE) {
            attributes[semantic_conventions_1.ATTR_DB_SYSTEM_NAME] = semantic_conventions_1.DB_SYSTEM_NAME_VALUE_MYSQL;
            attributes[semantic_conventions_1.ATTR_DB_QUERY_TEXT] = dbQueryText;
          }
          const span = thisPlugin.tracer.startSpan((0, utils_1.getSpanName)(query), {
            kind: api.SpanKind.CLIENT,
            attributes
          });
          if (!isPrepared && thisPlugin.getConfig().addSqlCommenterCommentToQueries) {
            arguments[0] = query = typeof query === "string" ? (0, sql_common_1.addSqlCommenterComment)(span, query) : Object.assign(query, {
              sql: (0, sql_common_1.addSqlCommenterComment)(span, query.sql)
            });
          }
          const endSpan2 = (0, utils_1.once)((err, results) => {
            if (err) {
              span.setStatus({
                code: api.SpanStatusCode.ERROR,
                message: err.message
              });
            } else {
              if (typeof responseHook === "function") {
                (0, instrumentation_1.safeExecuteInTheMiddle)(() => {
                  responseHook(span, {
                    queryResults: results
                  });
                }, (err2) => {
                  if (err2) {
                    thisPlugin._diag.warn("Failed executing responseHook", err2);
                  }
                }, true);
              }
            }
            span.end();
          });
          if (arguments.length === 1) {
            if (typeof query.onResult === "function") {
              thisPlugin._wrap(query, "onResult", thisPlugin._patchCallbackQuery(endSpan2));
            }
            const streamableQuery = originalQuery.apply(this, arguments);
            streamableQuery.once("error", (err) => {
              endSpan2(err);
            }).once("result", (results) => {
              endSpan2(void 0, results);
            });
            return streamableQuery;
          }
          if (typeof arguments[1] === "function") {
            thisPlugin._wrap(arguments, 1, thisPlugin._patchCallbackQuery(endSpan2));
          } else if (typeof arguments[2] === "function") {
            thisPlugin._wrap(arguments, 2, thisPlugin._patchCallbackQuery(endSpan2));
          }
          return originalQuery.apply(this, arguments);
        };
      };
    }
    _patchCallbackQuery(endSpan2) {
      return (originalCallback) => {
        return function(err, results, fields) {
          endSpan2(err, results);
          return originalCallback(...arguments);
        };
      };
    }
  }
  instrumentation$b.MySQL2Instrumentation = MySQL2Instrumentation;
  return instrumentation$b;
}
var hasRequiredSrc$c;
function requireSrc$c() {
  if (hasRequiredSrc$c) return src$d;
  hasRequiredSrc$c = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.MySQL2Instrumentation = void 0;
    var instrumentation_1 = requireInstrumentation$b();
    Object.defineProperty(exports$1, "MySQL2Instrumentation", { enumerable: true, get: function() {
      return instrumentation_1.MySQL2Instrumentation;
    } });
  })(src$d);
  return src$d;
}
var srcExports$b = requireSrc$c();
const INTEGRATION_NAME$f = "Mysql2";
const instrumentMysql2 = generateInstrumentOnce(
  INTEGRATION_NAME$f,
  () => new srcExports$b.MySQL2Instrumentation({
    responseHook(span) {
      addOriginToSpan(span, "auto.db.otel.mysql2");
    }
  })
);
const _mysql2Integration = (() => {
  return {
    name: INTEGRATION_NAME$f,
    setupOnce() {
      instrumentMysql2();
    }
  };
});
const mysql2Integration = defineIntegration(_mysql2Integration);
var src$b = {};
var instrumentation$a = {};
var semconv$6 = {};
var hasRequiredSemconv$6;
function requireSemconv$6() {
  if (hasRequiredSemconv$6) return semconv$6;
  hasRequiredSemconv$6 = 1;
  Object.defineProperty(semconv$6, "__esModule", { value: true });
  semconv$6.DB_SYSTEM_VALUE_REDIS = semconv$6.DB_SYSTEM_NAME_VALUE_REDIS = semconv$6.ATTR_NET_PEER_PORT = semconv$6.ATTR_NET_PEER_NAME = semconv$6.ATTR_DB_SYSTEM = semconv$6.ATTR_DB_STATEMENT = semconv$6.ATTR_DB_CONNECTION_STRING = void 0;
  semconv$6.ATTR_DB_CONNECTION_STRING = "db.connection_string";
  semconv$6.ATTR_DB_STATEMENT = "db.statement";
  semconv$6.ATTR_DB_SYSTEM = "db.system";
  semconv$6.ATTR_NET_PEER_NAME = "net.peer.name";
  semconv$6.ATTR_NET_PEER_PORT = "net.peer.port";
  semconv$6.DB_SYSTEM_NAME_VALUE_REDIS = "redis";
  semconv$6.DB_SYSTEM_VALUE_REDIS = "redis";
  return semconv$6;
}
var utils$9 = {};
var hasRequiredUtils$9;
function requireUtils$9() {
  if (hasRequiredUtils$9) return utils$9;
  hasRequiredUtils$9 = 1;
  Object.defineProperty(utils$9, "__esModule", { value: true });
  utils$9.endSpan = void 0;
  const api_1 = require$$0$2;
  const endSpan2 = (span, err) => {
    if (err) {
      span.recordException(err);
      span.setStatus({
        code: api_1.SpanStatusCode.ERROR,
        message: err.message
      });
    }
    span.end();
  };
  utils$9.endSpan = endSpan2;
  return utils$9;
}
var src$a = {};
var hasRequiredSrc$b;
function requireSrc$b() {
  if (hasRequiredSrc$b) return src$a;
  hasRequiredSrc$b = 1;
  Object.defineProperty(src$a, "__esModule", { value: true });
  src$a.defaultDbStatementSerializer = void 0;
  const serializationSubsets = [
    {
      regex: /^ECHO/i,
      args: 0
    },
    {
      regex: /^(LPUSH|MSET|PFA|PUBLISH|RPUSH|SADD|SET|SPUBLISH|XADD|ZADD)/i,
      args: 1
    },
    {
      regex: /^(HSET|HMSET|LSET|LINSERT)/i,
      args: 2
    },
    {
      regex: /^(ACL|BIT|B[LRZ]|CLIENT|CLUSTER|CONFIG|COMMAND|DECR|DEL|EVAL|EX|FUNCTION|GEO|GET|HINCR|HMGET|HSCAN|INCR|L[TRLM]|MEMORY|P[EFISTU]|RPOP|S[CDIMORSU]|XACK|X[CDGILPRT]|Z[CDILMPRS])/i,
      args: -1
    }
  ];
  const defaultDbStatementSerializer = (cmdName, cmdArgs) => {
    if (Array.isArray(cmdArgs) && cmdArgs.length) {
      const nArgsToSerialize = serializationSubsets.find(({ regex }) => {
        return regex.test(cmdName);
      })?.args ?? 0;
      const argsToSerialize = nArgsToSerialize >= 0 ? cmdArgs.slice(0, nArgsToSerialize) : cmdArgs;
      if (cmdArgs.length > argsToSerialize.length) {
        argsToSerialize.push(`[${cmdArgs.length - nArgsToSerialize} other arguments]`);
      }
      return `${cmdName} ${argsToSerialize.join(" ")}`;
    }
    return cmdName;
  };
  src$a.defaultDbStatementSerializer = defaultDbStatementSerializer;
  return src$a;
}
var version$a = {};
var hasRequiredVersion$a;
function requireVersion$a() {
  if (hasRequiredVersion$a) return version$a;
  hasRequiredVersion$a = 1;
  Object.defineProperty(version$a, "__esModule", { value: true });
  version$a.PACKAGE_NAME = version$a.PACKAGE_VERSION = void 0;
  version$a.PACKAGE_VERSION = "0.59.0";
  version$a.PACKAGE_NAME = "@opentelemetry/instrumentation-ioredis";
  return version$a;
}
var hasRequiredInstrumentation$a;
function requireInstrumentation$a() {
  if (hasRequiredInstrumentation$a) return instrumentation$a;
  hasRequiredInstrumentation$a = 1;
  Object.defineProperty(instrumentation$a, "__esModule", { value: true });
  instrumentation$a.IORedisInstrumentation = void 0;
  const api_1 = require$$0$2;
  const instrumentation_1 = require$$2;
  const semantic_conventions_1 = require$$2$1;
  const semconv_1 = requireSemconv$6();
  const instrumentation_2 = require$$2;
  const utils_1 = requireUtils$9();
  const redis_common_1 = requireSrc$b();
  const version_1 = requireVersion$a();
  const DEFAULT_CONFIG = {
    requireParentSpan: true
  };
  class IORedisInstrumentation extends instrumentation_1.InstrumentationBase {
    _netSemconvStability;
    _dbSemconvStability;
    constructor(config2 = {}) {
      super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, { ...DEFAULT_CONFIG, ...config2 });
      this._setSemconvStabilityFromEnv();
    }
    // Used for testing.
    _setSemconvStabilityFromEnv() {
      this._netSemconvStability = (0, instrumentation_1.semconvStabilityFromStr)("http", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
      this._dbSemconvStability = (0, instrumentation_1.semconvStabilityFromStr)("database", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
    }
    setConfig(config2 = {}) {
      super.setConfig({ ...DEFAULT_CONFIG, ...config2 });
    }
    init() {
      return [
        new instrumentation_1.InstrumentationNodeModuleDefinition("ioredis", [">=2.0.0 <6"], (module2, moduleVersion) => {
          const moduleExports = module2[Symbol.toStringTag] === "Module" ? module2.default : module2;
          if ((0, instrumentation_1.isWrapped)(moduleExports.prototype.sendCommand)) {
            this._unwrap(moduleExports.prototype, "sendCommand");
          }
          this._wrap(moduleExports.prototype, "sendCommand", this._patchSendCommand(moduleVersion));
          if ((0, instrumentation_1.isWrapped)(moduleExports.prototype.connect)) {
            this._unwrap(moduleExports.prototype, "connect");
          }
          this._wrap(moduleExports.prototype, "connect", this._patchConnection());
          return module2;
        }, (module2) => {
          if (module2 === void 0)
            return;
          const moduleExports = module2[Symbol.toStringTag] === "Module" ? module2.default : module2;
          this._unwrap(moduleExports.prototype, "sendCommand");
          this._unwrap(moduleExports.prototype, "connect");
        })
      ];
    }
    /**
     * Patch send command internal to trace requests
     */
    _patchSendCommand(moduleVersion) {
      return (original) => {
        return this._traceSendCommand(original, moduleVersion);
      };
    }
    _patchConnection() {
      return (original) => {
        return this._traceConnection(original);
      };
    }
    _traceSendCommand(original, moduleVersion) {
      const instrumentation2 = this;
      return function(cmd) {
        if (arguments.length < 1 || typeof cmd !== "object") {
          return original.apply(this, arguments);
        }
        const config2 = instrumentation2.getConfig();
        const dbStatementSerializer = config2.dbStatementSerializer || redis_common_1.defaultDbStatementSerializer;
        const hasNoParentSpan = api_1.trace.getSpan(api_1.context.active()) === void 0;
        if (config2.requireParentSpan === true && hasNoParentSpan) {
          return original.apply(this, arguments);
        }
        const attributes = {};
        const { host, port } = this.options;
        const dbQueryText = dbStatementSerializer(cmd.name, cmd.args);
        if (instrumentation2._dbSemconvStability & instrumentation_1.SemconvStability.OLD) {
          attributes[semconv_1.ATTR_DB_SYSTEM] = semconv_1.DB_SYSTEM_VALUE_REDIS;
          attributes[semconv_1.ATTR_DB_STATEMENT] = dbQueryText;
          attributes[semconv_1.ATTR_DB_CONNECTION_STRING] = `redis://${host}:${port}`;
        }
        if (instrumentation2._dbSemconvStability & instrumentation_1.SemconvStability.STABLE) {
          attributes[semantic_conventions_1.ATTR_DB_SYSTEM_NAME] = semconv_1.DB_SYSTEM_NAME_VALUE_REDIS;
          attributes[semantic_conventions_1.ATTR_DB_QUERY_TEXT] = dbQueryText;
        }
        if (instrumentation2._netSemconvStability & instrumentation_1.SemconvStability.OLD) {
          attributes[semconv_1.ATTR_NET_PEER_NAME] = host;
          attributes[semconv_1.ATTR_NET_PEER_PORT] = port;
        }
        if (instrumentation2._netSemconvStability & instrumentation_1.SemconvStability.STABLE) {
          attributes[semantic_conventions_1.ATTR_SERVER_ADDRESS] = host;
          attributes[semantic_conventions_1.ATTR_SERVER_PORT] = port;
        }
        const span = instrumentation2.tracer.startSpan(cmd.name, {
          kind: api_1.SpanKind.CLIENT,
          attributes
        });
        const { requestHook: requestHook2 } = config2;
        if (requestHook2) {
          (0, instrumentation_2.safeExecuteInTheMiddle)(() => requestHook2(span, {
            moduleVersion,
            cmdName: cmd.name,
            cmdArgs: cmd.args
          }), (e) => {
            if (e) {
              api_1.diag.error("ioredis instrumentation: request hook failed", e);
            }
          }, true);
        }
        try {
          const result = original.apply(this, arguments);
          const origResolve = cmd.resolve;
          cmd.resolve = function(result2) {
            (0, instrumentation_2.safeExecuteInTheMiddle)(() => config2.responseHook?.(span, cmd.name, cmd.args, result2), (e) => {
              if (e) {
                api_1.diag.error("ioredis instrumentation: response hook failed", e);
              }
            }, true);
            (0, utils_1.endSpan)(span, null);
            origResolve(result2);
          };
          const origReject = cmd.reject;
          cmd.reject = function(err) {
            (0, utils_1.endSpan)(span, err);
            origReject(err);
          };
          return result;
        } catch (error2) {
          (0, utils_1.endSpan)(span, error2);
          throw error2;
        }
      };
    }
    _traceConnection(original) {
      const instrumentation2 = this;
      return function() {
        const hasNoParentSpan = api_1.trace.getSpan(api_1.context.active()) === void 0;
        if (instrumentation2.getConfig().requireParentSpan === true && hasNoParentSpan) {
          return original.apply(this, arguments);
        }
        const attributes = {};
        const { host, port } = this.options;
        if (instrumentation2._dbSemconvStability & instrumentation_1.SemconvStability.OLD) {
          attributes[semconv_1.ATTR_DB_SYSTEM] = semconv_1.DB_SYSTEM_VALUE_REDIS;
          attributes[semconv_1.ATTR_DB_STATEMENT] = "connect";
          attributes[semconv_1.ATTR_DB_CONNECTION_STRING] = `redis://${host}:${port}`;
        }
        if (instrumentation2._dbSemconvStability & instrumentation_1.SemconvStability.STABLE) {
          attributes[semantic_conventions_1.ATTR_DB_SYSTEM_NAME] = semconv_1.DB_SYSTEM_NAME_VALUE_REDIS;
          attributes[semantic_conventions_1.ATTR_DB_QUERY_TEXT] = "connect";
        }
        if (instrumentation2._netSemconvStability & instrumentation_1.SemconvStability.OLD) {
          attributes[semconv_1.ATTR_NET_PEER_NAME] = host;
          attributes[semconv_1.ATTR_NET_PEER_PORT] = port;
        }
        if (instrumentation2._netSemconvStability & instrumentation_1.SemconvStability.STABLE) {
          attributes[semantic_conventions_1.ATTR_SERVER_ADDRESS] = host;
          attributes[semantic_conventions_1.ATTR_SERVER_PORT] = port;
        }
        const span = instrumentation2.tracer.startSpan("connect", {
          kind: api_1.SpanKind.CLIENT,
          attributes
        });
        try {
          const client = original.apply(this, arguments);
          (0, utils_1.endSpan)(span, null);
          return client;
        } catch (error2) {
          (0, utils_1.endSpan)(span, error2);
          throw error2;
        }
      };
    }
  }
  instrumentation$a.IORedisInstrumentation = IORedisInstrumentation;
  return instrumentation$a;
}
var hasRequiredSrc$a;
function requireSrc$a() {
  if (hasRequiredSrc$a) return src$b;
  hasRequiredSrc$a = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.IORedisInstrumentation = void 0;
    var instrumentation_1 = requireInstrumentation$a();
    Object.defineProperty(exports$1, "IORedisInstrumentation", { enumerable: true, get: function() {
      return instrumentation_1.IORedisInstrumentation;
    } });
  })(src$b);
  return src$b;
}
var srcExports$a = requireSrc$a();
var src$9 = {};
var redis = {};
var version$9 = {};
var hasRequiredVersion$9;
function requireVersion$9() {
  if (hasRequiredVersion$9) return version$9;
  hasRequiredVersion$9 = 1;
  Object.defineProperty(version$9, "__esModule", { value: true });
  version$9.PACKAGE_NAME = version$9.PACKAGE_VERSION = void 0;
  version$9.PACKAGE_VERSION = "0.59.0";
  version$9.PACKAGE_NAME = "@opentelemetry/instrumentation-redis";
  return version$9;
}
var instrumentation$9 = {};
var utils$8 = {};
var hasRequiredUtils$8;
function requireUtils$8() {
  if (hasRequiredUtils$8) return utils$8;
  hasRequiredUtils$8 = 1;
  Object.defineProperty(utils$8, "__esModule", { value: true });
  utils$8.getTracedCreateStreamTrace = utils$8.getTracedCreateClient = utils$8.endSpan = void 0;
  const api_1 = require$$0$2;
  const endSpan2 = (span, err) => {
    if (err) {
      span.setStatus({
        code: api_1.SpanStatusCode.ERROR,
        message: err.message
      });
    }
    span.end();
  };
  utils$8.endSpan = endSpan2;
  const getTracedCreateClient = (original) => {
    return function createClientTrace() {
      const client = original.apply(this, arguments);
      return api_1.context.bind(api_1.context.active(), client);
    };
  };
  utils$8.getTracedCreateClient = getTracedCreateClient;
  const getTracedCreateStreamTrace = (original) => {
    return function create_stream_trace() {
      if (!Object.prototype.hasOwnProperty.call(this, "stream")) {
        Object.defineProperty(this, "stream", {
          get() {
            return this._patched_redis_stream;
          },
          set(val) {
            api_1.context.bind(api_1.context.active(), val);
            this._patched_redis_stream = val;
          }
        });
      }
      return original.apply(this, arguments);
    };
  };
  utils$8.getTracedCreateStreamTrace = getTracedCreateStreamTrace;
  return utils$8;
}
var semconv$5 = {};
var hasRequiredSemconv$5;
function requireSemconv$5() {
  if (hasRequiredSemconv$5) return semconv$5;
  hasRequiredSemconv$5 = 1;
  Object.defineProperty(semconv$5, "__esModule", { value: true });
  semconv$5.DB_SYSTEM_VALUE_REDIS = semconv$5.DB_SYSTEM_NAME_VALUE_REDIS = semconv$5.ATTR_NET_PEER_PORT = semconv$5.ATTR_NET_PEER_NAME = semconv$5.ATTR_DB_SYSTEM = semconv$5.ATTR_DB_STATEMENT = semconv$5.ATTR_DB_CONNECTION_STRING = void 0;
  semconv$5.ATTR_DB_CONNECTION_STRING = "db.connection_string";
  semconv$5.ATTR_DB_STATEMENT = "db.statement";
  semconv$5.ATTR_DB_SYSTEM = "db.system";
  semconv$5.ATTR_NET_PEER_NAME = "net.peer.name";
  semconv$5.ATTR_NET_PEER_PORT = "net.peer.port";
  semconv$5.DB_SYSTEM_NAME_VALUE_REDIS = "redis";
  semconv$5.DB_SYSTEM_VALUE_REDIS = "redis";
  return semconv$5;
}
var hasRequiredInstrumentation$9;
function requireInstrumentation$9() {
  if (hasRequiredInstrumentation$9) return instrumentation$9;
  hasRequiredInstrumentation$9 = 1;
  Object.defineProperty(instrumentation$9, "__esModule", { value: true });
  instrumentation$9.RedisInstrumentationV2_V3 = void 0;
  const instrumentation_1 = require$$2;
  const utils_1 = requireUtils$8();
  const version_1 = requireVersion$9();
  const api_1 = require$$0$2;
  const semantic_conventions_1 = require$$2$1;
  const semconv_1 = requireSemconv$5();
  const redis_common_1 = requireSrc$b();
  class RedisInstrumentationV2_V3 extends instrumentation_1.InstrumentationBase {
    static COMPONENT = "redis";
    _semconvStability;
    constructor(config2 = {}) {
      super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config2);
      this._semconvStability = config2.semconvStability ? config2.semconvStability : (0, instrumentation_1.semconvStabilityFromStr)("database", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
    }
    setConfig(config2 = {}) {
      super.setConfig(config2);
      this._semconvStability = config2.semconvStability ? config2.semconvStability : (0, instrumentation_1.semconvStabilityFromStr)("database", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
    }
    init() {
      return [
        new instrumentation_1.InstrumentationNodeModuleDefinition("redis", [">=2.6.0 <4"], (moduleExports) => {
          if ((0, instrumentation_1.isWrapped)(moduleExports.RedisClient.prototype["internal_send_command"])) {
            this._unwrap(moduleExports.RedisClient.prototype, "internal_send_command");
          }
          this._wrap(moduleExports.RedisClient.prototype, "internal_send_command", this._getPatchInternalSendCommand());
          if ((0, instrumentation_1.isWrapped)(moduleExports.RedisClient.prototype["create_stream"])) {
            this._unwrap(moduleExports.RedisClient.prototype, "create_stream");
          }
          this._wrap(moduleExports.RedisClient.prototype, "create_stream", this._getPatchCreateStream());
          if ((0, instrumentation_1.isWrapped)(moduleExports.createClient)) {
            this._unwrap(moduleExports, "createClient");
          }
          this._wrap(moduleExports, "createClient", this._getPatchCreateClient());
          return moduleExports;
        }, (moduleExports) => {
          if (moduleExports === void 0)
            return;
          this._unwrap(moduleExports.RedisClient.prototype, "internal_send_command");
          this._unwrap(moduleExports.RedisClient.prototype, "create_stream");
          this._unwrap(moduleExports, "createClient");
        })
      ];
    }
    /**
     * Patch internal_send_command(...) to trace requests
     */
    _getPatchInternalSendCommand() {
      const instrumentation2 = this;
      return function internal_send_command(original) {
        return function internal_send_command_trace(cmd) {
          if (arguments.length !== 1 || typeof cmd !== "object") {
            return original.apply(this, arguments);
          }
          const config2 = instrumentation2.getConfig();
          const hasNoParentSpan = api_1.trace.getSpan(api_1.context.active()) === void 0;
          if (config2.requireParentSpan === true && hasNoParentSpan) {
            return original.apply(this, arguments);
          }
          const dbStatementSerializer = config2?.dbStatementSerializer || redis_common_1.defaultDbStatementSerializer;
          const attributes = {};
          if (instrumentation2._semconvStability & instrumentation_1.SemconvStability.OLD) {
            Object.assign(attributes, {
              [semconv_1.ATTR_DB_SYSTEM]: semconv_1.DB_SYSTEM_VALUE_REDIS,
              [semconv_1.ATTR_DB_STATEMENT]: dbStatementSerializer(cmd.command, cmd.args)
            });
          }
          if (instrumentation2._semconvStability & instrumentation_1.SemconvStability.STABLE) {
            Object.assign(attributes, {
              [semantic_conventions_1.ATTR_DB_SYSTEM_NAME]: semconv_1.DB_SYSTEM_NAME_VALUE_REDIS,
              [semantic_conventions_1.ATTR_DB_OPERATION_NAME]: cmd.command,
              [semantic_conventions_1.ATTR_DB_QUERY_TEXT]: dbStatementSerializer(cmd.command, cmd.args)
            });
          }
          const span = instrumentation2.tracer.startSpan(`${RedisInstrumentationV2_V3.COMPONENT}-${cmd.command}`, {
            kind: api_1.SpanKind.CLIENT,
            attributes
          });
          if (this.connection_options) {
            const connectionAttributes = {};
            if (instrumentation2._semconvStability & instrumentation_1.SemconvStability.OLD) {
              Object.assign(connectionAttributes, {
                [semconv_1.ATTR_NET_PEER_NAME]: this.connection_options.host,
                [semconv_1.ATTR_NET_PEER_PORT]: this.connection_options.port
              });
            }
            if (instrumentation2._semconvStability & instrumentation_1.SemconvStability.STABLE) {
              Object.assign(connectionAttributes, {
                [semantic_conventions_1.ATTR_SERVER_ADDRESS]: this.connection_options.host,
                [semantic_conventions_1.ATTR_SERVER_PORT]: this.connection_options.port
              });
            }
            span.setAttributes(connectionAttributes);
          }
          if (this.address && instrumentation2._semconvStability & instrumentation_1.SemconvStability.OLD) {
            span.setAttribute(semconv_1.ATTR_DB_CONNECTION_STRING, `redis://${this.address}`);
          }
          const originalCallback = arguments[0].callback;
          if (originalCallback) {
            const originalContext = api_1.context.active();
            arguments[0].callback = function callback(err, reply) {
              if (config2?.responseHook) {
                const responseHook = config2.responseHook;
                (0, instrumentation_1.safeExecuteInTheMiddle)(() => {
                  responseHook(span, cmd.command, cmd.args, reply);
                }, (err2) => {
                  if (err2) {
                    instrumentation2._diag.error("Error executing responseHook", err2);
                  }
                }, true);
              }
              (0, utils_1.endSpan)(span, err);
              return api_1.context.with(originalContext, originalCallback, this, ...arguments);
            };
          }
          try {
            return original.apply(this, arguments);
          } catch (rethrow) {
            (0, utils_1.endSpan)(span, rethrow);
            throw rethrow;
          }
        };
      };
    }
    _getPatchCreateClient() {
      return function createClient(original) {
        return (0, utils_1.getTracedCreateClient)(original);
      };
    }
    _getPatchCreateStream() {
      return function createReadStream(original) {
        return (0, utils_1.getTracedCreateStreamTrace)(original);
      };
    }
  }
  instrumentation$9.RedisInstrumentationV2_V3 = RedisInstrumentationV2_V3;
  return instrumentation$9;
}
var instrumentation$8 = {};
var utils$7 = {};
var hasRequiredUtils$7;
function requireUtils$7() {
  if (hasRequiredUtils$7) return utils$7;
  hasRequiredUtils$7 = 1;
  Object.defineProperty(utils$7, "__esModule", { value: true });
  utils$7.getClientAttributes = void 0;
  const semantic_conventions_1 = require$$2$1;
  const semconv_1 = requireSemconv$5();
  const instrumentation_1 = require$$2;
  function getClientAttributes2(diag2, options, semconvStability) {
    const attributes = {};
    if (semconvStability & instrumentation_1.SemconvStability.OLD) {
      Object.assign(attributes, {
        [semconv_1.ATTR_DB_SYSTEM]: semconv_1.DB_SYSTEM_VALUE_REDIS,
        [semconv_1.ATTR_NET_PEER_NAME]: options?.socket?.host,
        [semconv_1.ATTR_NET_PEER_PORT]: options?.socket?.port,
        [semconv_1.ATTR_DB_CONNECTION_STRING]: removeCredentialsFromDBConnectionStringAttribute(diag2, options?.url)
      });
    }
    if (semconvStability & instrumentation_1.SemconvStability.STABLE) {
      Object.assign(attributes, {
        [semantic_conventions_1.ATTR_DB_SYSTEM_NAME]: semconv_1.DB_SYSTEM_NAME_VALUE_REDIS,
        [semantic_conventions_1.ATTR_SERVER_ADDRESS]: options?.socket?.host,
        [semantic_conventions_1.ATTR_SERVER_PORT]: options?.socket?.port
      });
    }
    return attributes;
  }
  utils$7.getClientAttributes = getClientAttributes2;
  function removeCredentialsFromDBConnectionStringAttribute(diag2, url) {
    if (typeof url !== "string" || !url) {
      return;
    }
    try {
      const u = new URL(url);
      u.searchParams.delete("user_pwd");
      u.username = "";
      u.password = "";
      return u.href;
    } catch (err) {
      diag2.error("failed to sanitize redis connection url", err);
    }
    return;
  }
  return utils$7;
}
var hasRequiredInstrumentation$8;
function requireInstrumentation$8() {
  if (hasRequiredInstrumentation$8) return instrumentation$8;
  hasRequiredInstrumentation$8 = 1;
  Object.defineProperty(instrumentation$8, "__esModule", { value: true });
  instrumentation$8.RedisInstrumentationV4_V5 = void 0;
  const api_1 = require$$0$2;
  const instrumentation_1 = require$$2;
  const utils_1 = requireUtils$7();
  const redis_common_1 = requireSrc$b();
  const version_1 = requireVersion$9();
  const semantic_conventions_1 = require$$2$1;
  const semconv_1 = requireSemconv$5();
  const OTEL_OPEN_SPANS = Symbol("opentelemetry.instrumentation.redis.open_spans");
  const MULTI_COMMAND_OPTIONS = Symbol("opentelemetry.instrumentation.redis.multi_command_options");
  class RedisInstrumentationV4_V5 extends instrumentation_1.InstrumentationBase {
    static COMPONENT = "redis";
    _semconvStability;
    constructor(config2 = {}) {
      super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config2);
      this._semconvStability = config2.semconvStability ? config2.semconvStability : (0, instrumentation_1.semconvStabilityFromStr)("database", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
    }
    setConfig(config2 = {}) {
      super.setConfig(config2);
      this._semconvStability = config2.semconvStability ? config2.semconvStability : (0, instrumentation_1.semconvStabilityFromStr)("database", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
    }
    init() {
      return [
        this._getInstrumentationNodeModuleDefinition("@redis/client"),
        this._getInstrumentationNodeModuleDefinition("@node-redis/client")
      ];
    }
    _getInstrumentationNodeModuleDefinition(basePackageName) {
      const commanderModuleFile = new instrumentation_1.InstrumentationNodeModuleFile(`${basePackageName}/dist/lib/commander.js`, ["^1.0.0"], (moduleExports, moduleVersion) => {
        const transformCommandArguments = moduleExports.transformCommandArguments;
        if (!transformCommandArguments) {
          this._diag.error("internal instrumentation error, missing transformCommandArguments function");
          return moduleExports;
        }
        const functionToPatch = moduleVersion?.startsWith("1.0.") ? "extendWithCommands" : "attachCommands";
        if ((0, instrumentation_1.isWrapped)(moduleExports?.[functionToPatch])) {
          this._unwrap(moduleExports, functionToPatch);
        }
        this._wrap(moduleExports, functionToPatch, this._getPatchExtendWithCommands(transformCommandArguments));
        return moduleExports;
      }, (moduleExports) => {
        if ((0, instrumentation_1.isWrapped)(moduleExports?.extendWithCommands)) {
          this._unwrap(moduleExports, "extendWithCommands");
        }
        if ((0, instrumentation_1.isWrapped)(moduleExports?.attachCommands)) {
          this._unwrap(moduleExports, "attachCommands");
        }
      });
      const multiCommanderModule = new instrumentation_1.InstrumentationNodeModuleFile(`${basePackageName}/dist/lib/client/multi-command.js`, ["^1.0.0", "^5.0.0"], (moduleExports) => {
        const redisClientMultiCommandPrototype = moduleExports?.default?.prototype;
        if ((0, instrumentation_1.isWrapped)(redisClientMultiCommandPrototype?.exec)) {
          this._unwrap(redisClientMultiCommandPrototype, "exec");
        }
        this._wrap(redisClientMultiCommandPrototype, "exec", this._getPatchMultiCommandsExec(false));
        if ((0, instrumentation_1.isWrapped)(redisClientMultiCommandPrototype?.execAsPipeline)) {
          this._unwrap(redisClientMultiCommandPrototype, "execAsPipeline");
        }
        this._wrap(redisClientMultiCommandPrototype, "execAsPipeline", this._getPatchMultiCommandsExec(true));
        if ((0, instrumentation_1.isWrapped)(redisClientMultiCommandPrototype?.addCommand)) {
          this._unwrap(redisClientMultiCommandPrototype, "addCommand");
        }
        this._wrap(redisClientMultiCommandPrototype, "addCommand", this._getPatchMultiCommandsAddCommand());
        return moduleExports;
      }, (moduleExports) => {
        const redisClientMultiCommandPrototype = moduleExports?.default?.prototype;
        if ((0, instrumentation_1.isWrapped)(redisClientMultiCommandPrototype?.exec)) {
          this._unwrap(redisClientMultiCommandPrototype, "exec");
        }
        if ((0, instrumentation_1.isWrapped)(redisClientMultiCommandPrototype?.addCommand)) {
          this._unwrap(redisClientMultiCommandPrototype, "addCommand");
        }
      });
      const clientIndexModule = new instrumentation_1.InstrumentationNodeModuleFile(`${basePackageName}/dist/lib/client/index.js`, ["^1.0.0", "^5.0.0"], (moduleExports) => {
        const redisClientPrototype = moduleExports?.default?.prototype;
        if (redisClientPrototype?.multi) {
          if ((0, instrumentation_1.isWrapped)(redisClientPrototype?.multi)) {
            this._unwrap(redisClientPrototype, "multi");
          }
          this._wrap(redisClientPrototype, "multi", this._getPatchRedisClientMulti());
        }
        if (redisClientPrototype?.MULTI) {
          if ((0, instrumentation_1.isWrapped)(redisClientPrototype?.MULTI)) {
            this._unwrap(redisClientPrototype, "MULTI");
          }
          this._wrap(redisClientPrototype, "MULTI", this._getPatchRedisClientMulti());
        }
        if ((0, instrumentation_1.isWrapped)(redisClientPrototype?.sendCommand)) {
          this._unwrap(redisClientPrototype, "sendCommand");
        }
        this._wrap(redisClientPrototype, "sendCommand", this._getPatchRedisClientSendCommand());
        this._wrap(redisClientPrototype, "connect", this._getPatchedClientConnect());
        return moduleExports;
      }, (moduleExports) => {
        const redisClientPrototype = moduleExports?.default?.prototype;
        if ((0, instrumentation_1.isWrapped)(redisClientPrototype?.multi)) {
          this._unwrap(redisClientPrototype, "multi");
        }
        if ((0, instrumentation_1.isWrapped)(redisClientPrototype?.MULTI)) {
          this._unwrap(redisClientPrototype, "MULTI");
        }
        if ((0, instrumentation_1.isWrapped)(redisClientPrototype?.sendCommand)) {
          this._unwrap(redisClientPrototype, "sendCommand");
        }
      });
      return new instrumentation_1.InstrumentationNodeModuleDefinition(basePackageName, ["^1.0.0", "^5.0.0"], (moduleExports) => {
        return moduleExports;
      }, () => {
      }, [commanderModuleFile, multiCommanderModule, clientIndexModule]);
    }
    // serves both for redis 4.0.x where function name is extendWithCommands
    // and redis ^4.1.0 where function name is attachCommands
    _getPatchExtendWithCommands(transformCommandArguments) {
      const plugin = this;
      return function extendWithCommandsPatchWrapper(original) {
        return function extendWithCommandsPatch(config2) {
          if (config2?.BaseClass?.name !== "RedisClient") {
            return original.apply(this, arguments);
          }
          const origExecutor = config2.executor;
          config2.executor = function(command, args) {
            const redisCommandArguments = transformCommandArguments(command, args).args;
            return plugin._traceClientCommand(origExecutor, this, arguments, redisCommandArguments);
          };
          return original.apply(this, arguments);
        };
      };
    }
    _getPatchMultiCommandsExec(isPipeline) {
      const plugin = this;
      return function execPatchWrapper(original) {
        return function execPatch() {
          const execRes = original.apply(this, arguments);
          if (typeof execRes?.then !== "function") {
            plugin._diag.error("non-promise result when patching exec/execAsPipeline");
            return execRes;
          }
          return execRes.then((redisRes) => {
            const openSpans = this[OTEL_OPEN_SPANS];
            plugin._endSpansWithRedisReplies(openSpans, redisRes, isPipeline);
            return redisRes;
          }).catch((err) => {
            const openSpans = this[OTEL_OPEN_SPANS];
            if (!openSpans) {
              plugin._diag.error("cannot find open spans to end for multi/pipeline");
            } else {
              const replies = err.constructor.name === "MultiErrorReply" ? err.replies : new Array(openSpans.length).fill(err);
              plugin._endSpansWithRedisReplies(openSpans, replies, isPipeline);
            }
            return Promise.reject(err);
          });
        };
      };
    }
    _getPatchMultiCommandsAddCommand() {
      const plugin = this;
      return function addCommandWrapper(original) {
        return function addCommandPatch(args) {
          return plugin._traceClientCommand(original, this, arguments, args);
        };
      };
    }
    _getPatchRedisClientMulti() {
      return function multiPatchWrapper(original) {
        return function multiPatch() {
          const multiRes = original.apply(this, arguments);
          multiRes[MULTI_COMMAND_OPTIONS] = this.options;
          return multiRes;
        };
      };
    }
    _getPatchRedisClientSendCommand() {
      const plugin = this;
      return function sendCommandWrapper(original) {
        return function sendCommandPatch(args) {
          return plugin._traceClientCommand(original, this, arguments, args);
        };
      };
    }
    _getPatchedClientConnect() {
      const plugin = this;
      return function connectWrapper(original) {
        return function patchedConnect() {
          const options = this.options;
          const attributes = (0, utils_1.getClientAttributes)(plugin._diag, options, plugin._semconvStability);
          const span = plugin.tracer.startSpan(`${RedisInstrumentationV4_V5.COMPONENT}-connect`, {
            kind: api_1.SpanKind.CLIENT,
            attributes
          });
          const res = api_1.context.with(api_1.trace.setSpan(api_1.context.active(), span), () => {
            return original.apply(this);
          });
          return res.then((result) => {
            span.end();
            return result;
          }).catch((error2) => {
            span.recordException(error2);
            span.setStatus({
              code: api_1.SpanStatusCode.ERROR,
              message: error2.message
            });
            span.end();
            return Promise.reject(error2);
          });
        };
      };
    }
    _traceClientCommand(origFunction, origThis, origArguments, redisCommandArguments) {
      const hasNoParentSpan = api_1.trace.getSpan(api_1.context.active()) === void 0;
      if (hasNoParentSpan && this.getConfig().requireParentSpan) {
        return origFunction.apply(origThis, origArguments);
      }
      const clientOptions = origThis.options || origThis[MULTI_COMMAND_OPTIONS];
      const commandName = redisCommandArguments[0];
      const commandArgs = redisCommandArguments.slice(1);
      const dbStatementSerializer = this.getConfig().dbStatementSerializer || redis_common_1.defaultDbStatementSerializer;
      const attributes = (0, utils_1.getClientAttributes)(this._diag, clientOptions, this._semconvStability);
      if (this._semconvStability & instrumentation_1.SemconvStability.STABLE) {
        attributes[semantic_conventions_1.ATTR_DB_OPERATION_NAME] = commandName;
      }
      try {
        const dbStatement = dbStatementSerializer(commandName, commandArgs);
        if (dbStatement != null) {
          if (this._semconvStability & instrumentation_1.SemconvStability.OLD) {
            attributes[semconv_1.ATTR_DB_STATEMENT] = dbStatement;
          }
          if (this._semconvStability & instrumentation_1.SemconvStability.STABLE) {
            attributes[semantic_conventions_1.ATTR_DB_QUERY_TEXT] = dbStatement;
          }
        }
      } catch (e) {
        this._diag.error("dbStatementSerializer throw an exception", e, {
          commandName
        });
      }
      const span = this.tracer.startSpan(`${RedisInstrumentationV4_V5.COMPONENT}-${commandName}`, {
        kind: api_1.SpanKind.CLIENT,
        attributes
      });
      const res = api_1.context.with(api_1.trace.setSpan(api_1.context.active(), span), () => {
        return origFunction.apply(origThis, origArguments);
      });
      if (typeof res?.then === "function") {
        res.then((redisRes) => {
          this._endSpanWithResponse(span, commandName, commandArgs, redisRes, void 0);
        }, (err) => {
          this._endSpanWithResponse(span, commandName, commandArgs, null, err);
        });
      } else {
        const redisClientMultiCommand = res;
        redisClientMultiCommand[OTEL_OPEN_SPANS] = redisClientMultiCommand[OTEL_OPEN_SPANS] || [];
        redisClientMultiCommand[OTEL_OPEN_SPANS].push({
          span,
          commandName,
          commandArgs
        });
      }
      return res;
    }
    _endSpansWithRedisReplies(openSpans, replies, isPipeline = false) {
      if (!openSpans) {
        return this._diag.error("cannot find open spans to end for redis multi/pipeline");
      }
      if (replies.length !== openSpans.length) {
        return this._diag.error("number of multi command spans does not match response from redis");
      }
      const allCommands = openSpans.map((s) => s.commandName);
      const allSameCommand = allCommands.every((cmd) => cmd === allCommands[0]);
      const operationName = allSameCommand ? (isPipeline ? "PIPELINE " : "MULTI ") + allCommands[0] : isPipeline ? "PIPELINE" : "MULTI";
      for (let i = 0; i < openSpans.length; i++) {
        const { span, commandArgs } = openSpans[i];
        const currCommandRes = replies[i];
        const [res, err] = currCommandRes instanceof Error ? [null, currCommandRes] : [currCommandRes, void 0];
        if (this._semconvStability & instrumentation_1.SemconvStability.STABLE) {
          span.setAttribute(semantic_conventions_1.ATTR_DB_OPERATION_NAME, operationName);
        }
        this._endSpanWithResponse(span, allCommands[i], commandArgs, res, err);
      }
    }
    _endSpanWithResponse(span, commandName, commandArgs, response, error2) {
      const { responseHook } = this.getConfig();
      if (!error2 && responseHook) {
        try {
          responseHook(span, commandName, commandArgs, response);
        } catch (err) {
          this._diag.error("responseHook throw an exception", err);
        }
      }
      if (error2) {
        span.recordException(error2);
        span.setStatus({ code: api_1.SpanStatusCode.ERROR, message: error2?.message });
      }
      span.end();
    }
  }
  instrumentation$8.RedisInstrumentationV4_V5 = RedisInstrumentationV4_V5;
  return instrumentation$8;
}
var hasRequiredRedis;
function requireRedis() {
  if (hasRequiredRedis) return redis;
  hasRequiredRedis = 1;
  Object.defineProperty(redis, "__esModule", { value: true });
  redis.RedisInstrumentation = void 0;
  const instrumentation_1 = require$$2;
  const version_1 = requireVersion$9();
  const instrumentation_2 = requireInstrumentation$9();
  const instrumentation_3 = requireInstrumentation$8();
  const DEFAULT_CONFIG = {
    requireParentSpan: false
  };
  class RedisInstrumentation extends instrumentation_1.InstrumentationBase {
    instrumentationV2_V3;
    instrumentationV4_V5;
    // this is used to bypass a flaw in the base class constructor, which is calling
    // member functions before the constructor has a chance to fully initialize the member variables.
    initialized = false;
    constructor(config2 = {}) {
      const resolvedConfig = { ...DEFAULT_CONFIG, ...config2 };
      super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, resolvedConfig);
      this.instrumentationV2_V3 = new instrumentation_2.RedisInstrumentationV2_V3(this.getConfig());
      this.instrumentationV4_V5 = new instrumentation_3.RedisInstrumentationV4_V5(this.getConfig());
      this.initialized = true;
    }
    setConfig(config2 = {}) {
      const newConfig = { ...DEFAULT_CONFIG, ...config2 };
      super.setConfig(newConfig);
      if (!this.initialized) {
        return;
      }
      this.instrumentationV2_V3.setConfig(newConfig);
      this.instrumentationV4_V5.setConfig(newConfig);
    }
    init() {
    }
    // Return underlying modules, as consumers (like https://github.com/DrewCorlin/opentelemetry-node-bundler-plugins) may
    // expect them to be populated without knowing that this module wraps 2 instrumentations
    getModuleDefinitions() {
      return [
        ...this.instrumentationV2_V3.getModuleDefinitions(),
        ...this.instrumentationV4_V5.getModuleDefinitions()
      ];
    }
    setTracerProvider(tracerProvider) {
      super.setTracerProvider(tracerProvider);
      if (!this.initialized) {
        return;
      }
      this.instrumentationV2_V3.setTracerProvider(tracerProvider);
      this.instrumentationV4_V5.setTracerProvider(tracerProvider);
    }
    enable() {
      super.enable();
      if (!this.initialized) {
        return;
      }
      this.instrumentationV2_V3.enable();
      this.instrumentationV4_V5.enable();
    }
    disable() {
      super.disable();
      if (!this.initialized) {
        return;
      }
      this.instrumentationV2_V3.disable();
      this.instrumentationV4_V5.disable();
    }
  }
  redis.RedisInstrumentation = RedisInstrumentation;
  return redis;
}
var hasRequiredSrc$9;
function requireSrc$9() {
  if (hasRequiredSrc$9) return src$9;
  hasRequiredSrc$9 = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.RedisInstrumentation = void 0;
    var redis_1 = requireRedis();
    Object.defineProperty(exports$1, "RedisInstrumentation", { enumerable: true, get: function() {
      return redis_1.RedisInstrumentation;
    } });
  })(src$9);
  return src$9;
}
var srcExports$9 = requireSrc$9();
const SINGLE_ARG_COMMANDS = ["get", "set", "setex"];
const GET_COMMANDS = ["get", "mget"];
const SET_COMMANDS = ["set", "setex"];
function isInCommands(redisCommands, command) {
  return redisCommands.includes(command.toLowerCase());
}
function getCacheOperation(command) {
  if (isInCommands(GET_COMMANDS, command)) {
    return "cache.get";
  } else if (isInCommands(SET_COMMANDS, command)) {
    return "cache.put";
  } else {
    return void 0;
  }
}
function keyHasPrefix(key, prefixes) {
  return prefixes.some((prefix) => key.startsWith(prefix));
}
function getCacheKeySafely(redisCommand, cmdArgs) {
  try {
    if (cmdArgs.length === 0) {
      return void 0;
    }
    const processArg = (arg) => {
      if (typeof arg === "string" || typeof arg === "number" || Buffer.isBuffer(arg)) {
        return [arg.toString()];
      } else if (Array.isArray(arg)) {
        return flatten(arg.map((arg2) => processArg(arg2)));
      } else {
        return ["<unknown>"];
      }
    };
    const firstArg = cmdArgs[0];
    if (isInCommands(SINGLE_ARG_COMMANDS, redisCommand) && firstArg != null) {
      return processArg(firstArg);
    }
    return flatten(cmdArgs.map((arg) => processArg(arg)));
  } catch {
    return void 0;
  }
}
function shouldConsiderForCache(redisCommand, keys, prefixes) {
  if (!getCacheOperation(redisCommand)) {
    return false;
  }
  for (const key of keys) {
    if (keyHasPrefix(key, prefixes)) {
      return true;
    }
  }
  return false;
}
function calculateCacheItemSize(response) {
  const getSize = (value) => {
    try {
      if (Buffer.isBuffer(value)) return value.byteLength;
      else if (typeof value === "string") return value.length;
      else if (typeof value === "number") return value.toString().length;
      else if (value === null || value === void 0) return 0;
      return JSON.stringify(value).length;
    } catch {
      return void 0;
    }
  };
  return Array.isArray(response) ? response.reduce((acc, curr) => {
    const size = getSize(curr);
    return typeof size === "number" ? acc !== void 0 ? acc + size : size : acc;
  }, 0) : getSize(response);
}
function flatten(input) {
  const result = [];
  const flattenHelper = (input2) => {
    input2.forEach((el) => {
      if (Array.isArray(el)) {
        flattenHelper(el);
      } else {
        result.push(el);
      }
    });
  };
  flattenHelper(input);
  return result;
}
const INTEGRATION_NAME$e = "Redis";
let _redisOptions = {};
const cacheResponseHook = (span, redisCommand, cmdArgs, response) => {
  span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, "auto.db.otel.redis");
  const safeKey = getCacheKeySafely(redisCommand, cmdArgs);
  const cacheOperation = getCacheOperation(redisCommand);
  if (!safeKey || !cacheOperation || !_redisOptions.cachePrefixes || !shouldConsiderForCache(redisCommand, safeKey, _redisOptions.cachePrefixes)) {
    return;
  }
  const networkPeerAddress = spanToJSON(span).data["net.peer.name"];
  const networkPeerPort = spanToJSON(span).data["net.peer.port"];
  if (networkPeerPort && networkPeerAddress) {
    span.setAttributes({ "network.peer.address": networkPeerAddress, "network.peer.port": networkPeerPort });
  }
  const cacheItemSize = calculateCacheItemSize(response);
  if (cacheItemSize) {
    span.setAttribute(SEMANTIC_ATTRIBUTE_CACHE_ITEM_SIZE, cacheItemSize);
  }
  if (isInCommands(GET_COMMANDS, redisCommand) && cacheItemSize !== void 0) {
    span.setAttribute(SEMANTIC_ATTRIBUTE_CACHE_HIT, cacheItemSize > 0);
  }
  span.setAttributes({
    [SEMANTIC_ATTRIBUTE_SENTRY_OP]: cacheOperation,
    [SEMANTIC_ATTRIBUTE_CACHE_KEY]: safeKey
  });
  const spanDescription = safeKey.join(", ");
  span.updateName(
    _redisOptions.maxCacheKeyLength ? truncate(spanDescription, _redisOptions.maxCacheKeyLength) : spanDescription
  );
};
const instrumentIORedis = generateInstrumentOnce(`${INTEGRATION_NAME$e}.IORedis`, () => {
  return new srcExports$a.IORedisInstrumentation({
    responseHook: cacheResponseHook
  });
});
const instrumentRedisModule = generateInstrumentOnce(`${INTEGRATION_NAME$e}.Redis`, () => {
  return new srcExports$9.RedisInstrumentation({
    responseHook: cacheResponseHook
  });
});
const instrumentRedis = Object.assign(
  () => {
    instrumentIORedis();
    instrumentRedisModule();
  },
  { id: INTEGRATION_NAME$e }
);
const _redisIntegration = ((options = {}) => {
  return {
    name: INTEGRATION_NAME$e,
    setupOnce() {
      _redisOptions = options;
      instrumentRedis();
    }
  };
});
const redisIntegration = defineIntegration(_redisIntegration);
var src$8 = {};
var instrumentation$7 = {};
var internalTypes$3 = {};
var hasRequiredInternalTypes$3;
function requireInternalTypes$3() {
  if (hasRequiredInternalTypes$3) return internalTypes$3;
  hasRequiredInternalTypes$3 = 1;
  Object.defineProperty(internalTypes$3, "__esModule", { value: true });
  internalTypes$3.EVENT_LISTENERS_SET = void 0;
  internalTypes$3.EVENT_LISTENERS_SET = Symbol("opentelemetry.instrumentation.pg.eventListenersSet");
  return internalTypes$3;
}
var utils$6 = {};
var AttributeNames$4 = {};
var hasRequiredAttributeNames$3;
function requireAttributeNames$3() {
  if (hasRequiredAttributeNames$3) return AttributeNames$4;
  hasRequiredAttributeNames$3 = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.AttributeNames = void 0;
    (function(AttributeNames2) {
      AttributeNames2["PG_VALUES"] = "db.postgresql.values";
      AttributeNames2["PG_PLAN"] = "db.postgresql.plan";
      AttributeNames2["IDLE_TIMEOUT_MILLIS"] = "db.postgresql.idle.timeout.millis";
      AttributeNames2["MAX_CLIENT"] = "db.postgresql.max.client";
    })(exports$1.AttributeNames || (exports$1.AttributeNames = {}));
  })(AttributeNames$4);
  return AttributeNames$4;
}
var semconv$4 = {};
var hasRequiredSemconv$4;
function requireSemconv$4() {
  if (hasRequiredSemconv$4) return semconv$4;
  hasRequiredSemconv$4 = 1;
  Object.defineProperty(semconv$4, "__esModule", { value: true });
  semconv$4.METRIC_DB_CLIENT_CONNECTION_PENDING_REQUESTS = semconv$4.METRIC_DB_CLIENT_CONNECTION_COUNT = semconv$4.DB_SYSTEM_VALUE_POSTGRESQL = semconv$4.DB_CLIENT_CONNECTION_STATE_VALUE_USED = semconv$4.DB_CLIENT_CONNECTION_STATE_VALUE_IDLE = semconv$4.ATTR_NET_PEER_PORT = semconv$4.ATTR_NET_PEER_NAME = semconv$4.ATTR_DB_USER = semconv$4.ATTR_DB_SYSTEM = semconv$4.ATTR_DB_STATEMENT = semconv$4.ATTR_DB_NAME = semconv$4.ATTR_DB_CONNECTION_STRING = semconv$4.ATTR_DB_CLIENT_CONNECTION_STATE = semconv$4.ATTR_DB_CLIENT_CONNECTION_POOL_NAME = void 0;
  semconv$4.ATTR_DB_CLIENT_CONNECTION_POOL_NAME = "db.client.connection.pool.name";
  semconv$4.ATTR_DB_CLIENT_CONNECTION_STATE = "db.client.connection.state";
  semconv$4.ATTR_DB_CONNECTION_STRING = "db.connection_string";
  semconv$4.ATTR_DB_NAME = "db.name";
  semconv$4.ATTR_DB_STATEMENT = "db.statement";
  semconv$4.ATTR_DB_SYSTEM = "db.system";
  semconv$4.ATTR_DB_USER = "db.user";
  semconv$4.ATTR_NET_PEER_NAME = "net.peer.name";
  semconv$4.ATTR_NET_PEER_PORT = "net.peer.port";
  semconv$4.DB_CLIENT_CONNECTION_STATE_VALUE_IDLE = "idle";
  semconv$4.DB_CLIENT_CONNECTION_STATE_VALUE_USED = "used";
  semconv$4.DB_SYSTEM_VALUE_POSTGRESQL = "postgresql";
  semconv$4.METRIC_DB_CLIENT_CONNECTION_COUNT = "db.client.connection.count";
  semconv$4.METRIC_DB_CLIENT_CONNECTION_PENDING_REQUESTS = "db.client.connection.pending_requests";
  return semconv$4;
}
var SpanNames = {};
var hasRequiredSpanNames;
function requireSpanNames() {
  if (hasRequiredSpanNames) return SpanNames;
  hasRequiredSpanNames = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.SpanNames = void 0;
    (function(SpanNames2) {
      SpanNames2["QUERY_PREFIX"] = "pg.query";
      SpanNames2["CONNECT"] = "pg.connect";
      SpanNames2["POOL_CONNECT"] = "pg-pool.connect";
    })(exports$1.SpanNames || (exports$1.SpanNames = {}));
  })(SpanNames);
  return SpanNames;
}
var hasRequiredUtils$6;
function requireUtils$6() {
  if (hasRequiredUtils$6) return utils$6;
  hasRequiredUtils$6 = 1;
  Object.defineProperty(utils$6, "__esModule", { value: true });
  utils$6.sanitizedErrorMessage = utils$6.isObjectWithTextString = utils$6.getErrorMessage = utils$6.patchClientConnectCallback = utils$6.patchCallbackPGPool = utils$6.updateCounter = utils$6.getPoolName = utils$6.patchCallback = utils$6.handleExecutionResult = utils$6.handleConfigQuery = utils$6.shouldSkipInstrumentation = utils$6.getSemanticAttributesFromPoolConnection = utils$6.getSemanticAttributesFromConnection = utils$6.getConnectionString = utils$6.parseAndMaskConnectionString = utils$6.parseNormalizedOperationName = utils$6.getQuerySpanName = void 0;
  const api_1 = require$$0$2;
  const AttributeNames_1 = requireAttributeNames$3();
  const semantic_conventions_1 = require$$2$1;
  const semconv_1 = requireSemconv$4();
  const instrumentation_1 = require$$2;
  const SpanNames_1 = requireSpanNames();
  function getQuerySpanName(dbName, queryConfig) {
    if (!queryConfig)
      return SpanNames_1.SpanNames.QUERY_PREFIX;
    const command = typeof queryConfig.name === "string" && queryConfig.name ? queryConfig.name : parseNormalizedOperationName(queryConfig.text);
    return `${SpanNames_1.SpanNames.QUERY_PREFIX}:${command}${dbName ? ` ${dbName}` : ""}`;
  }
  utils$6.getQuerySpanName = getQuerySpanName;
  function parseNormalizedOperationName(queryText) {
    const trimmedQuery = queryText.trim();
    const indexOfFirstSpace = trimmedQuery.indexOf(" ");
    let sqlCommand = indexOfFirstSpace === -1 ? trimmedQuery : trimmedQuery.slice(0, indexOfFirstSpace);
    sqlCommand = sqlCommand.toUpperCase();
    return sqlCommand.endsWith(";") ? sqlCommand.slice(0, -1) : sqlCommand;
  }
  utils$6.parseNormalizedOperationName = parseNormalizedOperationName;
  function parseAndMaskConnectionString(connectionString) {
    try {
      const url = new URL(connectionString);
      url.username = "";
      url.password = "";
      return url.toString();
    } catch (e) {
      return "postgresql://localhost:5432/";
    }
  }
  utils$6.parseAndMaskConnectionString = parseAndMaskConnectionString;
  function getConnectionString(params) {
    if ("connectionString" in params && params.connectionString) {
      return parseAndMaskConnectionString(params.connectionString);
    }
    const host = params.host || "localhost";
    const port = params.port || 5432;
    const database = params.database || "";
    return `postgresql://${host}:${port}/${database}`;
  }
  utils$6.getConnectionString = getConnectionString;
  function getPort(port) {
    if (Number.isInteger(port)) {
      return port;
    }
    return void 0;
  }
  function getSemanticAttributesFromConnection(params, semconvStability) {
    let attributes = {};
    if (semconvStability & instrumentation_1.SemconvStability.OLD) {
      attributes = {
        ...attributes,
        [semconv_1.ATTR_DB_SYSTEM]: semconv_1.DB_SYSTEM_VALUE_POSTGRESQL,
        [semconv_1.ATTR_DB_NAME]: params.database,
        [semconv_1.ATTR_DB_CONNECTION_STRING]: getConnectionString(params),
        [semconv_1.ATTR_DB_USER]: params.user,
        [semconv_1.ATTR_NET_PEER_NAME]: params.host,
        [semconv_1.ATTR_NET_PEER_PORT]: getPort(params.port)
      };
    }
    if (semconvStability & instrumentation_1.SemconvStability.STABLE) {
      attributes = {
        ...attributes,
        [semantic_conventions_1.ATTR_DB_SYSTEM_NAME]: semantic_conventions_1.DB_SYSTEM_NAME_VALUE_POSTGRESQL,
        [semantic_conventions_1.ATTR_DB_NAMESPACE]: params.namespace,
        [semantic_conventions_1.ATTR_SERVER_ADDRESS]: params.host,
        [semantic_conventions_1.ATTR_SERVER_PORT]: getPort(params.port)
      };
    }
    return attributes;
  }
  utils$6.getSemanticAttributesFromConnection = getSemanticAttributesFromConnection;
  function getSemanticAttributesFromPoolConnection(params, semconvStability) {
    let url;
    try {
      url = params.connectionString ? new URL(params.connectionString) : void 0;
    } catch (e) {
      url = void 0;
    }
    let attributes = {
      [AttributeNames_1.AttributeNames.IDLE_TIMEOUT_MILLIS]: params.idleTimeoutMillis,
      [AttributeNames_1.AttributeNames.MAX_CLIENT]: params.maxClient
    };
    if (semconvStability & instrumentation_1.SemconvStability.OLD) {
      attributes = {
        ...attributes,
        [semconv_1.ATTR_DB_SYSTEM]: semconv_1.DB_SYSTEM_VALUE_POSTGRESQL,
        [semconv_1.ATTR_DB_NAME]: url?.pathname.slice(1) ?? params.database,
        [semconv_1.ATTR_DB_CONNECTION_STRING]: getConnectionString(params),
        [semconv_1.ATTR_NET_PEER_NAME]: url?.hostname ?? params.host,
        [semconv_1.ATTR_NET_PEER_PORT]: Number(url?.port) || getPort(params.port),
        [semconv_1.ATTR_DB_USER]: url?.username ?? params.user
      };
    }
    if (semconvStability & instrumentation_1.SemconvStability.STABLE) {
      attributes = {
        ...attributes,
        [semantic_conventions_1.ATTR_DB_SYSTEM_NAME]: semantic_conventions_1.DB_SYSTEM_NAME_VALUE_POSTGRESQL,
        [semantic_conventions_1.ATTR_DB_NAMESPACE]: params.namespace,
        [semantic_conventions_1.ATTR_SERVER_ADDRESS]: url?.hostname ?? params.host,
        [semantic_conventions_1.ATTR_SERVER_PORT]: Number(url?.port) || getPort(params.port)
      };
    }
    return attributes;
  }
  utils$6.getSemanticAttributesFromPoolConnection = getSemanticAttributesFromPoolConnection;
  function shouldSkipInstrumentation(instrumentationConfig) {
    return instrumentationConfig.requireParentSpan === true && api_1.trace.getSpan(api_1.context.active()) === void 0;
  }
  utils$6.shouldSkipInstrumentation = shouldSkipInstrumentation;
  function handleConfigQuery(tracer, instrumentationConfig, semconvStability, queryConfig) {
    const { connectionParameters } = this;
    const dbName = connectionParameters.database;
    const spanName = getQuerySpanName(dbName, queryConfig);
    const span = tracer.startSpan(spanName, {
      kind: api_1.SpanKind.CLIENT,
      attributes: getSemanticAttributesFromConnection(connectionParameters, semconvStability)
    });
    if (!queryConfig) {
      return span;
    }
    if (queryConfig.text) {
      if (semconvStability & instrumentation_1.SemconvStability.OLD) {
        span.setAttribute(semconv_1.ATTR_DB_STATEMENT, queryConfig.text);
      }
      if (semconvStability & instrumentation_1.SemconvStability.STABLE) {
        span.setAttribute(semantic_conventions_1.ATTR_DB_QUERY_TEXT, queryConfig.text);
      }
    }
    if (instrumentationConfig.enhancedDatabaseReporting && Array.isArray(queryConfig.values)) {
      try {
        const convertedValues = queryConfig.values.map((value) => {
          if (value == null) {
            return "null";
          } else if (value instanceof Buffer) {
            return value.toString();
          } else if (typeof value === "object") {
            if (typeof value.toPostgres === "function") {
              return value.toPostgres();
            }
            return JSON.stringify(value);
          } else {
            return value.toString();
          }
        });
        span.setAttribute(AttributeNames_1.AttributeNames.PG_VALUES, convertedValues);
      } catch (e) {
        api_1.diag.error("failed to stringify ", queryConfig.values, e);
      }
    }
    if (typeof queryConfig.name === "string") {
      span.setAttribute(AttributeNames_1.AttributeNames.PG_PLAN, queryConfig.name);
    }
    return span;
  }
  utils$6.handleConfigQuery = handleConfigQuery;
  function handleExecutionResult(config2, span, pgResult) {
    if (typeof config2.responseHook === "function") {
      (0, instrumentation_1.safeExecuteInTheMiddle)(() => {
        config2.responseHook(span, {
          data: pgResult
        });
      }, (err) => {
        if (err) {
          api_1.diag.error("Error running response hook", err);
        }
      }, true);
    }
  }
  utils$6.handleExecutionResult = handleExecutionResult;
  function patchCallback(instrumentationConfig, span, cb2, attributes, recordDuration) {
    return function patchedCallback(err, res) {
      if (err) {
        if (Object.prototype.hasOwnProperty.call(err, "code")) {
          attributes[semantic_conventions_1.ATTR_ERROR_TYPE] = err["code"];
        }
        if (err instanceof Error) {
          span.recordException(sanitizedErrorMessage(err));
        }
        span.setStatus({
          code: api_1.SpanStatusCode.ERROR,
          message: err.message
        });
      } else {
        handleExecutionResult(instrumentationConfig, span, res);
      }
      recordDuration();
      span.end();
      cb2.call(this, err, res);
    };
  }
  utils$6.patchCallback = patchCallback;
  function getPoolName(pool) {
    let poolName = "";
    poolName += (pool?.host ? `${pool.host}` : "unknown_host") + ":";
    poolName += (pool?.port ? `${pool.port}` : "unknown_port") + "/";
    poolName += pool?.database ? `${pool.database}` : "unknown_database";
    return poolName.trim();
  }
  utils$6.getPoolName = getPoolName;
  function updateCounter(poolName, pool, connectionCount, connectionPendingRequests, latestCounter) {
    const all = pool.totalCount;
    const pending = pool.waitingCount;
    const idle = pool.idleCount;
    const used = all - idle;
    connectionCount.add(used - latestCounter.used, {
      [semconv_1.ATTR_DB_CLIENT_CONNECTION_STATE]: semconv_1.DB_CLIENT_CONNECTION_STATE_VALUE_USED,
      [semconv_1.ATTR_DB_CLIENT_CONNECTION_POOL_NAME]: poolName
    });
    connectionCount.add(idle - latestCounter.idle, {
      [semconv_1.ATTR_DB_CLIENT_CONNECTION_STATE]: semconv_1.DB_CLIENT_CONNECTION_STATE_VALUE_IDLE,
      [semconv_1.ATTR_DB_CLIENT_CONNECTION_POOL_NAME]: poolName
    });
    connectionPendingRequests.add(pending - latestCounter.pending, {
      [semconv_1.ATTR_DB_CLIENT_CONNECTION_POOL_NAME]: poolName
    });
    return { used, idle, pending };
  }
  utils$6.updateCounter = updateCounter;
  function patchCallbackPGPool(span, cb2) {
    return function patchedCallback(err, res, done) {
      if (err) {
        if (err instanceof Error) {
          span.recordException(sanitizedErrorMessage(err));
        }
        span.setStatus({
          code: api_1.SpanStatusCode.ERROR,
          message: err.message
        });
      }
      span.end();
      cb2.call(this, err, res, done);
    };
  }
  utils$6.patchCallbackPGPool = patchCallbackPGPool;
  function patchClientConnectCallback(span, cb2) {
    return function patchedClientConnectCallback(err) {
      if (err) {
        if (err instanceof Error) {
          span.recordException(sanitizedErrorMessage(err));
        }
        span.setStatus({
          code: api_1.SpanStatusCode.ERROR,
          message: err.message
        });
      }
      span.end();
      cb2.apply(this, arguments);
    };
  }
  utils$6.patchClientConnectCallback = patchClientConnectCallback;
  function getErrorMessage(e) {
    return typeof e === "object" && e !== null && "message" in e ? String(e.message) : void 0;
  }
  utils$6.getErrorMessage = getErrorMessage;
  function isObjectWithTextString(it) {
    return typeof it === "object" && typeof it?.text === "string";
  }
  utils$6.isObjectWithTextString = isObjectWithTextString;
  function sanitizedErrorMessage(error2) {
    const name2 = error2?.name ?? "PostgreSQLError";
    const code = error2?.code ?? "UNKNOWN";
    return `PostgreSQL error of type '${name2}' occurred (code: ${code})`;
  }
  utils$6.sanitizedErrorMessage = sanitizedErrorMessage;
  return utils$6;
}
var version$8 = {};
var hasRequiredVersion$8;
function requireVersion$8() {
  if (hasRequiredVersion$8) return version$8;
  hasRequiredVersion$8 = 1;
  Object.defineProperty(version$8, "__esModule", { value: true });
  version$8.PACKAGE_NAME = version$8.PACKAGE_VERSION = void 0;
  version$8.PACKAGE_VERSION = "0.63.0";
  version$8.PACKAGE_NAME = "@opentelemetry/instrumentation-pg";
  return version$8;
}
var hasRequiredInstrumentation$7;
function requireInstrumentation$7() {
  if (hasRequiredInstrumentation$7) return instrumentation$7;
  hasRequiredInstrumentation$7 = 1;
  Object.defineProperty(instrumentation$7, "__esModule", { value: true });
  instrumentation$7.PgInstrumentation = void 0;
  const instrumentation_1 = require$$2;
  const api_1 = require$$0$2;
  const internal_types_1 = requireInternalTypes$3();
  const utils2 = requireUtils$6();
  const sql_common_1 = requireSrc$d();
  const version_1 = requireVersion$8();
  const SpanNames_1 = requireSpanNames();
  const core_1 = require$$1$1;
  const semantic_conventions_1 = require$$2$1;
  const semconv_1 = requireSemconv$4();
  function extractModuleExports(module2) {
    return module2[Symbol.toStringTag] === "Module" ? module2.default : module2;
  }
  class PgInstrumentation extends instrumentation_1.InstrumentationBase {
    // Pool events connect, acquire, release and remove can be called
    // multiple times without changing the values of total, idle and waiting
    // connections. The _connectionsCounter is used to keep track of latest
    // values and only update the metrics _connectionsCount and _connectionPendingRequests
    // when the value change.
    _connectionsCounter = {
      used: 0,
      idle: 0,
      pending: 0
    };
    _semconvStability;
    constructor(config2 = {}) {
      super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config2);
      this._semconvStability = (0, instrumentation_1.semconvStabilityFromStr)("database", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
    }
    _updateMetricInstruments() {
      this._operationDuration = this.meter.createHistogram(semantic_conventions_1.METRIC_DB_CLIENT_OPERATION_DURATION, {
        description: "Duration of database client operations.",
        unit: "s",
        valueType: api_1.ValueType.DOUBLE,
        advice: {
          explicitBucketBoundaries: [
            1e-3,
            5e-3,
            0.01,
            0.05,
            0.1,
            0.5,
            1,
            5,
            10
          ]
        }
      });
      this._connectionsCounter = {
        idle: 0,
        pending: 0,
        used: 0
      };
      this._connectionsCount = this.meter.createUpDownCounter(semconv_1.METRIC_DB_CLIENT_CONNECTION_COUNT, {
        description: "The number of connections that are currently in state described by the state attribute.",
        unit: "{connection}"
      });
      this._connectionPendingRequests = this.meter.createUpDownCounter(semconv_1.METRIC_DB_CLIENT_CONNECTION_PENDING_REQUESTS, {
        description: "The number of current pending requests for an open connection.",
        unit: "{connection}"
      });
    }
    init() {
      const SUPPORTED_PG_VERSIONS = [">=8.0.3 <9"];
      const SUPPORTED_PG_POOL_VERSIONS = [">=2.0.0 <4"];
      const modulePgNativeClient = new instrumentation_1.InstrumentationNodeModuleFile("pg/lib/native/client.js", SUPPORTED_PG_VERSIONS, this._patchPgClient.bind(this), this._unpatchPgClient.bind(this));
      const modulePgClient = new instrumentation_1.InstrumentationNodeModuleFile("pg/lib/client.js", SUPPORTED_PG_VERSIONS, this._patchPgClient.bind(this), this._unpatchPgClient.bind(this));
      const modulePG = new instrumentation_1.InstrumentationNodeModuleDefinition("pg", SUPPORTED_PG_VERSIONS, (module2) => {
        const moduleExports = extractModuleExports(module2);
        this._patchPgClient(moduleExports.Client);
        return module2;
      }, (module2) => {
        const moduleExports = extractModuleExports(module2);
        this._unpatchPgClient(moduleExports.Client);
        return module2;
      }, [modulePgClient, modulePgNativeClient]);
      const modulePGPool = new instrumentation_1.InstrumentationNodeModuleDefinition("pg-pool", SUPPORTED_PG_POOL_VERSIONS, (module2) => {
        const moduleExports = extractModuleExports(module2);
        if ((0, instrumentation_1.isWrapped)(moduleExports.prototype.connect)) {
          this._unwrap(moduleExports.prototype, "connect");
        }
        this._wrap(moduleExports.prototype, "connect", this._getPoolConnectPatch());
        return moduleExports;
      }, (module2) => {
        const moduleExports = extractModuleExports(module2);
        if ((0, instrumentation_1.isWrapped)(moduleExports.prototype.connect)) {
          this._unwrap(moduleExports.prototype, "connect");
        }
      });
      return [modulePG, modulePGPool];
    }
    _patchPgClient(module2) {
      if (!module2) {
        return;
      }
      const moduleExports = extractModuleExports(module2);
      if ((0, instrumentation_1.isWrapped)(moduleExports.prototype.query)) {
        this._unwrap(moduleExports.prototype, "query");
      }
      if ((0, instrumentation_1.isWrapped)(moduleExports.prototype.connect)) {
        this._unwrap(moduleExports.prototype, "connect");
      }
      this._wrap(moduleExports.prototype, "query", this._getClientQueryPatch());
      this._wrap(moduleExports.prototype, "connect", this._getClientConnectPatch());
      return module2;
    }
    _unpatchPgClient(module2) {
      const moduleExports = extractModuleExports(module2);
      if ((0, instrumentation_1.isWrapped)(moduleExports.prototype.query)) {
        this._unwrap(moduleExports.prototype, "query");
      }
      if ((0, instrumentation_1.isWrapped)(moduleExports.prototype.connect)) {
        this._unwrap(moduleExports.prototype, "connect");
      }
      return module2;
    }
    _getClientConnectPatch() {
      const plugin = this;
      return (original) => {
        return function connect(callback) {
          const config2 = plugin.getConfig();
          if (utils2.shouldSkipInstrumentation(config2) || config2.ignoreConnectSpans) {
            return original.call(this, callback);
          }
          const span = plugin.tracer.startSpan(SpanNames_1.SpanNames.CONNECT, {
            kind: api_1.SpanKind.CLIENT,
            attributes: utils2.getSemanticAttributesFromConnection(this, plugin._semconvStability)
          });
          if (callback) {
            const parentSpan = api_1.trace.getSpan(api_1.context.active());
            callback = utils2.patchClientConnectCallback(span, callback);
            if (parentSpan) {
              callback = api_1.context.bind(api_1.context.active(), callback);
            }
          }
          const connectResult = api_1.context.with(api_1.trace.setSpan(api_1.context.active(), span), () => {
            return original.call(this, callback);
          });
          return handleConnectResult(span, connectResult);
        };
      };
    }
    recordOperationDuration(attributes, startTime) {
      const metricsAttributes = {};
      const keysToCopy = [
        semantic_conventions_1.ATTR_DB_NAMESPACE,
        semantic_conventions_1.ATTR_ERROR_TYPE,
        semantic_conventions_1.ATTR_SERVER_PORT,
        semantic_conventions_1.ATTR_SERVER_ADDRESS,
        semantic_conventions_1.ATTR_DB_OPERATION_NAME
      ];
      if (this._semconvStability & instrumentation_1.SemconvStability.OLD) {
        keysToCopy.push(semconv_1.ATTR_DB_SYSTEM);
      }
      if (this._semconvStability & instrumentation_1.SemconvStability.STABLE) {
        keysToCopy.push(semantic_conventions_1.ATTR_DB_SYSTEM_NAME);
      }
      keysToCopy.forEach((key) => {
        if (key in attributes) {
          metricsAttributes[key] = attributes[key];
        }
      });
      const durationSeconds = (0, core_1.hrTimeToMilliseconds)((0, core_1.hrTimeDuration)(startTime, (0, core_1.hrTime)())) / 1e3;
      this._operationDuration.record(durationSeconds, metricsAttributes);
    }
    _getClientQueryPatch() {
      const plugin = this;
      return (original) => {
        this._diag.debug("Patching pg.Client.prototype.query");
        return function query(...args) {
          if (utils2.shouldSkipInstrumentation(plugin.getConfig())) {
            return original.apply(this, args);
          }
          const startTime = (0, core_1.hrTime)();
          const arg0 = args[0];
          const firstArgIsString = typeof arg0 === "string";
          const firstArgIsQueryObjectWithText = utils2.isObjectWithTextString(arg0);
          const queryConfig = firstArgIsString ? {
            text: arg0,
            values: Array.isArray(args[1]) ? args[1] : void 0
          } : firstArgIsQueryObjectWithText ? {
            ...arg0,
            name: arg0.name,
            text: arg0.text,
            values: arg0.values ?? (Array.isArray(args[1]) ? args[1] : void 0)
          } : void 0;
          const attributes = {
            [semconv_1.ATTR_DB_SYSTEM]: semconv_1.DB_SYSTEM_VALUE_POSTGRESQL,
            [semantic_conventions_1.ATTR_DB_NAMESPACE]: this.database,
            [semantic_conventions_1.ATTR_SERVER_PORT]: this.connectionParameters.port,
            [semantic_conventions_1.ATTR_SERVER_ADDRESS]: this.connectionParameters.host
          };
          if (queryConfig?.text) {
            attributes[semantic_conventions_1.ATTR_DB_OPERATION_NAME] = utils2.parseNormalizedOperationName(queryConfig?.text);
          }
          const recordDuration = () => {
            plugin.recordOperationDuration(attributes, startTime);
          };
          const instrumentationConfig = plugin.getConfig();
          const span = utils2.handleConfigQuery.call(this, plugin.tracer, instrumentationConfig, plugin._semconvStability, queryConfig);
          if (instrumentationConfig.addSqlCommenterCommentToQueries) {
            if (firstArgIsString) {
              args[0] = (0, sql_common_1.addSqlCommenterComment)(span, arg0);
            } else if (firstArgIsQueryObjectWithText && !("name" in arg0)) {
              args[0] = {
                ...arg0,
                text: (0, sql_common_1.addSqlCommenterComment)(span, arg0.text)
              };
            }
          }
          if (args.length > 0) {
            const parentSpan = api_1.trace.getSpan(api_1.context.active());
            if (typeof args[args.length - 1] === "function") {
              args[args.length - 1] = utils2.patchCallback(
                instrumentationConfig,
                span,
                args[args.length - 1],
                // nb: not type safe.
                attributes,
                recordDuration
              );
              if (parentSpan) {
                args[args.length - 1] = api_1.context.bind(api_1.context.active(), args[args.length - 1]);
              }
            } else if (typeof queryConfig?.callback === "function") {
              let callback = utils2.patchCallback(
                plugin.getConfig(),
                span,
                queryConfig.callback,
                // nb: not type safe.
                attributes,
                recordDuration
              );
              if (parentSpan) {
                callback = api_1.context.bind(api_1.context.active(), callback);
              }
              args[0].callback = callback;
            }
          }
          const { requestHook: requestHook2 } = instrumentationConfig;
          if (typeof requestHook2 === "function" && queryConfig) {
            (0, instrumentation_1.safeExecuteInTheMiddle)(() => {
              const { database, host, port, user } = this.connectionParameters;
              const connection = { database, host, port, user };
              requestHook2(span, {
                connection,
                query: {
                  text: queryConfig.text,
                  // nb: if `client.query` is called with illegal arguments
                  // (e.g., if `queryConfig.values` is passed explicitly, but a
                  // non-array is given), then the type casts will be wrong. But
                  // we leave it up to the queryHook to handle that, and we
                  // catch and swallow any errors it throws. The other options
                  // are all worse. E.g., we could leave `queryConfig.values`
                  // and `queryConfig.name` as `unknown`, but then the hook body
                  // would be forced to validate (or cast) them before using
                  // them, which seems incredibly cumbersome given that these
                  // casts will be correct 99.9% of the time -- and pg.query
                  // will immediately throw during development in the other .1%
                  // of cases. Alternatively, we could simply skip calling the
                  // hook when `values` or `name` don't have the expected type,
                  // but that would add unnecessary validation overhead to every
                  // hook invocation and possibly be even more confusing/unexpected.
                  values: queryConfig.values,
                  name: queryConfig.name
                }
              });
            }, (err) => {
              if (err) {
                plugin._diag.error("Error running query hook", err);
              }
            }, true);
          }
          let result;
          try {
            result = original.apply(this, args);
          } catch (e) {
            if (e instanceof Error) {
              span.recordException(utils2.sanitizedErrorMessage(e));
            }
            span.setStatus({
              code: api_1.SpanStatusCode.ERROR,
              message: utils2.getErrorMessage(e)
            });
            span.end();
            throw e;
          }
          if (result instanceof Promise) {
            return result.then((result2) => {
              return new Promise((resolve) => {
                utils2.handleExecutionResult(plugin.getConfig(), span, result2);
                recordDuration();
                span.end();
                resolve(result2);
              });
            }).catch((error2) => {
              return new Promise((_, reject) => {
                if (error2 instanceof Error) {
                  span.recordException(utils2.sanitizedErrorMessage(error2));
                }
                span.setStatus({
                  code: api_1.SpanStatusCode.ERROR,
                  message: error2.message
                });
                recordDuration();
                span.end();
                reject(error2);
              });
            });
          }
          return result;
        };
      };
    }
    _setPoolConnectEventListeners(pgPool) {
      if (pgPool[internal_types_1.EVENT_LISTENERS_SET])
        return;
      const poolName = utils2.getPoolName(pgPool.options);
      pgPool.on("connect", () => {
        this._connectionsCounter = utils2.updateCounter(poolName, pgPool, this._connectionsCount, this._connectionPendingRequests, this._connectionsCounter);
      });
      pgPool.on("acquire", () => {
        this._connectionsCounter = utils2.updateCounter(poolName, pgPool, this._connectionsCount, this._connectionPendingRequests, this._connectionsCounter);
      });
      pgPool.on("remove", () => {
        this._connectionsCounter = utils2.updateCounter(poolName, pgPool, this._connectionsCount, this._connectionPendingRequests, this._connectionsCounter);
      });
      pgPool.on("release", () => {
        this._connectionsCounter = utils2.updateCounter(poolName, pgPool, this._connectionsCount, this._connectionPendingRequests, this._connectionsCounter);
      });
      pgPool[internal_types_1.EVENT_LISTENERS_SET] = true;
    }
    _getPoolConnectPatch() {
      const plugin = this;
      return (originalConnect) => {
        return function connect(callback) {
          const config2 = plugin.getConfig();
          if (utils2.shouldSkipInstrumentation(config2)) {
            return originalConnect.call(this, callback);
          }
          plugin._setPoolConnectEventListeners(this);
          if (config2.ignoreConnectSpans) {
            return originalConnect.call(this, callback);
          }
          const span = plugin.tracer.startSpan(SpanNames_1.SpanNames.POOL_CONNECT, {
            kind: api_1.SpanKind.CLIENT,
            attributes: utils2.getSemanticAttributesFromPoolConnection(this.options, plugin._semconvStability)
          });
          if (callback) {
            const parentSpan = api_1.trace.getSpan(api_1.context.active());
            callback = utils2.patchCallbackPGPool(span, callback);
            if (parentSpan) {
              callback = api_1.context.bind(api_1.context.active(), callback);
            }
          }
          const connectResult = api_1.context.with(api_1.trace.setSpan(api_1.context.active(), span), () => {
            return originalConnect.call(this, callback);
          });
          return handleConnectResult(span, connectResult);
        };
      };
    }
  }
  instrumentation$7.PgInstrumentation = PgInstrumentation;
  function handleConnectResult(span, connectResult) {
    if (!(connectResult instanceof Promise)) {
      return connectResult;
    }
    const connectResultPromise = connectResult;
    return api_1.context.bind(api_1.context.active(), connectResultPromise.then((result) => {
      span.end();
      return result;
    }).catch((error2) => {
      if (error2 instanceof Error) {
        span.recordException(utils2.sanitizedErrorMessage(error2));
      }
      span.setStatus({
        code: api_1.SpanStatusCode.ERROR,
        message: utils2.getErrorMessage(error2)
      });
      span.end();
      return Promise.reject(error2);
    }));
  }
  return instrumentation$7;
}
var hasRequiredSrc$8;
function requireSrc$8() {
  if (hasRequiredSrc$8) return src$8;
  hasRequiredSrc$8 = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.AttributeNames = exports$1.PgInstrumentation = void 0;
    var instrumentation_1 = requireInstrumentation$7();
    Object.defineProperty(exports$1, "PgInstrumentation", { enumerable: true, get: function() {
      return instrumentation_1.PgInstrumentation;
    } });
    var AttributeNames_1 = requireAttributeNames$3();
    Object.defineProperty(exports$1, "AttributeNames", { enumerable: true, get: function() {
      return AttributeNames_1.AttributeNames;
    } });
  })(src$8);
  return src$8;
}
var srcExports$8 = requireSrc$8();
const INTEGRATION_NAME$d = "Postgres";
const instrumentPostgres = generateInstrumentOnce(
  INTEGRATION_NAME$d,
  srcExports$8.PgInstrumentation,
  (options) => ({
    requireParentSpan: true,
    requestHook(span) {
      addOriginToSpan(span, "auto.db.otel.postgres");
    },
    ignoreConnectSpans: options?.ignoreConnectSpans ?? false
  })
);
const _postgresIntegration = ((options) => {
  return {
    name: INTEGRATION_NAME$d,
    setupOnce() {
      instrumentPostgres(options);
    }
  };
});
const postgresIntegration = defineIntegration(_postgresIntegration);
const INTEGRATION_NAME$c = "PostgresJs";
const SUPPORTED_VERSIONS$1 = [">=3.0.0 <4"];
const SQL_OPERATION_REGEX = /^(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)/i;
const QUERY_FROM_INSTRUMENTED_SQL = Symbol.for("sentry.query.from.instrumented.sql");
const instrumentPostgresJs = generateInstrumentOnce(
  INTEGRATION_NAME$c,
  (options) => new PostgresJsInstrumentation({
    requireParentSpan: options?.requireParentSpan ?? true,
    requestHook: options?.requestHook
  })
);
class PostgresJsInstrumentation extends InstrumentationBase$2 {
  constructor(config2) {
    super("sentry-postgres-js", SDK_VERSION, config2);
  }
  /**
   * Initializes the instrumentation by patching the postgres module.
   * Uses two complementary approaches:
   * 1. Main function wrapper: instruments sql instances created AFTER instrumentation is set up (CJS + ESM)
   * 2. Query.prototype patch: fallback for sql instances created BEFORE instrumentation (CJS only)
   */
  init() {
    const module2 = new InstrumentationNodeModuleDefinition$2(
      "postgres",
      SUPPORTED_VERSIONS$1,
      (exports$1) => {
        try {
          return this._patchPostgres(exports$1);
        } catch (e) {
          DEBUG_BUILD$2 && debug.error("Failed to patch postgres module:", e);
          return exports$1;
        }
      },
      (exports$1) => exports$1
    );
    ["src", "cf/src", "cjs/src"].forEach((path) => {
      module2.files.push(
        new InstrumentationNodeModuleFile$1(
          `postgres/${path}/query.js`,
          SUPPORTED_VERSIONS$1,
          this._patchQueryPrototype.bind(this),
          this._unpatchQueryPrototype.bind(this)
        )
      );
    });
    return module2;
  }
  /**
   * Patches the postgres module by wrapping the main export function.
   * This intercepts the creation of sql instances and instruments them.
   */
  _patchPostgres(exports$1) {
    const isFunction2 = typeof exports$1 === "function";
    const Original = isFunction2 ? exports$1 : exports$1.default;
    if (typeof Original !== "function") {
      DEBUG_BUILD$2 && debug.warn("postgres module does not export a function. Skipping instrumentation.");
      return exports$1;
    }
    const self = this;
    const WrappedPostgres = function(...args) {
      const sql = Reflect.construct(Original, args);
      if (!sql || typeof sql !== "function") {
        DEBUG_BUILD$2 && debug.warn("postgres() did not return a valid instance");
        return sql;
      }
      const config2 = self.getConfig();
      return instrumentPostgresJsSql(sql, {
        requireParentSpan: config2.requireParentSpan,
        requestHook: config2.requestHook
      });
    };
    Object.setPrototypeOf(WrappedPostgres, Original);
    Object.setPrototypeOf(WrappedPostgres.prototype, Original.prototype);
    for (const key of Object.getOwnPropertyNames(Original)) {
      if (!["length", "name", "prototype"].includes(key)) {
        const descriptor = Object.getOwnPropertyDescriptor(Original, key);
        if (descriptor) {
          Object.defineProperty(WrappedPostgres, key, descriptor);
        }
      }
    }
    if (isFunction2) {
      return WrappedPostgres;
    } else {
      replaceExports(exports$1, "default", WrappedPostgres);
      return exports$1;
    }
  }
  /**
   * Determines whether a span should be created based on the current context.
   * If `requireParentSpan` is set to true in the configuration, a span will
   * only be created if there is a parent span available.
   */
  _shouldCreateSpans() {
    const config2 = this.getConfig();
    const hasParentSpan = trace.getSpan(context.active()) !== void 0;
    return hasParentSpan || !config2.requireParentSpan;
  }
  /**
   * Extracts DB operation name from SQL query and sets it on the span.
   */
  _setOperationName(span, sanitizedQuery, command) {
    if (command) {
      span.setAttribute(ATTR_DB_OPERATION_NAME, command);
      return;
    }
    const operationMatch = sanitizedQuery?.match(SQL_OPERATION_REGEX);
    if (operationMatch?.[1]) {
      span.setAttribute(ATTR_DB_OPERATION_NAME, operationMatch[1].toUpperCase());
    }
  }
  /**
   * Reconstructs the full SQL query from template strings with PostgreSQL placeholders.
   *
   * For sql`SELECT * FROM users WHERE id = ${123} AND name = ${'foo'}`:
   *   strings = ["SELECT * FROM users WHERE id = ", " AND name = ", ""]
   *   returns: "SELECT * FROM users WHERE id = $1 AND name = $2"
   */
  _reconstructQuery(strings) {
    if (!strings?.length) {
      return void 0;
    }
    if (strings.length === 1) {
      return strings[0] || void 0;
    }
    return strings.reduce((acc, str, i) => i === 0 ? str : `${acc}$${i}${str}`, "");
  }
  /**
   * Sanitize SQL query as per the OTEL semantic conventions
   * https://opentelemetry.io/docs/specs/semconv/database/database-spans/#sanitization-of-dbquerytext
   *
   * PostgreSQL $n placeholders are preserved per OTEL spec - they're parameterized queries,
   * not sensitive literals. Only actual values (strings, numbers, booleans) are sanitized.
   */
  _sanitizeSqlQuery(sqlQuery) {
    if (!sqlQuery) {
      return "Unknown SQL Query";
    }
    return sqlQuery.replace(/--.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/;\s*$/, "").replace(/\s+/g, " ").trim().replace(/\bX'[0-9A-Fa-f]*'/gi, "?").replace(/\bB'[01]*'/gi, "?").replace(/'(?:[^']|'')*'/g, "?").replace(/\b0x[0-9A-Fa-f]+/gi, "?").replace(/\b(?:TRUE|FALSE)\b/gi, "?").replace(/-?\b\d+\.?\d*[eE][+-]?\d+\b/g, "?").replace(/-?\b\d+\.\d+\b/g, "?").replace(/-?\.\d+\b/g, "?").replace(/(?<!\$)-?\b\d+\b/g, "?").replace(/\bIN\b\s*\(\s*\?(?:\s*,\s*\?)*\s*\)/gi, "IN (?)").replace(/\bIN\b\s*\(\s*\$\d+(?:\s*,\s*\$\d+)*\s*\)/gi, "IN ($?)");
  }
  /**
   * Fallback patch for Query.prototype.handle to instrument queries from pre-existing sql instances.
   * This catches queries from sql instances created BEFORE Sentry was initialized (CJS only).
   *
   * Note: Queries from pre-existing instances won't have connection context (database, host, port)
   * because the sql instance wasn't created through our instrumented wrapper.
   */
  _patchQueryPrototype(moduleExports) {
    const self = this;
    const originalHandle = moduleExports.Query.prototype.handle;
    moduleExports.Query.prototype.handle = async function(...args) {
      if (this[QUERY_FROM_INSTRUMENTED_SQL]) {
        return originalHandle.apply(this, args);
      }
      if (!self._shouldCreateSpans()) {
        return originalHandle.apply(this, args);
      }
      const fullQuery = self._reconstructQuery(this.strings);
      const sanitizedSqlQuery = self._sanitizeSqlQuery(fullQuery);
      return startSpanManual(
        {
          name: sanitizedSqlQuery || "postgresjs.query",
          op: "db"
        },
        (span) => {
          addOriginToSpan(span, "auto.db.postgresjs");
          span.setAttributes({
            [ATTR_DB_SYSTEM_NAME]: "postgres",
            [ATTR_DB_QUERY_TEXT]: sanitizedSqlQuery
          });
          const config2 = self.getConfig();
          const { requestHook: requestHook2 } = config2;
          if (requestHook2) {
            safeExecuteInTheMiddle$1(
              () => requestHook2(span, sanitizedSqlQuery, void 0),
              (e) => {
                if (e) {
                  span.setAttribute("sentry.hook.error", "requestHook failed");
                  DEBUG_BUILD$2 && debug.error(`Error in requestHook for ${INTEGRATION_NAME$c} integration:`, e);
                }
              },
              true
            );
          }
          const originalResolve = this.resolve;
          this.resolve = new Proxy(originalResolve, {
            apply: (resolveTarget, resolveThisArg, resolveArgs) => {
              try {
                self._setOperationName(span, sanitizedSqlQuery, resolveArgs?.[0]?.command);
                span.end();
              } catch (e) {
                DEBUG_BUILD$2 && debug.error("Error ending span in resolve callback:", e);
              }
              return Reflect.apply(resolveTarget, resolveThisArg, resolveArgs);
            }
          });
          const originalReject = this.reject;
          this.reject = new Proxy(originalReject, {
            apply: (rejectTarget, rejectThisArg, rejectArgs) => {
              try {
                span.setStatus({
                  code: SPAN_STATUS_ERROR,
                  message: rejectArgs?.[0]?.message || "unknown_error"
                });
                span.setAttribute(ATTR_DB_RESPONSE_STATUS_CODE, rejectArgs?.[0]?.code || "unknown");
                span.setAttribute(ATTR_ERROR_TYPE, rejectArgs?.[0]?.name || "unknown");
                self._setOperationName(span, sanitizedSqlQuery);
                span.end();
              } catch (e) {
                DEBUG_BUILD$2 && debug.error("Error ending span in reject callback:", e);
              }
              return Reflect.apply(rejectTarget, rejectThisArg, rejectArgs);
            }
          });
          try {
            return originalHandle.apply(this, args);
          } catch (e) {
            span.setStatus({
              code: SPAN_STATUS_ERROR,
              message: e instanceof Error ? e.message : "unknown_error"
            });
            span.end();
            throw e;
          }
        }
      );
    };
    moduleExports.Query.prototype.handle.__sentry_original__ = originalHandle;
    return moduleExports;
  }
  /**
   * Restores the original Query.prototype.handle method.
   */
  _unpatchQueryPrototype(moduleExports) {
    if (moduleExports.Query.prototype.handle.__sentry_original__) {
      moduleExports.Query.prototype.handle = moduleExports.Query.prototype.handle.__sentry_original__;
    }
    return moduleExports;
  }
}
const _postgresJsIntegration = ((options) => {
  return {
    name: INTEGRATION_NAME$c,
    setupOnce() {
      instrumentPostgresJs(options);
    }
  };
});
const postgresJsIntegration = defineIntegration(_postgresJsIntegration);
class NoopLogger2 {
  emit(_logRecord) {
  }
}
const NOOP_LOGGER = new NoopLogger2();
class NoopLoggerProvider2 {
  getLogger(_name, _version, _options) {
    return new NoopLogger2();
  }
}
const NOOP_LOGGER_PROVIDER = new NoopLoggerProvider2();
class ProxyLogger2 {
  constructor(_provider, name2, version2, options) {
    this._provider = _provider;
    this.name = name2;
    this.version = version2;
    this.options = options;
  }
  /**
   * Emit a log record. This method should only be used by log appenders.
   *
   * @param logRecord
   */
  emit(logRecord) {
    this._getLogger().emit(logRecord);
  }
  /**
   * Try to get a logger from the proxy logger provider.
   * If the proxy logger provider has no delegate, return a noop logger.
   */
  _getLogger() {
    if (this._delegate) {
      return this._delegate;
    }
    const logger2 = this._provider._getDelegateLogger(this.name, this.version, this.options);
    if (!logger2) {
      return NOOP_LOGGER;
    }
    this._delegate = logger2;
    return this._delegate;
  }
}
class ProxyLoggerProvider2 {
  getLogger(name2, version2, options) {
    var _a;
    return (_a = this._getDelegateLogger(name2, version2, options)) !== null && _a !== void 0 ? _a : new ProxyLogger2(this, name2, version2, options);
  }
  /**
   * Get the delegate logger provider.
   * Used by tests only.
   * @internal
   */
  _getDelegate() {
    var _a;
    return (_a = this._delegate) !== null && _a !== void 0 ? _a : NOOP_LOGGER_PROVIDER;
  }
  /**
   * Set the delegate logger provider
   * @internal
   */
  _setDelegate(delegate) {
    this._delegate = delegate;
  }
  /**
   * @internal
   */
  _getDelegateLogger(name2, version2, options) {
    var _a;
    return (_a = this._delegate) === null || _a === void 0 ? void 0 : _a.getLogger(name2, version2, options);
  }
}
const _globalThis = typeof globalThis === "object" ? globalThis : global;
const GLOBAL_LOGS_API_KEY = Symbol.for("io.opentelemetry.js.api.logs");
const _global = _globalThis;
function makeGetter(requiredVersion, instance, fallback) {
  return (version2) => version2 === requiredVersion ? instance : fallback;
}
const API_BACKWARDS_COMPATIBILITY_VERSION = 1;
class LogsAPI2 {
  constructor() {
    this._proxyLoggerProvider = new ProxyLoggerProvider2();
  }
  static getInstance() {
    if (!this._instance) {
      this._instance = new LogsAPI2();
    }
    return this._instance;
  }
  setGlobalLoggerProvider(provider) {
    if (_global[GLOBAL_LOGS_API_KEY]) {
      return this.getLoggerProvider();
    }
    _global[GLOBAL_LOGS_API_KEY] = makeGetter(API_BACKWARDS_COMPATIBILITY_VERSION, provider, NOOP_LOGGER_PROVIDER);
    this._proxyLoggerProvider._setDelegate(provider);
    return provider;
  }
  /**
   * Returns the global logger provider.
   *
   * @returns LoggerProvider
   */
  getLoggerProvider() {
    var _a, _b;
    return (_b = (_a = _global[GLOBAL_LOGS_API_KEY]) === null || _a === void 0 ? void 0 : _a.call(_global, API_BACKWARDS_COMPATIBILITY_VERSION)) !== null && _b !== void 0 ? _b : this._proxyLoggerProvider;
  }
  /**
   * Returns a logger from the global logger provider.
   *
   * @returns Logger
   */
  getLogger(name2, version2, options) {
    return this.getLoggerProvider().getLogger(name2, version2, options);
  }
  /** Remove the global logger provider */
  disable() {
    delete _global[GLOBAL_LOGS_API_KEY];
    this._proxyLoggerProvider = new ProxyLoggerProvider2();
  }
}
const logs = LogsAPI2.getInstance();
const VERSION_REGEXP = /^(?:v)?(?<version>(?<major>0|[1-9]\d*)\.(?<minor>0|[1-9]\d*)\.(?<patch>0|[1-9]\d*))(?:-(?<prerelease>(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+(?<build>[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
const RANGE_REGEXP = /^(?<op><|>|=|==|<=|>=|~|\^|~>)?\s*(?:v)?(?<version>(?<major>x|X|\*|0|[1-9]\d*)(?:\.(?<minor>x|X|\*|0|[1-9]\d*))?(?:\.(?<patch>x|X|\*|0|[1-9]\d*))?)(?:-(?<prerelease>(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+(?<build>[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
const operatorResMap = {
  ">": [1],
  ">=": [0, 1],
  "=": [0],
  "<=": [-1, 0],
  "<": [-1],
  "!=": [-1, 1]
};
function satisfies(version2, range, options) {
  if (!_validateVersion(version2)) {
    diag.error(`Invalid version: ${version2}`);
    return false;
  }
  if (!range) {
    return true;
  }
  range = range.replace(/([<>=~^]+)\s+/g, "$1");
  const parsedVersion = _parseVersion(version2);
  if (!parsedVersion) {
    return false;
  }
  const allParsedRanges = [];
  const checkResult = _doSatisfies(parsedVersion, range, allParsedRanges, options);
  if (checkResult && !options?.includePrerelease) {
    return _doPreleaseCheck(parsedVersion, allParsedRanges);
  }
  return checkResult;
}
function _validateVersion(version2) {
  return typeof version2 === "string" && VERSION_REGEXP.test(version2);
}
function _doSatisfies(parsedVersion, range, allParsedRanges, options) {
  if (range.includes("||")) {
    const ranges = range.trim().split("||");
    for (const r of ranges) {
      if (_checkRange(parsedVersion, r, allParsedRanges, options)) {
        return true;
      }
    }
    return false;
  } else if (range.includes(" - ")) {
    range = replaceHyphen(range, options);
  } else if (range.includes(" ")) {
    const ranges = range.trim().replace(/\s{2,}/g, " ").split(" ");
    for (const r of ranges) {
      if (!_checkRange(parsedVersion, r, allParsedRanges, options)) {
        return false;
      }
    }
    return true;
  }
  return _checkRange(parsedVersion, range, allParsedRanges, options);
}
function _checkRange(parsedVersion, range, allParsedRanges, options) {
  range = _normalizeRange(range, options);
  if (range.includes(" ")) {
    return _doSatisfies(parsedVersion, range, allParsedRanges, options);
  } else {
    const parsedRange = _parseRange(range);
    allParsedRanges.push(parsedRange);
    return _satisfies(parsedVersion, parsedRange);
  }
}
function _satisfies(parsedVersion, parsedRange) {
  if (parsedRange.invalid) {
    return false;
  }
  if (!parsedRange.version || _isWildcard(parsedRange.version)) {
    return true;
  }
  let comparisonResult = _compareVersionSegments(parsedVersion.versionSegments || [], parsedRange.versionSegments || []);
  if (comparisonResult === 0) {
    const versionPrereleaseSegments = parsedVersion.prereleaseSegments || [];
    const rangePrereleaseSegments = parsedRange.prereleaseSegments || [];
    if (!versionPrereleaseSegments.length && !rangePrereleaseSegments.length) {
      comparisonResult = 0;
    } else if (!versionPrereleaseSegments.length && rangePrereleaseSegments.length) {
      comparisonResult = 1;
    } else if (versionPrereleaseSegments.length && !rangePrereleaseSegments.length) {
      comparisonResult = -1;
    } else {
      comparisonResult = _compareVersionSegments(versionPrereleaseSegments, rangePrereleaseSegments);
    }
  }
  return operatorResMap[parsedRange.op]?.includes(comparisonResult);
}
function _doPreleaseCheck(parsedVersion, allParsedRanges) {
  if (parsedVersion.prerelease) {
    return allParsedRanges.some((r) => r.prerelease && r.version === parsedVersion.version);
  }
  return true;
}
function _normalizeRange(range, options) {
  range = range.trim();
  range = replaceCaret(range, options);
  range = replaceTilde(range);
  range = replaceXRange(range, options);
  range = range.trim();
  return range;
}
function isX(id) {
  return !id || id.toLowerCase() === "x" || id === "*";
}
function _parseVersion(versionString) {
  const match = versionString.match(VERSION_REGEXP);
  if (!match) {
    diag.error(`Invalid version: ${versionString}`);
    return void 0;
  }
  const version2 = match.groups.version;
  const prerelease = match.groups.prerelease;
  const build = match.groups.build;
  const versionSegments = version2.split(".");
  const prereleaseSegments = prerelease?.split(".");
  return {
    op: void 0,
    version: version2,
    versionSegments,
    versionSegmentCount: versionSegments.length,
    prerelease,
    prereleaseSegments,
    prereleaseSegmentCount: prereleaseSegments ? prereleaseSegments.length : 0,
    build
  };
}
function _parseRange(rangeString) {
  if (!rangeString) {
    return {};
  }
  const match = rangeString.match(RANGE_REGEXP);
  if (!match) {
    diag.error(`Invalid range: ${rangeString}`);
    return {
      invalid: true
    };
  }
  let op = match.groups.op;
  const version2 = match.groups.version;
  const prerelease = match.groups.prerelease;
  const build = match.groups.build;
  const versionSegments = version2.split(".");
  const prereleaseSegments = prerelease?.split(".");
  if (op === "==") {
    op = "=";
  }
  return {
    op: op || "=",
    version: version2,
    versionSegments,
    versionSegmentCount: versionSegments.length,
    prerelease,
    prereleaseSegments,
    prereleaseSegmentCount: prereleaseSegments ? prereleaseSegments.length : 0,
    build
  };
}
function _isWildcard(s) {
  return s === "*" || s === "x" || s === "X";
}
function _parseVersionString(v) {
  const n = parseInt(v, 10);
  return isNaN(n) ? v : n;
}
function _normalizeVersionType(a, b) {
  if (typeof a === typeof b) {
    if (typeof a === "number") {
      return [a, b];
    } else if (typeof a === "string") {
      return [a, b];
    } else {
      throw new Error("Version segments can only be strings or numbers");
    }
  } else {
    return [String(a), String(b)];
  }
}
function _compareVersionStrings(v1, v2) {
  if (_isWildcard(v1) || _isWildcard(v2)) {
    return 0;
  }
  const [parsedV1, parsedV2] = _normalizeVersionType(_parseVersionString(v1), _parseVersionString(v2));
  if (parsedV1 > parsedV2) {
    return 1;
  } else if (parsedV1 < parsedV2) {
    return -1;
  }
  return 0;
}
function _compareVersionSegments(v1, v2) {
  for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
    const res = _compareVersionStrings(v1[i] || "0", v2[i] || "0");
    if (res !== 0) {
      return res;
    }
  }
  return 0;
}
const LETTERDASHNUMBER = "[a-zA-Z0-9-]";
const NUMERICIDENTIFIER = "0|[1-9]\\d*";
const NONNUMERICIDENTIFIER = `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`;
const GTLT = "((?:<|>)?=?)";
const PRERELEASEIDENTIFIER = `(?:${NUMERICIDENTIFIER}|${NONNUMERICIDENTIFIER})`;
const PRERELEASE = `(?:-(${PRERELEASEIDENTIFIER}(?:\\.${PRERELEASEIDENTIFIER})*))`;
const BUILDIDENTIFIER = `${LETTERDASHNUMBER}+`;
const BUILD = `(?:\\+(${BUILDIDENTIFIER}(?:\\.${BUILDIDENTIFIER})*))`;
const XRANGEIDENTIFIER = `${NUMERICIDENTIFIER}|x|X|\\*`;
const XRANGEPLAIN = `[v=\\s]*(${XRANGEIDENTIFIER})(?:\\.(${XRANGEIDENTIFIER})(?:\\.(${XRANGEIDENTIFIER})(?:${PRERELEASE})?${BUILD}?)?)?`;
const XRANGE = `^${GTLT}\\s*${XRANGEPLAIN}$`;
const XRANGE_REGEXP = new RegExp(XRANGE);
const HYPHENRANGE = `^\\s*(${XRANGEPLAIN})\\s+-\\s+(${XRANGEPLAIN})\\s*$`;
const HYPHENRANGE_REGEXP = new RegExp(HYPHENRANGE);
const LONETILDE = "(?:~>?)";
const TILDE = `^${LONETILDE}${XRANGEPLAIN}$`;
const TILDE_REGEXP = new RegExp(TILDE);
const LONECARET = "(?:\\^)";
const CARET = `^${LONECARET}${XRANGEPLAIN}$`;
const CARET_REGEXP = new RegExp(CARET);
function replaceTilde(comp) {
  const r = TILDE_REGEXP;
  return comp.replace(r, (_, M, m, p, pr) => {
    let ret;
    if (isX(M)) {
      ret = "";
    } else if (isX(m)) {
      ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
    } else if (isX(p)) {
      ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
    } else if (pr) {
      ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
    } else {
      ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
    }
    return ret;
  });
}
function replaceCaret(comp, options) {
  const r = CARET_REGEXP;
  const z = options?.includePrerelease ? "-0" : "";
  return comp.replace(r, (_, M, m, p, pr) => {
    let ret;
    if (isX(M)) {
      ret = "";
    } else if (isX(m)) {
      ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
    } else if (isX(p)) {
      if (M === "0") {
        ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
      } else {
        ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
      }
    } else if (pr) {
      if (M === "0") {
        if (m === "0") {
          ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
        } else {
          ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
        }
      } else {
        ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
      }
    } else {
      if (M === "0") {
        if (m === "0") {
          ret = `>=${M}.${m}.${p}${z} <${M}.${m}.${+p + 1}-0`;
        } else {
          ret = `>=${M}.${m}.${p}${z} <${M}.${+m + 1}.0-0`;
        }
      } else {
        ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
      }
    }
    return ret;
  });
}
function replaceXRange(comp, options) {
  const r = XRANGE_REGEXP;
  return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
    const xM = isX(M);
    const xm = xM || isX(m);
    const xp = xm || isX(p);
    const anyX = xp;
    if (gtlt === "=" && anyX) {
      gtlt = "";
    }
    pr = options?.includePrerelease ? "-0" : "";
    if (xM) {
      if (gtlt === ">" || gtlt === "<") {
        ret = "<0.0.0-0";
      } else {
        ret = "*";
      }
    } else if (gtlt && anyX) {
      if (xm) {
        m = 0;
      }
      p = 0;
      if (gtlt === ">") {
        gtlt = ">=";
        if (xm) {
          M = +M + 1;
          m = 0;
          p = 0;
        } else {
          m = +m + 1;
          p = 0;
        }
      } else if (gtlt === "<=") {
        gtlt = "<";
        if (xm) {
          M = +M + 1;
        } else {
          m = +m + 1;
        }
      }
      if (gtlt === "<") {
        pr = "-0";
      }
      ret = `${gtlt + M}.${m}.${p}${pr}`;
    } else if (xm) {
      ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
    } else if (xp) {
      ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
    }
    return ret;
  });
}
function replaceHyphen(comp, options) {
  const r = HYPHENRANGE_REGEXP;
  return comp.replace(r, (_, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr) => {
    if (isX(fM)) {
      from = "";
    } else if (isX(fm)) {
      from = `>=${fM}.0.0${options?.includePrerelease ? "-0" : ""}`;
    } else if (isX(fp)) {
      from = `>=${fM}.${fm}.0${options?.includePrerelease ? "-0" : ""}`;
    } else if (fpr) {
      from = `>=${from}`;
    } else {
      from = `>=${from}${options?.includePrerelease ? "-0" : ""}`;
    }
    if (isX(tM)) {
      to = "";
    } else if (isX(tm)) {
      to = `<${+tM + 1}.0.0-0`;
    } else if (isX(tp)) {
      to = `<${tM}.${+tm + 1}.0-0`;
    } else if (tpr) {
      to = `<=${tM}.${tm}.${tp}-${tpr}`;
    } else if (options?.includePrerelease) {
      to = `<${tM}.${tm}.${+tp + 1}-0`;
    } else {
      to = `<=${to}`;
    }
    return `${from} ${to}`.trim();
  });
}
let logger = console.error.bind(console);
function defineProperty(obj, name2, value) {
  const enumerable = !!obj[name2] && Object.prototype.propertyIsEnumerable.call(obj, name2);
  Object.defineProperty(obj, name2, {
    configurable: true,
    enumerable,
    writable: true,
    value
  });
}
const wrap = (nodule, name2, wrapper) => {
  if (!nodule || !nodule[name2]) {
    logger("no original function " + String(name2) + " to wrap");
    return;
  }
  if (!wrapper) {
    logger("no wrapper function");
    logger(new Error().stack);
    return;
  }
  const original = nodule[name2];
  if (typeof original !== "function" || typeof wrapper !== "function") {
    logger("original object and wrapper must be functions");
    return;
  }
  const wrapped = wrapper(original, name2);
  defineProperty(wrapped, "__original", original);
  defineProperty(wrapped, "__unwrap", () => {
    if (nodule[name2] === wrapped) {
      defineProperty(nodule, name2, original);
    }
  });
  defineProperty(wrapped, "__wrapped", true);
  defineProperty(nodule, name2, wrapped);
  return wrapped;
};
const massWrap = (nodules, names, wrapper) => {
  if (!nodules) {
    logger("must provide one or more modules to patch");
    logger(new Error().stack);
    return;
  } else if (!Array.isArray(nodules)) {
    nodules = [nodules];
  }
  if (!(names && Array.isArray(names))) {
    logger("must provide one or more functions to wrap on modules");
    return;
  }
  nodules.forEach((nodule) => {
    names.forEach((name2) => {
      wrap(nodule, name2, wrapper);
    });
  });
};
const unwrap = (nodule, name2) => {
  if (!nodule || !nodule[name2]) {
    logger("no function to unwrap.");
    logger(new Error().stack);
    return;
  }
  const wrapped = nodule[name2];
  if (!wrapped.__unwrap) {
    logger("no original to unwrap to -- has " + String(name2) + " already been unwrapped?");
  } else {
    wrapped.__unwrap();
    return;
  }
};
const massUnwrap = (nodules, names) => {
  if (!nodules) {
    logger("must provide one or more modules to patch");
    logger(new Error().stack);
    return;
  } else if (!Array.isArray(nodules)) {
    nodules = [nodules];
  }
  if (!(names && Array.isArray(names))) {
    logger("must provide one or more functions to unwrap on modules");
    return;
  }
  nodules.forEach((nodule) => {
    names.forEach((name2) => {
      unwrap(nodule, name2);
    });
  });
};
class InstrumentationAbstract2 {
  instrumentationName;
  instrumentationVersion;
  _config = {};
  _tracer;
  _meter;
  _logger;
  _diag;
  constructor(instrumentationName, instrumentationVersion, config2) {
    this.instrumentationName = instrumentationName;
    this.instrumentationVersion = instrumentationVersion;
    this.setConfig(config2);
    this._diag = diag.createComponentLogger({
      namespace: instrumentationName
    });
    this._tracer = trace.getTracer(instrumentationName, instrumentationVersion);
    this._meter = metrics.getMeter(instrumentationName, instrumentationVersion);
    this._logger = logs.getLogger(instrumentationName, instrumentationVersion);
    this._updateMetricInstruments();
  }
  /* Api to wrap instrumented method */
  _wrap = wrap;
  /* Api to unwrap instrumented methods */
  _unwrap = unwrap;
  /* Api to mass wrap instrumented method */
  _massWrap = massWrap;
  /* Api to mass unwrap instrumented methods */
  _massUnwrap = massUnwrap;
  /* Returns meter */
  get meter() {
    return this._meter;
  }
  /**
   * Sets MeterProvider to this plugin
   * @param meterProvider
   */
  setMeterProvider(meterProvider) {
    this._meter = meterProvider.getMeter(this.instrumentationName, this.instrumentationVersion);
    this._updateMetricInstruments();
  }
  /* Returns logger */
  get logger() {
    return this._logger;
  }
  /**
   * Sets LoggerProvider to this plugin
   * @param loggerProvider
   */
  setLoggerProvider(loggerProvider) {
    this._logger = loggerProvider.getLogger(this.instrumentationName, this.instrumentationVersion);
  }
  /**
   * @experimental
   *
   * Get module definitions defined by {@link init}.
   * This can be used for experimental compile-time instrumentation.
   *
   * @returns an array of {@link InstrumentationModuleDefinition}
   */
  getModuleDefinitions() {
    const initResult = this.init() ?? [];
    if (!Array.isArray(initResult)) {
      return [initResult];
    }
    return initResult;
  }
  /**
   * Sets the new metric instruments with the current Meter.
   */
  _updateMetricInstruments() {
    return;
  }
  /* Returns InstrumentationConfig */
  getConfig() {
    return this._config;
  }
  /**
   * Sets InstrumentationConfig to this plugin
   * @param config
   */
  setConfig(config2) {
    this._config = {
      enabled: true,
      ...config2
    };
  }
  /**
   * Sets TraceProvider to this plugin
   * @param tracerProvider
   */
  setTracerProvider(tracerProvider) {
    this._tracer = tracerProvider.getTracer(this.instrumentationName, this.instrumentationVersion);
  }
  /* Returns tracer */
  get tracer() {
    return this._tracer;
  }
  /**
   * Execute span customization hook, if configured, and log any errors.
   * Any semantics of the trigger and info are defined by the specific instrumentation.
   * @param hookHandler The optional hook handler which the user has configured via instrumentation config
   * @param triggerName The name of the trigger for executing the hook for logging purposes
   * @param span The span to which the hook should be applied
   * @param info The info object to be passed to the hook, with useful data the hook may use
   */
  _runSpanCustomizationHook(hookHandler, triggerName, span, info) {
    if (!hookHandler) {
      return;
    }
    try {
      hookHandler(span, info);
    } catch (e) {
      this._diag.error(`Error running span customization hook due to exception in handler`, { triggerName }, e);
    }
  }
}
const ModuleNameSeparator = "/";
class ModuleNameTrieNode2 {
  hooks = [];
  children = /* @__PURE__ */ new Map();
}
class ModuleNameTrie2 {
  _trie = new ModuleNameTrieNode2();
  _counter = 0;
  /**
   * Insert a module hook into the trie
   *
   * @param {Hooked} hook Hook
   */
  insert(hook) {
    let trieNode = this._trie;
    for (const moduleNamePart of hook.moduleName.split(ModuleNameSeparator)) {
      let nextNode = trieNode.children.get(moduleNamePart);
      if (!nextNode) {
        nextNode = new ModuleNameTrieNode2();
        trieNode.children.set(moduleNamePart, nextNode);
      }
      trieNode = nextNode;
    }
    trieNode.hooks.push({ hook, insertedId: this._counter++ });
  }
  /**
   * Search for matching hooks in the trie
   *
   * @param {string} moduleName Module name
   * @param {boolean} maintainInsertionOrder Whether to return the results in insertion order
   * @param {boolean} fullOnly Whether to return only full matches
   * @returns {Hooked[]} Matching hooks
   */
  search(moduleName, { maintainInsertionOrder, fullOnly } = {}) {
    let trieNode = this._trie;
    const results = [];
    let foundFull = true;
    for (const moduleNamePart of moduleName.split(ModuleNameSeparator)) {
      const nextNode = trieNode.children.get(moduleNamePart);
      if (!nextNode) {
        foundFull = false;
        break;
      }
      if (!fullOnly) {
        results.push(...nextNode.hooks);
      }
      trieNode = nextNode;
    }
    if (fullOnly && foundFull) {
      results.push(...trieNode.hooks);
    }
    if (results.length === 0) {
      return [];
    }
    if (results.length === 1) {
      return [results[0].hook];
    }
    if (maintainInsertionOrder) {
      results.sort((a, b) => a.insertedId - b.insertedId);
    }
    return results.map(({ hook }) => hook);
  }
}
const isMocha = [
  "afterEach",
  "after",
  "beforeEach",
  "before",
  "describe",
  "it"
].every((fn) => {
  return typeof global[fn] === "function";
});
class RequireInTheMiddleSingleton2 {
  _moduleNameTrie = new ModuleNameTrie2();
  static _instance;
  constructor() {
    this._initialize();
  }
  _initialize() {
    new requireInTheMiddleExports.Hook(
      // Intercept all `require` calls; we will filter the matching ones below
      null,
      { internals: true },
      (exports$1, name2, basedir) => {
        const normalizedModuleName = normalizePathSeparators(name2);
        const matches = this._moduleNameTrie.search(normalizedModuleName, {
          maintainInsertionOrder: true,
          // For core modules (e.g. `fs`), do not match on sub-paths (e.g. `fs/promises').
          // This matches the behavior of `require-in-the-middle`.
          // `basedir` is always `undefined` for core modules.
          fullOnly: basedir === void 0
        });
        for (const { onRequire } of matches) {
          exports$1 = onRequire(exports$1, name2, basedir);
        }
        return exports$1;
      }
    );
  }
  /**
   * Register a hook with `require-in-the-middle`
   *
   * @param {string} moduleName Module name
   * @param {OnRequireFn} onRequire Hook function
   * @returns {Hooked} Registered hook
   */
  register(moduleName, onRequire) {
    const hooked = { moduleName, onRequire };
    this._moduleNameTrie.insert(hooked);
    return hooked;
  }
  /**
   * Get the `RequireInTheMiddleSingleton` singleton
   *
   * @returns {RequireInTheMiddleSingleton} Singleton of `RequireInTheMiddleSingleton`
   */
  static getInstance() {
    if (isMocha)
      return new RequireInTheMiddleSingleton2();
    return this._instance = this._instance ?? new RequireInTheMiddleSingleton2();
  }
}
function normalizePathSeparators(moduleNameOrPath) {
  return require$$0.sep !== ModuleNameSeparator ? moduleNameOrPath.split(require$$0.sep).join(ModuleNameSeparator) : moduleNameOrPath;
}
function isWrapped(func) {
  return typeof func === "function" && typeof func.__original === "function" && typeof func.__unwrap === "function" && func.__wrapped === true;
}
class InstrumentationBase2 extends InstrumentationAbstract2 {
  _modules;
  _hooks = [];
  _requireInTheMiddleSingleton = RequireInTheMiddleSingleton2.getInstance();
  _enabled = false;
  constructor(instrumentationName, instrumentationVersion, config2) {
    super(instrumentationName, instrumentationVersion, config2);
    let modules = this.init();
    if (modules && !Array.isArray(modules)) {
      modules = [modules];
    }
    this._modules = modules || [];
    if (this._config.enabled) {
      this.enable();
    }
  }
  _wrap = (moduleExports, name2, wrapper) => {
    if (isWrapped(moduleExports[name2])) {
      this._unwrap(moduleExports, name2);
    }
    if (!types$3.isProxy(moduleExports)) {
      return wrap(moduleExports, name2, wrapper);
    } else {
      const wrapped = wrap(Object.assign({}, moduleExports), name2, wrapper);
      Object.defineProperty(moduleExports, name2, {
        value: wrapped
      });
      return wrapped;
    }
  };
  _unwrap = (moduleExports, name2) => {
    if (!types$3.isProxy(moduleExports)) {
      return unwrap(moduleExports, name2);
    } else {
      return Object.defineProperty(moduleExports, name2, {
        value: moduleExports[name2]
      });
    }
  };
  _massWrap = (moduleExportsArray, names, wrapper) => {
    if (!moduleExportsArray) {
      diag.error("must provide one or more modules to patch");
      return;
    } else if (!Array.isArray(moduleExportsArray)) {
      moduleExportsArray = [moduleExportsArray];
    }
    if (!(names && Array.isArray(names))) {
      diag.error("must provide one or more functions to wrap on modules");
      return;
    }
    moduleExportsArray.forEach((moduleExports) => {
      names.forEach((name2) => {
        this._wrap(moduleExports, name2, wrapper);
      });
    });
  };
  _massUnwrap = (moduleExportsArray, names) => {
    if (!moduleExportsArray) {
      diag.error("must provide one or more modules to patch");
      return;
    } else if (!Array.isArray(moduleExportsArray)) {
      moduleExportsArray = [moduleExportsArray];
    }
    if (!(names && Array.isArray(names))) {
      diag.error("must provide one or more functions to wrap on modules");
      return;
    }
    moduleExportsArray.forEach((moduleExports) => {
      names.forEach((name2) => {
        this._unwrap(moduleExports, name2);
      });
    });
  };
  _warnOnPreloadedModules() {
    this._modules.forEach((module2) => {
      const { name: name2 } = module2;
      try {
        const resolvedModule = require.resolve(name2);
        if (require.cache[resolvedModule]) {
          this._diag.warn(`Module ${name2} has been loaded before ${this.instrumentationName} so it might not work, please initialize it before requiring ${name2}`);
        }
      } catch {
      }
    });
  }
  _extractPackageVersion(baseDir) {
    try {
      const json = readFileSync$1(require$$0.join(baseDir, "package.json"), {
        encoding: "utf8"
      });
      const version2 = JSON.parse(json).version;
      return typeof version2 === "string" ? version2 : void 0;
    } catch {
      diag.warn("Failed extracting version", baseDir);
    }
    return void 0;
  }
  _onRequire(module2, exports$1, name2, baseDir) {
    if (!baseDir) {
      if (typeof module2.patch === "function") {
        module2.moduleExports = exports$1;
        if (this._enabled) {
          this._diag.debug("Applying instrumentation patch for nodejs core module on require hook", {
            module: module2.name
          });
          return module2.patch(exports$1);
        }
      }
      return exports$1;
    }
    const version2 = this._extractPackageVersion(baseDir);
    module2.moduleVersion = version2;
    if (module2.name === name2) {
      if (isSupported(module2.supportedVersions, version2, module2.includePrerelease)) {
        if (typeof module2.patch === "function") {
          module2.moduleExports = exports$1;
          if (this._enabled) {
            this._diag.debug("Applying instrumentation patch for module on require hook", {
              module: module2.name,
              version: module2.moduleVersion,
              baseDir
            });
            return module2.patch(exports$1, module2.moduleVersion);
          }
        }
      }
      return exports$1;
    }
    const files = module2.files ?? [];
    const normalizedName = require$$0.normalize(name2);
    const supportedFileInstrumentations = files.filter((f) => f.name === normalizedName).filter((f) => isSupported(f.supportedVersions, version2, module2.includePrerelease));
    return supportedFileInstrumentations.reduce((patchedExports, file) => {
      file.moduleExports = patchedExports;
      if (this._enabled) {
        this._diag.debug("Applying instrumentation patch for nodejs module file on require hook", {
          module: module2.name,
          version: module2.moduleVersion,
          fileName: file.name,
          baseDir
        });
        return file.patch(patchedExports, module2.moduleVersion);
      }
      return patchedExports;
    }, exports$1);
  }
  enable() {
    if (this._enabled) {
      return;
    }
    this._enabled = true;
    if (this._hooks.length > 0) {
      for (const module2 of this._modules) {
        if (typeof module2.patch === "function" && module2.moduleExports) {
          this._diag.debug("Applying instrumentation patch for nodejs module on instrumentation enabled", {
            module: module2.name,
            version: module2.moduleVersion
          });
          module2.patch(module2.moduleExports, module2.moduleVersion);
        }
        for (const file of module2.files) {
          if (file.moduleExports) {
            this._diag.debug("Applying instrumentation patch for nodejs module file on instrumentation enabled", {
              module: module2.name,
              version: module2.moduleVersion,
              fileName: file.name
            });
            file.patch(file.moduleExports, module2.moduleVersion);
          }
        }
      }
      return;
    }
    this._warnOnPreloadedModules();
    for (const module2 of this._modules) {
      const hookFn = (exports$1, name2, baseDir) => {
        if (!baseDir && require$$0.isAbsolute(name2)) {
          const parsedPath = require$$0.parse(name2);
          name2 = parsedPath.name;
          baseDir = parsedPath.dir;
        }
        return this._onRequire(module2, exports$1, name2, baseDir);
      };
      const onRequire = (exports$1, name2, baseDir) => {
        return this._onRequire(module2, exports$1, name2, baseDir);
      };
      const hook = require$$0.isAbsolute(module2.name) ? new requireInTheMiddleExports.Hook([module2.name], { internals: true }, onRequire) : this._requireInTheMiddleSingleton.register(module2.name, onRequire);
      this._hooks.push(hook);
      const esmHook = new importInTheMiddleExports.Hook([module2.name], { internals: false }, hookFn);
      this._hooks.push(esmHook);
    }
  }
  disable() {
    if (!this._enabled) {
      return;
    }
    this._enabled = false;
    for (const module2 of this._modules) {
      if (typeof module2.unpatch === "function" && module2.moduleExports) {
        this._diag.debug("Removing instrumentation patch for nodejs module on instrumentation disabled", {
          module: module2.name,
          version: module2.moduleVersion
        });
        module2.unpatch(module2.moduleExports, module2.moduleVersion);
      }
      for (const file of module2.files) {
        if (file.moduleExports) {
          this._diag.debug("Removing instrumentation patch for nodejs module file on instrumentation disabled", {
            module: module2.name,
            version: module2.moduleVersion,
            fileName: file.name
          });
          file.unpatch(file.moduleExports, module2.moduleVersion);
        }
      }
    }
  }
  isEnabled() {
    return this._enabled;
  }
}
function isSupported(supportedVersions2, version2, includePrerelease) {
  if (typeof version2 === "undefined") {
    return supportedVersions2.includes("*");
  }
  return supportedVersions2.some((supportedVersion) => {
    return satisfies(version2, supportedVersion, { includePrerelease });
  });
}
class InstrumentationNodeModuleDefinition2 {
  name;
  supportedVersions;
  patch;
  unpatch;
  files;
  constructor(name2, supportedVersions2, patch, unpatch, files) {
    this.name = name2;
    this.supportedVersions = supportedVersions2;
    this.patch = patch;
    this.unpatch = unpatch;
    this.files = files || [];
  }
}
var package_default = {
  version: "7.2.0"
};
var majorVersion = package_default.version.split(".")[0];
var GLOBAL_INSTRUMENTATION_KEY = "PRISMA_INSTRUMENTATION";
var GLOBAL_VERSIONED_INSTRUMENTATION_KEY = `V${majorVersion}_PRISMA_INSTRUMENTATION`;
var globalThisWithPrismaInstrumentation = globalThis;
function getGlobalTracingHelper() {
  const versionedGlobal = globalThisWithPrismaInstrumentation[GLOBAL_VERSIONED_INSTRUMENTATION_KEY];
  if (versionedGlobal?.helper) {
    return versionedGlobal.helper;
  }
  const fallbackGlobal = globalThisWithPrismaInstrumentation[GLOBAL_INSTRUMENTATION_KEY];
  return fallbackGlobal?.helper;
}
function setGlobalTracingHelper(helper) {
  const globalValue = { helper };
  globalThisWithPrismaInstrumentation[GLOBAL_VERSIONED_INSTRUMENTATION_KEY] = globalValue;
  globalThisWithPrismaInstrumentation[GLOBAL_INSTRUMENTATION_KEY] = globalValue;
}
function clearGlobalTracingHelper() {
  delete globalThisWithPrismaInstrumentation[GLOBAL_VERSIONED_INSTRUMENTATION_KEY];
  delete globalThisWithPrismaInstrumentation[GLOBAL_INSTRUMENTATION_KEY];
}
var showAllTraces = process.env.PRISMA_SHOW_ALL_TRACES === "true";
var nonSampledTraceParent = `00-10-10-00`;
function engineSpanKindToOtelSpanKind(engineSpanKind) {
  switch (engineSpanKind) {
    case "client":
      return SpanKind.CLIENT;
    case "internal":
    default:
      return SpanKind.INTERNAL;
  }
}
var ActiveTracingHelper = class {
  tracerProvider;
  ignoreSpanTypes;
  constructor({ tracerProvider, ignoreSpanTypes }) {
    this.tracerProvider = tracerProvider;
    this.ignoreSpanTypes = ignoreSpanTypes;
  }
  isEnabled() {
    return true;
  }
  getTraceParent(context$1) {
    const span = trace.getSpanContext(context$1 ?? context.active());
    if (span) {
      return `00-${span.traceId}-${span.spanId}-0${span.traceFlags}`;
    }
    return nonSampledTraceParent;
  }
  dispatchEngineSpans(spans) {
    const tracer = this.tracerProvider.getTracer("prisma");
    const linkIds = /* @__PURE__ */ new Map();
    const roots = spans.filter((span) => span.parentId === null);
    for (const root of roots) {
      dispatchEngineSpan(tracer, root, spans, linkIds, this.ignoreSpanTypes);
    }
  }
  getActiveContext() {
    return context.active();
  }
  runInChildSpan(options, callback) {
    if (typeof options === "string") {
      options = { name: options };
    }
    if (options.internal && !showAllTraces) {
      return callback();
    }
    const tracer = this.tracerProvider.getTracer("prisma");
    const context2 = options.context ?? this.getActiveContext();
    const name2 = `prisma:client:${options.name}`;
    if (shouldIgnoreSpan(name2, this.ignoreSpanTypes)) {
      return callback();
    }
    if (options.active === false) {
      const span = tracer.startSpan(name2, options, context2);
      return endSpan(span, callback(span, context2));
    }
    return tracer.startActiveSpan(name2, options, (span) => endSpan(span, callback(span, context2)));
  }
};
function dispatchEngineSpan(tracer, engineSpan, allSpans, linkIds, ignoreSpanTypes) {
  if (shouldIgnoreSpan(engineSpan.name, ignoreSpanTypes)) return;
  const spanOptions = {
    attributes: engineSpan.attributes,
    kind: engineSpanKindToOtelSpanKind(engineSpan.kind),
    startTime: engineSpan.startTime
  };
  tracer.startActiveSpan(engineSpan.name, spanOptions, (span) => {
    linkIds.set(engineSpan.id, span.spanContext().spanId);
    if (engineSpan.links) {
      span.addLinks(
        engineSpan.links.flatMap((link) => {
          const linkedId = linkIds.get(link);
          if (!linkedId) {
            return [];
          }
          return {
            context: {
              spanId: linkedId,
              traceId: span.spanContext().traceId,
              traceFlags: span.spanContext().traceFlags
            }
          };
        })
      );
    }
    const children = allSpans.filter((s) => s.parentId === engineSpan.id);
    for (const child of children) {
      dispatchEngineSpan(tracer, child, allSpans, linkIds, ignoreSpanTypes);
    }
    span.end(engineSpan.endTime);
  });
}
function endSpan(span, result) {
  if (isPromiseLike(result)) {
    return result.then(
      (value) => {
        span.end();
        return value;
      },
      (reason) => {
        span.end();
        throw reason;
      }
    );
  }
  span.end();
  return result;
}
function isPromiseLike(value) {
  return value != null && typeof value["then"] === "function";
}
function shouldIgnoreSpan(spanName, ignoreSpanTypes) {
  return ignoreSpanTypes.some(
    (pattern) => typeof pattern === "string" ? pattern === spanName : pattern.test(spanName)
  );
}
var package_default2 = {
  name: "@prisma/instrumentation",
  version: "7.2.0"
};
var VERSION = package_default2.version;
var NAME = package_default2.name;
var MODULE_NAME = "@prisma/client";
var PrismaInstrumentation = class extends InstrumentationBase2 {
  tracerProvider;
  constructor(config2 = {}) {
    super(NAME, VERSION, config2);
  }
  setTracerProvider(tracerProvider) {
    this.tracerProvider = tracerProvider;
  }
  init() {
    const module2 = new InstrumentationNodeModuleDefinition2(MODULE_NAME, [VERSION]);
    return [module2];
  }
  enable() {
    const config2 = this._config;
    setGlobalTracingHelper(
      new ActiveTracingHelper({
        tracerProvider: this.tracerProvider ?? trace.getTracerProvider(),
        ignoreSpanTypes: config2.ignoreSpanTypes ?? []
      })
    );
  }
  disable() {
    clearGlobalTracingHelper();
  }
  isEnabled() {
    return getGlobalTracingHelper() !== void 0;
  }
};
const INTEGRATION_NAME$b = "Prisma";
function isPrismaV6TracingHelper(helper) {
  return !!helper && typeof helper === "object" && "dispatchEngineSpans" in helper;
}
function getPrismaTracingHelper() {
  const prismaInstrumentationObject = globalThis.PRISMA_INSTRUMENTATION;
  const prismaTracingHelper = prismaInstrumentationObject && typeof prismaInstrumentationObject === "object" && "helper" in prismaInstrumentationObject ? prismaInstrumentationObject.helper : void 0;
  return prismaTracingHelper;
}
class SentryPrismaInteropInstrumentation extends PrismaInstrumentation {
  constructor(options) {
    super(options?.instrumentationConfig);
  }
  enable() {
    super.enable();
    const prismaTracingHelper = getPrismaTracingHelper();
    if (isPrismaV6TracingHelper(prismaTracingHelper)) {
      prismaTracingHelper.createEngineSpan = (engineSpanEvent) => {
        const tracer = trace.getTracer("prismaV5Compatibility");
        const initialIdGenerator = tracer._idGenerator;
        if (!initialIdGenerator) {
          consoleSandbox(() => {
            console.warn(
              "[Sentry] Could not find _idGenerator on tracer, skipping Prisma v5 compatibility - some Prisma spans may be missing!"
            );
          });
          return;
        }
        try {
          engineSpanEvent.spans.forEach((engineSpan) => {
            const kind = engineSpanKindToOTELSpanKind(engineSpan.kind);
            const parentSpanId = engineSpan.parent_span_id;
            const spanId = engineSpan.span_id;
            const traceId = engineSpan.trace_id;
            const links = engineSpan.links?.map((link) => {
              return {
                context: {
                  traceId: link.trace_id,
                  spanId: link.span_id,
                  traceFlags: TraceFlags.SAMPLED
                }
              };
            });
            const ctx = trace.setSpanContext(context.active(), {
              traceId,
              spanId: parentSpanId,
              traceFlags: TraceFlags.SAMPLED
            });
            context.with(ctx, () => {
              const temporaryIdGenerator = {
                generateTraceId: () => {
                  return traceId;
                },
                generateSpanId: () => {
                  return spanId;
                }
              };
              tracer._idGenerator = temporaryIdGenerator;
              const span = tracer.startSpan(engineSpan.name, {
                kind,
                links,
                startTime: engineSpan.start_time,
                attributes: engineSpan.attributes
              });
              span.end(engineSpan.end_time);
              tracer._idGenerator = initialIdGenerator;
            });
          });
        } finally {
          tracer._idGenerator = initialIdGenerator;
        }
      };
    }
  }
}
function engineSpanKindToOTELSpanKind(engineSpanKind) {
  switch (engineSpanKind) {
    case "client":
      return SpanKind.CLIENT;
    case "internal":
    default:
      return SpanKind.INTERNAL;
  }
}
const instrumentPrisma = generateInstrumentOnce(INTEGRATION_NAME$b, (options) => {
  return new SentryPrismaInteropInstrumentation(options);
});
const prismaIntegration = defineIntegration((options) => {
  return {
    name: INTEGRATION_NAME$b,
    setupOnce() {
      instrumentPrisma(options);
    },
    setup(client) {
      if (!getPrismaTracingHelper()) {
        return;
      }
      client.on("spanStart", (span) => {
        const spanJSON = spanToJSON(span);
        if (spanJSON.description?.startsWith("prisma:")) {
          span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, "auto.db.otel.prisma");
        }
        if (spanJSON.description === "prisma:engine:db_query" && spanJSON.data["db.query.text"]) {
          span.updateName(spanJSON.data["db.query.text"]);
        }
        if (spanJSON.description === "prisma:engine:db_query" && !spanJSON.data["db.system"]) {
          span.setAttribute("db.system", "prisma");
        }
      });
    }
  };
});
var src$7 = {};
var instrumentation$6 = {};
var version$7 = {};
var hasRequiredVersion$7;
function requireVersion$7() {
  if (hasRequiredVersion$7) return version$7;
  hasRequiredVersion$7 = 1;
  Object.defineProperty(version$7, "__esModule", { value: true });
  version$7.PACKAGE_NAME = version$7.PACKAGE_VERSION = void 0;
  version$7.PACKAGE_VERSION = "0.57.0";
  version$7.PACKAGE_NAME = "@opentelemetry/instrumentation-hapi";
  return version$7;
}
var internalTypes$2 = {};
var hasRequiredInternalTypes$2;
function requireInternalTypes$2() {
  if (hasRequiredInternalTypes$2) return internalTypes$2;
  hasRequiredInternalTypes$2 = 1;
  Object.defineProperty(internalTypes$2, "__esModule", { value: true });
  internalTypes$2.HapiLifecycleMethodNames = internalTypes$2.HapiLayerType = internalTypes$2.handlerPatched = internalTypes$2.HapiComponentName = void 0;
  internalTypes$2.HapiComponentName = "@hapi/hapi";
  internalTypes$2.handlerPatched = Symbol("hapi-handler-patched");
  internalTypes$2.HapiLayerType = {
    ROUTER: "router",
    PLUGIN: "plugin",
    EXT: "server.ext"
  };
  internalTypes$2.HapiLifecycleMethodNames = /* @__PURE__ */ new Set([
    "onPreAuth",
    "onCredentials",
    "onPostAuth",
    "onPreHandler",
    "onPostHandler",
    "onPreResponse",
    "onRequest"
  ]);
  return internalTypes$2;
}
var utils$5 = {};
var semconv$3 = {};
var hasRequiredSemconv$3;
function requireSemconv$3() {
  if (hasRequiredSemconv$3) return semconv$3;
  hasRequiredSemconv$3 = 1;
  Object.defineProperty(semconv$3, "__esModule", { value: true });
  semconv$3.ATTR_HTTP_METHOD = void 0;
  semconv$3.ATTR_HTTP_METHOD = "http.method";
  return semconv$3;
}
var AttributeNames$3 = {};
var hasRequiredAttributeNames$2;
function requireAttributeNames$2() {
  if (hasRequiredAttributeNames$2) return AttributeNames$3;
  hasRequiredAttributeNames$2 = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.AttributeNames = void 0;
    (function(AttributeNames2) {
      AttributeNames2["HAPI_TYPE"] = "hapi.type";
      AttributeNames2["PLUGIN_NAME"] = "hapi.plugin.name";
      AttributeNames2["EXT_TYPE"] = "server.ext.type";
    })(exports$1.AttributeNames || (exports$1.AttributeNames = {}));
  })(AttributeNames$3);
  return AttributeNames$3;
}
var hasRequiredUtils$5;
function requireUtils$5() {
  if (hasRequiredUtils$5) return utils$5;
  hasRequiredUtils$5 = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.getPluginFromInput = exports$1.getExtMetadata = exports$1.getRouteMetadata = exports$1.isPatchableExtMethod = exports$1.isDirectExtInput = exports$1.isLifecycleExtEventObj = exports$1.isLifecycleExtType = exports$1.getPluginName = void 0;
    const semantic_conventions_1 = require$$2$1;
    const semconv_1 = requireSemconv$3();
    const internal_types_1 = requireInternalTypes$2();
    const AttributeNames_1 = requireAttributeNames$2();
    const instrumentation_1 = require$$2;
    function getPluginName(plugin) {
      if (plugin.name) {
        return plugin.name;
      } else {
        return plugin.pkg.name;
      }
    }
    exports$1.getPluginName = getPluginName;
    const isLifecycleExtType = (variableToCheck) => {
      return typeof variableToCheck === "string" && internal_types_1.HapiLifecycleMethodNames.has(variableToCheck);
    };
    exports$1.isLifecycleExtType = isLifecycleExtType;
    const isLifecycleExtEventObj = (variableToCheck) => {
      const event = variableToCheck?.type;
      return event !== void 0 && (0, exports$1.isLifecycleExtType)(event);
    };
    exports$1.isLifecycleExtEventObj = isLifecycleExtEventObj;
    const isDirectExtInput = (variableToCheck) => {
      return Array.isArray(variableToCheck) && variableToCheck.length <= 3 && (0, exports$1.isLifecycleExtType)(variableToCheck[0]) && typeof variableToCheck[1] === "function";
    };
    exports$1.isDirectExtInput = isDirectExtInput;
    const isPatchableExtMethod = (variableToCheck) => {
      return !Array.isArray(variableToCheck);
    };
    exports$1.isPatchableExtMethod = isPatchableExtMethod;
    const getRouteMetadata = (route, semconvStability, pluginName) => {
      const attributes = {
        [semantic_conventions_1.ATTR_HTTP_ROUTE]: route.path
      };
      if (semconvStability & instrumentation_1.SemconvStability.OLD) {
        attributes[semconv_1.ATTR_HTTP_METHOD] = route.method;
      }
      if (semconvStability & instrumentation_1.SemconvStability.STABLE) {
        attributes[semantic_conventions_1.ATTR_HTTP_REQUEST_METHOD] = route.method;
      }
      let name2;
      if (pluginName) {
        attributes[AttributeNames_1.AttributeNames.HAPI_TYPE] = internal_types_1.HapiLayerType.PLUGIN;
        attributes[AttributeNames_1.AttributeNames.PLUGIN_NAME] = pluginName;
        name2 = `${pluginName}: route - ${route.path}`;
      } else {
        attributes[AttributeNames_1.AttributeNames.HAPI_TYPE] = internal_types_1.HapiLayerType.ROUTER;
        name2 = `route - ${route.path}`;
      }
      return { attributes, name: name2 };
    };
    exports$1.getRouteMetadata = getRouteMetadata;
    const getExtMetadata = (extPoint, pluginName) => {
      if (pluginName) {
        return {
          attributes: {
            [AttributeNames_1.AttributeNames.EXT_TYPE]: extPoint,
            [AttributeNames_1.AttributeNames.HAPI_TYPE]: internal_types_1.HapiLayerType.EXT,
            [AttributeNames_1.AttributeNames.PLUGIN_NAME]: pluginName
          },
          name: `${pluginName}: ext - ${extPoint}`
        };
      }
      return {
        attributes: {
          [AttributeNames_1.AttributeNames.EXT_TYPE]: extPoint,
          [AttributeNames_1.AttributeNames.HAPI_TYPE]: internal_types_1.HapiLayerType.EXT
        },
        name: `ext - ${extPoint}`
      };
    };
    exports$1.getExtMetadata = getExtMetadata;
    const getPluginFromInput = (pluginObj) => {
      if ("plugin" in pluginObj) {
        if ("plugin" in pluginObj.plugin) {
          return pluginObj.plugin.plugin;
        }
        return pluginObj.plugin;
      }
      return pluginObj;
    };
    exports$1.getPluginFromInput = getPluginFromInput;
  })(utils$5);
  return utils$5;
}
var hasRequiredInstrumentation$6;
function requireInstrumentation$6() {
  if (hasRequiredInstrumentation$6) return instrumentation$6;
  hasRequiredInstrumentation$6 = 1;
  Object.defineProperty(instrumentation$6, "__esModule", { value: true });
  instrumentation$6.HapiInstrumentation = void 0;
  const api = require$$0$2;
  const core_1 = require$$1$1;
  const instrumentation_1 = require$$2;
  const version_1 = requireVersion$7();
  const internal_types_1 = requireInternalTypes$2();
  const utils_1 = requireUtils$5();
  class HapiInstrumentation extends instrumentation_1.InstrumentationBase {
    _semconvStability;
    constructor(config2 = {}) {
      super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config2);
      this._semconvStability = (0, instrumentation_1.semconvStabilityFromStr)("http", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
    }
    init() {
      return new instrumentation_1.InstrumentationNodeModuleDefinition(internal_types_1.HapiComponentName, [">=17.0.0 <22"], (module2) => {
        const moduleExports = module2[Symbol.toStringTag] === "Module" ? module2.default : module2;
        if (!(0, instrumentation_1.isWrapped)(moduleExports.server)) {
          this._wrap(moduleExports, "server", this._getServerPatch.bind(this));
        }
        if (!(0, instrumentation_1.isWrapped)(moduleExports.Server)) {
          this._wrap(moduleExports, "Server", this._getServerPatch.bind(this));
        }
        return moduleExports;
      }, (module2) => {
        const moduleExports = module2[Symbol.toStringTag] === "Module" ? module2.default : module2;
        this._massUnwrap([moduleExports], ["server", "Server"]);
      });
    }
    /**
     * Patches the Hapi.server and Hapi.Server functions in order to instrument
     * the server.route, server.ext, and server.register functions via calls to the
     * @function _getServerRoutePatch, @function _getServerExtPatch, and
     * @function _getServerRegisterPatch functions
     * @param original - the original Hapi Server creation function
     */
    _getServerPatch(original) {
      const instrumentation2 = this;
      const self = this;
      return function server(opts) {
        const newServer = original.apply(this, [opts]);
        self._wrap(newServer, "route", (originalRouter) => {
          return instrumentation2._getServerRoutePatch.bind(instrumentation2)(originalRouter);
        });
        self._wrap(newServer, "ext", (originalExtHandler) => {
          return instrumentation2._getServerExtPatch.bind(instrumentation2)(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            originalExtHandler
          );
        });
        self._wrap(
          newServer,
          "register",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          instrumentation2._getServerRegisterPatch.bind(instrumentation2)
        );
        return newServer;
      };
    }
    /**
     * Patches the plugin register function used by the Hapi Server. This function
     * goes through each plugin that is being registered and adds instrumentation
     * via a call to the @function _wrapRegisterHandler function.
     * @param {RegisterFunction<T>} original - the original register function which
     * registers each plugin on the server
     */
    _getServerRegisterPatch(original) {
      const instrumentation2 = this;
      return function register(pluginInput, options) {
        if (Array.isArray(pluginInput)) {
          for (const pluginObj of pluginInput) {
            const plugin = (0, utils_1.getPluginFromInput)(pluginObj);
            instrumentation2._wrapRegisterHandler(plugin);
          }
        } else {
          const plugin = (0, utils_1.getPluginFromInput)(pluginInput);
          instrumentation2._wrapRegisterHandler(plugin);
        }
        return original.apply(this, [pluginInput, options]);
      };
    }
    /**
     * Patches the Server.ext function which adds extension methods to the specified
     * point along the request lifecycle. This function accepts the full range of
     * accepted input into the standard Hapi `server.ext` function. For each extension,
     * it adds instrumentation to the handler via a call to the @function _wrapExtMethods
     * function.
     * @param original - the original ext function which adds the extension method to the server
     * @param {string} [pluginName] - if present, represents the name of the plugin responsible
     * for adding this server extension. Else, signifies that the extension was added directly
     */
    _getServerExtPatch(original, pluginName) {
      const instrumentation2 = this;
      return function ext(...args) {
        if (Array.isArray(args[0])) {
          const eventsList = args[0];
          for (let i = 0; i < eventsList.length; i++) {
            const eventObj = eventsList[i];
            if ((0, utils_1.isLifecycleExtType)(eventObj.type)) {
              const lifecycleEventObj = eventObj;
              const handler = instrumentation2._wrapExtMethods(lifecycleEventObj.method, eventObj.type, pluginName);
              lifecycleEventObj.method = handler;
              eventsList[i] = lifecycleEventObj;
            }
          }
          return original.apply(this, args);
        } else if ((0, utils_1.isDirectExtInput)(args)) {
          const extInput = args;
          const method = extInput[1];
          const handler = instrumentation2._wrapExtMethods(method, extInput[0], pluginName);
          return original.apply(this, [extInput[0], handler, extInput[2]]);
        } else if ((0, utils_1.isLifecycleExtEventObj)(args[0])) {
          const lifecycleEventObj = args[0];
          const handler = instrumentation2._wrapExtMethods(lifecycleEventObj.method, lifecycleEventObj.type, pluginName);
          lifecycleEventObj.method = handler;
          return original.call(this, lifecycleEventObj);
        }
        return original.apply(this, args);
      };
    }
    /**
     * Patches the Server.route function. This function accepts either one or an array
     * of Hapi.ServerRoute objects and adds instrumentation on each route via a call to
     * the @function _wrapRouteHandler function.
     * @param {HapiServerRouteInputMethod} original - the original route function which adds
     * the route to the server
     * @param {string} [pluginName] - if present, represents the name of the plugin responsible
     * for adding this server route. Else, signifies that the route was added directly
     */
    _getServerRoutePatch(original, pluginName) {
      const instrumentation2 = this;
      return function route(route) {
        if (Array.isArray(route)) {
          for (let i = 0; i < route.length; i++) {
            const newRoute = instrumentation2._wrapRouteHandler.call(instrumentation2, route[i], pluginName);
            route[i] = newRoute;
          }
        } else {
          route = instrumentation2._wrapRouteHandler.call(instrumentation2, route, pluginName);
        }
        return original.apply(this, [route]);
      };
    }
    /**
     * Wraps newly registered plugins to add instrumentation to the plugin's clone of
     * the original server. Specifically, wraps the server.route and server.ext functions
     * via calls to @function _getServerRoutePatch and @function _getServerExtPatch
     * @param {Hapi.Plugin<T>} plugin - the new plugin which is being instrumented
     */
    _wrapRegisterHandler(plugin) {
      const instrumentation2 = this;
      const pluginName = (0, utils_1.getPluginName)(plugin);
      const oldRegister = plugin.register;
      const self = this;
      const newRegisterHandler = function(server, options) {
        self._wrap(server, "route", (original) => {
          return instrumentation2._getServerRoutePatch.bind(instrumentation2)(original, pluginName);
        });
        self._wrap(server, "ext", (originalExtHandler) => {
          return instrumentation2._getServerExtPatch.bind(instrumentation2)(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            originalExtHandler,
            pluginName
          );
        });
        return oldRegister.call(this, server, options);
      };
      plugin.register = newRegisterHandler;
    }
    /**
     * Wraps request extension methods to add instrumentation to each new extension handler.
     * Patches each individual extension in order to create the
     * span and propagate context. It does not create spans when there is no parent span.
     * @param {PatchableExtMethod | PatchableExtMethod[]} method - the request extension
     * handler which is being instrumented
     * @param {Hapi.ServerRequestExtType} extPoint - the point in the Hapi request lifecycle
     * which this extension targets
     * @param {string} [pluginName] - if present, represents the name of the plugin responsible
     * for adding this server route. Else, signifies that the route was added directly
     */
    _wrapExtMethods(method, extPoint, pluginName) {
      const instrumentation2 = this;
      if (method instanceof Array) {
        for (let i = 0; i < method.length; i++) {
          method[i] = instrumentation2._wrapExtMethods(method[i], extPoint);
        }
        return method;
      } else if ((0, utils_1.isPatchableExtMethod)(method)) {
        if (method[internal_types_1.handlerPatched] === true)
          return method;
        method[internal_types_1.handlerPatched] = true;
        const newHandler = async function(...params) {
          if (api.trace.getSpan(api.context.active()) === void 0) {
            return await method.apply(this, params);
          }
          const metadata = (0, utils_1.getExtMetadata)(extPoint, pluginName);
          const span = instrumentation2.tracer.startSpan(metadata.name, {
            attributes: metadata.attributes
          });
          try {
            return await api.context.with(api.trace.setSpan(api.context.active(), span), method, void 0, ...params);
          } catch (err) {
            span.recordException(err);
            span.setStatus({
              code: api.SpanStatusCode.ERROR,
              message: err.message
            });
            throw err;
          } finally {
            span.end();
          }
        };
        return newHandler;
      }
      return method;
    }
    /**
     * Patches each individual route handler method in order to create the
     * span and propagate context. It does not create spans when there is no parent span.
     * @param {PatchableServerRoute} route - the route handler which is being instrumented
     * @param {string} [pluginName] - if present, represents the name of the plugin responsible
     * for adding this server route. Else, signifies that the route was added directly
     */
    _wrapRouteHandler(route, pluginName) {
      const instrumentation2 = this;
      if (route[internal_types_1.handlerPatched] === true)
        return route;
      route[internal_types_1.handlerPatched] = true;
      const wrapHandler = (oldHandler) => {
        return async function(...params) {
          if (api.trace.getSpan(api.context.active()) === void 0) {
            return await oldHandler.call(this, ...params);
          }
          const rpcMetadata = (0, core_1.getRPCMetadata)(api.context.active());
          if (rpcMetadata?.type === core_1.RPCType.HTTP) {
            rpcMetadata.route = route.path;
          }
          const metadata = (0, utils_1.getRouteMetadata)(route, instrumentation2._semconvStability, pluginName);
          const span = instrumentation2.tracer.startSpan(metadata.name, {
            attributes: metadata.attributes
          });
          try {
            return await api.context.with(api.trace.setSpan(api.context.active(), span), () => oldHandler.call(this, ...params));
          } catch (err) {
            span.recordException(err);
            span.setStatus({
              code: api.SpanStatusCode.ERROR,
              message: err.message
            });
            throw err;
          } finally {
            span.end();
          }
        };
      };
      if (typeof route.handler === "function") {
        route.handler = wrapHandler(route.handler);
      } else if (typeof route.options === "function") {
        const oldOptions = route.options;
        route.options = function(server) {
          const options = oldOptions(server);
          if (typeof options.handler === "function") {
            options.handler = wrapHandler(options.handler);
          }
          return options;
        };
      } else if (typeof route.options?.handler === "function") {
        route.options.handler = wrapHandler(route.options.handler);
      }
      return route;
    }
  }
  instrumentation$6.HapiInstrumentation = HapiInstrumentation;
  return instrumentation$6;
}
var hasRequiredSrc$7;
function requireSrc$7() {
  if (hasRequiredSrc$7) return src$7;
  hasRequiredSrc$7 = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.AttributeNames = exports$1.HapiInstrumentation = void 0;
    var instrumentation_1 = requireInstrumentation$6();
    Object.defineProperty(exports$1, "HapiInstrumentation", { enumerable: true, get: function() {
      return instrumentation_1.HapiInstrumentation;
    } });
    var AttributeNames_1 = requireAttributeNames$2();
    Object.defineProperty(exports$1, "AttributeNames", { enumerable: true, get: function() {
      return AttributeNames_1.AttributeNames;
    } });
  })(src$7);
  return src$7;
}
var srcExports$7 = requireSrc$7();
const INTEGRATION_NAME$a = "Hapi";
const instrumentHapi = generateInstrumentOnce(INTEGRATION_NAME$a, () => new srcExports$7.HapiInstrumentation());
const _hapiIntegration = (() => {
  return {
    name: INTEGRATION_NAME$a,
    setupOnce() {
      instrumentHapi();
    }
  };
});
const hapiIntegration = defineIntegration(_hapiIntegration);
function isErrorEvent(event) {
  return !!(event && typeof event === "object" && "error" in event && event.error);
}
function sendErrorToSentry(errorData) {
  captureException(errorData, {
    mechanism: {
      type: "auto.function.hapi",
      handled: false
    }
  });
}
const hapiErrorPlugin = {
  name: "SentryHapiErrorPlugin",
  version: SDK_VERSION,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: async function(serverArg) {
    const server = serverArg;
    server.events.on({ name: "request", channels: ["error"] }, (request, event) => {
      if (getIsolationScope() !== getDefaultIsolationScope()) {
        const route = request.route;
        if (route.path) {
          getIsolationScope().setTransactionName(`${route.method.toUpperCase()} ${route.path}`);
        }
      } else {
        DEBUG_BUILD$2 && debug.warn("Isolation scope is still the default isolation scope - skipping setting transactionName");
      }
      if (isErrorEvent(event)) {
        sendErrorToSentry(event.error);
      }
    });
  }
};
async function setupHapiErrorHandler(server) {
  await server.register(hapiErrorPlugin);
  const client = getClient();
  if (client) {
    client.on("spanStart", (span) => {
      addHapiSpanAttributes(span);
    });
  }
  ensureIsWrapped(server.register, "hapi");
}
function addHapiSpanAttributes(span) {
  const attributes = spanToJSON(span).data;
  const type = attributes["hapi.type"];
  if (attributes[SEMANTIC_ATTRIBUTE_SENTRY_OP] || !type) {
    return;
  }
  span.setAttributes({
    [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.otel.hapi",
    [SEMANTIC_ATTRIBUTE_SENTRY_OP]: `${type}.hapi`
  });
}
const AttributeNames$2 = {
  HONO_TYPE: "hono.type",
  HONO_NAME: "hono.name"
};
const HonoTypes = {
  MIDDLEWARE: "middleware",
  REQUEST_HANDLER: "request_handler"
};
const PACKAGE_NAME = "@sentry/instrumentation-hono";
const PACKAGE_VERSION = "0.0.1";
class HonoInstrumentation extends InstrumentationBase$2 {
  constructor(config2 = {}) {
    super(PACKAGE_NAME, PACKAGE_VERSION, config2);
  }
  /**
   * Initialize the instrumentation.
   */
  init() {
    return [
      new InstrumentationNodeModuleDefinition$2("hono", [">=4.0.0 <5"], (moduleExports) => this._patch(moduleExports))
    ];
  }
  /**
   * Patches the module exports to instrument Hono.
   */
  _patch(moduleExports) {
    const instrumentation2 = this;
    class WrappedHono extends moduleExports.Hono {
      constructor(...args) {
        super(...args);
        instrumentation2._wrap(this, "get", instrumentation2._patchHandler());
        instrumentation2._wrap(this, "post", instrumentation2._patchHandler());
        instrumentation2._wrap(this, "put", instrumentation2._patchHandler());
        instrumentation2._wrap(this, "delete", instrumentation2._patchHandler());
        instrumentation2._wrap(this, "options", instrumentation2._patchHandler());
        instrumentation2._wrap(this, "patch", instrumentation2._patchHandler());
        instrumentation2._wrap(this, "all", instrumentation2._patchHandler());
        instrumentation2._wrap(this, "on", instrumentation2._patchOnHandler());
        instrumentation2._wrap(this, "use", instrumentation2._patchMiddlewareHandler());
      }
    }
    try {
      moduleExports.Hono = WrappedHono;
    } catch {
      return { ...moduleExports, Hono: WrappedHono };
    }
    return moduleExports;
  }
  /**
   * Patches the route handler to instrument it.
   */
  _patchHandler() {
    const instrumentation2 = this;
    return function(original) {
      return function wrappedHandler(...args) {
        if (typeof args[0] === "string") {
          const path = args[0];
          if (args.length === 1) {
            return original.apply(this, [path]);
          }
          const handlers = args.slice(1);
          return original.apply(this, [
            path,
            ...handlers.map((handler) => instrumentation2._wrapHandler(handler))
          ]);
        }
        return original.apply(
          this,
          args.map((handler) => instrumentation2._wrapHandler(handler))
        );
      };
    };
  }
  /**
   * Patches the 'on' handler to instrument it.
   */
  _patchOnHandler() {
    const instrumentation2 = this;
    return function(original) {
      return function wrappedHandler(...args) {
        const handlers = args.slice(2);
        return original.apply(this, [
          ...args.slice(0, 2),
          ...handlers.map((handler) => instrumentation2._wrapHandler(handler))
        ]);
      };
    };
  }
  /**
   * Patches the middleware handler to instrument it.
   */
  _patchMiddlewareHandler() {
    const instrumentation2 = this;
    return function(original) {
      return function wrappedHandler(...args) {
        if (typeof args[0] === "string") {
          const path = args[0];
          if (args.length === 1) {
            return original.apply(this, [path]);
          }
          const handlers = args.slice(1);
          return original.apply(this, [
            path,
            ...handlers.map((handler) => instrumentation2._wrapHandler(handler))
          ]);
        }
        return original.apply(
          this,
          args.map((handler) => instrumentation2._wrapHandler(handler))
        );
      };
    };
  }
  /**
   * Wraps a handler or middleware handler to apply instrumentation.
   */
  _wrapHandler(handler) {
    const instrumentation2 = this;
    return function(c, next) {
      if (!instrumentation2.isEnabled()) {
        return handler.apply(this, [c, next]);
      }
      const path = c.req.path;
      const span = instrumentation2.tracer.startSpan(path);
      return context.with(trace.setSpan(context.active(), span), () => {
        return instrumentation2._safeExecute(
          () => {
            const result = handler.apply(this, [c, next]);
            if (isThenable(result)) {
              return result.then((result2) => {
                const type = instrumentation2._determineHandlerType(result2);
                span.setAttributes({
                  [AttributeNames$2.HONO_TYPE]: type,
                  [AttributeNames$2.HONO_NAME]: type === HonoTypes.REQUEST_HANDLER ? path : handler.name || "anonymous"
                });
                instrumentation2.getConfig().responseHook?.(span);
                return result2;
              });
            } else {
              const type = instrumentation2._determineHandlerType(result);
              span.setAttributes({
                [AttributeNames$2.HONO_TYPE]: type,
                [AttributeNames$2.HONO_NAME]: type === HonoTypes.REQUEST_HANDLER ? path : handler.name || "anonymous"
              });
              instrumentation2.getConfig().responseHook?.(span);
              return result;
            }
          },
          () => span.end(),
          (error2) => {
            instrumentation2._handleError(span, error2);
            span.end();
          }
        );
      });
    };
  }
  /**
   * Safely executes a function and handles errors.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _safeExecute(execute, onSuccess, onFailure) {
    try {
      const result = execute();
      if (isThenable(result)) {
        result.then(
          () => onSuccess(),
          (error2) => onFailure(error2)
        );
      } else {
        onSuccess();
      }
      return result;
    } catch (error2) {
      onFailure(error2);
      throw error2;
    }
  }
  /**
   * Determines the handler type based on the result.
   * @param result
   * @private
   */
  _determineHandlerType(result) {
    return result === void 0 ? HonoTypes.MIDDLEWARE : HonoTypes.REQUEST_HANDLER;
  }
  /**
   * Handles errors by setting the span status and recording the exception.
   */
  _handleError(span, error2) {
    if (error2 instanceof Error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error2.message
      });
      span.recordException(error2);
    }
  }
}
const INTEGRATION_NAME$9 = "Hono";
function addHonoSpanAttributes(span) {
  const attributes = spanToJSON(span).data;
  const type = attributes[AttributeNames$2.HONO_TYPE];
  if (attributes[SEMANTIC_ATTRIBUTE_SENTRY_OP] || !type) {
    return;
  }
  span.setAttributes({
    [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.otel.hono",
    [SEMANTIC_ATTRIBUTE_SENTRY_OP]: `${type}.hono`
  });
  const name2 = attributes[AttributeNames$2.HONO_NAME];
  if (typeof name2 === "string") {
    span.updateName(name2);
  }
  if (getIsolationScope() === getDefaultIsolationScope()) {
    DEBUG_BUILD$2 && debug.warn("Isolation scope is default isolation scope - skipping setting transactionName");
    return;
  }
  const route = attributes[ATTR_HTTP_ROUTE];
  const method = attributes[ATTR_HTTP_REQUEST_METHOD];
  if (typeof route === "string" && typeof method === "string") {
    getIsolationScope().setTransactionName(`${method} ${route}`);
  }
}
const instrumentHono = generateInstrumentOnce(
  INTEGRATION_NAME$9,
  () => new HonoInstrumentation({
    responseHook: (span) => {
      addHonoSpanAttributes(span);
    }
  })
);
const _honoIntegration = (() => {
  return {
    name: INTEGRATION_NAME$9,
    setupOnce() {
      instrumentHono();
    }
  };
});
const honoIntegration = defineIntegration(_honoIntegration);
function honoRequestHandler() {
  return async function sentryRequestMiddleware(context2, next) {
    const normalizedRequest = httpRequestToRequestData(context2.req);
    getIsolationScope().setSDKProcessingMetadata({ normalizedRequest });
    await next();
  };
}
function defaultShouldHandleError(context2) {
  const statusCode = context2.res.status;
  return statusCode >= 500;
}
function honoErrorHandler(options) {
  return async function sentryErrorMiddleware(context2, next) {
    await next();
    const shouldHandleError = options?.shouldHandleError || defaultShouldHandleError;
    if (shouldHandleError(context2)) {
      context2.res.sentry = captureException(context2.error, {
        mechanism: {
          type: "auto.middleware.hono",
          handled: false
        }
      });
    }
  };
}
function setupHonoErrorHandler(app2, options) {
  app2.use(honoRequestHandler());
  app2.use(honoErrorHandler(options));
  ensureIsWrapped(app2.use, "hono");
}
var src$6 = {};
var instrumentation$5 = {};
var types$1 = {};
var hasRequiredTypes$1;
function requireTypes$1() {
  if (hasRequiredTypes$1) return types$1;
  hasRequiredTypes$1 = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.KoaLayerType = void 0;
    (function(KoaLayerType) {
      KoaLayerType["ROUTER"] = "router";
      KoaLayerType["MIDDLEWARE"] = "middleware";
    })(exports$1.KoaLayerType || (exports$1.KoaLayerType = {}));
  })(types$1);
  return types$1;
}
var version$6 = {};
var hasRequiredVersion$6;
function requireVersion$6() {
  if (hasRequiredVersion$6) return version$6;
  hasRequiredVersion$6 = 1;
  Object.defineProperty(version$6, "__esModule", { value: true });
  version$6.PACKAGE_NAME = version$6.PACKAGE_VERSION = void 0;
  version$6.PACKAGE_VERSION = "0.59.0";
  version$6.PACKAGE_NAME = "@opentelemetry/instrumentation-koa";
  return version$6;
}
var utils$4 = {};
var AttributeNames$1 = {};
var hasRequiredAttributeNames$1;
function requireAttributeNames$1() {
  if (hasRequiredAttributeNames$1) return AttributeNames$1;
  hasRequiredAttributeNames$1 = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.AttributeNames = void 0;
    (function(AttributeNames2) {
      AttributeNames2["KOA_TYPE"] = "koa.type";
      AttributeNames2["KOA_NAME"] = "koa.name";
    })(exports$1.AttributeNames || (exports$1.AttributeNames = {}));
  })(AttributeNames$1);
  return AttributeNames$1;
}
var hasRequiredUtils$4;
function requireUtils$4() {
  if (hasRequiredUtils$4) return utils$4;
  hasRequiredUtils$4 = 1;
  Object.defineProperty(utils$4, "__esModule", { value: true });
  utils$4.isLayerIgnored = utils$4.getMiddlewareMetadata = void 0;
  const types_1 = requireTypes$1();
  const AttributeNames_1 = requireAttributeNames$1();
  const semantic_conventions_1 = require$$2$1;
  const getMiddlewareMetadata = (context2, layer, isRouter, layerPath) => {
    if (isRouter) {
      return {
        attributes: {
          [AttributeNames_1.AttributeNames.KOA_NAME]: layerPath?.toString(),
          [AttributeNames_1.AttributeNames.KOA_TYPE]: types_1.KoaLayerType.ROUTER,
          [semantic_conventions_1.ATTR_HTTP_ROUTE]: layerPath?.toString()
        },
        name: context2._matchedRouteName || `router - ${layerPath}`
      };
    } else {
      return {
        attributes: {
          [AttributeNames_1.AttributeNames.KOA_NAME]: layer.name ?? "middleware",
          [AttributeNames_1.AttributeNames.KOA_TYPE]: types_1.KoaLayerType.MIDDLEWARE
        },
        name: `middleware - ${layer.name}`
      };
    }
  };
  utils$4.getMiddlewareMetadata = getMiddlewareMetadata;
  const isLayerIgnored = (type, config2) => {
    return !!(Array.isArray(config2?.ignoreLayersType) && config2?.ignoreLayersType?.includes(type));
  };
  utils$4.isLayerIgnored = isLayerIgnored;
  return utils$4;
}
var internalTypes$1 = {};
var hasRequiredInternalTypes$1;
function requireInternalTypes$1() {
  if (hasRequiredInternalTypes$1) return internalTypes$1;
  hasRequiredInternalTypes$1 = 1;
  Object.defineProperty(internalTypes$1, "__esModule", { value: true });
  internalTypes$1.kLayerPatched = void 0;
  internalTypes$1.kLayerPatched = Symbol("koa-layer-patched");
  return internalTypes$1;
}
var hasRequiredInstrumentation$5;
function requireInstrumentation$5() {
  if (hasRequiredInstrumentation$5) return instrumentation$5;
  hasRequiredInstrumentation$5 = 1;
  Object.defineProperty(instrumentation$5, "__esModule", { value: true });
  instrumentation$5.KoaInstrumentation = void 0;
  const api = require$$0$2;
  const instrumentation_1 = require$$2;
  const types_1 = requireTypes$1();
  const version_1 = requireVersion$6();
  const utils_1 = requireUtils$4();
  const core_1 = require$$1$1;
  const internal_types_1 = requireInternalTypes$1();
  class KoaInstrumentation extends instrumentation_1.InstrumentationBase {
    constructor(config2 = {}) {
      super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config2);
    }
    init() {
      return new instrumentation_1.InstrumentationNodeModuleDefinition("koa", [">=2.0.0 <4"], (module2) => {
        const moduleExports = module2[Symbol.toStringTag] === "Module" ? module2.default : module2;
        if (moduleExports == null) {
          return moduleExports;
        }
        if ((0, instrumentation_1.isWrapped)(moduleExports.prototype.use)) {
          this._unwrap(moduleExports.prototype, "use");
        }
        this._wrap(moduleExports.prototype, "use", this._getKoaUsePatch.bind(this));
        return module2;
      }, (module2) => {
        const moduleExports = module2[Symbol.toStringTag] === "Module" ? module2.default : module2;
        if ((0, instrumentation_1.isWrapped)(moduleExports.prototype.use)) {
          this._unwrap(moduleExports.prototype, "use");
        }
      });
    }
    /**
     * Patches the Koa.use function in order to instrument each original
     * middleware layer which is introduced
     * @param {KoaMiddleware} middleware - the original middleware function
     */
    _getKoaUsePatch(original) {
      const plugin = this;
      return function use(middlewareFunction) {
        let patchedFunction;
        if (middlewareFunction.router) {
          patchedFunction = plugin._patchRouterDispatch(middlewareFunction);
        } else {
          patchedFunction = plugin._patchLayer(middlewareFunction, false);
        }
        return original.apply(this, [patchedFunction]);
      };
    }
    /**
     * Patches the dispatch function used by @koa/router. This function
     * goes through each routed middleware and adds instrumentation via a call
     * to the @function _patchLayer function.
     * @param {KoaMiddleware} dispatchLayer - the original dispatch function which dispatches
     * routed middleware
     */
    _patchRouterDispatch(dispatchLayer) {
      api.diag.debug("Patching @koa/router dispatch");
      const router = dispatchLayer.router;
      const routesStack = router?.stack ?? [];
      for (const pathLayer of routesStack) {
        const path = pathLayer.path;
        const pathStack = pathLayer.stack;
        for (let j = 0; j < pathStack.length; j++) {
          const routedMiddleware = pathStack[j];
          pathStack[j] = this._patchLayer(routedMiddleware, true, path);
        }
      }
      return dispatchLayer;
    }
    /**
     * Patches each individual @param middlewareLayer function in order to create the
     * span and propagate context. It does not create spans when there is no parent span.
     * @param {KoaMiddleware} middlewareLayer - the original middleware function.
     * @param {boolean} isRouter - tracks whether the original middleware function
     * was dispatched by the router originally
     * @param {string?} layerPath - if present, provides additional data from the
     * router about the routed path which the middleware is attached to
     */
    _patchLayer(middlewareLayer, isRouter, layerPath) {
      const layerType = isRouter ? types_1.KoaLayerType.ROUTER : types_1.KoaLayerType.MIDDLEWARE;
      if (middlewareLayer[internal_types_1.kLayerPatched] === true || (0, utils_1.isLayerIgnored)(layerType, this.getConfig()))
        return middlewareLayer;
      if (middlewareLayer.constructor.name === "GeneratorFunction" || middlewareLayer.constructor.name === "AsyncGeneratorFunction") {
        api.diag.debug("ignoring generator-based Koa middleware layer");
        return middlewareLayer;
      }
      middlewareLayer[internal_types_1.kLayerPatched] = true;
      api.diag.debug("patching Koa middleware layer");
      return async (context2, next) => {
        const parent = api.trace.getSpan(api.context.active());
        if (parent === void 0) {
          return middlewareLayer(context2, next);
        }
        const metadata = (0, utils_1.getMiddlewareMetadata)(context2, middlewareLayer, isRouter, layerPath);
        const span = this.tracer.startSpan(metadata.name, {
          attributes: metadata.attributes
        });
        const rpcMetadata = (0, core_1.getRPCMetadata)(api.context.active());
        if (rpcMetadata?.type === core_1.RPCType.HTTP && context2._matchedRoute) {
          rpcMetadata.route = context2._matchedRoute.toString();
        }
        const { requestHook: requestHook2 } = this.getConfig();
        if (requestHook2) {
          (0, instrumentation_1.safeExecuteInTheMiddle)(() => requestHook2(span, {
            context: context2,
            middlewareLayer,
            layerType
          }), (e) => {
            if (e) {
              api.diag.error("koa instrumentation: request hook failed", e);
            }
          }, true);
        }
        const newContext = api.trace.setSpan(api.context.active(), span);
        return api.context.with(newContext, async () => {
          try {
            return await middlewareLayer(context2, next);
          } catch (err) {
            span.recordException(err);
            throw err;
          } finally {
            span.end();
          }
        });
      };
    }
  }
  instrumentation$5.KoaInstrumentation = KoaInstrumentation;
  return instrumentation$5;
}
var hasRequiredSrc$6;
function requireSrc$6() {
  if (hasRequiredSrc$6) return src$6;
  hasRequiredSrc$6 = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.KoaLayerType = exports$1.AttributeNames = exports$1.KoaInstrumentation = void 0;
    var instrumentation_1 = requireInstrumentation$5();
    Object.defineProperty(exports$1, "KoaInstrumentation", { enumerable: true, get: function() {
      return instrumentation_1.KoaInstrumentation;
    } });
    var AttributeNames_1 = requireAttributeNames$1();
    Object.defineProperty(exports$1, "AttributeNames", { enumerable: true, get: function() {
      return AttributeNames_1.AttributeNames;
    } });
    var types_1 = requireTypes$1();
    Object.defineProperty(exports$1, "KoaLayerType", { enumerable: true, get: function() {
      return types_1.KoaLayerType;
    } });
  })(src$6);
  return src$6;
}
var srcExports$6 = requireSrc$6();
const INTEGRATION_NAME$8 = "Koa";
const instrumentKoa = generateInstrumentOnce(
  INTEGRATION_NAME$8,
  srcExports$6.KoaInstrumentation,
  (options = {}) => {
    return {
      ignoreLayersType: options.ignoreLayersType,
      requestHook(span, info) {
        addOriginToSpan(span, "auto.http.otel.koa");
        const attributes = spanToJSON(span).data;
        const type = attributes["koa.type"];
        if (type) {
          span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_OP, `${type}.koa`);
        }
        const name2 = attributes["koa.name"];
        if (typeof name2 === "string") {
          span.updateName(name2 || "< unknown >");
        }
        if (getIsolationScope() === getDefaultIsolationScope()) {
          DEBUG_BUILD$2 && debug.warn("Isolation scope is default isolation scope - skipping setting transactionName");
          return;
        }
        const route = attributes[ATTR_HTTP_ROUTE];
        const method = info.context?.request?.method?.toUpperCase() || "GET";
        if (route) {
          getIsolationScope().setTransactionName(`${method} ${route}`);
        }
      }
    };
  }
);
const _koaIntegration = ((options = {}) => {
  return {
    name: INTEGRATION_NAME$8,
    setupOnce() {
      instrumentKoa(options);
    }
  };
});
const koaIntegration = defineIntegration(_koaIntegration);
const setupKoaErrorHandler = (app2) => {
  app2.use(async (ctx, next) => {
    try {
      await next();
    } catch (error2) {
      captureException(error2, {
        mechanism: {
          handled: false,
          type: "auto.middleware.koa"
        }
      });
      throw error2;
    }
  });
  ensureIsWrapped(app2.use, "koa");
};
var src$5 = {};
var instrumentation$4 = {};
var AttributeNames = {};
var hasRequiredAttributeNames;
function requireAttributeNames() {
  if (hasRequiredAttributeNames) return AttributeNames;
  hasRequiredAttributeNames = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.ConnectNames = exports$1.ConnectTypes = exports$1.AttributeNames = void 0;
    (function(AttributeNames2) {
      AttributeNames2["CONNECT_TYPE"] = "connect.type";
      AttributeNames2["CONNECT_NAME"] = "connect.name";
    })(exports$1.AttributeNames || (exports$1.AttributeNames = {}));
    (function(ConnectTypes) {
      ConnectTypes["MIDDLEWARE"] = "middleware";
      ConnectTypes["REQUEST_HANDLER"] = "request_handler";
    })(exports$1.ConnectTypes || (exports$1.ConnectTypes = {}));
    (function(ConnectNames) {
      ConnectNames["MIDDLEWARE"] = "middleware";
      ConnectNames["REQUEST_HANDLER"] = "request handler";
    })(exports$1.ConnectNames || (exports$1.ConnectNames = {}));
  })(AttributeNames);
  return AttributeNames;
}
var version$5 = {};
var hasRequiredVersion$5;
function requireVersion$5() {
  if (hasRequiredVersion$5) return version$5;
  hasRequiredVersion$5 = 1;
  Object.defineProperty(version$5, "__esModule", { value: true });
  version$5.PACKAGE_NAME = version$5.PACKAGE_VERSION = void 0;
  version$5.PACKAGE_VERSION = "0.54.0";
  version$5.PACKAGE_NAME = "@opentelemetry/instrumentation-connect";
  return version$5;
}
var utils$3 = {};
var internalTypes = {};
var hasRequiredInternalTypes;
function requireInternalTypes() {
  if (hasRequiredInternalTypes) return internalTypes;
  hasRequiredInternalTypes = 1;
  Object.defineProperty(internalTypes, "__esModule", { value: true });
  internalTypes._LAYERS_STORE_PROPERTY = void 0;
  internalTypes._LAYERS_STORE_PROPERTY = Symbol("opentelemetry.instrumentation-connect.request-route-stack");
  return internalTypes;
}
var hasRequiredUtils$3;
function requireUtils$3() {
  if (hasRequiredUtils$3) return utils$3;
  hasRequiredUtils$3 = 1;
  Object.defineProperty(utils$3, "__esModule", { value: true });
  utils$3.generateRoute = utils$3.replaceCurrentStackRoute = utils$3.addNewStackLayer = void 0;
  const api_1 = require$$0$2;
  const internal_types_1 = requireInternalTypes();
  const addNewStackLayer = (request) => {
    if (Array.isArray(request[internal_types_1._LAYERS_STORE_PROPERTY]) === false) {
      Object.defineProperty(request, internal_types_1._LAYERS_STORE_PROPERTY, {
        enumerable: false,
        value: []
      });
    }
    request[internal_types_1._LAYERS_STORE_PROPERTY].push("/");
    const stackLength = request[internal_types_1._LAYERS_STORE_PROPERTY].length;
    return () => {
      if (stackLength === request[internal_types_1._LAYERS_STORE_PROPERTY].length) {
        request[internal_types_1._LAYERS_STORE_PROPERTY].pop();
      } else {
        api_1.diag.warn("Connect: Trying to pop the stack multiple time");
      }
    };
  };
  utils$3.addNewStackLayer = addNewStackLayer;
  const replaceCurrentStackRoute = (request, newRoute) => {
    if (newRoute) {
      request[internal_types_1._LAYERS_STORE_PROPERTY].splice(-1, 1, newRoute);
    }
  };
  utils$3.replaceCurrentStackRoute = replaceCurrentStackRoute;
  const generateRoute = (request) => {
    return request[internal_types_1._LAYERS_STORE_PROPERTY].reduce((acc, sub) => acc.replace(/\/+$/, "") + sub);
  };
  utils$3.generateRoute = generateRoute;
  return utils$3;
}
var hasRequiredInstrumentation$4;
function requireInstrumentation$4() {
  if (hasRequiredInstrumentation$4) return instrumentation$4;
  hasRequiredInstrumentation$4 = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.ConnectInstrumentation = exports$1.ANONYMOUS_NAME = void 0;
    const api_1 = require$$0$2;
    const core_1 = require$$1$1;
    const AttributeNames_1 = requireAttributeNames();
    const version_1 = requireVersion$5();
    const instrumentation_1 = require$$2;
    const semantic_conventions_1 = require$$2$1;
    const utils_1 = requireUtils$3();
    exports$1.ANONYMOUS_NAME = "anonymous";
    class ConnectInstrumentation extends instrumentation_1.InstrumentationBase {
      constructor(config2 = {}) {
        super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config2);
      }
      init() {
        return [
          new instrumentation_1.InstrumentationNodeModuleDefinition("connect", [">=3.0.0 <4"], (moduleExports) => {
            return this._patchConstructor(moduleExports);
          })
        ];
      }
      _patchApp(patchedApp) {
        if (!(0, instrumentation_1.isWrapped)(patchedApp.use)) {
          this._wrap(patchedApp, "use", this._patchUse.bind(this));
        }
        if (!(0, instrumentation_1.isWrapped)(patchedApp.handle)) {
          this._wrap(patchedApp, "handle", this._patchHandle.bind(this));
        }
      }
      _patchConstructor(original) {
        const instrumentation2 = this;
        return function(...args) {
          const app2 = original.apply(this, args);
          instrumentation2._patchApp(app2);
          return app2;
        };
      }
      _patchNext(next, finishSpan) {
        return function nextFunction(err) {
          const result = next.apply(this, [err]);
          finishSpan();
          return result;
        };
      }
      _startSpan(routeName, middleWare) {
        let connectType;
        let connectName;
        let connectTypeName;
        if (routeName) {
          connectType = AttributeNames_1.ConnectTypes.REQUEST_HANDLER;
          connectTypeName = AttributeNames_1.ConnectNames.REQUEST_HANDLER;
          connectName = routeName;
        } else {
          connectType = AttributeNames_1.ConnectTypes.MIDDLEWARE;
          connectTypeName = AttributeNames_1.ConnectNames.MIDDLEWARE;
          connectName = middleWare.name || exports$1.ANONYMOUS_NAME;
        }
        const spanName = `${connectTypeName} - ${connectName}`;
        const options = {
          attributes: {
            [semantic_conventions_1.ATTR_HTTP_ROUTE]: routeName.length > 0 ? routeName : "/",
            [AttributeNames_1.AttributeNames.CONNECT_TYPE]: connectType,
            [AttributeNames_1.AttributeNames.CONNECT_NAME]: connectName
          }
        };
        return this.tracer.startSpan(spanName, options);
      }
      _patchMiddleware(routeName, middleWare) {
        const instrumentation2 = this;
        const isErrorMiddleware = middleWare.length === 4;
        function patchedMiddleware() {
          if (!instrumentation2.isEnabled()) {
            return middleWare.apply(this, arguments);
          }
          const [reqArgIdx, resArgIdx, nextArgIdx] = isErrorMiddleware ? [1, 2, 3] : [0, 1, 2];
          const req = arguments[reqArgIdx];
          const res = arguments[resArgIdx];
          const next = arguments[nextArgIdx];
          (0, utils_1.replaceCurrentStackRoute)(req, routeName);
          const rpcMetadata = (0, core_1.getRPCMetadata)(api_1.context.active());
          if (routeName && rpcMetadata?.type === core_1.RPCType.HTTP) {
            rpcMetadata.route = (0, utils_1.generateRoute)(req);
          }
          let spanName = "";
          if (routeName) {
            spanName = `request handler - ${routeName}`;
          } else {
            spanName = `middleware - ${middleWare.name || exports$1.ANONYMOUS_NAME}`;
          }
          const span = instrumentation2._startSpan(routeName, middleWare);
          instrumentation2._diag.debug("start span", spanName);
          let spanFinished = false;
          function finishSpan() {
            if (!spanFinished) {
              spanFinished = true;
              instrumentation2._diag.debug(`finishing span ${span.name}`);
              span.end();
            } else {
              instrumentation2._diag.debug(`span ${span.name} - already finished`);
            }
            res.removeListener("close", finishSpan);
          }
          res.addListener("close", finishSpan);
          arguments[nextArgIdx] = instrumentation2._patchNext(next, finishSpan);
          return middleWare.apply(this, arguments);
        }
        Object.defineProperty(patchedMiddleware, "length", {
          value: middleWare.length,
          writable: false,
          configurable: true
        });
        return patchedMiddleware;
      }
      _patchUse(original) {
        const instrumentation2 = this;
        return function(...args) {
          const middleWare = args[args.length - 1];
          const routeName = args[args.length - 2] || "";
          args[args.length - 1] = instrumentation2._patchMiddleware(routeName, middleWare);
          return original.apply(this, args);
        };
      }
      _patchHandle(original) {
        const instrumentation2 = this;
        return function() {
          const [reqIdx, outIdx] = [0, 2];
          const req = arguments[reqIdx];
          const out = arguments[outIdx];
          const completeStack = (0, utils_1.addNewStackLayer)(req);
          if (typeof out === "function") {
            arguments[outIdx] = instrumentation2._patchOut(out, completeStack);
          }
          return original.apply(this, arguments);
        };
      }
      _patchOut(out, completeStack) {
        return function nextFunction(...args) {
          completeStack();
          return Reflect.apply(out, this, args);
        };
      }
    }
    exports$1.ConnectInstrumentation = ConnectInstrumentation;
  })(instrumentation$4);
  return instrumentation$4;
}
var hasRequiredSrc$5;
function requireSrc$5() {
  if (hasRequiredSrc$5) return src$5;
  hasRequiredSrc$5 = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.ConnectTypes = exports$1.ConnectNames = exports$1.AttributeNames = exports$1.ANONYMOUS_NAME = exports$1.ConnectInstrumentation = void 0;
    var instrumentation_1 = requireInstrumentation$4();
    Object.defineProperty(exports$1, "ConnectInstrumentation", { enumerable: true, get: function() {
      return instrumentation_1.ConnectInstrumentation;
    } });
    Object.defineProperty(exports$1, "ANONYMOUS_NAME", { enumerable: true, get: function() {
      return instrumentation_1.ANONYMOUS_NAME;
    } });
    var AttributeNames_1 = requireAttributeNames();
    Object.defineProperty(exports$1, "AttributeNames", { enumerable: true, get: function() {
      return AttributeNames_1.AttributeNames;
    } });
    Object.defineProperty(exports$1, "ConnectNames", { enumerable: true, get: function() {
      return AttributeNames_1.ConnectNames;
    } });
    Object.defineProperty(exports$1, "ConnectTypes", { enumerable: true, get: function() {
      return AttributeNames_1.ConnectTypes;
    } });
  })(src$5);
  return src$5;
}
var srcExports$5 = requireSrc$5();
const INTEGRATION_NAME$7 = "Connect";
const instrumentConnect = generateInstrumentOnce(INTEGRATION_NAME$7, () => new srcExports$5.ConnectInstrumentation());
const _connectIntegration = (() => {
  return {
    name: INTEGRATION_NAME$7,
    setupOnce() {
      instrumentConnect();
    }
  };
});
const connectIntegration = defineIntegration(_connectIntegration);
function connectErrorMiddleware(err, req, res, next) {
  captureException(err, {
    mechanism: {
      handled: false,
      type: "auto.middleware.connect"
    }
  });
  next(err);
}
const setupConnectErrorHandler = (app2) => {
  app2.use(connectErrorMiddleware);
  const client = getClient();
  if (client) {
    client.on("spanStart", (span) => {
      addConnectSpanAttributes(span);
    });
  }
  ensureIsWrapped(app2.use, "connect");
};
function addConnectSpanAttributes(span) {
  const attributes = spanToJSON(span).data;
  const type = attributes["connect.type"];
  if (attributes[SEMANTIC_ATTRIBUTE_SENTRY_OP] || !type) {
    return;
  }
  span.setAttributes({
    [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.otel.connect",
    [SEMANTIC_ATTRIBUTE_SENTRY_OP]: `${type}.connect`
  });
  const name2 = attributes["connect.name"];
  if (typeof name2 === "string") {
    span.updateName(name2);
  }
}
var src$4 = {};
var instrumentation$3 = {};
var version$4 = {};
var hasRequiredVersion$4;
function requireVersion$4() {
  if (hasRequiredVersion$4) return version$4;
  hasRequiredVersion$4 = 1;
  Object.defineProperty(version$4, "__esModule", { value: true });
  version$4.PACKAGE_NAME = version$4.PACKAGE_VERSION = void 0;
  version$4.PACKAGE_VERSION = "0.55.0";
  version$4.PACKAGE_NAME = "@opentelemetry/instrumentation-knex";
  return version$4;
}
var constants = {};
var hasRequiredConstants;
function requireConstants() {
  if (hasRequiredConstants) return constants;
  hasRequiredConstants = 1;
  Object.defineProperty(constants, "__esModule", { value: true });
  constants.SUPPORTED_VERSIONS = constants.MODULE_NAME = void 0;
  constants.MODULE_NAME = "knex";
  constants.SUPPORTED_VERSIONS = [
    // use "lib/execution" for runner.js, "lib" for client.js as basepath, latest tested 0.95.6
    ">=0.22.0 <4",
    // use "lib" as basepath
    ">=0.10.0 <0.18.0",
    ">=0.19.0 <0.22.0",
    // use "src" as basepath
    ">=0.18.0 <0.19.0"
  ];
  return constants;
}
var utils$2 = {};
var semconv$2 = {};
var hasRequiredSemconv$2;
function requireSemconv$2() {
  if (hasRequiredSemconv$2) return semconv$2;
  hasRequiredSemconv$2 = 1;
  Object.defineProperty(semconv$2, "__esModule", { value: true });
  semconv$2.DB_SYSTEM_NAME_VALUE_SQLITE = semconv$2.ATTR_NET_TRANSPORT = semconv$2.ATTR_NET_PEER_PORT = semconv$2.ATTR_NET_PEER_NAME = semconv$2.ATTR_DB_USER = semconv$2.ATTR_DB_SYSTEM = semconv$2.ATTR_DB_STATEMENT = semconv$2.ATTR_DB_SQL_TABLE = semconv$2.ATTR_DB_OPERATION = semconv$2.ATTR_DB_NAME = void 0;
  semconv$2.ATTR_DB_NAME = "db.name";
  semconv$2.ATTR_DB_OPERATION = "db.operation";
  semconv$2.ATTR_DB_SQL_TABLE = "db.sql.table";
  semconv$2.ATTR_DB_STATEMENT = "db.statement";
  semconv$2.ATTR_DB_SYSTEM = "db.system";
  semconv$2.ATTR_DB_USER = "db.user";
  semconv$2.ATTR_NET_PEER_NAME = "net.peer.name";
  semconv$2.ATTR_NET_PEER_PORT = "net.peer.port";
  semconv$2.ATTR_NET_TRANSPORT = "net.transport";
  semconv$2.DB_SYSTEM_NAME_VALUE_SQLITE = "sqlite";
  return semconv$2;
}
var hasRequiredUtils$2;
function requireUtils$2() {
  if (hasRequiredUtils$2) return utils$2;
  hasRequiredUtils$2 = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.extractTableName = exports$1.limitLength = exports$1.getName = exports$1.mapSystem = exports$1.otelExceptionFromKnexError = exports$1.getFormatter = void 0;
    const semantic_conventions_1 = require$$2$1;
    const semconv_1 = requireSemconv$2();
    const getFormatter = (runner) => {
      if (runner) {
        if (runner.client) {
          if (runner.client._formatQuery) {
            return runner.client._formatQuery.bind(runner.client);
          } else if (runner.client.SqlString) {
            return runner.client.SqlString.format.bind(runner.client.SqlString);
          }
        }
        if (runner.builder) {
          return runner.builder.toString.bind(runner.builder);
        }
      }
      return () => "<noop formatter>";
    };
    exports$1.getFormatter = getFormatter;
    function otelExceptionFromKnexError(err, message) {
      if (!(err && err instanceof Error)) {
        return err;
      }
      return {
        message,
        code: err.code,
        stack: err.stack,
        name: err.name
      };
    }
    exports$1.otelExceptionFromKnexError = otelExceptionFromKnexError;
    const systemMap = /* @__PURE__ */ new Map([
      ["sqlite3", semconv_1.DB_SYSTEM_NAME_VALUE_SQLITE],
      ["pg", semantic_conventions_1.DB_SYSTEM_NAME_VALUE_POSTGRESQL]
    ]);
    const mapSystem = (knexSystem) => {
      return systemMap.get(knexSystem) || knexSystem;
    };
    exports$1.mapSystem = mapSystem;
    const getName = (db, operation, table) => {
      if (operation) {
        if (table) {
          return `${operation} ${db}.${table}`;
        }
        return `${operation} ${db}`;
      }
      return db;
    };
    exports$1.getName = getName;
    const limitLength = (str, maxLength) => {
      if (typeof str === "string" && typeof maxLength === "number" && 0 < maxLength && maxLength < str.length) {
        return str.substring(0, maxLength) + "..";
      }
      return str;
    };
    exports$1.limitLength = limitLength;
    const extractTableName = (builder) => {
      const table = builder?._single?.table;
      if (typeof table === "object") {
        return (0, exports$1.extractTableName)(table);
      }
      return table;
    };
    exports$1.extractTableName = extractTableName;
  })(utils$2);
  return utils$2;
}
var hasRequiredInstrumentation$3;
function requireInstrumentation$3() {
  if (hasRequiredInstrumentation$3) return instrumentation$3;
  hasRequiredInstrumentation$3 = 1;
  Object.defineProperty(instrumentation$3, "__esModule", { value: true });
  instrumentation$3.KnexInstrumentation = void 0;
  const api = require$$0$2;
  const version_1 = requireVersion$4();
  const constants2 = requireConstants();
  const instrumentation_1 = require$$2;
  const utils2 = requireUtils$2();
  const semantic_conventions_1 = require$$2$1;
  const semconv_1 = requireSemconv$2();
  const contextSymbol = Symbol("opentelemetry.instrumentation-knex.context");
  const DEFAULT_CONFIG = {
    maxQueryLength: 1022,
    requireParentSpan: false
  };
  class KnexInstrumentation extends instrumentation_1.InstrumentationBase {
    _semconvStability;
    constructor(config2 = {}) {
      super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, { ...DEFAULT_CONFIG, ...config2 });
      this._semconvStability = (0, instrumentation_1.semconvStabilityFromStr)("database", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
    }
    setConfig(config2 = {}) {
      super.setConfig({ ...DEFAULT_CONFIG, ...config2 });
    }
    init() {
      const module2 = new instrumentation_1.InstrumentationNodeModuleDefinition(constants2.MODULE_NAME, constants2.SUPPORTED_VERSIONS);
      module2.files.push(this.getClientNodeModuleFileInstrumentation("src"), this.getClientNodeModuleFileInstrumentation("lib"), this.getRunnerNodeModuleFileInstrumentation("src"), this.getRunnerNodeModuleFileInstrumentation("lib"), this.getRunnerNodeModuleFileInstrumentation("lib/execution"));
      return module2;
    }
    getRunnerNodeModuleFileInstrumentation(basePath) {
      return new instrumentation_1.InstrumentationNodeModuleFile(`knex/${basePath}/runner.js`, constants2.SUPPORTED_VERSIONS, (Runner, moduleVersion) => {
        this.ensureWrapped(Runner.prototype, "query", this.createQueryWrapper(moduleVersion));
        return Runner;
      }, (Runner, moduleVersion) => {
        this._unwrap(Runner.prototype, "query");
        return Runner;
      });
    }
    getClientNodeModuleFileInstrumentation(basePath) {
      return new instrumentation_1.InstrumentationNodeModuleFile(`knex/${basePath}/client.js`, constants2.SUPPORTED_VERSIONS, (Client) => {
        this.ensureWrapped(Client.prototype, "queryBuilder", this.storeContext.bind(this));
        this.ensureWrapped(Client.prototype, "schemaBuilder", this.storeContext.bind(this));
        this.ensureWrapped(Client.prototype, "raw", this.storeContext.bind(this));
        return Client;
      }, (Client) => {
        this._unwrap(Client.prototype, "queryBuilder");
        this._unwrap(Client.prototype, "schemaBuilder");
        this._unwrap(Client.prototype, "raw");
        return Client;
      });
    }
    createQueryWrapper(moduleVersion) {
      const instrumentation2 = this;
      return function wrapQuery(original) {
        return function wrapped_logging_method(query) {
          const config2 = this.client.config;
          const table = utils2.extractTableName(this.builder);
          const operation = query?.method;
          const name2 = config2?.connection?.filename || config2?.connection?.database;
          const { maxQueryLength } = instrumentation2.getConfig();
          const attributes = {
            "knex.version": moduleVersion
          };
          const transport = config2?.connection?.filename === ":memory:" ? "inproc" : void 0;
          if (instrumentation2._semconvStability & instrumentation_1.SemconvStability.OLD) {
            Object.assign(attributes, {
              [semconv_1.ATTR_DB_SYSTEM]: utils2.mapSystem(this.client.driverName),
              [semconv_1.ATTR_DB_SQL_TABLE]: table,
              [semconv_1.ATTR_DB_OPERATION]: operation,
              [semconv_1.ATTR_DB_USER]: config2?.connection?.user,
              [semconv_1.ATTR_DB_NAME]: name2,
              [semconv_1.ATTR_NET_PEER_NAME]: config2?.connection?.host,
              [semconv_1.ATTR_NET_PEER_PORT]: config2?.connection?.port,
              [semconv_1.ATTR_NET_TRANSPORT]: transport
            });
          }
          if (instrumentation2._semconvStability & instrumentation_1.SemconvStability.STABLE) {
            Object.assign(attributes, {
              [semantic_conventions_1.ATTR_DB_SYSTEM_NAME]: utils2.mapSystem(this.client.driverName),
              [semantic_conventions_1.ATTR_DB_COLLECTION_NAME]: table,
              [semantic_conventions_1.ATTR_DB_OPERATION_NAME]: operation,
              [semantic_conventions_1.ATTR_DB_NAMESPACE]: name2,
              [semantic_conventions_1.ATTR_SERVER_ADDRESS]: config2?.connection?.host,
              [semantic_conventions_1.ATTR_SERVER_PORT]: config2?.connection?.port
            });
          }
          if (maxQueryLength) {
            const queryText = utils2.limitLength(query?.sql, maxQueryLength);
            if (instrumentation2._semconvStability & instrumentation_1.SemconvStability.STABLE) {
              attributes[semantic_conventions_1.ATTR_DB_QUERY_TEXT] = queryText;
            }
            if (instrumentation2._semconvStability & instrumentation_1.SemconvStability.OLD) {
              attributes[semconv_1.ATTR_DB_STATEMENT] = queryText;
            }
          }
          const parentContext = this.builder[contextSymbol] || api.context.active();
          const parentSpan = api.trace.getSpan(parentContext);
          const hasActiveParent = parentSpan && api.trace.isSpanContextValid(parentSpan.spanContext());
          if (instrumentation2._config.requireParentSpan && !hasActiveParent) {
            return original.bind(this)(...arguments);
          }
          const span = instrumentation2.tracer.startSpan(utils2.getName(name2, operation, table), {
            kind: api.SpanKind.CLIENT,
            attributes
          }, parentContext);
          const spanContext = api.trace.setSpan(api.context.active(), span);
          return api.context.with(spanContext, original, this, ...arguments).then((result) => {
            span.end();
            return result;
          }).catch((err) => {
            const formatter = utils2.getFormatter(this);
            const fullQuery = formatter(query.sql, query.bindings || []);
            const message = err.message.replace(fullQuery + " - ", "");
            const exc = utils2.otelExceptionFromKnexError(err, message);
            span.recordException(exc);
            span.setStatus({ code: api.SpanStatusCode.ERROR, message });
            span.end();
            throw err;
          });
        };
      };
    }
    storeContext(original) {
      return function wrapped_logging_method() {
        const builder = original.apply(this, arguments);
        Object.defineProperty(builder, contextSymbol, {
          value: api.context.active()
        });
        return builder;
      };
    }
    ensureWrapped(obj, methodName, wrapper) {
      if ((0, instrumentation_1.isWrapped)(obj[methodName])) {
        this._unwrap(obj, methodName);
      }
      this._wrap(obj, methodName, wrapper);
    }
  }
  instrumentation$3.KnexInstrumentation = KnexInstrumentation;
  return instrumentation$3;
}
var hasRequiredSrc$4;
function requireSrc$4() {
  if (hasRequiredSrc$4) return src$4;
  hasRequiredSrc$4 = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.KnexInstrumentation = void 0;
    var instrumentation_1 = requireInstrumentation$3();
    Object.defineProperty(exports$1, "KnexInstrumentation", { enumerable: true, get: function() {
      return instrumentation_1.KnexInstrumentation;
    } });
  })(src$4);
  return src$4;
}
var srcExports$4 = requireSrc$4();
const INTEGRATION_NAME$6 = "Knex";
const instrumentKnex = generateInstrumentOnce(
  INTEGRATION_NAME$6,
  () => new srcExports$4.KnexInstrumentation({ requireParentSpan: true })
);
const _knexIntegration = (() => {
  let instrumentationWrappedCallback;
  return {
    name: INTEGRATION_NAME$6,
    setupOnce() {
      const instrumentation2 = instrumentKnex();
      instrumentationWrappedCallback = instrumentWhenWrapped(instrumentation2);
    },
    setup(client) {
      instrumentationWrappedCallback?.(
        () => client.on("spanStart", (span) => {
          const { data } = spanToJSON(span);
          if ("knex.version" in data) {
            span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, "auto.db.otel.knex");
          }
        })
      );
    }
  };
});
const knexIntegration = defineIntegration(_knexIntegration);
var src$3 = {};
var instrumentation$2 = {};
var semconv$1 = {};
var hasRequiredSemconv$1;
function requireSemconv$1() {
  if (hasRequiredSemconv$1) return semconv$1;
  hasRequiredSemconv$1 = 1;
  Object.defineProperty(semconv$1, "__esModule", { value: true });
  semconv$1.DB_SYSTEM_VALUE_MSSQL = semconv$1.ATTR_NET_PEER_PORT = semconv$1.ATTR_NET_PEER_NAME = semconv$1.ATTR_DB_USER = semconv$1.ATTR_DB_SYSTEM = semconv$1.ATTR_DB_STATEMENT = semconv$1.ATTR_DB_SQL_TABLE = semconv$1.ATTR_DB_NAME = void 0;
  semconv$1.ATTR_DB_NAME = "db.name";
  semconv$1.ATTR_DB_SQL_TABLE = "db.sql.table";
  semconv$1.ATTR_DB_STATEMENT = "db.statement";
  semconv$1.ATTR_DB_SYSTEM = "db.system";
  semconv$1.ATTR_DB_USER = "db.user";
  semconv$1.ATTR_NET_PEER_NAME = "net.peer.name";
  semconv$1.ATTR_NET_PEER_PORT = "net.peer.port";
  semconv$1.DB_SYSTEM_VALUE_MSSQL = "mssql";
  return semconv$1;
}
var utils$1 = {};
var hasRequiredUtils$1;
function requireUtils$1() {
  if (hasRequiredUtils$1) return utils$1;
  hasRequiredUtils$1 = 1;
  Object.defineProperty(utils$1, "__esModule", { value: true });
  utils$1.once = utils$1.getSpanName = void 0;
  function getSpanName(operation, db, sql, bulkLoadTable) {
    if (operation === "execBulkLoad" && bulkLoadTable && db) {
      return `${operation} ${bulkLoadTable} ${db}`;
    }
    if (operation === "callProcedure") {
      if (db) {
        return `${operation} ${sql} ${db}`;
      }
      return `${operation} ${sql}`;
    }
    if (db) {
      return `${operation} ${db}`;
    }
    return `${operation}`;
  }
  utils$1.getSpanName = getSpanName;
  const once = (fn) => {
    let called = false;
    return (...args) => {
      if (called)
        return;
      called = true;
      return fn(...args);
    };
  };
  utils$1.once = once;
  return utils$1;
}
var version$3 = {};
var hasRequiredVersion$3;
function requireVersion$3() {
  if (hasRequiredVersion$3) return version$3;
  hasRequiredVersion$3 = 1;
  Object.defineProperty(version$3, "__esModule", { value: true });
  version$3.PACKAGE_NAME = version$3.PACKAGE_VERSION = void 0;
  version$3.PACKAGE_VERSION = "0.30.0";
  version$3.PACKAGE_NAME = "@opentelemetry/instrumentation-tedious";
  return version$3;
}
var hasRequiredInstrumentation$2;
function requireInstrumentation$2() {
  if (hasRequiredInstrumentation$2) return instrumentation$2;
  hasRequiredInstrumentation$2 = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.TediousInstrumentation = exports$1.INJECTED_CTX = void 0;
    const api = require$$0$2;
    const events_1 = require$$0$3;
    const instrumentation_1 = require$$2;
    const semantic_conventions_1 = require$$2$1;
    const semconv_1 = requireSemconv$1();
    const utils_1 = requireUtils$1();
    const version_1 = requireVersion$3();
    const CURRENT_DATABASE = Symbol("opentelemetry.instrumentation-tedious.current-database");
    exports$1.INJECTED_CTX = Symbol("opentelemetry.instrumentation-tedious.context-info-injected");
    const PATCHED_METHODS = [
      "callProcedure",
      "execSql",
      "execSqlBatch",
      "execBulkLoad",
      "prepare",
      "execute"
    ];
    function setDatabase(databaseName) {
      Object.defineProperty(this, CURRENT_DATABASE, {
        value: databaseName,
        writable: true
      });
    }
    class TediousInstrumentation extends instrumentation_1.InstrumentationBase {
      static COMPONENT = "tedious";
      _netSemconvStability;
      _dbSemconvStability;
      constructor(config2 = {}) {
        super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config2);
        this._setSemconvStabilityFromEnv();
      }
      // Used for testing.
      _setSemconvStabilityFromEnv() {
        this._netSemconvStability = (0, instrumentation_1.semconvStabilityFromStr)("http", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
        this._dbSemconvStability = (0, instrumentation_1.semconvStabilityFromStr)("database", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
      }
      init() {
        return [
          new instrumentation_1.InstrumentationNodeModuleDefinition(TediousInstrumentation.COMPONENT, [">=1.11.0 <20"], (moduleExports) => {
            const ConnectionPrototype = moduleExports.Connection.prototype;
            for (const method of PATCHED_METHODS) {
              if ((0, instrumentation_1.isWrapped)(ConnectionPrototype[method])) {
                this._unwrap(ConnectionPrototype, method);
              }
              this._wrap(ConnectionPrototype, method, this._patchQuery(method, moduleExports));
            }
            if ((0, instrumentation_1.isWrapped)(ConnectionPrototype.connect)) {
              this._unwrap(ConnectionPrototype, "connect");
            }
            this._wrap(ConnectionPrototype, "connect", this._patchConnect);
            return moduleExports;
          }, (moduleExports) => {
            if (moduleExports === void 0)
              return;
            const ConnectionPrototype = moduleExports.Connection.prototype;
            for (const method of PATCHED_METHODS) {
              this._unwrap(ConnectionPrototype, method);
            }
            this._unwrap(ConnectionPrototype, "connect");
          })
        ];
      }
      _patchConnect(original) {
        return function patchedConnect() {
          setDatabase.call(this, this.config?.options?.database);
          this.removeListener("databaseChange", setDatabase);
          this.on("databaseChange", setDatabase);
          this.once("end", () => {
            this.removeListener("databaseChange", setDatabase);
          });
          return original.apply(this, arguments);
        };
      }
      _buildTraceparent(span) {
        const sc = span.spanContext();
        return `00-${sc.traceId}-${sc.spanId}-0${Number(sc.traceFlags || api.TraceFlags.NONE).toString(16)}`;
      }
      /**
       * Fire a one-off `SET CONTEXT_INFO @opentelemetry_traceparent` on the same
       * connection. Marks the request with INJECTED_CTX so our patch skips it.
       */
      _injectContextInfo(connection, tediousModule, traceparent) {
        return new Promise((resolve) => {
          try {
            const sql = "set context_info @opentelemetry_traceparent";
            const req = new tediousModule.Request(sql, (_err) => {
              resolve();
            });
            Object.defineProperty(req, exports$1.INJECTED_CTX, { value: true });
            const buf = Buffer.from(traceparent, "utf8");
            req.addParameter("opentelemetry_traceparent", tediousModule.TYPES.VarBinary, buf, { length: buf.length });
            connection.execSql(req);
          } catch {
            resolve();
          }
        });
      }
      _shouldInjectFor(operation) {
        return operation === "execSql" || operation === "execSqlBatch" || operation === "callProcedure" || operation === "execute";
      }
      _patchQuery(operation, tediousModule) {
        return (originalMethod) => {
          const thisPlugin = this;
          function patchedMethod(request) {
            if (request?.[exports$1.INJECTED_CTX]) {
              return originalMethod.apply(this, arguments);
            }
            if (!(request instanceof events_1.EventEmitter)) {
              thisPlugin._diag.warn(`Unexpected invocation of patched ${operation} method. Span not recorded`);
              return originalMethod.apply(this, arguments);
            }
            let procCount = 0;
            let statementCount = 0;
            const incrementStatementCount = () => statementCount++;
            const incrementProcCount = () => procCount++;
            const databaseName = this[CURRENT_DATABASE];
            const sql = ((request2) => {
              if (request2.sqlTextOrProcedure === "sp_prepare" && request2.parametersByName?.stmt?.value) {
                return request2.parametersByName.stmt.value;
              }
              return request2.sqlTextOrProcedure;
            })(request);
            const attributes = {};
            if (thisPlugin._dbSemconvStability & instrumentation_1.SemconvStability.OLD) {
              attributes[semconv_1.ATTR_DB_SYSTEM] = semconv_1.DB_SYSTEM_VALUE_MSSQL;
              attributes[semconv_1.ATTR_DB_NAME] = databaseName;
              attributes[semconv_1.ATTR_DB_USER] = this.config?.userName ?? this.config?.authentication?.options?.userName;
              attributes[semconv_1.ATTR_DB_STATEMENT] = sql;
              attributes[semconv_1.ATTR_DB_SQL_TABLE] = request.table;
            }
            if (thisPlugin._dbSemconvStability & instrumentation_1.SemconvStability.STABLE) {
              attributes[semantic_conventions_1.ATTR_DB_NAMESPACE] = databaseName;
              attributes[semantic_conventions_1.ATTR_DB_SYSTEM_NAME] = semantic_conventions_1.DB_SYSTEM_NAME_VALUE_MICROSOFT_SQL_SERVER;
              attributes[semantic_conventions_1.ATTR_DB_QUERY_TEXT] = sql;
              attributes[semantic_conventions_1.ATTR_DB_COLLECTION_NAME] = request.table;
            }
            if (thisPlugin._netSemconvStability & instrumentation_1.SemconvStability.OLD) {
              attributes[semconv_1.ATTR_NET_PEER_NAME] = this.config?.server;
              attributes[semconv_1.ATTR_NET_PEER_PORT] = this.config?.options?.port;
            }
            if (thisPlugin._netSemconvStability & instrumentation_1.SemconvStability.STABLE) {
              attributes[semantic_conventions_1.ATTR_SERVER_ADDRESS] = this.config?.server;
              attributes[semantic_conventions_1.ATTR_SERVER_PORT] = this.config?.options?.port;
            }
            const span = thisPlugin.tracer.startSpan((0, utils_1.getSpanName)(operation, databaseName, sql, request.table), {
              kind: api.SpanKind.CLIENT,
              attributes
            });
            const endSpan2 = (0, utils_1.once)((err) => {
              request.removeListener("done", incrementStatementCount);
              request.removeListener("doneInProc", incrementStatementCount);
              request.removeListener("doneProc", incrementProcCount);
              request.removeListener("error", endSpan2);
              this.removeListener("end", endSpan2);
              span.setAttribute("tedious.procedure_count", procCount);
              span.setAttribute("tedious.statement_count", statementCount);
              if (err) {
                span.setStatus({
                  code: api.SpanStatusCode.ERROR,
                  message: err.message
                });
              }
              span.end();
            });
            request.on("done", incrementStatementCount);
            request.on("doneInProc", incrementStatementCount);
            request.on("doneProc", incrementProcCount);
            request.once("error", endSpan2);
            this.on("end", endSpan2);
            if (typeof request.callback === "function") {
              thisPlugin._wrap(request, "callback", thisPlugin._patchCallbackQuery(endSpan2));
            } else {
              thisPlugin._diag.error("Expected request.callback to be a function");
            }
            const runUserRequest = () => {
              return api.context.with(api.trace.setSpan(api.context.active(), span), originalMethod, this, ...arguments);
            };
            const cfg = thisPlugin.getConfig();
            const shouldInject = cfg.enableTraceContextPropagation && thisPlugin._shouldInjectFor(operation);
            if (!shouldInject)
              return runUserRequest();
            const traceparent = thisPlugin._buildTraceparent(span);
            void thisPlugin._injectContextInfo(this, tediousModule, traceparent).finally(runUserRequest);
          }
          Object.defineProperty(patchedMethod, "length", {
            value: originalMethod.length,
            writable: false
          });
          return patchedMethod;
        };
      }
      _patchCallbackQuery(endSpan2) {
        return (originalCallback) => {
          return function(err, rowCount, rows) {
            endSpan2(err);
            return originalCallback.apply(this, arguments);
          };
        };
      }
    }
    exports$1.TediousInstrumentation = TediousInstrumentation;
  })(instrumentation$2);
  return instrumentation$2;
}
var hasRequiredSrc$3;
function requireSrc$3() {
  if (hasRequiredSrc$3) return src$3;
  hasRequiredSrc$3 = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.TediousInstrumentation = void 0;
    var instrumentation_1 = requireInstrumentation$2();
    Object.defineProperty(exports$1, "TediousInstrumentation", { enumerable: true, get: function() {
      return instrumentation_1.TediousInstrumentation;
    } });
  })(src$3);
  return src$3;
}
var srcExports$3 = requireSrc$3();
const TEDIUS_INSTRUMENTED_METHODS = /* @__PURE__ */ new Set([
  "callProcedure",
  "execSql",
  "execSqlBatch",
  "execBulkLoad",
  "prepare",
  "execute"
]);
const INTEGRATION_NAME$5 = "Tedious";
const instrumentTedious = generateInstrumentOnce(INTEGRATION_NAME$5, () => new srcExports$3.TediousInstrumentation({}));
const _tediousIntegration = (() => {
  let instrumentationWrappedCallback;
  return {
    name: INTEGRATION_NAME$5,
    setupOnce() {
      const instrumentation2 = instrumentTedious();
      instrumentationWrappedCallback = instrumentWhenWrapped(instrumentation2);
    },
    setup(client) {
      instrumentationWrappedCallback?.(
        () => client.on("spanStart", (span) => {
          const { description, data } = spanToJSON(span);
          if (!description || data["db.system"] !== "mssql") {
            return;
          }
          const operation = description.split(" ")[0] || "";
          if (TEDIUS_INSTRUMENTED_METHODS.has(operation)) {
            span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, "auto.db.otel.tedious");
          }
        })
      );
    }
  };
});
const tediousIntegration = defineIntegration(_tediousIntegration);
var src$2 = {};
var instrumentation$1 = {};
var version$2 = {};
var hasRequiredVersion$2;
function requireVersion$2() {
  if (hasRequiredVersion$2) return version$2;
  hasRequiredVersion$2 = 1;
  Object.defineProperty(version$2, "__esModule", { value: true });
  version$2.PACKAGE_NAME = version$2.PACKAGE_VERSION = void 0;
  version$2.PACKAGE_VERSION = "0.54.0";
  version$2.PACKAGE_NAME = "@opentelemetry/instrumentation-generic-pool";
  return version$2;
}
var hasRequiredInstrumentation$1;
function requireInstrumentation$1() {
  if (hasRequiredInstrumentation$1) return instrumentation$1;
  hasRequiredInstrumentation$1 = 1;
  Object.defineProperty(instrumentation$1, "__esModule", { value: true });
  instrumentation$1.GenericPoolInstrumentation = void 0;
  const api = require$$0$2;
  const instrumentation_1 = require$$2;
  const version_1 = requireVersion$2();
  const MODULE_NAME2 = "generic-pool";
  class GenericPoolInstrumentation extends instrumentation_1.InstrumentationBase {
    // only used for v2 - v2.3)
    _isDisabled = false;
    constructor(config2 = {}) {
      super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config2);
    }
    init() {
      return [
        new instrumentation_1.InstrumentationNodeModuleDefinition(MODULE_NAME2, [">=3.0.0 <4"], (moduleExports) => {
          const Pool = moduleExports.Pool;
          if ((0, instrumentation_1.isWrapped)(Pool.prototype.acquire)) {
            this._unwrap(Pool.prototype, "acquire");
          }
          this._wrap(Pool.prototype, "acquire", this._acquirePatcher.bind(this));
          return moduleExports;
        }, (moduleExports) => {
          const Pool = moduleExports.Pool;
          this._unwrap(Pool.prototype, "acquire");
          return moduleExports;
        }),
        new instrumentation_1.InstrumentationNodeModuleDefinition(MODULE_NAME2, [">=2.4.0 <3"], (moduleExports) => {
          const Pool = moduleExports.Pool;
          if ((0, instrumentation_1.isWrapped)(Pool.prototype.acquire)) {
            this._unwrap(Pool.prototype, "acquire");
          }
          this._wrap(Pool.prototype, "acquire", this._acquireWithCallbacksPatcher.bind(this));
          return moduleExports;
        }, (moduleExports) => {
          const Pool = moduleExports.Pool;
          this._unwrap(Pool.prototype, "acquire");
          return moduleExports;
        }),
        new instrumentation_1.InstrumentationNodeModuleDefinition(MODULE_NAME2, [">=2.0.0 <2.4"], (moduleExports) => {
          this._isDisabled = false;
          if ((0, instrumentation_1.isWrapped)(moduleExports.Pool)) {
            this._unwrap(moduleExports, "Pool");
          }
          this._wrap(moduleExports, "Pool", this._poolWrapper.bind(this));
          return moduleExports;
        }, (moduleExports) => {
          this._isDisabled = true;
          return moduleExports;
        })
      ];
    }
    _acquirePatcher(original) {
      const instrumentation2 = this;
      return function wrapped_acquire(...args) {
        const parent = api.context.active();
        const span = instrumentation2.tracer.startSpan("generic-pool.acquire", {}, parent);
        return api.context.with(api.trace.setSpan(parent, span), () => {
          return original.call(this, ...args).then((value) => {
            span.end();
            return value;
          }, (err) => {
            span.recordException(err);
            span.end();
            throw err;
          });
        });
      };
    }
    _poolWrapper(original) {
      const instrumentation2 = this;
      return function wrapped_pool() {
        const pool = original.apply(this, arguments);
        instrumentation2._wrap(pool, "acquire", instrumentation2._acquireWithCallbacksPatcher.bind(instrumentation2));
        return pool;
      };
    }
    _acquireWithCallbacksPatcher(original) {
      const instrumentation2 = this;
      return function wrapped_acquire(cb2, priority) {
        if (instrumentation2._isDisabled) {
          return original.call(this, cb2, priority);
        }
        const parent = api.context.active();
        const span = instrumentation2.tracer.startSpan("generic-pool.acquire", {}, parent);
        return api.context.with(api.trace.setSpan(parent, span), () => {
          original.call(this, (err, client) => {
            span.end();
            if (cb2) {
              return cb2(err, client);
            }
          }, priority);
        });
      };
    }
  }
  instrumentation$1.GenericPoolInstrumentation = GenericPoolInstrumentation;
  return instrumentation$1;
}
var hasRequiredSrc$2;
function requireSrc$2() {
  if (hasRequiredSrc$2) return src$2;
  hasRequiredSrc$2 = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.GenericPoolInstrumentation = void 0;
    var instrumentation_1 = requireInstrumentation$1();
    Object.defineProperty(exports$1, "GenericPoolInstrumentation", { enumerable: true, get: function() {
      return instrumentation_1.GenericPoolInstrumentation;
    } });
  })(src$2);
  return src$2;
}
var srcExports$2 = requireSrc$2();
const INTEGRATION_NAME$4 = "GenericPool";
const instrumentGenericPool = generateInstrumentOnce(INTEGRATION_NAME$4, () => new srcExports$2.GenericPoolInstrumentation({}));
const _genericPoolIntegration = (() => {
  let instrumentationWrappedCallback;
  return {
    name: INTEGRATION_NAME$4,
    setupOnce() {
      const instrumentation2 = instrumentGenericPool();
      instrumentationWrappedCallback = instrumentWhenWrapped(instrumentation2);
    },
    setup(client) {
      instrumentationWrappedCallback?.(
        () => client.on("spanStart", (span) => {
          const spanJSON = spanToJSON(span);
          const spanDescription = spanJSON.description;
          const isGenericPoolSpan = spanDescription === "generic-pool.aquire" || spanDescription === "generic-pool.acquire";
          if (isGenericPoolSpan) {
            span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, "auto.db.otel.generic_pool");
          }
        })
      );
    }
  };
});
const genericPoolIntegration = defineIntegration(_genericPoolIntegration);
var src$1 = {};
var instrumentation = {};
var version$1 = {};
var hasRequiredVersion$1;
function requireVersion$1() {
  if (hasRequiredVersion$1) return version$1;
  hasRequiredVersion$1 = 1;
  Object.defineProperty(version$1, "__esModule", { value: true });
  version$1.PACKAGE_NAME = version$1.PACKAGE_VERSION = void 0;
  version$1.PACKAGE_VERSION = "0.28.0";
  version$1.PACKAGE_NAME = "@opentelemetry/instrumentation-dataloader";
  return version$1;
}
var hasRequiredInstrumentation;
function requireInstrumentation() {
  if (hasRequiredInstrumentation) return instrumentation;
  hasRequiredInstrumentation = 1;
  Object.defineProperty(instrumentation, "__esModule", { value: true });
  instrumentation.DataloaderInstrumentation = void 0;
  const instrumentation_1 = require$$2;
  const api_1 = require$$0$2;
  const version_1 = requireVersion$1();
  const MODULE_NAME2 = "dataloader";
  function extractModuleExports(module2) {
    return module2[Symbol.toStringTag] === "Module" ? module2.default : module2;
  }
  class DataloaderInstrumentation extends instrumentation_1.InstrumentationBase {
    constructor(config2 = {}) {
      super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config2);
    }
    init() {
      return [
        new instrumentation_1.InstrumentationNodeModuleDefinition(MODULE_NAME2, [">=2.0.0 <3"], (module2) => {
          const dataloader = extractModuleExports(module2);
          this._patchLoad(dataloader.prototype);
          this._patchLoadMany(dataloader.prototype);
          this._patchPrime(dataloader.prototype);
          this._patchClear(dataloader.prototype);
          this._patchClearAll(dataloader.prototype);
          return this._getPatchedConstructor(dataloader);
        }, (module2) => {
          const dataloader = extractModuleExports(module2);
          ["load", "loadMany", "prime", "clear", "clearAll"].forEach((method) => {
            if ((0, instrumentation_1.isWrapped)(dataloader.prototype[method])) {
              this._unwrap(dataloader.prototype, method);
            }
          });
        })
      ];
    }
    shouldCreateSpans() {
      const config2 = this.getConfig();
      const hasParentSpan = api_1.trace.getSpan(api_1.context.active()) !== void 0;
      return hasParentSpan || !config2.requireParentSpan;
    }
    getSpanName(dataloader, operation) {
      const dataloaderName = dataloader.name;
      if (dataloaderName === void 0 || dataloaderName === null) {
        return `${MODULE_NAME2}.${operation}`;
      }
      return `${MODULE_NAME2}.${operation} ${dataloaderName}`;
    }
    _wrapBatchLoadFn(batchLoadFn) {
      const instrumentation2 = this;
      return function patchedBatchLoadFn(...args) {
        if (!instrumentation2.isEnabled() || !instrumentation2.shouldCreateSpans()) {
          return batchLoadFn.call(this, ...args);
        }
        const parent = api_1.context.active();
        const span = instrumentation2.tracer.startSpan(instrumentation2.getSpanName(this, "batch"), { links: this._batch?.spanLinks }, parent);
        return api_1.context.with(api_1.trace.setSpan(parent, span), () => {
          return batchLoadFn.apply(this, args).then((value) => {
            span.end();
            return value;
          }).catch((err) => {
            span.recordException(err);
            span.setStatus({
              code: api_1.SpanStatusCode.ERROR,
              message: err.message
            });
            span.end();
            throw err;
          });
        });
      };
    }
    _getPatchedConstructor(constructor) {
      const instrumentation2 = this;
      const prototype = constructor.prototype;
      if (!instrumentation2.isEnabled()) {
        return constructor;
      }
      function PatchedDataloader(...args) {
        if (typeof args[0] === "function") {
          if ((0, instrumentation_1.isWrapped)(args[0])) {
            instrumentation2._unwrap(args, 0);
          }
          args[0] = instrumentation2._wrapBatchLoadFn(args[0]);
        }
        return constructor.apply(this, args);
      }
      PatchedDataloader.prototype = prototype;
      return PatchedDataloader;
    }
    _patchLoad(proto) {
      if ((0, instrumentation_1.isWrapped)(proto.load)) {
        this._unwrap(proto, "load");
      }
      this._wrap(proto, "load", this._getPatchedLoad.bind(this));
    }
    _getPatchedLoad(original) {
      const instrumentation2 = this;
      return function patchedLoad(...args) {
        if (!instrumentation2.shouldCreateSpans()) {
          return original.call(this, ...args);
        }
        const parent = api_1.context.active();
        const span = instrumentation2.tracer.startSpan(instrumentation2.getSpanName(this, "load"), { kind: api_1.SpanKind.CLIENT }, parent);
        return api_1.context.with(api_1.trace.setSpan(parent, span), () => {
          const result = original.call(this, ...args).then((value) => {
            span.end();
            return value;
          }).catch((err) => {
            span.recordException(err);
            span.setStatus({
              code: api_1.SpanStatusCode.ERROR,
              message: err.message
            });
            span.end();
            throw err;
          });
          const loader = this;
          if (loader._batch) {
            if (!loader._batch.spanLinks) {
              loader._batch.spanLinks = [];
            }
            loader._batch.spanLinks.push({ context: span.spanContext() });
          }
          return result;
        });
      };
    }
    _patchLoadMany(proto) {
      if ((0, instrumentation_1.isWrapped)(proto.loadMany)) {
        this._unwrap(proto, "loadMany");
      }
      this._wrap(proto, "loadMany", this._getPatchedLoadMany.bind(this));
    }
    _getPatchedLoadMany(original) {
      const instrumentation2 = this;
      return function patchedLoadMany(...args) {
        if (!instrumentation2.shouldCreateSpans()) {
          return original.call(this, ...args);
        }
        const parent = api_1.context.active();
        const span = instrumentation2.tracer.startSpan(instrumentation2.getSpanName(this, "loadMany"), { kind: api_1.SpanKind.CLIENT }, parent);
        return api_1.context.with(api_1.trace.setSpan(parent, span), () => {
          return original.call(this, ...args).then((value) => {
            span.end();
            return value;
          });
        });
      };
    }
    _patchPrime(proto) {
      if ((0, instrumentation_1.isWrapped)(proto.prime)) {
        this._unwrap(proto, "prime");
      }
      this._wrap(proto, "prime", this._getPatchedPrime.bind(this));
    }
    _getPatchedPrime(original) {
      const instrumentation2 = this;
      return function patchedPrime(...args) {
        if (!instrumentation2.shouldCreateSpans()) {
          return original.call(this, ...args);
        }
        const parent = api_1.context.active();
        const span = instrumentation2.tracer.startSpan(instrumentation2.getSpanName(this, "prime"), { kind: api_1.SpanKind.CLIENT }, parent);
        const ret = api_1.context.with(api_1.trace.setSpan(parent, span), () => {
          return original.call(this, ...args);
        });
        span.end();
        return ret;
      };
    }
    _patchClear(proto) {
      if ((0, instrumentation_1.isWrapped)(proto.clear)) {
        this._unwrap(proto, "clear");
      }
      this._wrap(proto, "clear", this._getPatchedClear.bind(this));
    }
    _getPatchedClear(original) {
      const instrumentation2 = this;
      return function patchedClear(...args) {
        if (!instrumentation2.shouldCreateSpans()) {
          return original.call(this, ...args);
        }
        const parent = api_1.context.active();
        const span = instrumentation2.tracer.startSpan(instrumentation2.getSpanName(this, "clear"), { kind: api_1.SpanKind.CLIENT }, parent);
        const ret = api_1.context.with(api_1.trace.setSpan(parent, span), () => {
          return original.call(this, ...args);
        });
        span.end();
        return ret;
      };
    }
    _patchClearAll(proto) {
      if ((0, instrumentation_1.isWrapped)(proto.clearAll)) {
        this._unwrap(proto, "clearAll");
      }
      this._wrap(proto, "clearAll", this._getPatchedClearAll.bind(this));
    }
    _getPatchedClearAll(original) {
      const instrumentation2 = this;
      return function patchedClearAll(...args) {
        if (!instrumentation2.shouldCreateSpans()) {
          return original.call(this, ...args);
        }
        const parent = api_1.context.active();
        const span = instrumentation2.tracer.startSpan(instrumentation2.getSpanName(this, "clearAll"), { kind: api_1.SpanKind.CLIENT }, parent);
        const ret = api_1.context.with(api_1.trace.setSpan(parent, span), () => {
          return original.call(this, ...args);
        });
        span.end();
        return ret;
      };
    }
  }
  instrumentation.DataloaderInstrumentation = DataloaderInstrumentation;
  return instrumentation;
}
var hasRequiredSrc$1;
function requireSrc$1() {
  if (hasRequiredSrc$1) return src$1;
  hasRequiredSrc$1 = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.DataloaderInstrumentation = void 0;
    var instrumentation_1 = requireInstrumentation();
    Object.defineProperty(exports$1, "DataloaderInstrumentation", { enumerable: true, get: function() {
      return instrumentation_1.DataloaderInstrumentation;
    } });
  })(src$1);
  return src$1;
}
var srcExports$1 = requireSrc$1();
const INTEGRATION_NAME$3 = "Dataloader";
const instrumentDataloader = generateInstrumentOnce(
  INTEGRATION_NAME$3,
  () => new srcExports$1.DataloaderInstrumentation({
    requireParentSpan: true
  })
);
const _dataloaderIntegration = (() => {
  let instrumentationWrappedCallback;
  return {
    name: INTEGRATION_NAME$3,
    setupOnce() {
      const instrumentation2 = instrumentDataloader();
      instrumentationWrappedCallback = instrumentWhenWrapped(instrumentation2);
    },
    setup(client) {
      instrumentationWrappedCallback?.(() => {
        client.on("spanStart", (span) => {
          const spanJSON = spanToJSON(span);
          if (spanJSON.description?.startsWith("dataloader")) {
            span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, "auto.db.otel.dataloader");
          }
          if (spanJSON.description === "dataloader.load" || spanJSON.description === "dataloader.loadMany" || spanJSON.description === "dataloader.batch") {
            span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_OP, "cache.get");
          }
        });
      });
    }
  };
});
const dataloaderIntegration = defineIntegration(_dataloaderIntegration);
var src = {};
var amqplib = {};
var semconv = {};
var hasRequiredSemconv;
function requireSemconv() {
  if (hasRequiredSemconv) return semconv;
  hasRequiredSemconv = 1;
  Object.defineProperty(semconv, "__esModule", { value: true });
  semconv.ATTR_NET_PEER_PORT = semconv.ATTR_NET_PEER_NAME = semconv.ATTR_MESSAGING_SYSTEM = semconv.ATTR_MESSAGING_OPERATION = void 0;
  semconv.ATTR_MESSAGING_OPERATION = "messaging.operation";
  semconv.ATTR_MESSAGING_SYSTEM = "messaging.system";
  semconv.ATTR_NET_PEER_NAME = "net.peer.name";
  semconv.ATTR_NET_PEER_PORT = "net.peer.port";
  return semconv;
}
var semconvObsolete = {};
var hasRequiredSemconvObsolete;
function requireSemconvObsolete() {
  if (hasRequiredSemconvObsolete) return semconvObsolete;
  hasRequiredSemconvObsolete = 1;
  Object.defineProperty(semconvObsolete, "__esModule", { value: true });
  semconvObsolete.ATTR_MESSAGING_CONVERSATION_ID = semconvObsolete.OLD_ATTR_MESSAGING_MESSAGE_ID = semconvObsolete.MESSAGING_DESTINATION_KIND_VALUE_TOPIC = semconvObsolete.ATTR_MESSAGING_URL = semconvObsolete.ATTR_MESSAGING_PROTOCOL_VERSION = semconvObsolete.ATTR_MESSAGING_PROTOCOL = semconvObsolete.MESSAGING_OPERATION_VALUE_PROCESS = semconvObsolete.ATTR_MESSAGING_RABBITMQ_ROUTING_KEY = semconvObsolete.ATTR_MESSAGING_DESTINATION_KIND = semconvObsolete.ATTR_MESSAGING_DESTINATION = void 0;
  semconvObsolete.ATTR_MESSAGING_DESTINATION = "messaging.destination";
  semconvObsolete.ATTR_MESSAGING_DESTINATION_KIND = "messaging.destination_kind";
  semconvObsolete.ATTR_MESSAGING_RABBITMQ_ROUTING_KEY = "messaging.rabbitmq.routing_key";
  semconvObsolete.MESSAGING_OPERATION_VALUE_PROCESS = "process";
  semconvObsolete.ATTR_MESSAGING_PROTOCOL = "messaging.protocol";
  semconvObsolete.ATTR_MESSAGING_PROTOCOL_VERSION = "messaging.protocol_version";
  semconvObsolete.ATTR_MESSAGING_URL = "messaging.url";
  semconvObsolete.MESSAGING_DESTINATION_KIND_VALUE_TOPIC = "topic";
  semconvObsolete.OLD_ATTR_MESSAGING_MESSAGE_ID = "messaging.message_id";
  semconvObsolete.ATTR_MESSAGING_CONVERSATION_ID = "messaging.conversation_id";
  return semconvObsolete;
}
var types = {};
var hasRequiredTypes;
function requireTypes() {
  if (hasRequiredTypes) return types;
  hasRequiredTypes = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.DEFAULT_CONFIG = exports$1.EndOperation = void 0;
    (function(EndOperation) {
      EndOperation["AutoAck"] = "auto ack";
      EndOperation["Ack"] = "ack";
      EndOperation["AckAll"] = "ackAll";
      EndOperation["Reject"] = "reject";
      EndOperation["Nack"] = "nack";
      EndOperation["NackAll"] = "nackAll";
      EndOperation["ChannelClosed"] = "channel closed";
      EndOperation["ChannelError"] = "channel error";
      EndOperation["InstrumentationTimeout"] = "instrumentation timeout";
    })(exports$1.EndOperation || (exports$1.EndOperation = {}));
    exports$1.DEFAULT_CONFIG = {
      consumeTimeoutMs: 1e3 * 60,
      useLinksForConsume: false
    };
  })(types);
  return types;
}
var utils = {};
var hasRequiredUtils;
function requireUtils() {
  if (hasRequiredUtils) return utils;
  hasRequiredUtils = 1;
  Object.defineProperty(utils, "__esModule", { value: true });
  utils.isConfirmChannelTracing = utils.unmarkConfirmChannelTracing = utils.markConfirmChannelTracing = utils.getConnectionAttributesFromUrl = utils.getConnectionAttributesFromServer = utils.normalizeExchange = utils.CONNECTION_ATTRIBUTES = utils.CHANNEL_CONSUME_TIMEOUT_TIMER = utils.CHANNEL_SPANS_NOT_ENDED = utils.MESSAGE_STORED_SPAN = void 0;
  const api_1 = require$$0$2;
  const instrumentation_1 = require$$2;
  const semantic_conventions_1 = require$$2$1;
  const semconv_1 = requireSemconv();
  const semconv_obsolete_1 = requireSemconvObsolete();
  utils.MESSAGE_STORED_SPAN = Symbol("opentelemetry.amqplib.message.stored-span");
  utils.CHANNEL_SPANS_NOT_ENDED = Symbol("opentelemetry.amqplib.channel.spans-not-ended");
  utils.CHANNEL_CONSUME_TIMEOUT_TIMER = Symbol("opentelemetry.amqplib.channel.consumer-timeout-timer");
  utils.CONNECTION_ATTRIBUTES = Symbol("opentelemetry.amqplib.connection.attributes");
  const IS_CONFIRM_CHANNEL_CONTEXT_KEY = (0, api_1.createContextKey)("opentelemetry.amqplib.channel.is-confirm-channel");
  const normalizeExchange = (exchangeName) => exchangeName !== "" ? exchangeName : "<default>";
  utils.normalizeExchange = normalizeExchange;
  const censorPassword = (url) => {
    return url.replace(/:[^:@/]*@/, ":***@");
  };
  const getPort = (portFromUrl, resolvedProtocol) => {
    return portFromUrl || (resolvedProtocol === "AMQP" ? 5672 : 5671);
  };
  const getProtocol = (protocolFromUrl) => {
    const resolvedProtocol = protocolFromUrl || "amqp";
    const noEndingColon = resolvedProtocol.endsWith(":") ? resolvedProtocol.substring(0, resolvedProtocol.length - 1) : resolvedProtocol;
    return noEndingColon.toUpperCase();
  };
  const getHostname = (hostnameFromUrl) => {
    return hostnameFromUrl || "localhost";
  };
  const extractConnectionAttributeOrLog = (url, attributeKey, attributeValue, nameForLog) => {
    if (attributeValue) {
      return { [attributeKey]: attributeValue };
    } else {
      api_1.diag.error(`amqplib instrumentation: could not extract connection attribute ${nameForLog} from user supplied url`, {
        url
      });
      return {};
    }
  };
  const getConnectionAttributesFromServer = (conn) => {
    const product = conn.serverProperties.product?.toLowerCase?.();
    if (product) {
      return {
        [semconv_1.ATTR_MESSAGING_SYSTEM]: product
      };
    } else {
      return {};
    }
  };
  utils.getConnectionAttributesFromServer = getConnectionAttributesFromServer;
  const getConnectionAttributesFromUrl = (url, netSemconvStability) => {
    const attributes = {
      [semconv_obsolete_1.ATTR_MESSAGING_PROTOCOL_VERSION]: "0.9.1"
      // this is the only protocol supported by the instrumented library
    };
    url = url || "amqp://localhost";
    if (typeof url === "object") {
      const connectOptions = url;
      const protocol = getProtocol(connectOptions?.protocol);
      Object.assign(attributes, {
        ...extractConnectionAttributeOrLog(url, semconv_obsolete_1.ATTR_MESSAGING_PROTOCOL, protocol, "protocol")
      });
      const hostname = getHostname(connectOptions?.hostname);
      if (netSemconvStability & instrumentation_1.SemconvStability.OLD) {
        Object.assign(attributes, {
          ...extractConnectionAttributeOrLog(url, semconv_1.ATTR_NET_PEER_NAME, hostname, "hostname")
        });
      }
      if (netSemconvStability & instrumentation_1.SemconvStability.STABLE) {
        Object.assign(attributes, {
          ...extractConnectionAttributeOrLog(url, semantic_conventions_1.ATTR_SERVER_ADDRESS, hostname, "hostname")
        });
      }
      const port = getPort(connectOptions.port, protocol);
      if (netSemconvStability & instrumentation_1.SemconvStability.OLD) {
        Object.assign(attributes, extractConnectionAttributeOrLog(url, semconv_1.ATTR_NET_PEER_PORT, port, "port"));
      }
      if (netSemconvStability & instrumentation_1.SemconvStability.STABLE) {
        Object.assign(attributes, extractConnectionAttributeOrLog(url, semantic_conventions_1.ATTR_SERVER_PORT, port, "port"));
      }
    } else {
      const censoredUrl = censorPassword(url);
      attributes[semconv_obsolete_1.ATTR_MESSAGING_URL] = censoredUrl;
      try {
        const urlParts = new URL(censoredUrl);
        const protocol = getProtocol(urlParts.protocol);
        Object.assign(attributes, {
          ...extractConnectionAttributeOrLog(censoredUrl, semconv_obsolete_1.ATTR_MESSAGING_PROTOCOL, protocol, "protocol")
        });
        const hostname = getHostname(urlParts.hostname);
        if (netSemconvStability & instrumentation_1.SemconvStability.OLD) {
          Object.assign(attributes, {
            ...extractConnectionAttributeOrLog(censoredUrl, semconv_1.ATTR_NET_PEER_NAME, hostname, "hostname")
          });
        }
        if (netSemconvStability & instrumentation_1.SemconvStability.STABLE) {
          Object.assign(attributes, {
            ...extractConnectionAttributeOrLog(censoredUrl, semantic_conventions_1.ATTR_SERVER_ADDRESS, hostname, "hostname")
          });
        }
        const port = getPort(urlParts.port ? parseInt(urlParts.port) : void 0, protocol);
        if (netSemconvStability & instrumentation_1.SemconvStability.OLD) {
          Object.assign(attributes, extractConnectionAttributeOrLog(censoredUrl, semconv_1.ATTR_NET_PEER_PORT, port, "port"));
        }
        if (netSemconvStability & instrumentation_1.SemconvStability.STABLE) {
          Object.assign(attributes, extractConnectionAttributeOrLog(censoredUrl, semantic_conventions_1.ATTR_SERVER_PORT, port, "port"));
        }
      } catch (err) {
        api_1.diag.error("amqplib instrumentation: error while extracting connection details from connection url", {
          censoredUrl,
          err
        });
      }
    }
    return attributes;
  };
  utils.getConnectionAttributesFromUrl = getConnectionAttributesFromUrl;
  const markConfirmChannelTracing = (context2) => {
    return context2.setValue(IS_CONFIRM_CHANNEL_CONTEXT_KEY, true);
  };
  utils.markConfirmChannelTracing = markConfirmChannelTracing;
  const unmarkConfirmChannelTracing = (context2) => {
    return context2.deleteValue(IS_CONFIRM_CHANNEL_CONTEXT_KEY);
  };
  utils.unmarkConfirmChannelTracing = unmarkConfirmChannelTracing;
  const isConfirmChannelTracing = (context2) => {
    return context2.getValue(IS_CONFIRM_CHANNEL_CONTEXT_KEY) === true;
  };
  utils.isConfirmChannelTracing = isConfirmChannelTracing;
  return utils;
}
var version = {};
var hasRequiredVersion;
function requireVersion() {
  if (hasRequiredVersion) return version;
  hasRequiredVersion = 1;
  Object.defineProperty(version, "__esModule", { value: true });
  version.PACKAGE_NAME = version.PACKAGE_VERSION = void 0;
  version.PACKAGE_VERSION = "0.58.0";
  version.PACKAGE_NAME = "@opentelemetry/instrumentation-amqplib";
  return version;
}
var hasRequiredAmqplib;
function requireAmqplib() {
  if (hasRequiredAmqplib) return amqplib;
  hasRequiredAmqplib = 1;
  Object.defineProperty(amqplib, "__esModule", { value: true });
  amqplib.AmqplibInstrumentation = void 0;
  const api_1 = require$$0$2;
  const core_1 = require$$1$1;
  const instrumentation_1 = require$$2;
  const semconv_1 = requireSemconv();
  const semconv_obsolete_1 = requireSemconvObsolete();
  const types_1 = requireTypes();
  const utils_1 = requireUtils();
  const version_1 = requireVersion();
  const supportedVersions2 = [">=0.5.5 <1"];
  class AmqplibInstrumentation extends instrumentation_1.InstrumentationBase {
    _netSemconvStability;
    constructor(config2 = {}) {
      super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, { ...types_1.DEFAULT_CONFIG, ...config2 });
      this._setSemconvStabilityFromEnv();
    }
    // Used for testing.
    _setSemconvStabilityFromEnv() {
      this._netSemconvStability = (0, instrumentation_1.semconvStabilityFromStr)("http", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
    }
    setConfig(config2 = {}) {
      super.setConfig({ ...types_1.DEFAULT_CONFIG, ...config2 });
    }
    init() {
      const channelModelModuleFile = new instrumentation_1.InstrumentationNodeModuleFile("amqplib/lib/channel_model.js", supportedVersions2, this.patchChannelModel.bind(this), this.unpatchChannelModel.bind(this));
      const callbackModelModuleFile = new instrumentation_1.InstrumentationNodeModuleFile("amqplib/lib/callback_model.js", supportedVersions2, this.patchChannelModel.bind(this), this.unpatchChannelModel.bind(this));
      const connectModuleFile = new instrumentation_1.InstrumentationNodeModuleFile("amqplib/lib/connect.js", supportedVersions2, this.patchConnect.bind(this), this.unpatchConnect.bind(this));
      const module2 = new instrumentation_1.InstrumentationNodeModuleDefinition("amqplib", supportedVersions2, void 0, void 0, [channelModelModuleFile, connectModuleFile, callbackModelModuleFile]);
      return module2;
    }
    patchConnect(moduleExports) {
      moduleExports = this.unpatchConnect(moduleExports);
      if (!(0, instrumentation_1.isWrapped)(moduleExports.connect)) {
        this._wrap(moduleExports, "connect", this.getConnectPatch.bind(this));
      }
      return moduleExports;
    }
    unpatchConnect(moduleExports) {
      if ((0, instrumentation_1.isWrapped)(moduleExports.connect)) {
        this._unwrap(moduleExports, "connect");
      }
      return moduleExports;
    }
    patchChannelModel(moduleExports, moduleVersion) {
      if (!(0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.publish)) {
        this._wrap(moduleExports.Channel.prototype, "publish", this.getPublishPatch.bind(this, moduleVersion));
      }
      if (!(0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.consume)) {
        this._wrap(moduleExports.Channel.prototype, "consume", this.getConsumePatch.bind(this, moduleVersion));
      }
      if (!(0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.ack)) {
        this._wrap(moduleExports.Channel.prototype, "ack", this.getAckPatch.bind(this, false, types_1.EndOperation.Ack));
      }
      if (!(0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.nack)) {
        this._wrap(moduleExports.Channel.prototype, "nack", this.getAckPatch.bind(this, true, types_1.EndOperation.Nack));
      }
      if (!(0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.reject)) {
        this._wrap(moduleExports.Channel.prototype, "reject", this.getAckPatch.bind(this, true, types_1.EndOperation.Reject));
      }
      if (!(0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.ackAll)) {
        this._wrap(moduleExports.Channel.prototype, "ackAll", this.getAckAllPatch.bind(this, false, types_1.EndOperation.AckAll));
      }
      if (!(0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.nackAll)) {
        this._wrap(moduleExports.Channel.prototype, "nackAll", this.getAckAllPatch.bind(this, true, types_1.EndOperation.NackAll));
      }
      if (!(0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.emit)) {
        this._wrap(moduleExports.Channel.prototype, "emit", this.getChannelEmitPatch.bind(this));
      }
      if (!(0, instrumentation_1.isWrapped)(moduleExports.ConfirmChannel.prototype.publish)) {
        this._wrap(moduleExports.ConfirmChannel.prototype, "publish", this.getConfirmedPublishPatch.bind(this, moduleVersion));
      }
      return moduleExports;
    }
    unpatchChannelModel(moduleExports) {
      if ((0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.publish)) {
        this._unwrap(moduleExports.Channel.prototype, "publish");
      }
      if ((0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.consume)) {
        this._unwrap(moduleExports.Channel.prototype, "consume");
      }
      if ((0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.ack)) {
        this._unwrap(moduleExports.Channel.prototype, "ack");
      }
      if ((0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.nack)) {
        this._unwrap(moduleExports.Channel.prototype, "nack");
      }
      if ((0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.reject)) {
        this._unwrap(moduleExports.Channel.prototype, "reject");
      }
      if ((0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.ackAll)) {
        this._unwrap(moduleExports.Channel.prototype, "ackAll");
      }
      if ((0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.nackAll)) {
        this._unwrap(moduleExports.Channel.prototype, "nackAll");
      }
      if ((0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.emit)) {
        this._unwrap(moduleExports.Channel.prototype, "emit");
      }
      if ((0, instrumentation_1.isWrapped)(moduleExports.ConfirmChannel.prototype.publish)) {
        this._unwrap(moduleExports.ConfirmChannel.prototype, "publish");
      }
      return moduleExports;
    }
    getConnectPatch(original) {
      const self = this;
      return function patchedConnect(url, socketOptions, openCallback) {
        return original.call(this, url, socketOptions, function(err, conn) {
          if (err == null) {
            const urlAttributes = (0, utils_1.getConnectionAttributesFromUrl)(url, self._netSemconvStability);
            const serverAttributes = (0, utils_1.getConnectionAttributesFromServer)(conn);
            conn[utils_1.CONNECTION_ATTRIBUTES] = {
              ...urlAttributes,
              ...serverAttributes
            };
          }
          openCallback.apply(this, arguments);
        });
      };
    }
    getChannelEmitPatch(original) {
      const self = this;
      return function emit(eventName) {
        if (eventName === "close") {
          self.endAllSpansOnChannel(this, true, types_1.EndOperation.ChannelClosed, void 0);
          const activeTimer = this[utils_1.CHANNEL_CONSUME_TIMEOUT_TIMER];
          if (activeTimer) {
            clearInterval(activeTimer);
          }
          this[utils_1.CHANNEL_CONSUME_TIMEOUT_TIMER] = void 0;
        } else if (eventName === "error") {
          self.endAllSpansOnChannel(this, true, types_1.EndOperation.ChannelError, void 0);
        }
        return original.apply(this, arguments);
      };
    }
    getAckAllPatch(isRejected, endOperation, original) {
      const self = this;
      return function ackAll(requeueOrEmpty) {
        self.endAllSpansOnChannel(this, isRejected, endOperation, requeueOrEmpty);
        return original.apply(this, arguments);
      };
    }
    getAckPatch(isRejected, endOperation, original) {
      const self = this;
      return function ack(message, allUpToOrRequeue, requeue) {
        const channel = this;
        const requeueResolved = endOperation === types_1.EndOperation.Reject ? allUpToOrRequeue : requeue;
        const spansNotEnded = channel[utils_1.CHANNEL_SPANS_NOT_ENDED] ?? [];
        const msgIndex = spansNotEnded.findIndex((msgDetails) => msgDetails.msg === message);
        if (msgIndex < 0) {
          self.endConsumerSpan(message, isRejected, endOperation, requeueResolved);
        } else if (endOperation !== types_1.EndOperation.Reject && allUpToOrRequeue) {
          for (let i = 0; i <= msgIndex; i++) {
            self.endConsumerSpan(spansNotEnded[i].msg, isRejected, endOperation, requeueResolved);
          }
          spansNotEnded.splice(0, msgIndex + 1);
        } else {
          self.endConsumerSpan(message, isRejected, endOperation, requeueResolved);
          spansNotEnded.splice(msgIndex, 1);
        }
        return original.apply(this, arguments);
      };
    }
    getConsumePatch(moduleVersion, original) {
      const self = this;
      return function consume(queue, onMessage, options) {
        const channel = this;
        if (!Object.prototype.hasOwnProperty.call(channel, utils_1.CHANNEL_SPANS_NOT_ENDED)) {
          const { consumeTimeoutMs } = self.getConfig();
          if (consumeTimeoutMs) {
            const timer = setInterval(() => {
              self.checkConsumeTimeoutOnChannel(channel);
            }, consumeTimeoutMs);
            timer.unref();
            channel[utils_1.CHANNEL_CONSUME_TIMEOUT_TIMER] = timer;
          }
          channel[utils_1.CHANNEL_SPANS_NOT_ENDED] = [];
        }
        const patchedOnMessage = function(msg) {
          if (!msg) {
            return onMessage.call(this, msg);
          }
          const headers = msg.properties.headers ?? {};
          let parentContext = api_1.propagation.extract(api_1.ROOT_CONTEXT, headers);
          const exchange = msg.fields?.exchange;
          let links;
          if (self._config.useLinksForConsume) {
            const parentSpanContext = parentContext ? api_1.trace.getSpan(parentContext)?.spanContext() : void 0;
            parentContext = void 0;
            if (parentSpanContext) {
              links = [
                {
                  context: parentSpanContext
                }
              ];
            }
          }
          const span = self.tracer.startSpan(`${queue} process`, {
            kind: api_1.SpanKind.CONSUMER,
            attributes: {
              ...channel?.connection?.[utils_1.CONNECTION_ATTRIBUTES],
              [semconv_obsolete_1.ATTR_MESSAGING_DESTINATION]: exchange,
              [semconv_obsolete_1.ATTR_MESSAGING_DESTINATION_KIND]: semconv_obsolete_1.MESSAGING_DESTINATION_KIND_VALUE_TOPIC,
              [semconv_obsolete_1.ATTR_MESSAGING_RABBITMQ_ROUTING_KEY]: msg.fields?.routingKey,
              [semconv_1.ATTR_MESSAGING_OPERATION]: semconv_obsolete_1.MESSAGING_OPERATION_VALUE_PROCESS,
              [semconv_obsolete_1.OLD_ATTR_MESSAGING_MESSAGE_ID]: msg?.properties.messageId,
              [semconv_obsolete_1.ATTR_MESSAGING_CONVERSATION_ID]: msg?.properties.correlationId
            },
            links
          }, parentContext);
          const { consumeHook } = self.getConfig();
          if (consumeHook) {
            (0, instrumentation_1.safeExecuteInTheMiddle)(() => consumeHook(span, { moduleVersion, msg }), (e) => {
              if (e) {
                api_1.diag.error("amqplib instrumentation: consumerHook error", e);
              }
            }, true);
          }
          if (!options?.noAck) {
            channel[utils_1.CHANNEL_SPANS_NOT_ENDED].push({
              msg,
              timeOfConsume: (0, core_1.hrTime)()
            });
            msg[utils_1.MESSAGE_STORED_SPAN] = span;
          }
          const setContext = parentContext ? parentContext : api_1.ROOT_CONTEXT;
          api_1.context.with(api_1.trace.setSpan(setContext, span), () => {
            onMessage.call(this, msg);
          });
          if (options?.noAck) {
            self.callConsumeEndHook(span, msg, false, types_1.EndOperation.AutoAck);
            span.end();
          }
        };
        arguments[1] = patchedOnMessage;
        return original.apply(this, arguments);
      };
    }
    getConfirmedPublishPatch(moduleVersion, original) {
      const self = this;
      return function confirmedPublish(exchange, routingKey, content, options, callback) {
        const channel = this;
        const { span, modifiedOptions } = self.createPublishSpan(self, exchange, routingKey, channel, options);
        const { publishHook } = self.getConfig();
        if (publishHook) {
          (0, instrumentation_1.safeExecuteInTheMiddle)(() => publishHook(span, {
            moduleVersion,
            exchange,
            routingKey,
            content,
            options: modifiedOptions,
            isConfirmChannel: true
          }), (e) => {
            if (e) {
              api_1.diag.error("amqplib instrumentation: publishHook error", e);
            }
          }, true);
        }
        const patchedOnConfirm = function(err, ok) {
          try {
            callback?.call(this, err, ok);
          } finally {
            const { publishConfirmHook } = self.getConfig();
            if (publishConfirmHook) {
              (0, instrumentation_1.safeExecuteInTheMiddle)(() => publishConfirmHook(span, {
                moduleVersion,
                exchange,
                routingKey,
                content,
                options,
                isConfirmChannel: true,
                confirmError: err
              }), (e) => {
                if (e) {
                  api_1.diag.error("amqplib instrumentation: publishConfirmHook error", e);
                }
              }, true);
            }
            if (err) {
              span.setStatus({
                code: api_1.SpanStatusCode.ERROR,
                message: "message confirmation has been nack'ed"
              });
            }
            span.end();
          }
        };
        const markedContext = (0, utils_1.markConfirmChannelTracing)(api_1.context.active());
        const argumentsCopy = [...arguments];
        argumentsCopy[3] = modifiedOptions;
        argumentsCopy[4] = api_1.context.bind((0, utils_1.unmarkConfirmChannelTracing)(api_1.trace.setSpan(markedContext, span)), patchedOnConfirm);
        return api_1.context.with(markedContext, original.bind(this, ...argumentsCopy));
      };
    }
    getPublishPatch(moduleVersion, original) {
      const self = this;
      return function publish(exchange, routingKey, content, options) {
        if ((0, utils_1.isConfirmChannelTracing)(api_1.context.active())) {
          return original.apply(this, arguments);
        } else {
          const channel = this;
          const { span, modifiedOptions } = self.createPublishSpan(self, exchange, routingKey, channel, options);
          const { publishHook } = self.getConfig();
          if (publishHook) {
            (0, instrumentation_1.safeExecuteInTheMiddle)(() => publishHook(span, {
              moduleVersion,
              exchange,
              routingKey,
              content,
              options: modifiedOptions,
              isConfirmChannel: false
            }), (e) => {
              if (e) {
                api_1.diag.error("amqplib instrumentation: publishHook error", e);
              }
            }, true);
          }
          const argumentsCopy = [...arguments];
          argumentsCopy[3] = modifiedOptions;
          const originalRes = original.apply(this, argumentsCopy);
          span.end();
          return originalRes;
        }
      };
    }
    createPublishSpan(self, exchange, routingKey, channel, options) {
      const normalizedExchange = (0, utils_1.normalizeExchange)(exchange);
      const span = self.tracer.startSpan(`publish ${normalizedExchange}`, {
        kind: api_1.SpanKind.PRODUCER,
        attributes: {
          ...channel.connection[utils_1.CONNECTION_ATTRIBUTES],
          [semconv_obsolete_1.ATTR_MESSAGING_DESTINATION]: exchange,
          [semconv_obsolete_1.ATTR_MESSAGING_DESTINATION_KIND]: semconv_obsolete_1.MESSAGING_DESTINATION_KIND_VALUE_TOPIC,
          [semconv_obsolete_1.ATTR_MESSAGING_RABBITMQ_ROUTING_KEY]: routingKey,
          [semconv_obsolete_1.OLD_ATTR_MESSAGING_MESSAGE_ID]: options?.messageId,
          [semconv_obsolete_1.ATTR_MESSAGING_CONVERSATION_ID]: options?.correlationId
        }
      });
      const modifiedOptions = options ?? {};
      modifiedOptions.headers = modifiedOptions.headers ?? {};
      api_1.propagation.inject(api_1.trace.setSpan(api_1.context.active(), span), modifiedOptions.headers);
      return { span, modifiedOptions };
    }
    endConsumerSpan(message, isRejected, operation, requeue) {
      const storedSpan = message[utils_1.MESSAGE_STORED_SPAN];
      if (!storedSpan)
        return;
      if (isRejected !== false) {
        storedSpan.setStatus({
          code: api_1.SpanStatusCode.ERROR,
          message: operation !== types_1.EndOperation.ChannelClosed && operation !== types_1.EndOperation.ChannelError ? `${operation} called on message${requeue === true ? " with requeue" : requeue === false ? " without requeue" : ""}` : operation
        });
      }
      this.callConsumeEndHook(storedSpan, message, isRejected, operation);
      storedSpan.end();
      message[utils_1.MESSAGE_STORED_SPAN] = void 0;
    }
    endAllSpansOnChannel(channel, isRejected, operation, requeue) {
      const spansNotEnded = channel[utils_1.CHANNEL_SPANS_NOT_ENDED] ?? [];
      spansNotEnded.forEach((msgDetails) => {
        this.endConsumerSpan(msgDetails.msg, isRejected, operation, requeue);
      });
      channel[utils_1.CHANNEL_SPANS_NOT_ENDED] = [];
    }
    callConsumeEndHook(span, msg, rejected, endOperation) {
      const { consumeEndHook } = this.getConfig();
      if (!consumeEndHook)
        return;
      (0, instrumentation_1.safeExecuteInTheMiddle)(() => consumeEndHook(span, { msg, rejected, endOperation }), (e) => {
        if (e) {
          api_1.diag.error("amqplib instrumentation: consumerEndHook error", e);
        }
      }, true);
    }
    checkConsumeTimeoutOnChannel(channel) {
      const currentTime = (0, core_1.hrTime)();
      const spansNotEnded = channel[utils_1.CHANNEL_SPANS_NOT_ENDED] ?? [];
      let i;
      const { consumeTimeoutMs } = this.getConfig();
      for (i = 0; i < spansNotEnded.length; i++) {
        const currMessage = spansNotEnded[i];
        const timeFromConsume = (0, core_1.hrTimeDuration)(currMessage.timeOfConsume, currentTime);
        if ((0, core_1.hrTimeToMilliseconds)(timeFromConsume) < consumeTimeoutMs) {
          break;
        }
        this.endConsumerSpan(currMessage.msg, null, types_1.EndOperation.InstrumentationTimeout, true);
      }
      spansNotEnded.splice(0, i);
    }
  }
  amqplib.AmqplibInstrumentation = AmqplibInstrumentation;
  return amqplib;
}
var hasRequiredSrc;
function requireSrc() {
  if (hasRequiredSrc) return src;
  hasRequiredSrc = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.EndOperation = exports$1.DEFAULT_CONFIG = exports$1.AmqplibInstrumentation = void 0;
    var amqplib_1 = requireAmqplib();
    Object.defineProperty(exports$1, "AmqplibInstrumentation", { enumerable: true, get: function() {
      return amqplib_1.AmqplibInstrumentation;
    } });
    var types_1 = requireTypes();
    Object.defineProperty(exports$1, "DEFAULT_CONFIG", { enumerable: true, get: function() {
      return types_1.DEFAULT_CONFIG;
    } });
    Object.defineProperty(exports$1, "EndOperation", { enumerable: true, get: function() {
      return types_1.EndOperation;
    } });
  })(src);
  return src;
}
var srcExports = requireSrc();
const INTEGRATION_NAME$2 = "Amqplib";
const config$1 = {
  consumeEndHook: (span) => {
    addOriginToSpan(span, "auto.amqplib.otel.consumer");
  },
  publishHook: (span) => {
    addOriginToSpan(span, "auto.amqplib.otel.publisher");
  }
};
const instrumentAmqplib = generateInstrumentOnce(INTEGRATION_NAME$2, () => new srcExports.AmqplibInstrumentation(config$1));
const _amqplibIntegration = (() => {
  return {
    name: INTEGRATION_NAME$2,
    setupOnce() {
      instrumentAmqplib();
    }
  };
});
const amqplibIntegration = defineIntegration(_amqplibIntegration);
const INTEGRATION_NAME$1 = "VercelAI";
const SUPPORTED_VERSIONS = [">=3.0.0 <7"];
const INSTRUMENTED_METHODS = [
  "generateText",
  "streamText",
  "generateObject",
  "streamObject",
  "embed",
  "embedMany",
  "rerank"
];
function isToolError(obj) {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  const candidate = obj;
  return "type" in candidate && "error" in candidate && "toolName" in candidate && "toolCallId" in candidate && candidate.type === "tool-error" && candidate.error instanceof Error;
}
function checkResultForToolErrors(result) {
  if (typeof result !== "object" || result === null || !("content" in result)) {
    return;
  }
  const resultObj = result;
  if (!Array.isArray(resultObj.content)) {
    return;
  }
  for (const item of resultObj.content) {
    if (isToolError(item)) {
      const associatedSpan = _INTERNAL_getSpanForToolCallId(item.toolCallId);
      if (associatedSpan) {
        const spanContext = associatedSpan.spanContext();
        withScope((scope) => {
          scope.setContext("trace", {
            trace_id: spanContext.traceId,
            span_id: spanContext.spanId
          });
          scope.setTag("vercel.ai.tool.name", item.toolName);
          scope.setTag("vercel.ai.tool.callId", item.toolCallId);
          scope.setLevel("error");
          captureException(item.error, {
            mechanism: {
              type: "auto.vercelai.otel",
              handled: false
            }
          });
        });
        _INTERNAL_cleanupToolCallSpan(item.toolCallId);
      } else {
        withScope((scope) => {
          scope.setTag("vercel.ai.tool.name", item.toolName);
          scope.setTag("vercel.ai.tool.callId", item.toolCallId);
          scope.setLevel("error");
          captureException(item.error, {
            mechanism: {
              type: "auto.vercelai.otel",
              handled: false
            }
          });
        });
      }
    }
  }
}
function determineRecordingSettings(integrationRecordingOptions, methodTelemetryOptions, telemetryExplicitlyEnabled, defaultRecordingEnabled) {
  const recordInputs = integrationRecordingOptions?.recordInputs !== void 0 ? integrationRecordingOptions.recordInputs : methodTelemetryOptions.recordInputs !== void 0 ? methodTelemetryOptions.recordInputs : telemetryExplicitlyEnabled === true ? true : defaultRecordingEnabled;
  const recordOutputs = integrationRecordingOptions?.recordOutputs !== void 0 ? integrationRecordingOptions.recordOutputs : methodTelemetryOptions.recordOutputs !== void 0 ? methodTelemetryOptions.recordOutputs : telemetryExplicitlyEnabled === true ? true : defaultRecordingEnabled;
  return { recordInputs, recordOutputs };
}
class SentryVercelAiInstrumentation extends InstrumentationBase$2 {
  __init() {
    this._isPatched = false;
  }
  __init2() {
    this._callbacks = [];
  }
  constructor(config2 = {}) {
    super("@sentry/instrumentation-vercel-ai", SDK_VERSION, config2);
    SentryVercelAiInstrumentation.prototype.__init.call(this);
    SentryVercelAiInstrumentation.prototype.__init2.call(this);
  }
  /**
   * Initializes the instrumentation by defining the modules to be patched.
   */
  init() {
    const module2 = new InstrumentationNodeModuleDefinition$2("ai", SUPPORTED_VERSIONS, this._patch.bind(this));
    return module2;
  }
  /**
   * Call the provided callback when the module is patched.
   * If it has already been patched, the callback will be called immediately.
   */
  callWhenPatched(callback) {
    if (this._isPatched) {
      callback();
    } else {
      this._callbacks.push(callback);
    }
  }
  /**
   * Patches module exports to enable Vercel AI telemetry.
   */
  _patch(moduleExports) {
    this._isPatched = true;
    this._callbacks.forEach((callback) => callback());
    this._callbacks = [];
    const generatePatch = (originalMethod) => {
      return new Proxy(originalMethod, {
        apply: (target, thisArg, args) => {
          const existingExperimentalTelemetry = args[0].experimental_telemetry || {};
          const isEnabled2 = existingExperimentalTelemetry.isEnabled;
          const client = getClient();
          const integration = client?.getIntegrationByName(INTEGRATION_NAME$1);
          const integrationOptions = integration?.options;
          const shouldRecordInputsAndOutputs = integration ? Boolean(client?.getOptions().sendDefaultPii) : false;
          const { recordInputs, recordOutputs } = determineRecordingSettings(
            integrationOptions,
            existingExperimentalTelemetry,
            isEnabled2,
            shouldRecordInputsAndOutputs
          );
          args[0].experimental_telemetry = {
            ...existingExperimentalTelemetry,
            isEnabled: isEnabled2 !== void 0 ? isEnabled2 : true,
            recordInputs,
            recordOutputs
          };
          return handleCallbackErrors(
            () => Reflect.apply(target, thisArg, args),
            (error2) => {
              if (error2 && typeof error2 === "object") {
                addNonEnumerableProperty(error2, "_sentry_active_span", getActiveSpan());
              }
            },
            () => {
            },
            (result) => {
              checkResultForToolErrors(result);
            }
          );
        }
      });
    };
    if (Object.prototype.toString.call(moduleExports) === "[object Module]") {
      for (const method of INSTRUMENTED_METHODS) {
        if (moduleExports[method] != null) {
          moduleExports[method] = generatePatch(moduleExports[method]);
        }
      }
      return moduleExports;
    } else {
      const patchedModuleExports = INSTRUMENTED_METHODS.reduce((acc, curr) => {
        if (moduleExports[curr] != null) {
          acc[curr] = generatePatch(moduleExports[curr]);
        }
        return acc;
      }, {});
      return { ...moduleExports, ...patchedModuleExports };
    }
  }
}
const instrumentVercelAi = generateInstrumentOnce(INTEGRATION_NAME$1, () => new SentryVercelAiInstrumentation({}));
function shouldForceIntegration(client) {
  const modules = client.getIntegrationByName("Modules");
  return !!modules?.getModules?.()?.ai;
}
const _vercelAIIntegration = ((options = {}) => {
  let instrumentation2;
  return {
    name: INTEGRATION_NAME$1,
    options,
    setupOnce() {
      instrumentation2 = instrumentVercelAi();
    },
    afterAllSetup(client) {
      const shouldForce = options.force ?? shouldForceIntegration(client);
      if (shouldForce) {
        addVercelAiProcessors(client);
      } else {
        instrumentation2?.callWhenPatched(() => addVercelAiProcessors(client));
      }
    }
  };
});
const vercelAIIntegration = defineIntegration(_vercelAIIntegration);
const supportedVersions$4 = [">=4.0.0 <7"];
class SentryOpenAiInstrumentation extends InstrumentationBase$2 {
  constructor(config2 = {}) {
    super("@sentry/instrumentation-openai", SDK_VERSION, config2);
  }
  /**
   * Initializes the instrumentation by defining the modules to be patched.
   */
  init() {
    const module2 = new InstrumentationNodeModuleDefinition$2("openai", supportedVersions$4, this._patch.bind(this));
    return module2;
  }
  /**
   * Core patch logic applying instrumentation to the OpenAI and AzureOpenAI client constructors.
   */
  _patch(exports$1) {
    let result = exports$1;
    result = this._patchClient(result, "OpenAI");
    result = this._patchClient(result, "AzureOpenAI");
    return result;
  }
  /**
   * Patch logic applying instrumentation to the specified client constructor.
   */
  _patchClient(exports$1, exportKey) {
    const Original = exports$1[exportKey];
    if (!Original) {
      return exports$1;
    }
    const config2 = this.getConfig();
    const WrappedOpenAI = function(...args) {
      if (_INTERNAL_shouldSkipAiProviderWrapping(OPENAI_INTEGRATION_NAME)) {
        return Reflect.construct(Original, args);
      }
      const instance = Reflect.construct(Original, args);
      const client = getClient();
      const defaultPii = Boolean(client?.getOptions().sendDefaultPii);
      const recordInputs = config2.recordInputs ?? defaultPii;
      const recordOutputs = config2.recordOutputs ?? defaultPii;
      return instrumentOpenAiClient(instance, {
        recordInputs,
        recordOutputs
      });
    };
    Object.setPrototypeOf(WrappedOpenAI, Original);
    Object.setPrototypeOf(WrappedOpenAI.prototype, Original.prototype);
    for (const key of Object.getOwnPropertyNames(Original)) {
      if (!["length", "name", "prototype"].includes(key)) {
        const descriptor = Object.getOwnPropertyDescriptor(Original, key);
        if (descriptor) {
          Object.defineProperty(WrappedOpenAI, key, descriptor);
        }
      }
    }
    try {
      exports$1[exportKey] = WrappedOpenAI;
    } catch (error2) {
      Object.defineProperty(exports$1, exportKey, {
        value: WrappedOpenAI,
        writable: true,
        configurable: true,
        enumerable: true
      });
    }
    if (exports$1.default === Original) {
      try {
        exports$1.default = WrappedOpenAI;
      } catch (error2) {
        Object.defineProperty(exports$1, "default", {
          value: WrappedOpenAI,
          writable: true,
          configurable: true,
          enumerable: true
        });
      }
    }
    return exports$1;
  }
}
const instrumentOpenAi = generateInstrumentOnce(
  OPENAI_INTEGRATION_NAME,
  (options) => new SentryOpenAiInstrumentation(options)
);
const _openAiIntegration = ((options = {}) => {
  return {
    name: OPENAI_INTEGRATION_NAME,
    setupOnce() {
      instrumentOpenAi(options);
    }
  };
});
const openAIIntegration = defineIntegration(_openAiIntegration);
const supportedVersions$3 = [">=0.19.2 <1.0.0"];
class SentryAnthropicAiInstrumentation extends InstrumentationBase$2 {
  constructor(config2 = {}) {
    super("@sentry/instrumentation-anthropic-ai", SDK_VERSION, config2);
  }
  /**
   * Initializes the instrumentation by defining the modules to be patched.
   */
  init() {
    const module2 = new InstrumentationNodeModuleDefinition$2(
      "@anthropic-ai/sdk",
      supportedVersions$3,
      this._patch.bind(this)
    );
    return module2;
  }
  /**
   * Core patch logic applying instrumentation to the Anthropic AI client constructor.
   */
  _patch(exports$1) {
    const Original = exports$1.Anthropic;
    const config2 = this.getConfig();
    const WrappedAnthropic = function(...args) {
      if (_INTERNAL_shouldSkipAiProviderWrapping(ANTHROPIC_AI_INTEGRATION_NAME)) {
        return Reflect.construct(Original, args);
      }
      const instance = Reflect.construct(Original, args);
      const client = getClient();
      const defaultPii = Boolean(client?.getOptions().sendDefaultPii);
      const recordInputs = config2.recordInputs ?? defaultPii;
      const recordOutputs = config2.recordOutputs ?? defaultPii;
      return instrumentAnthropicAiClient(instance, {
        recordInputs,
        recordOutputs
      });
    };
    Object.setPrototypeOf(WrappedAnthropic, Original);
    Object.setPrototypeOf(WrappedAnthropic.prototype, Original.prototype);
    for (const key of Object.getOwnPropertyNames(Original)) {
      if (!["length", "name", "prototype"].includes(key)) {
        const descriptor = Object.getOwnPropertyDescriptor(Original, key);
        if (descriptor) {
          Object.defineProperty(WrappedAnthropic, key, descriptor);
        }
      }
    }
    try {
      exports$1.Anthropic = WrappedAnthropic;
    } catch (error2) {
      Object.defineProperty(exports$1, "Anthropic", {
        value: WrappedAnthropic,
        writable: true,
        configurable: true,
        enumerable: true
      });
    }
    if (exports$1.default === Original) {
      try {
        exports$1.default = WrappedAnthropic;
      } catch (error2) {
        Object.defineProperty(exports$1, "default", {
          value: WrappedAnthropic,
          writable: true,
          configurable: true,
          enumerable: true
        });
      }
    }
    return exports$1;
  }
}
const instrumentAnthropicAi = generateInstrumentOnce(
  ANTHROPIC_AI_INTEGRATION_NAME,
  (options) => new SentryAnthropicAiInstrumentation(options)
);
const _anthropicAIIntegration = ((options = {}) => {
  return {
    name: ANTHROPIC_AI_INTEGRATION_NAME,
    options,
    setupOnce() {
      instrumentAnthropicAi(options);
    }
  };
});
const anthropicAIIntegration = defineIntegration(_anthropicAIIntegration);
const supportedVersions$2 = [">=0.10.0 <2"];
class SentryGoogleGenAiInstrumentation extends InstrumentationBase$2 {
  constructor(config2 = {}) {
    super("@sentry/instrumentation-google-genai", SDK_VERSION, config2);
  }
  /**
   * Initializes the instrumentation by defining the modules to be patched.
   */
  init() {
    const module2 = new InstrumentationNodeModuleDefinition$2(
      "@google/genai",
      supportedVersions$2,
      (exports$1) => this._patch(exports$1),
      (exports$1) => exports$1,
      // In CJS, @google/genai re-exports from (dist/node/index.cjs) file.
      // Patching only the root module sometimes misses the real implementation or
      // gets overwritten when that file is loaded. We add a file-level patch so that
      // _patch runs again on the concrete implementation
      [
        new InstrumentationNodeModuleFile$1(
          "@google/genai/dist/node/index.cjs",
          supportedVersions$2,
          (exports$1) => this._patch(exports$1),
          (exports$1) => exports$1
        )
      ]
    );
    return module2;
  }
  /**
   * Core patch logic applying instrumentation to the Google GenAI client constructor.
   */
  _patch(exports$1) {
    const Original = exports$1.GoogleGenAI;
    const config2 = this.getConfig();
    if (typeof Original !== "function") {
      return exports$1;
    }
    const WrappedGoogleGenAI = function(...args) {
      if (_INTERNAL_shouldSkipAiProviderWrapping(GOOGLE_GENAI_INTEGRATION_NAME)) {
        return Reflect.construct(Original, args);
      }
      const instance = Reflect.construct(Original, args);
      const client = getClient();
      const defaultPii = Boolean(client?.getOptions().sendDefaultPii);
      const typedConfig = config2;
      const recordInputs = typedConfig?.recordInputs ?? defaultPii;
      const recordOutputs = typedConfig?.recordOutputs ?? defaultPii;
      return instrumentGoogleGenAIClient(instance, {
        recordInputs,
        recordOutputs
      });
    };
    Object.setPrototypeOf(WrappedGoogleGenAI, Original);
    Object.setPrototypeOf(WrappedGoogleGenAI.prototype, Original.prototype);
    for (const key of Object.getOwnPropertyNames(Original)) {
      if (!["length", "name", "prototype"].includes(key)) {
        const descriptor = Object.getOwnPropertyDescriptor(Original, key);
        if (descriptor) {
          Object.defineProperty(WrappedGoogleGenAI, key, descriptor);
        }
      }
    }
    replaceExports(exports$1, "GoogleGenAI", WrappedGoogleGenAI);
    return exports$1;
  }
}
const instrumentGoogleGenAI = generateInstrumentOnce(
  GOOGLE_GENAI_INTEGRATION_NAME,
  (options) => new SentryGoogleGenAiInstrumentation(options)
);
const _googleGenAIIntegration = ((options = {}) => {
  return {
    name: GOOGLE_GENAI_INTEGRATION_NAME,
    setupOnce() {
      instrumentGoogleGenAI(options);
    }
  };
});
const googleGenAIIntegration = defineIntegration(_googleGenAIIntegration);
const supportedVersions$1 = [">=0.1.0 <2.0.0"];
function augmentCallbackHandlers(handlers, sentryHandler) {
  if (!handlers) {
    return [sentryHandler];
  }
  if (Array.isArray(handlers)) {
    if (handlers.includes(sentryHandler)) {
      return handlers;
    }
    return [...handlers, sentryHandler];
  }
  if (typeof handlers === "object") {
    return [handlers, sentryHandler];
  }
  return handlers;
}
function wrapRunnableMethod(originalMethod, sentryHandler, _methodName) {
  return new Proxy(originalMethod, {
    apply(target, thisArg, args) {
      const optionsIndex = 1;
      let options = args[optionsIndex];
      if (!options || typeof options !== "object" || Array.isArray(options)) {
        options = {};
        args[optionsIndex] = options;
      }
      const existingCallbacks = options.callbacks;
      const augmentedCallbacks = augmentCallbackHandlers(existingCallbacks, sentryHandler);
      options.callbacks = augmentedCallbacks;
      return Reflect.apply(target, thisArg, args);
    }
  });
}
class SentryLangChainInstrumentation extends InstrumentationBase$2 {
  constructor(config2 = {}) {
    super("@sentry/instrumentation-langchain", SDK_VERSION, config2);
  }
  /**
   * Initializes the instrumentation by defining the modules to be patched.
   * We patch the BaseChatModel class methods to inject callbacks
   *
   * We hook into provider packages (@langchain/anthropic, @langchain/openai, etc.)
   * because @langchain/core is often bundled and not loaded as a separate module
   */
  init() {
    const modules = [];
    const providerPackages = [
      "@langchain/anthropic",
      "@langchain/openai",
      "@langchain/google-genai",
      "@langchain/mistralai",
      "@langchain/google-vertexai",
      "@langchain/groq"
    ];
    for (const packageName of providerPackages) {
      modules.push(
        new InstrumentationNodeModuleDefinition$2(
          packageName,
          supportedVersions$1,
          this._patch.bind(this),
          (exports$1) => exports$1,
          [
            new InstrumentationNodeModuleFile$1(
              `${packageName}/dist/index.cjs`,
              supportedVersions$1,
              this._patch.bind(this),
              (exports$1) => exports$1
            )
          ]
        )
      );
    }
    modules.push(
      new InstrumentationNodeModuleDefinition$2(
        "langchain",
        supportedVersions$1,
        this._patch.bind(this),
        (exports$1) => exports$1,
        [
          // To catch the CJS build that contains ConfigurableModel / initChatModel for v1
          new InstrumentationNodeModuleFile$1(
            "langchain/dist/chat_models/universal.cjs",
            supportedVersions$1,
            this._patch.bind(this),
            (exports$1) => exports$1
          )
        ]
      )
    );
    return modules;
  }
  /**
   * Core patch logic - patches chat model methods to inject Sentry callbacks
   * This is called when a LangChain provider package is loaded
   */
  _patch(exports$1) {
    _INTERNAL_skipAiProviderWrapping([
      OPENAI_INTEGRATION_NAME,
      ANTHROPIC_AI_INTEGRATION_NAME,
      GOOGLE_GENAI_INTEGRATION_NAME
    ]);
    const client = getClient();
    const defaultPii = Boolean(client?.getOptions().sendDefaultPii);
    const config2 = this.getConfig();
    const recordInputs = config2?.recordInputs ?? defaultPii;
    const recordOutputs = config2?.recordOutputs ?? defaultPii;
    const sentryHandler = createLangChainCallbackHandler({
      recordInputs,
      recordOutputs
    });
    this._patchRunnableMethods(exports$1, sentryHandler);
    return exports$1;
  }
  /**
   * Patches chat model methods (invoke, stream, batch) to inject Sentry callbacks
   * Finds a chat model class from the provider package exports and patches its prototype methods
   */
  _patchRunnableMethods(exports$1, sentryHandler) {
    const knownChatModelNames = [
      "ChatAnthropic",
      "ChatOpenAI",
      "ChatGoogleGenerativeAI",
      "ChatMistralAI",
      "ChatVertexAI",
      "ChatGroq",
      "ConfigurableModel"
    ];
    const exportsToPatch = exports$1.universal_exports ?? exports$1;
    const chatModelClass = Object.values(exportsToPatch).find((exp) => {
      return typeof exp === "function" && knownChatModelNames.includes(exp.name);
    });
    if (!chatModelClass) {
      return;
    }
    const targetProto = chatModelClass.prototype;
    const methodsToPatch = ["invoke", "stream", "batch"];
    for (const methodName of methodsToPatch) {
      const method = targetProto[methodName];
      if (typeof method === "function") {
        targetProto[methodName] = wrapRunnableMethod(
          method,
          sentryHandler
        );
      }
    }
  }
}
const instrumentLangChain = generateInstrumentOnce(
  LANGCHAIN_INTEGRATION_NAME,
  (options) => new SentryLangChainInstrumentation(options)
);
const _langChainIntegration = ((options = {}) => {
  return {
    name: LANGCHAIN_INTEGRATION_NAME,
    setupOnce() {
      instrumentLangChain(options);
    }
  };
});
const langChainIntegration = defineIntegration(_langChainIntegration);
const supportedVersions = [">=0.0.0 <2.0.0"];
class SentryLangGraphInstrumentation extends InstrumentationBase$2 {
  constructor(config2 = {}) {
    super("@sentry/instrumentation-langgraph", SDK_VERSION, config2);
  }
  /**
   * Initializes the instrumentation by defining the modules to be patched.
   */
  init() {
    const module2 = new InstrumentationNodeModuleDefinition$2(
      "@langchain/langgraph",
      supportedVersions,
      this._patch.bind(this),
      (exports$1) => exports$1,
      [
        new InstrumentationNodeModuleFile$1(
          /**
           * In CJS, LangGraph packages re-export from dist/index.cjs files.
           * Patching only the root module sometimes misses the real implementation or
           * gets overwritten when that file is loaded. We add a file-level patch so that
           * _patch runs again on the concrete implementation
           */
          "@langchain/langgraph/dist/index.cjs",
          supportedVersions,
          this._patch.bind(this),
          (exports$1) => exports$1
        )
      ]
    );
    return module2;
  }
  /**
   * Core patch logic applying instrumentation to the LangGraph module.
   */
  _patch(exports$1) {
    const client = getClient();
    const defaultPii = Boolean(client?.getOptions().sendDefaultPii);
    const config2 = this.getConfig();
    const recordInputs = config2.recordInputs ?? defaultPii;
    const recordOutputs = config2.recordOutputs ?? defaultPii;
    const options = {
      recordInputs,
      recordOutputs
    };
    if (exports$1.StateGraph && typeof exports$1.StateGraph === "function") {
      const StateGraph = exports$1.StateGraph;
      StateGraph.prototype.compile = instrumentStateGraphCompile(
        StateGraph.prototype.compile,
        options
      );
    }
    return exports$1;
  }
}
const instrumentLangGraph = generateInstrumentOnce(
  LANGGRAPH_INTEGRATION_NAME,
  (options) => new SentryLangGraphInstrumentation(options)
);
const _langGraphIntegration = ((options = {}) => {
  return {
    name: LANGGRAPH_INTEGRATION_NAME,
    setupOnce() {
      instrumentLangGraph(options);
    }
  };
});
const langGraphIntegration = defineIntegration(_langGraphIntegration);
const launchDarklyIntegrationShim = defineIntegration((_options) => {
  if (!isBrowser()) {
    consoleSandbox(() => {
      console.warn("The launchDarklyIntegration() can only be used in the browser.");
    });
  }
  return {
    name: "LaunchDarkly"
  };
});
function buildLaunchDarklyFlagUsedHandlerShim() {
  if (!isBrowser()) {
    consoleSandbox(() => {
      console.warn("The buildLaunchDarklyFlagUsedHandler() can only be used in the browser.");
    });
  }
  return {
    name: "sentry-flag-auditor",
    type: "flag-used",
    synchronous: true,
    method: () => null
  };
}
const openFeatureIntegrationShim = defineIntegration((_options) => {
  if (!isBrowser()) {
    consoleSandbox(() => {
      console.warn("The openFeatureIntegration() can only be used in the browser.");
    });
  }
  return {
    name: "OpenFeature"
  };
});
class OpenFeatureIntegrationHookShim {
  /**
   *
   */
  constructor() {
    if (!isBrowser()) {
      consoleSandbox(() => {
        console.warn("The OpenFeatureIntegrationHook can only be used in the browser.");
      });
    }
  }
  /**
   *
   */
  after() {
  }
  /**
   *
   */
  error() {
  }
}
const statsigIntegrationShim = defineIntegration((_options) => {
  if (!isBrowser()) {
    consoleSandbox(() => {
      console.warn("The statsigIntegration() can only be used in the browser.");
    });
  }
  return {
    name: "Statsig"
  };
});
const unleashIntegrationShim = defineIntegration((_options) => {
  if (!isBrowser()) {
    consoleSandbox(() => {
      console.warn("The unleashIntegration() can only be used in the browser.");
    });
  }
  return {
    name: "Unleash"
  };
});
const growthbookIntegrationShim = growthbookIntegration;
function patchFirestore(tracer, firestoreSupportedVersions2, wrap2, unwrap2, config2) {
  const defaultFirestoreSpanCreationHook = () => {
  };
  let firestoreSpanCreationHook = defaultFirestoreSpanCreationHook;
  const configFirestoreSpanCreationHook = config2.firestoreSpanCreationHook;
  if (typeof configFirestoreSpanCreationHook === "function") {
    firestoreSpanCreationHook = (span) => {
      safeExecuteInTheMiddle$1(
        () => configFirestoreSpanCreationHook(span),
        (error2) => {
          if (!error2) {
            return;
          }
          diag.error(error2?.message);
        },
        true
      );
    };
  }
  const moduleFirestoreCJS = new InstrumentationNodeModuleDefinition$2(
    "@firebase/firestore",
    firestoreSupportedVersions2,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (moduleExports) => wrapMethods(moduleExports, wrap2, unwrap2, tracer, firestoreSpanCreationHook)
  );
  const files = [
    "@firebase/firestore/dist/lite/index.node.cjs.js",
    "@firebase/firestore/dist/lite/index.node.mjs.js",
    "@firebase/firestore/dist/lite/index.rn.esm2017.js",
    "@firebase/firestore/dist/lite/index.cjs.js"
  ];
  for (const file of files) {
    moduleFirestoreCJS.files.push(
      new InstrumentationNodeModuleFile$1(
        file,
        firestoreSupportedVersions2,
        (moduleExports) => wrapMethods(moduleExports, wrap2, unwrap2, tracer, firestoreSpanCreationHook),
        (moduleExports) => unwrapMethods(moduleExports, unwrap2)
      )
    );
  }
  return moduleFirestoreCJS;
}
function wrapMethods(moduleExports, wrap2, unwrap2, tracer, firestoreSpanCreationHook) {
  unwrapMethods(moduleExports, unwrap2);
  wrap2(moduleExports, "addDoc", patchAddDoc(tracer, firestoreSpanCreationHook));
  wrap2(moduleExports, "getDocs", patchGetDocs(tracer, firestoreSpanCreationHook));
  wrap2(moduleExports, "setDoc", patchSetDoc(tracer, firestoreSpanCreationHook));
  wrap2(moduleExports, "deleteDoc", patchDeleteDoc(tracer, firestoreSpanCreationHook));
  return moduleExports;
}
function unwrapMethods(moduleExports, unwrap2) {
  for (const method of ["addDoc", "getDocs", "setDoc", "deleteDoc"]) {
    if (isWrapped$2(moduleExports[method])) {
      unwrap2(moduleExports, method);
    }
  }
  return moduleExports;
}
function patchAddDoc(tracer, firestoreSpanCreationHook) {
  return function addDoc(original) {
    return function(reference, data) {
      const span = startDBSpan(tracer, "addDoc", reference);
      firestoreSpanCreationHook(span);
      return executeContextWithSpan(span, () => {
        return original(reference, data);
      });
    };
  };
}
function patchDeleteDoc(tracer, firestoreSpanCreationHook) {
  return function deleteDoc(original) {
    return function(reference) {
      const span = startDBSpan(tracer, "deleteDoc", reference.parent || reference);
      firestoreSpanCreationHook(span);
      return executeContextWithSpan(span, () => {
        return original(reference);
      });
    };
  };
}
function patchGetDocs(tracer, firestoreSpanCreationHook) {
  return function getDocs(original) {
    return function(reference) {
      const span = startDBSpan(tracer, "getDocs", reference);
      firestoreSpanCreationHook(span);
      return executeContextWithSpan(span, () => {
        return original(reference);
      });
    };
  };
}
function patchSetDoc(tracer, firestoreSpanCreationHook) {
  return function setDoc(original) {
    return function(reference, data, options) {
      const span = startDBSpan(tracer, "setDoc", reference.parent || reference);
      firestoreSpanCreationHook(span);
      return executeContextWithSpan(span, () => {
        return typeof options !== "undefined" ? original(reference, data, options) : original(reference, data);
      });
    };
  };
}
function executeContextWithSpan(span, callback) {
  return context.with(trace.setSpan(context.active(), span), () => {
    return safeExecuteInTheMiddle$1(
      () => {
        return callback();
      },
      (err) => {
        if (err) {
          span.recordException(err);
        }
        span.end();
      },
      true
    );
  });
}
function startDBSpan(tracer, spanName, reference) {
  const span = tracer.startSpan(`${spanName} ${reference.path}`, { kind: SpanKind.CLIENT });
  addAttributes(span, reference);
  span.setAttribute(ATTR_DB_OPERATION_NAME, spanName);
  return span;
}
function getPortAndAddress(settings) {
  let address;
  let port;
  if (typeof settings.host === "string") {
    if (settings.host.startsWith("[")) {
      if (settings.host.endsWith("]")) {
        address = settings.host.replace(/^\[|\]$/g, "");
      } else if (settings.host.includes("]:")) {
        const lastColonIndex = settings.host.lastIndexOf(":");
        if (lastColonIndex !== -1) {
          address = settings.host.slice(1, lastColonIndex).replace(/^\[|\]$/g, "");
          port = settings.host.slice(lastColonIndex + 1);
        }
      }
    } else {
      if (net.isIPv6(settings.host)) {
        address = settings.host;
      } else {
        const lastColonIndex = settings.host.lastIndexOf(":");
        if (lastColonIndex !== -1) {
          address = settings.host.slice(0, lastColonIndex);
          port = settings.host.slice(lastColonIndex + 1);
        } else {
          address = settings.host;
        }
      }
    }
  }
  return {
    address,
    port: port ? parseInt(port, 10) : void 0
  };
}
function addAttributes(span, reference) {
  const firestoreApp = reference.firestore.app;
  const firestoreOptions = firestoreApp.options;
  const json = reference.firestore.toJSON() || {};
  const settings = json.settings || {};
  const attributes = {
    [ATTR_DB_COLLECTION_NAME]: reference.path,
    [ATTR_DB_NAMESPACE]: firestoreApp.name,
    [ATTR_DB_SYSTEM_NAME]: "firebase.firestore",
    "firebase.firestore.type": reference.type,
    "firebase.firestore.options.projectId": firestoreOptions.projectId,
    "firebase.firestore.options.appId": firestoreOptions.appId,
    "firebase.firestore.options.messagingSenderId": firestoreOptions.messagingSenderId,
    "firebase.firestore.options.storageBucket": firestoreOptions.storageBucket
  };
  const { address, port } = getPortAndAddress(settings);
  if (address) {
    attributes[ATTR_SERVER_ADDRESS] = address;
  }
  if (port) {
    attributes[ATTR_SERVER_PORT] = port;
  }
  span.setAttributes(attributes);
}
function patchFunctions(tracer, functionsSupportedVersions2, wrap2, unwrap2, config2) {
  let requestHook2 = () => {
  };
  let responseHook = () => {
  };
  const errorHook = config2.functions?.errorHook;
  const configRequestHook = config2.functions?.requestHook;
  const configResponseHook = config2.functions?.responseHook;
  if (typeof configResponseHook === "function") {
    responseHook = (span, err) => {
      safeExecuteInTheMiddle$1(
        () => configResponseHook(span, err),
        (error2) => {
          if (!error2) {
            return;
          }
          diag.error(error2?.message);
        },
        true
      );
    };
  }
  if (typeof configRequestHook === "function") {
    requestHook2 = (span) => {
      safeExecuteInTheMiddle$1(
        () => configRequestHook(span),
        (error2) => {
          if (!error2) {
            return;
          }
          diag.error(error2?.message);
        },
        true
      );
    };
  }
  const moduleFunctionsCJS = new InstrumentationNodeModuleDefinition$2("firebase-functions", functionsSupportedVersions2);
  const modulesToInstrument = [
    { name: "firebase-functions/lib/v2/providers/https.js", triggerType: "function" },
    { name: "firebase-functions/lib/v2/providers/firestore.js", triggerType: "firestore" },
    { name: "firebase-functions/lib/v2/providers/scheduler.js", triggerType: "scheduler" },
    { name: "firebase-functions/lib/v2/storage.js", triggerType: "storage" }
  ];
  modulesToInstrument.forEach(({ name: name2, triggerType }) => {
    moduleFunctionsCJS.files.push(
      new InstrumentationNodeModuleFile$1(
        name2,
        functionsSupportedVersions2,
        (moduleExports) => wrapCommonFunctions(
          moduleExports,
          wrap2,
          unwrap2,
          tracer,
          { requestHook: requestHook2, responseHook, errorHook },
          triggerType
        ),
        (moduleExports) => unwrapCommonFunctions(moduleExports, unwrap2)
      )
    );
  });
  return moduleFunctionsCJS;
}
function patchV2Functions(tracer, functionsConfig, triggerType) {
  return function v2FunctionsWrapper(original) {
    return function(...args) {
      const handler = typeof args[0] === "function" ? args[0] : args[1];
      const documentOrOptions = typeof args[0] === "function" ? void 0 : args[0];
      if (!handler) {
        return original.call(this, ...args);
      }
      const wrappedHandler = async function(...handlerArgs) {
        const functionName = process.env.FUNCTION_TARGET || process.env.K_SERVICE || "unknown";
        const span = tracer.startSpan(`firebase.function.${triggerType}`, {
          kind: SpanKind.SERVER
        });
        const attributes = {
          "faas.name": functionName,
          "faas.trigger": triggerType,
          "faas.provider": "firebase"
        };
        if (process.env.GCLOUD_PROJECT) {
          attributes["cloud.project_id"] = process.env.GCLOUD_PROJECT;
        }
        if (process.env.EVENTARC_CLOUD_EVENT_SOURCE) {
          attributes["cloud.event_source"] = process.env.EVENTARC_CLOUD_EVENT_SOURCE;
        }
        span.setAttributes(attributes);
        functionsConfig?.requestHook?.(span);
        return context.with(trace.setSpan(context.active(), span), async () => {
          let error2;
          let result;
          try {
            result = await handler.apply(this, handlerArgs);
          } catch (e) {
            error2 = e;
          }
          functionsConfig?.responseHook?.(span, error2);
          if (error2) {
            span.recordException(error2);
          }
          span.end();
          if (error2) {
            await functionsConfig?.errorHook?.(span, error2);
            throw error2;
          }
          return result;
        });
      };
      if (documentOrOptions) {
        return original.call(this, documentOrOptions, wrappedHandler);
      } else {
        return original.call(this, wrappedHandler);
      }
    };
  };
}
function wrapCommonFunctions(moduleExports, wrap2, unwrap2, tracer, functionsConfig, triggerType) {
  unwrapCommonFunctions(moduleExports, unwrap2);
  switch (triggerType) {
    case "function":
      wrap2(moduleExports, "onRequest", patchV2Functions(tracer, functionsConfig, "http.request"));
      wrap2(moduleExports, "onCall", patchV2Functions(tracer, functionsConfig, "http.call"));
      break;
    case "firestore":
      wrap2(moduleExports, "onDocumentCreated", patchV2Functions(tracer, functionsConfig, "firestore.document.created"));
      wrap2(moduleExports, "onDocumentUpdated", patchV2Functions(tracer, functionsConfig, "firestore.document.updated"));
      wrap2(moduleExports, "onDocumentDeleted", patchV2Functions(tracer, functionsConfig, "firestore.document.deleted"));
      wrap2(moduleExports, "onDocumentWritten", patchV2Functions(tracer, functionsConfig, "firestore.document.written"));
      wrap2(
        moduleExports,
        "onDocumentCreatedWithAuthContext",
        patchV2Functions(tracer, functionsConfig, "firestore.document.created")
      );
      wrap2(
        moduleExports,
        "onDocumentUpdatedWithAuthContext",
        patchV2Functions(tracer, functionsConfig, "firestore.document.updated")
      );
      wrap2(
        moduleExports,
        "onDocumentDeletedWithAuthContext",
        patchV2Functions(tracer, functionsConfig, "firestore.document.deleted")
      );
      wrap2(
        moduleExports,
        "onDocumentWrittenWithAuthContext",
        patchV2Functions(tracer, functionsConfig, "firestore.document.written")
      );
      break;
    case "scheduler":
      wrap2(moduleExports, "onSchedule", patchV2Functions(tracer, functionsConfig, "scheduler.scheduled"));
      break;
    case "storage":
      wrap2(moduleExports, "onObjectFinalized", patchV2Functions(tracer, functionsConfig, "storage.object.finalized"));
      wrap2(moduleExports, "onObjectArchived", patchV2Functions(tracer, functionsConfig, "storage.object.archived"));
      wrap2(moduleExports, "onObjectDeleted", patchV2Functions(tracer, functionsConfig, "storage.object.deleted"));
      wrap2(
        moduleExports,
        "onObjectMetadataUpdated",
        patchV2Functions(tracer, functionsConfig, "storage.object.metadataUpdated")
      );
      break;
  }
  return moduleExports;
}
function unwrapCommonFunctions(moduleExports, unwrap2) {
  const methods = [
    "onSchedule",
    "onRequest",
    "onCall",
    "onObjectFinalized",
    "onObjectArchived",
    "onObjectDeleted",
    "onObjectMetadataUpdated",
    "onDocumentCreated",
    "onDocumentUpdated",
    "onDocumentDeleted",
    "onDocumentWritten",
    "onDocumentCreatedWithAuthContext",
    "onDocumentUpdatedWithAuthContext",
    "onDocumentDeletedWithAuthContext",
    "onDocumentWrittenWithAuthContext"
  ];
  for (const method of methods) {
    if (isWrapped$2(moduleExports[method])) {
      unwrap2(moduleExports, method);
    }
  }
  return moduleExports;
}
const DefaultFirebaseInstrumentationConfig = {};
const firestoreSupportedVersions = [">=3.0.0 <5"];
const functionsSupportedVersions = [">=6.0.0 <7"];
class FirebaseInstrumentation extends InstrumentationBase$2 {
  constructor(config2 = DefaultFirebaseInstrumentationConfig) {
    super("@sentry/instrumentation-firebase", SDK_VERSION, config2);
  }
  /**
   * sets config
   * @param config
   */
  setConfig(config2 = {}) {
    super.setConfig({ ...DefaultFirebaseInstrumentationConfig, ...config2 });
  }
  /**
   *
   * @protected
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  init() {
    const modules = [];
    modules.push(patchFirestore(this.tracer, firestoreSupportedVersions, this._wrap, this._unwrap, this.getConfig()));
    modules.push(patchFunctions(this.tracer, functionsSupportedVersions, this._wrap, this._unwrap, this.getConfig()));
    return modules;
  }
}
const INTEGRATION_NAME = "Firebase";
const config = {
  firestoreSpanCreationHook: (span) => {
    addOriginToSpan(span, "auto.firebase.otel.firestore");
    span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_OP, "db.query");
  },
  functions: {
    requestHook: (span) => {
      addOriginToSpan(span, "auto.firebase.otel.functions");
      span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_OP, "http.request");
    },
    errorHook: async (_, error2) => {
      if (error2) {
        captureException(error2, {
          mechanism: {
            type: "auto.firebase.otel.functions",
            handled: false
          }
        });
        await flush(2e3);
      }
    }
  }
};
const instrumentFirebase = generateInstrumentOnce(INTEGRATION_NAME, () => new FirebaseInstrumentation(config));
const _firebaseIntegration = (() => {
  return {
    name: INTEGRATION_NAME,
    setupOnce() {
      instrumentFirebase();
    }
  };
});
const firebaseIntegration = defineIntegration(_firebaseIntegration);
function getAutoPerformanceIntegrations() {
  return [
    expressIntegration(),
    fastifyIntegration(),
    graphqlIntegration(),
    honoIntegration(),
    mongoIntegration(),
    mongooseIntegration(),
    mysqlIntegration(),
    mysql2Integration(),
    redisIntegration(),
    postgresIntegration(),
    prismaIntegration(),
    hapiIntegration(),
    koaIntegration(),
    connectIntegration(),
    tediousIntegration(),
    genericPoolIntegration(),
    kafkaIntegration(),
    amqplibIntegration(),
    lruMemoizerIntegration(),
    // AI providers
    // LangChain must come first to disable AI provider integrations before they instrument
    langChainIntegration(),
    langGraphIntegration(),
    vercelAIIntegration(),
    openAIIntegration(),
    anthropicAIIntegration(),
    googleGenAIIntegration(),
    postgresJsIntegration(),
    firebaseIntegration()
  ];
}
function focusedWindow() {
  for (const window2 of BrowserWindow.getAllWindows()) {
    if (!window2.isDestroyed() && window2.webContents && !window2.webContents.isDestroyed()) {
      if (window2.isFocused() && window2.isVisible()) {
        return true;
      }
    }
  }
  return false;
}
const browserWindowSessionIntegration = defineIntegration((options = {}) => {
  let _state = { name: "inactive" };
  function windowStateChanged() {
    const hasFocusedWindow = focusedWindow();
    if (hasFocusedWindow) {
      if (_state.name === "inactive") {
        startSession(true);
      } else if (_state.name === "timeout") {
        clearTimeout(_state.timer);
      }
      _state = { name: "active" };
    } else {
      if (_state.name === "active") {
        const timeout = (options.backgroundTimeoutSeconds ?? 30) * 1e3;
        const timer = setTimeout(() => {
          if (_state.name === "timeout") {
            _state = { name: "inactive" };
            endSession().catch(() => {
            });
          }
        }, timeout).unref();
        _state = { name: "timeout", timer };
      }
    }
  }
  return {
    name: "BrowserWindowSession",
    setup() {
      app.on("browser-window-created", (_event, window2) => {
        window2.on("focus", windowStateChanged);
        window2.on("blur", windowStateChanged);
        window2.on("show", windowStateChanged);
        window2.on("hide", windowStateChanged);
        window2.once("closed", () => {
          window2.removeListener("focus", windowStateChanged);
          window2.removeListener("blur", windowStateChanged);
          window2.removeListener("show", windowStateChanged);
          window2.removeListener("hide", windowStateChanged);
        });
      });
      endSessionOnExit();
    }
  };
});
function hasKeys(obj) {
  return obj !== void 0 && Object.keys(obj).length > 0;
}
function getScope(options) {
  const scope = getScopeData();
  if (!scope) {
    return {};
  }
  return {
    release: options.release,
    environment: options.environment,
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    ...hasKeys(scope.user) && { user: scope.user },
    ...hasKeys(scope.tags) && { tags: scope.tags },
    ...hasKeys(scope.extra) && { extra: scope.extra }
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */
  };
}
function getNativeUploaderExtraParams(event) {
  const maxBytes = 20300;
  let buf = Buffer.from(JSON.stringify(event));
  const chunks = [];
  while (buf.length) {
    let i = buf.lastIndexOf(34, maxBytes + 1);
    if (i < 0)
      i = buf.lastIndexOf(32, maxBytes + 1);
    if (i < 0)
      i = buf.indexOf(34, maxBytes);
    if (i < 0)
      i = buf.indexOf(32, maxBytes);
    if (i < 0)
      i = maxBytes;
    chunks.push(buf.subarray(0, i + 1).toString());
    buf = buf.subarray(i + 1);
  }
  return chunks.reduce((acc, cur, i) => {
    acc[`sentry__${i + 1}`] = cur;
    return acc;
  }, {});
}
function minidumpUrlFromDsn(dsn) {
  const dsnComponents = makeDsn(dsn);
  if (!dsnComponents) {
    return void 0;
  }
  const { host, path, projectId, port, protocol, publicKey } = dsnComponents;
  return `${protocol}://${host}${port !== "" ? `:${port}` : ""}${path !== "" ? `/${path}` : ""}/api/${projectId}/minidump/?sentry_key=${publicKey}`;
}
const electronMinidumpIntegration = defineIntegration(() => {
  let updateEpoch = 0;
  async function getNativeUploaderEvent(client, scope) {
    const { sendDefaultPii = false } = client.getOptions();
    const event = mergeEvents(await getEventDefaults(client), {
      sdk: getSdkInfo(sendDefaultPii),
      event_id: uuid4(),
      level: "fatal",
      platform: "native",
      tags: { "event.environment": "native" }
    });
    applyScopeDataToEvent(event, scope);
    delete event.sdkProcessingMetadata;
    return normalizePaths(event, app.getAppPath());
  }
  function updateExtraParams(client, scope) {
    updateEpoch += 1;
    const currentEpoch = updateEpoch;
    getNativeUploaderEvent(client, scope).then((event) => {
      if (currentEpoch !== updateEpoch) {
        return;
      }
      const mainParams = getNativeUploaderExtraParams(event);
      for (const [key, value] of Object.entries(mainParams)) {
        crashReporter.addExtraParameter(key, value);
      }
    }).catch((error2) => debug.error(error2));
  }
  function startCrashReporter(options) {
    const submitURL = minidumpUrlFromDsn(options.dsn || "");
    if (!submitURL) {
      debug.log("Invalid DSN. Cannot start Electron crashReporter");
      return;
    }
    const globalExtra = { sentry___initialScope: JSON.stringify(getScope(options)) };
    debug.log("Starting Electron crashReporter");
    crashReporter.start({
      companyName: "",
      ignoreSystemCrashHandler: true,
      productName: app.name || app.getName(),
      submitURL,
      uploadToServer: true,
      compress: true,
      globalExtra
    });
  }
  function setupScopeListener(client) {
    addScopeListener((scope) => {
      updateExtraParams(client, scope);
    });
  }
  return {
    name: "ElectronMinidump",
    setup(client) {
      if (process.mas) {
        return;
      }
      const clientOptions = client.getOptions();
      if (!clientOptions?.dsn) {
        throw new Error("Attempted to enable Electron native crash reporter but no DSN was supplied");
      }
      startCrashReporter(clientOptions);
      app.on("render-process-gone", (_, __, details) => {
        if (CRASH_REASONS.includes(details.reason)) {
          sessionCrashed();
        }
      });
      setupScopeListener(client);
      unreportedDuringLastSession(crashReporter.getLastCrashReport()?.date).then((crashed) => {
        return checkPreviousSession(crashed);
      }, debug.error);
    }
  };
});
let cachedRootTransaction;
function rootTransaction() {
  if (!cachedRootTransaction) {
    const uptimeMs = process.uptime() * 1e3;
    const startTime = (Date.now() - uptimeMs) / 1e3;
    startSpanManual({
      name: "Startup",
      op: "app.start",
      startTime,
      attributes: {
        [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.electron.startup"
      },
      forceTransaction: true
    }, (root) => {
      cachedRootTransaction = root;
    });
  }
  return cachedRootTransaction;
}
function zeroLengthSpan(options) {
  const startTime = timestampInSeconds();
  startSpanManual({
    ...options,
    attributes: {
      [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.electron.startup",
      ...options.attributes
    },
    parentSpan: options.parentSpan || rootTransaction(),
    startTime
  }, (span) => {
    span.end(startTime * 1e3);
  });
}
function waitForRendererPageload(timeout) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve(void 0);
    }, timeout);
    ipcMainHooks.once("pageload-transaction", (event, _contents) => {
      clearTimeout(timer);
      resolve(event);
    });
  });
}
function parseStatus(status) {
  if (status === "ok") {
    return { code: 1 };
  }
  return { code: 2, message: status };
}
function applyRendererSpansAndMeasurements(parentSpan, event, endTimestamp) {
  let lastEndTimestamp = endTimestamp;
  if (!event) {
    return lastEndTimestamp;
  }
  const rendererStartTime = event.start_timestamp || event.timestamp;
  parentSpan.setAttribute("performance.timeOrigin", rendererStartTime);
  startSpanManual({
    name: event.transaction || "electron.renderer",
    op: "electron.renderer",
    startTime: rendererStartTime,
    parentSpan,
    attributes: {
      [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.electron.startup"
    }
  }, (rendererSpan) => {
    if (event?.spans?.length) {
      for (const spanJson of event.spans) {
        const startTime = spanJson.start_timestamp;
        const endTime = spanJson.timestamp;
        if (endTime) {
          lastEndTimestamp = Math.max(lastEndTimestamp, endTime);
        }
        startSpanManual({
          name: spanJson.description || "electron.renderer",
          op: spanJson.op,
          startTime,
          attributes: spanJson.data,
          parentSpan: rendererSpan
        }, (span) => {
          if (spanJson.status) {
            span.setStatus(parseStatus(spanJson.status));
          }
          span.end((endTime || startTime) * 1e3);
        });
      }
    }
    rendererSpan.end(lastEndTimestamp * 1e3);
  });
  if (event.measurements) {
    for (const [name2, measurement] of Object.entries(event.measurements)) {
      setMeasurement(name2, measurement.value, measurement.unit, parentSpan);
    }
  }
  if (event.contexts?.trace?.data) {
    for (const [key, value] of Object.entries(event.contexts.trace.data)) {
      if (!["sentry.op", "sentry.origin", "performance.timeOrigin"].includes(key)) {
        parentSpan.setAttribute(key, value);
      }
    }
  }
  return lastEndTimestamp;
}
const startupTracingIntegration = defineIntegration((options = {}) => {
  return {
    name: "StartupTracing",
    setup() {
      const fallbackTimeout = setTimeout(() => {
        const transaction = rootTransaction();
        transaction.setStatus({ code: 2, message: "Timeout exceeded" });
        transaction.end();
      }, (options.timeoutSeconds || 10) * 1e3);
      app.once("will-finish-launching", () => {
        zeroLengthSpan({
          name: "will-finish-launching",
          op: "electron.will-finish-launching"
        });
      });
      app.once("ready", () => {
        zeroLengthSpan({
          name: "ready",
          op: "electron.ready"
        });
      });
      app.once("web-contents-created", (_, webContents) => {
        zeroLengthSpan({
          name: "web-contents-created",
          op: "electron.web-contents.created"
        });
        webContents.once("dom-ready", async () => {
          clearTimeout(fallbackTimeout);
          const parentSpan = rootTransaction();
          zeroLengthSpan({
            name: "dom-ready",
            op: "electron.web-contents.dom-ready"
          });
          let lastEndTimestamp = timestampInSeconds();
          const event = await waitForRendererPageload((options.timeoutSeconds || 10) * 1e3);
          lastEndTimestamp = applyRendererSpansAndMeasurements(parentSpan, event, lastEndTimestamp);
          parentSpan.end(lastEndTimestamp * 1e3);
        });
      });
    }
  };
});
export {
  bu as IPCMode,
  bv as NodeClient,
  OpenFeatureIntegrationHookShim as OpenFeatureIntegrationHook,
  SEMANTIC_ATTRIBUTE_SENTRY_OP,
  SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN,
  bw as SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE,
  SEMANTIC_ATTRIBUTE_SENTRY_SOURCE,
  bx as Scope,
  by as SentryContextManager,
  addBreadcrumb,
  bz as addEventProcessor,
  bA as addIntegration,
  bB as additionalContextIntegration,
  amqplibIntegration,
  anthropicAIIntegration,
  browserWindowSessionIntegration,
  buildLaunchDarklyFlagUsedHandlerShim as buildLaunchDarklyFlagUsedHandler,
  bC as captureCheckIn,
  captureConsoleIntegration,
  bD as captureEvent,
  captureException,
  captureFeedback,
  captureMessage,
  bE as captureSession,
  bF as childProcessIntegration,
  bG as close,
  connectIntegration,
  bH as consoleIntegration,
  consoleLoggingIntegration,
  bI as contextLinesIntegration,
  bJ as continueTrace,
  createConsolaReporter,
  bK as createGetModuleFromFilename,
  createLangChainCallbackHandler,
  createSentryWinstonTransport,
  bL as createTransport,
  cron,
  dataloaderIntegration,
  dedupeIntegration,
  bM as defaultStackParser,
  bN as electronBreadcrumbsIntegration,
  bO as electronContextIntegration,
  electronMinidumpIntegration,
  bP as electronNetIntegration,
  bQ as endSession,
  bR as eventFiltersIntegration,
  expressErrorHandler,
  expressIntegration,
  extraErrorDataIntegration,
  fastifyIntegration,
  featureFlagsIntegration,
  firebaseIntegration,
  flush,
  fsIntegration,
  bS as functionToStringIntegration,
  generateInstrumentOnce,
  genericPoolIntegration,
  getActiveSpan,
  getAutoPerformanceIntegrations,
  getClient,
  getCurrentScope,
  bT as getDefaultIntegrations,
  getGlobalScope,
  getIsolationScope,
  getRootSpan,
  bU as getSpanDescendants,
  getSpanStatusFromHttpCode,
  getTraceData,
  getTraceMetaTags,
  googleGenAIIntegration,
  bV as gpuContextIntegration,
  graphqlIntegration,
  growthbookIntegrationShim as growthbookIntegration,
  hapiIntegration,
  honoIntegration,
  httpHeadersToSpanAttributes,
  httpIntegration,
  httpServerIntegration,
  httpServerSpansIntegration,
  bW as inboundFiltersIntegration,
  bX as init,
  bY as initOpenTelemetry,
  instrumentAnthropicAiClient,
  instrumentGoogleGenAIClient,
  instrumentLangGraph$1 as instrumentLangGraph,
  instrumentOpenAiClient,
  instrumentStateGraphCompile,
  instrumentSupabaseClient,
  isEnabled,
  bZ as isInitialized,
  kafkaIntegration,
  knexIntegration,
  koaIntegration,
  langChainIntegration,
  langGraphIntegration,
  b_ as lastEventId,
  launchDarklyIntegrationShim as launchDarklyIntegration,
  b$ as linkedErrorsIntegration,
  c0 as localVariablesIntegration,
  c1 as logger,
  lruMemoizerIntegration,
  c2 as mainProcessSessionIntegration,
  c3 as makeElectronOfflineTransport,
  c4 as makeElectronTransport,
  publicApi as metrics,
  modulesIntegration,
  mongoIntegration,
  mongooseIntegration,
  mysql2Integration,
  mysqlIntegration,
  c5 as nativeNodeFetchIntegration,
  c6 as nodeContextIntegration,
  c7 as normalizePathsIntegration,
  c8 as onUncaughtExceptionIntegration,
  c9 as onUnhandledRejectionIntegration,
  openAIIntegration,
  openFeatureIntegrationShim as openFeatureIntegration,
  ca as parameterize,
  pinoIntegration,
  postgresIntegration,
  postgresJsIntegration,
  cb as preloadInjectionIntegration,
  prismaIntegration,
  profiler,
  redisIntegration,
  cc as rendererEventLoopBlockIntegration,
  cd as rendererProfileFromIpc,
  requestDataIntegration,
  rewriteFramesIntegration,
  ce as screenshotsIntegration,
  cf as sentryMinidumpIntegration,
  cg as setContext,
  ch as setConversationId,
  setCurrentClient,
  ci as setExtra,
  cj as setExtras,
  setHttpStatus,
  setMeasurement,
  ck as setNodeAsyncContextStrategy,
  cl as setTag,
  cm as setTags,
  cn as setUser,
  setupConnectErrorHandler,
  setupExpressErrorHandler,
  setupFastifyErrorHandler,
  setupHapiErrorHandler,
  setupHonoErrorHandler,
  setupKoaErrorHandler,
  co as spanToBaggageHeader,
  spanToJSON,
  cp as spanToTraceHeader,
  spotlightIntegration,
  startInactiveSpan,
  cq as startNewTrace,
  cr as startSession,
  startSpan$1 as startSpan,
  startSpanManual,
  startupTracingIntegration,
  statsigIntegrationShim as statsigIntegration,
  supabaseIntegration,
  suppressTracing$1 as suppressTracing,
  systemErrorIntegration,
  tediousIntegration,
  trpcMiddleware,
  unleashIntegrationShim as unleashIntegration,
  cs as updateSpanName,
  validateOpenTelemetrySetup,
  winterCGHeadersToDict,
  withActiveSpan,
  withIsolationScope,
  withMonitor,
  withScope,
  wrapMcpServerWithSentry,
  zodErrorsIntegration
};
//# sourceMappingURL=index-DNip3P7V.js.map
