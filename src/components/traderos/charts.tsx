import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";
import type { Group } from "@/lib/stats";
import { fmtMoney } from "@/lib/stats";

const axis = { stroke: "var(--color-muted-foreground)", fontSize: 11, fontFamily: "var(--font-mono)", tickLine: false, axisLine: false };
const tip = {
  contentStyle: { background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 6, fontFamily: "var(--font-mono)", fontSize: 12 },
  labelStyle: { color: "var(--color-muted-foreground)" },
  itemStyle: { color: "var(--color-foreground)" },
  cursor: { fill: "var(--color-accent)", opacity: 0.4 },
};

export function EquityChart({ data, height = 280 }: { data: { label: string; date: string; balance: number }[]; height?: number }) {
  const start = data[0]?.balance ?? 0;
  const up = (data[data.length - 1]?.balance ?? 0) >= start;
  const color = up ? "var(--color-profit)" : "var(--color-loss)";
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="eq" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" {...axis} minTickGap={24} />
        <YAxis {...axis} width={64} domain={["auto", "auto"]} tickFormatter={(v) => `$${Math.round(v).toLocaleString()}`} />
        <ReferenceLine y={start} stroke="var(--color-muted-foreground)" strokeDasharray="4 4" />
        <Tooltip {...tip} formatter={(v: number) => [fmtMoney(v), "Balance"]} labelFormatter={(l, p) => `${l} ${p?.[0]?.payload?.date ?? ""}`} />
        <Area type="monotone" dataKey="balance" stroke={color} strokeWidth={2} fill="url(#eq)" animationDuration={500} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function PnlBars({ data, metric = "pnl", height = 240, horizontal }: { data: Group[]; metric?: "pnl" | "totalR" | "avgR"; height?: number; horizontal?: boolean }) {
  const fmt = (v: number) => (metric === "pnl" ? fmtMoney(v) : `${v.toFixed(2)}R`);
  const h = horizontal ? Math.max(height, data.length * 30 + 20) : height;
  return (
    <ResponsiveContainer width="100%" height={h}>
      <BarChart data={data} layout={horizontal ? "vertical" : "horizontal"} margin={{ left: 0, right: 8, top: 8 }}>
        <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={!!horizontal} horizontal={!horizontal} />
        {horizontal ? (
          <>
            <XAxis type="number" {...axis} tickFormatter={(v) => (metric === "pnl" ? `$${v}` : `${v}R`)} />
            <YAxis type="category" dataKey="key" {...axis} width={110} />
          </>
        ) : (
          <>
            <XAxis dataKey="key" {...axis} minTickGap={8} />
            <YAxis {...axis} width={56} tickFormatter={(v) => (metric === "pnl" ? `$${v}` : `${v}R`)} />
          </>
        )}
        <ReferenceLine {...(horizontal ? { x: 0 } : { y: 0 })} stroke="var(--color-muted-foreground)" />
        <Tooltip {...tip} formatter={(v: number, _n, p) => [fmt(v), `${p.payload.trades} trades · ${p.payload.winRate.toFixed(0)}% WR`]} />
        <Bar dataKey={metric} radius={2} animationDuration={400}>
          {data.map((d, i) => <Cell key={i} fill={d[metric] >= 0 ? "var(--color-profit)" : "var(--color-loss)"} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CountBars({ data, height = 220 }: { data: { key: string; count: number }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
        <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="key" {...axis} />
        <YAxis {...axis} width={32} allowDecimals={false} />
        <Tooltip {...tip} formatter={(v: number) => [v, "Trades"]} />
        <Bar dataKey="count" radius={2} fill="var(--color-chart-3)">
          {data.map((d, i) => <Cell key={i} fill={d.key.startsWith("-") || d.key.startsWith("≤") ? "var(--color-loss)" : d.key === "0R" ? "var(--color-neutral)" : "var(--color-profit)"} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
