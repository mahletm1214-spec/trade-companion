import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_SETTINGS, type Reflection, type Settings, type Trade } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

const NUMS = ["entry", "stop_loss", "take_profit", "position_size", "risk_pct", "risk_usd", "r_multiple", "pnl"] as const;
function norm(row: Record<string, unknown>): Trade {
  const t = { ...row } as Record<string, unknown>;
  for (const k of NUMS) t[k] = t[k] === null || t[k] === undefined ? (k === "pnl" || k === "r_multiple" ? 0 : null) : Number(t[k]);
  t.trade_time = t.trade_time ? String(t.trade_time).slice(0, 5) : null;
  t.exit_time = t.exit_time ? String(t.exit_time).slice(0, 5) : null;
  t.confluences = (t.confluences as string[]) ?? [];
  t.ict = (t.ict as object) ?? {};
  return t as unknown as Trade;
}

export function useTrades() {
  return useQuery({
    queryKey: ["trades"],
    queryFn: async (): Promise<Trade[]> => {
      const { data, error } = await db.from("trades").select("*").order("trade_date", { ascending: false }).order("trade_time", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(norm);
    },
  });
}

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async (): Promise<Settings> => {
      const { data, error } = await db.from("trader_settings").select("*").maybeSingle();
      if (error) throw error;
      if (!data) return DEFAULT_SETTINGS;
      return {
        account_size: Number(data.account_size), default_risk_pct: Number(data.default_risk_pct), max_daily_loss: Number(data.max_daily_loss),
        max_trades_per_day: data.max_trades_per_day, max_consecutive_losses: data.max_consecutive_losses, daily_stop_rule: data.daily_stop_rule,
      };
    },
  });
}

export function useReflections() {
  return useQuery({
    queryKey: ["reflections"],
    queryFn: async (): Promise<Reflection[]> => {
      const { data, error } = await db.from("reflections").select("*").order("reflection_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** One-time per-user init: creates settings row + clearly-marked demo trades. */
export function useInitTrader() {
  const qc = useQueryClient();
  useEffect(() => {
    db.rpc("init_trader").then(({ data }: { data: boolean }) => {
      if (data) qc.invalidateQueries();
    });
  }, [qc]);
}

function clean(t: Partial<Trade>) {
  const { id: _id, user_id: _u, created_at: _c, ...rest } = t as Record<string, unknown>;
  for (const k of Object.keys(rest)) if (rest[k] === "") rest[k] = null;
  return rest;
}

export function useTradeMutations() {
  const qc = useQueryClient();
  const done = () => qc.invalidateQueries({ queryKey: ["trades"] });
  const save = useMutation({
    mutationFn: async (t: Partial<Trade>) => {
      const payload = clean(t);
      const q = t.id ? db.from("trades").update(payload).eq("id", t.id) : db.from("trades").insert(payload);
      const { error } = await q;
      if (error) throw error;
    },
    onSuccess: done,
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from("trades").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: done,
  });
  const bulkInsert = useMutation({
    mutationFn: async (rows: Partial<Trade>[]) => {
      if (!rows.length) return;
      const { error } = await db.from("trades").insert(rows.map(clean));
      if (error) throw error;
    },
    onSuccess: done,
  });
  const deleteDemo = useMutation({
    mutationFn: async () => {
      const { error } = await db.from("trades").delete().eq("is_demo", true);
      if (error) throw error;
    },
    onSuccess: done,
  });
  const deleteAll = useMutation({
    mutationFn: async () => {
      const { error } = await db.from("trades").delete().not("id", "is", null);
      if (error) throw error;
    },
    onSuccess: done,
  });
  return { save, remove, bulkInsert, deleteDemo, deleteAll };
}

export function useSaveSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (s: Settings) => {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await db.from("trader_settings").upsert({ ...s, user_id: u.user?.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  });
}

export function useSaveReflection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (r: Reflection) => {
      const { data: u } = await supabase.auth.getUser();
      const { id: _id, ...rest } = r;
      const { error } = await db.from("reflections").upsert({ ...rest, user_id: u.user?.id }, { onConflict: "user_id,reflection_date" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reflections"] }),
  });
}

export async function uploadScreenshot(file: File): Promise<string> {
  const { data: u } = await supabase.auth.getUser();
  const path = `${u.user?.id}/${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, "_")}`;
  const { error } = await supabase.storage.from("screenshots").upload(path, file);
  if (error) throw error;
  return path;
}

export function useScreenshotUrl(path: string | null) {
  return useQuery({
    queryKey: ["shot", path],
    enabled: !!path,
    staleTime: 50 * 60_000,
    queryFn: async () => {
      if (!path) return null;
      if (/^https?:/.test(path)) return path;
      const { data } = await supabase.storage.from("screenshots").createSignedUrl(path, 3600);
      return data?.signedUrl ?? null;
    },
  });
}
