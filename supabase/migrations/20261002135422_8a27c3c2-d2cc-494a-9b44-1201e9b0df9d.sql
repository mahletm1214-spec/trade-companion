
CREATE TABLE public.trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  is_demo boolean NOT NULL DEFAULT false,
  trade_date date NOT NULL DEFAULT current_date,
  trade_time time,
  exit_time time,
  market text NOT NULL DEFAULT '',
  direction text NOT NULL DEFAULT 'Long',
  entry numeric, stop_loss numeric, take_profit numeric, position_size numeric,
  risk_pct numeric, risk_usd numeric,
  result text NOT NULL DEFAULT 'Win',
  r_multiple numeric NOT NULL DEFAULT 0,
  pnl numeric NOT NULL DEFAULT 0,
  setup text, session text, killzone text, market_condition text, htf_bias text, entry_model text,
  confluences text[] NOT NULL DEFAULT '{}',
  mistake text, followed_plan boolean,
  emotion_before text, emotion_during text, emotion_after text,
  screenshot_before text, screenshot_after text,
  notes text, execution_grade text,
  ict jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trades TO authenticated;
GRANT ALL ON public.trades TO service_role;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own trades" ON public.trades FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX trades_user_date ON public.trades(user_id, trade_date);

CREATE TABLE public.reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  reflection_date date NOT NULL,
  did_well text, did_wrong text, learned text, followed_plan text, improve_tomorrow text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, reflection_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reflections TO authenticated;
GRANT ALL ON public.reflections TO service_role;
ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own reflections" ON public.reflections FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.trader_settings (
  user_id uuid PRIMARY KEY DEFAULT auth.uid(),
  account_size numeric NOT NULL DEFAULT 10000,
  default_risk_pct numeric NOT NULL DEFAULT 1,
  max_daily_loss numeric NOT NULL DEFAULT 300,
  max_trades_per_day integer NOT NULL DEFAULT 3,
  max_consecutive_losses integer NOT NULL DEFAULT 2,
  daily_stop_rule text NOT NULL DEFAULT 'Stop trading after 2 losses or -3% on the day.',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trader_settings TO authenticated;
GRANT ALL ON public.trader_settings TO service_role;
ALTER TABLE public.trader_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own settings" ON public.trader_settings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE TRIGGER t1 BEFORE UPDATE ON public.trades FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t2 BEFORE UPDATE ON public.reflections FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t3 BEFORE UPDATE ON public.trader_settings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.init_trader() RETURNS boolean
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); i int; d date; res text; r numeric; mk text; st text; ss text; em text; mi text; eb text;
  markets text[] := ARRAY['NQ','ES','EURUSD','GBPUSD','XAUUSD'];
  setups text[] := ARRAY['Silver Bullet','London Reversal','NY Continuation','Turtle Soup','2022 Model'];
  sessions text[] := ARRAY['London','New York AM','New York PM','Asia'];
  models text[] := ARRAY['FVG','Order Block','Breaker','OTE'];
  mistakes text[] := ARRAY[NULL,NULL,'Early entry','Moved stop','Chased entry',NULL,'Overtrading','No HTF confirmation'];
  emos text[] := ARRAY['Calm','Confident','Anxious','FOMO','Calm','Impatient'];
  rs numeric[] := ARRAY[2.1,-1,3,-1,0,1.5,-1,2.4,-1,-1,2,0,-1,3.2,1.8,-1,2.5,-1,-0.5,2];
BEGIN
  IF uid IS NULL THEN RETURN false; END IF;
  IF EXISTS (SELECT 1 FROM trader_settings WHERE user_id = uid) THEN RETURN false; END IF;
  INSERT INTO trader_settings(user_id) VALUES (uid);
  FOR i IN 1..20 LOOP
    d := current_date - ((21 - i) * 1.4)::int;
    WHILE extract(isodow FROM d) > 5 LOOP d := d - 1; END LOOP;
    r := rs[i];
    res := CASE WHEN r > 0 THEN 'Win' WHEN r < 0 THEN 'Loss' ELSE 'Breakeven' END;
    mk := markets[1 + (i % 5)]; st := setups[1 + (i % 5)]; ss := sessions[1 + (i % 4)];
    em := models[1 + (i % 4)]; mi := mistakes[1 + (i % 8)]; eb := emos[1 + (i % 6)];
    INSERT INTO trades(user_id,is_demo,trade_date,trade_time,exit_time,market,direction,entry,stop_loss,take_profit,position_size,risk_pct,risk_usd,result,r_multiple,pnl,setup,session,killzone,market_condition,htf_bias,entry_model,confluences,mistake,followed_plan,emotion_before,emotion_during,emotion_after,notes,execution_grade,ict)
    VALUES (uid,true,d,
      CASE ss WHEN 'London' THEN time '03:15' WHEN 'New York AM' THEN time '09:50' WHEN 'New York PM' THEN time '13:40' ELSE time '20:30' END + (i * interval '4 minutes'),
      CASE ss WHEN 'London' THEN time '04:20' WHEN 'New York AM' THEN time '10:45' WHEN 'New York PM' THEN time '14:30' ELSE time '21:50' END + (i * interval '6 minutes'),
      mk, CASE WHEN i % 3 = 0 THEN 'Short' ELSE 'Long' END,
      100, 99, 102, 1, 1, 100, res, r, r * 100, st, ss, ss || ' Killzone',
      CASE WHEN i % 2 = 0 THEN 'Trending' ELSE 'Ranging' END,
      CASE WHEN i % 3 = 0 THEN 'Bearish' ELSE 'Bullish' END, em,
      ARRAY['Liquidity Sweep','FVG','Displacement'], mi, mi IS NULL, eb,
      CASE WHEN r < 0 THEN 'Anxious' ELSE 'Calm' END, CASE WHEN r < 0 THEN 'Frustrated' ELSE 'Satisfied' END,
      'DEMO trade — sample data for preview.', CASE WHEN mi IS NULL THEN 'A' WHEN r > 0 THEN 'B' ELSE 'C' END,
      jsonb_build_object('market_structure', CASE WHEN i % 3 = 0 THEN 'Bearish MSS' ELSE 'Bullish MSS' END,
        'liquidity_sweep', i % 2 = 0, 'displacement', true, 'fvg', em = 'FVG', 'order_block', em = 'Order Block',
        'breaker', em = 'Breaker', 'ote', em = 'OTE', 'premium_discount', CASE WHEN i % 3 = 0 THEN 'Premium' ELSE 'Discount' END,
        'judas_swing', i % 4 = 0, 'smt', i % 5 = 0, 'amd_phase', 'Distribution'));
  END LOOP;
  RETURN true;
END $$;
GRANT EXECUTE ON FUNCTION public.init_trader() TO authenticated;

CREATE POLICY "read own screenshots" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'screenshots' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "upload own screenshots" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'screenshots' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "delete own screenshots" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'screenshots' AND (storage.foldername(name))[1] = auth.uid()::text);
