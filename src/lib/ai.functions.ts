import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  buildEmailPrompt,
  buildMeetingPrompt,
  buildPlannerPrompt,
  schemas,
} from "./ai-prompts";
import type { EmailResult, MeetingResult, PlannerResult } from "./types";

const MAX_TEXT = 12000;

const emailSchema = z.object({
  recipient: z.string().trim().min(2, "Tell us who this email is for.").max(200),
  purpose: z.string().trim().min(3, "Add a short purpose for the email.").max(300),
  context: z
    .string()
    .trim()
    .min(10, "Add a few key points so the draft has something to work with.")
    .max(MAX_TEXT, "That's too long — trim it down a little."),
  tone: z.enum(["Formal", "Friendly", "Persuasive"]),
  senderName: z.string().trim().max(120).optional(),
});

const meetingSchema = z.object({
  title: z.string().trim().max(200).optional(),
  notes: z
    .string()
    .trim()
    .min(40, "Paste a bit more of the meeting notes — at least a few sentences.")
    .max(MAX_TEXT, "Those notes are too long. Split them into two runs."),
});

const plannerSchema = z.object({
  horizon: z.enum(["Daily", "Weekly"]),
  workingHours: z.string().trim().min(2).max(120),
  tasks: z
    .array(
      z.object({
        title: z.string().trim().min(2, "Each task needs a title.").max(200),
        deadline: z.string().trim().max(80),
        urgency: z.enum(["Low", "Medium", "High"]),
        importance: z.enum(["Low", "Medium", "High"]),
      }),
    )
    .min(1, "Add at least one task.")
    .max(25, "Keep it to 25 tasks per plan."),
});

function toMessage(error: unknown) {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "Please check your input.";
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => emailSchema.parse(data))
  .handler(async ({ data }) => {
    const { callStructured } = await import("./gateway.server");
    const prompt = buildEmailPrompt({ ...data, senderName: data.senderName ?? "" });
    try {
      const result = await callStructured<EmailResult>({ ...prompt, schema: schemas.email });
      return { ok: true as const, data: result };
    } catch (error) {
      return { ok: false as const, error: toMessage(error) };
    }
  });

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => meetingSchema.parse(data))
  .handler(async ({ data }) => {
    const { callStructured } = await import("./gateway.server");
    const prompt = buildMeetingPrompt({ ...data, title: data.title ?? "" });
    try {
      const result = await callStructured<MeetingResult>({ ...prompt, schema: schemas.meeting });
      return { ok: true as const, data: result };
    } catch (error) {
      return { ok: false as const, error: toMessage(error) };
    }
  });

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => plannerSchema.parse(data))
  .handler(async ({ data }) => {
    const { callStructured } = await import("./gateway.server");
    const prompt = buildPlannerPrompt(data);
    try {
      const result = await callStructured<PlannerResult>({ ...prompt, schema: schemas.planner });
      return { ok: true as const, data: result };
    } catch (error) {
      return { ok: false as const, error: toMessage(error) };
    }
  });
