import Image from 'next/image';
import { SessionReplayPanel } from '@/components/panels/session-replay-panel';

export default function ReplayPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen flex-col">
        <header className="border-b border-border bg-card/80 px-6 py-4 shadow-sm backdrop-blur md:px-8">
          <div className="mx-auto flex w-full max-w-7xl items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-background">
              <Image
                src="/brand/mc-logo-128.png"
                alt="Amoena logo"
                width={44}
                height={44}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                Amoena replay
              </p>
              <h1 className="text-xl font-semibold">Session replay</h1>
            </div>
          </div>
        </header>
        <div className="min-h-0 flex-1">
          <SessionReplayPanel />
        </div>
      </div>
    </div>
  );
}
