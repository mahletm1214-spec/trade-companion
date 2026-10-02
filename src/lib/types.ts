export type ICTFields = {
  market_structure?: string;
  liquidity_sweep?: boolean;
  buy_side_liquidity?: boolean;
  sell_side_liquidity?: boolean;
  displacement?: boolean;
  fvg?: boolean;
  order_block?: boolean;
  breaker?: boolean;
  mitigation?: boolean;
  premium_discount?: string;
  ote?: boolean;
  judas_swing?: boolean;
  smt?: boolean;
  amd_phase?: string;
  pdh?: boolean; pdl?: boolean; pwh?: boolean; pwl?: boolean;
  asian_high?: boolean; asian_low?: boolean;
  london_high?: boolean; london_low?: boolean;
  ny_high?: boolean; ny_low?: boolean;
};

export type Trade = {
  id: string;
  user_id?: string;
  is_demo: boolean;
  trade_date: string; // YYYY-MM-DD
  trade_time: string | null;
  exit_time: string | null;
  market: string;
  direction: "Long" | "Short";
  entry: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  position_size: number | null;
  risk_pct: number | null;
  risk_usd: number | null;
  result: "Win" | "Loss" | "Breakeven";
  r_multiple: number;
  pnl: number;
  setup: string | null;
  session: string | null;
  killzone: string | null;
  market_condition: string | null;
  htf_bias: string | null;
  entry_model: string | null;
  confluences: string[];
  mistake: string | null;
  followed_plan: boolean | null;
  emotion_before: string | null;
  emotion_during: string | null;
  emotion_after: string | null;
  screenshot_before: string | null;
  screenshot_after: string | null;
  notes: string | null;
  execution_grade: string | null;
  ict: ICTFields;
  created_at?: string;
};

export type Reflection = {
  id?: string;
  reflection_date: string;
  did_well: string | null;
  did_wrong: string | null;
  learned: string | null;
  followed_plan: string | null;
  improve_tomorrow: string | null;
};

export type Settings = {
  account_size: number;
  default_risk_pct: number;
  max_daily_loss: number;
  max_trades_per_day: number;
  max_consecutive_losses: number;
  daily_stop_rule: string;
};

export const DEFAULT_SETTINGS: Settings = {
  account_size: 10000,
  default_risk_pct: 1,
  max_daily_loss: 300,
  max_trades_per_day: 3,
  max_consecutive_losses: 2,
  daily_stop_rule: "",
};

export const OPTIONS = {
  markets: ["NQ", "ES", "YM", "EURUSD", "GBPUSD", "XAUUSD", "BTCUSD"],
  sessions: ["Asia", "London", "New York AM", "New York PM"],
  killzones: ["Asia Killzone", "London Killzone", "New York AM Killzone", "New York PM Killzone", "London Close"],
  setups: ["Silver Bullet", "London Reversal", "NY Continuation", "Turtle Soup", "2022 Model", "Unicorn"],
  entryModels: ["FVG", "Order Block", "Breaker", "OTE", "Mitigation Block", "Inverse FVG"],
  conditions: ["Trending", "Ranging", "Consolidation", "High Volatility", "News"],
  bias: ["Bullish", "Bearish", "Neutral"],
  emotions: ["Calm", "Confident", "Focused", "Anxious", "FOMO", "Impatient", "Greedy", "Fearful", "Frustrated", "Satisfied", "Revenge"],
  mistakes: ["Early entry", "Late entry", "Moved stop", "Chased entry", "Overtrading", "No HTF confirmation", "Oversized", "Revenge trade", "Exited early", "Ignored plan"],
  grades: ["A+", "A", "B", "C", "D", "F"],
  structure: ["Bullish MSS", "Bearish MSS", "Bullish BOS", "Bearish BOS", "Range"],
  pd: ["Premium", "Discount", "Equilibrium"],
  amd: ["Accumulation", "Manipulation", "Distribution"],
  confluences: ["Liquidity Sweep", "FVG", "Displacement", "Order Block", "SMT", "OTE", "Breaker", "Killzone", "HTF PD Array"],
};

export const ICT_BOOL_FIELDS: [keyof ICTFields, string][] = [
  ["liquidity_sweep", "Liquidity Sweep"], ["buy_side_liquidity", "Buy-Side Liquidity"], ["sell_side_liquidity", "Sell-Side Liquidity"],
  ["displacement", "Displacement"], ["fvg", "Fair Value Gap"], ["order_block", "Order Block"], ["breaker", "Breaker"],
  ["mitigation", "Mitigation"], ["ote", "OTE"], ["judas_swing", "Judas Swing"], ["smt", "SMT Divergence"],
  ["pdh", "Previous Day High"], ["pdl", "Previous Day Low"], ["pwh", "Previous Week High"], ["pwl", "Previous Week Low"],
  ["asian_high", "Asian High"], ["asian_low", "Asian Low"], ["london_high", "London High"], ["london_low", "London Low"],
  ["ny_high", "New York High"], ["ny_low", "New York Low"],
];
