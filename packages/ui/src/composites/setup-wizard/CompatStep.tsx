import { Button } from '../../primitives/button.tsx';

export function SetupWizardCompatStep({
  onLaunch,
}: {
  onLaunch: () => void;
}) {
  return (
    <div className="space-y-6 text-center">
      <div>
        <h2 className="mb-2 text-lg font-semibold text-foreground">Ecosystem Compatibility</h2>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          Amoena can import compatible agent settings, hooks, and extension metadata from supported ecosystems.
        </p>
      </div>

      <div className="mx-auto max-w-md rounded border border-border bg-surface-1 p-4 text-left text-sm text-muted-foreground">
        <div className="mb-2 font-medium text-foreground">Compatibility scan</div>
        <ul className="space-y-1">
          <li>Claude-compatible hooks: ready to import</li>
          <li>OpenCode-compatible hooks: ready to import</li>
          <li>Built-in personas: available</li>
        </ul>
      </div>

      <Button onClick={onLaunch} className="px-6 py-2.5 text-sm">
        Launch Amoena
      </Button>
    </div>
  );
}
