import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useReflections, useSettings, useTrades } from "@/lib/data";
import { breakdowns, coreStats, deriveInsights, fmtMoney, fmtPF, fmtR, sortChrono } from "@/lib/stats";
import { DEFAULT_SETTINGS } from "@/lib/types";
import { Empty, PageHeader, Panel, ResultBadge, Signed, Stat, toneOf } from "@/components/traderos/ui";
import { CountBars, EquityChart, PnlBars } from "@/components/traderos/charts";
import { InsightList, QueryState } from "@/components/traderos/insights";
import { useTradeActions } from "@/components/traderos/AppShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — TraderOS" }, { name: "description", content: "Your trading performance at a glance." }, { property: "og:title", content: "Dashboard — TraderOS" }, { property: "og:description", content: "Your trading performance at a glance." }] }),
  component: Dashboard,
});

function Dashboard() {
  const { data: trades = [], isLoading, error } = useTrades();
  const { data: s = DEFAULT_SETTINGS } = useSettings();
  const { data: refl = [] } = useReflections();
  const { add, view } = useTradeActions();
  const c = coreStats(trades, s);
  const b = useMemo(() => breakdowns(trades), [trades]);
  const ins = useMemo(() => deriveInsights(trades, s, refl), [trades, s, refl]);
  const recent = sortChrono(trades).reverse().slice(0, 8);
  const best = trades.length ? trades.reduce((a, t) => (t.pnl > a.pnl ? t : a)) : null;
  const worst = trades.length ? trades.reduce((a, t) => (t.pnl < a.pnl ? t : a)) : null;

  return (
    <div>
      <PageHeader title="Dashboard" sub={`${c.total} trades · balance ${fmtMoney(c.balance)}`} />
      <QueryState isLoading={isLoading} error={error}>
        {!trades.length ? (
          <Panel><Empty>No trades yet. <Button size="sm" className="ml-2" onClick={add}>Add your first trade</Button></Empty></Panel>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
              <Stat label="Balance" value={fmtMoney(c.balance)} />
              <Stat label="Net P&L" value={fmtMoney(c.netPnl, true)} tone={toneOf(c.netPnl)} />
              <Stat label="Trades" value={c.total} sub={`${c.wins}W · ${c.losses}L · ${c.breakeven}BE`} />
              <Stat label="Win rate" value={`${c.winRate.toFixed(1)}%`} />
              <Stat label="Profit factor" value={fmtPF(c.profitFactor)} />
              <Stat label="Avg R" value={fmtR(c.avgR)} tone={toneOf(c.avgR)} />
              <Stat label="Expectancy" value={fmtMoney(c.expectancy, true)} tone={toneOf(c.expectancy)} />
              <Stat label="Avg win" value={fmtMoney(c.avgWin)} tone="profit" />
              <Stat label="Avg loss" value={fmtMoney(c.avgLoss)} tone="loss" />
              <Stat label="Best trade" value={fmtMoney(best?.pnl ?? 0, true)} tone="profit" sub={best ? `${best.market} ${best.trade_date}` : undefined} />
              <Stat label="Worst trade" value={fmtMoney(worst?.pnl ?? 0, true)} tone="loss" sub={worst ? `${worst.market} ${worst.trade_date}` : undefined} />
              <Stat label="Streak" value={`${c.currentStreak.count} ${c.currentStreak.type}`} />
              <Stat label="Max DD" value={fmtMoney(-c.maxDD)} sub={`${c.maxDDPct.toFixed(1)}%`} tone="loss" />
              <Stat label="Risk / trade" value={`${c.avgRiskPct.toFixed(2)}%`} />
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <Panel title="Equity curve" className="lg:col-span-2"><EquityChart data={c.equity} /></Panel>
              <Panel title="Win / loss">
                <CountBars data={[{ key: "Win", count: c.wins }, { key: "-Loss", count: c.losses }, { key: "0R", count: c.breakeven }]} height={280} />
              </Panel>
              <Panel title="P&L by setup"><PnlBars data={b.setup} horizontal /></Panel>
              <Panel title="P&L by market"><PnlBars data={b.market} horizontal /></Panel>
              <Panel title="P&L by session"><PnlBars data={b.session} horizontal /></Panel>
              <Panel title="Recent trades" className="lg:col-span-2" action={<Link to="/journal" className="text-xs text-primary">View all</Link>}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <tbody>
                      {recent.map((t) => (
                        <tr key={t.id} onClick={() => view(t)} className="cursor-pointer border-b border-border/60 hover:bg-accent/40">
                          <td className="num py-1.5 pr-3 text-muted-foreground">{t.trade_date}</td>
                          <td className="pr-3 font-medium">{t.market}</td>
                          <td className="pr-3 text-muted-foreground">{t.direction}</td>
                          <td className="pr-3 hidden sm:table-cell text-muted-foreground">{t.setup ?? "—"}</td>
                          <td className="pr-3"><ResultBadge result={t.result} /></td>
                          <td className="pr-3 text-right"><Signed value={t.r_multiple}>{fmtR(t.r_multiple)}</Signed></td>
                          <td className="text-right"><Signed value={t.pnl}>{fmtMoney(t.pnl, true)}</Signed></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
              <Panel title="Coach insights" action={<Link to="/coach" className="text-xs text-primary">AI Coach</Link>}>
                <InsightList items={[...ins.working.slice(0, 2), ...ins.hurting.slice(0, 2), ...ins.patterns.slice(0, 1)]} />
              </Panel>
            </div>
            {ins.violations.length > 0 && (
              <Panel title={`Risk rule violations (${ins.violations.length})`} className="mt-4">
                <ul className="space-y-1 text-sm">{ins.violations.slice(0, 5).map((v, i) => <li key={i} className="num"><span className="text-warning">{v.date}</span> · {v.rule} — <span className="text-muted-foreground">{v.detail}</span></li>)}</ul>
              </Panel>
            )}
          </>
        )}
      </QueryState>
    </div>
  );
}
