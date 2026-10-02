import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/traderos/ui";

export const Route = createFileRoute("/_authenticated/calendar")({
  head: () => ({ meta: [{ title: "Calendar — TraderOS" }, { name: "description", content: "TraderOS Calendar" }, { property: "og:title", content: "Calendar — TraderOS" }, { property: "og:description", content: "TraderOS Calendar" }] }),
  component: () => (<div><PageHeader title="Calendar" /><Panel><p className="text-sm text-muted-foreground">This page is not built yet.</p></Panel></div>),
});
