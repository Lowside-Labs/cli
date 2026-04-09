import { program } from "commander";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { roastUrl } from "./roast.js";
import { renderRoast } from "./render.js";

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

program
  .name("roast")
  .description("Roast any website with AI-powered brutality")
  .version("0.1.0")
  .argument("<url>", "URL to roast")
  .action(async (url: string) => {
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
    } catch (error) {
      clearInterval(interval);
      s.stop("Failed to roast.");
      p.log.error(error instanceof Error ? error.message : "An unexpected error occurred");
      process.exit(1);
    }
  });

program.parse();
