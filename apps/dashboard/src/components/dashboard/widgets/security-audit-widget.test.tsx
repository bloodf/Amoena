// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SecurityAuditWidget } from './security-audit-widget';

vi.mock('@/lib/navigation', () => ({
  useNavigateToPanel: () => vi.fn(),
}));

afterEach(() => cleanup());

describe('SecurityAuditWidget', () => {
  it('renders header', async () => {
    render(<SecurityAuditWidget data={{ dbStats: null } as any} />);
    expect(screen.getByText('Security + Audit')).toBeDefined();
  });

  it('renders stat rows for audit data', async () => {
    const data = {
      dbStats: {
        audit: { day: 5, week: 20, loginFailures: 0 },
        notifications: { unread: 0 },
      },
    } as any;
    render(<SecurityAuditWidget data={data} />);
    expect(screen.getByText('Audit events (24h)')).toBeDefined();
    expect(screen.getByText('5')).toBeDefined();
    expect(screen.getByText('Audit events (7d)')).toBeDefined();
    expect(screen.getByText('20')).toBeDefined();
  });

  it('renders view security panel button', async () => {
    render(<SecurityAuditWidget data={{ dbStats: null } as any} />);
    expect(screen.getByText('View Security Panel')).toBeDefined();
  });

  it('shows login failures alert when present', async () => {
    const data = {
      dbStats: {
        audit: { day: 5, week: 20, loginFailures: 3 },
        notifications: { unread: 0 },
      },
    } as any;
    render(<SecurityAuditWidget data={data} />);
    expect(screen.getByText('3')).toBeDefined();
  });
});
