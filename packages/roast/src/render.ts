import pc from "picocolors";
import boxen from "boxen";
import type { RoastResult } from "./types.js";

function gradeColor(grade: string): (s: string) => string {
  if (grade.startsWith("A")) return pc.green;
  if (grade.startsWith("B")) return pc.cyan;
  if (grade.startsWith("C")) return pc.yellow;
  if (grade.startsWith("D")) return pc.red;
  return pc.magenta;
}

function padRight(str: string, len: number): string {
  return str + " ".repeat(Math.max(0, len - str.length));
}

export function renderRoast(url: string, roast: RoastResult): void {
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
  console.log(`  ${pc.italic(pc.white(`"${roast.headline}"`))}`);
  console.log();

  const maxNameLen = 15;

  for (const cat of roast.categories) {
    const name = padRight(cat.name, maxNameLen);
    const dotCount = maxNameLen - cat.name.length + 2;
    const dots = pc.dim(pc.gray(".".repeat(Math.max(1, dotCount))));
    const colorFn = gradeColor(cat.grade);
    const grade = colorFn(pc.bold(padRight(cat.grade, 3)));
    const burn = pc.dim(cat.roast);
    console.log(`  ${name}${dots} ${grade} ${burn}`);
  }

  console.log();

  const overallColor = gradeColor(roast.overall);
  console.log(`  ${pc.bold("OVERALL")} ${overallColor(pc.bold(roast.overall))}`);

  console.log();
  console.log(`  ${pc.dim("---")}`);
  console.log();
  console.log(`  ${pc.italic(pc.white(`"${roast.closer}"`))}`);
  console.log();
}
