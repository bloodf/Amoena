import { useCallback, useEffect, useRef, useState } from "react";
import { memoryGraphNodes, memoryGraphSourceColors } from "./data";
import type { MemoryGraphNode } from "./types";

export function useMemoryGraphSimulation(onSelectNode?: (key: string) => void) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const nodesRef = useRef<MemoryGraphNode[]>(memoryGraphNodes.map((node) => ({ ...node })));
  const animRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const simulate = useCallback(() => {
    const nodes = nodesRef.current;
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;

    for (const node of nodes) {
      node.vx += (centerX - node.x) * 0.0005;
      node.vy += (centerY - node.y) * 0.0005;

      for (const other of nodes) {
        if (other.id === node.id) continue;
        const dx = node.x - other.x;
        const dy = node.y - other.y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 30);
        const force = 2000 / (dist * dist);
        node.vx += (dx / dist) * force;
        node.vy += (dy / dist) * force;
      }

      for (const connectionId of node.connections) {
        const connection = nodes.find((entry) => entry.id === connectionId);
        if (!connection) continue;
        const dx = connection.x - node.x;
        const dy = connection.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const force = (dist - 150) * 0.003;
        node.vx += (dx / dist) * force;
        node.vy += (dy / dist) * force;
      }

      node.vx *= 0.92;
      node.vy *= 0.92;
      node.x += node.vx;
      node.y += node.vy;
      node.x = Math.max(40, Math.min(dimensions.width - 40, node.x));
      node.y = Math.max(40, Math.min(dimensions.height - 40, node.y));
    }
  }, [dimensions]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    context.scale(dpr, dpr);
    context.clearRect(0, 0, dimensions.width, dimensions.height);

    const nodes = nodesRef.current;

    for (const node of nodes) {
      for (const connectionId of node.connections) {
        const connection = nodes.find((entry) => entry.id === connectionId);
        if (!connection || connection.id < node.id) continue;
        const isHighlighted =
          hoveredNode === node.id || hoveredNode === connection.id || selectedNode === node.id || selectedNode === connection.id;
        context.beginPath();
        context.moveTo(node.x, node.y);
        context.lineTo(connection.x, connection.y);
        context.strokeStyle = isHighlighted ? "hsla(300, 100%, 36%, 0.5)" : "hsla(260, 5%, 30%, 0.25)";
        context.lineWidth = isHighlighted ? 2 : 1;
        context.stroke();
      }
    }

    for (const node of nodes) {
      const isHovered = hoveredNode === node.id;
      const isSelected = selectedNode === node.id;
      const isConnected = hoveredNode ? nodes.find((entry) => entry.id === hoveredNode)?.connections.includes(node.id) : false;
      const radius = isHovered || isSelected ? 8 : isConnected ? 7 : 5;
      const color = memoryGraphSourceColors[node.source];

      if (isHovered || isSelected) {
        context.beginPath();
        context.arc(node.x, node.y, radius + 8, 0, Math.PI * 2);
        context.fillStyle = `${color.replace(")", ", 0.15)")}`;
        context.fill();
      }

      context.beginPath();
      context.arc(node.x, node.y, radius, 0, Math.PI * 2);
      context.fillStyle = isHovered || isSelected || isConnected ? color : `${color.replace(")", ", 0.6)")}`;
      context.fill();

      if (isHovered || isSelected) {
        context.font = "500 11px 'JetBrains Mono'";
        context.fillStyle = "hsl(var(--foreground))";
        context.textAlign = "center";
        context.fillText(node.key, node.x, node.y - radius - 8);
      }
    }

    simulate();
    animRef.current = requestAnimationFrame(draw);
  }, [dimensions, hoveredNode, selectedNode, simulate]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  const handleMouseMove = (event: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const found = nodesRef.current.find((node) => Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2) < 15);
    setHoveredNode(found?.id || null);
  };

  const handleClick = (event: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const found = nodesRef.current.find((node) => Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2) < 15);
    if (found) {
      setSelectedNode(found.id);
      onSelectNode?.(found.key);
    } else {
      setSelectedNode(null);
    }
  };

  return {
    canvasRef,
    containerRef,
    hoveredNode,
    dimensions,
    handleMouseMove,
    handleClick,
  };
}
