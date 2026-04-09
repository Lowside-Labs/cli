import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText, Output } from "ai";
import { createFirecrawlClient } from "@npx/firecrawl";
import { ROAST_SYSTEM_PROMPT, roastSchema } from "./prompt.js";
import type { RoastResult } from "./types.js";

const PROXY_URL = process.env["PROXY_URL"] ?? "https://npx-proxy.YOUR_SUBDOMAIN.workers.dev";

const anthropic = createAnthropic({
  baseURL: `${PROXY_URL}/anthropic/v1`,
  apiKey: "proxy", // proxy injects the real key
});

export async function roastUrl(url: string): Promise<RoastResult> {
  const firecrawl = createFirecrawlClient({ proxyUrl: PROXY_URL });

  const site = await firecrawl.scrape(url, {
    formats: ["screenshot", "markdown", "branding"],
  });

  let text = `URL: ${url}\n`;

  if (site.data.metadata?.title) {
    text += `Title: ${site.data.metadata.title}\n`;
  }

  if (site.data.markdown) {
    text += `\n## Page Content\n${site.data.markdown.slice(0, 3000)}\n`;
  }

  if (site.data.branding) {
    text += `\n## Branding Data\n${JSON.stringify(site.data.branding, null, 2)}\n`;
  }

  const { output } = await generateText({
    model: anthropic("claude-sonnet-4-6"),
    system: ROAST_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          ...(site.data.screenshot
            ? [{ type: "image" as const, image: new URL(site.data.screenshot) }]
            : []),
          { type: "text" as const, text },
        ],
      },
    ],
    output: Output.object({ schema: roastSchema }),
    maxOutputTokens: 1024,
  });

  if (!output) {
    throw new Error("Failed to generate structured roast");
  }

  return output;
}
