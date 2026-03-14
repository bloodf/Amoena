export interface ProviderModel {
  name: string;
  ctx: string;
  reasoning: boolean;
  tier: string;
  reasoningMode: string;
}

export interface ProviderData {
  name: string;
  color: string;
  status: "connected" | "error" | "disconnected";
  apiKey: string;
  models: ProviderModel[];
}
