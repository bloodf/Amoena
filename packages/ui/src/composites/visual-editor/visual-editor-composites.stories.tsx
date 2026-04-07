import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import { ComponentTreePane } from './ComponentTreePane';
import { EditorCanvas } from './EditorCanvas';
import { EditorToolbar } from './EditorToolbar';
import { PropertiesPanel } from './PropertiesPanel';
import {
  visualEditorComponentTree,
  visualEditorProperties,
  visualEditorViewports,
  visualEditorTools,
} from './data';

/* ------------------------------------------------------------------ */
/*  ComponentTreePane                                                  */
/* ------------------------------------------------------------------ */

const componentTreeMeta: Meta<typeof ComponentTreePane> = {
  title: 'Composites/VisualEditor/ComponentTreePane',
  component: ComponentTreePane,
};
export default componentTreeMeta;
type ComponentTreeStory = StoryObj<typeof ComponentTreePane>;

export const ComponentTreeDefault: ComponentTreeStory = {
  args: {
    nodes: visualEditorComponentTree,
    selectedComponent: visualEditorComponentTree[0]?.name ?? '',
    onSelect: fn(),
  },
};

export const ComponentTreeNoneSelected: ComponentTreeStory = {
  args: {
    nodes: visualEditorComponentTree,
    selectedComponent: '',
    onSelect: fn(),
  },
};

export const ComponentTreeSingleNode: ComponentTreeStory = {
  args: {
    nodes: [{ name: 'App', depth: 0, children: false }],
    selectedComponent: 'App',
    onSelect: fn(),
  },
};

/* ------------------------------------------------------------------ */
/*  EditorCanvas                                                       */
/* ------------------------------------------------------------------ */

type EditorCanvasStory = StoryObj<typeof EditorCanvas>;

export const CanvasPreview: EditorCanvasStory = {
  args: {
    selectedComponent: 'Button',
    activeTool: 'select',
    activeViewport: 'desktop',
    viewMode: 'preview',
    code: '',
  },
  render: (args) => <EditorCanvas {...args} />,
};

export const CanvasCodeView: EditorCanvasStory = {
  args: {
    selectedComponent: 'Button',
    activeTool: 'select',
    activeViewport: 'desktop',
    viewMode: 'code',
    code: '<Button variant="primary">Click me</Button>',
  },
  render: (args) => <EditorCanvas {...args} />,
};

export const CanvasMobileViewport: EditorCanvasStory = {
  args: {
    selectedComponent: 'Card',
    activeTool: 'select',
    activeViewport: 'mobile',
    viewMode: 'preview',
    code: '',
  },
  render: (args) => <EditorCanvas {...args} />,
};

/* ------------------------------------------------------------------ */
/*  EditorToolbar                                                      */
/* ------------------------------------------------------------------ */

type EditorToolbarStory = StoryObj<typeof EditorToolbar>;

export const ToolbarDefault: EditorToolbarStory = {
  args: {
    tools: visualEditorTools,
    activeTool: visualEditorTools[0]?.id ?? 'select',
    onSelectTool: fn(),
    viewports: visualEditorViewports,
    activeViewport: visualEditorViewports[0]?.id ?? 'desktop',
    onSelectViewport: fn(),
    zoom: 100,
    onZoomOut: fn(),
    onZoomIn: fn(),
    onResetZoom: fn(),
    viewMode: 'preview',
    onViewModeChange: fn(),
  },
  render: (args) => <EditorToolbar {...args} />,
};

export const ToolbarZoomedIn: EditorToolbarStory = {
  args: {
    tools: visualEditorTools,
    activeTool: 'select',
    onSelectTool: fn(),
    viewports: visualEditorViewports,
    activeViewport: 'desktop',
    onSelectViewport: fn(),
    zoom: 150,
    onZoomOut: fn(),
    onZoomIn: fn(),
    onResetZoom: fn(),
    viewMode: 'preview',
    onViewModeChange: fn(),
  },
  render: (args) => <EditorToolbar {...args} />,
};

export const ToolbarCodeMode: EditorToolbarStory = {
  args: {
    tools: visualEditorTools,
    activeTool: 'select',
    onSelectTool: fn(),
    viewports: visualEditorViewports,
    activeViewport: 'desktop',
    onSelectViewport: fn(),
    zoom: 100,
    onZoomOut: fn(),
    onZoomIn: fn(),
    onResetZoom: fn(),
    viewMode: 'code',
    onViewModeChange: fn(),
  },
  render: (args) => <EditorToolbar {...args} />,
};

/* ------------------------------------------------------------------ */
/*  PropertiesPanel                                                    */
/* ------------------------------------------------------------------ */

type PropertiesPanelStory = StoryObj<typeof PropertiesPanel>;

const defaultPropValues: Record<string, string> = Object.fromEntries(
  visualEditorProperties.map((p) => [p.label, p.value]),
);

export const PropertiesDefault: PropertiesPanelStory = {
  args: {
    selectedComponent: 'Button',
    properties: visualEditorProperties,
    propValues: defaultPropValues,
    editingProp: null,
    onPropChange: fn(),
    onStartEditing: fn(),
    onStopEditing: fn(),
  },
  render: (args) => <PropertiesPanel {...args} />,
};

export const PropertiesEditing: PropertiesPanelStory = {
  args: {
    selectedComponent: 'Button',
    properties: visualEditorProperties,
    propValues: defaultPropValues,
    editingProp: visualEditorProperties[0]?.label ?? null,
    onPropChange: fn(),
    onStartEditing: fn(),
    onStopEditing: fn(),
  },
  render: (args) => <PropertiesPanel {...args} />,
};

export const PropertiesNoSelection: PropertiesPanelStory = {
  args: {
    selectedComponent: '',
    properties: [],
    propValues: {},
    editingProp: null,
    onPropChange: fn(),
    onStartEditing: fn(),
    onStopEditing: fn(),
  },
  render: (args) => <PropertiesPanel {...args} />,
};
