import { readFileSync } from "node:fs";
import { defineConfig } from "tsdown";

const pkg = JSON.parse(readFileSync("package.json", "utf-8"));

export default defineConfig({
  entry: ["src/cli.ts"],
  format: "esm",
  clean: true,
  banner: { js: "#!/usr/bin/env node" },
  define: {
    __PKG_VERSION__: JSON.stringify(pkg.version),
  },
  // Bundle workspace packages into the CLI output so the published
  // package is self-contained — these are devDependencies, not runtime.
  deps: {
    alwaysBundle: ["@npx/firecrawl"],
  },
});
