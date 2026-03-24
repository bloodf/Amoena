import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export interface AgentDirectives {
  readonly raw: string;
  readonly filePath: string;
}

export interface ClaudeDirectives {
  readonly raw: string;
  readonly filePath: string;
}

export interface ScopedConfig {
  readonly agents?: AgentDirectives;
  readonly claude?: ClaudeDirectives;
}

export interface ScannedConfig {
  /** Config found in workspace root — takes precedence over user scope */
  readonly workspace: ScopedConfig;
  /** Config found in user home directory */
  readonly user: ScopedConfig;
}

export class ConfigScanner {
  scan(workspaceRoot: string): ScannedConfig {
    const userHome = os.homedir();

    return {
      workspace: this.scanScope(workspaceRoot),
      user: this.scanScope(userHome),
    };
  }

  readAgentsMd(directory: string): AgentDirectives | undefined {
    const candidates = [
      path.join(directory, '.agents', 'AGENTS.md'),
      path.join(directory, 'AGENTS.md'),
    ];

    for (const filePath of candidates) {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8');
        return { raw, filePath };
      }
    }

    return undefined;
  }

  readClaudeMd(directory: string): ClaudeDirectives | undefined {
    const candidates = [
      path.join(directory, '.claude', 'CLAUDE.md'),
      path.join(directory, 'CLAUDE.md'),
    ];

    for (const filePath of candidates) {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8');
        return { raw, filePath };
      }
    }

    return undefined;
  }

  private scanScope(directory: string): ScopedConfig {
    const agentsDir = path.join(directory, '.agents');
    const claudeDir = path.join(directory, '.claude');

    let agents: AgentDirectives | undefined;
    let claude: ClaudeDirectives | undefined;

    // Check .agents/ directory
    if (fs.existsSync(agentsDir) && fs.statSync(agentsDir).isDirectory()) {
      agents = this.readAgentsMd(directory);
    }

    // Check .claude/ directory
    if (fs.existsSync(claudeDir) && fs.statSync(claudeDir).isDirectory()) {
      claude = this.readClaudeMd(directory);
    }

    // Fallback: check root AGENTS.md / CLAUDE.md even without the dir
    if (agents === undefined) {
      agents = this.readAgentsMd(directory);
    }
    if (claude === undefined) {
      claude = this.readClaudeMd(directory);
    }

    return { agents, claude };
  }
}
