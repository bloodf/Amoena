import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { ItemDetailPanel } from './ItemDetailPanel';
import type { MarketplaceItem } from './types';

const baseItem: MarketplaceItem = {
  id: 'item-2',
  name: 'Lint Pack',
  author: 'community',
  installs: '5k',
  installCount: 5000,
  desc: 'Linting tools for multiple languages',
  category: 'Tool Packs',
  installed: false,
  trusted: true,
  version: '2.0.1',
  permissions: ['read:fs'],
  signed: true,
  compatibility: '>=1.0.0',
  lastUpdated: '2024-02-01',
  rating: 4.2,
  tags: ['lint', 'quality'],
};

describe('ItemDetailPanel', () => {
  test('renders item name and description', () => {
    render(
      <ItemDetailPanel
        item={baseItem}
        onInstall={vi.fn(() => {})}
        onUninstall={vi.fn(() => {})}
        onClose={vi.fn(() => {})}
      />,
    );
    expect(screen.getByText('Lint Pack')).toBeTruthy();
    expect(screen.getByText('Linting tools for multiple languages')).toBeTruthy();
  });

  test('shows Install button when item is not installed — branch line 27-35', () => {
    render(
      <ItemDetailPanel
        item={{ ...baseItem, installed: false }}
        onInstall={vi.fn(() => {})}
        onUninstall={vi.fn(() => {})}
        onClose={vi.fn(() => {})}
      />,
    );
    expect(screen.getByText('Install')).toBeTruthy();
  });

  test('shows Uninstall button when item is installed — branch line 27-35', () => {
    render(
      <ItemDetailPanel
        item={{ ...baseItem, installed: true }}
        onInstall={vi.fn(() => {})}
        onUninstall={vi.fn(() => {})}
        onClose={vi.fn(() => {})}
      />,
    );
    expect(screen.getByText('Uninstall')).toBeTruthy();
  });

  test('calls onInstall when Install button clicked', () => {
    const onInstall = vi.fn(() => {});
    render(
      <ItemDetailPanel
        item={{ ...baseItem, installed: false }}
        onInstall={onInstall}
        onUninstall={vi.fn(() => {})}
        onClose={vi.fn(() => {})}
      />,
    );
    fireEvent.click(screen.getByText('Install'));
    expect(onInstall).toHaveBeenCalled();
  });

  test('calls onUninstall when Uninstall button clicked', () => {
    const onUninstall = vi.fn(() => {});
    render(
      <ItemDetailPanel
        item={{ ...baseItem, installed: true }}
        onInstall={vi.fn(() => {})}
        onUninstall={onUninstall}
        onClose={vi.fn(() => {})}
      />,
    );
    fireEvent.click(screen.getByText('Uninstall'));
    expect(onUninstall).toHaveBeenCalled();
  });

  test('shows Trusted label when item.trusted is true — branch line 63-65', () => {
    render(
      <ItemDetailPanel
        item={{ ...baseItem, trusted: true }}
        onInstall={vi.fn(() => {})}
        onUninstall={vi.fn(() => {})}
        onClose={vi.fn(() => {})}
      />,
    );
    expect(screen.getByText('Trusted')).toBeTruthy();
  });

  test('shows Unverified label when item.trusted is false — branch line 63-65', () => {
    render(
      <ItemDetailPanel
        item={{ ...baseItem, trusted: false }}
        onInstall={vi.fn(() => {})}
        onUninstall={vi.fn(() => {})}
        onClose={vi.fn(() => {})}
      />,
    );
    expect(screen.getByText('Unverified')).toBeTruthy();
  });

  test('shows Yes for signed when item.signed is true — branch line 70', () => {
    render(
      <ItemDetailPanel
        item={{ ...baseItem, signed: true }}
        onInstall={vi.fn(() => {})}
        onUninstall={vi.fn(() => {})}
        onClose={vi.fn(() => {})}
      />,
    );
    expect(screen.getByText('Yes')).toBeTruthy();
  });

  test('shows No for signed when item.signed is false — branch line 70', () => {
    render(
      <ItemDetailPanel
        item={{ ...baseItem, signed: false }}
        onInstall={vi.fn(() => {})}
        onUninstall={vi.fn(() => {})}
        onClose={vi.fn(() => {})}
      />,
    );
    expect(screen.getByText('No')).toBeTruthy();
  });
});
