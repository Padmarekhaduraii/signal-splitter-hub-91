import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, FileCheck2, Gauge, LayoutDashboard, Menu, PenTool, Plus, Radio, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import roomBg from "@/assets/signal-room-bg.jpg";
import { Button } from "./Button";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/source-analysis", label: "Source Analysis", icon: BarChart3 },
  { to: "/content-studio", label: "Content Studio", icon: PenTool },
  { to: "/fact-lock", label: "Fact Lock", icon: FileCheck2 },
  { to: "/quality-check", label: "Quality Check", icon: Gauge },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const sidebar = <>
    <div className="flex items-center gap-2.5 px-5 py-6"><span className="grid size-8 place-items-center rounded-lg bg-ink text-paper"><Radio className="size-4 text-brand" /></span><span className="font-mono text-[13px] font-semibold text-ink">SIGNAL SPLITTER</span></div>
    <nav className="mt-2 flex flex-col gap-0.5 px-3">{nav.map(({to,label,icon:Icon}) => <Link key={to} to={to} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${path === to ? "bg-panel/75 text-ink ring-1 ring-ink/5" : "text-ink/60 hover:bg-panel/60 hover:text-ink"}`}><Icon className="size-4" />{label}</Link>)}</nav>
    <div className="mx-3 mt-auto mb-6 rounded-lg bg-panel/60 p-4 ring-1 ring-ink/5"><p className="eyebrow">Signal status</p><p className="mt-1 font-mono text-sm font-semibold text-ink">4 channels live</p><p className="mt-2 text-xs leading-relaxed text-ink/60">One source, verified and split across every platform.</p></div>
  </>;
  return <div className="relative min-h-screen overflow-hidden bg-paper text-ink"><img src={roomBg} alt="" width={1920} height={1080} className="fixed inset-0 h-full w-full object-cover opacity-25" /><div className="fixed inset-0 bg-workspace" /><div className="relative flex min-h-screen"><aside className="hidden w-[248px] shrink-0 flex-col border-r border-panel/60 bg-panel/50 backdrop-blur-2xl lg:flex">{sidebar}</aside>{open && <div className="fixed inset-0 z-40 flex lg:hidden"><button aria-label="Close menu" className="absolute inset-0 bg-ink/25" onClick={() => setOpen(false)} /><aside className="relative flex w-[280px] flex-col bg-paper shadow-xl">{sidebar}<button aria-label="Close menu" onClick={() => setOpen(false)} className="absolute right-3 top-5 rounded-lg p-2 text-ink"><X className="size-4" /></button></aside></div>}<main className="min-w-0 flex-1"><header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-panel/60 bg-panel/50 px-4 backdrop-blur-2xl md:px-8"><button aria-label="Open menu" onClick={() => setOpen(true)} className="rounded-lg p-2 text-ink lg:hidden"><Menu className="size-5" /></button><div className="hidden lg:block"><p className="eyebrow">Active project</p><p className="text-sm font-medium text-ink">Q3 Editorial Report — “The Content Reuse Gap”</p></div><span className="font-mono text-xs font-semibold lg:hidden">SIGNAL SPLITTER</span><div className="ml-auto flex items-center gap-3"><span className="hidden items-center gap-2 rounded-lg bg-panel/60 px-3 py-1.5 text-xs font-medium text-ink/70 ring-1 ring-ink/5 sm:flex"><span className="size-1.5 rounded-full bg-brand" />Verified source</span><Link to="/source-analysis"><Button variant="primary"><Plus className="size-4" /><span className="hidden sm:inline">Create New Content</span><span className="sm:hidden">New</span></Button></Link></div></header><div className="mx-auto max-w-[1500px] px-4 py-6 md:px-8 md:py-8">{children}</div></main></div></div>;
}
