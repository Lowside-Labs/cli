import pc from "picocolors";
import boxen from "boxen";
import type { RoastResult } from "./types.js";
import type { BrandingColors } from "@npx/firecrawl";

// ── Grade helpers ──────────────────────────────────────────────────

function gradeColor(grade: string): (s: string) => string {
  if (grade.startsWith("A")) return pc.green;
  if (grade.startsWith("B")) return pc.cyan;
  if (grade.startsWith("C")) return pc.yellow;
  if (grade.startsWith("D")) return pc.red;
  return pc.magenta;
}

// ── Hex → ANSI color ──────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex
    .replace("#", "")
    .match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return null;
  return [parseInt(m[1]!, 16), parseInt(m[2]!, 16), parseInt(m[3]!, 16)];
}

function colorBlock(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return `${pc.dim("██")} ${hex}`;
  const [r, g, b] = rgb;
  return `\x1b[38;2;${r};${g};${b}m██\x1b[0m ${pc.dim(hex)}`;
}

// ── Main renderer ─────────────────────────────────────────────────

export function renderRoast(
  url: string,
  roast: RoastResult,
  colors?: BrandingColors,
): void {
  const nameCol = 15;
  const gradeCol = 3;

  // Header
  const header = boxen(
    `${pc.red(pc.bold("ROAST REPORT"))}  ${pc.dim("·")}  ${pc.white(pc.bold(url))}`,
    {
      padding: { top: 0, bottom: 0, left: 1, right: 1 },
      borderStyle: "round",
      borderColor: "red",
      dimBorder: true,
    },
  );
  console.log(header);
  console.log();

  // Headline
  console.log(`  ${pc.italic(pc.white(`"${roast.headline}"`))}`);
  console.log();

  // Categories — name + dots + grade + roast (single line)
  for (const cat of roast.categories) {
    const name = pc.bold(cat.name);
    const dotCount = nameCol - cat.name.length + 2;
    const dots = pc.dim(".".repeat(Math.max(1, dotCount)));
    const colorFn = gradeColor(cat.grade);
    const grade = colorFn(pc.bold(cat.grade.padEnd(gradeCol)));
    const burn = pc.dim(cat.roast);
    console.log(`  ${name} ${dots} ${grade} ${burn}`);
  }

  console.log();

  // Overall
  const overallColor = gradeColor(roast.overall);
  console.log(
    `  ${pc.bold("OVERALL")} ${pc.dim(".".repeat(nameCol - 7 + 2))} ${overallColor(pc.bold(roast.overall))}`,
  );

  // Tech stack
  if (roast.techStack?.length) {
    console.log();
    console.log(
      `  ${pc.bold("STACK")}    ${roast.techStack.map((t) => pc.dim(t)).join(pc.dim("  ·  "))}`,
    );
  }

  // Color palette
  if (colors) {
    const swatches = Object.entries(colors)
      .filter(([, v]) => typeof v === "string" && v.startsWith("#"))
      .map(([, hex]) => colorBlock(hex as string));

    if (swatches.length > 0) {
      console.log();
      console.log(`  ${pc.bold("PALETTE")}  ${swatches.join("  ")}`);
    }
  }

  // Quick wins
  if (roast.quickWins?.length) {
    console.log();
    console.log(`  ${pc.bold("QUICK WINS")}`);
    for (let i = 0; i < roast.quickWins.length; i++) {
      const win = roast.quickWins[i]!;
      const tag = pc.dim(`[${win.category}]`);
      console.log(`  ${pc.dim(`${i + 1}.`)} ${tag} ${win.fix}`);
    }
  }

  console.log();
  console.log(`  ${pc.dim("─".repeat(50))}`);
  console.log();

  // Closer
  console.log(`  ${pc.italic(pc.white(`"${roast.closer}"`))}`);
  console.log();
}
