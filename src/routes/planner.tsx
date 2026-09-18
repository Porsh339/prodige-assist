import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/AppShell";
import {
  Chip,
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
import { planTasks } from "@/lib/ai.functions";
import { saveOutput } from "@/lib/saved-outputs";
import type { PlannerResult } from "@/lib/types";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — Meridian Workplace AI" },
      {
        name: "description",
        content:
          "List your tasks with deadlines, urgency and importance, and get a prioritised daily or weekly schedule you can work through.",
      },
      { property: "og:title", content: "AI Task Planner — Meridian Workplace AI" },
      {
        property: "og:description",
        content: "Turn a messy task list into a prioritised, time-blocked schedule.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlannerPage,
});

type Level = "Low" | "Medium" | "High";
interface TaskRow {
  id: string;
  title: string;
  deadline: string;
  urgency: Level;
  importance: Level;
}

const LEVELS: Level[] = ["Low", "Medium", "High"];

function newRow(): TaskRow {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: "",
    deadline: "",
    urgency: "Medium",
    importance: "Medium",
  };
}

const QUADRANT_STYLE: Record<string, string> = {
  "Do first": "bg-danger/15 text-danger ring-danger/30",
  Schedule: "bg-accent/15 text-accent ring-accent/30",
  Delegate: "bg-panel2 text-mist ring-line",
  "Drop or defer": "bg-panel2 text-fog ring-line",
};

function toPlainText(r: PlannerResult, horizon: string) {
  return [
    `${horizon} plan`,
    "",
    r.strategy_note,
    "",
    "PRIORITISED TASKS",
    ...r.prioritized_tasks.map(
      (t) =>
        `${t.rank}. ${t.title} — ${t.quadrant} · ~${t.estimated_minutes} min\n   ${t.rationale}`,
    ),
    "",
    "SCHEDULE",
    ...r.schedule.flatMap((d) => [
      d.day,
      ...d.blocks.map((b) => `  ${b.time} — ${b.task} (${b.kind})`),
      "",
    ]),
    "RISKS",
    ...(r.risks.length ? r.risks.map((x) => `- ${x}`) : ["- None flagged"]),
  ].join("\n");
}

function PlannerPage() {
  const run = useServerFn(planTasks);
  const [horizon, setHorizon] = useState<"Daily" | "Weekly">("Daily");
  const [workingHours, setWorkingHours] = useState("09:00–17:00, Mon–Fri");
  const [rows, setRows] = useState<TaskRow[]>([newRow()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PlannerResult | null>(null);

  function update(id: string, patch: Partial<TaskRow>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  async function generate() {
    const tasks = rows
      .filter((r) => r.title.trim().length > 1)
      .map((r) => ({
        title: r.title.trim().slice(0, 200),
        deadline: r.deadline.trim().slice(0, 80),
        urgency: r.urgency,
        importance: r.importance,
      }));

    if (tasks.length === 0) {
      setError("Add at least one task with a title before planning.");
      return;
    }
    if (tasks.length > 25) {
      setError("Keep it to 25 tasks per plan — split the rest into a second plan.");
      return;
    }
    if (workingHours.trim().length < 2) {
      setError("Tell us roughly when you work, e.g. 09:00–17:00.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const res = await run({
        data: { horizon, workingHours: workingHours.trim(), tasks },
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setResult(res.data);
      saveOutput({
        kind: "planner",
        title: `${horizon} plan · ${tasks.length} tasks`,
        subtitle: `Planner · ${res.data.schedule.length} day${
          res.data.schedule.length === 1 ? "" : "s"
        } scheduled`,
        payload: res.data,
      });
    } catch {
      setError("We couldn't reach the AI service. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell crumb="Task Planner">
      <div className="mt-7">
        <SectionHeader
          eyebrow="Task Planner"
          title="Decide what actually gets done today"
          description="List your tasks with deadlines and how urgent and important each one is. Meridian ranks them, estimates effort and lays out a realistic schedule around your working hours."
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,480px)_1fr]">
        <section className="panel-card h-fit p-5 sm:p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void generate();
            }}
          >
            <p className="text-xs text-fog">Plan horizon</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["Daily", "Weekly"] as const).map((h) => (
                <Chip key={h} active={horizon === h} onClick={() => setHorizon(h)}>
                  {h}
                </Chip>
              ))}
            </div>

            <div className="mt-4">
              <Field label="Working hours" hint="Used to keep the schedule realistic.">
                <input
                  className="field-input mt-1.5"
                  placeholder="09:00–17:00, Mon–Fri"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                />
              </Field>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="text-xs text-fog">Tasks ({rows.length})</p>
              <button
                type="button"
                onClick={() => setRows((p) => [...p, newRow()])}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-mist ring-1 ring-line transition-colors hover:bg-panel2"
              >
                <Plus className="size-3.5" /> Add task
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {rows.map((r, i) => (
                <div key={r.id} className="rounded-xl bg-ink/50 p-3 ring-1 ring-line">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                    <input
                      className="field-input"
                      placeholder={i === 0 ? "Finish Q3 budget draft" : "Task title"}
                      value={r.title}
                      onChange={(e) => update(r.id, { title: e.target.value })}
                    />
                    <button
                      type="button"
                      aria-label="Remove task"
                      onClick={() =>
                        setRows((p) => (p.length === 1 ? [newRow()] : p.filter((x) => x.id !== r.id)))
                      }
                      className="grid size-9 shrink-0 place-items-center rounded-lg text-fog ring-1 ring-line transition-colors hover:text-paper"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>

                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <label className="block">
                      <span className="text-[11px] text-fog">Deadline</span>
                      <input
                        className="field-input mt-1"
                        placeholder="Fri 5pm"
                        value={r.deadline}
                        onChange={(e) => update(r.id, { deadline: e.target.value })}
                      />
                    </label>
                    <label className="block">
                      <span className="text-[11px] text-fog">Urgency</span>
                      <select
                        className="field-input mt-1"
                        value={r.urgency}
                        onChange={(e) => update(r.id, { urgency: e.target.value as Level })}
                      >
                        {LEVELS.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-[11px] text-fog">Importance</span>
                      <select
                        className="field-input mt-1"
                        value={r.importance}
                        onChange={(e) => update(r.id, { importance: e.target.value as Level })}
                      >
                        {LEVELS.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <GenerateButton
                loading={loading}
                label={result ? "Re-plan tasks" : "Build my plan"}
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
                Sequencing your work
              </p>
              <LoadingLines lines={6} />
            </div>
          )}

          {!loading && !error && !result && (
            <div className="panel-card p-5">
              <EmptyState
                title="No plan yet"
                body="Add your tasks on the left with deadlines, urgency and importance. You'll get a ranked list and a time-blocked schedule you can copy into your calendar."
              />
            </div>
          )}

          {!loading && result && (
            <div className="panel-card rise-in p-5 sm:p-6">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <h2 className="truncate font-display text-lg text-paper">{horizon} plan</h2>
                <div className="flex shrink-0 items-center gap-1.5">
                  <CopyButton getText={() => toPlainText(result, horizon)} />
                  <ToolbarButton icon="regen" onClick={() => void generate()}>
                    Regenerate
                  </ToolbarButton>
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-mist">{result.strategy_note}</p>

              <div className="mt-5 border-t border-line pt-4">
                <p className="text-[11px] uppercase tracking-[0.14em] text-fog">
                  Prioritised tasks
                </p>
                <ol className="mt-3 space-y-2">
                  {result.prioritized_tasks.map((t) => (
                    <li key={t.rank} className="rounded-lg bg-ink/50 p-3 ring-1 ring-line">
                      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
                        <span className="grid size-6 shrink-0 place-items-center rounded-md bg-panel2 font-display text-[11px] text-paper">
                          {t.rank}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm text-paper">{t.title}</p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] ring-1 ${
                                QUADRANT_STYLE[t.quadrant] ?? "bg-panel2 text-mist ring-line"
                              }`}
                            >
                              {t.quadrant}
                            </span>
                            <span className="text-[11px] text-fog">
                              ~{t.estimated_minutes} min
                            </span>
                          </div>
                          <p className="mt-1.5 text-xs leading-relaxed text-fog">{t.rationale}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-5 border-t border-line pt-4">
                <p className="text-[11px] uppercase tracking-[0.14em] text-fog">Schedule</p>
                <div className="mt-3 space-y-4">
                  {result.schedule.map((day) => (
                    <div key={day.day}>
                      <p className="font-display text-sm text-paper">{day.day}</p>
                      <ul className="mt-2 space-y-1.5">
                        {day.blocks.map((b, i) => (
                          <li
                            key={i}
                            className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 border-l border-line py-1 pl-3 text-sm"
                          >
                            <span className="shrink-0 font-mono text-xs text-accent">{b.time}</span>
                            <span className="min-w-0 text-mist">
                              {b.task}
                              <span className="ml-1.5 text-[11px] text-fog">({b.kind})</span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {result.risks.length > 0 && (
                <div className="mt-5 border-t border-line pt-4">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-fog">Watch out for</p>
                  <ul className="mt-2 space-y-1.5 text-sm text-mist">
                    {result.risks.map((r, i) => (
                      <li key={i}>· {r}</li>
                    ))}
                  </ul>
                </div>
              )}

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
