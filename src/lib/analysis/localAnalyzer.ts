import type { AnalysisResult, Fact, FactType, SourceAnalysis } from "./types";

// Deterministic, extraction-only analyzer. Every output string is copied from the
// supplied source (or is a labelled classification) — nothing is invented.

interface Sentence { text: string; start: number; end: number; index: number }

const STOP = new Set("the a an and or but of to in on for with as at by from that this these those is are was were be been being it its their our your we you they he she i not no if then than so such about into over under more most less least can could should would may might will just also very there here what which who whom whose when where why how all any each other some only own same too s t don now".split(" "));

export function splitSentences(text: string): Sentence[] {
  const out: Sentence[] = [];
  const re = /[^.!?\n]+[.!?]*/g;
  let m: RegExpExecArray | null;
  let index = 0;
  while ((m = re.exec(text))) {
    const raw = m[0];
    const trimmed = raw.trim();
    if (trimmed.length < 2) continue;
    const start = m.index + raw.indexOf(trimmed);
    out.push({ text: trimmed, start, end: start + trimmed.length, index: index++ });
  }
  return out;
}

function words(text: string): string[] {
  return text.toLowerCase().match(/[a-z][a-z'-]+/g) ?? [];
}

function keywordScores(sentences: Sentence[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const s of sentences) for (const w of words(s.text)) {
    if (STOP.has(w) || w.length < 4) continue;
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }
  return freq;
}

const NUMERIC = /(\d[\d,.]*\s?(%|percent|x|×|million|billion|thousand|k\b)|\$\s?\d|\b\d{2,}\b|\b\d+(\.\d+)?\s?(hours?|days?|weeks?|months?|years?|points?|people|users|respondents|companies|teams)\b)/i;
const CLAIM_CUE = /\b(is|are|was|were|will|can|should|must|means|shows|found|reveals|proves|leads to|results in|causes|increase[sd]?|decrease[sd]?|reduce[sd]?|improve[sd]?|guarantee[sd]?|drive[sd]?|enable[sd]?)\b/i;
const DATEY = /\b(19|20)\d{2}\b|\b(january|february|march|april|may|june|july|august|september|october|november|december|q[1-4])\b/i;

function extractQuotes(text: string): { text: string; start: number }[] {
  const out: { text: string; start: number }[] = [];
  const re = /[“"']([^“”"']{25,320})[”"']/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) out.push({ text: m[1]!.trim(), start: m.index + 1 });
  return out;
}

function extractEntities(sentences: Sentence[]): string[] {
  const counts = new Map<string, number>();
  for (const s of sentences) {
    const tokens = s.text.split(/\s+/);
    let buf: string[] = [];
    tokens.forEach((tok, i) => {
      const clean = tok.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9%.]+$/g, "");
      const capitalized = /^[A-Z][A-Za-z0-9&.'-]*$/.test(clean) && clean.length > 1;
      const sentenceStart = i === 0;
      if (capitalized && !(sentenceStart && buf.length === 0)) buf.push(clean);
      else {
        if (buf.length) { const name = buf.join(" "); counts.set(name, (counts.get(name) ?? 0) + 1); }
        buf = [];
        if (capitalized && sentenceStart) buf = [];
      }
    });
    if (buf.length) { const name = buf.join(" "); counts.set(name, (counts.get(name) ?? 0) + 1); }
  }
  return [...counts.entries()]
    .filter(([name]) => name.length > 2 && !STOP.has(name.toLowerCase()))
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .slice(0, 10)
    .map(([name]) => name);
}

function classify(text: string, table: [RegExp, string][], fallback: string): string {
  for (const [re, label] of table) if (re.test(text)) return label;
  return fallback;
}

function makeFact(type: FactType, fact: string, passage: string, start: number, sentence: number): Fact {
  return {
    id: `${type}-${start}-${sentence}`,
    type,
    fact,
    passage,
    reference: { start, end: start + passage.length, sentence, label: `¶ char ${start}–${start + passage.length} · sentence ${sentence + 1}` },
  };
}

export async function analyzeLocally(source: string): Promise<AnalysisResult> {
  const text = source.trim();
  if (!text) throw new Error("Paste a source before running the analysis.");
  if (text.length < 120) throw new Error("This source is too short to analyze. Paste at least a few sentences.");

  const sentences = splitSentences(text);
  if (sentences.length < 2) throw new Error("No complete sentences were found in this source.");

  const freq = keywordScores(sentences);
  const scored = sentences.map((s) => {
    const ws = words(s.text).filter((w) => !STOP.has(w) && w.length >= 4);
    const base = ws.reduce((sum, w) => sum + (freq.get(w) ?? 0), 0) / Math.max(ws.length, 1);
    const bonus = (NUMERIC.test(s.text) ? 1.4 : 0) + (s.index < 3 ? 0.8 : 0);
    return { s, score: base + bonus };
  });
  const byScore = [...scored].sort((a, b) => b.score - a.score);

  const summary = byScore.slice(0, 3).sort((a, b) => a.s.index - b.s.index).map((x) => x.s.text);
  const keyIdeas = byScore.filter((x) => !NUMERIC.test(x.s.text)).slice(0, 5).map((x) => x.s.text);
  const statSentences = sentences.filter((s) => NUMERIC.test(s.text)).slice(0, 8);
  const claimSentences = sentences
    .filter((s) => CLAIM_CUE.test(s.text) && s.text.split(/\s+/).length >= 6)
    .slice(0, 8);
  const quotes = extractQuotes(text).slice(0, 6);
  const entities = extractEntities(sentences);

  const factBank: Fact[] = [];
  for (const s of statSentences) factBank.push(makeFact("statistic", s.text, s.text, s.start, s.index));
  for (const s of claimSentences) {
    if (factBank.some((f) => f.passage === s.text)) continue;
    factBank.push(makeFact(DATEY.test(s.text) ? "date" : "claim", s.text, s.text, s.start, s.index));
  }
  for (const q of quotes) {
    const owner = sentences.find((s) => q.start >= s.start && q.start < s.end);
    factBank.push(makeFact("quote", q.text, q.text, q.start, owner?.index ?? 0));
  }
  for (const name of entities.slice(0, 6)) {
    const owner = sentences.find((s) => s.text.includes(name));
    if (owner) factBank.push(makeFact("entity", name, owner.text, owner.start, owner.index));
  }

  const wordCount = words(text).length;
  const analysis: SourceAnalysis = {
    summary,
    keyIdeas,
    claims: claimSentences.map((s) => s.text),
    statistics: statSentences.map((s) => s.text),
    entities,
    quotes: quotes.map((q) => q.text),
    audience: classify(text, [
      [/\b(b2b|enterprise|stakeholder|roi|procurement|revenue|saas)\b/i, "Business and marketing decision makers"],
      [/\b(developer|api|code|engineer|framework|deployment)\b/i, "Technical practitioners and engineers"],
      [/\b(student|learn|course|beginner|tutorial)\b/i, "Learners and newcomers to the topic"],
      [/\b(patient|clinical|treatment|diagnos)/i, "Clinical and healthcare readers"],
    ], "General informed readers interested in this topic"),
    tone: classify(text, [
      [/\b(must|urgent|critical|failure|risk|warning)\b/i, "Urgent and cautionary"],
      [/\b(we found|survey|data|respondents|study|research|analysis)\b/i, "Analytical and evidence-led"],
      [/\b(you can|let's|imagine|try|simply|here's how)\b/i, "Conversational and instructional"],
    ], "Informative and measured"),
    purpose: classify(text, [
      [/\b(how to|step|guide|checklist|first,|then,)\b/i, "Explain a process the reader can follow"],
      [/\b(should|recommend|we believe|argue|need to)\b/i, "Persuade the reader toward a position"],
      [/\b(survey|study|report|findings|data show)\b/i, "Report research findings and evidence"],
    ], "Inform the reader about the subject"),
    meta: {
      words: wordCount,
      sentences: sentences.length,
      readingMinutes: Math.max(1, Math.round(wordCount / 220)),
      engine: "Local extraction engine v1",
    },
  };

  return { source: text, analysis, factBank, createdAt: Date.now() };
}
