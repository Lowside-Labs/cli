import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText, Output } from "ai";
import { createFirecrawlClient, type BrandingColors } from "@npx/firecrawl";
import { ROAST_SYSTEM_PROMPT, roastSchema } from "./prompt.js";
import type { RoastResult } from "./types.js";

const PROXY_URL = process.env["PROXY_URL"] ?? "https://npx-proxy.emad90mohamad.workers.dev";

const NPX_HEADERS = {
  "x-npx-tool": "roasted",
  "x-npx-version": __PKG_VERSION__,
};

const anthropic = createAnthropic({
  baseURL: `${PROXY_URL}/anthropic/v1`,
  apiKey: "proxy",
  headers: NPX_HEADERS,
});

export interface RoastData {
  result: RoastResult;
  colors: BrandingColors | undefined;
}

export async function roastUrl(url: string): Promise<RoastData> {
  const firecrawl = createFirecrawlClient({ proxyUrl: PROXY_URL, headers: NPX_HEADERS });

  const site = await firecrawl.scrape(url, {
    formats: ["screenshot", "markdown", "html", "branding"],
  });

  let text = `URL: ${url}\n`;

  if (site.data.metadata?.title) {
    text += `Title: ${site.data.metadata.title}\n`;
  }

  if (site.data.markdown) {
    text += `\n## Page Content\n${site.data.markdown.slice(0, 3000)}\n`;
  }

  if (site.data.html) {
    text += `\n## HTML (head + first 2000 chars)\n${site.data.html.slice(0, 4000)}\n`;
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
    maxOutputTokens: 1500,
  });

  if (!output) {
    throw new Error("Failed to generate structured roast");
  }

  return {
    result: output,
    colors: site.data.branding?.colors,
  };
}
