export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      reflections: {
        Row: {
          created_at: string
          did_well: string | null
          did_wrong: string | null
          followed_plan: string | null
          id: string
          improve_tomorrow: string | null
          learned: string | null
          reflection_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          did_well?: string | null
          did_wrong?: string | null
          followed_plan?: string | null
          id?: string
          improve_tomorrow?: string | null
          learned?: string | null
          reflection_date: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          did_well?: string | null
          did_wrong?: string | null
          followed_plan?: string | null
          id?: string
          improve_tomorrow?: string | null
          learned?: string | null
          reflection_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trader_settings: {
        Row: {
          account_size: number
          created_at: string
          daily_stop_rule: string
          default_risk_pct: number
          max_consecutive_losses: number
          max_daily_loss: number
          max_trades_per_day: number
          updated_at: string
          user_id: string
        }
        Insert: {
          account_size?: number
          created_at?: string
          daily_stop_rule?: string
          default_risk_pct?: number
          max_consecutive_losses?: number
          max_daily_loss?: number
          max_trades_per_day?: number
          updated_at?: string
          user_id?: string
        }
        Update: {
          account_size?: number
          created_at?: string
          daily_stop_rule?: string
          default_risk_pct?: number
          max_consecutive_losses?: number
          max_daily_loss?: number
          max_trades_per_day?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trades: {
        Row: {
          confluences: string[]
          created_at: string
          direction: string
          emotion_after: string | null
          emotion_before: string | null
          emotion_during: string | null
          entry: number | null
          entry_model: string | null
          execution_grade: string | null
          exit_time: string | null
          followed_plan: boolean | null
          htf_bias: string | null
          ict: Json
          id: string
          is_demo: boolean
          killzone: string | null
          market: string
          market_condition: string | null
          mistake: string | null
          notes: string | null
          pnl: number
          position_size: number | null
          r_multiple: number
          result: string
          risk_pct: number | null
          risk_usd: number | null
          screenshot_after: string | null
          screenshot_before: string | null
          session: string | null
          setup: string | null
          stop_loss: number | null
          take_profit: number | null
          trade_date: string
          trade_time: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          confluences?: string[]
          created_at?: string
          direction?: string
          emotion_after?: string | null
          emotion_before?: string | null
          emotion_during?: string | null
          entry?: number | null
          entry_model?: string | null
          execution_grade?: string | null
          exit_time?: string | null
          followed_plan?: boolean | null
          htf_bias?: string | null
          ict?: Json
          id?: string
          is_demo?: boolean
          killzone?: string | null
          market?: string
          market_condition?: string | null
          mistake?: string | null
          notes?: string | null
          pnl?: number
          position_size?: number | null
          r_multiple?: number
          result?: string
          risk_pct?: number | null
          risk_usd?: number | null
          screenshot_after?: string | null
          screenshot_before?: string | null
          session?: string | null
          setup?: string | null
          stop_loss?: number | null
          take_profit?: number | null
          trade_date?: string
          trade_time?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          confluences?: string[]
          created_at?: string
          direction?: string
          emotion_after?: string | null
          emotion_before?: string | null
          emotion_during?: string | null
          entry?: number | null
          entry_model?: string | null
          execution_grade?: string | null
          exit_time?: string | null
          followed_plan?: boolean | null
          htf_bias?: string | null
          ict?: Json
          id?: string
          is_demo?: boolean
          killzone?: string | null
          market?: string
          market_condition?: string | null
          mistake?: string | null
          notes?: string | null
          pnl?: number
          position_size?: number | null
          r_multiple?: number
          result?: string
          risk_pct?: number | null
          risk_usd?: number | null
          screenshot_after?: string | null
          screenshot_before?: string | null
          session?: string | null
          setup?: string | null
          stop_loss?: number | null
          take_profit?: number | null
          trade_date?: string
          trade_time?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      init_trader: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
