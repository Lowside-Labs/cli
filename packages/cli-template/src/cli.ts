import { program } from "commander";
import * as p from "@clack/prompts";
import pc from "picocolors";

program
  .name("cli-template")
  .description("A template CLI tool")
  .version("0.0.0")
  .argument("[input]", "input to process")
  .action(async (input?: string) => {
    p.intro(pc.bgCyan(pc.black(" cli-template ")));

    const value =
      input ??
      ((await p.text({
        message: "What would you like to process?",
        placeholder: "your input here",
        validate: (v) => {
          if (!v?.trim()) return "Please enter a value";
        },
      })) as string);

    if (p.isCancel(value)) {
      p.cancel("Cancelled.");
      process.exit(0);
    }

    const s = p.spinner();
    s.start("Processing");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    s.stop("Done!");

    p.outro(pc.green(`Result: ${value}`));
  });

program.parse();
