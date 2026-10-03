import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTrades } from "@/lib/data";
import { fmtMoney, fmtR, groupBy } from "@/lib/stats";
import { cn } from "@/lib/utils";
import { PageHeader, Panel, ResultBadge, Signed } from "@/components/traderos/ui";
import { QueryState } from "@/components/traderos/insights";
import { useTradeActions } from "@/components/traderos/AppShell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/calendar")({
  head: () => ({ meta: [{ title: "Calendar — TraderOS" }, { name: "description", content: "Monthly trading calendar with daily P&L and R results." }, { property: "og:title", content: "Calendar — TraderOS" }, { property: "og:description", content: "Monthly trading calendar with daily P&L and R results." }] }),
  component: CalendarPage,
});

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function CalendarPage() {
  const { data: trades = [], isLoading, error } = useTrades();
  const { view } = useTradeActions();
  const latest = trades[0]?.trade_date;
  const [month, setMonth] = useState<Date | null>(null);
  const m = month ?? (latest ? new Date(latest + "T00:00:00") : new Date());
  const first = new Date(m.getFullYear(), m.getMonth(), 1);
  const [day, setDay] = useState<string | null>(null);
  const days = useMemo(() => new Map(groupBy(trades, (t) => t.trade_date).map((g) => [g.key, g])), [trades]);
  const cells: (Date | null)[] = [];
  const pad = (first.getDay() + 6) % 7;
  for (let i = 0; i < pad; i++) cells.push(null);
  const dim = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
  for (let d = 1; d <= dim; d++) cells.push(new Date(m.getFullYear(), m.getMonth(), d));
  const monthKey = iso(first).slice(0, 7);
  const monthGroups = [...days.values()].filter((g) => g.key.startsWith(monthKey));
  const mPnl = monthGroups.reduce((a, g) => a + g.pnl, 0);
  const mR = monthGroups.reduce((a, g) => a + g.totalR, 0);
  const dayTrades = day ? trades.filter((t) => t.trade_date === day) : [];
  const shift = (n: number) => setMonth(new Date(m.getFullYear(), m.getMonth() + n, 1));

  return (
    <div>
      <PageHeader title="Calendar" sub={`${monthGroups.length} trading days · ${fmtMoney(mPnl, true)} · ${fmtR(mR)}`}
        action={<div className="flex items-center gap-2">
          <Button size="icon" variant="outline" aria-label="Previous month" onClick={() => shift(-1)}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="num w-36 text-center text-sm">{first.toLocaleString("en-US", { month: "long", year: "numeric" })}</span>
          <Button size="icon" variant="outline" aria-label="Next month" onClick={() => shift(1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>} />
      <QueryState isLoading={isLoading} error={error}>
        <Panel>
          <div className="grid grid-cols-7 gap-1 text-center label-caps mb-1">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d}>{d}</div>)}</div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (!d) return <div key={i} />;
              const g = days.get(iso(d));
              return (
                <button key={i} disabled={!g} onClick={() => g && setDay(g.key)}
                  className={cn("min-h-[64px] rounded border p-1 text-left text-[11px] transition-colors sm:min-h-[88px] sm:p-2",
                    g ? (g.pnl > 0 ? "border-profit/40 bg-profit/10 hover:bg-profit/20" : g.pnl < 0 ? "border-loss/40 bg-loss/10 hover:bg-loss/20" : "bg-muted/40") : "border-border/50 opacity-60")}>
                  <div className="num text-muted-foreground">{d.getDate()}</div>
                  {g && <div className="num mt-0.5 space-y-0.5">
                    <div className={cn("font-semibold", g.pnl >= 0 ? "text-profit" : "text-loss")}>{fmtMoney(g.pnl, true)}</div>
                    <div className="hidden sm:block text-muted-foreground">{g.trades} trade{g.trades > 1 ? "s" : ""} · {fmtR(g.totalR)}</div>
                    <div className="hidden sm:block text-muted-foreground">{g.wins}W {g.losses}L</div>
                  </div>}
                </button>
              );
            })}
          </div>
        </Panel>
      </QueryState>
      <Dialog open={!!day} onOpenChange={(o) => !o && setDay(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Trades on {day}</DialogTitle></DialogHeader>
          <ul className="divide-y">
            {dayTrades.map((t) => (
              <li key={t.id}><button className="flex w-full items-center justify-between gap-2 py-2 text-left text-sm hover:bg-accent/40" onClick={() => { setDay(null); view(t); }}>
                <span><span className="num text-muted-foreground">{t.trade_time ?? ""}</span> {t.market} {t.direction} · {t.setup ?? "—"}</span>
                <span className="flex items-center gap-2"><ResultBadge result={t.result} /><Signed value={t.pnl}>{fmtMoney(t.pnl, true)}</Signed></span>
              </button></li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </div>
  );
}
