import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy, Pencil, Trash2 } from "lucide-react";
import { useTrades } from "@/lib/data";
import { fmtMoney, fmtR } from "@/lib/stats";
import { OPTIONS, type Trade } from "@/lib/types";
import { Empty, PageHeader, Panel, ResultBadge, Signed } from "@/components/traderos/ui";
import { QueryState } from "@/components/traderos/insights";
import { useTradeActions } from "@/components/traderos/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/journal")({
  head: () => ({ meta: [{ title: "Trade Journal — TraderOS" }, { name: "description", content: "Log, search, filter and review every ICT trade." }, { property: "og:title", content: "Trade Journal — TraderOS" }, { property: "og:description", content: "Log, search, filter and review every ICT trade." }] }),
  component: Journal,
});

type SortKey = "trade_date" | "market" | "r_multiple" | "pnl";

function F({ value, onChange, opts, label }: { value: string; onChange: (v: string) => void; opts: string[]; label: string }) {
  return (
    <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className="h-9 rounded-md border bg-background px-2 text-sm">
      <option value="">{label}: all</option>
      {opts.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}

function Journal() {
  const { data: trades = [], isLoading, error } = useTrades();
  const { add, edit, duplicate, remove, view } = useTradeActions();
  const [q, setQ] = useState("");
  const [f, setF] = useState({ market: "", setup: "", session: "", result: "", direction: "" });
  const [sort, setSort] = useState<{ k: SortKey; asc: boolean }>({ k: "trade_date", asc: false });

  const uniq = (k: keyof Trade, base: string[] = []) => [...new Set([...base, ...trades.map((t) => t[k] as string).filter(Boolean)])];
  const rows = useMemo(() => {
    const s = q.toLowerCase();
    const out = trades.filter((t) =>
      (!s || [t.market, t.setup, t.session, t.entry_model, t.mistake, t.notes, t.emotion_before].some((v) => v?.toLowerCase().includes(s))) &&
      (Object.keys(f) as (keyof typeof f)[]).every((k) => !f[k] || t[k] === f[k]));
    return out.sort((a, b) => {
      const av = a[sort.k], bv = b[sort.k];
      const r = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv)) || (a.trade_time ?? "").localeCompare(b.trade_time ?? "");
      return sort.asc ? r : -r;
    });
  }, [trades, q, f, sort]);

  const th = (k: SortKey, label: string, cls = "") => (
    <th className={`cursor-pointer select-none py-2 pr-3 font-medium ${cls}`} onClick={() => setSort((s) => ({ k, asc: s.k === k ? !s.asc : false }))}>
      {label}{sort.k === k ? (sort.asc ? " ↑" : " ↓") : ""}
    </th>
  );

  return (
    <div>
      <PageHeader title="Trade Journal" sub={`${rows.length} of ${trades.length} trades`} action={<Button size="sm" onClick={add}>Add trade</Button>} />
      <QueryState isLoading={isLoading} error={error}>
        <Panel>
          <div className="mb-3 flex flex-wrap gap-2">
            <Input placeholder="Search market, setup, notes…" value={q} onChange={(e) => setQ(e.target.value)} className="h-9 w-full sm:w-64" />
            <F label="Market" value={f.market} onChange={(v) => setF({ ...f, market: v })} opts={uniq("market", OPTIONS.markets)} />
            <F label="Setup" value={f.setup} onChange={(v) => setF({ ...f, setup: v })} opts={uniq("setup", OPTIONS.setups)} />
            <F label="Session" value={f.session} onChange={(v) => setF({ ...f, session: v })} opts={uniq("session", OPTIONS.sessions)} />
            <F label="Result" value={f.result} onChange={(v) => setF({ ...f, result: v })} opts={["Win", "Loss", "Breakeven"]} />
            <F label="Direction" value={f.direction} onChange={(v) => setF({ ...f, direction: v })} opts={["Long", "Short"]} />
          </div>
          {!rows.length ? <Empty>{trades.length ? "No trades match these filters." : "No trades yet — click Add trade."}</Empty> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="label-caps border-b"><tr>
                  {th("trade_date", "Date")}{th("market", "Market")}<th className="pr-3">Dir</th><th className="pr-3">Setup</th><th className="pr-3">Session</th><th className="pr-3">Entry / SL / TP</th><th className="pr-3">Result</th>{th("r_multiple", "R", "text-right")}{th("pnl", "P&L", "text-right")}<th />
                </tr></thead>
                <tbody>
                  {rows.map((t) => (
                    <tr key={t.id} className="cursor-pointer border-b border-border/60 hover:bg-accent/40" onClick={() => view(t)}>
                      <td className="num py-2 pr-3 text-muted-foreground">{t.trade_date} {t.trade_time ?? ""}{t.is_demo && <span className="ml-1 rounded bg-warning/15 px-1 text-[10px] text-warning">DEMO</span>}</td>
                      <td className="pr-3 font-medium">{t.market}</td>
                      <td className="pr-3">{t.direction}</td>
                      <td className="pr-3 text-muted-foreground">{t.setup ?? "—"}</td>
                      <td className="pr-3 text-muted-foreground">{t.session ?? "—"}</td>
                      <td className="num pr-3 text-xs text-muted-foreground">{t.entry ?? "—"} / {t.stop_loss ?? "—"} / {t.take_profit ?? "—"}</td>
                      <td className="pr-3"><ResultBadge result={t.result} /></td>
                      <td className="pr-3 text-right"><Signed value={t.r_multiple}>{fmtR(t.r_multiple)}</Signed></td>
                      <td className="pr-3 text-right"><Signed value={t.pnl}>{fmtMoney(t.pnl, true)}</Signed></td>
                      <td className="whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                        <button aria-label="Edit" className="p-1 text-muted-foreground hover:text-foreground" onClick={() => edit(t)}><Pencil className="h-3.5 w-3.5" /></button>
                        <button aria-label="Duplicate" className="p-1 text-muted-foreground hover:text-foreground" onClick={() => duplicate(t)}><Copy className="h-3.5 w-3.5" /></button>
                        <button aria-label="Delete" className="p-1 text-muted-foreground hover:text-loss" onClick={() => remove(t)}><Trash2 className="h-3.5 w-3.5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </QueryState>
    </div>
  );
}
