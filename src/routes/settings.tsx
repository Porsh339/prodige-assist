import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Disclaimer, SectionHeader } from "@/components/ui-kit";
import { relativeTime, useSavedOutputs } from "@/lib/saved-outputs";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Meridian Workplace AI" },
      {
        name: "description",
        content:
          "Manage your saved AI outputs, review Meridian's responsible AI policy and control what is stored on your device.",
      },
      { property: "og:title", content: "Settings — Meridian Workplace AI" },
      {
        property: "og:description",
        content: "Manage saved outputs and review Meridian's responsible AI policy.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { items, remove, clear } = useSavedOutputs();

  return (
    <AppShell crumb="Settings">
      <div className="mt-7">
        <SectionHeader
          eyebrow="Settings"
          title="Workspace & data"
          description="Meridian stores generated outputs in this browser only. Nothing is uploaded to a shared account, and clearing them here removes them permanently."
        />
      </div>

      <section className="panel-card mt-6 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg text-paper">Saved outputs</h2>
            <p className="mt-1 text-sm text-fog">
              {items.length} saved on this device (most recent 50 are kept).
            </p>
          </div>
          <button
            onClick={clear}
            disabled={items.length === 0}
            className="rounded-md px-3 py-1.5 text-xs text-mist ring-1 ring-line transition-colors hover:bg-panel2 disabled:opacity-50"
          >
            Clear all
          </button>
        </div>

        <ul className="mt-5 divide-y divide-line">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm text-paper">{item.title}</p>
                <p className="mt-0.5 text-xs text-fog">
                  {item.subtitle} · {relativeTime(item.createdAt)}
                </p>
              </div>
              <button
                onClick={() => remove(item.id)}
                aria-label={`Delete ${item.title}`}
                className="grid size-8 shrink-0 place-items-center rounded-md text-fog ring-1 ring-line hover:text-paper"
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
          {items.length === 0 && (
            <li className="py-6 text-center text-xs text-fog">
              Nothing saved yet. Generated outputs appear here automatically.
            </li>
          )}
        </ul>
      </section>

      <section className="panel-card mt-4 p-5 sm:p-6">
        <h2 className="font-display text-lg text-paper">Responsible AI</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-fog">
          <li>· AI may make errors — every output is a draft, never a final answer.</li>
          <li>· Outputs are not fact-checked or automatically verified.</li>
          <li>· Avoid entering confidential, private, personal or regulated information.</li>
          <li>· Review names, dates, numbers and commitments before you act on them.</li>
          <li>· You remain responsible for any decision made from an output.</li>
        </ul>
        <div className="mt-4">
          <Disclaimer />
        </div>
      </section>
    </AppShell>
  );
}
