import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { analyzeJournal } from "@/lib/coach.functions";
import { useReflections, useSettings, useTrades } from "@/lib/data";
import { deriveInsights } from "@/lib/stats";
import { DEFAULT_SETTINGS } from "@/lib/types";
import { Empty, PageHeader, Panel } from "@/components/traderos/ui";
import { InsightList, QueryState } from "@/components/traderos/insights";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/coach")({
  head: () => ({ meta: [{ title: "AI Coach — TraderOS" }, { name: "description", content: "AI coaching grounded strictly in your own journal data." }, { property: "og:title", content: "AI Coach — TraderOS" }, { property: "og:description", content: "AI coaching grounded strictly in your own journal data." }] }),
  component: Coach,
});

function Coach() {
  const { data: trades = [], isLoading, error } = useTrades();
  const { data: s = DEFAULT_SETTINGS } = useSettings();
  const { data: refl = [] } = useReflections();
  const ins = useMemo(() => deriveInsights(trades, s, refl), [trades, s, refl]);
  const run = useServerFn(analyzeJournal);
  const [md, setMd] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function analyze() {
    setBusy(true); setErr(null);
    try {
      const r = await run();
      if (!r.markdown) setErr(`The coach needs at least 5 trades (you have ${r.tradeCount}).`);
      setMd(r.markdown);
    } catch (e) {
      const m = e instanceof Error ? e.message : "AI analysis failed.";
      setErr(m); toast.error(m);
    } finally { setBusy(false); }
  }

  return (
    <div>
      <PageHeader title="AI Coach" sub="Every finding is computed from your own trades and reflections."
        action={<Button onClick={analyze} disabled={busy || trades.length < 5}><Sparkles className="h-4 w-4" />{busy ? "Analyzing…" : md ? "Re-analyze" : "Run AI analysis"}</Button>} />
      <QueryState isLoading={isLoading} error={error}>
        {trades.length < 5 && <Panel className="mb-4"><Empty>Log at least 5 trades to unlock AI coaching (currently {trades.length}).</Empty></Panel>}
        <div className="grid gap-4 lg:grid-cols-5">
          <Panel title="AI analysis" className="lg:col-span-3">
            {busy ? <div className="space-y-2">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="h-4 animate-pulse rounded bg-muted" />)}</div>
              : err ? <p className="text-sm text-loss">{err}</p>
              : md ? <div className="prose prose-invert prose-sm max-w-none [&_h2]:mt-5 [&_h2]:text-base [&_h2]:font-semibold [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_p]:my-2"><ReactMarkdown>{md}</ReactMarkdown></div>
              : <p className="text-sm text-muted-foreground">Click "Run AI analysis" for a full review: What's Working, What Is Hurting Performance, Recurring Pattern, Execution Problem, and Action Plan.</p>}
          </Panel>
          <div className="space-y-4 lg:col-span-2">
            <Panel title="What's working (rule-based)"><InsightList items={ins.working} /></Panel>
            <Panel title="What is hurting"><InsightList items={ins.hurting} /></Panel>
            <Panel title="Recurring patterns"><InsightList items={ins.patterns} /></Panel>
            <Panel title="Execution"><InsightList items={ins.execution} /></Panel>
            <Panel title="Action plan">
              {ins.actions.length ? <ol className="list-decimal space-y-1.5 pl-5 text-sm">{ins.actions.map((a, i) => <li key={i}>{a}</li>)}</ol> : <p className="text-sm text-muted-foreground">Not enough data yet.</p>}
            </Panel>
          </div>
        </div>
      </QueryState>
    </div>
  );
}
