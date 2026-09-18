import { generateLocally } from "./localGenerator";
import type { Generator } from "./types";

// Swap for an AI-backed generator later — callers only depend on the Generator
// signature and the GeneratedOutput shape.
export const generateContent: Generator = generateLocally;

export * from "./types";
export { platformHint } from "./localGenerator";
