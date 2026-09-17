export interface EmailResult {
  subject: string;
  body: string;
  call_to_action: string;
  review_notes: string[];
}

export interface MeetingResult {
  summary: string;
  key_points: string[];
  decisions: string[];
  action_items: { task: string; owner: string; due: string }[];
  deadlines: { item: string; date: string }[];
  open_questions: string[];
}

export interface PlannerResult {
  strategy_note: string;
  prioritized_tasks: {
    rank: number;
    title: string;
    quadrant: "Do first" | "Schedule" | "Delegate" | "Drop or defer";
    estimated_minutes: number;
    rationale: string;
  }[];
  schedule: {
    day: string;
    blocks: { time: string; task: string; kind: string }[];
  }[];
  risks: string[];
}

export type OutputKind = "email" | "meeting" | "planner";

export interface SavedOutput {
  id: string;
  kind: OutputKind;
  title: string;
  subtitle: string;
  createdAt: number;
  payload: EmailResult | MeetingResult | PlannerResult;
}
