# Meridian — AI Workplace Assistant

Meridian is a modern, professional AI productivity workspace built for students,
employees, managers, entrepreneurs and anyone who wants to move faster without
sacrificing polish. Three real, end‑to‑end AI workflows live behind a calm,
focused command‑deck interface — not a chatbot.

> **Responsible AI:** Meridian's outputs may contain mistakes. Always review
> important information before relying on it, and avoid entering confidential,
> private or sensitive data. You remain responsible for every decision you make.

---

## ✨ Features

### 1. Smart Email Generator
Draft ready‑to‑send, editable email from a recipient, purpose, key points and
tone (**Formal**, **Friendly**, **Persuasive**). Each draft ships with a subject
line, body, a single clear call to action and review notes. Copy or Regenerate
in one click.

### 2. Meeting Notes Summarizer
Paste raw, unordered meeting notes and get a skimmable, actionable record:

- Plain‑language summary
- Key discussion points
- Decisions (only things clearly settled)
- Action items with owner and due date
- Deadlines quoted as written
- Open questions and ambiguities

Copy the whole digest as plain text, or Regenerate.

### 3. AI Task Planner / Scheduler
Add tasks with a deadline, urgency and importance. Meridian ranks them using the
Eisenhower matrix, estimates realistic durations and lays them into a
time‑blocked **Daily** or **Weekly** schedule — with breaks, a protected focus
block and a straight‑talking strategy note. Copy or Regenerate.

### Dashboard & Navigation
- Professional dashboard with hero, tool cards, quick actions and a
  productivity overview (emails drafted, meetings summarised, plans built).
- Recent activity feed drawn from your saved outputs.
- Responsive sidebar: **Dashboard · Email Generator · Meeting Summarizer ·
  Task Planner · Settings** — collapses into a mobile drawer on small screens.

### Saved Outputs & Recent Activity
Generated outputs are saved on‑device (local storage, capped at 50) so you can
revisit, copy or clear them from **Settings**. This powers the dashboard's
recent‑activity feed and productivity counts.

---

## 🎨 Design

**"Cinematic Command Deck"** — dark ink surfaces, a warm amber accent, Space
Grotesk for display type and Inter for body. Calm, precise and professional.
All colors are semantic `oklch` design tokens defined in `src/styles.css`; no
hardcoded color utilities are used in components, so theming stays consistent
and dark‑mode safe.

---

## 🧠 How the AI works

Each feature is powered by a **dedicated, structured prompt** following a strict
engineering contract:

`Role · Objective · Context · User Input · Requirements / Constraints · Tone ·
Exact Output Format · Responsible AI instructions`

Outputs are enforced by a **strict JSON schema** (`additionalProperties: false`,
all properties required), so the prompts describe intent and quality rather than
syntax. Inputs are validated with Zod before any call is made.

- **AI provider:** Lovable AI Gateway — `openai/gpt-6-astra` via the
  Responses API with streaming and strict `json_schema` output formatting.
- **Prompts & schemas:** `src/lib/ai-prompts.ts`
- **Server actions:** `src/lib/ai.functions.ts`
- **Gateway client:** `src/lib/gateway.server.ts`

Every screen where output appears shows a responsible‑AI disclaimer.

---

## 🛠 Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | TanStack Start v1 (full‑stack React 19, SSR) |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v4 (native `@theme`, oklch tokens) |
| UI primitives | Radix UI + shadcn-style components |
| Validation | Zod |
| AI | Lovable AI Gateway (`openai/gpt-6-astra`) |
| Language | TypeScript |

---

## 🚀 Getting started

Prerequisites: **Node.js 22+** and npm.

```sh
git clone <your-repository-url>
cd <repository-name>
npm install
npm run dev
```

The dev server starts on `http://localhost:8080`.

### Environment

The AI features read a workspace API key at runtime from the server
environment (`LOVABLE_API_KEY`). When running through Lovable this is provided
automatically; for local runs, supply your own Lovable API key as an
environment variable.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |

---

## 📁 Project structure

```
src/
├── assets/                 # Images (hero, etc.)
├── components/
│   ├── AppShell.tsx        # Sidebar + mobile drawer layout
│   └── ui-kit.tsx          # Disclaimer, fields, buttons, states, chips
├── lib/
│   ├── ai-prompts.ts       # Structured prompts + strict JSON schemas
│   ├── ai.functions.ts     # createServerFn actions (email, meeting, planner)
│   ├── gateway.server.ts   # Lovable AI Gateway streaming client
│   ├── types.ts            # Result & saved-output interfaces
│   ├── saved-outputs.ts    # Local-storage hook + helpers
│   └── utils.ts
├── routes/
│   ├── __root.tsx          # App shell + global head
│   ├── index.tsx           # Dashboard
│   ├── email.tsx           # Smart Email Generator
│   ├── meetings.tsx        # Meeting Notes Summarizer
│   ├── planner.tsx         # AI Task Planner / Scheduler
│   └── settings.tsx        # Saved outputs & responsible-AI policy
├── styles.css              # Meridian design system (oklch tokens)
└── start.ts                # Router + client/server init
```

---

## 🔒 Responsible AI & error handling

- Outputs may be wrong — always review before acting on them.
- Don't enter confidential, private or sensitive information.
- Prompts instruct the model to never invent facts, figures, dates or
  commitments, and to use `[placeholder]` brackets for anything you must fill in.
- Friendly, specific error messages cover empty/invalid/over‑long inputs, AI
  and API failures, rate limits, and unexpected response formats.

---

## ☁️ Deploying

Meridian is a standard TanStack Start app and can be hosted on Lovable or any
Node‑compatible platform. Connect a GitHub repository (see below) and deploy
from your own infrastructure if you prefer.

---

## 📄 License

This project is provided as‑is for your own use.
