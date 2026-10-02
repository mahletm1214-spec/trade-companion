import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ICT_BOOL_FIELDS, type Trade } from "@/lib/types";
import { fmtMoney, fmtR, holdMinutes } from "@/lib/stats";
import { useScreenshotUrl } from "@/lib/data";
import { ResultBadge, Signed } from "./ui";
import { useTradeActions } from "./AppShell";

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="flex justify-between gap-4 border-b border-border/60 py-1.5 text-sm"><span className="text-muted-foreground">{k}</span><span className="num text-right">{v ?? "—"}</span></div>;
}

function Shot({ path, label }: { path: string | null; label: string }) {
  const { data } = useScreenshotUrl(path);
  if (!path) return null;
  return (
    <div>
      <div className="label-caps mb-1">{label}</div>
      {data ? <a href={data} target="_blank" rel="noreferrer"><img src={data} alt={label} className="w-full rounded border" /></a> : <div className="h-24 animate-pulse rounded bg-muted" />}
    </div>
  );
}

export function TradeDetail({ trade, onClose }: { trade: Trade | null; onClose: () => void }) {
  const { edit, duplicate, remove } = useTradeActions();
  const t = trade;
  const hold = t ? holdMinutes(t) : null;
  return (
    <Sheet open={!!t} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        {t && (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <span className="num">{t.market}</span>
                <span className={t.direction === "Long" ? "text-profit" : "text-loss"}>{t.direction}</span>
                <ResultBadge result={t.result} />
                {t.is_demo && <span className="rounded bg-warning/15 px-1.5 py-0.5 text-[10px] text-warning">DEMO</span>}
              </SheetTitle>
            </SheetHeader>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div className="panel p-3"><div className="label-caps">P&L</div><Signed value={t.pnl} className="text-xl font-semibold">{fmtMoney(t.pnl, true)}</Signed></div>
              <div className="panel p-3"><div className="label-caps">R</div><Signed value={t.r_multiple} className="text-xl font-semibold">{fmtR(t.r_multiple)}</Signed></div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => { onClose(); edit(t); }}>Edit</Button>
              <Button size="sm" variant="secondary" onClick={() => { onClose(); duplicate(t); }}>Duplicate</Button>
              <Button size="sm" variant="destructive" onClick={() => { onClose(); remove(t); }}>Delete</Button>
            </div>
            <div className="mt-4">
              <Row k="Date" v={`${t.trade_date} ${t.trade_time ?? ""}`} />
              <Row k="Exit / hold" v={t.exit_time ? `${t.exit_time} · ${hold}m` : null} />
              <Row k="Entry / SL / TP" v={[t.entry, t.stop_loss, t.take_profit].map((x) => x ?? "—").join(" / ")} />
              <Row k="Size" v={t.position_size} />
              <Row k="Risk" v={`${t.risk_pct ?? "—"}% · ${t.risk_usd != null ? fmtMoney(t.risk_usd) : "—"}`} />
              <Row k="Setup" v={t.setup} />
              <Row k="Entry model" v={t.entry_model} />
              <Row k="Session / Killzone" v={[t.session, t.killzone].filter(Boolean).join(" · ") || null} />
              <Row k="Condition / HTF bias" v={[t.market_condition, t.htf_bias].filter(Boolean).join(" · ") || null} />
              <Row k="Structure" v={t.ict?.market_structure} />
              <Row k="Premium/Discount" v={t.ict?.premium_discount} />
              <Row k="AMD" v={t.ict?.amd_phase} />
              <Row k="Grade" v={t.execution_grade} />
              <Row k="Followed plan" v={t.followed_plan === null ? null : t.followed_plan ? "Yes" : "No"} />
              <Row k="Mistake" v={t.mistake ?? "None"} />
              <Row k="Emotions" v={[t.emotion_before, t.emotion_during, t.emotion_after].map((x) => x ?? "—").join(" → ")} />
            </div>
            <div className="mt-4">
              <div className="label-caps mb-1.5">Confluences & ICT</div>
              <div className="flex flex-wrap gap-1">
                {[...t.confluences, ...ICT_BOOL_FIELDS.filter(([k]) => t.ict?.[k]).map(([, l]) => l)].map((c, i) => (
                  <span key={i} className="rounded border px-1.5 py-0.5 text-xs text-muted-foreground">{c}</span>
                ))}
              </div>
            </div>
            {t.notes && <div className="mt-4"><div className="label-caps mb-1">Notes</div><p className="whitespace-pre-wrap text-sm">{t.notes}</p></div>}
            <div className="mt-4 space-y-3 pb-6">
              <Shot path={t.screenshot_before} label="Before" />
              <Shot path={t.screenshot_after} label="After" />
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
