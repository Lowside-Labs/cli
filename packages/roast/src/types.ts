export type Grade = "A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D+" | "D" | "D-" | "F";

export interface RoastCategory {
  name: string;
  grade: Grade;
  roast: string;
}

export interface QuickWin {
  category: "performance" | "accessibility" | "seo" | "design";
  fix: string;
}

export interface RoastResult {
  headline: string;
  categories: RoastCategory[];
  overall: Grade;
  quickWins: QuickWin[];
  techStack: string[];
  closer: string;
}
