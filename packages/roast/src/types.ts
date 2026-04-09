export interface RoastCategory {
  name: string;
  grade: string;
  roast: string;
}

export interface RoastResult {
  headline: string;
  categories: RoastCategory[];
  overall: string;
  closer: string;
}
