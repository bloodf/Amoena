import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { EmptySessionState } from './EmptySessionState';
import { MessageTimeline } from './MessageTimeline';
import { RemoteAccessScreen } from '@/screens/RemoteAccessScreen';
import { InstallReviewSheet } from '@/composites/marketplace/InstallReviewSheet';
import { MarketplaceItemCard } from '@/composites/marketplace/MarketplaceItemCard';
import { allItems } from '@/composites/marketplace/data';

describe('Amoena direct interactions', () => {
  test('empty session suggestions call back into the composer flow', () => {
    const onSuggestionClick = vi.fn(() => {});
    render(
      <EmptySessionState
        provider="claude"
        model="Claude 4 Sonnet"
        sessionName="Fresh Session"
        onSuggestionClick={onSuggestionClick}
      />,
    );

    fireEvent.click(screen.getByText('Refactor a module'));
    expect(onSuggestionClick).toHaveBeenCalledWith(
      'Refactor the authentication module to use JWT tokens',
    );
  });

  test('message timeline exposes permission actions and scroll-to-bottom control', () => {
    render(<MessageTimeline />);

    expect(screen.getByRole('button', { name: 'Approve' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Deny' })).toBeTruthy();

    const scrollHost = document.querySelector('.overflow-y-auto') as HTMLDivElement;
    Object.defineProperty(scrollHost, 'scrollHeight', { value: 500, configurable: true });
    Object.defineProperty(scrollHost, 'clientHeight', { value: 100, configurable: true });
    Object.defineProperty(scrollHost, 'scrollTop', {
      value: 0,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(scrollHost, 'scrollTo', { value: vi.fn(() => {}), configurable: true });

    fireEvent.scroll(scrollHost);
    fireEvent.click(screen.getByRole('button', { name: /scroll to latest message/i }));

    expect(scrollHost.scrollTo as ReturnType<typeof mock>).toHaveBeenCalled();
  });

  test('remote access screen toggles trust, pin visibility, terminal modes, and revocation', () => {
    render(<RemoteAccessScreen />);

    fireEvent.click(screen.getByRole('button', { name: 'Hide PIN' }));
    expect(screen.getByText('847 291')).toBeTruthy();

    fireEvent.click(screen.getByText('Trusted'));
    expect(screen.getByText('Unverified')).toBeTruthy();

    fireEvent.click(screen.getByText('Regenerate'));
    expect(screen.getByText(/Expires in/i)).toBeTruthy();

    fireEvent.click(screen.getByText('Revoke'));
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.getByText('Pixel 8 Pro')).toBeTruthy();

    fireEvent.click(screen.getByText('Revoke'));
    fireEvent.click(screen.getByText('Confirm'));
    expect(screen.getByText('No devices connected')).toBeTruthy();

    const toggles = screen.getAllByRole('switch');
    fireEvent.click(toggles[0]);
    fireEvent.click(toggles[1]);
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('Never'));
    expect(screen.getByRole('combobox').textContent).toContain('Never');
  });

  test('install review sheet handles close and confirm', () => {
    const onClose = vi.fn(() => {});
    const onConfirm = vi.fn(() => {});
    render(<InstallReviewSheet item={allItems[1]} onClose={onClose} onConfirm={onConfirm} />);

    fireEvent.click(
      screen.getByText('Review Installation').closest('div')!.parentElement!.parentElement!,
    );
    expect(onClose).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Install'));
    expect(onConfirm).toHaveBeenCalled();
  });

  test('marketplace item card supports select, install, and uninstall handlers', () => {
    const onSelect = vi.fn(() => {});
    const onInstall = vi.fn(() => {});
    const onUninstall = vi.fn(() => {});

    const { rerender } = render(
      <MarketplaceItemCard
        item={allItems[1]}
        isSelected={false}
        onSelect={onSelect}
        onInstall={onInstall}
        onUninstall={onUninstall}
      />,
    );

    fireEvent.click(screen.getByText('Code Review Agent'));
    expect(onSelect).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /Install/i }));
    expect(onInstall).toHaveBeenCalled();

    rerender(
      <MarketplaceItemCard
        item={allItems[0]}
        isSelected
        onSelect={onSelect}
        onInstall={onInstall}
        onUninstall={onUninstall}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Uninstall/i }));
    expect(onUninstall).toHaveBeenCalled();
  });
});
