import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { AppShell } from "@/components/AppShell";
import {
  CopyButton,
  Disclaimer,
  EmptyState,
  ErrorNotice,
  Field,
  GenerateButton,
  LoadingLines,
  SectionHeader,
  ToolbarButton,
} from "@/components/ui-kit";
import { summarizeMeeting } from "@/lib/ai.functions";
import { saveOutput } from "@/lib/saved-outputs";
import type { MeetingResult } from "@/lib/types";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — Meridian Workplace AI" },
      {
        name: "description",
        content:
          "Paste long meeting notes and get a summary, key discussion points, decisions, action items, deadlines and open questions in seconds.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer — Meridian Workplace AI" },
      {
        property: "og:description",
        content: "Turn messy meeting notes into decisions, action items and deadlines.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MeetingsPage,
});

function toPlainText(r: MeetingResult, title: string) {
  return [
    title ? `Meeting: ${title}` : "Meeting summary",
    "",
    "SUMMARY",
    r.summary,
    "",
    "KEY DISCUSSION POINTS",
    ...r.key_points.map((p) => `- ${p}`),
    "",
    "DECISIONS",
    ...(r.decisions.length ? r.decisions.map((d) => `- ${d}`) : ["- None recorded"]),
    "",
    "ACTION ITEMS",
    ...(r.action_items.length
      ? r.action_items.map((a) => `- ${a.task} (${a.owner}, ${a.due})`)
      : ["- None recorded"]),
    "",
    "DEADLINES",
    ...(r.deadlines.length ? r.deadlines.map((d) => `- ${d.item}: ${d.date}`) : ["- None recorded"]),
    "",
    "OPEN QUESTIONS",
    ...(r.open_questions.length ? r.open_questions.map((q) => `- ${q}`) : ["- None recorded"]),
  ].join("\n");
}

function Block({
  label,
  children,
  empty,
}: {
  label: string;
  children: React.ReactNode;
  empty: boolean;
}) {
  return (
    <div className="border-t border-line pt-4">
      <p className="text-[11px] uppercase tracking-[0.14em] text-fog">{label}</p>
      {empty ? (
        <p className="mt-2 text-sm text-fog/70">Nothing recorded in these notes.</p>
      ) : (
        <div className="mt-2 text-sm leading-relaxed text-mist">{children}</div>
      )}
    </div>
  );
}

function MeetingsPage() {
  const run = useServerFn(summarizeMeeting);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MeetingResult | null>(null);

  async function generate() {
    if (notes.trim().length < 40) {
      setError("Paste a bit more of the meeting notes — at least a few sentences.");
      return;
    }
    if (notes.length > 12000) {
      setError("Those notes are too long. Split them into two runs.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await run({ data: { title: title.trim(), notes } });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setResult(res.data);
      saveOutput({
        kind: "meeting",
        title: title.trim() || "Meeting summary",
        subtitle: `Meeting · ${res.data.action_items.length} action items`,
        payload: res.data,
      });
    } catch {
      setError("We couldn't reach the AI service. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell crumb="Meeting Summarizer">
      <div className="mt-7">
        <SectionHeader
          eyebrow="Meeting Summarizer"
          title="From messy notes to a record you can act on"
          description="Paste raw notes or a rough transcript. Meridian returns a summary plus key points, decisions, owners, deadlines and the questions still open — nothing invented."
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,420px)_1fr]">
        <section className="panel-card h-fit p-5 sm:p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void generate();
            }}
          >
            <Field label="Meeting title (optional)">
              <input
                className="field-input mt-1.5"
                placeholder="Sprint 14 planning"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Field>
            <div className="mt-3">
              <Field label="Meeting notes" hint={`${notes.length}/12000 characters`}>
                <textarea
                  rows={14}
                  className="field-input mt-1.5 resize-none"
                  placeholder="Paste everything — bullet points, half sentences, who said what. Messy is fine."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Field>
            </div>
            <div className="mt-4">
              <GenerateButton
                loading={loading}
                label={result ? "Summarize again" : "Summarize notes"}
                onClick={() => {}}
              />
            </div>
          </form>
        </section>

        <section>
          {error && <ErrorNotice message={error} onRetry={() => void generate()} />}

          {loading && !error && (
            <div className="panel-card p-5">
              <p className="mb-3 text-[11px] uppercase tracking-[0.14em] text-fog">
                Reading your notes
              </p>
              <LoadingLines lines={6} />
            </div>
          )}

          {!loading && !error && !result && (
            <div className="panel-card p-5">
              <EmptyState
                title="No summary yet"
                body="Paste your notes and summarize. You'll get a structured digest with decisions, owners and deadlines you can copy straight into a follow-up."
              />
            </div>
          )}

          {!loading && result && (
            <div className="panel-card rise-in p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-lg text-paper">
                  {title.trim() || "Meeting summary"}
                </h2>
                <div className="flex items-center gap-1.5">
                  <CopyButton getText={() => toPlainText(result, title.trim())} />
                  <ToolbarButton icon="regen" onClick={() => void generate()}>
                    Regenerate
                  </ToolbarButton>
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-mist">{result.summary}</p>

              <div className="mt-5 space-y-4">
                <Block label="Key discussion points" empty={result.key_points.length === 0}>
                  <ul className="space-y-1.5">
                    {result.key_points.map((p, i) => (
                      <li key={i}>· {p}</li>
                    ))}
                  </ul>
                </Block>

                <Block label="Decisions" empty={result.decisions.length === 0}>
                  <ul className="space-y-1.5">
                    {result.decisions.map((d, i) => (
                      <li key={i}>· {d}</li>
                    ))}
                  </ul>
                </Block>

                <Block label="Action items" empty={result.action_items.length === 0}>
                  <ul className="space-y-2">
                    {result.action_items.map((a, i) => (
                      <li key={i} className="rounded-lg bg-ink/50 p-3 ring-1 ring-line">
                        <p className="text-paper">{a.task}</p>
                        <p className="mt-1 text-xs text-fog">
                          {a.owner} · {a.due}
                        </p>
                      </li>
                    ))}
                  </ul>
                </Block>

                <Block label="Deadlines" empty={result.deadlines.length === 0}>
                  <ul className="space-y-1.5">
                    {result.deadlines.map((d, i) => (
                      <li key={i}>
                        · {d.item} — <span className="text-accent">{d.date}</span>
                      </li>
                    ))}
                  </ul>
                </Block>

                <Block label="Open questions" empty={result.open_questions.length === 0}>
                  <ul className="space-y-1.5">
                    {result.open_questions.map((q, i) => (
                      <li key={i}>· {q}</li>
                    ))}
                  </ul>
                </Block>
              </div>

              <div className="mt-5">
                <Disclaimer />
              </div>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
