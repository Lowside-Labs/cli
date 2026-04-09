interface Env {
  FIRECRAWL_API_KEY: string;
  ANTHROPIC_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    const url = new URL(request.url);

    try {
      switch (url.pathname) {
        case "/scrape":
          return handleScrape(request, env);
        case "/ai":
          return handleAI(request, env);
        default:
          return json({ error: "Not found" }, 404);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Internal error";
      return json({ error: message }, 500);
    }
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

// ── AI (Anthropic proxy with structured output) ────────────────────

interface AIRequest {
  model?: string;
  system?: string;
  messages: unknown[];
  maxTokens?: number;
  temperature?: number;
  schema?: Record<string, unknown>;
}

async function handleAI(request: Request, env: Env): Promise<Response> {
  const { model, system, messages, maxTokens, temperature, schema } =
    (await request.json()) as AIRequest;

  const anthropicBody: Record<string, unknown> = {
    model: model ?? "claude-sonnet-4-6",
    max_tokens: maxTokens ?? 1024,
    messages,
  };

  if (system) anthropicBody.system = system;
  if (temperature !== undefined) anthropicBody.temperature = temperature;

  // Structured output via tool_use — the proxy handles the translation
  // so clients just send a JSON schema and get parsed output back.
  if (schema) {
    anthropicBody.tools = [
      {
        name: "structured_output",
        description: "Return the structured result",
        input_schema: schema,
      },
    ];
    anthropicBody.tool_choice = { type: "tool", name: "structured_output" };
  }

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(anthropicBody),
  });

  if (!upstream.ok) {
    const error = await upstream.text();
    return json({ error }, upstream.status);
  }

  const result = (await upstream.json()) as {
    content: Array<{ type: "text"; text: string } | { type: "tool_use"; input: unknown }>;
    usage?: { input_tokens: number; output_tokens: number };
  };

  let content = "";
  let parsed: unknown = undefined;

  for (const block of result.content) {
    if (block.type === "text") content += block.text;
    if (block.type === "tool_use") parsed = block.input;
  }

  return json({
    content,
    parsed,
    usage: result.usage
      ? {
          inputTokens: result.usage.input_tokens,
          outputTokens: result.usage.output_tokens,
        }
      : undefined,
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
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
