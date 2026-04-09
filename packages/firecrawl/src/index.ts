export type {
  FirecrawlConfig,
  ScrapeFormat,
  ScrapeOptions,
  ScrapeResult,
  ScrapeData,
  ScrapeMetadata,
  BrandingData,
  BrandingColors,
  BrandingTypography,
} from "./types.js";

import type { FirecrawlConfig, ScrapeOptions, ScrapeResult } from "./types.js";

export function createFirecrawlClient(config: FirecrawlConfig) {
  const { proxyUrl, headers: customHeaders } = config;

  return {
    async scrape(url: string, options: ScrapeOptions): Promise<ScrapeResult> {
      const response = await fetch(`${proxyUrl}/scrape`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...customHeaders },
        body: JSON.stringify({ url, ...options }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Scrape failed (${response.status}): ${body}`);
      }

      return (await response.json()) as ScrapeResult;
    },
  };
}

export type FirecrawlClient = ReturnType<typeof createFirecrawlClient>;
