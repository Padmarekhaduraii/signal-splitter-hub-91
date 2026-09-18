import type { Fact } from "../analysis/types";
import type { GeneratedOutput, Generator, Platform, Voice } from "./types";

// Deterministic generator. Every factual sentence below is copied verbatim from
// the analyzed source / Fact Bank — only non-factual framing text (hooks, labels,
// calls to action) is written by the template, and it never states a fact.

interface VoiceKit {
  opener: (topic: string) => string;
  connector: string;
  close: string;
  hashtags: boolean;
}

const VOICE_KITS: Record<Voice, VoiceKit> = {
  Professional: {
    opener: (t) => `A note on ${t}:`,
    connector: "From the source:",
    close: "Full context is in the original source.",
    hashtags: true,
  },
  Friendly: {
    opener: (t) => `Been reading up on ${t} — sharing what stood out.`,
    connector: "Straight from the source:",
    close: "Worth a read if this is your world too.",
    hashtags: true,
  },
  Bold: {
    opener: (t) => `Most teams get ${t} wrong. The source is blunt about it.`,
    connector: "Here it is, unedited:",
    close: "Read the source before you argue with it.",
    hashtags: true,
  },
  Educational: {
    opener: (t) => `Let's break down ${t}, point by point.`,
    connector: "What the source says:",
    close: "Each point above is quoted from the source material.",
    hashtags: false,
  },
  Custom: {
    opener: (t) => `On ${t}:`,
    connector: "From the source:",
    close: "Every line above is taken from the source.",
    hashtags: false,
  },
};

function topicFrom(entities: string[], fallback: string): string {
  return entities[0] ?? fallback;
}

function trimTo(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const stop = Math.max(cut.lastIndexOf(" "), 0);
  return `${cut.slice(0, stop).trimEnd()}…`;
}

function hashtagsFrom(entities: string[]): string {
  const tags = entities
    .slice(0, 3)
    .map((e) => `#${e.replace(/[^A-Za-z0-9]/g, "")}`)
    .filter((t) => t.length > 2);
  return tags.join(" ");
}

function pickFacts(factBank: Fact[], limit: number): Fact[] {
  const order: Record<string, number> = { statistic: 0, quote: 1, claim: 2, date: 3, entity: 4 };
  return [...factBank]
    .sort((a, b) => (order[a.type] ?? 9) - (order[b.type] ?? 9) || a.reference.start - b.reference.start)
    .filter((f, i, arr) => arr.findIndex((o) => o.fact === f.fact) === i)
    .slice(0, limit);
}

export const generateLocally: Generator = async ({ result, platform, voice, customVoice }) => {
  const { analysis, factBank } = result;
  if (!factBank.length && !analysis.summary.length) {
    throw new Error("This source has no extracted facts yet. Re-run Source Analysis first.");
  }

  const kit = VOICE_KITS[voice];
  const topic = topicFrom(analysis.entities, "this report");
  const opener = voice === "Custom" && customVoice?.trim() ? `${customVoice.trim()} — ${topic}:` : kit.opener(topic);

  const facts = pickFacts(factBank, platform === "X Thread" ? 5 : 4);
  const supporting = facts.length ? facts : analysis.summary.map((s, i) => ({
    id: `summary-${i}`, fact: s, passage: s, type: "claim" as const,
    reference: { start: 0, end: s.length, sentence: i, label: "summary" },
  }));

  let content = "";

  if (platform === "LinkedIn") {
    const body = supporting.map((f) => `• ${f.fact}`).join("\n");
    const tags = kit.hashtags ? `\n\n${hashtagsFrom(analysis.entities)}` : "";
    content = `${opener}\n\n${kit.connector}\n${body}\n\n${kit.close}${tags}`.trimEnd();
  } else if (platform === "X Thread") {
    const posts = [
      `1/ ${opener}`,
      ...supporting.map((f, i) => `${i + 2}/ ${trimTo(f.fact, 260)}`),
      `${supporting.length + 2}/ ${kit.close}`,
    ];
    content = posts.join("\n\n");
  } else if (platform === "Instagram Carousel") {
    const slides = [
      `SLIDE 1 — ${opener}`,
      ...supporting.map((f, i) => `SLIDE ${i + 2} — ${trimTo(f.fact, 180)}`),
      `SLIDE ${supporting.length + 2} — ${kit.close}`,
    ];
    content = slides.join("\n\n");
  } else {
    const mid = supporting
      .map((f, i) => `[POINT ${i + 1} — 0:${String(8 + i * 10).padStart(2, "0")}]\n${trimTo(f.fact, 220)}`)
      .join("\n\n");
    content = `[HOOK — 0:00]\n${opener}\n\n${mid}\n\n[CLOSE — 0:${String(8 + supporting.length * 10).padStart(2, "0")}]\n${kit.close}`;
  }

  return {
    platform,
    voice,
    content,
    usedFacts: supporting as Fact[],
    createdAt: Date.now(),
  };
};

export const platformHint: Record<Platform, string> = {
  LinkedIn: "Professional post with a strong opening and source-supported body.",
  "X Thread": "Numbered posts, one idea each, numbers and names preserved exactly.",
  "Instagram Carousel": "Hook slide, fact slides, takeaway slide.",
  "Short Video / Reel": "30–60 second script: hook, points, supporting facts, close.",
};
