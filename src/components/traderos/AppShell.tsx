import { createContext, useContext, useState } from "react";
import { Link, Outlet } from "@tanstack/react-router";
import { toast } from "sonner";
import { LogOut, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useInitTrader, useSettings, useTradeMutations, useTrades } from "@/lib/data";
import type { Trade } from "@/lib/types";
import { TradeForm } from "./TradeForm";
import { TradeDetail } from "./TradeDetail";

type Actions = { add: () => void; edit: (t: Trade) => void; duplicate: (t: Trade) => void; remove: (t: Trade) => void; view: (t: Trade) => void };
const Ctx = createContext<Actions | null>(null);
export const useTradeActions = () => useContext(Ctx)!;

const NAV = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/journal", label: "Journal" },
  { to: "/analytics", label: "Analytics" },
  { to: "/calendar", label: "Calendar" },
  { to: "/coach", label: "AI Coach" },
  { to: "/profile", label: "Profile" },
  { to: "/settings", label: "Settings" },
] as const;

export function AppShell() {
  useInitTrader();
  const { data: settings } = useSettings();
  const { data: trades } = useTrades();
  const { remove } = useTradeMutations();
  const [form, setForm] = useState<{ open: boolean; initial: Partial<Trade> | null }>({ open: false, initial: null });
  const [viewing, setViewing] = useState<Trade | null>(null);
  const [deleting, setDeleting] = useState<Trade | null>(null);
  const demoCount = trades?.filter((t) => t.is_demo).length ?? 0;

  const actions: Actions = {
    add: () => setForm({ open: true, initial: null }),
    edit: (t) => setForm({ open: true, initial: t }),
    duplicate: (t) => { const { id: _i, created_at: _c, ...rest } = t; setForm({ open: true, initial: { ...rest, is_demo: false } }); },
    remove: (t) => setDeleting(t),
    view: (t) => setViewing(t),
  };

  return (
    <Ctx.Provider value={actions}>
      <div className="min-h-screen">
        <header className="sticky top-0 z-40 border-b bg-surface/90 backdrop-blur">
          <div className="mx-auto flex h-12 max-w-[1400px] items-center gap-4 px-3 sm:px-5">
            <Link to="/dashboard" className="flex shrink-0 items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-sm bg-primary" />
              <span className="num text-sm font-semibold tracking-wider">TRADER<span className="text-primary">OS</span></span>
            </Link>
            <nav className="-mx-1 flex flex-1 items-center gap-0.5 overflow-x-auto [scrollbar-width:none]">
              {NAV.map((n) => (
                <Link key={n.to} to={n.to}
                  className="whitespace-nowrap rounded px-2.5 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  activeProps={{ className: "!text-foreground bg-accent" }}>
                  {n.label}
                </Link>
              ))}
            </nav>
            <Button size="sm" onClick={actions.add} className="h-8 shrink-0"><Plus className="h-4 w-4" /><span className="hidden sm:inline">Add trade</span></Button>
            <button aria-label="Sign out" className="text-muted-foreground hover:text-foreground" onClick={() => supabase.auth.signOut()}><LogOut className="h-4 w-4" /></button>
          </div>
        </header>
        {demoCount > 0 && (
          <div className="border-b bg-warning/10 px-4 py-1.5 text-center text-xs text-warning">
            Showing {demoCount} clearly-marked DEMO trades. Remove them anytime in <Link to="/settings" className="underline">Settings</Link>.
          </div>
        )}
        <main className="mx-auto max-w-[1400px] px-3 py-5 sm:px-5">
          <Outlet />
        </main>
      </div>
      {settings && <TradeForm open={form.open} onOpenChange={(o) => setForm((f) => ({ ...f, open: o }))} initial={form.initial} settings={settings} />}
      <TradeDetail trade={viewing} onClose={() => setViewing(null)} />
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete trade?</AlertDialogTitle>
            <AlertDialogDescription>{deleting?.market} on {deleting?.trade_date}. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => { if (deleting) { await remove.mutateAsync(deleting.id); toast.success("Trade deleted"); } setDeleting(null); }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Ctx.Provider>
  );
}
