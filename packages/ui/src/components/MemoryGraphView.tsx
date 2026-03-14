import { memoryGraphSourceColors } from "@/composites/memory-graph/data";
import { MemoryGraphLegend } from "@/composites/memory-graph/MemoryGraphLegend";
import { useMemoryGraphSimulation } from "@/composites/memory-graph/useMemoryGraphSimulation";

export function MemoryGraphView({ onSelectNode }: { onSelectNode?: (key: string) => void }) {
  const { canvasRef, containerRef, hoveredNode, dimensions, handleMouseMove, handleClick } = useMemoryGraphSimulation(onSelectNode);

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        style={{ width: dimensions.width, height: dimensions.height, cursor: hoveredNode ? "pointer" : "default" }}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      />
      <MemoryGraphLegend sourceColors={memoryGraphSourceColors} />
    </div>
  );
}
