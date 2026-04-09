import { createFirecrawlClient } from "@npx/firecrawl";
import { createAIClient, type ContentBlock } from "@npx/ai";
import { ROAST_SYSTEM_PROMPT, ROAST_SCHEMA } from "./prompt.js";
import type { RoastResult } from "./types.js";

const PROXY_URL = process.env["PROXY_URL"] ?? "https://npx-proxy.YOUR_SUBDOMAIN.workers.dev";

export async function roastUrl(url: string): Promise<RoastResult> {
  const firecrawl = createFirecrawlClient({ proxyUrl: PROXY_URL });
  const ai = createAIClient({ proxyUrl: PROXY_URL });

  const site = await firecrawl.scrape(url, {
    formats: ["screenshot", "markdown", "branding"],
  });

  const content: ContentBlock[] = [];

  if (site.data.screenshot) {
    content.push({
      type: "image",
      source: { type: "url", url: site.data.screenshot },
    });
  }

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

  content.push({ type: "text", text });

  const result = await ai.generate<RoastResult>({
    model: "claude-sonnet-4-6",
    system: ROAST_SYSTEM_PROMPT,
    messages: [{ role: "user", content }],
    maxTokens: 1024,
    schema: ROAST_SCHEMA,
  });

  if (!result.parsed) {
    throw new Error("Failed to generate structured roast");
  }

  return result.parsed;
}
