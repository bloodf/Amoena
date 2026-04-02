import Image from 'next/image';
import { PipelineTab } from '@/components/panels/pipeline-tab';

export default function AutopilotPage() {
  return (
    <div className="min-h-screen bg-background px-6 py-8 text-foreground md:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
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
              Amoena orchestrate
            </p>
            <h1 className="text-xl font-semibold">Autopilot lifecycle</h1>
          </div>
        </header>

        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <PipelineTab />
        </section>
      </div>
    </div>
  );
}
