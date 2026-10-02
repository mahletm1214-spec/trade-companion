// Single source of truth for every metric in TraderOS. Used by the UI and the AI coach server function.
import type { Reflection, Settings, Trade } from "./types";

export const sortChrono = (t: Trade[]) =>
  [...t].sort((a, b) => (a.trade_date + (a.trade_time ?? "")).localeCompare(b.trade_date + (b.trade_time ?? "")));

const sum = (a: number[]) => a.reduce((s, x) => s + x, 0);
const avg = (a: number[]) => (a.length ? sum(a) / a.length : 0);

export type Core = ReturnType<typeof coreStats>;

export function coreStats(trades: Trade[], settings: Settings) {
  const t = sortChrono(trades);
  const wins = t.filter((x) => x.result === "Win");
  const losses = t.filter((x) => x.result === "Loss");
  const be = t.filter((x) => x.result === "Breakeven");
  const netPnl = sum(t.map((x) => Number(x.pnl)));
  const grossWin = sum(wins.map((x) => Number(x.pnl)));
  const grossLoss = Math.abs(sum(losses.map((x) => Number(x.pnl))));
  const decided = wins.length + losses.length;
  const winRate = t.length ? (wins.length / t.length) * 100 : 0;
  const lossRate = t.length ? (losses.length / t.length) * 100 : 0;
  const profitFactor = grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? Infinity : 0;
  const avgWin = avg(wins.map((x) => Number(x.pnl)));
  const avgLoss = avg(losses.map((x) => Number(x.pnl)));
  const avgR = avg(t.map((x) => Number(x.r_multiple)));
  const expectancy = t.length ? netPnl / t.length : 0;

  // equity & drawdown
  let bal = settings.account_size, peak = bal, maxDD = 0, maxDDPct = 0;
  const equity = [{ i: 0, label: "Start", date: "", balance: bal, pnl: 0 }];
  t.forEach((x, i) => {
    bal += Number(x.pnl);
    peak = Math.max(peak, bal);
    const dd = peak - bal;
    if (dd > maxDD) { maxDD = dd; maxDDPct = (dd / peak) * 100; }
    equity.push({ i: i + 1, label: `#${i + 1}`, date: x.trade_date, balance: bal, pnl: Number(x.pnl) });
  });

  // streaks
  let maxW = 0, maxL = 0, cw = 0, cl = 0;
  for (const x of t) {
    if (x.result === "Win") { cw++; cl = 0; } else if (x.result === "Loss") { cl++; cw = 0; } else { cw = 0; cl = 0; }
    maxW = Math.max(maxW, cw); maxL = Math.max(maxL, cl);
  }
  let current = { type: "None" as "Win" | "Loss" | "None", count: 0 };
  for (let i = t.length - 1; i >= 0; i--) {
    const r = t[i].result;
    if (r === "Breakeven") break;
    if (current.type === "None") current = { type: r, count: 1 };
    else if (current.type === r) current.count++;
    else break;
  }

  const holds = t.map(holdMinutes).filter((m): m is number => m !== null);
  const riskPcts = t.map((x) => Number(x.risk_pct)).filter((x) => x > 0);
  const pnls = t.map((x) => Number(x.pnl));

  return {
    total: t.length, wins: wins.length, losses: losses.length, breakeven: be.length, decided,
    netPnl, grossWin, grossLoss, winRate, lossRate, profitFactor, avgWin, avgLoss, avgR, expectancy,
    avgPnl: avg(pnls), largestWin: pnls.length ? Math.max(0, ...pnls) : 0, largestLoss: pnls.length ? Math.min(0, ...pnls) : 0,
    balance: bal, maxDD, maxDDPct, equity, maxConsecWins: maxW, maxConsecLosses: maxL, currentStreak: current,
    avgHoldMin: holds.length ? avg(holds) : null,
    avgRiskPct: riskPcts.length ? avg(riskPcts) : settings.default_risk_pct,
  };
}

export function holdMinutes(t: Trade): number | null {
  if (!t.trade_time || !t.exit_time) return null;
  const toM = (s: string) => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };
  let d = toM(t.exit_time) - toM(t.trade_time);
  if (d < 0) d += 1440;
  return d;
}

export type Group = { key: string; trades: number; wins: number; losses: number; pnl: number; avgR: number; winRate: number; totalR: number };

export function groupBy(trades: Trade[], keyFn: (t: Trade) => string | string[] | null | undefined, order?: string[]): Group[] {
  const map = new Map<string, Trade[]>();
  for (const t of trades) {
    const k = keyFn(t);
    const keys = Array.isArray(k) ? k : [k];
    for (const key of keys) {
      if (key === null || key === undefined || key === "") continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
  }
  const out = [...map.entries()].map(([key, ts]) => {
    const wins = ts.filter((x) => x.result === "Win").length;
    const losses = ts.filter((x) => x.result === "Loss").length;
    const totalR = sum(ts.map((x) => Number(x.r_multiple)));
    return { key, trades: ts.length, wins, losses, pnl: sum(ts.map((x) => Number(x.pnl))), totalR, avgR: totalR / ts.length, winRate: (wins / ts.length) * 100 };
  });
  if (order) return out.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
  return out.sort((a, b) => b.pnl - a.pnl);
}

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const dow = (d: string) => DOW[new Date(d + "T00:00:00").getDay()];
export const weekKey = (d: string) => {
  const dt = new Date(d + "T00:00:00");
  const day = (dt.getDay() + 6) % 7;
  dt.setDate(dt.getDate() - day);
  return dt.toISOString().slice(0, 10);
};

export function timeSeries(trades: Trade[]) {
  const t = sortChrono(trades);
  const daily = groupBy(t, (x) => x.trade_date).sort((a, b) => a.key.localeCompare(b.key));
  const weekly = groupBy(t, (x) => weekKey(x.trade_date)).sort((a, b) => a.key.localeCompare(b.key));
  const monthly = groupBy(t, (x) => x.trade_date.slice(0, 7)).sort((a, b) => a.key.localeCompare(b.key));
  return { daily, weekly, monthly };
}

export function breakdowns(trades: Trade[]) {
  const ICT_MODEL = (t: Trade) => t.entry_model;
  return {
    market: groupBy(trades, (t) => t.market),
    setup: groupBy(trades, (t) => t.setup),
    session: groupBy(trades, (t) => t.session),
    killzone: groupBy(trades, (t) => t.killzone),
    dow: groupBy(trades, (t) => dow(t.trade_date), ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]),
    hour: groupBy(trades, (t) => (t.trade_time ? t.trade_time.slice(0, 2) + ":00" : null)).sort((a, b) => a.key.localeCompare(b.key)),
    model: groupBy(trades, ICT_MODEL),
    emotion: groupBy(trades, (t) => t.emotion_before),
    mistake: groupBy(trades, (t) => t.mistake || "No mistake"),
    direction: groupBy(trades, (t) => t.direction),
    grade: groupBy(trades, (t) => t.execution_grade),
    confluence: groupBy(trades, (t) => t.confluences),
  };
}

export function rDistribution(trades: Trade[]) {
  const buckets = ["≤-2R", "-2R..-1R", "-1R..0", "0R", "0..1R", "1R..2R", "2R..3R", "≥3R"];
  const counts = Object.fromEntries(buckets.map((b) => [b, 0])) as Record<string, number>;
  for (const t of trades) {
    const r = Number(t.r_multiple);
    const b = r <= -2 ? buckets[0] : r < -1 ? buckets[1] : r < 0 ? buckets[2] : r === 0 ? buckets[3] : r < 1 ? buckets[4] : r < 2 ? buckets[5] : r < 3 ? buckets[6] : buckets[7];
    counts[b]++;
  }
  return buckets.map((b) => ({ key: b, count: counts[b] }));
}

export function mode(values: (string | null | undefined)[]) {
  const c = new Map<string, number>();
  for (const v of values) if (v) c.set(v, (c.get(v) ?? 0) + 1);
  let best: string | null = null, n = 0;
  for (const [k, v] of c) if (v > n) { best = k; n = v; }
  return best ? { value: best, count: n } : null;
}

export type Violation = { date: string; rule: string; detail: string };

export function riskViolations(trades: Trade[], s: Settings): Violation[] {
  const out: Violation[] = [];
  const byDay = new Map<string, Trade[]>();
  for (const t of sortChrono(trades)) {
    if (!byDay.has(t.trade_date)) byDay.set(t.trade_date, []);
    byDay.get(t.trade_date)!.push(t);
  }
  for (const [date, ts] of byDay) {
    if (ts.length > s.max_trades_per_day) out.push({ date, rule: "Max trades per day", detail: `${ts.length} trades taken (limit ${s.max_trades_per_day})` });
    const dayPnl = sum(ts.map((x) => Number(x.pnl)));
    if (dayPnl < -Math.abs(s.max_daily_loss)) out.push({ date, rule: "Max daily loss", detail: `Lost ${fmtMoney(dayPnl)} (limit -${fmtMoney(s.max_daily_loss)})` });
    let cl = 0, flagged = false;
    for (let i = 0; i < ts.length; i++) {
      if (ts[i].result === "Loss") cl++; else if (ts[i].result === "Win") cl = 0;
      if (cl >= s.max_consecutive_losses && i < ts.length - 1 && !flagged) {
        out.push({ date, rule: "Consecutive losses / daily stop", detail: `Kept trading after ${cl} consecutive losses` });
        flagged = true;
      }
    }
  }
  for (const t of trades) {
    if (t.risk_pct && Number(t.risk_pct) > s.default_risk_pct * 1.5)
      out.push({ date: t.trade_date, rule: "Oversized risk", detail: `${t.market} risked ${t.risk_pct}% (default ${s.default_risk_pct}%)` });
  }
  return out.sort((a, b) => b.date.localeCompare(a.date));
}

// Rule-based, data-only insights. Each insight cites its sample size.
export type Insight = { title: string; detail: string; tone: "good" | "bad" | "neutral" };

const MIN = 2;

export function deriveInsights(trades: Trade[], s: Settings, reflections: Reflection[] = []) {
  const c = coreStats(trades, s);
  const b = breakdowns(trades);
  const working: Insight[] = [], hurting: Insight[] = [], patterns: Insight[] = [], execution: Insight[] = [], actions: string[] = [];
  const eligible = (g: Group[]) => g.filter((x) => x.trades >= MIN);
  const best = (g: Group[]) => eligible(g).sort((a, b) => b.totalR - a.totalR)[0];
  const worst = (g: Group[]) => eligible(g).sort((a, b) => a.totalR - b.totalR)[0];
  const desc = (g: Group) => `${g.trades} trades, ${g.winRate.toFixed(0)}% win rate, ${g.totalR >= 0 ? "+" : ""}${g.totalR.toFixed(1)}R, ${fmtMoney(g.pnl)}`;

  const pairs: [string, Group[]][] = [["setup", b.setup], ["session", b.session], ["market", b.market], ["entry model", b.model], ["day", b.dow]];
  for (const [label, g] of pairs) {
    const bb = best(g), ww = worst(g);
    if (bb && bb.totalR > 0) working.push({ title: `Best ${label}: ${bb.key}`, detail: desc(bb), tone: "good" });
    if (ww && ww.totalR < 0 && ww.key !== bb?.key) hurting.push({ title: `Worst ${label}: ${ww.key}`, detail: desc(ww), tone: "bad" });
  }
  const mistakes = b.mistake.filter((m) => m.key !== "No mistake").sort((a, b) => a.totalR - b.totalR);
  for (const m of mistakes.slice(0, 3)) hurting.push({ title: `Mistake: ${m.key}`, detail: `Occurred ${m.trades}× — ${m.totalR.toFixed(1)}R, ${fmtMoney(m.pnl)}`, tone: "bad" });
  const clean = b.mistake.find((m) => m.key === "No mistake");
  if (clean && mistakes.length) {
    const mAll = mistakes.reduce((acc, m) => ({ r: acc.r + m.totalR, n: acc.n + m.trades }), { r: 0, n: 0 });
    patterns.push({ title: "Rule-following edge", detail: `Mistake-free trades average ${clean.avgR.toFixed(2)}R (${clean.trades} trades) vs ${(mAll.r / mAll.n).toFixed(2)}R on trades with a logged mistake (${mAll.n} trades).`, tone: clean.avgR > mAll.r / mAll.n ? "good" : "neutral" });
  }
  const emo = eligible(b.emotion).sort((a, b) => a.avgR - b.avgR);
  if (emo.length >= 2) {
    patterns.push({ title: `Emotion: "${emo[emo.length - 1].key}" performs best`, detail: `${desc(emo[emo.length - 1])}. Worst pre-trade state: "${emo[0].key}" (${desc(emo[0])}).`, tone: "neutral" });
  }

  // Overtrading & revenge
  const days = groupBy(trades, (t) => t.trade_date);
  const heavy = days.filter((d) => d.trades > s.max_trades_per_day);
  if (heavy.length) {
    const r = heavy.reduce((a, d) => a + d.totalR, 0);
    patterns.push({ title: "Overtrading days", detail: `${heavy.length} day(s) exceeded ${s.max_trades_per_day} trades, totaling ${r.toFixed(1)}R.`, tone: r < 0 ? "bad" : "neutral" });
  }
  const sorted = sortChrono(trades);
  let afterLoss: Trade[] = [];
  for (let i = 1; i < sorted.length; i++) if (sorted[i - 1].result === "Loss" && sorted[i - 1].trade_date === sorted[i].trade_date) afterLoss.push(sorted[i]);
  const revengeTagged = trades.filter((t) => t.mistake === "Revenge trade" || t.emotion_before === "Revenge");
  afterLoss = [...new Set([...afterLoss, ...revengeTagged])];
  if (afterLoss.length >= MIN) {
    const r = sum(afterLoss.map((x) => Number(x.r_multiple)));
    patterns.push({ title: "Same-day trades after a loss", detail: `${afterLoss.length} trades taken after a loss on the same day (or tagged revenge): ${r.toFixed(1)}R total, ${(afterLoss.filter((x) => x.result === "Win").length / afterLoss.length * 100).toFixed(0)}% win rate.`, tone: r < 0 ? "bad" : "neutral" });
  }

  // Execution
  const grades = b.grade;
  const low = grades.filter((g) => ["C", "D", "F"].includes(g.key));
  const lowN = sum(low.map((g) => g.trades));
  if (lowN) execution.push({ title: "Low execution grades", detail: `${lowN} trades graded C or below — ${sum(low.map((g) => g.totalR)).toFixed(1)}R.`, tone: "bad" });
  const planNo = trades.filter((t) => t.followed_plan === false);
  if (planNo.length) execution.push({ title: "Plan not followed", detail: `${planNo.length} of ${trades.length} trades marked as not following the plan — ${sum(planNo.map((t) => Number(t.r_multiple))).toFixed(1)}R.`, tone: "bad" });
  const smallWins = trades.filter((t) => t.result === "Win" && Number(t.r_multiple) < 1);
  if (smallWins.length >= MIN) execution.push({ title: "Missed opportunities: small winners", detail: `${smallWins.length} winners closed under 1R — possible early exits.`, tone: "neutral" });
  const bigLoss = trades.filter((t) => Number(t.r_multiple) < -1.1);
  if (bigLoss.length) execution.push({ title: "Losses larger than 1R", detail: `${bigLoss.length} trades lost more than planned risk — stop discipline issue.`, tone: "bad" });

  const violations = riskViolations(trades, s);
  if (violations.length) hurting.push({ title: "Risk rule violations", detail: `${violations.length} violation(s) logged. Most recent: ${violations[0].rule} on ${violations[0].date}.`, tone: "bad" });

  // Reflections
  const refl = reflections.filter((r) => r.followed_plan);
  const noPlan = refl.filter((r) => /^no/i.test(r.followed_plan ?? ""));
  if (refl.length) patterns.push({ title: "Reflection journal", detail: `${reflections.length} daily reflection(s); plan not followed on ${noPlan.length} reflected day(s).`, tone: "neutral" });

  // Actions — directly derived
  const ws = worst(b.setup), bs = best(b.setup), wsess = worst(b.session), bsess = best(b.session);
  if (mistakes[0]) actions.push(`Eliminate "${mistakes[0].key}" — it has cost ${mistakes[0].totalR.toFixed(1)}R across ${mistakes[0].trades} trades.`);
  if (ws && ws.totalR < 0) actions.push(`Pause or re-define the "${ws.key}" setup until it is reviewed (${ws.totalR.toFixed(1)}R).`);
  if (bs && bs.totalR > 0) actions.push(`Prioritize "${bs.key}" — your highest-R setup (${bs.totalR.toFixed(1)}R).`);
  if (bsess && wsess && bsess.key !== wsess.key && wsess.totalR < 0) actions.push(`Focus on ${bsess.key}; reduce exposure in ${wsess.key}.`);
  if (heavy.length) actions.push(`Hard cap at ${s.max_trades_per_day} trades/day — enforce the daily stop rule.`);
  if (bigLoss.length) actions.push("Never widen or move the stop; losses must stay at -1R.");

  return { core: c, working, hurting, patterns, execution, actions, violations, enoughData: trades.length >= 5 };
}

export function fmtMoney(n: number, sign = false) {
  const v = Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${n < 0 ? "-" : sign && n > 0 ? "+" : ""}$${v}`;
}
export const fmtR = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(2)}R`;
export const fmtPF = (n: number) => (n === Infinity ? "∞" : n.toFixed(2));
