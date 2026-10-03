import type { ReactNode } from "react";
import type { Insight } from "@/lib/stats";
import { cn } from "@/lib/utils";
import { Empty } from "./ui";

export function InsightList({ items, empty = "Not enough data yet." }: { items: Insight[]; empty?: string }) {
  if (!items.length) return <p className="text-sm text-muted-foreground">{empty}</p>;
  return (
    <ul className="space-y-2.5">
      {items.map((i, k) => (
        <li key={k} className={cn("border-l-2 pl-3", i.tone === "good" ? "border-profit" : i.tone === "bad" ? "border-loss" : "border-border")}>
          <div className="text-sm font-medium">{i.title}</div>
          <div className="num text-xs text-muted-foreground">{i.detail}</div>
        </li>
      ))}
    </ul>
  );
}

export function QueryState({ isLoading, error, children }: { isLoading: boolean; error: unknown; children: ReactNode }) {
  if (isLoading) return <div className="grid gap-3 sm:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="h-24 animate-pulse rounded-md bg-muted" />)}</div>;
  if (error) return <Empty>Could not load your data: {error instanceof Error ? error.message : String(error)}. Refresh to try again.</Empty>;
  return <>{children}</>;
}
