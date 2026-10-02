import { createFileRoute } from "@tanstack/react-router";
import { useSettings, useTrades } from "@/lib/data";
import { coreStats, fmtMoney, fmtPF, fmtR } from "@/lib/stats";
import { DEFAULT_SETTINGS } from "@/lib/types";
import { PageHeader, Panel, Stat, toneOf } from "@/components/traderos/ui";
import { EquityChart } from "@/components/traderos/charts";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — TraderOS" }, { name: "description", content: "Your trading performance at a glance." }, { property: "og:title", content: "Dashboard — TraderOS" }, { property: "og:description", content: "Your trading performance at a glance." }] }),
  component: Dashboard,
});

function Dashboard() {
  const { data: trades = [] } = useTrades();
  const { data: s = DEFAULT_SETTINGS } = useSettings();
  const c = coreStats(trades, s);
  return (
    <div>
      <PageHeader title="Dashboard" sub={`${c.total} trades`} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <Stat label="Balance" value={fmtMoney(c.balance)} />
        <Stat label="Net P&L" value={fmtMoney(c.netPnl, true)} tone={toneOf(c.netPnl)} />
        <Stat label="Trades" value={c.total} />
        <Stat label="Win rate" value={`${c.winRate.toFixed(1)}%`} />
        <Stat label="Profit factor" value={fmtPF(c.profitFactor)} />
        <Stat label="Avg R" value={fmtR(c.avgR)} tone={toneOf(c.avgR)} />
        <Stat label="Avg win" value={fmtMoney(c.avgWin)} tone="profit" />
        <Stat label="Avg loss" value={fmtMoney(c.avgLoss)} tone="loss" />
        <Stat label="Wins" value={c.wins} />
        <Stat label="Losses" value={c.losses} />
        <Stat label="Streak" value={`${c.currentStreak.count} ${c.currentStreak.type}`} />
        <Stat label="Max DD" value={fmtMoney(-c.maxDD)} sub={`${c.maxDDPct.toFixed(1)}%`} tone="loss" />
        <Stat label="Risk / trade" value={`${c.avgRiskPct.toFixed(2)}%`} />
      </div>
      <Panel title="Equity curve" className="mt-4"><EquityChart data={c.equity} /></Panel>
    </div>
  );
}
