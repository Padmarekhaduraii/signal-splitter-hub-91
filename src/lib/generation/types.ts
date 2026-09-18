import type { AnalysisResult, Fact } from "../analysis/types";

export const PLATFORMS = ["LinkedIn", "X Thread", "Instagram Carousel", "Short Video / Reel"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const VOICES = ["Professional", "Friendly", "Bold", "Educational", "Custom"] as const;
export type Voice = (typeof VOICES)[number];

export interface GeneratedOutput {
  platform: Platform;
  voice: Voice;
  /** Final copy shown in the studio. */
  content: string;
  /** Facts from the shared Fact Bank used in this output. */
  usedFacts: Fact[];
  createdAt: number;
}

export type Generator = (
  input: { result: AnalysisResult; platform: Platform; voice: Voice; customVoice?: string },
) => Promise<GeneratedOutput>;
