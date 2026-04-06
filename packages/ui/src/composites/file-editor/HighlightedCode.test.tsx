import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { HighlightedCode } from './HighlightedCode';

// Mock useTheme hook
vi.fn('@/hooks/use-theme', () => ({
  useTheme: () => ({ theme: 'dark' }),
}));

// Mock prismjs
vi.fn('prismjs', () => ({
  default: {
    languages: {
      typescript: {},
      javascript: {},
      jsx: {},
      tsx: {},
      css: {},
      json: {},
      markdown: {},
      bash: {},
      yaml: {},
      toml: {},
      plaintext: {},
    },
    highlight: (code: string) => code,
    util: {
      encode: (code: string) => code,
    },
  },
}));

describe('HighlightedCode', () => {
  test('renders line numbers for each line of content', () => {
    const content = 'line one\nline two\nline three';
    render(<HighlightedCode content={content} fileName="test.ts" />);
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
  });

  test('renders single line content without crash', () => {
    render(<HighlightedCode content="single line" fileName="readme.md" />);
    expect(screen.getByText('1')).toBeTruthy();
  });

  test('renders empty content without crash', () => {
    render(<HighlightedCode content="" fileName="empty.json" />);
    expect(screen.getByText('1')).toBeTruthy();
  });

  test('renders code element', () => {
    const { container } = render(<HighlightedCode content="const x = 1;" fileName="app.ts" />);
    const code = container.querySelector('code');
    expect(code).toBeTruthy();
  });

  test('renders code element with language class for known extension', () => {
    const { container } = render(<HighlightedCode content="const x = 1;" fileName="app.ts" />);
    const code = container.querySelector('code');
    expect(code?.className).toContain('language-typescript');
  });

  test('renders code element with plaintext class for unknown extension', () => {
    const { container } = render(<HighlightedCode content="raw content" fileName="file.xyz" />);
    const code = container.querySelector('code');
    expect(code?.className).toContain('language-plaintext');
  });
});
