import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../primitives/button.tsx';
import {
  ScreenContainer,
  ScreenHeader,
  ScreenHeaderCopy,
  ScreenRoot,
  ScreenSubtitle,
  ScreenTitle,
} from '../components/screen.tsx';
import { newSessionProviders } from '../composites/new-session/data.ts';
import {
  ExternalProviderCard,
  FeaturedProviderCard,
} from '../composites/new-session/ProviderCard.tsx';

export interface SessionConfig {
  name: string;
  workTarget: 'local' | 'worktree' | 'cloud';
  model: string;
  provider: string;
  reasoningMode: string;
  reasoningDepth: string;
  permission: string;
}

export function NewSessionScreen() {
  const navigate = useNavigate();

  const handleSelectProvider = (id: string) => {
    const p = newSessionProviders.find((pr) => pr.id === id);
    if (!p) return;
    navigate('/session', {
      state: {
        newSession: {
          name: 'New Session',
          workTarget: 'local',
          model: p.models[0],
          provider: id,
          reasoningMode: 'auto',
          reasoningDepth: 'high',
          permission: 'default',
        } as SessionConfig,
      },
    });
  };

  const featured = newSessionProviders.find((p) => p.featured);
  if (!featured) return null;
  const external = newSessionProviders.filter((p) => !p.featured);

  return (
    <ScreenRoot className="bg-background">
      <div className="flex flex-shrink-0 items-center gap-3 border-b border-border px-6 py-4">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="gap-1.5 px-0 text-[13px] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Back
        </Button>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-y-auto">
        <ScreenContainer className="w-full max-w-[780px] gap-8 py-10">
          <ScreenHeader className="justify-center text-center">
            <ScreenHeaderCopy className="space-y-2">
              <ScreenTitle className="text-2xl font-bold">Start a new session</ScreenTitle>
              <ScreenSubtitle className="text-[14px]">
                Choose an AI provider to power your coding session.
              </ScreenSubtitle>
            </ScreenHeaderCopy>
          </ScreenHeader>

          <FeaturedProviderCard
            provider={featured}
            onSelect={() => handleSelectProvider(featured.id)}
          />

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
              External TUI Providers
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {external.map((provider) => (
              <ExternalProviderCard
                key={provider.id}
                provider={provider}
                onSelect={() => handleSelectProvider(provider.id)}
              />
            ))}
          </div>
        </ScreenContainer>
      </div>
    </ScreenRoot>
  );
}
