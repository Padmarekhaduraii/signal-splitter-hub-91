import { analyzeLocally } from "./localAnalyzer";
import type { Analyzer } from "./types";

// Swap this for an AI-backed analyzer later — the rest of the app only depends
// on the Analyzer signature and the AnalysisResult shape.
export const analyzeSource: Analyzer = analyzeLocally;

export * from "./types";
export { splitSentences } from "./localAnalyzer";
