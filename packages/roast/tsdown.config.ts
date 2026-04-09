import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/cli.ts"],
  format: "esm",
  clean: true,
  banner: { js: "#!/usr/bin/env node" },
  // Bundle workspace packages into the CLI output so the published
  // package is self-contained — these are devDependencies, not runtime.
  deps: {
    alwaysBundle: ["@npx/firecrawl"],
  },
});
