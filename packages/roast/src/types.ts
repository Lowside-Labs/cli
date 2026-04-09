export interface RoastCategory {
  name: string;
  grade: string;
  roast: string;
}

export interface QuickWin {
  fix: string;
}

export interface RoastResult {
  headline: string;
  categories: RoastCategory[];
  overall: string;
  quickWins: QuickWin[];
  closer: string;
}
