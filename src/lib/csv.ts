import Papa from "papaparse";
import type { Trade } from "./types";

const COLS: (keyof Trade)[] = [
  "trade_date", "trade_time", "exit_time", "market", "direction", "entry", "stop_loss", "take_profit", "position_size",
  "risk_pct", "risk_usd", "result", "r_multiple", "pnl", "setup", "session", "killzone", "market_condition", "htf_bias",
  "entry_model", "confluences", "mistake", "followed_plan", "emotion_before", "emotion_during", "emotion_after",
  "notes", "execution_grade", "ict", "is_demo",
];

export function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

export function tradesToCsv(trades: Trade[]) {
  return Papa.unparse(trades.map((t) => Object.fromEntries(COLS.map((c) => {
    const v = t[c];
    if (c === "confluences") return [c, (v as string[]).join("|")];
    if (c === "ict") return [c, JSON.stringify(v)];
    return [c, v ?? ""];
  }))));
}

const num = (v: unknown) => (v === "" || v === undefined || v === null || isNaN(Number(v)) ? null : Number(v));

export function csvToTrades(text: string): Partial<Trade>[] {
  const { data } = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true });
  return data.filter((r) => r.trade_date).map((r) => {
    let ict = {};
    try { ict = r.ict ? JSON.parse(r.ict) : {}; } catch { /* ignore */ }
    const r_multiple = num(r.r_multiple) ?? 0;
    return {
      trade_date: r.trade_date, trade_time: r.trade_time || null, exit_time: r.exit_time || null,
      market: r.market ?? "", direction: r.direction === "Short" ? "Short" : "Long",
      entry: num(r.entry), stop_loss: num(r.stop_loss), take_profit: num(r.take_profit), position_size: num(r.position_size),
      risk_pct: num(r.risk_pct), risk_usd: num(r.risk_usd),
      result: (["Win", "Loss", "Breakeven"].includes(r.result) ? r.result : r_multiple > 0 ? "Win" : r_multiple < 0 ? "Loss" : "Breakeven") as Trade["result"],
      r_multiple, pnl: num(r.pnl) ?? 0,
      setup: r.setup || null, session: r.session || null, killzone: r.killzone || null, market_condition: r.market_condition || null,
      htf_bias: r.htf_bias || null, entry_model: r.entry_model || null,
      confluences: r.confluences ? r.confluences.split("|").filter(Boolean) : [],
      mistake: r.mistake || null, followed_plan: r.followed_plan === "true" ? true : r.followed_plan === "false" ? false : null,
      emotion_before: r.emotion_before || null, emotion_during: r.emotion_during || null, emotion_after: r.emotion_after || null,
      notes: r.notes || null, execution_grade: r.execution_grade || null, ict, is_demo: false,
    };
  });
}
