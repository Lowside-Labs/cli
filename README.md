# npx tools

A monorepo of standalone CLI tools distributed via `npx`.

## Tools

### roasted

Roast any website with AI-powered brutality. Get a scorecard with grades, quick wins, tech stack detection, and a shareable PNG card.

```bash
npx roasted example.com
```

Add `--share` to generate a PNG card and copy it to your clipboard.

```bash
npx roasted example.com --share
```

## Development

```bash
pnpm install
pnpm build
pnpm check          # format + lint + typecheck
```

See [CLAUDE.md](./CLAUDE.md) for full architecture docs.

## License

MIT
