import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, BarChart3, LoaderCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/signal/AppShell";
import { Button } from "@/components/signal/Button";
import { PageHeader, Panel } from "@/components/signal/PageHeader";
import { analyzeSource } from "@/lib/analysis";
import { useSource } from "@/lib/analysis/store";

export const Route = createFileRoute("/source-analysis")({ head: () => ({ meta: [{ title: "Source Analysis — Signal Splitter" }, { name: "description", content: "Extract structured ideas, claims and context from long-form source content." }, { property: "og:title", content: "Source Analysis — Signal Splitter" }, { property: "og:description", content: "Turn a long-form source into a structured, fact-aware content signal." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }), component: SourceAnalysis });

const sample = "The 2024 Content Reuse Gap: 78% of long-form reports are never repurposed. Teams lose reach by treating each platform as a blank page instead of a verified split of one source. The report surveyed 640 editorial and marketing leaders across B2B technology companies. Teams using a source-first workflow produced four times more derivative assets while cutting review cycles by 32%. “Adapt the delivery — never the facts,” the study concludes. This report maps the workflow that keeps every derivative claim locked to its evidence.";

function SourceAnalysis() {
  const { result, setResult, clear } = useSource();
  const [draft, setDraft] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const source = draft ?? result?.source ?? sample;
  const analysis = result?.analysis;

  const run = async () => {
    setError(null);
    if (!source.trim()) { setError("Paste a source before running the analysis."); return; }
    setLoading(true);
    try {
      setResult(await analyzeSource(source));
    } catch (e) {
      setError(e instanceof Error ? e.message : "The analysis could not be completed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const onClear = () => { setDraft(""); setError(null); clear(); };

  const sections: [string, string[]][] = analysis ? [
    ["Source summary", analysis.summary],
    ["Key ideas", analysis.keyIdeas],
    ["Claims", analysis.claims],
    ["Statistics", analysis.statistics],
    ["Named entities", analysis.entities],
    ["Important quotes", analysis.quotes],
  ] : [];

  return <AppShell><PageHeader eyebrow="Source signal" title="Analyze once. Build from verified context." description="Paste long-form material to establish the ideas, evidence, audience and tone every output must preserve." />
    <Panel className="mb-6"><label htmlFor="source" className="eyebrow">Source content</label><textarea id="source" value={source} onChange={(e) => setDraft(e.target.value)} placeholder="Paste an article, transcript, report or blog post…" className="mt-3 h-56 w-full resize-y rounded-lg border-0 bg-panel/75 p-4 text-sm leading-7 text-ink/80 ring-1 ring-ink/10 outline-none focus:ring-2 focus:ring-brand/40" /><div className="mt-4 flex flex-wrap items-center gap-3"><Button variant="primary" onClick={run} disabled={loading}>{loading ? <LoaderCircle className="size-4 animate-spin" /> : <BarChart3 className="size-4" />}{loading ? "Analyzing…" : "Analyze Source"}</Button><Button onClick={onClear} disabled={loading}><Trash2 className="size-4" />Clear Source</Button><span className="text-xs text-ink/45">{source.trim() ? `${source.trim().split(/\s+/).length} words in input` : "No source loaded"}{analysis ? ` · analyzed: ${analysis.meta.sentences} sentences · ${analysis.meta.readingMinutes} min read` : ""}</span></div>
      {error && <p className="mt-4 flex items-center gap-2 rounded-lg bg-rose/10 px-3 py-2 text-sm text-rose"><AlertTriangle className="size-4 shrink-0" />{error}</p>}
    </Panel>

    {!analysis && !error && <Panel><p className="eyebrow">No analysis yet</p><p className="mt-2 text-sm leading-relaxed text-ink/60">Paste your source above and run “Analyze Source”. Everything below is extracted directly from your text — nothing is invented.</p></Panel>}

    {analysis && <><div className="mb-6 grid gap-4 sm:grid-cols-3">{[["Intended audience", analysis.audience], ["Tone", analysis.tone], ["Purpose", analysis.purpose]].map(([k, v]) => <Panel key={k}><p className="eyebrow">{k}</p><p className="mt-2 text-sm font-medium">{v}</p></Panel>)}</div>
      <div className="grid gap-4 lg:grid-cols-2">{sections.map(([title, items]) => <Panel key={title}><h2 className="font-mono text-xs font-semibold uppercase text-ink/55">{title}</h2>{items.length ? <ul className="mt-4 space-y-3">{items.map((item, i) => <li key={`${title}-${i}`} className="flex gap-3 text-sm leading-relaxed text-ink/70"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" />{item}</li>)}</ul> : <p className="mt-4 text-sm text-ink/45">None found in this source.</p>}</Panel>)}</div>
      <Panel className="mt-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="eyebrow">Fact bank</p><h2 className="mt-1 text-lg font-semibold">{result?.factBank.length} facts locked to this source</h2></div><span className="font-mono text-[10px] text-ink/35">{analysis.meta.engine.toUpperCase()}</span></div><div className="mt-4 divide-y divide-ink/10">{result?.factBank.slice(0, 12).map((f) => <div key={f.id} className="grid gap-2 py-4 text-sm lg:grid-cols-[110px_1fr_170px] lg:items-start"><span className="w-fit rounded bg-brand/10 px-2 py-1 font-mono text-[10px] uppercase text-brand">{f.type}</span><p className="leading-relaxed text-ink/75">{f.fact}</p><p className="font-mono text-[10px] text-ink/35 lg:text-right">{f.reference.label}</p></div>)}</div></Panel>
      <div className="mt-6 flex justify-end"><Link to="/content-studio"><Button variant="primary">Open Content Studio <ArrowRight className="size-4" /></Button></Link></div></>}
  </AppShell>;
}
