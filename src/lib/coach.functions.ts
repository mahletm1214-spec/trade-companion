import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { breakdowns, deriveInsights, timeSeries } from "./stats";
import { DEFAULT_SETTINGS, type Reflection, type Settings, type Trade } from "./types";

export const analyzeJournal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = context.supabase as any;
    const [{ data: tr }, { data: rf }, { data: st }] = await Promise.all([
      sb.from("trades").select("*"),
      sb.from("reflections").select("*").order("reflection_date", { ascending: false }).limit(30),
      sb.from("trader_settings").select("*").maybeSingle(),
    ]);
    const trades: Trade[] = (tr ?? []).map((t: Record<string, unknown>) => ({
      ...t, pnl: Number(t.pnl), r_multiple: Number(t.r_multiple), risk_pct: t.risk_pct == null ? null : Number(t.risk_pct),
      trade_time: t.trade_time ? String(t.trade_time).slice(0, 5) : null, exit_time: t.exit_time ? String(t.exit_time).slice(0, 5) : null,
    }));
    if (trades.length < 5) return { markdown: null as string | null, tradeCount: trades.length };
    const settings: Settings = st ? { ...DEFAULT_SETTINGS, ...st, account_size: Number(st.account_size), default_risk_pct: Number(st.default_risk_pct), max_daily_loss: Number(st.max_daily_loss) } : DEFAULT_SETTINGS;
    const ins = deriveInsights(trades, settings, (rf ?? []) as Reflection[]);
    const { equity: _e, ...core } = ins.core;
    const b = breakdowns(trades);
    const ts = timeSeries(trades);
    const data = {
      settings, core, breakdowns: b, weekly: ts.weekly, violations: ins.violations.slice(0, 20),
      rule_based_findings: { working: ins.working, hurting: ins.hurting, patterns: ins.patterns, execution: ins.execution },
      reflections: rf ?? [],
      recent_trades: [...trades].sort((a, z) => z.trade_date.localeCompare(a.trade_date)).slice(0, 25).map((t) => ({
        date: t.trade_date, time: t.trade_time, market: t.market, dir: t.direction, setup: t.setup, session: t.session, model: t.entry_model,
        result: t.result, r: t.r_multiple, pnl: t.pnl, mistake: t.mistake, emo: [t.emotion_before, t.emotion_during, t.emotion_after], grade: t.execution_grade, plan: t.followed_plan, notes: t.notes,
      })),
    };
    const system = `You are TraderOS Coach, a strict, concise ICT trading performance coach.
RULES: Use ONLY the JSON data provided. Never invent trades, numbers, setups, or events. Every claim must cite a figure from the data (sample size, R, $, win rate). If evidence is thin (fewer than 3 trades in a group), say so. Do not use personality labels.
Output Markdown with exactly these H2 sections in order: "What's Working", "What Is Hurting Performance", "Recurring Pattern", "Execution Problem", "Action Plan". Cover where data allows: repeated mistakes, best/worst setups and sessions, emotional patterns, overtrading, revenge trading, risk management, execution, missed opportunities, and reflections. Action Plan: 3-5 numbered, specific, measurable rules. Keep under 450 words.`;
    const markdown = await (await import("./coach.server")).runCoach(`Journal data:\n${JSON.stringify(data)}`, system);
    return { markdown, tradeCount: trades.length };
  });
