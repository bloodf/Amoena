'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface PairingPayload {
  pin: string;
  qr: string;
}

export default function RemotePairingPage() {
  const [pairing, setPairing] = useState<PairingPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPairingCode = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/remote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to start pairing session');
      }

      const data = (await response.json()) as PairingPayload;
      setPairing(data);
    } catch (fetchError) {
      setPairing(null);
      setError(
        fetchError instanceof Error ? fetchError.message : 'Failed to start pairing session',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPairingCode();
  }, [loadPairingCode]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-10 md:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-background">
              <Image
                src="/brand/mc-logo-128.png"
                alt="Amoena logo"
                width={48}
                height={48}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                Amoena remote access
              </p>
              <h1 className="text-2xl font-semibold">Remote pairing</h1>
            </div>
          </div>
          <Button onClick={() => void loadPairingCode()} disabled={isLoading}>
            {isLoading ? 'Refreshing…' : 'Refresh pairing code'}
          </Button>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">
              Bootstrap a local Amoena pairing session without external credentials.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Pairing PIN
                </p>
                <div
                  data-testid="remote-pairing-pin"
                  className="mt-3 font-mono text-4xl font-semibold tracking-[0.3em] text-foreground"
                >
                  {pairing?.pin ?? '------'}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Session status
                </p>
                <p className="mt-3 text-sm text-foreground">
                  {error
                    ? 'Failed to initialize pairing'
                    : isLoading
                      ? 'Starting local pairing bootstrap'
                      : 'Pairing session active'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {error ?? 'This PIN and QR are generated locally via /api/remote.'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Pairing QR</p>
            <div className="mt-4 flex min-h-64 items-center justify-center rounded-lg border border-dashed border-border bg-background p-4">
              {pairing?.qr ? (
                <Image
                  src={pairing.qr}
                  alt="Pairing QR code"
                  width={256}
                  height={256}
                  className="h-56 w-56 rounded-lg border border-border bg-card p-3"
                  unoptimized
                />
              ) : (
                <div className="text-center text-sm text-muted-foreground">
                  {isLoading ? 'Generating QR…' : 'QR unavailable'}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
