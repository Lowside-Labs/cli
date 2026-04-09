# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A pnpm + Turborepo monorepo of standalone CLI tools distributed via `npx`. Each package under `packages/` is an independent npm package with its own versioning. The `cli-template` package is a private starter — copy it to create new tools.

## Commands

```bash
pnpm build              # Build all packages (turbo)
pnpm dev                # Watch mode for all packages (turbo)
pnpm lint               # oxlint across all packages (turbo)
pnpm lint:fix           # oxlint --fix across all packages (turbo)
pnpm -w run format      # oxfmt --write at workspace root (not turbo — run with -w from packages)
pnpm -w run format:check
pnpm typecheck          # tsc across all packages (turbo)
pnpm -w run check       # format:check + lint + typecheck (full CI check)
```

Per-package (run from inside a package directory):

```bash
pnpm build              # tsdown → dist/cli.mjs
pnpm dev                # tsdown --watch
pnpm lint               # oxlint .
pnpm typecheck          # tsc
```

Releasing:

```bash
pnpm changeset          # Declare a version intent
pnpm -w run release     # Build + lint + typecheck + changeset version
pnpm -w run publish-packages  # Build + changeset publish
```

Worker (from workers/proxy):

```bash
pnpm dev                # wrangler dev (local proxy at localhost:8787)
pnpm deploy             # wrangler deploy (production)
```

## Architecture

```
packages/
  firecrawl/       @npx/firecrawl  — Firecrawl client primitive (private)
  ai/              @npx/ai         — AI proxy client primitive (private)
  roast/           roast           — CLI tool (published via npx)
  cli-template/    cli-template    — Starter template (private)
workers/
  proxy/           npx-proxy       — CF Worker (Firecrawl + Anthropic proxy)
```

### Primitives

`@npx/firecrawl` and `@npx/ai` are composable client packages. They talk to the CF Worker proxy (not directly to Firecrawl/Anthropic). Any CLI tool can import them:

```typescript
import { createFirecrawlClient } from "@npx/firecrawl";
import { createAIClient } from "@npx/ai";

const firecrawl = createFirecrawlClient({ proxyUrl: PROXY_URL });
const ai = createAIClient({ proxyUrl: PROXY_URL });

const site = await firecrawl.scrape(url, { formats: ["screenshot", "markdown", "branding"] });
const result = await ai.generate({ system: "...", messages: [...], schema: mySchema });
```

The AI client supports structured output — pass a JSON schema and get typed `result.parsed` back. The proxy translates this to Anthropic's tool_use protocol.

### Bundling

CLI packages bundle workspace primitives into a single file via tsdown's `deps.alwaysBundle`. Primitives are listed as `devDependencies` in CLI packages — they're inlined at build time, not runtime deps.

### CF Worker Proxy

Two routes: `POST /scrape` (Firecrawl) and `POST /ai` (Anthropic). API keys live in Worker secrets (`.dev.vars` locally, `wrangler secret` in prod). CLI tools never touch API keys.

### Build

- **Monorepo:** Turborepo. `build` and `typecheck` respect `^build` dependency ordering.
- **Bundler:** tsdown (Rolldown). Each package has `tsdown.config.ts`. CLI output is a single ESM file with shebang. Library output includes `.d.mts` declarations.
- **TypeScript:** Strict base config in root `tsconfig.json` (ES2022, bundler resolution, `verbatimModuleSyntax`, `noUncheckedIndexedAccess`). Root has `"types": ["node"]`. Library packages that don't need Node types override with `"types": []`.
- **Linting:** oxlint (`oxlintrc.json`). Formatting: oxfmt (defaults, no config file).
- **Versioning:** Changesets with public access.

## Creating a New CLI Package

1. `cp -r packages/cli-template packages/your-tool`
2. Update `name`, `description`, and `bin` key in `package.json`
3. Set `"private": false` for publishable packages
4. Add `@npx/firecrawl` and/or `@npx/ai` to `devDependencies` with `workspace:*` if needed
5. Add them to `deps.alwaysBundle` in `tsdown.config.ts`
6. `pnpm install` from root to link

## CLI Stack

- **commander** — argument parsing
- **@clack/prompts** — interactive prompts, spinners, cancel handling
- **picocolors** — terminal colors (not chalk — picocolors is 10x smaller)
- **boxen** — box drawing for headers/highlights
- **tsdown** — bundling to single ESM executable

Additional visual libraries available as needed: `nanospinner`, `listr2`, `cli-table3`, `cfonts`, `gradient-string`, `terminal-link`.
