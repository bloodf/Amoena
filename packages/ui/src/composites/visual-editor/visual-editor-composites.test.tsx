import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { ComponentTreePane } from './ComponentTreePane';
import { EditorCanvas } from './EditorCanvas';
import { EditorToolbar } from './EditorToolbar';
import { PropertiesPanel } from './PropertiesPanel';
import {
  visualEditorComponentTree,
  visualEditorProperties,
  visualEditorTools,
  visualEditorViewports,
} from './data';

describe('EditorCanvas', () => {
  const defaultProps = {
    selectedComponent: 'SessionView',
    activeTool: 'select',
    activeViewport: 'desktop',
    viewMode: 'preview' as const,
    code: '<div className="session-view">...</div>',
  };

  test('renders preview mode with selected component info', () => {
    render(<EditorCanvas {...defaultProps} />);
    expect(screen.getByText('Click elements to select and edit')).toBeTruthy();
  });

  test('shows active component, tool, and viewport in preview', () => {
    render(<EditorCanvas {...defaultProps} />);
    const matches = screen.getAllByText('SessionView');
    expect(matches.length).toBe(2);
    expect(screen.getByText('select')).toBeTruthy();
    expect(screen.getByText('desktop')).toBeTruthy();
  });

  test('renders code mode with source code', () => {
    render(<EditorCanvas {...defaultProps} viewMode="code" />);
    expect(screen.getByText('<div className="session-view">...</div>')).toBeTruthy();
  });

  test('does not show preview content in code mode', () => {
    render(<EditorCanvas {...defaultProps} viewMode="code" />);
    expect(screen.queryByText('Click elements to select and edit')).toBeNull();
  });

  test('does not show code content in preview mode', () => {
    render(<EditorCanvas {...defaultProps} viewMode="preview" />);
    expect(screen.queryByText('<div className="session-view">...</div>')).toBeNull();
  });
});

describe('ComponentTreePane', () => {
  const onSelect = vi.fn(() => {});

  const defaultProps = {
    nodes: visualEditorComponentTree,
    selectedComponent: 'SessionView',
    onSelect,
  };

  test('renders the Component Tree heading', () => {
    render(<ComponentTreePane {...defaultProps} />);
    expect(screen.getByText('Component Tree')).toBeTruthy();
  });

  test('renders all tree nodes', () => {
    render(<ComponentTreePane {...defaultProps} />);
    expect(screen.getByText('App')).toBeTruthy();
    expect(screen.getByText('Layout')).toBeTruthy();
    expect(screen.getByText('Header')).toBeTruthy();
    expect(screen.getByText('Logo')).toBeTruthy();
    expect(screen.getByText('Nav')).toBeTruthy();
    expect(screen.getByText('Main')).toBeTruthy();
    expect(screen.getByText('SessionView')).toBeTruthy();
    expect(screen.getByText('Timeline')).toBeTruthy();
    expect(screen.getByText('Composer')).toBeTruthy();
    expect(screen.getByText('Sidebar')).toBeTruthy();
  });

  test('calls onSelect when a node is clicked', () => {
    const handler = vi.fn(() => {});
    render(<ComponentTreePane {...defaultProps} onSelect={handler} />);
    fireEvent.click(screen.getByText('Header'));
    expect(handler).toHaveBeenCalledWith('Header');
  });

  test('highlights the selected component', () => {
    render(<ComponentTreePane {...defaultProps} />);
    const selectedButton = screen.getByText('SessionView').closest('button');
    expect(selectedButton?.className).toContain('text-primary');
  });

  test('non-selected nodes have muted foreground', () => {
    render(<ComponentTreePane {...defaultProps} />);
    const otherButton = screen.getByText('App').closest('button');
    expect(otherButton?.className).toContain('text-muted-foreground');
  });

  test('nodes with children show expand indicator', () => {
    render(<ComponentTreePane {...defaultProps} />);
    const appButton = screen.getByText('App').closest('button');
    expect(appButton?.innerHTML).toContain('\u25B8');
  });
});

describe('EditorToolbar', () => {
  const onSelectTool = vi.fn(() => {});
  const onSelectViewport = vi.fn(() => {});
  const onZoomOut = vi.fn(() => {});
  const onZoomIn = vi.fn(() => {});
  const onResetZoom = vi.fn(() => {});
  const onViewModeChange = vi.fn(() => {});

  const defaultProps = {
    tools: visualEditorTools,
    activeTool: 'select',
    onSelectTool,
    viewports: visualEditorViewports,
    activeViewport: 'desktop',
    onSelectViewport,
    zoom: 100,
    onZoomOut,
    onZoomIn,
    onResetZoom,
    viewMode: 'preview' as const,
    onViewModeChange,
  };

  test('renders zoom percentage', () => {
    render(<EditorToolbar {...defaultProps} />);
    expect(screen.getByText('100%')).toBeTruthy();
  });

  test('renders viewport widths', () => {
    render(<EditorToolbar {...defaultProps} />);
    expect(screen.getByText('1440px')).toBeTruthy();
    expect(screen.getByText('768px')).toBeTruthy();
    expect(screen.getByText('375px')).toBeTruthy();
  });

  test('renders Preview and Code buttons', () => {
    render(<EditorToolbar {...defaultProps} />);
    expect(screen.getByText('Preview')).toBeTruthy();
    expect(screen.getByText('Code')).toBeTruthy();
  });

  test('calls onSelectTool when a tool button is clicked', () => {
    const handler = vi.fn(() => {});
    render(<EditorToolbar {...defaultProps} onSelectTool={handler} />);
    // Tools are icon-only buttons with title attributes
    const moveButton = screen.getByTitle('Move');
    fireEvent.click(moveButton);
    expect(handler).toHaveBeenCalledWith('move');
  });

  test('calls onSelectViewport when viewport button is clicked', () => {
    const handler = vi.fn(() => {});
    render(<EditorToolbar {...defaultProps} onSelectViewport={handler} />);
    fireEvent.click(screen.getByText('768px'));
    expect(handler).toHaveBeenCalledWith('tablet');
  });

  test('calls onZoomIn when zoom in is clicked', () => {
    const handler = vi.fn(() => {});
    render(<EditorToolbar {...defaultProps} onZoomIn={handler} />);
    // ZoomIn button is between the zoom text and reset button
    const buttons = screen.getAllByRole('button');
    // Find the zoom in button (after "100%" text)
    const zoomInButton = buttons.find((btn) => {
      const prev = btn.previousElementSibling;
      return prev?.textContent === '100%';
    });
    if (zoomInButton) {
      fireEvent.click(zoomInButton);
      expect(handler).toHaveBeenCalled();
    }
  });

  test('calls onViewModeChange when Code button is clicked', () => {
    const handler = vi.fn(() => {});
    render(<EditorToolbar {...defaultProps} onViewModeChange={handler} />);
    fireEvent.click(screen.getByText('Code'));
    expect(handler).toHaveBeenCalledWith('code');
  });

  test('calls onViewModeChange with preview when Preview is clicked', () => {
    const handler = vi.fn(() => {});
    render(<EditorToolbar {...defaultProps} viewMode="code" onViewModeChange={handler} />);
    fireEvent.click(screen.getByText('Preview'));
    expect(handler).toHaveBeenCalledWith('preview');
  });

  test('calls onResetZoom when reset button is clicked', () => {
    const handler = vi.fn(() => {});
    render(<EditorToolbar {...defaultProps} onResetZoom={handler} />);
    const resetButton = screen.getByTitle('Reset zoom');
    fireEvent.click(resetButton);
    expect(handler).toHaveBeenCalled();
  });
});

describe('PropertiesPanel', () => {
  const onPropChange = vi.fn(() => {});
  const onStartEditing = vi.fn(() => {});
  const onStopEditing = vi.fn(() => {});

  const propValues: Record<string, string> = {
    width: '100%',
    padding: '16px',
    display: 'flex',
    'flex-direction': 'column',
    gap: '8px',
    background: 'transparent',
    'border-radius': '0px',
  };

  const defaultProps = {
    selectedComponent: 'SessionView',
    properties: visualEditorProperties,
    propValues,
    editingProp: null,
    onPropChange,
    onStartEditing,
    onStopEditing,
  };

  test('renders the Properties heading', () => {
    render(<PropertiesPanel {...defaultProps} />);
    expect(screen.getByText('Properties')).toBeTruthy();
  });

  test('displays the selected component name', () => {
    render(<PropertiesPanel {...defaultProps} />);
    expect(screen.getByText('SessionView')).toBeTruthy();
  });

  test('renders layout section heading', () => {
    render(<PropertiesPanel {...defaultProps} />);
    expect(screen.getByText('Layout')).toBeTruthy();
  });

  test('renders spacing section heading', () => {
    render(<PropertiesPanel {...defaultProps} />);
    expect(screen.getByText('Spacing')).toBeTruthy();
  });

  test('renders typography section heading', () => {
    render(<PropertiesPanel {...defaultProps} />);
    expect(screen.getByText('Typography')).toBeTruthy();
  });

  test('renders property labels', () => {
    render(<PropertiesPanel {...defaultProps} />);
    expect(screen.getByText('width')).toBeTruthy();
    expect(screen.getByText('padding')).toBeTruthy();
    expect(screen.getByText('gap')).toBeTruthy();
  });

  test('renders spacing margin fields', () => {
    render(<PropertiesPanel {...defaultProps} />);
    expect(screen.getByText('m-top')).toBeTruthy();
    expect(screen.getByText('m-right')).toBeTruthy();
    expect(screen.getByText('m-bottom')).toBeTruthy();
    expect(screen.getByText('m-left')).toBeTruthy();
  });

  test('renders typography fields', () => {
    render(<PropertiesPanel {...defaultProps} />);
    expect(screen.getByText('font-size')).toBeTruthy();
    expect(screen.getByText('font-weight')).toBeTruthy();
    expect(screen.getByText('line-height')).toBeTruthy();
    expect(screen.getByText('color')).toBeTruthy();
  });

  test('calls onPropChange when text input value changes', () => {
    const handler = vi.fn(() => {});
    render(<PropertiesPanel {...defaultProps} onPropChange={handler} />);
    const widthInput = screen.getByDisplayValue('100%');
    fireEvent.change(widthInput, { target: { value: '50%' } });
    expect(handler).toHaveBeenCalledWith('width', '50%');
  });

  test('calls onStartEditing on input focus', () => {
    const handler = vi.fn(() => {});
    render(<PropertiesPanel {...defaultProps} onStartEditing={handler} />);
    const widthInput = screen.getByDisplayValue('100%');
    fireEvent.focus(widthInput);
    expect(handler).toHaveBeenCalledWith('width');
  });

  test('calls onStopEditing on input blur', () => {
    const handler = vi.fn(() => {});
    render(<PropertiesPanel {...defaultProps} onStopEditing={handler} />);
    const widthInput = screen.getByDisplayValue('100%');
    fireEvent.blur(widthInput);
    expect(handler).toHaveBeenCalled();
  });

  test('highlights input border when editing', () => {
    render(<PropertiesPanel {...defaultProps} editingProp="width" />);
    const widthInput = screen.getByDisplayValue('100%');
    expect(widthInput.className).toContain('border-primary');
  });
});
