import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { MemoryAddForm } from './MemoryAddForm';
import { MemoryBrowserHeader } from './MemoryBrowserHeader';
import { MemoryDetailPanel } from './MemoryDetailPanel';
import { MemoryEntryList } from './MemoryEntryList';
import { MemoryFilters } from './MemoryFilters';
import { initialMemoryEntries } from './data';
import type { MemoryEntry } from './types';

const sampleEntry: MemoryEntry = initialMemoryEntries[0]!;

describe('MemoryBrowserHeader', () => {
  test('renders title and description', () => {
    render(
      <MemoryBrowserHeader
        viewMode="list"
        onAdd={() => {}}
        onExport={() => {}}
        onViewModeChange={() => {}}
      />,
    );
    expect(screen.getByText('Memory Browser')).toBeTruthy();
    expect(screen.getByText('Browse, pin, and manage structured memory.')).toBeTruthy();
  });

  test('renders add and export buttons', () => {
    render(
      <MemoryBrowserHeader
        viewMode="list"
        onAdd={() => {}}
        onExport={() => {}}
        onViewModeChange={() => {}}
      />,
    );
    expect(screen.getByText('Add Memory')).toBeTruthy();
    expect(screen.getByText('Export')).toBeTruthy();
  });

  test('fires onAdd when add button is clicked', () => {
    const onAdd = vi.fn(() => {});
    render(
      <MemoryBrowserHeader
        viewMode="list"
        onAdd={onAdd}
        onExport={() => {}}
        onViewModeChange={() => {}}
      />,
    );
    fireEvent.click(screen.getByText('Add Memory'));
    expect(onAdd).toHaveBeenCalled();
  });

  test('fires onExport when export button is clicked', () => {
    const onExport = vi.fn(() => {});
    render(
      <MemoryBrowserHeader
        viewMode="list"
        onAdd={() => {}}
        onExport={onExport}
        onViewModeChange={() => {}}
      />,
    );
    fireEvent.click(screen.getByText('Export'));
    expect(onExport).toHaveBeenCalled();
  });

  test('fires onViewModeChange when view toggle is clicked', () => {
    const onViewModeChange = vi.fn(() => {});
    render(
      <MemoryBrowserHeader
        viewMode="list"
        onAdd={() => {}}
        onExport={() => {}}
        onViewModeChange={onViewModeChange}
      />,
    );
    fireEvent.click(screen.getByText('Graph'));
    expect(onViewModeChange).toHaveBeenCalledWith('graph');
  });
});

describe('MemoryEntryList', () => {
  test('renders all entries', () => {
    render(
      <MemoryEntryList entries={initialMemoryEntries} selectedKey={null} onSelect={() => {}} />,
    );
    expect(screen.getByText('auth.strategy')).toBeTruthy();
    expect(screen.getByText('api.versioning')).toBeTruthy();
    expect(screen.getByText('db.pool_config')).toBeTruthy();
    expect(screen.getByText('error.handling')).toBeTruthy();
    expect(screen.getByText('testing.strategy')).toBeTruthy();
  });

  test('shows empty state when no entries', () => {
    render(<MemoryEntryList entries={[]} selectedKey={null} onSelect={() => {}} />);
    expect(screen.getByText('No memories match filters')).toBeTruthy();
  });

  test('fires onSelect when an entry is clicked', () => {
    const onSelect = vi.fn(() => {});
    render(
      <MemoryEntryList entries={initialMemoryEntries} selectedKey={null} onSelect={onSelect} />,
    );
    fireEvent.click(screen.getByText('auth.strategy'));
    expect(onSelect).toHaveBeenCalledWith('auth.strategy');
  });
});

describe('MemoryDetailPanel', () => {
  test('shows placeholder when entry is null', () => {
    render(
      <MemoryDetailPanel
        entry={null}
        confirmDelete={null}
        onTogglePin={() => {}}
        onExport={() => {}}
        onAskDelete={() => {}}
        onCancelDelete={() => {}}
        onConfirmDelete={() => {}}
        onConvertToPersistent={() => {}}
      />,
    );
    expect(screen.getByText('Select a memory entry')).toBeTruthy();
  });

  test('renders entry details when entry is provided', () => {
    render(
      <MemoryDetailPanel
        entry={sampleEntry}
        confirmDelete={null}
        onTogglePin={() => {}}
        onExport={() => {}}
        onAskDelete={() => {}}
        onCancelDelete={() => {}}
        onConfirmDelete={() => {}}
        onConvertToPersistent={() => {}}
      />,
    );
    expect(screen.getByText('auth.strategy')).toBeTruthy();
    expect(screen.getByText('Architecture')).toBeTruthy();
    expect(screen.getByText(sampleEntry.value)).toBeTruthy();
    expect(screen.getByText('142B')).toBeTruthy();
  });

  test('renders session and agent info when present', () => {
    render(
      <MemoryDetailPanel
        entry={sampleEntry}
        confirmDelete={null}
        onTogglePin={() => {}}
        onExport={() => {}}
        onAskDelete={() => {}}
        onCancelDelete={() => {}}
        onConfirmDelete={() => {}}
        onConvertToPersistent={() => {}}
      />,
    );
    expect(screen.getByText('JWT Auth Refactor')).toBeTruthy();
    expect(screen.getByText('Agent: Claude 4 Sonnet')).toBeTruthy();
  });

  test('does not render session/agent info when absent', () => {
    const entryWithoutSession: MemoryEntry = {
      ...sampleEntry,
      session: undefined,
      agent: undefined,
    };
    render(
      <MemoryDetailPanel
        entry={entryWithoutSession}
        confirmDelete={null}
        onTogglePin={() => {}}
        onExport={() => {}}
        onAskDelete={() => {}}
        onCancelDelete={() => {}}
        onConfirmDelete={() => {}}
        onConvertToPersistent={() => {}}
      />,
    );
    expect(screen.queryByText('JWT Auth Refactor')).toBeNull();
  });

  test('shows convert to persistent button for workspace-scoped entries', () => {
    render(
      <MemoryDetailPanel
        entry={sampleEntry}
        confirmDelete={null}
        onTogglePin={() => {}}
        onExport={() => {}}
        onAskDelete={() => {}}
        onCancelDelete={() => {}}
        onConfirmDelete={() => {}}
        onConvertToPersistent={() => {}}
      />,
    );
    expect(screen.getByText('Convert to Persistent Memory')).toBeTruthy();
  });

  test('hides convert button for global-scoped entries', () => {
    const globalEntry: MemoryEntry = { ...sampleEntry, scope: 'global' };
    render(
      <MemoryDetailPanel
        entry={globalEntry}
        confirmDelete={null}
        onTogglePin={() => {}}
        onExport={() => {}}
        onAskDelete={() => {}}
        onCancelDelete={() => {}}
        onConfirmDelete={() => {}}
        onConvertToPersistent={() => {}}
      />,
    );
    expect(screen.queryByText('Convert to Persistent Memory')).toBeNull();
  });

  test('fires onTogglePin callback', () => {
    const onTogglePin = vi.fn(() => {});
    const { container } = render(
      <MemoryDetailPanel
        entry={sampleEntry}
        confirmDelete={null}
        onTogglePin={onTogglePin}
        onExport={() => {}}
        onAskDelete={() => {}}
        onCancelDelete={() => {}}
        onConfirmDelete={() => {}}
        onConvertToPersistent={() => {}}
      />,
    );
    // The pin toggle button is in the header actions area
    const buttons = container.querySelectorAll('button');
    // First button in the actions area is the pin toggle
    fireEvent.click(buttons[0]!);
    expect(onTogglePin).toHaveBeenCalledWith('auth.strategy');
  });

  test('fires onConvertToPersistent callback', () => {
    const onConvert = vi.fn(() => {});
    render(
      <MemoryDetailPanel
        entry={sampleEntry}
        confirmDelete={null}
        onTogglePin={() => {}}
        onExport={() => {}}
        onAskDelete={() => {}}
        onCancelDelete={() => {}}
        onConfirmDelete={() => {}}
        onConvertToPersistent={onConvert}
      />,
    );
    fireEvent.click(screen.getByText('Convert to Persistent Memory'));
    expect(onConvert).toHaveBeenCalledWith('auth.strategy');
  });
});

describe('MemoryAddForm', () => {
  test('renders input fields and buttons', () => {
    render(
      <MemoryAddForm
        keyValue=""
        value=""
        type="manual"
        onKeyChange={() => {}}
        onValueChange={() => {}}
        onTypeChange={() => {}}
        onAdd={() => {}}
        onCancel={() => {}}
      />,
    );
    expect(screen.getByPlaceholderText('memory.key')).toBeTruthy();
    expect(screen.getByPlaceholderText('Memory content...')).toBeTruthy();
    expect(screen.getByText('Add')).toBeTruthy();
    expect(screen.getByText('Cancel')).toBeTruthy();
  });

  test('add button is disabled when key and value are empty', () => {
    render(
      <MemoryAddForm
        keyValue=""
        value=""
        type="manual"
        onKeyChange={() => {}}
        onValueChange={() => {}}
        onTypeChange={() => {}}
        onAdd={() => {}}
        onCancel={() => {}}
      />,
    );
    const addButton = screen.getByText('Add').closest('button')!;
    expect(addButton.disabled).toBe(true);
  });

  test('add button is enabled when key and value are filled', () => {
    render(
      <MemoryAddForm
        keyValue="some.key"
        value="some value"
        type="manual"
        onKeyChange={() => {}}
        onValueChange={() => {}}
        onTypeChange={() => {}}
        onAdd={() => {}}
        onCancel={() => {}}
      />,
    );
    const addButton = screen.getByText('Add').closest('button')!;
    expect(addButton.disabled).toBe(false);
  });

  test('fires onKeyChange on input change', () => {
    const onKeyChange = vi.fn(() => {});
    render(
      <MemoryAddForm
        keyValue=""
        value=""
        type="manual"
        onKeyChange={onKeyChange}
        onValueChange={() => {}}
        onTypeChange={() => {}}
        onAdd={() => {}}
        onCancel={() => {}}
      />,
    );
    fireEvent.change(screen.getByPlaceholderText('memory.key'), {
      target: { value: 'new.key' },
    });
    expect(onKeyChange).toHaveBeenCalled();
  });

  test('fires onCancel when cancel is clicked', () => {
    const onCancel = vi.fn(() => {});
    render(
      <MemoryAddForm
        keyValue=""
        value=""
        type="manual"
        onKeyChange={() => {}}
        onValueChange={() => {}}
        onTypeChange={() => {}}
        onAdd={() => {}}
        onCancel={onCancel}
      />,
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();
  });
});

describe('MemoryFilters', () => {
  test('renders search input', () => {
    render(
      <MemoryFilters
        searchQuery=""
        filterType="all"
        filterSource="all"
        filterScope="all"
        onSearchChange={() => {}}
        onTypeChange={() => {}}
        onSourceChange={() => {}}
        onScopeChange={() => {}}
      />,
    );
    expect(screen.getByPlaceholderText('Search memory...')).toBeTruthy();
  });

  test('fires onSearchChange on input change', () => {
    const onSearchChange = vi.fn(() => {});
    render(
      <MemoryFilters
        searchQuery=""
        filterType="all"
        filterSource="all"
        filterScope="all"
        onSearchChange={onSearchChange}
        onTypeChange={() => {}}
        onSourceChange={() => {}}
        onScopeChange={() => {}}
      />,
    );
    fireEvent.change(screen.getByPlaceholderText('Search memory...'), {
      target: { value: 'auth' },
    });
    expect(onSearchChange).toHaveBeenCalled();
  });
});
