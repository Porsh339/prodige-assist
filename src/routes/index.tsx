import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarRange, Mail, ListChecks, ArrowRight, Sparkles } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Disclaimer, EmptyState } from "@/components/ui-kit";
import { relativeTime, useSavedOutputs } from "@/lib/saved-outputs";
import heroDesk from "@/assets/hero-desk.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Meridian — AI Workplace Assistant for focused work" },
      {
        name: "description",
        content:
          "Meridian drafts professional emails, turns meeting notes into decisions and action items, and builds a prioritised schedule from your task list.",
      },
      { property: "og:title", content: "Meridian — AI Workplace Assistant" },
      {
        property: "og:description",
        content:
          "Draft emails, summarise meetings and plan your day with one calm, structured workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const TOOLS = [
  {
    to: "/email" as const,
    icon: Mail,
    name: "Email Generator",
    body: "Recipient, purpose and a few key points in — a polished, editable draft out, in the tone you choose.",
    action: "Draft an email",
  },
  {
    to: "/meetings" as const,
    icon: ListChecks,
    name: "Meeting Summarizer",
    body: "Paste raw notes and get a summary, decisions, owners, deadlines and the questions still open.",
    action: "Summarize notes",
  },
  {
    to: "/planner" as const,
    icon: CalendarRange,
    name: "Task Planner",
    body: "Rank tasks by urgency and importance, then lay them out across a realistic daily or weekly schedule.",
    action: "Plan my work",
  },
];

const KIND_LABEL: Record<string, string> = {
  email: "Email",
  meeting: "Meeting",
  planner: "Planner",
};

function Dashboard() {
  const { items } = useSavedOutputs();
  const counts = {
    email: items.filter((i) => i.kind === "email").length,
    meeting: items.filter((i) => i.kind === "meeting").length,
    planner: items.filter((i) => i.kind === "planner").length,
  };

  return (
    <AppShell crumb="Dashboard">
      <section className="panel-card rise-in mt-7 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="p-6 sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-accent ring-1 ring-accent/25">
              <Sparkles className="size-3.5" /> Workplace AI
            </div>
            <h1 className="mt-4 font-display text-3xl font-semibold leading-tight text-paper sm:text-4xl">
              Less admin. More of the work that counts.
            </h1>
            <p className="mt-3 max-w-[58ch] text-sm leading-relaxed text-fog">
              Meridian is a focused assistant for students, professionals and managers. Write the
              email, close out the meeting, and know exactly what to do next — each tool returns
              structured output you can copy, edit and reuse.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                to="/email"
                className="inline-flex items-center gap-2 rounded-[10px] bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
              >
                Draft an email <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/planner"
                className="inline-flex items-center gap-2 rounded-[10px] px-4 py-2.5 text-sm text-mist ring-1 ring-line transition-colors hover:bg-panel2"
              >
                Plan my day
              </Link>
            </div>
          </div>
          <div className="relative hidden min-h-[240px] lg:block">
            <img
              src={heroDesk}
              alt="A calm desk lit by a warm lamp at night"
              className="absolute inset-0 size-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-panel via-panel/40 to-transparent" />
          </div>
        </div>
      </section>

      <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map(({ to, icon: Icon, name, body, action }) => (
          <Link key={to} to={to} className="panel-card group p-5 transition-colors hover:bg-panel2/50">
            <div className="grid size-9 place-items-center rounded-[10px] bg-accent/10 text-accent ring-1 ring-accent/20">
              <Icon className="size-4" />
            </div>
            <h2 className="mt-4 font-display text-base text-paper">{name}</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-fog">{body}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-xs text-accent">
              {action} <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </section>

      <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="panel-card p-5 sm:p-6">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <h2 className="truncate font-display text-base text-paper">Recent activity</h2>
            <Link to="/settings" className="shrink-0 text-xs text-accent">
              View all
            </Link>
          </div>
          <div className="mt-4">
            {items.length === 0 ? (
              <EmptyState
                title="Nothing generated yet"
                body="Outputs you create are kept on this device so you can revisit or copy them later."
              />
            ) : (
              <ul className="space-y-2">
                {items.slice(0, 6).map((item) => (
                  <li
                    key={item.id}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg bg-ink/50 p-3 ring-1 ring-line"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm text-paper">{item.title}</p>
                      <p className="mt-0.5 truncate text-[11px] text-fog">{item.subtitle}</p>
                    </div>
                    <span className="shrink-0 text-[11px] text-fog">
                      {relativeTime(item.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="panel-card p-5 sm:p-6">
          <h2 className="font-display text-base text-paper">Productivity overview</h2>
          <dl className="mt-4 space-y-3">
            {[
              ["Emails drafted", counts.email],
              ["Meetings summarised", counts.meeting],
              ["Plans built", counts.planner],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-line pb-3 last:border-0 last:pb-0"
              >
                <dt className="min-w-0 truncate text-xs text-fog">{label}</dt>
                <dd className="font-display text-xl text-paper">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-[11px] leading-relaxed text-fog">
            {items.length === 0
              ? "Your counts update as you use the tools."
              : `${items.length} saved output${items.length === 1 ? "" : "s"} on this device.`}
          </p>
          <div className="mt-4">
            <Disclaimer />
          </div>
        </div>
      </section>
    </AppShell>
  );
}
