import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useReflections, useSettings, useTrades } from "@/lib/data";
import { breakdowns, coreStats, deriveInsights, fmtMoney, fmtPF, fmtR, rDistribution, sortChrono, timeSeries } from "@/lib/stats";
import { DEFAULT_SETTINGS } from "@/lib/types";
import { Empty, PageHeader, Panel, Stat, toneOf } from "@/components/traderos/ui";
import { CountBars, EquityChart, PnlBars } from "@/components/traderos/charts";
import { InsightList, QueryState } from "@/components/traderos/insights";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [{ title: "Analytics — TraderOS" }, { name: "description", content: "Deep performance analytics across setups, sessions, markets and ICT models." }, { property: "og:title", content: "Analytics — TraderOS" }, { property: "og:description", content: "Deep performance analytics across setups, sessions, markets and ICT models." }] }),
  component: Analytics,
});

function Analytics() {
  const { data: trades = [], isLoading, error } = useTrades();
  const { data: s = DEFAULT_SETTINGS } = useSettings();
  const { data: refl = [] } = useReflections();
  const c = coreStats(trades, s);
  const b = useMemo(() => breakdowns(trades), [trades]);
  const ts = useMemo(() => timeSeries(trades), [trades]);
  const ins = useMemo(() => deriveInsights(trades, s, refl), [trades, s, refl]);
  const dd = useMemo(() => {
    let peak = s.account_size;
    return c.equity.map((e) => { peak = Math.max(peak, e.balance); return { key: e.label, pnl: e.balance - peak, trades: 1, wins: 0, losses: 0, avgR: 0, winRate: 0, totalR: 0 }; });
  }, [c.equity, s.account_size]);
  const rs = sortChrono(trades).map((t) => t.r_multiple);

  return (
    <div>
      <PageHeader title="Analytics" sub={`Based on ${c.total} journaled trades`} />
      <QueryState isLoading={isLoading} error={error}>
        {!trades.length ? <Panel><Empty>Add trades to see analytics.</Empty></Panel> : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
              <Stat label="Win rate" value={`${c.winRate.toFixed(1)}%`} sub={`Loss ${c.lossRate.toFixed(1)}%`} />
              <Stat label="Profit factor" value={fmtPF(c.profitFactor)} />
              <Stat label="Expectancy" value={fmtMoney(c.expectancy, true)} tone={toneOf(c.expectancy)} />
              <Stat label="Avg R" value={fmtR(c.avgR)} tone={toneOf(c.avgR)} sub={`Total ${fmtR(rs.reduce((a, x) => a + x, 0))}`} />
              <Stat label="Best / worst R" value={`${fmtR(Math.max(...rs))}`} sub={fmtR(Math.min(...rs))} />
              <Stat label="Avg P&L" value={fmtMoney(c.avgPnl, true)} tone={toneOf(c.avgPnl)} />
              <Stat label="Avg win / loss" value={fmtMoney(c.avgWin)} sub={fmtMoney(c.avgLoss)} />
              <Stat label="Largest win" value={fmtMoney(c.largestWin)} tone="profit" />
              <Stat label="Largest loss" value={fmtMoney(c.largestLoss)} tone="loss" />
              <Stat label="Max drawdown" value={fmtMoney(-c.maxDD)} sub={`${c.maxDDPct.toFixed(1)}%`} tone="loss" />
              <Stat label="Max consec. wins" value={c.maxConsecWins} />
              <Stat label="Max consec. losses" value={c.maxConsecLosses} />
              <Stat label="Avg hold" value={c.avgHoldMin === null ? "—" : `${Math.round(c.avgHoldMin)}m`} />
              <Stat label="Gross win" value={fmtMoney(c.grossWin)} tone="profit" />
              <Stat label="Gross loss" value={fmtMoney(-c.grossLoss)} tone="loss" />
              <Stat label="Net P&L" value={fmtMoney(c.netPnl, true)} tone={toneOf(c.netPnl)} />
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <Panel title="Equity curve" className="lg:col-span-2"><EquityChart data={c.equity} /></Panel>
              <Panel title="Drawdown"><PnlBars data={dd} /></Panel>
              <Panel title="Monthly P&L"><PnlBars data={ts.monthly} /></Panel>
              <Panel title="Daily P&L"><PnlBars data={ts.daily} /></Panel>
              <Panel title="Weekly P&L"><PnlBars data={ts.weekly} /></Panel>
              <Panel title="R-multiple distribution"><CountBars data={rDistribution(trades)} /></Panel>
              <Panel title="Win / loss distribution"><CountBars data={[{ key: "Win", count: c.wins }, { key: "-Loss", count: c.losses }, { key: "0R", count: c.breakeven }]} /></Panel>
              <Panel title="P&L by setup"><PnlBars data={b.setup} horizontal /></Panel>
              <Panel title="P&L by market"><PnlBars data={b.market} horizontal /></Panel>
              <Panel title="P&L by session"><PnlBars data={b.session} horizontal /></Panel>
              <Panel title="P&L by day of week"><PnlBars data={b.dow} /></Panel>
              <Panel title="P&L by time of day"><PnlBars data={b.hour} /></Panel>
              <Panel title="R by ICT entry model"><PnlBars data={b.model} metric="totalR" horizontal /></Panel>
              <Panel title="Avg R by emotion (before)"><PnlBars data={b.emotion} metric="avgR" horizontal /></Panel>
              <Panel title="R by mistake"><PnlBars data={b.mistake} metric="totalR" horizontal /></Panel>
              <Panel title="Recurring patterns"><InsightList items={[...ins.patterns, ...ins.execution]} /></Panel>
              <Panel title="Strengths & leaks"><InsightList items={[...ins.working, ...ins.hurting]} /></Panel>
            </div>
          </>
        )}
      </QueryState>
    </div>
  );
}
