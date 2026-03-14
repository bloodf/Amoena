import { Circle as CircleIcon, Image, Monitor, MousePointer, Move, Smartphone, Square, Tablet, Type } from "lucide-react";

export const visualEditorComponentTree = [
  { name: "App", depth: 0, children: true },
  { name: "Layout", depth: 1, children: true },
  { name: "Header", depth: 2, children: true },
  { name: "Logo", depth: 3, children: false },
  { name: "Nav", depth: 3, children: false },
  { name: "Main", depth: 2, children: true },
  { name: "SessionView", depth: 3, children: true, selected: true },
  { name: "Timeline", depth: 4, children: false },
  { name: "Composer", depth: 4, children: false },
  { name: "Sidebar", depth: 2, children: false },
] as const;

export const visualEditorProperties = [
  { label: "width", value: "100%", type: "text" },
  { label: "padding", value: "16px", type: "text" },
  { label: "display", value: "flex", type: "select", options: ["flex", "block", "grid", "inline-flex", "none"] },
  { label: "flex-direction", value: "column", type: "select", options: ["row", "column", "row-reverse", "column-reverse"] },
  { label: "gap", value: "8px", type: "text" },
  { label: "background", value: "transparent", type: "text" },
  { label: "border-radius", value: "0px", type: "text" },
] as const;

export const visualEditorViewports = [
  { id: "desktop", label: "Desktop", icon: Monitor, width: "1440px" },
  { id: "tablet", label: "Tablet", icon: Tablet, width: "768px" },
  { id: "mobile", label: "Mobile", icon: Smartphone, width: "375px" },
] as const;

export const visualEditorTools = [
  { id: "select", label: "Select", icon: MousePointer },
  { id: "move", label: "Move", icon: Move },
  { id: "text", label: "Text", icon: Type },
  { id: "image", label: "Image", icon: Image },
  { id: "rectangle", label: "Rectangle", icon: Square },
  { id: "circle", label: "Circle", icon: CircleIcon },
] as const;
