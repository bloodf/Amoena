// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { RuntimeHealthWidget } from './runtime-health-widget';

afterEach(() => cleanup());

describe('RuntimeHealthWidget', () => {
  it('renders header', () => {
    render(
      <RuntimeHealthWidget
        data={
          {
            localOsStatus: { value: 'OK', status: 'good' },
            claudeHealth: { value: 'Running', status: 'good' },
            codexHealth: { value: 'Running', status: 'good' },
            hermesHealth: { value: 'Running', status: 'good' },
            mcHealth: { value: 'Running', status: 'good' },
            memPct: null,
            systemStats: null,
          } as any
        }
      />,
    );
    expect(screen.getByText('Local Runtime Health')).toBeDefined();
  });

  it('renders all health rows', () => {
    render(
      <RuntimeHealthWidget
        data={
          {
            localOsStatus: { value: 'OK', status: 'good' },
            claudeHealth: { value: 'Running', status: 'good' },
            codexHealth: { value: 'Running', status: 'good' },
            hermesHealth: { value: 'Running', status: 'good' },
            mcHealth: { value: 'Running', status: 'good' },
            memPct: null,
            systemStats: null,
          } as any
        }
      />,
    );
    expect(screen.getByText('Local OS')).toBeDefined();
    expect(screen.getByText('Claude Runtime')).toBeDefined();
    expect(screen.getByText('Codex Runtime')).toBeDefined();
    expect(screen.getByText('Hermes Runtime')).toBeDefined();
    expect(screen.getByText('MC Core')).toBeDefined();
  });

  it('shows memory bar when memPct is provided', () => {
    render(
      <RuntimeHealthWidget
        data={
          {
            localOsStatus: { value: 'OK', status: 'good' },
            claudeHealth: { value: 'Running', status: 'good' },
            codexHealth: { value: 'Running', status: 'good' },
            hermesHealth: { value: 'Running', status: 'good' },
            mcHealth: { value: 'Running', status: 'good' },
            memPct: 65,
            systemStats: null,
          } as any
        }
      />,
    );
    expect(screen.getByText('65%')).toBeDefined();
  });

  it('shows uptime when systemStats has uptime', () => {
    render(
      <RuntimeHealthWidget
        data={
          {
            localOsStatus: { value: 'OK', status: 'good' },
            claudeHealth: { value: 'Running', status: 'good' },
            codexHealth: { value: 'Running', status: 'good' },
            hermesHealth: { value: 'Running', status: 'good' },
            mcHealth: { value: 'Running', status: 'good' },
            memPct: null,
            systemStats: { uptime: 7200000 },
          } as any
        }
      />,
    );
    expect(screen.getByText('Uptime')).toBeDefined();
  });
});
