export interface RoastCategory {
  name: string;
  grade: string;
  roast: string;
}

export interface QuickWin {
  category: "performance" | "accessibility" | "seo" | "design";
  fix: string;
}

export interface RoastResult {
  headline: string;
  categories: RoastCategory[];
  overall: string;
  quickWins: QuickWin[];
  techStack: string[];
  closer: string;
}
