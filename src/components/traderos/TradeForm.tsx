import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ICT_BOOL_FIELDS, OPTIONS, type Settings, type Trade, type ICTFields } from "@/lib/types";
import { uploadScreenshot, useTradeMutations } from "@/lib/data";

type Draft = Partial<Trade>;

export function blankTrade(s: Settings): Draft {
  const now = new Date();
  return {
    trade_date: now.toISOString().slice(0, 10), trade_time: now.toTimeString().slice(0, 5), exit_time: null,
    market: "NQ", direction: "Long", result: "Win", r_multiple: 0, pnl: 0,
    risk_pct: s.default_risk_pct, risk_usd: +((s.account_size * s.default_risk_pct) / 100).toFixed(2),
    confluences: [], ict: {}, is_demo: false, followed_plan: true,
  };
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return <div className={cn("space-y-1", className)}><Label className="label-caps">{label}</Label>{children}</div>;
}

function Sel({ value, onChange, options, placeholder = "—" }: { value: string | null | undefined; onChange: (v: string | null) => void; options: string[]; placeholder?: string }) {
  return (
    <select value={value ?? ""} onChange={(e) => onChange(e.target.value || null)}
      className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={cn("rounded border px-2 py-1 text-xs transition-colors", on ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground")}>
      {children}
    </button>
  );
}

function Seg<T extends string>({ value, options, onChange }: { value: T | undefined; options: T[]; onChange: (v: T) => void }) {
  return (
    <div className="flex rounded-md border border-input p-0.5">
      {options.map((o) => (
        <button key={o} type="button" onClick={() => onChange(o)}
          className={cn("flex-1 rounded px-2 py-1 text-xs font-medium transition-colors", value === o ? "bg-accent text-foreground" : "text-muted-foreground")}>{o}</button>
      ))}
    </div>
  );
}

export function TradeForm({ open, onOpenChange, initial, settings }: { open: boolean; onOpenChange: (o: boolean) => void; initial: Draft | null; settings: Settings }) {
  const [t, setT] = useState<Draft>(initial ?? blankTrade(settings));
  const [pnlManual, setPnlManual] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const { save } = useTradeMutations();

  useEffect(() => { if (open) { setT(initial ?? blankTrade(settings)); setPnlManual(!!initial?.id); } }, [open, initial, settings]);

  const set = <K extends keyof Trade>(k: K, v: Trade[K] | null) => setT((p) => ({ ...p, [k]: v }));
  const setIct = <K extends keyof ICTFields>(k: K, v: ICTFields[K]) => setT((p) => ({ ...p, ict: { ...(p.ict ?? {}), [k]: v } }));
  const n = (v: string) => (v === "" ? null : Number(v));

  // auto-derived values
  function setRisk(pct: number | null) {
    setT((p) => ({ ...p, risk_pct: pct, risk_usd: pct ? +((settings.account_size * pct) / 100).toFixed(2) : p.risk_usd }));
  }
  function setR(r: number | null) {
    setT((p) => {
      const rr = r ?? 0;
      const result = rr > 0 ? "Win" : rr < 0 ? "Loss" : "Breakeven";
      return { ...p, r_multiple: rr, result, pnl: pnlManual ? p.pnl : +(rr * Number(p.risk_usd ?? 0)).toFixed(2) };
    });
  }
  const plannedRR = t.entry && t.stop_loss && t.take_profit && t.entry !== t.stop_loss
    ? Math.abs((t.take_profit - t.entry) / (t.entry - t.stop_loss)) : null;

  async function onFile(k: "screenshot_before" | "screenshot_after", f?: File) {
    if (!f) return;
    setUploading(k);
    try { set(k, await uploadScreenshot(f)); toast.success("Screenshot uploaded"); }
    catch (e) { toast.error((e as Error).message); }
    finally { setUploading(null); }
  }

  async function submit() {
    if (!t.trade_date || !t.market) return toast.error("Date and market are required");
    try {
      await save.mutateAsync({ ...t, is_demo: t.id ? t.is_demo : false });
      toast.success(t.id ? "Trade updated" : "Trade saved");
      onOpenChange(false);
    } catch (e) { toast.error((e as Error).message); }
  }

  const ict = t.ict ?? {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto p-0">
        <DialogHeader className="border-b px-5 py-3.5">
          <DialogTitle className="text-base">{t.id ? "Edit trade" : "New trade"}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="exec" className="px-5 pb-5">
          <TabsList className="mb-4 grid w-full grid-cols-4">
            <TabsTrigger value="exec">Execution</TabsTrigger>
            <TabsTrigger value="ict">ICT</TabsTrigger>
            <TabsTrigger value="psych">Psychology</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="exec" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="Date"><Input type="date" value={t.trade_date ?? ""} onChange={(e) => set("trade_date", e.target.value)} /></Field>
            <Field label="Entry time"><Input type="time" value={t.trade_time ?? ""} onChange={(e) => set("trade_time", e.target.value || null)} /></Field>
            <Field label="Exit time"><Input type="time" value={t.exit_time ?? ""} onChange={(e) => set("exit_time", e.target.value || null)} /></Field>
            <Field label="Market">
              <Input list="markets" value={t.market ?? ""} onChange={(e) => set("market", e.target.value.toUpperCase())} />
              <datalist id="markets">{OPTIONS.markets.map((m) => <option key={m} value={m} />)}</datalist>
            </Field>
            <Field label="Direction" className="col-span-2"><Seg value={t.direction} options={["Long", "Short"]} onChange={(v) => set("direction", v)} /></Field>
            <Field label="Result" className="col-span-2"><Seg value={t.result} options={["Win", "Loss", "Breakeven"]} onChange={(v) => set("result", v)} /></Field>
            <Field label="Entry"><Input type="number" step="any" className="num" value={t.entry ?? ""} onChange={(e) => set("entry", n(e.target.value))} /></Field>
            <Field label="Stop loss"><Input type="number" step="any" className="num" value={t.stop_loss ?? ""} onChange={(e) => set("stop_loss", n(e.target.value))} /></Field>
            <Field label="Take profit"><Input type="number" step="any" className="num" value={t.take_profit ?? ""} onChange={(e) => set("take_profit", n(e.target.value))} /></Field>
            <Field label="Position size"><Input type="number" step="any" className="num" value={t.position_size ?? ""} onChange={(e) => set("position_size", n(e.target.value))} /></Field>
            <Field label="Risk %"><Input type="number" step="any" className="num" value={t.risk_pct ?? ""} onChange={(e) => setRisk(n(e.target.value))} /></Field>
            <Field label="Risk $"><Input type="number" step="any" className="num" value={t.risk_usd ?? ""} onChange={(e) => set("risk_usd", n(e.target.value))} /></Field>
            <Field label="R multiple"><Input type="number" step="any" className="num" value={t.r_multiple ?? ""} onChange={(e) => setR(n(e.target.value))} /></Field>
            <Field label="P&L $"><Input type="number" step="any" className="num" value={t.pnl ?? ""} onChange={(e) => { setPnlManual(true); set("pnl", n(e.target.value) ?? 0); }} /></Field>
            <p className="col-span-full text-xs text-muted-foreground">
              Risk $ follows Risk % × account size. P&L auto-fills from R × Risk $ until edited.
              {plannedRR !== null && <> Planned R:R <span className="num text-foreground">{plannedRR.toFixed(2)}</span>.</>}
            </p>
            <Field label="Setup"><Sel value={t.setup} onChange={(v) => set("setup", v)} options={OPTIONS.setups} /></Field>
            <Field label="Entry model"><Sel value={t.entry_model} onChange={(v) => set("entry_model", v)} options={OPTIONS.entryModels} /></Field>
            <Field label="Session"><Sel value={t.session} onChange={(v) => set("session", v)} options={OPTIONS.sessions} /></Field>
            <Field label="Killzone"><Sel value={t.killzone} onChange={(v) => set("killzone", v)} options={OPTIONS.killzones} /></Field>
            <Field label="Market condition"><Sel value={t.market_condition} onChange={(v) => set("market_condition", v)} options={OPTIONS.conditions} /></Field>
            <Field label="HTF bias"><Sel value={t.htf_bias} onChange={(v) => set("htf_bias", v)} options={OPTIONS.bias} /></Field>
            <Field label="Execution grade"><Sel value={t.execution_grade} onChange={(v) => set("execution_grade", v)} options={OPTIONS.grades} /></Field>
            <Field label="Followed plan"><Seg value={t.followed_plan === false ? "No" : "Yes"} options={["Yes", "No"]} onChange={(v) => set("followed_plan", v === "Yes")} /></Field>
            <Field label="Confluences" className="col-span-full">
              <div className="flex flex-wrap gap-1.5">
                {OPTIONS.confluences.map((c) => {
                  const on = (t.confluences ?? []).includes(c);
                  return <Chip key={c} on={on} onClick={() => set("confluences", on ? t.confluences!.filter((x) => x !== c) : [...(t.confluences ?? []), c])}>{c}</Chip>;
                })}
              </div>
            </Field>
          </TabsContent>

          <TabsContent value="ict" className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Market structure"><Sel value={ict.market_structure} onChange={(v) => setIct("market_structure", v ?? undefined)} options={OPTIONS.structure} /></Field>
              <Field label="Premium / Discount"><Sel value={ict.premium_discount} onChange={(v) => setIct("premium_discount", v ?? undefined)} options={OPTIONS.pd} /></Field>
              <Field label="AMD / Power of 3"><Sel value={ict.amd_phase} onChange={(v) => setIct("amd_phase", v ?? undefined)} options={OPTIONS.amd} /></Field>
            </div>
            <Field label="Concepts & liquidity levels present">
              <div className="flex flex-wrap gap-1.5">
                {ICT_BOOL_FIELDS.map(([k, l]) => <Chip key={k} on={!!ict[k]} onClick={() => setIct(k, !ict[k] as never)}>{l}</Chip>)}
              </div>
            </Field>
          </TabsContent>

          <TabsContent value="psych" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Emotion before"><Sel value={t.emotion_before} onChange={(v) => set("emotion_before", v)} options={OPTIONS.emotions} /></Field>
            <Field label="Emotion during"><Sel value={t.emotion_during} onChange={(v) => set("emotion_during", v)} options={OPTIONS.emotions} /></Field>
            <Field label="Emotion after"><Sel value={t.emotion_after} onChange={(v) => set("emotion_after", v)} options={OPTIONS.emotions} /></Field>
            <Field label="Mistake" className="sm:col-span-3"><Sel value={t.mistake} onChange={(v) => set("mistake", v)} options={OPTIONS.mistakes} placeholder="No mistake" /></Field>
          </TabsContent>

          <TabsContent value="notes" className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {(["screenshot_before", "screenshot_after"] as const).map((k) => (
                <Field key={k} label={k === "screenshot_before" ? "Screenshot before" : "Screenshot after"}>
                  <Input type="file" accept="image/*" onChange={(e) => onFile(k, e.target.files?.[0])} />
                  <div className="text-xs text-muted-foreground">{uploading === k ? "Uploading…" : t[k] ? "✓ Attached" : "None"}</div>
                </Field>
              ))}
            </div>
            <Field label="Trade notes"><Textarea rows={6} value={t.notes ?? ""} onChange={(e) => set("notes", e.target.value)} /></Field>
          </TabsContent>
        </Tabs>
        <div className="sticky bottom-0 flex justify-end gap-2 border-t bg-card px-5 py-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={save.isPending || !!uploading}>{save.isPending ? "Saving…" : "Save trade"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
