import type { FrameworkAdapter } from "./adapter";
import { AutoGenAdapter } from "./autogen";
import { ClaudeSdkAdapter } from "./claude-sdk";
import { CrewAIAdapter } from "./crewai";
import { GenericAdapter } from "./generic";
import { LangGraphAdapter } from "./langgraph";
import { LunariaAdapter } from "./lunaria";

const adapters: Record<string, () => FrameworkAdapter> = {
	lunaria: () => new LunariaAdapter(),
	generic: () => new GenericAdapter(),
	crewai: () => new CrewAIAdapter(),
	langgraph: () => new LangGraphAdapter(),
	autogen: () => new AutoGenAdapter(),
	"claude-sdk": () => new ClaudeSdkAdapter(),
};

export function getAdapter(framework: string): FrameworkAdapter {
	const factory = adapters[framework];
	if (!factory) throw new Error(`Unknown framework adapter: ${framework}`);
	return factory();
}

export function listAdapters(): string[] {
	return Object.keys(adapters);
}

export type {
	AgentRegistration,
	Assignment,
	FrameworkAdapter,
	HeartbeatPayload,
	TaskReport,
} from "./adapter";
