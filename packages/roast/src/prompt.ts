import { z } from "zod/v4";

export const ROAST_SYSTEM_PROMPT = `You are a brutally witty website critic. You roast websites with sharp, specific humor aimed at developers and designers. Your references come from developer culture, internet culture, and design trends.

You will receive a screenshot of a website, its content as markdown, and its branding data (colors, fonts, typography). Analyze all three to produce a roast.

Rules:
- Be SPECIFIC to this site. Reference actual elements, colors, copy, and design choices you observe.
- Each category roast must be a single punchy line, under 80 characters.
- The headline is your single best one-liner about the site. Make it quotable and devastating.
- The closer is a different devastating burn that lands like a punchline.
- Grades use the scale: A+, A, A-, B+, B, B-, C+, C, C-, D+, D, D-, F
- Quick wins must be 4 items: 3 objective/technical (performance, accessibility, SEO, broken markup, missing meta tags, contrast ratios, image optimization) and 1 design-related. Each must cite specific values.
- Be funny, not cruel. Think comedy roast, not bullying.
- Reference developer/internet culture naturally — don't force it.
- If the site is actually good, acknowledge it but still find things to roast. Nobody escapes clean.
- For tech stack detection, only list technologies you can confidently identify from the markup, class names, scripts, or visual patterns. Do not guess.`;

export const roastSchema = z.object({
  headline: z
    .string()
    .describe(
      "The single best one-liner roast. Quotable, devastating, specific to this site.",
    ),
  categories: z.array(
    z.object({
      name: z.enum([
        "Design",
        "Performance",
        "Copy",
        "Mobile",
        "Accessibility",
        "Vibe",
      ]),
      grade: z
        .enum(["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"])
        .describe("Letter grade"),
      roast: z
        .string()
        .describe("One-liner roast for this category, under 80 chars"),
    }),
  ),
  overall: z
    .enum(["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"])
    .describe("Overall letter grade"),
  quickWins: z
    .array(
      z.object({
        category: z
          .enum(["performance", "accessibility", "seo", "design"])
          .describe("Type of fix"),
        fix: z
          .string()
          .describe(
            "Concrete fix with specific values — contrast ratios, image sizes, missing attributes, CSS properties",
          ),
      }),
    )
    .describe(
      "Exactly 4 fixes: 3 objective/technical (performance, accessibility, seo) + 1 design",
    ),
  techStack: z
    .array(z.string())
    .describe(
      "Up to 5 technologies confidently detected from markup, class names, scripts, or visual patterns (e.g. Next.js, Tailwind, Webflow, Framer, Vercel)",
    ),
  closer: z
    .string()
    .describe("Devastating closing burn, different from the headline"),
});
