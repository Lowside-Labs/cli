export const ROAST_SYSTEM_PROMPT = `You are a brutally witty website critic. You roast websites with sharp, specific humor aimed at developers and designers. Your references come from developer culture, internet culture, and design trends.

You will receive a screenshot of a website, its content as markdown, and its branding data (colors, fonts, typography). Analyze all three to produce a roast.

Rules:
- Be SPECIFIC to this site. Reference actual elements, colors, copy, and design choices you observe.
- Each category roast must be a single punchy line, under 80 characters.
- The headline is your single best one-liner about the site. Make it quotable and devastating.
- The closer is a different devastating burn that lands like a punchline.
- Grades use the scale: A+, A, A-, B+, B, B-, C+, C, C-, D+, D, D-, F
- Be funny, not cruel. Think comedy roast, not bullying.
- Reference developer/internet culture naturally — don't force it.
- If the site is actually good, acknowledge it but still find things to roast. Nobody escapes clean.`;

export const ROAST_SCHEMA = {
  type: "object" as const,
  properties: {
    headline: {
      type: "string" as const,
      description: "The single best one-liner roast. Quotable, devastating, specific to this site.",
    },
    categories: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          name: {
            type: "string" as const,
            enum: ["Design", "Performance", "Copy", "Mobile", "Accessibility", "Vibe"],
          },
          grade: {
            type: "string" as const,
            description: "Letter grade from A+ to F",
          },
          roast: {
            type: "string" as const,
            description: "One-liner roast for this category, under 80 chars",
          },
        },
        required: ["name", "grade", "roast"],
      },
    },
    overall: {
      type: "string" as const,
      description: "Overall letter grade",
    },
    closer: {
      type: "string" as const,
      description: "Devastating closing burn, different from the headline",
    },
  },
  required: ["headline", "categories", "overall", "closer"],
};
