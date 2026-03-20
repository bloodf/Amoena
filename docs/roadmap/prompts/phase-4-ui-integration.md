# Phase 4: UI Integration & Unique Screens — Agent Prompt

## Mission

Build all 11 Lunaria screens with real tRPC data, integrate into navigation, and implement the Memory Graph Home as the default landing page.

**Duration:** 2 weeks
**Prerequisite:** Phase 3 complete (all services functional, tRPC endpoints working)
**Deliverable:** All screens functional with live data, Memory Graph as home, Session Replay UI, Diagnostics page

## Context

### Architecture

- Renderer uses TanStack Router v1 (file-based), TanStack Query v5, Zustand v5
- tRPC via trpc-electron (direct IPC, no HTTP)
- Lunaria routers at `trpc.lunaria.*`
- UI components in `packages/ui/src/components/lunaria/`
- shadcn/ui primitives + Superset ai-elements available

### Design Decisions (from design review)

- Memory Graph Home is the DEFAULT landing page (not workspace list)
- d3-force + Canvas 2D for memory graph (Barnes-Hut approximation, 500+ nodes at 60fps)
- Split-pane Session Replay (terminal left, event timeline right, transport controls bottom)
- Kanban cards show agent avatars, magenta progress ring on claimed tasks
- Persona/Opinions page: character selection style, not settings form
- Extension cards: .luna badge with magenta border glow
- Autopilot timeline density visualization (color-coded by event type)

### Interaction States (ALL screens must implement)

Every screen needs: Loading (shimmer skeleton), Empty (warm message + primary CTA), Error (specific message + retry + diagnostics link), Success (functional UI), Partial (progressive loading)

### Information Architecture

```
Memory Graph Home (default) → Workspaces / Lunaria Features / Settings
  Lunaria Features:
    Memory Browser, Agents, Autopilot, Kanban, Marketplace,
    Remote, Visual Editor, Opinions, Replay, Diagnostics
```

### Responsive (window resizing)

- > =1280px: Full layout (sidebar + main + side panel)
- 960-1279px: Sidebar collapses to icon rail (64px)
- <960px: Single-pane mode

### Accessibility

- Tab navigation in reading order
- Arrow keys for lists
- Escape closes modals
- Cmd+K → Command Palette
- ARIA landmarks on every page
- 4.5:1 contrast minimum
- 44px touch targets
- Focus: 2px magenta ring

### Memory Graph Implementation Recipe

```tsx
// MemoryGraphView.tsx — d3-force + Canvas 2D
import { useRef, useEffect } from 'react';
import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3-force';

export function MemoryGraphView({ nodes, links }: GraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const sim = forceSimulation(nodes)
      .force('charge', forceManyBody().strength(-30).theta(0.9))
      .force('link', forceLink(links).distance(50))
      .force('center', forceCenter(canvas.width / 2, canvas.height / 2))
      .on('tick', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw links
        links.forEach((l) => {
          ctx.beginPath();
          ctx.moveTo(l.source.x, l.source.y);
          ctx.lineTo(l.target.x, l.target.y);
          ctx.strokeStyle = 'hsla(300, 100%, 36%, 0.3)'; // magenta
          ctx.stroke();
        });
        // Draw nodes
        nodes.forEach((n) => {
          ctx.beginPath();
          ctx.arc(n.x, n.y, 5, 0, 2 * Math.PI);
          ctx.fillStyle = n.isAgent ? 'hsl(300, 100%, 36%)' : 'hsl(270, 8%, 40%)';
          ctx.fill();
        });
      });
    return () => sim.stop();
  }, [nodes, links]);

  return <canvas ref={canvasRef} width={800} height={600} />;
}
```

Install dependencies: `bun add d3-force @types/d3-force` in apps/desktop.

## Execution Rules

1. **Commit after every completed step** — never batch multiple steps into one commit
2. **Use conventional commits**: `feat(lunaria): <step description>`
3. **Run `bun run build` before each commit** — never commit broken code
4. **If a step fails, fix it before moving on** — don't skip and come back later
5. **Inspect files before editing them** — use Codex GUI tools and shell reads to understand existing code before changing it

## Screens to Build (11)

1. **Memory Graph Home** — Force-directed graph (d3-force + Canvas), live agent indicators (pulsing), status widgets (agents/memories/autopilot), quick actions
2. **Memory Browser** — Search bar, graph/list toggle, tier filter, entry detail panel
3. **Agent Management** — Active agent cards, consensus panel, permission hierarchy display
4. **Autopilot Dashboard** — Phase pipeline with glow on active, progress bar, live output, workflow template selector
5. **Kanban Board** — @dnd-kit columns, task cards with agent badges, agent-claimed progress rings
6. **Marketplace** — Extension grid with .luna badges, category filter, install/permission review
7. **Remote Access** — QR/PIN pairing, device list with revoke, connection status
8. **Visual Editor** — @xyflow/react (React Flow) node-based workflow canvas
9. **Opinions/Personas** — Character-selection style cards, system prompt editor (CodeMirror), model/temperature
10. **Session Replay** — Split-pane: xterm replay left, event timeline right, transport controls
11. **Diagnostics** — Service health cards, recent errors, memory/recording storage stats, log export

### StatusBar Enhancement

Add Lunaria widgets to bottom bar: memory count, agent count, autopilot status, device count

### Sidebar Navigation

Add "LUNARIA" section to DashboardSidebar with links to all 11 screens, magenta indicator pip on active

## Troubleshooting

### Build Failures

- Run `bunx tsc --noEmit` to find TypeScript errors
- Check for imports from deleted/moved packages
- Run `bun install` to refresh dependencies

### Test Failures

- Isolate: `bun test <specific-file>`
- Read error output carefully — most failures are import/type mismatches
- Fix implementation, not tests (unless tests are wrong)

### Commit Safety

- Commit after EVERY completed step (not at the end)
- Use conventional commits: `feat(lunaria): <description>`
- Run `bun run build` before committing to avoid broken commits
- If build breaks, fix before committing — never commit broken code

## Acceptance Criteria

- [ ] Memory Graph Home is default landing page
- [ ] Canvas element renders in Memory Graph Home with width/height > 0
- [ ] d3-forceSimulation is initialized with forceLink, forceManyBody (theta: 0.9), forceCenter
- [ ] Graph renders test data (create 50 mock nodes + 30 mock links) without console errors
- [ ] Node click triggers detail panel via quadtree hit detection
- [ ] All 11 screens render with real tRPC data
- [ ] All interaction states implemented (loading/empty/error/success/partial)
- [ ] Sidebar navigation works for all screens
- [ ] StatusBar shows live Lunaria widgets
- [ ] Session Replay plays back recordings with timeline scrubbing
- [ ] Kanban drag-and-drop works
- [ ] Accessibility: keyboard navigation on all screens
- [ ] Responsive: window resizing works at all 3 breakpoints
- [ ] No TypeScript errors, app builds
