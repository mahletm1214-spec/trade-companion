import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/traderos/ui";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — TraderOS" }, { name: "description", content: "TraderOS Profile" }, { property: "og:title", content: "Profile — TraderOS" }, { property: "og:description", content: "TraderOS Profile" }] }),
  component: () => (<div><PageHeader title="Profile" /><Panel><p className="text-sm text-muted-foreground">This page is not built yet.</p></Panel></div>),
});
