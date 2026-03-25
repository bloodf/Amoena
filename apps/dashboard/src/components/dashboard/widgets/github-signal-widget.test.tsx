// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { GithubSignalWidget } from './github-signal-widget';

afterEach(() => cleanup());

describe('GithubSignalWidget', () => {
  it('renders header', () => {
    render(<GithubSignalWidget data={{ githubStats: null, isGithubLoading: false } as any} />);
    expect(screen.getByText('GitHub Signal')).toBeDefined();
  });

  it('shows loading message when loading', () => {
    render(<GithubSignalWidget data={{ githubStats: null, isGithubLoading: true } as any} />);
    expect(screen.getByText('Loading GitHub stats...')).toBeDefined();
  });

  it('shows no token message when not loading and no stats', () => {
    render(<GithubSignalWidget data={{ githubStats: null, isGithubLoading: false } as any} />);
    expect(screen.getByText('No GitHub token configured')).toBeDefined();
  });

  it('renders GitHub stats when present', () => {
    const data = {
      githubStats: {
        user: { login: 'testuser' },
        repos: {
          total: 10,
          public: 7,
          private: 3,
          total_open_issues: 42,
          total_stars: 150,
        },
      },
      isGithubLoading: false,
    } as any;
    render(<GithubSignalWidget data={data} />);
    expect(screen.getByText('@testuser')).toBeDefined();
    expect(screen.getByText('Active repos')).toBeDefined();
    expect(screen.getByText('10')).toBeDefined();
    expect(screen.getByText('7 / 3')).toBeDefined();
    expect(screen.getByText('42')).toBeDefined();
    expect(screen.getByText('150')).toBeDefined();
  });
});
