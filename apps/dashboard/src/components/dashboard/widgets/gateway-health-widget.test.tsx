// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { GatewayHealthWidget } from './gateway-health-widget';

afterEach(() => cleanup());

describe('GatewayHealthWidget', () => {
  it('renders header', () => {
    render(
      <GatewayHealthWidget
        data={
          {
            connection: { isConnected: false },
            sessions: [],
            errorCount: 0,
            backlogCount: 0,
            memPct: null,
            systemStats: null,
            gatewayHealthStatus: 'warn',
          } as any
        }
      />,
    );
    expect(screen.getByText('Gateway Health + Golden Signals')).toBeDefined();
  });

  it('shows connected status when connected', () => {
    render(
      <GatewayHealthWidget
        data={
          {
            connection: { isConnected: true },
            sessions: [],
            errorCount: 0,
            backlogCount: 0,
            memPct: null,
            systemStats: null,
            gatewayHealthStatus: 'good',
          } as any
        }
      />,
    );
    expect(screen.getByText('Connected')).toBeDefined();
  });

  it('shows disconnected when not connected', () => {
    render(
      <GatewayHealthWidget
        data={
          {
            connection: { isConnected: false },
            sessions: [],
            errorCount: 0,
            backlogCount: 0,
            memPct: null,
            systemStats: null,
            gatewayHealthStatus: 'bad',
          } as any
        }
      />,
    );
    expect(screen.getByText('Disconnected')).toBeDefined();
  });

  it('renders traffic row with session count', () => {
    const data = {
      connection: { isConnected: false },
      sessions: [{ id: '1' }, { id: '2' }],
      errorCount: 0,
      backlogCount: 0,
      memPct: null,
      systemStats: null,
      gatewayHealthStatus: 'good',
    } as any;
    render(<GatewayHealthWidget data={data} />);
    expect(screen.getByText('2')).toBeDefined();
  });

  it('shows memory bar when memPct is provided', () => {
    const data = {
      connection: { isConnected: false },
      sessions: [],
      errorCount: 0,
      backlogCount: 0,
      memPct: 75,
      systemStats: null,
      gatewayHealthStatus: 'good',
    } as any;
    render(<GatewayHealthWidget data={data} />);
    expect(screen.getByText('75%')).toBeDefined();
  });

  it('shows disk info when systemStats has disk', () => {
    const data = {
      connection: { isConnected: false },
      sessions: [],
      errorCount: 0,
      backlogCount: 0,
      memPct: null,
      systemStats: { disk: { usage: '45' } },
      gatewayHealthStatus: 'good',
    } as any;
    render(<GatewayHealthWidget data={data} />);
    expect(screen.getByText('Disk')).toBeDefined();
  });
});
