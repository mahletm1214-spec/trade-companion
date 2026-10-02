import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TraderOS — ICT Trading Journal" },
      { name: "description", content: "TraderOS: journal, analytics, calendar and AI coach for ICT traders." },
      { property: "og:title", content: "TraderOS — ICT Trading Journal" },
      { property: "og:description", content: "Journal, analytics, calendar and AI coach for ICT traders." },
    ],
  }),
  beforeLoad: () => { throw redirect({ to: "/dashboard" }); },
});
