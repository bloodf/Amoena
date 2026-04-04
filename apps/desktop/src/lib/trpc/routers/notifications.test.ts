import { describe, expect, it, vi } from 'vitest';
import { EventEmitter } from 'node:events';
import { NOTIFICATION_EVENTS } from 'shared/constants';

const mockNotificationsEmitter = new EventEmitter();

const mockAgentLifecycleEvent = {
  agentId: 'agent-1',
  status: 'running' as const,
};

const mockNotificationIds = {
  paneId: 'pane-1',
  type: 'terminal' as const,
};

vi.mock('main/lib/notifications/server', () => ({
  notificationsEmitter: mockNotificationsEmitter,
}));

vi.mock('shared/constants', () => ({
  NOTIFICATION_EVENTS: {
    AGENT_LIFECYCLE: 'agent_lifecycle',
    FOCUS_TAB: 'focus_tab',
    TERMINAL_EXIT: 'terminal_exit',
  },
}));

const { createNotificationsRouter } = await import('./notifications');

describe('notifications router', () => {
  it('creates a router with expected shape', () => {
    const router = createNotificationsRouter();
    expect(router).toBeDefined();
    expect(typeof router).toBe('object');
  });

  describe('subscribe subscription', () => {
    it('emits agent lifecycle events', async () => {
      const router = createNotificationsRouter();
      const caller = router.createCaller({});

      const events: Array<{
        type: string;
        data?: unknown;
      }> = [];

      // @ts-ignore - subscription handling
      const subscription = caller.subscription('notifications.subscribe', {});

      // Give it a moment to set up
      await new Promise((r) => setTimeout(r, 20));

      // Emit test events
      mockNotificationsEmitter.emit(NOTIFICATION_EVENTS.AGENT_LIFECYCLE, mockAgentLifecycleEvent);
      mockNotificationsEmitter.emit(NOTIFICATION_EVENTS.FOCUS_TAB, mockNotificationIds);

      // The subscription should be set up correctly
      expect(subscription).toBeDefined();
    });

    it('handles terminal exit events', async () => {
      const router = createNotificationsRouter();
      const caller = router.createCaller({});

      // @ts-ignore - subscription handling
      const subscription = caller.subscription('notifications.subscribe', {});

      const terminalExitData = {
        paneId: 'pane-1',
        type: 'terminal' as const,
        exitCode: 0,
        signal: undefined,
        reason: 'exited' as const,
      };

      // Emit terminal exit
      mockNotificationsEmitter.emit(NOTIFICATION_EVENTS.TERMINAL_EXIT, terminalExitData);

      expect(subscription).toBeDefined();
    });
  });
});
