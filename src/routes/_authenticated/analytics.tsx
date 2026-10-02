import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/traderos/ui";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [{ title: "Analytics — TraderOS" }, { name: "description", content: "TraderOS Analytics" }, { property: "og:title", content: "Analytics — TraderOS" }, { property: "og:description", content: "TraderOS Analytics" }] }),
  component: () => (<div><PageHeader title="Analytics" /><Panel><p className="text-sm text-muted-foreground">This page is not built yet.</p></Panel></div>),
});
