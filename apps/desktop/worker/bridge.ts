import readline from "node:readline";

import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { embed, smoothStream, streamText, tool, type CoreMessage } from "ai";

type JsonRpcRequest = {
  jsonrpc: "2.0";
  id: string;
  method: string;
  params?: Record<string, unknown>;
};

type StreamToolCall = {
  callId?: string;
  toolName?: string;
  args?: unknown;
  result?: unknown;
  isError?: boolean;
};

type StreamMessage = {
  role: string;
  content: string;
  toolCalls?: StreamToolCall[];
};

type StreamStartParams = {
  providerId: string;
  modelId: string;
  sessionId: string;
  apiKey?: string;
  reasoningMode?: string;
  reasoningEffort?: string;
  messages?: StreamMessage[];
};

type EmbeddingParams = {
  providerId: string;
  modelId: string;
  apiKey?: string;
  input: string;
};

const rl = readline.createInterface({
  input: process.stdin,
  crlfDelay: Infinity,
});

const TOOL_DEFINITIONS = {
  echo: tool({
    description: "Echoes text back to the runtime.",
    parameters: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "The text to echo back.",
        },
      },
      required: ["text"],
      additionalProperties: false,
    },
  }),
  Read: tool({
    description: "Reads the content of a file from the workspace.",
    parameters: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "The file path to read.",
        },
      },
      required: ["path"],
      additionalProperties: false,
    },
  }),
  Bash: tool({
    description: "Executes a shell command in the workspace.",
    parameters: {
      type: "object",
      properties: {
        command: {
          type: "string",
          description: "The shell command to execute.",
        },
      },
      required: ["command"],
      additionalProperties: false,
    },
  }),
  MemoryExpand: tool({
    description: "Expands a memory observation at a given detail tier.",
    parameters: {
      type: "object",
      properties: {
        observationId: {
          type: "string",
          description: "The observation identifier to expand.",
        },
        tier: {
          type: "string",
          description: "The requested detail tier, typically l0, l1, or l2.",
        },
      },
      required: ["observationId", "tier"],
      additionalProperties: false,
    },
  }),
};

function send(payload: unknown) {
  try {
    process.stdout.write(`${JSON.stringify(payload)}\n`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EPIPE") {
      process.exit(0);
    }
    throw error;
  }
}

function sendStreamError(streamId: string, error: unknown) {
  send({
    jsonrpc: "2.0",
    method: "stream.error",
    params: {
      streamId,
      message: errorMessage(error),
    },
  });
}

function sendStreamDone(
  streamId: string,
  finalText: string,
  promptTokens = 0,
  completionTokens = 0,
) {
  send({
    jsonrpc: "2.0",
    method: "stream.done",
    params: {
      streamId,
      finalText,
      promptTokens,
      completionTokens,
    },
  });
}

function errorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Unknown worker error";
}

function deterministicEmbedding(input: string) {
  const length = input.length;
  const charCodeSum = [...input].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const vowelCount = [...input].filter((char) => "aeiouAEIOU".includes(char)).length;

  return Array.from({ length: 1536 }, (_, index) => {
    if (index === 0) {
      return Number(length);
    }

    const seed = (charCodeSum + vowelCount * (index + 1) + length * 17 + index * 31) % 997;
    return Number(seed) / 997;
  });
}

function resolveApiKey(providerId: string, apiKey?: string) {
  if (apiKey && apiKey.trim().length > 0) {
    return apiKey.trim();
  }

  switch (providerId) {
    case "anthropic":
      return process.env.ANTHROPIC_API_KEY;
    case "openai":
      return process.env.OPENAI_API_KEY;
    case "google":
      return process.env.GOOGLE_API_KEY;
    default:
      return undefined;
  }
}

function shouldUseMockProvider(providerId: string, modelId: string, apiKey?: string) {
  return (
    providerId === "mock" ||
    modelId.startsWith("mock-") ||
    (!resolveApiKey(providerId, apiKey) && process.env.LUNARIA_ENABLE_MOCK_PROVIDER === "1")
  );
}

function parseArgs(value: unknown) {
  if (value && typeof value === "object") {
    return value;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value) as Record<string, unknown>;
    } catch {
      return { value };
    }
  }

  return {};
}

function fallbackToolMessage(message: StreamMessage): CoreMessage {
  return {
    role: "user",
    content: `Tool result:\n${message.content}`,
  };
}

function toCoreMessages(messages: StreamMessage[]): CoreMessage[] {
  return messages.flatMap((message) => {
    const toolCalls = Array.isArray(message.toolCalls) ? message.toolCalls : [];

    switch (message.role) {
      case "system":
        return [{ role: "system", content: message.content }];
      case "assistant":
        if (toolCalls.length > 0) {
          return [
            {
              role: "assistant",
              content: toolCalls
                .filter((toolCall) => toolCall.callId && toolCall.toolName)
                .map((toolCall) => ({
                  type: "tool-call" as const,
                  toolCallId: toolCall.callId!,
                  toolName: toolCall.toolName!,
                  args: parseArgs(toolCall.args),
                })),
            },
          ];
        }

        return [{ role: "assistant", content: message.content }];
      case "tool": {
        const toolCall = toolCalls.find(
          (candidate) => candidate.callId && candidate.toolName,
        );

        if (!toolCall) {
          return [fallbackToolMessage(message)];
        }

        return [
          {
            role: "tool",
            content: [
              {
                type: "tool-result" as const,
                toolCallId: toolCall.callId!,
                toolName: toolCall.toolName!,
                result: toolCall.result ?? message.content,
                isError: toolCall.isError ?? false,
              },
            ],
          },
        ];
      }
      case "user":
      default:
        return [{ role: "user", content: message.content }];
    }
  });
}

function buildProviderOptions(params: StreamStartParams) {
  const reasoningMode = params.reasoningMode ?? "auto";
  const reasoningEffort = params.reasoningEffort ?? "medium";

  if (params.providerId === "anthropic") {
    return {
      anthropic: {
        thinking:
          reasoningMode === "off"
            ? { type: "disabled" as const }
            : {
                type: "enabled" as const,
                budgetTokens: reasoningBudget(reasoningEffort),
              },
      },
    };
  }

  if (params.providerId === "google") {
    return {
      google: {
        thinkingConfig:
          reasoningMode === "off"
            ? {
                thinkingBudget: 0,
                includeThoughts: false,
              }
            : {
                thinkingBudget: reasoningBudget(reasoningEffort),
                includeThoughts: true,
              },
      },
    };
  }

  return undefined;
}

function reasoningBudget(reasoningEffort?: string) {
  switch (reasoningEffort) {
    case "low":
      return 1024;
    case "high":
      return 8192;
    case "medium":
    default:
      return 4096;
  }
}

function createChatModel(params: StreamStartParams) {
  const apiKey = resolveApiKey(params.providerId, params.apiKey);

  if (!apiKey) {
    throw new Error(`Missing API key for provider ${params.providerId}`);
  }

  switch (params.providerId) {
    case "anthropic": {
      const provider = createAnthropic({ apiKey });
      return provider.messages(params.modelId, {
        sendReasoning: params.reasoningMode !== "off",
      });
    }
    case "openai": {
      const provider = createOpenAI({ apiKey });
      return provider.chat(params.modelId, {
        reasoningEffort:
          params.reasoningMode === "off"
            ? undefined
            : (params.reasoningEffort as "low" | "medium" | "high" | undefined),
      });
    }
    case "google": {
      const provider = createGoogleGenerativeAI({ apiKey });
      return provider.chat(params.modelId);
    }
    default:
      throw new Error(`Unsupported provider ${params.providerId}`);
  }
}

function createEmbeddingModel(params: EmbeddingParams) {
  const apiKey = resolveApiKey(params.providerId, params.apiKey);

  if (!apiKey) {
    throw new Error(`Missing API key for provider ${params.providerId}`);
  }

  switch (params.providerId) {
    case "openai": {
      const provider = createOpenAI({ apiKey });
      return provider.embedding(params.modelId);
    }
    case "google": {
      const provider = createGoogleGenerativeAI({ apiKey });
      return provider.textEmbeddingModel(params.modelId);
    }
    default:
      throw new Error(`Provider ${params.providerId} does not support embeddings`);
  }
}

async function handleMockStream(request: JsonRpcRequest, params: StreamStartParams) {
  const messages = Array.isArray(params.messages) ? params.messages : [];
  const lastMessage = messages[messages.length - 1];
  const finalText = lastMessage?.content ?? "";
  const streamId = `stream-${request.id}`;
  const lastToolMessage = [...messages].reverse().find((message) => message.role === "tool");
  const toolInstruction = messages
    .find((message) => message.role === "user" && message.content.startsWith("tool:"))
    ?.content;

  send({
    jsonrpc: "2.0",
    id: request.id,
    result: {
      streamId,
    },
  });

  if (lastMessage?.role === "user" && finalText.startsWith("tool:")) {
    const [, toolName = "echo", toolPayload = ""] = finalText.split(":", 3);
    send({
      jsonrpc: "2.0",
      method: "stream.tool_call",
      params: {
        streamId,
        callId: `call-${request.id}`,
        toolName,
        args: toolName === "Bash" ? { command: toolPayload } : { text: toolPayload },
      },
    });
    sendStreamDone(streamId, "");
    return;
  }

  const toolNameFromInstruction = toolInstruction?.split(":", 3)?.[1] ?? "echo";
  const responseText =
    lastToolMessage?.role === "tool"
      ? `Tool ${toolNameFromInstruction} returned: ${lastToolMessage.content}`
      : finalText;
  const responseTokens = responseText.split(/\s+/).filter(Boolean);

  if (lastMessage?.role === "user" && finalText.startsWith("slow:")) {
    for (const token of responseTokens) {
      await new Promise((resolve) => setTimeout(resolve, 25));
      send({
        jsonrpc: "2.0",
        method: "stream.token",
        params: {
          streamId,
          text: token,
        },
      });
    }
    sendStreamDone(
      streamId,
      responseText.replace(/^slow:/, "").trim(),
      responseText.length,
      responseTokens.length,
    );
    return;
  }

  for (const token of responseTokens) {
    send({
      jsonrpc: "2.0",
      method: "stream.token",
      params: {
        streamId,
        text: token,
      },
    });
  }

  sendStreamDone(streamId, responseText, responseText.length, responseTokens.length);
}

async function handleStreamStart(request: JsonRpcRequest) {
  const params = (request.params ?? {}) as unknown as StreamStartParams;

  if (shouldUseMockProvider(params.providerId, params.modelId, params.apiKey)) {
    await handleMockStream(request, params);
    return;
  }

  const streamId = `stream-${request.id}`;
  send({
    jsonrpc: "2.0",
    id: request.id,
    result: {
      streamId,
    },
  });

  try {
    const model = createChatModel(params);
    const messages = toCoreMessages(Array.isArray(params.messages) ? params.messages : []);
    let finalText = "";
    let promptTokens = 0;
    let completionTokens = 0;
    let streamError: string | undefined;

    const result = streamText({
      model,
      messages,
      tools: TOOL_DEFINITIONS,
      toolChoice: "auto",
      maxSteps: 1,
      toolCallStreaming: false,
      providerOptions: buildProviderOptions(params),
      experimental_transform: smoothStream({
        delayInMs: null,
        chunking: "word",
      }),
      onChunk({ chunk }) {
        if (chunk.type === "text-delta") {
          finalText += chunk.textDelta;
          send({
            jsonrpc: "2.0",
            method: "stream.token",
            params: {
              streamId,
              text: chunk.textDelta,
            },
          });
          return;
        }

        if (chunk.type === "tool-call") {
          send({
            jsonrpc: "2.0",
            method: "stream.tool_call",
            params: {
              streamId,
              callId: chunk.toolCallId,
              toolName: chunk.toolName,
              args: parseArgs(chunk.args),
            },
          });
        }
      },
      onFinish(event) {
        finalText = finalText || event.text || "";
        promptTokens = event.usage.promptTokens;
        completionTokens = event.usage.completionTokens;
      },
      onError({ error }) {
        streamError = errorMessage(error);
      },
    });

    await result.consumeStream();

    if (streamError) {
      sendStreamError(streamId, streamError);
      return;
    }

    sendStreamDone(streamId, finalText, promptTokens, completionTokens);
  } catch (error) {
    sendStreamError(streamId, error);
  }
}

async function handleEmbeddingRequest(request: JsonRpcRequest) {
  const params = (request.params ?? {}) as unknown as EmbeddingParams;

  try {
    const vector = shouldUseMockProvider(params.providerId, params.modelId, params.apiKey)
      ? deterministicEmbedding(params.input)
      : (
          await embed({
            model: createEmbeddingModel(params),
            value: params.input,
          })
        ).embedding;

    send({
      jsonrpc: "2.0",
      id: request.id,
      result: {
        vector,
      },
    });
  } catch (error) {
    send({
      jsonrpc: "2.0",
      id: request.id,
      error: {
        code: -32000,
        message: errorMessage(error),
      },
    });
  }
}

async function handleRequest(request: JsonRpcRequest) {
  switch (request.method) {
    case "health.check":
      send({
        jsonrpc: "2.0",
        id: request.id,
        result: {
          status: "ok",
          pid: process.pid,
          workerVersion: 2,
        },
      });
      return;
    case "worker.crash":
      send({
        jsonrpc: "2.0",
        id: request.id,
        result: { acknowledged: true },
      });
      setTimeout(() => process.exit(42), 10);
      return;
    case "embed.generate":
      await handleEmbeddingRequest(request);
      return;
    case "stream.start":
      await handleStreamStart(request);
      return;
    default:
      send({
        jsonrpc: "2.0",
        id: request.id,
        error: {
          code: -32601,
          message: `Unknown method: ${request.method}`,
        },
      });
  }
}

rl.on("line", async (line) => {
  if (!line.trim()) {
    return;
  }

  try {
    const request = JSON.parse(line) as JsonRpcRequest;
    await handleRequest(request);
  } catch (error) {
    send({
      jsonrpc: "2.0",
      error: {
        code: -32700,
        message: errorMessage(error),
      },
    });
  }
});

process.stdout.on("error", (error) => {
  if ((error as NodeJS.ErrnoException).code === "EPIPE") {
    process.exit(0);
  }
});
