/**
 * useGoalRun — manages connection to either:
 *   - A running Amoena server via WebSocket (server mode)
 *   - The embedded StandaloneEngine (standalone mode)
 *
 * Dispatches MCServerEvent-compatible events into the shared TUI reducer.
 */

import { useEffect, useRef, useCallback, useReducer } from 'react';
import type { MCServerEvent, AppMode } from '../types.js';
import { tuiReducer, initialState } from '../reducer.js';
import type { TuiState, TuiAction } from '../types.js';

const DEFAULT_WS_URL = 'ws://localhost:3456/api/ws/mission-control';
const CONNECT_TIMEOUT_MS = 2000;
const BACKOFF_BASE_MS = 500;
const BACKOFF_MAX_MS = 8000;

export interface UseGoalRunReturn {
  state: TuiState;
  dispatch: React.Dispatch<TuiAction>;
  submitGoal: (goal: string) => void;
  cancelRun: () => void;
}

export function useGoalRun(opts: {
  serverUrl?: string;
  forceStandalone?: boolean;
}): UseGoalRunReturn {
  const [state, dispatch] = useReducer(tuiReducer, initialState);
  const wsRef = useRef<import('ws').WebSocket | null>(null);
  const engineRef = useRef<import('../engine/standalone-engine.js').StandaloneEngine | null>(null);
  const backoffRef = useRef(BACKOFF_BASE_MS);
  const modeResolvedRef = useRef(false);

  const handleEvent = useCallback((event: MCServerEvent) => {
    dispatch({ type: 'APPLY_EVENT', event });
  }, []);

  // Attempt WebSocket connection; resolve to standalone on timeout/error
  useEffect(() => {
    if (opts.forceStandalone || modeResolvedRef.current) {
      dispatch({ type: 'SET_MODE', mode: 'standalone' });
      return;
    }

    const url = opts.serverUrl ?? DEFAULT_WS_URL;
    let settled = false;
    let ws: import('ws').WebSocket | null = null;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        ws?.close();
        dispatch({ type: 'SET_MODE', mode: 'standalone' });
        modeResolvedRef.current = true;
      }
    }, CONNECT_TIMEOUT_MS);

    async function tryConnect() {
      try {
        const { WebSocket } = await import('ws');
        ws = new WebSocket(url) as unknown as import('ws').WebSocket;
        wsRef.current = ws;

        ws.on('open', () => {
          if (settled) { ws?.close(); return; }
          clearTimeout(timer);
          settled = true;
          modeResolvedRef.current = true;
          backoffRef.current = BACKOFF_BASE_MS;
          dispatch({ type: 'SET_MODE', mode: 'server' });
          dispatch({ type: 'SET_CONNECTED', connected: true });
          // Subscribe handshake
          ws?.send(JSON.stringify({ type: 'subscribe', channel: 'mission-control' }));
        });

        ws.on('message', (raw: Buffer | string) => {
          try {
            const event = JSON.parse(raw.toString()) as MCServerEvent;
            handleEvent(event);
          } catch {
            // ignore malformed frames
          }
        });

        ws.on('close', () => {
          dispatch({ type: 'SET_CONNECTED', connected: false });
          // Reconnect with backoff
          const delay = Math.min(backoffRef.current, BACKOFF_MAX_MS);
          backoffRef.current = Math.min(backoffRef.current * 2, BACKOFF_MAX_MS);
          setTimeout(() => {
            if (modeResolvedRef.current) void tryConnect();
          }, delay);
        });

        ws.on('error', () => {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            dispatch({ type: 'SET_MODE', mode: 'standalone' });
            modeResolvedRef.current = true;
          }
        });
      } catch {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          dispatch({ type: 'SET_MODE', mode: 'standalone' });
          modeResolvedRef.current = true;
        }
      }
    }

    void tryConnect();

    return () => {
      clearTimeout(timer);
      ws?.close();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.forceStandalone, opts.serverUrl]);

  const submitGoal = useCallback(
    (goal: string) => {
      if (state.mode === 'server') {
        wsRef.current?.send(JSON.stringify({ type: 'run.create', goal }));
      } else {
        // Standalone: run embedded engine
        async function runStandalone() {
          const { StandaloneEngine } = await import('../engine/standalone-engine.js');
          const engine = new StandaloneEngine();
          engineRef.current = engine;
          engine.on('event', handleEvent);
          await engine.run(goal);
        }
        void runStandalone();
      }
    },
    [state.mode, handleEvent],
  );

  const cancelRun = useCallback(() => {
    if (state.mode === 'server') {
      const runId = state.run?.id;
      if (runId) {
        wsRef.current?.send(JSON.stringify({ type: 'run.cancel', runId }));
      }
    } else {
      engineRef.current?.cancel();
    }
  }, [state.mode, state.run]);

  return { state, dispatch, submitGoal, cancelRun };
}
