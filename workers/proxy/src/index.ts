interface Env {
  FIRECRAWL_API_KEY: string;
  ANTHROPIC_API_KEY: string;
  OPENAI_API_KEY: string;
  RATE_LIMITER: RateLimit;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    // Rate limit by IP — 2 requests per 60 seconds (skipped in local dev)
    if (env.RATE_LIMITER) {
      const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
      const { success } = await env.RATE_LIMITER.limit({ key: ip });
      if (!success) {
        return json({ error: "Rate limited — try again in a minute" }, 429);
      }
    }

    const url = new URL(request.url);

    if (url.pathname === "/scrape" && request.method === "POST") {
      return handleScrape(request, env);
    }

    if (url.pathname.startsWith("/anthropic/v1/")) {
      return proxyUpstream(request, url, {
        prefix: "/anthropic/v1",
        origin: "https://api.anthropic.com/v1",
        authHeader: "x-api-key",
        apiKey: env.ANTHROPIC_API_KEY,
        extraHeaders: { "anthropic-version": "2023-06-01" },
      });
    }

    if (url.pathname.startsWith("/openai/v1/")) {
      return proxyUpstream(request, url, {
        prefix: "/openai/v1",
        origin: "https://api.openai.com/v1",
        authHeader: "Authorization",
        apiKey: `Bearer ${env.OPENAI_API_KEY}`,
      });
    }

    return json({ error: "Not found" }, 404);
  },
} satisfies ExportedHandler<Env>;

// ── Scrape (Firecrawl proxy) ───────────────────────────────────────

async function handleScrape(request: Request, env: Env): Promise<Response> {
  const body = await request.text();

  const upstream = await fetch("https://api.firecrawl.dev/v2/scrape", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.FIRECRAWL_API_KEY}`,
    },
    body,
  });

  const data = await upstream.text();
  return new Response(data, {
    status: upstream.status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}

// ── Generic upstream proxy ─────────────────────────────────────────
// Transparently forwards requests to an upstream API, injecting auth.
// The AI SDK handles message formatting, structured output, etc.

interface ProxyConfig {
  prefix: string;
  origin: string;
  authHeader: string;
  apiKey: string;
  extraHeaders?: Record<string, string>;
}

async function proxyUpstream(
  request: Request,
  url: URL,
  config: ProxyConfig,
): Promise<Response> {
  const upstreamPath = url.pathname.replace(config.prefix, "");
  const upstream = `${config.origin}${upstreamPath}${url.search}`;

  const headers = new Headers(request.headers);
  headers.set(config.authHeader, config.apiKey);

  if (config.extraHeaders) {
    for (const [key, value] of Object.entries(config.extraHeaders)) {
      if (!headers.has(key)) headers.set(key, value);
    }
  }

  const response = await fetch(upstream, {
    method: request.method,
    headers,
    body: request.method === "POST" ? request.body : undefined,
  });

  const responseHeaders = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders())) {
    responseHeaders.set(key, value);
  }

  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}

// ── Helpers ─────────────────────────────────────────────────────────

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, x-api-key, anthropic-version",
  };
}
