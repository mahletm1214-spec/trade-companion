import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/traderos/ui";

export const Route = createFileRoute("/_authenticated/coach")({
  head: () => ({ meta: [{ title: "Coach — TraderOS" }, { name: "description", content: "TraderOS Coach" }, { property: "og:title", content: "Coach — TraderOS" }, { property: "og:description", content: "TraderOS Coach" }] }),
  component: () => (<div><PageHeader title="Coach" /><Panel><p className="text-sm text-muted-foreground">This page is not built yet.</p></Panel></div>),
});
