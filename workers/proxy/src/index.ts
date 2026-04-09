interface Env {
  FIRECRAWL_API_KEY: string;
  ANTHROPIC_API_KEY: string;
  RATE_LIMITER: RateLimit;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    // Rate limit by IP — 2 requests per 60 seconds
    const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
    const { success } = await env.RATE_LIMITER.limit({ key: ip });
    if (!success) {
      return json({ error: "Rate limited — try again in a minute" }, 429);
    }

    const url = new URL(request.url);

    if (url.pathname === "/scrape" && request.method === "POST") {
      return handleScrape(request, env);
    }

    // Transparent Anthropic API proxy — the AI SDK sends requests to
    // {baseURL}/messages, so we strip our /anthropic/v1 prefix and
    // forward everything under it to api.anthropic.com.
    if (url.pathname.startsWith("/anthropic/v1/")) {
      return handleAnthropic(request, url, env);
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

// ── Anthropic (transparent auth proxy) ─────────────────────────────
// Forwards requests to api.anthropic.com, injecting the API key.
// The AI SDK handles message formatting, tool_use, structured output, etc.

async function handleAnthropic(request: Request, url: URL, env: Env): Promise<Response> {
  const anthropicPath = url.pathname.replace("/anthropic/v1", "/v1");
  const upstream = new URL(`https://api.anthropic.com${anthropicPath}${url.search}`);

  const headers = new Headers(request.headers);
  headers.set("x-api-key", env.ANTHROPIC_API_KEY);

  // Ensure anthropic-version header is present
  if (!headers.has("anthropic-version")) {
    headers.set("anthropic-version", "2023-06-01");
  }

  const response = await fetch(upstream.toString(), {
    method: request.method,
    headers,
    body: request.method === "POST" ? request.body : undefined,
  });

  // Stream the response back — supports both regular and streaming responses
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
    "Access-Control-Allow-Headers": "Content-Type, x-api-key, anthropic-version",
  };
}
