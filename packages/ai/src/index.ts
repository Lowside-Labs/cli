export type {
  AIConfig,
  TextContent,
  ImageContent,
  ImageUrlSource,
  ImageBase64Source,
  ContentBlock,
  Message,
  GenerateOptions,
  GenerateResult,
} from "./types.js";

import type { AIConfig, GenerateOptions, GenerateResult } from "./types.js";

export function createAIClient(config: AIConfig) {
  const { proxyUrl } = config;

  return {
    async generate<T = unknown>(options: GenerateOptions): Promise<GenerateResult<T>> {
      const response = await fetch(`${proxyUrl}/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`AI generation failed (${response.status}): ${body}`);
      }

      return (await response.json()) as GenerateResult<T>;
    },
  };
}

export type AIClient = ReturnType<typeof createAIClient>;
