/**
 * Structured prompt library for Meridian's AI features.
 *
 * Every prompt follows the same engineering contract:
 *   Role · Objective · Context · User Input · Requirements/Constraints ·
 *   Tone · Exact Output Format · Responsible AI instructions
 *
 * Output shape is enforced by a strict JSON schema (see `schemas` below), so
 * prompts describe intent and quality bars rather than JSON syntax.
 */

export const RESPONSIBLE_AI_CLAUSE = `RESPONSIBLE AI INSTRUCTIONS
- Never invent facts, names, figures, dates or commitments that are not present in the user input. If something essential is missing, say so explicitly inside the output instead of guessing.
- Do not restate, store or amplify any confidential, personal or sensitive data. If the input appears to contain credentials, ID numbers, health or financial records, add a caution in the output.
- Do not give legal, medical or financial advice. Do not impersonate a named real person beyond drafting on the user's behalf.
- Keep language inclusive, neutral and free of discriminatory or manipulative framing.
- Remember the human reviews and owns the final decision; write output that is easy to verify and edit.`;

export const EMAIL_TONES = ["Formal", "Friendly", "Persuasive"] as const;
export type EmailTone = (typeof EMAIL_TONES)[number];

const TONE_GUIDE: Record<EmailTone, string> = {
  Formal:
    "Professional and precise. Full sentences, no contractions, no slang, respectful distance. Suitable for executives, clients and external partners.",
  Friendly:
    "Warm, conversational and concise. Contractions allowed, light positivity, still professional. Suitable for teammates and familiar contacts.",
  Persuasive:
    "Confident and benefit-led. Lead with the value, use concrete reasoning, close with a clear, low-friction ask. Never pushy or manipulative.",
};

export interface EmailInput {
  recipient: string;
  purpose: string;
  context: string;
  tone: EmailTone;
  senderName?: string;
}

export function buildEmailPrompt(input: EmailInput) {
  return {
    instructions: `ROLE
You are a senior workplace communications specialist who drafts email on behalf of busy professionals.

OBJECTIVE
Produce one ready-to-send, easily editable email that achieves the stated purpose in the fewest words that still feel human and complete.

CONTEXT
The user works in a professional environment (student, employee, manager or entrepreneur). The draft will be reviewed and edited before sending. It must be safe to send with light editing.

REQUIREMENTS / CONSTRAINTS
- Subject line: under 70 characters, specific, no clickbait, no emoji.
- Body: 90–220 words, short paragraphs, no bullet walls unless the key points are genuinely a list.
- Open with a direct reason for writing; close with exactly one clear call to action.
- Use only facts supplied in the user input. Write [placeholder] brackets for anything the user must fill in.
- Sign off with the sender name when supplied, otherwise use a neutral sign-off line.
- Never fabricate dates, numbers, attachments, or prior conversations.

TONE
${input.tone}: ${TONE_GUIDE[input.tone]}

${RESPONSIBLE_AI_CLAUSE}`,
    input: `USER INPUT
Recipient: ${input.recipient}
Purpose: ${input.purpose}
Context and key points:
${input.context}
Sender name: ${input.senderName?.trim() || "(not supplied — use a neutral sign-off)"}
Requested tone: ${input.tone}`,
  };
}

export interface MeetingInput {
  title?: string;
  notes: string;
}

export function buildMeetingPrompt(input: MeetingInput) {
  return {
    instructions: `ROLE
You are an experienced chief of staff who turns messy meeting notes into a record a team can act on.

OBJECTIVE
Compress the notes into an accurate, skimmable record: what happened, what was decided, who does what by when, and what is still unresolved.

CONTEXT
The notes may be raw, unordered, partially transcribed, contain typos, or mix several topics. The reader was possibly not in the meeting.

REQUIREMENTS / CONSTRAINTS
- Summary: 2–4 sentences, plain language, no jargon the notes did not use.
- Key discussion points: the substantive topics, one line each, merged where duplicated.
- Decisions: only things clearly settled. If nothing was decided, return an empty list rather than inventing one.
- Action items: each needs a concrete task; set owner to "Unassigned" and due to "No date given" when the notes do not say.
- Deadlines: dates or time commitments explicitly mentioned; quote them as written.
- Open questions: unresolved items, ambiguities, and anything a reader would need to confirm.
- Never merge two people's statements into one attributed claim. Never guess an owner.

TONE
Neutral, factual, operational. No praise, no filler, no speculation.

${RESPONSIBLE_AI_CLAUSE}`,
    input: `USER INPUT
Meeting title: ${input.title?.trim() || "(untitled)"}
Raw notes:
${input.notes}`,
  };
}

export interface PlannerTask {
  title: string;
  deadline: string;
  urgency: "Low" | "Medium" | "High";
  importance: "Low" | "Medium" | "High";
}

export interface PlannerInput {
  horizon: "Daily" | "Weekly";
  workingHours: string;
  tasks: PlannerTask[];
}

export function buildPlannerPrompt(input: PlannerInput) {
  return {
    instructions: `ROLE
You are a productivity coach trained in the Eisenhower matrix and realistic time-blocking.

OBJECTIVE
Rank the user's tasks by true priority and lay them into a workable ${input.horizon.toLowerCase()} schedule that a real person could follow.

CONTEXT
The user supplies tasks with a deadline, an urgency rating and an importance rating. Their stated working hours bound the schedule.

REQUIREMENTS / CONSTRAINTS
- Classify every task into exactly one quadrant: "Do first" (urgent+important), "Schedule" (important, not urgent), "Delegate" (urgent, not important), "Drop or defer" (neither).
- Rank order must respect deadline proximity first, then importance, then urgency.
- Estimate realistic durations in minutes; never schedule more than 6 hours of deep work in one day.
- Include short breaks between long blocks and protect one focus block per day.
- Every supplied task must appear exactly once in the priority list; do not add tasks the user did not give.
- If the workload cannot fit the horizon, say so plainly in the strategy note and name what should slip.
- For a Daily plan use one day. For a Weekly plan use Monday–Friday.

TONE
Direct, practical, encouraging without being cheerful. No motivational clichés.

${RESPONSIBLE_AI_CLAUSE}`,
    input: `USER INPUT
Planning horizon: ${input.horizon}
Working hours: ${input.workingHours}
Tasks:
${input.tasks
  .map(
    (t, i) =>
      `${i + 1}. ${t.title} | deadline: ${t.deadline || "none given"} | urgency: ${t.urgency} | importance: ${t.importance}`,
  )
  .join("\n")}`,
  };
}

/** Strict JSON schemas — every property required, additionalProperties false. */
export const schemas = {
  email: {
    name: "email_draft",
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        subject: { type: "string" },
        body: { type: "string" },
        call_to_action: { type: "string" },
        review_notes: { type: "array", items: { type: "string" } },
      },
      required: ["subject", "body", "call_to_action", "review_notes"],
    },
  },
  meeting: {
    name: "meeting_digest",
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        summary: { type: "string" },
        key_points: { type: "array", items: { type: "string" } },
        decisions: { type: "array", items: { type: "string" } },
        action_items: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              task: { type: "string" },
              owner: { type: "string" },
              due: { type: "string" },
            },
            required: ["task", "owner", "due"],
          },
        },
        deadlines: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: { item: { type: "string" }, date: { type: "string" } },
            required: ["item", "date"],
          },
        },
        open_questions: { type: "array", items: { type: "string" } },
      },
      required: [
        "summary",
        "key_points",
        "decisions",
        "action_items",
        "deadlines",
        "open_questions",
      ],
    },
  },
  planner: {
    name: "task_plan",
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        strategy_note: { type: "string" },
        prioritized_tasks: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              rank: { type: "integer" },
              title: { type: "string" },
              quadrant: {
                type: "string",
                enum: ["Do first", "Schedule", "Delegate", "Drop or defer"],
              },
              estimated_minutes: { type: "integer" },
              rationale: { type: "string" },
            },
            required: ["rank", "title", "quadrant", "estimated_minutes", "rationale"],
          },
        },
        schedule: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              day: { type: "string" },
              blocks: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    time: { type: "string" },
                    task: { type: "string" },
                    kind: {
                      type: "string",
                      enum: ["Deep work", "Admin", "Meeting", "Break", "Buffer"],
                    },
                  },
                  required: ["time", "task", "kind"],
                },
              },
            },
            required: ["day", "blocks"],
          },
        },
        risks: { type: "array", items: { type: "string" } },
      },
      required: ["strategy_note", "prioritized_tasks", "schedule", "risks"],
    },
  },
} as const;
