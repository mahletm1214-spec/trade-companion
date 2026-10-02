import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/traderos/ui";

export const Route = createFileRoute("/_authenticated/journal")({
  head: () => ({ meta: [{ title: "Journal — TraderOS" }, { name: "description", content: "TraderOS Journal" }, { property: "og:title", content: "Journal — TraderOS" }, { property: "og:description", content: "TraderOS Journal" }] }),
  component: () => (<div><PageHeader title="Journal" /><Panel><p className="text-sm text-muted-foreground">This page is not built yet.</p></Panel></div>),
});
