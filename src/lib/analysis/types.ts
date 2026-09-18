export type FactType = "statistic" | "claim" | "quote" | "entity" | "date";

export interface Fact {
  id: string;
  fact: string;
  type: FactType;
  /** Verbatim text copied from the supplied source. */
  passage: string;
  /** Character offsets + sentence index inside the original source. */
  reference: { start: number; end: number; sentence: number; label: string };
}

export interface SourceAnalysis {
  summary: string[];
  keyIdeas: string[];
  claims: string[];
  statistics: string[];
  entities: string[];
  quotes: string[];
  audience: string;
  tone: string;
  purpose: string;
  meta: { words: number; sentences: number; readingMinutes: number; engine: string };
}

export interface AnalysisResult {
  source: string;
  analysis: SourceAnalysis;
  factBank: Fact[];
  createdAt: number;
}

/** Any analyzer (local heuristic today, AI model later) implements this. */
export type Analyzer = (source: string) => Promise<AnalysisResult>;
