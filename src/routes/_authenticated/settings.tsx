import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/traderos/ui";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — TraderOS" }, { name: "description", content: "TraderOS Settings" }, { property: "og:title", content: "Settings — TraderOS" }, { property: "og:description", content: "TraderOS Settings" }] }),
  component: () => (<div><PageHeader title="Settings" /><Panel><p className="text-sm text-muted-foreground">This page is not built yet.</p></Panel></div>),
});
