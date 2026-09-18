import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, FileCheck2, Gauge, PenTool, Plus } from "lucide-react";
import { AppShell } from "@/components/signal/AppShell";
import { Button } from "@/components/signal/Button";
import { PageHeader, Panel } from "@/components/signal/PageHeader";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard — Signal Splitter" }, { name: "description", content: "Repurpose one source into accurate content for every social platform." }, { property: "og:title", content: "Signal Splitter Dashboard" }, { property: "og:description", content: "One Source. Every Platform. Zero Factual Drift." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Dashboard,
});

const features = [
  { to: "/source-analysis", icon: BarChart3, label: "Source Analysis", text: "Extract key ideas, claims, statistics, entities and quotes." },
  { to: "/content-studio", icon: PenTool, label: "Content Generation", text: "Create native content for four social formats from one source." },
  { to: "/fact-lock", icon: FileCheck2, label: "Fact Lock", text: "Trace every generated claim to its supporting passage." },
  { to: "/quality-check", icon: Gauge, label: "Quality Check", text: "Score accuracy, coverage, voice and platform fit." },
] as const;

function Dashboard() {
  return <AppShell><PageHeader eyebrow="Broadcast control room" title="One clean signal, split into four verified channels." description="Repurpose the Q3 report into LinkedIn, X, Instagram and short video without a single claim drifting." action={<Link to="/source-analysis"><Button variant="primary"><Plus className="size-4" />Create New Content</Button></Link>} />
    <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{features.map(({to,icon:Icon,label,text},i) => <Link key={to} to={to} className="group rounded-lg bg-panel/55 p-5 ring-1 ring-ink/5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-panel/75"><div className="mb-5 flex items-start justify-between"><span className="grid size-10 place-items-center rounded-lg bg-ink text-paper"><Icon className="size-4 text-brand" /></span><span className="font-mono text-[10px] text-ink/35">0{i+1}</span></div><h2 className="font-semibold text-ink">{label}</h2><p className="mt-2 text-sm leading-relaxed text-ink/55">{text}</p><span className="mt-5 flex items-center gap-2 text-xs font-medium text-brand">Open module <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" /></span></Link>)}</div>
    <Panel><div className="mb-4 flex items-center justify-between"><div><p className="eyebrow">Recent projects</p><h2 className="mt-1 text-lg font-semibold">Latest signal runs</h2></div><span className="text-xs text-ink/45">Updated today</span></div><div className="divide-y divide-ink/10">{[["Q3 Editorial Report","4 outputs","96%","12 min ago"],["2026 Creator Economy Forecast","3 outputs","91%","Yesterday"],["Brand Voice Playbook","4 outputs","88%","Sep 15"]].map(([name,out,score,time]) => <div key={name} className="grid gap-2 py-4 text-sm sm:grid-cols-[1fr_120px_90px_100px] sm:items-center"><p className="font-medium">{name}</p><p className="text-ink/55">{out}</p><p className="font-mono text-brand">{score} verified</p><p className="text-ink/45 sm:text-right">{time}</p></div>)}</div></Panel>
  </AppShell>;
}
