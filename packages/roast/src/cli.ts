import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { program } from "commander";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { roastUrl } from "./roast.js";
import { renderRoast } from "./render.js";
import { generateCard } from "./card.js";

const SPINNER_MESSAGES = [
  "Inspecting the crime scene",
  "Judging your font choices",
  "Counting unnecessary divs",
  "Squinting at your color palette",
  "Reading the copy with one eye closed",
  "Checking if this is a Bootstrap template",
  "Measuring whitespace with a ruler",
  "Looking for the dark mode toggle",
  "Googling your hex codes",
  "Asking the design gods for forgiveness",
  "Zooming in on that favicon",
  "Testing on a 2003 Nokia browser",
  "Running a vibe check",
  "Ctrl+U-ing the source code",
  "Interviewing the hamburger menu",
  "Auditing your border-radius choices",
  "Wondering who approved this gradient",
  "Loading your site on 3G",
  "Counting how many times you wrote 'innovative'",
  "Checking if the footer is just vibes",
  "Reviewing the cookie banner nobody reads",
  "Inspecting the hero section for personality",
  "Calculating the CEO-to-stock-photo ratio",
  "Stress-testing the carousel nobody asked for",
];

function shuffled<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

function slugFromUrl(url: string): string {
  return url
    .replace(/^https?:\/\//, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/-+$/, "");
}

function copyImageToClipboard(filePath: string): boolean {
  if (process.platform === "darwin") {
    try {
      execSync(
        `osascript -e 'set the clipboard to (read (POSIX file "${filePath}") as «class PNGf»)'`,
      );
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

program
  .name("roasted")
  .description("Roast any website with AI-powered brutality")
  .version("0.1.0")
  .argument("<url>", "URL to roast")
  .option("--share", "Generate a PNG card and copy to clipboard (skips prompt)")
  .action(async (url: string, opts: { share?: boolean }) => {
    p.intro(pc.bgRed(pc.white(pc.bold(" roast "))));

    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    const s = p.spinner();
    const messages = shuffled(SPINNER_MESSAGES);
    let idx = 0;

    s.start(messages[idx++]!);
    const interval = setInterval(() => {
      s.message(messages[idx % messages.length]!);
      idx++;
    }, 3000);

    try {
      const { result, colors } = await roastUrl(url);
      clearInterval(interval);
      s.stop("Roast ready.");
      console.log();
      renderRoast(url, result, colors);

      const sharePrompts = [
        "Immortalize this roast?",
        "Share the damage?",
        "Turn this into a tweet-ready weapon?",
        "Save the evidence?",
        "Export the carnage?",
        "Frame this and hang it on their wall?",
        "Generate a shareable card?",
        "Want a PNG to ruin someone's day?",
        "Package this for maximum social destruction?",
        "Make it screenshot-official?",
      ];

      const shouldShare =
        opts.share ||
        (await p.confirm({
          message:
            sharePrompts[Math.floor(Math.random() * sharePrompts.length)]!,
          initialValue: false,
        }));

      if (p.isCancel(shouldShare)) {
        process.exit(0);
      }

      if (shouldShare) {
        const png = generateCard(url, result);
        const filename = `roast-${slugFromUrl(url)}.png`;
        writeFileSync(filename, png);

        const copied = copyImageToClipboard(`${process.cwd()}/${filename}`);
        if (copied) {
          p.outro(`${pc.green("Card copied to clipboard")} ${pc.dim(`and saved to ${filename}`)}`);
        } else {
          p.outro(`${pc.green(`Card saved to ${filename}`)} ${pc.dim("— drag it into a tweet")}`);
        }
      }
    } catch (error) {
      clearInterval(interval);
      s.stop("Failed to roast.");
      p.log.error(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
      process.exit(1);
    }
  });

program.parse();
