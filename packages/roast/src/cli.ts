import { program } from "commander";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { roastUrl } from "./roast.js";
import { renderRoast } from "./render.js";

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
    s.start("Inspecting the crime scene");

    try {
      const result = await roastUrl(url);
      s.stop("Roast ready.");
      console.log();
      renderRoast(url, result);
    } catch (error) {
      s.stop("Failed to roast.");
      p.log.error(error instanceof Error ? error.message : "An unexpected error occurred");
      process.exit(1);
    }
  });

program.parse();
