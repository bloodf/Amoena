// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MaintenanceWidget } from './maintenance-widget';

afterEach(() => cleanup());

const baseData = {
  dbStats: {
    tasks: { total: 0, byStatus: {} },
    agents: { total: 0, byStatus: {} },
    audit: { day: 0, week: 0, loginFailures: 0 },
    activities: { day: 0 },
    notifications: { unread: 0 },
    pipelines: { active: 0, recentDay: 0 },
    backup: null,
    dbSizeBytes: 0,
    webhookCount: 0,
  },
} as any;

describe('MaintenanceWidget', () => {
  it('renders header', () => {
    render(<MaintenanceWidget data={baseData} />);
    expect(screen.getByText('Maintenance + Backup')).toBeDefined();
  });

  it('shows alert when no backup exists', () => {
    render(<MaintenanceWidget data={baseData} />);
    expect(screen.getByText('None')).toBeDefined();
  });

  it('renders backup info when present', () => {
    const data = {
      dbStats: {
        ...baseData.dbStats,
        backup: { name: 'backup.db', size: 1024 * 1024 * 50, age_hours: 2 },
        pipelines: { active: 3, recentDay: 12 },
      },
    } as any;
    render(<MaintenanceWidget data={data} />);
    expect(screen.getByText('2h ago')).toBeDefined();
    expect(screen.getByText('50 MB')).toBeDefined();
    expect(screen.getByText('3')).toBeDefined();
    expect(screen.getByText('12')).toBeDefined();
  });

  it('renders active pipelines count', () => {
    render(<MaintenanceWidget data={baseData} />);
    expect(screen.getByText('Active pipelines')).toBeDefined();
    expect(screen.getByText('0')).toBeDefined();
  });

  it('renders pipeline runs 24h', () => {
    render(<MaintenanceWidget data={baseData} />);
    expect(screen.getByText('Pipeline runs (24h)')).toBeDefined();
  });
});
