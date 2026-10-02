import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({ title, action, children, className }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("panel fade-in", className)}>
      {title && (
        <div className="flex items-center justify-between border-b px-4 py-2.5">
          <h2 className="label-caps">{title}</h2>
          {action}
        </div>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function Stat({ label, value, tone, sub }: { label: string; value: ReactNode; tone?: "profit" | "loss" | "neutral"; sub?: ReactNode }) {
  return (
    <div className="panel px-3.5 py-3 fade-in">
      <div className="label-caps">{label}</div>
      <div className={cn("num mt-1.5 text-lg font-semibold sm:text-xl", tone === "profit" && "text-profit", tone === "loss" && "text-loss")}>{value}</div>
      {sub && <div className="num mt-0.5 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

export const toneOf = (n: number) => (n > 0 ? "profit" : n < 0 ? "loss" : "neutral") as "profit" | "loss" | "neutral";

export function Signed({ value, children, className }: { value: number; children: ReactNode; className?: string }) {
  return <span className={cn("num", value > 0 && "text-profit", value < 0 && "text-loss", className)}>{children}</span>;
}

export function PageHeader({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
        {sub && <p className="mt-0.5 text-sm text-muted-foreground">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function ResultBadge({ result }: { result: string }) {
  return (
    <span className={cn("num rounded px-1.5 py-0.5 text-[11px] font-medium",
      result === "Win" && "bg-profit/15 text-profit", result === "Loss" && "bg-loss/15 text-loss", result === "Breakeven" && "bg-muted text-muted-foreground")}>
      {result === "Breakeven" ? "BE" : result.toUpperCase()}
    </span>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="py-10 text-center text-sm text-muted-foreground">{children}</div>;
}
