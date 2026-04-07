import { useState } from "react";
import { ScreenRoot } from '../components/screen.tsx';
import { visualEditorComponentTree as componentTree, visualEditorProperties as properties, visualEditorTools as tools, visualEditorViewports as viewports } from '../composites/visual-editor/data.ts';
import { ComponentTreePane } from '../composites/visual-editor/ComponentTreePane.tsx';
import { EditorToolbar } from '../composites/visual-editor/EditorToolbar.tsx';
import { EditorCanvas } from '../composites/visual-editor/EditorCanvas.tsx';
import { PropertiesPanel } from '../composites/visual-editor/PropertiesPanel.tsx';

export function VisualEditorScreen() {
  const [selectedComponent, setSelectedComponent] = useState("SessionView");
  const [activeViewport, setActiveViewport] = useState("desktop");
  const [activeTool, setActiveTool] = useState("select");
  const [zoom, setZoom] = useState(100);
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [editingProp, setEditingProp] = useState<string | null>(null);
  const [propValues, setPropValues] = useState<Record<string, string>>(
    Object.fromEntries(properties.map(p => [p.label, p.value]))
  );

  const handlePropChange = (label: string, value: string) => {
    setPropValues(prev => ({ ...prev, [label]: value }));
  };

  const generatedCode = `<${selectedComponent}
  className="flex flex-col gap-2 p-4 w-full"
  style={{
${Object.entries(propValues).map(([k, v]) => `    ${k}: "${v}"`).join(",\n")}
  }}
>
  {/* Component content renders here */}
  <children />
</${selectedComponent}>`;

  return (
    <ScreenRoot className="overflow-hidden">
      <div className="flex h-full">
        <ComponentTreePane nodes={componentTree} selectedComponent={selectedComponent} onSelect={setSelectedComponent} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <EditorToolbar
            tools={tools}
            activeTool={activeTool}
            onSelectTool={setActiveTool}
            viewports={viewports}
            activeViewport={activeViewport}
            onSelectViewport={setActiveViewport}
            zoom={zoom}
            onZoomOut={() => setZoom(Math.max(25, zoom - 25))}
            onZoomIn={() => setZoom(Math.min(200, zoom + 25))}
            onResetZoom={() => setZoom(100)}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
          <EditorCanvas selectedComponent={selectedComponent} activeTool={activeTool} activeViewport={activeViewport} viewMode={viewMode} code={generatedCode} />
        </div>

        <PropertiesPanel
          selectedComponent={selectedComponent}
          properties={properties}
          propValues={propValues}
          editingProp={editingProp}
          onPropChange={handlePropChange}
          onStartEditing={setEditingProp}
          onStopEditing={() => setEditingProp(null)}
        />
      </div>
    </ScreenRoot>
  );
}
