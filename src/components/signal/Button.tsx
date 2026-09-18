import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; variant?: "primary" | "secondary" | "ghost" };
export function Button({ children, variant = "secondary", className, ...props }: Props) {
  return <button className={cn("inline-flex min-h-9 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium ring-1 transition hover:-translate-y-px disabled:opacity-50", variant === "primary" && "bg-brand text-primary-foreground ring-brand/40", variant === "secondary" && "bg-panel/70 text-ink/70 ring-ink/5 hover:bg-panel", variant === "ghost" && "ring-transparent text-ink/60 hover:bg-panel/60 hover:text-ink", className)} {...props}>{children}</button>;
}
