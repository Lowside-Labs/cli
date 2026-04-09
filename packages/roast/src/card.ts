import { Resvg } from "@resvg/resvg-js";
import type { RoastResult } from "./types.js";

const W = 1200;
const H = 675;
const PX = 56;
const MONO = "SF Mono, Menlo, Consolas, monospace";
const SANS = "Inter, system-ui, -apple-system, sans-serif";

const BG = "#0c0c0c";
const WHITE = "#e4e4e7";
const DIM = "#71717a";
const ACCENT = "#ef4444";
const BORDER = "#27272a";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function gradeHex(grade: string): string {
  if (grade.startsWith("A")) return "#22c55e";
  if (grade.startsWith("B")) return "#06b6d4";
  if (grade.startsWith("C")) return "#eab308";
  if (grade.startsWith("D")) return "#ef4444";
  return "#d946ef";
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + "\u2026" : s;
}

function dots(nameLen: number, total: number): string {
  const count = Math.max(1, total - nameLen);
  return " " + ".".repeat(count) + " ";
}

export function generateCard(url: string, roast: RoastResult): Buffer {
  const lines: string[] = [];
  const dotCol = 16;
  const sz = 14;

  // Background + border
  lines.push(`<rect width="${W}" height="${H}" rx="12" fill="${BG}"/>`);
  lines.push(
    `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="12" fill="none" stroke="${BORDER}"/>`,
  );

  // Title
  lines.push(
    `<text x="${PX}" y="52" font-family="${SANS}" font-size="16">` +
      `<tspan font-weight="700" fill="${ACCENT}">ROAST REPORT</tspan>` +
      `<tspan fill="${DIM}">  \u00b7  </tspan>` +
      `<tspan font-weight="600" fill="${WHITE}">${esc(truncate(url, 55))}</tspan>` +
      `</text>`,
  );

  // Headline
  const hl = truncate(roast.headline, 95);
  lines.push(
    `<text x="${PX}" y="100" font-family="${SANS}" font-size="18" font-weight="500" font-style="italic" fill="${WHITE}">\u201c${esc(hl)}\u201d</text>`,
  );

  // Categories — monospace, dot-aligned, colored grades, inline roast
  let y = 155;
  for (const cat of roast.categories) {
    const d = dots(cat.name.length, dotCol);
    const roastText = truncate(cat.roast, 65);
    lines.push(
      `<text x="${PX}" y="${y}" font-family="${MONO}" font-size="${sz}">` +
        `<tspan font-weight="600" fill="${WHITE}">${esc(cat.name)}</tspan>` +
        `<tspan fill="${DIM}">${esc(d)}</tspan>` +
        `<tspan font-weight="700" fill="${gradeHex(cat.grade)}">${esc(cat.grade.padEnd(3))}</tspan>` +
        `<tspan fill="${DIM}"> ${esc(roastText)}</tspan>` +
        `</text>`,
    );
    y += 36;
  }

  // Overall
  y += 14;
  const od = dots("OVERALL".length, dotCol);
  lines.push(
    `<text x="${PX}" y="${y}" font-family="${MONO}" font-size="${sz}">` +
      `<tspan font-weight="700" fill="${WHITE}">OVERALL</tspan>` +
      `<tspan fill="${DIM}">${esc(od)}</tspan>` +
      `<tspan font-weight="700" fill="${gradeHex(roast.overall)}">${esc(roast.overall)}</tspan>` +
      `</text>`,
  );

  // Stack
  if (roast.techStack?.length) {
    y += 36;
    const stack = roast.techStack.join("  \u00b7  ");
    lines.push(
      `<text x="${PX}" y="${y}" font-family="${MONO}" font-size="13">` +
        `<tspan font-weight="700" fill="${WHITE}">STACK</tspan>` +
        `<tspan fill="${DIM}">    ${esc(stack)}</tspan>` +
        `</text>`,
    );
  }

  // Separator
  lines.push(
    `<line x1="${PX}" y1="${H - 110}" x2="${W - PX}" y2="${H - 110}" stroke="${BORDER}" stroke-width="1"/>`,
  );

  // Closer
  const cl = truncate(roast.closer, 100);
  lines.push(
    `<text x="${PX}" y="${H - 72}" font-family="${SANS}" font-size="15" font-style="italic" fill="${DIM}">\u201c${esc(cl)}\u201d</text>`,
  );

  // Branding
  lines.push(
    `<text x="${W - PX}" y="${H - 28}" font-family="${MONO}" font-size="13" fill="${DIM}" text-anchor="end">npx roasted</text>`,
  );

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
${lines.join("\n")}
</svg>`;

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: W },
    font: { loadSystemFonts: true },
  });

  return Buffer.from(resvg.render().asPng());
}
