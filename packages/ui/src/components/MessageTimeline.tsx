import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ChevronDown, Circle } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface TimelineMessage {
  id: string;
  role: 'user' | 'assistant' | 'ai' | 'permission' | 'system';
  content: string;
  timestamp: string;
  model?: string;
  tuiColor?: string;
  reasoning?: boolean;
  reasoningActive?: boolean;
  reasoningContent?: string;
  diffFile?: string;
  diffStats?: string;
  requestId?: string;
}

const mockMessages: TimelineMessage[] = [
  { id: '1', role: 'system', content: 'Session started', timestamp: '10:32 AM' },
  {
    id: '2',
    role: 'user',
    content:
      'Refactor the authentication module to use JWT tokens with refresh token rotation. The current session-based auth is causing issues with our microservice architecture.',
    timestamp: '10:32 AM',
  },
  {
    id: '3',
    role: 'assistant',
    content:
      "I'll refactor the authentication module to use JWT with refresh token rotation. Let me analyze the current codebase first.\n\nHere's my plan:\n1. Replace session store with JWT issuer\n2. Add refresh token table with rotation tracking\n3. Update middleware to validate JWTs\n4. Add token revocation endpoint",
    model: 'Claude 4 Sonnet',
    tuiColor: 'tui-claude',
    timestamp: '10:32 AM',
    reasoningActive: true,
  },
  {
    id: '4',
    role: 'assistant',
    content:
      '```rust\nuse jsonwebtoken::{encode, decode, Header, Validation};\nuse chrono::{Utc, Duration};\n\npub struct TokenPair {\n    pub access_token: String;\n    pub refresh_token: String;\n    pub expires_in: i64;\n}\n\nimpl AuthService {\n    pub fn issue_tokens(&self, user_id: &str) -> Result<TokenPair> {\n        let access_claims = Claims {\n            sub: user_id.to_string(),\n            exp: (Utc::now() + Duration::minutes(15)).timestamp() as usize,\n            iat: Utc::now().timestamp() as usize,\n        };\n        // ... token generation\n    }\n}\n```',
    model: 'Claude 4 Sonnet',
    tuiColor: 'tui-claude',
    timestamp: '10:33 AM',
    diffFile: 'src/auth/tokens.rs',
    diffStats: '+42 -8',
  },
  {
    id: '5',
    role: 'permission',
    content: 'Delete file: src/auth/session_store.rs',
    timestamp: '10:33 AM',
    requestId: 'permission-mock',
  },
  {
    id: '6',
    role: 'user',
    content: 'Looks good. Also add rate limiting to the token refresh endpoint.',
    timestamp: '10:34 AM',
  },
  {
    id: '7',
    role: 'assistant',
    content:
      "Adding rate limiting to the refresh endpoint using a sliding window counter. I'll use Redis for distributed rate limiting since you're running microservices.\n\n```rust\npub struct RateLimiter {\n    window_ms: u64,\n    max_requests: u32,\n}\n\nimpl RateLimiter {\n    pub async fn check(&self, key: &str) -> Result<bool> {\n        let count = self.redis.incr(key).await?;\n        if count == 1 {\n            self.redis.expire(key, self.window_ms / 1000).await?;\n        }\n        Ok(count <= self.max_requests)\n    }\n}\n```\n\nRate limit set to 5 refresh requests per 15-minute window per user.",
    model: 'Claude 4 Sonnet',
    tuiColor: 'tui-claude',
    timestamp: '10:35 AM',
    diffFile: 'src/auth/rate_limit.rs',
    diffStats: '+38 -0',
  },
];

function splitCodeBlocks(content: string) {
  return content.split('```');
}

export function MessageTimeline({
  messages = mockMessages,
  isStreaming = true,
  onApprovePermission,
  onDenyPermission,
}: {
  messages?: TimelineMessage[];
  isStreaming?: boolean;
  onApprovePermission?: (requestId: string) => void;
  onDenyPermission?: (requestId: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(true);
  const [collapsedReasoning, setCollapsedReasoning] = useState<Record<string, boolean>>({});

  const toggleReasoning = (id: string) => {
    setCollapsedReasoning((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    if (atBottom && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, atBottom]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setAtBottom(scrollHeight - scrollTop - clientHeight < 50);
  };

  return (
    <div className="relative h-full">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto px-4 py-4 space-y-3"
      >
        {messages.map((msg) => {
          const role = msg.role === 'ai' ? 'assistant' : msg.role;
          const reasoningActive = msg.reasoningActive ?? msg.reasoning ?? false;

          return (
            <div key={msg.id}>
              {role === 'system' ? (
                <div className="flex items-center justify-center py-2">
                  <span className="rounded bg-surface-2 px-3 py-1 text-[11px] font-mono text-muted-foreground">
                    {msg.content}
                  </span>
                </div>
              ) : null}

              {role === 'user' ? (
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded bg-surface-2 px-3 py-2.5 text-sm text-foreground">
                    {msg.content}
                  </div>
                </div>
              ) : null}

              {role === 'assistant' ? (
                <div className="max-w-[85%] space-y-1">
                  {msg.model ? (
                    <div className="mb-1 flex items-center gap-1.5">
                      <Circle
                        size={6}
                        className={cn(
                          'fill-current',
                          msg.tuiColor === 'tui-claude' && 'text-tui-claude',
                          msg.tuiColor === 'tui-opencode' && 'text-tui-opencode',
                          msg.tuiColor === 'tui-gemini' && 'text-tui-gemini',
                        )}
                      />
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {msg.model}
                      </span>
                      {reasoningActive ? (
                        <button
                          onClick={() => toggleReasoning(msg.id)}
                          className="flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-mono text-primary hover:bg-primary/20 transition-colors"
                        >
                          REASONING
                          <ChevronDown
                            size={8}
                            className={cn(
                              'transition-transform',
                              collapsedReasoning[msg.id] ? '-rotate-90' : '',
                            )}
                          />
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                  {reasoningActive && msg.reasoningContent && !collapsedReasoning[msg.id] ? (
                    <div className="mb-1 rounded border border-primary/20 bg-primary/5 px-3 py-2 text-[11px] font-mono text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {msg.reasoningContent}
                    </div>
                  ) : null}
                  <div
                    className={cn(
                      'rounded border-t-[1px] bg-surface-2 px-3 py-2.5 text-sm text-foreground',
                      msg.tuiColor === 'tui-claude' && 'border-t-tui-claude',
                    )}
                  >
                    {msg.diffFile ? (
                      <div className="mb-2 flex items-center gap-2 text-[11px] font-mono">
                        <span className="text-muted-foreground">📄 {msg.diffFile}</span>
                        <span className="text-green">{msg.diffStats?.split(' ')[0]}</span>
                        <span className="text-destructive">{msg.diffStats?.split(' ')[1]}</span>
                      </div>
                    ) : null}
                    <div className="whitespace-pre-wrap font-sans leading-relaxed">
                      {splitCodeBlocks(msg.content).map((part, index) =>
                        index % 2 === 0 ? (
                          <span key={index}>{part}</span>
                        ) : (
                          <pre
                            key={index}
                            className="my-2 overflow-x-auto rounded border border-border bg-surface-0 p-3 text-[13px] font-mono"
                          >
                            <code>{part.replace(/^\w+\n/, '')}</code>
                          </pre>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              ) : null}

              {role === 'permission' ? (
                <div className="max-w-[85%] rounded border border-warning/40 bg-warning/5 px-3 py-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Circle size={6} className="fill-warning text-warning animate-pulse" />
                      <span className="text-sm text-foreground">{msg.content}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        className="rounded bg-success px-2.5 py-1 text-[11px] font-medium text-success-foreground transition-colors hover:bg-success/90"
                        onClick={() => {
                          if (msg.requestId) onApprovePermission?.(msg.requestId);
                        }}
                      >
                        Approve
                      </button>
                      <button
                        className="rounded border border-destructive px-2.5 py-1 text-[11px] font-medium text-destructive transition-colors hover:bg-destructive/10"
                        onClick={() => {
                          if (msg.requestId) onDenyPermission?.(msg.requestId);
                        }}
                      >
                        Deny
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}

        {isStreaming ? (
          <div aria-label="Assistant is streaming" className="flex items-center gap-2 py-2">
            <div className="h-[2px] flex-1 animate-pulse-magenta bg-gradient-to-r from-transparent via-primary to-transparent" />
          </div>
        ) : null}
      </div>

      {!atBottom ? (
        <button
          aria-label="Scroll to latest message"
          onClick={() => {
            scrollRef.current?.scrollTo({
              top: scrollRef.current.scrollHeight,
              behavior: 'smooth',
            });
          }}
          className="absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-2 text-muted-foreground shadow-lg transition-colors hover:text-foreground"
        >
          <ArrowDown size={14} />
        </button>
      ) : null}
    </div>
  );
}
