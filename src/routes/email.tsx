import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
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
import { generateEmail } from "@/lib/ai.functions";
import { EMAIL_TONES, type EmailTone } from "@/lib/ai-prompts";
import { saveOutput } from "@/lib/saved-outputs";
import type { EmailResult } from "@/lib/types";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Meridian Workplace AI" },
      {
        name: "description",
        content:
          "Turn a recipient, a purpose and a few key points into a polished, editable workplace email in a formal, friendly or persuasive tone.",
      },
      { property: "og:title", content: "Smart Email Generator — Meridian Workplace AI" },
      {
        property: "og:description",
        content: "Draft professional, editable emails from a few key points.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EmailPage,
});

function EmailPage() {
  const run = useServerFn(generateEmail);
  const [recipient, setRecipient] = useState("");
  const [purpose, setPurpose] = useState("");
  const [context, setContext] = useState("");
  const [senderName, setSenderName] = useState("");
  const [tone, setTone] = useState<EmailTone>("Formal");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EmailResult | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  function validate() {
    if (recipient.trim().length < 2) return "Tell us who this email is for.";
    if (purpose.trim().length < 3) return "Add a short purpose for the email.";
    if (context.trim().length < 10)
      return "Add a few key points so the draft has something to work with.";
    if (context.length > 12000) return "That context is too long — trim it down a little.";
    return null;
  }

  async function generate() {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setLoading(true);
    setEditing(false);
    try {
      const res = await run({
        data: { recipient, purpose, context, tone, senderName: senderName.trim() },
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setResult(res.data);
      setDraft(res.data.body);
      saveOutput({
        kind: "email",
        title: res.data.subject,
        subtitle: `Email · ${tone} · to ${recipient}`,
        payload: res.data,
      });
    } catch {
      setError("We couldn't reach the AI service. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const fullText = result
    ? `Subject: ${result.subject}\n\n${editing ? draft : result.body}`
    : "";

  return (
    <AppShell crumb="Email Generator">
      <div className="mt-7">
        <SectionHeader
          eyebrow="Email Generator"
          title="Draft a message worth sending"
          description="Give the recipient, the reason you're writing and your key points. Meridian writes a complete, editable draft in the tone you choose — you review, adjust and send."
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_400px]">
        <section className="panel-card p-5 sm:p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void generate();
            }}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Recipient">
                <input
                  className="field-input mt-1.5"
                  placeholder="Dana Reyes, VP Product"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </Field>
              <Field label="Purpose">
                <input
                  className="field-input mt-1.5"
                  placeholder="Request a timeline review"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field
                  label="Context / key points"
                  hint={`${context.length}/12000 characters`}
                >
                  <textarea
                    rows={5}
                    className="field-input mt-1.5 resize-none"
                    placeholder="The Q3 roadmap slipped two weeks. I need to confirm the revised launch date and flag the QA dependency before Thursday's sync."
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                  />
                </Field>
              </div>
              <Field label="Your name (optional)">
                <input
                  className="field-input mt-1.5"
                  placeholder="Alex Rivera"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                />
              </Field>
              <div className="flex items-end">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="mr-1 text-xs text-fog">Tone</span>
                  {EMAIL_TONES.map((t) => (
                    <Chip key={t} active={tone === t} onClick={() => setTone(t)}>
                      {t}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <GenerateButton
                loading={loading}
                label={result ? "Generate new draft" : "Generate draft"}
                onClick={() => {}}
              />
            </div>
          </form>

          <div className="mt-5">
            {error && <ErrorNotice message={error} onRetry={() => void generate()} />}

            {loading && !error && (
              <div className="rounded-xl bg-ink/50 p-4 ring-1 ring-line">
                <p className="mb-3 text-[11px] uppercase tracking-[0.14em] text-fog">
                  Writing your draft
                </p>
                <LoadingLines lines={5} />
              </div>
            )}

            {!loading && !error && !result && (
              <EmptyState
                title="No draft yet"
                body="Fill in the recipient, purpose and key points, then generate. Your draft appears here with copy, edit and regenerate controls."
              />
            )}

            {!loading && result && (
              <div className="rounded-xl bg-ink/50 p-4 ring-1 ring-line">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-fog">
                    <span className="size-1.5 rounded-full bg-accent" /> Draft output
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <CopyButton getText={() => fullText} />
                    <ToolbarButton
                      icon={editing ? "save" : "edit"}
                      onClick={() => {
                        if (editing) setResult({ ...result, body: draft });
                        setEditing(!editing);
                      }}
                    >
                      {editing ? "Done" : "Edit"}
                    </ToolbarButton>
                    <ToolbarButton icon="regen" onClick={() => void generate()}>
                      Regenerate
                    </ToolbarButton>
                  </div>
                </div>

                <div className="rise-in mt-3 text-sm leading-relaxed text-mist">
                  <p className="font-medium text-paper">Subject: {result.subject}</p>
                  {editing ? (
                    <textarea
                      rows={12}
                      className="field-input mt-3"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                    />
                  ) : (
                    <div className="mt-3 whitespace-pre-wrap">{result.body}</div>
                  )}
                  <p className="mt-4 text-xs text-fog">
                    <span className="text-mist">Call to action:</span> {result.call_to_action}
                  </p>
                </div>

                {result.review_notes.length > 0 && (
                  <ul className="mt-4 space-y-1 border-t border-line pt-3 text-[11px] text-fog">
                    {result.review_notes.map((n, i) => (
                      <li key={i}>· {n}</li>
                    ))}
                  </ul>
                )}

                <div className="mt-4">
                  <Disclaimer />
                </div>
              </div>
            )}
          </div>
        </section>

        <aside className="panel-card h-fit p-5">
          <h2 className="font-display text-base text-paper">How to get a great draft</h2>
          <ol className="mt-3 space-y-2.5 text-sm leading-relaxed text-fog">
            <li>1. Name the recipient and their role — it sets the register.</li>
            <li>2. State one purpose. Two asks in one email dilute both.</li>
            <li>3. Paste rough bullet points; you don't need full sentences.</li>
            <li>4. Pick a tone, generate, then edit in place before copying.</li>
          </ol>
          <div className="mt-5 border-t border-line pt-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-fog">Tone guide</p>
            <ul className="mt-2 space-y-2 text-xs leading-relaxed text-fog">
              <li>
                <span className="text-mist">Formal</span> — clients, executives, external partners.
              </li>
              <li>
                <span className="text-mist">Friendly</span> — teammates and familiar contacts.
              </li>
              <li>
                <span className="text-mist">Persuasive</span> — pitches, proposals and buy-in.
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
