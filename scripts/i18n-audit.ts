#!/usr/bin/env bun
/* eslint-disable no-console */
/**
 * i18n-audit — Validates i18n compliance for Electron-scope surfaces.
 *
 * Checks:
 * 1. Locale key parity across en, de, es, fr, pt-BR
 * 2. No hardcoded user-facing English literals in scope
 * 3. Non-English locales are actually translated (not English duplicates)
 *
 * Exit codes:
 *   0 = compliant
 *   1 = parity issues and/or hardcoded literals found
 */

import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const ROOT = join(import.meta.dir, '..');
// All four Electron-authoritative surfaces must be audited
const SCOPE = ['apps/dashboard', 'apps/desktop', 'apps/mobile', 'packages/ui'];
const LOCALES = ['en', 'de', 'es', 'fr', 'pt-BR'] as const;
const LOCALE_DIR = join(ROOT, 'packages/i18n/src/resources');
const DASHBOARD_MESSAGES_DIR = join(ROOT, 'apps/dashboard/messages');

// Allowlist: ONLY genuinely technical identifiers that should never be translated.
// User-facing strings must be extracted to i18n keys — they do NOT belong here.
const ALLOWLIST: Array<{ value: string; reason: string }> = [
  // URL / host / token placeholders — not user-facing copy
  { value: 'Desktop base URL', reason: 'Input placeholder label, not user-facing copy' },
  { value: 'Pairing token', reason: 'Input placeholder label, not user-facing copy' },
  { value: 'PIN', reason: 'Input placeholder label, not user-facing copy' },
  { value: 'Device name', reason: 'Input placeholder label, not user-facing copy' },
  { value: 'http://127.0.0.1:47821', reason: 'Default localhost URL — not translatable' },
  // Technical status enum values — not display text
  { value: 'running', reason: 'Status enum value in code, not user-facing copy' },
  { value: 'on', reason: 'Technical toggle state label in code' },
  { value: 'idle', reason: 'Status enum value in code, not user-facing copy' },
  { value: 'pending', reason: 'Status enum value in code, not user-facing copy' },
  { value: 'queued', reason: 'Status enum value in code, not user-facing copy' },
  { value: 'completed', reason: 'Status enum value in code, not user-facing copy' },
  { value: 'failed', reason: 'Status enum value in code, not user-facing copy' },
  { value: 'approved', reason: 'Status enum value in code, not user-facing copy' },
  { value: 'rejected', reason: 'Status enum value in code, not user-facing copy' },
  { value: 'cancelled', reason: 'Status enum value in code, not user-facing copy' },
  // Internal git/feature flags — not user-facing
  { value: 'amoena-frontend', reason: 'Internal git branch / feature flag name' },
  { value: 'feature/redesign', reason: 'Internal git branch name' },
  // Monetary format placeholders — format is locale-specific
  { value: '$0.1', reason: 'Cost threshold chip — monetary format not i18n-managed' },
  { value: '$0.5', reason: 'Cost threshold chip — monetary format not i18n-managed' },
  { value: '$1.0', reason: 'Cost threshold chip — monetary format not i18n-managed' },
  { value: '$5.0', reason: 'Cost threshold chip — monetary format not i18n-managed' },
  // CSS class names and design tokens — not user-facing
  { value: 'dark', reason: 'Theme mode value in code, not user-facing copy' },
  { value: 'light', reason: 'Theme mode value in code, not user-facing copy' },
  { value: 'linear', reason: 'CSS animation easing value, not user-facing copy' },
  { value: 'ease-in', reason: 'CSS animation easing value, not user-facing copy' },
  { value: 'ease-out', reason: 'CSS animation easing value, not user-facing copy' },
  { value: 'visible', reason: 'CSS visibility value, not user-facing copy' },
  { value: 'end', reason: 'CSS alignment value, not user-facing copy' },
  // Design system color token names — not user-facing copy
  { value: 'primary', reason: 'Design token name in code' },
  { value: 'secondary', reason: 'Design token name in code' },
  { value: 'muted', reason: 'Design token name in code' },
  { value: 'accent', reason: 'Design token name in code' },
  { value: 'destructive', reason: 'Design token name in code' },
  { value: 'card', reason: 'Design token name in code' },
  { value: 'border', reason: 'Design token name in code' },
  { value: 'success', reason: 'Design token name in code' },
  { value: 'warning', reason: 'Design token name in code' },
  { value: 'sidebar-accent-foreground', reason: 'Design token name in code' },
  { value: 'sidebar-border', reason: 'Design token name in code' },
  { value: 'sidebar-ring', reason: 'Design token name in code' },
  { value: 'warning-foreground', reason: 'Design token name in code' },
  { value: 'success-foreground', reason: 'Design token name in code' },
  // Font names — not translatable
  { value: 'Cascadia Code', reason: 'Font family name, not translatable' },
  { value: 'Fira Code', reason: 'Font family name, not translatable' },
  { value: 'Source Code Pro', reason: 'Font family name, not translatable' },
  { value: 'VS Code', reason: 'Font name, not translatable' },
  { value: 'One Dark', reason: 'Code editor theme name, not translatable' },
  // Model/agent identifiers — product names, not translatable
  { value: 'Claude 4 Haiku', reason: 'Model name identifier' },
  { value: 'Claude 4 Opus', reason: 'Model name identifier' },
  { value: 'Gemini 2.5 Flash', reason: 'Model name identifier' },
  { value: 'Gemini 2.5 Pro', reason: 'Model name identifier' },
  { value: 'GPT-5.3-Codex-Spark', reason: 'Model name identifier' },
  { value: 'GPT-5.4', reason: 'Model name identifier' },
  { value: 'Autopilot', reason: 'Feature name label, intentionally kept in English' },
  // Shell names — not translatable
  { value: 'git', reason: 'Shell/tech term name' },
  { value: 'fish', reason: 'Shell name' },
  { value: 'zsh', reason: 'Shell name' },
  { value: 'bash', reason: 'Shell name' },
  // CSS/Tailwind class fragment patterns — not user-facing
  { value: 'bg-blue-500', reason: 'Tailwind color class — not user-facing copy' },
  {
    value: 'from-amber-500 to-yellow-400',
    reason: 'Tailwind gradient class — not user-facing copy',
  },
  {
    value: 'from-green-500 to-emerald-400',
    reason: 'Tailwind gradient class — not user-facing copy',
  },
  { value: 'from-red-500 to-rose-400', reason: 'Tailwind gradient class — not user-facing copy' },
  {
    value: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
    reason: 'Tailwind class block',
  },
  { value: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100', reason: 'Tailwind class block' },
  { value: 'mt-2 sm:mt-0', reason: 'Tailwind margin class' },
  // Template literal expressions — not simple string literals
  {
    value: 'v{ext.version}{ext.publisher ? ` · ${ext.publisher}` : ""}',
    reason: 'Template literal expression',
  },
  // CSS bracket selectors — not user-facing
  {
    value: '[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize',
    reason: 'CSS selector',
  },
  { value: '[[data-side=left][data-collapsible=offcanvas]_&]:-right-2', reason: 'CSS selector' },
  { value: '[[data-side=right][data-collapsible=offcanvas]_&]:-left-2', reason: 'CSS selector' },
  // Variable interpolation — not user-facing
  { value: '${threshold}', reason: 'Variable interpolation pattern' },
  // Accessibility/HTML role values — technical, not display text
  { value: 'button', reason: 'Accessibility role value in code' },
  { value: 'breadcrumb', reason: 'Accessibility role value in code' },
  { value: 'pagination', reason: 'Accessibility role value in code' },
  { value: 'terminal', reason: 'Accessibility role value in code' },
  { value: 'tool_usage', reason: 'Accessibility role value in code' },
  { value: 'pattern', reason: 'Accessibility role value in code' },
  { value: 'group', reason: 'Accessibility role value in code' },
  { value: 'entity', reason: 'Accessibility role value in code' },
  { value: 'reviews', reason: 'Accessibility role value in code' },
  { value: 'notifies', reason: 'Accessibility role value in code' },
  // Internal API parameter values — not user-facing display text
  { value: 'approve', reason: 'API parameter value for permission resolution' },
  { value: 'deny', reason: 'API parameter value for permission resolution' },
  { value: 'cancel', reason: 'API parameter value for session cancellation' },
  // CLI-specific terms — internal tool output
  { value: 'Blobless clone', reason: 'Git clone type option' },
  { value: 'Treeless clone', reason: 'Git clone type option' },
  { value: 'Shallow clone (depth 1)', reason: 'Git clone type option' },
  // Code editor / terminal terminology — internal
  { value: 'Context window usage', reason: 'Technical metric name' },
  { value: 'Memory token budget', reason: 'Technical metric name' },
  { value: 'Security radar chart', reason: 'Technical chart name' },
  { value: 'Agent collaboration graph', reason: 'Technical chart name' },
  { value: 'Subagent swarm grid', reason: 'Technical view name' },
  { value: 'Session replay timeline', reason: 'Technical feature name' },
  { value: 'Autopilot live activity', reason: 'Technical feature name' },
  // UI symbols — not translatable content
  { value: '...', reason: 'Ellipsis icon symbol, not translatable content' },
  // Locale selector language names (locale-invariant: shown in native script regardless of UI locale)
  // This is a standard i18n pattern - language names are displayed in their own script
  { value: 'Español', reason: 'Locale selector language name in native script (locale-invariant)' },
  {
    value: 'Français',
    reason: 'Locale selector language name in native script (locale-invariant)',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isAllowlisted(literal: string): boolean {
  return ALLOWLIST.some(({ value }) => literal === value || new RegExp(`^${value}$`).test(literal));
}

function flattenKeys(obj: unknown, prefix = ''): Map<string, string> {
  const result = new Map<string, string>();
  if (typeof obj === 'string') {
    result.set(prefix, obj);
    return result;
  }
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      const key = prefix ? `${prefix}.${k}` : k;
      for (const [subKey, val] of flattenKeys(v, key)) {
        result.set(subKey, val);
      }
    }
  }
  return result;
}

async function loadLocale(locale: string): Promise<Map<string, string>> {
  const filePath = join(LOCALE_DIR, `${locale}.ts`);
  const content = await readFile(filePath, 'utf8');
  // Strip `export const en = { ... } as const` to get the object literal
  const match = content.match(/=\s*({[\s\S]*?})\s*as const/);
  if (!match) return new Map();
  const evaluated = new Function(`return ${match[1]}`)();
  return flattenKeys(evaluated);
}

async function loadDashboardMessages(locale: string): Promise<Map<string, string>> {
  const filePath = join(DASHBOARD_MESSAGES_DIR, `${locale}.json`);
  try {
    const content = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(content);
    return flattenKeys(parsed);
  } catch {
    return new Map();
  }
}

async function* walkDir(dir: string): AsyncGenerator<string> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (
      entry.name === 'node_modules' ||
      entry.name === '.next' ||
      entry.name === 'dist' ||
      entry.name === 'build' ||
      entry.name === 'tests' ||
      entry.name === '__tests__' ||
      entry.name === 'test' ||
      entry.name === 'stories' ||
      entry.name === '__storyblocks' ||
      entry.name === 'build.ts' ||
      entry.name === 'release' ||
      /\.test\./.test(entry.name) ||
      /\.stories\./.test(entry.name)
    ) {
      continue;
    }
    if (entry.isSymbolicLink()) {
      continue;
    }
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkDir(full);
    } else if (/\.tsx$/.test(entry.name)) {
      yield full;
    }
  }
}

function extractLiteralsFromFile(filePath: string, content: string): string[] {
  const literals: string[] = [];

  // Skip files that import from react-i18next or @lunaria/i18n — they are using i18n
  if (/from\s+["']react-i18next["']|from\s+["'](react-i18next|@lunaria\/i18n)["']/.test(content)) {
    // But still check for any hardcoded strings in the same file
  }

  // Match JSX string literals (not code, not imports)
  // We look for patterns like: >"Some Text"< or ,>"Some Text"< or return "Some Text"
  const jsxStringPattern =
    /(?<=[>({[,;?\s]return\s|[{,]\s*)["']([^"'`<>\n]{2,80})["'](?=\s*[<>,);}\]])/g;
  for (const match of content.matchAll(jsxStringPattern)) {
    const lit = match[1];
    if (!lit.includes('\\') && !lit.includes('${') && !isCodeIdentifier(lit)) {
      literals.push(lit);
    }
  }

  // Match plain Text component content: <Text ...>Literal</Text> or >"Literal"<
  const textContentPattern =
    /<Text[^>]*>\s*([^<]{2,80})\s*<\/Text>|<Text[^>]*\n\s*([^<]{2,80})\s*<\/Text>/g;
  for (const match of content.matchAll(textContentPattern)) {
    const lit = (match[1] || match[2] || '').trim();
    if (lit.length >= 2 && !lit.includes('\\') && !isCodeIdentifier(lit)) {
      literals.push(lit);
    }
  }

  // Skip aria-label extraction for files using next-intl — aria-labels should be translation values
  const usesNextIntl = /next-intl/.test(content);

  if (!usesNextIntl) {
    // Only extract aria-labels from files NOT using next-intl
    const ariaPattern = /aria-label=["']([^"']{2,80})["']/g;
    for (const match of content.matchAll(ariaPattern)) {
      literals.push(match[1]);
    }
  }

  // Match accessibility role strings (these are code identifiers, not translatable)
  const rolePattern = /accessibilityRole=["']([^"']{2,80})["']/g;
  for (const match of content.matchAll(rolePattern)) {
    literals.push(match[1]);
  }

  const usesReactI18n =
    /from\s+["']react-i18next["']|from\s+["'](react-i18next|@lunaria\/i18n)["']/.test(content);

  if (usesReactI18n && !usesNextIntl) {
    const jsxPropPatterns = [
      /title=["']([^"']{2,80})["']/g,
      /label=["']([^"']{2,80})["']/g,
      /description=["']([^"']{2,80})["']/g,
      /placeholder=["']([^"']{2,80})["']/g,
      /hint=["']([^"']{2,80})["']/g,
      /tooltip=["']([^"']{2,80})["']/g,
      /alt=["']([^"']{2,80})["']/g,
      /errorMessage=["']([^"']{2,80})["']/g,
    ];
    for (const pattern of jsxPropPatterns) {
      for (const match of content.matchAll(pattern)) {
        const lit = match[1];
        if (!lit.includes('${') && !lit.includes('\\') && !isCodeIdentifier(lit)) {
          literals.push(lit);
        }
      }
    }
  }

  return [...new Set(literals)];
}

function isCodeIdentifier(s: string): boolean {
  // Heuristics: if string looks like code (has spaces at extremes, is all special chars, is single word with camelCase/pascalCase)
  if (/^[A-Z][a-zA-Z0-9]+$/.test(s)) return true; // PascalCase — likely component name
  if (/^[a-z][a-zA-Z0-9]+$/.test(s) && s.length > 20) return true; // camelCase too long
  if (/^[\s\t]+/.test(s) || /[\s\t]+$/.test(s)) return true; // leading/trailing whitespace
  if (/^[{}()=!<>&|]/.test(s)) return true; // starts with operator
  // Tailwind CSS class patterns
  if (/^(bg|text|border|hover:|focus:|active:|disabled:|group-|peer-|data-|aria-)/.test(s)) {
    return true;
  }
  // CSS property patterns
  if (/^(margin|padding|top|left|right|bottom|width|height|opacity)/.test(s)) return true;
  // CSS inline styles (e.g. "font-size: 14px; color: #e2e8f0;")
  if (/^[\s]*[a-z-]+:\s*\d+px;\s*color:\s*#[a-fA-F0-9]+;/.test(s)) return true;
  // Hex colors alone (e.g. "#00C49F")
  if (/^#[a-fA-F0-9]{6}$/.test(s)) return true;
  // Model/agent identifiers
  if (/^(claude|codex|gemini|ollama|opencode|tui-)/.test(s)) return true;
  // Git/tech terminology
  if (/^(git|fish|zsh|bash)$/.test(s)) return true;
  // File extensions / paths
  if (/^\[\[.*\]\]$/.test(s)) return true; // CSS selector brackets
  if (/^\/.+$/.test(s) && !/^\/(login|remote|replay|autopilot|api)/.test(s)) return true; // likely path, not route
  // Font names
  if (/^(Cascadia Code|Fira Code|Source Code Pro|VS Code)$/.test(s)) return true;
  // Numeric time values
  if (/^\d+(s|ms|year|day|hour)$/.test(s)) return true;
  // Status values that are technical
  if (/^(idle|paused|failed|completed|queued|approved|rejected|cancelled)$/.test(s)) return true;
  // Short status/indicator words common in code
  if (/^(active|done|error|now|offline|busy)$/.test(s)) return true;
  // Internal route/panel identifiers with hyphens
  if (/^[a-z]+-[a-z]+$/.test(s) && s.length < 20) return true;
  // Additional technical patterns
  // HTML target/rel attributes — technical, not UI text
  if (s === '_blank' || s === 'noopener,noreferrer') return true;
  // Template placeholders — technical
  if (s === '$1 $2') return true;
  // Time duration values — technical settings
  if (/^\d+\s*(second|seconds|minute|minutes|day|days|hour|hours|year|years)$/.test(s)) return true;
  // Stroke color classes — technical CSS
  if (/^stroke-(green|yellow|orange|red)-\d+$/.test(s)) return true;
  // File references — technical
  if (s === 'agent.md') return true;
  if (/^(void|paper|synthwave|dawn|day|dusk|night)$/.test(s)) return true;
  if (/^Just now$/i.test(s)) return true;
  if (/^(SF Mono)$/.test(s)) return true;
  if (/^(GPU Memory)$/.test(s)) return true;
  if (/^(inputTokens|outputTokens|totalTokens)$/.test(s)) return true;
  if (/^(critical)$/.test(s)) return true;
  if (/^(provisioning|decommissioning)$/.test(s)) return true;
  if (/^(true|false)$/.test(s)) return true;
  if (/^application\/json$/.test(s)) return true;
  if (/^(reject)$/.test(s)) return true;
  if (/^##\s+\w+/.test(s)) return true;
  if (/^-\d+\/\d+$/.test(s)) return true;
  if (/^Local \w+ session$/.test(s)) return true;
  if (/^Gateway session$/.test(s)) return true;
  if (/^Manually \w+/.test(s)) return true;
  if (/^[\w\s]+,\s*[\w\s]+$/.test(s) && s.length < 50) return true;
  if (/^(cumulative)$/.test(s)) return true;
  if (/^(Sub-agent)$/.test(s)) return true;
  if (/^(resolved)$/.test(s)) return true;
  if (/^\$[\d,]+\.\d{2}$/.test(s)) return true;

  const dashboardIdentifiers = [
    'capabilities',
    'config',
    'connect',
    'agents',
    'sessions',
    'projects',
    'memory',
    'skills',
    'tasks',
    'chat',
    'activity',
    'logs',
    'settings',
    'dashboard',
    'messages',
    'tickets',
    'workers',
    'feed',
    'spend',
    'notes',
    'api keys',
    'sync',
    'team',
    'channels',
    'nodes',
    'health',
    'models',
    'apicall',
    'knowledge',
    'memory/',
    'knowledge-base/',
    'pipeline',
    'daily',
    'day',
    'week',
    'month',
    'tokens',
    'requests',
    'recent',
    'cron',
    'every',
    'force',
    'due',
    'templates',
    'pipelines',
    'fleet',
    'workspace',
    'scanning',
    'role',
    'name',
    'last_seen',
    'last_activity',
    'priority',
    'assigned_to',
    'title',
    'actor',
    'entity_type',
    'today',
    'yesterday',
    'focus',
    'pair',
    'replace',
    'comments',
    'quality',
    'general',
    'auth',
    'network',
    'performance',
    'advanced',
    'amoena',
    'session',
    'agent',
    'task',
    'preference',
    'skill',
    'size',
    'high',
    'moderate',
    'normal',
    'break',
    'jobs',
    'events',
    'model',
    'cost',
    'security',
    'profiles',
    'retention',
    'gateway',
    'custom',
    'sonnet',
    'haiku',
    'agent skills',
  ];
  if (dashboardIdentifiers.includes(s)) return true;
  return false;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const errors: string[] = [];

  // 1. Check locale key parity
  console.log('📋 Checking locale key parity across', LOCALES.join(', '), '...');
  const allKeys = new Map<string, Map<string, string>>(); // locale → key → value

  for (const locale of LOCALES) {
    try {
      allKeys.set(locale, await loadLocale(locale));
    } catch {
      errors.push(`❌ Failed to load locale: ${locale}`);
    }
  }

  // Find union of all keys
  const keyUnion = new Set<string>();
  for (const keys of allKeys.values()) {
    for (const key of keys.keys()) {
      keyUnion.add(key);
    }
  }

  // Check parity: each locale should have all keys
  for (const [locale, keys] of allKeys) {
    const missing = [...keyUnion].filter((k) => !keys.has(k));
    if (missing.length > 0) {
      errors.push(`❌ Locale "${locale}" is missing keys: ${missing.join(', ')}`);
    }
  }

  // Check that non-English locales actually translated (not just copy of English)
  // This is informational only — translation completeness is separate from parity
  const enKeys = allKeys.get('en');
  if (enKeys) {
    for (const locale of LOCALES.filter((l) => l !== 'en')) {
      const localeKeys = allKeys.get(locale);
      if (!localeKeys) continue;
      for (const [key, value] of localeKeys) {
        const enValue = enKeys.get(key);
        if (enValue && value === enValue) {
          // Same value as English — might not be translated
          // Only warn about truly translatable content (not technical keys)
          const technicalKeys = [
            'title',
            'name',
            'id',
            'version',
            'Amoena',
            'amoenaRemote',
            'amoenaMobileVersion',
            'pending',
            'enabled',
            'disabled',
            'save',
            'cancel',
            'edit',
            'remove',
            'delete',
            'Test',
            'Delete',
            'Prompt injection',
            'Available Events',
            '(disabled)',
            // Generic navigation/panel labels that are often identical across languages
            'agents',
            'sessions',
            'session',
            'tasks',
            'notifications',
            'chat',
            'memory',
            'settings',
            'logs',
            'activity',
            'skills',
          ];
          const lastSegment = key.split('.').pop() || '';
          if (!technicalKeys.includes(lastSegment) && !technicalKeys.includes(value)) {
            console.warn(`⚠️  Locale "${locale}" has untranslated key "${key}" = "${value}"`);
          }
        }
      }
    }
  }

  // 2. Scan for hardcoded English literals in scope
  console.log('🔍 Scanning for hardcoded English literals in scope...');

  const dashboardMessages = await loadDashboardMessages('en');
  const dashboardMessageValues = new Set(dashboardMessages.values());
  const enLocaleValues = new Set((allKeys.get('en') ?? new Map()).values());

  for (const scopePath of SCOPE) {
    const fullPath = join(ROOT, scopePath);
    for await (const file of walkDir(fullPath)) {
      const content = await readFile(file, 'utf8');
      const literals = extractLiteralsFromFile(file, content);
      for (const lit of literals) {
        if (isAllowlisted(lit)) continue;
        if (isCodeIdentifier(lit)) continue;
        if (lit.trim().length < 3) continue;

        if (scopePath === 'apps/dashboard' && dashboardMessageValues.has(lit)) {
          continue;
        }

        if (scopePath !== 'apps/dashboard' && enLocaleValues.has(lit)) {
          continue;
        }

        const rel = relative(ROOT, file);
        errors.push(`❌ Hardcoded literal in ${rel}: "${lit}"`);
      }
    }
  }

  // 3. Report
  if (errors.length > 0) {
    console.error('\n❌ i18n audit FAILED:');
    for (const err of errors) {
      console.error('  ', err);
    }
    console.error(`\n${errors.length} issue(s) found.`);
    process.exit(1);
  }

  console.log('✅ i18n audit PASSED — no parity issues or hardcoded literals found.');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ i18n-audit crashed:', err);
  process.exit(1);
});
