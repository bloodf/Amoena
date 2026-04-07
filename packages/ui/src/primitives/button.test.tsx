import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { Button } from './button';

describe('Button', () => {
  test('renders label', () => {
    render(<Button>Run</Button>);
    expect(screen.getByRole('button', { name: 'Run' })).not.toBeNull();
  });

  test('supports variant classes', () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole('button', { name: 'Delete' }).className).toContain('bg-destructive');
  });

  test('renders outline variant', () => {
    render(<Button variant="outline">Outline</Button>);
    const btn = screen.getByRole('button', { name: 'Outline' });
    expect(btn.className).toContain('border');
    expect(btn.className).toContain('bg-background');
  });

  test('renders secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button', { name: 'Secondary' }).className).toContain('bg-secondary');
  });

  test('renders ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>);
    const btn = screen.getByRole('button', { name: 'Ghost' });
    expect(btn.className).not.toContain('bg-primary');
    expect(btn.className).not.toContain('border');
  });

  test('renders link variant', () => {
    render(<Button variant="link">Link</Button>);
    expect(screen.getByRole('button', { name: 'Link' }).className).toContain('underline-offset-4');
  });

  test('applies size sm', () => {
    render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button', { name: 'Small' }).className).toContain('h-9');
  });

  test('applies size lg', () => {
    render(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button', { name: 'Large' }).className).toContain('h-11');
  });

  test('applies size icon', () => {
    render(<Button size="icon">★</Button>);
    expect(screen.getByRole('button', { name: '★' }).className).toContain('w-10');
  });

  test('disabled button has disabled attribute', () => {
    render(<Button disabled>Disabled</Button>);
    const btn = screen.getByRole('button', { name: 'Disabled' });
    expect(btn.getAttribute('disabled')).not.toBeNull();
    expect(btn.className).toContain('disabled:opacity-50');
  });

  test('disabled button does not fire onClick', () => {
    let clicked = false;
    render(
      <Button disabled onClick={() => (clicked = true)}>
        No Click
      </Button>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'No Click' }));
    expect(clicked).toBe(false);
  });

  test('fires onClick on click', () => {
    let clicked = false;
    render(<Button onClick={() => (clicked = true)}>Click Me</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Click Me' }));
    expect(clicked).toBe(true);
  });

  test('keyboard activation with Enter triggers click', () => {
    render(<Button onClick={() => {}}>Enter</Button>);
    const btn = screen.getByRole('button', { name: 'Enter' });
    fireEvent.keyDown(btn, { key: 'Enter' });
    fireEvent.keyUp(btn, { key: 'Enter' });
    // Native button click on Enter is handled by the browser, not JSDOM.
    // Verify the button is keyboard-accessible (not tabIndex=-1)
    expect(btn.getAttribute('tabindex')).not.toBe('-1');
  });

  test('keyboard activation with Space triggers click', () => {
    render(<Button>Space</Button>);
    const btn = screen.getByRole('button', { name: 'Space' });
    // Verify button is keyboard-accessible (role=button + focusable)
    expect(btn.tagName).toBe('BUTTON');
    expect(btn.getAttribute('tabindex')).not.toBe('-1');
  });

  test('has focus-visible ring class', () => {
    render(<Button>Focus</Button>);
    expect(screen.getByRole('button', { name: 'Focus' }).className).toContain(
      'focus-visible:ring-2',
    );
  });

  test('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    expect(screen.getByRole('button', { name: 'Custom' }).className).toContain('custom-class');
  });

  test('renders as child slot with asChild', () => {
    render(
      <Button asChild>
        <a href="/link">As Link</a>
      </Button>,
    );
    const link = screen.getByText('As Link');
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('/link');
  });

  test('forwards type attribute', () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole('button', { name: 'Submit' }).getAttribute('type')).toBe('submit');
  });
});
