import { z } from "zod";

/** Project submission fields. Shared by the panel form and the server action. */
const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || /^https:\/\/[^\s]+\.[^\s]+$/i.test(v), "url");

export const submissionSchema = z.object({
  title: z.string().trim().min(1).max(120),
  problem: z.string().trim().min(1).max(300),
  description: z.string().trim().min(1).max(5000),
  repo_url: z
    .string()
    .trim()
    .max(300)
    .refine((v) => /^https:\/\/github\.com\/[A-Za-z0-9-]+\/[A-Za-z0-9._-]+\/?$/.test(v), "github"),
  ai_tools: z.string().trim().min(1).max(1000),
  demo_url: optionalUrl,
  demo_is_local: z.boolean(),
  slides_url: optionalUrl,
});

export type SubmissionInput = z.infer<typeof submissionSchema>;
export type SubmissionField = keyof SubmissionInput;

export const emptySubmission: SubmissionInput = {
  title: "",
  problem: "",
  description: "",
  repo_url: "",
  ai_tools: "",
  demo_url: "",
  demo_is_local: false,
  slides_url: "",
};

/** Maps a zod issue to a short code the forms translate. */
export function issueCode(issue: { code: string; message: string; input?: unknown }): string {
  if (issue.code === "too_big") return "too_long";
  if (issue.code === "custom") return issue.message;
  if (issue.input === "" || issue.input === undefined || (Array.isArray(issue.input) && issue.input.length === 0)) return "required";
  if (issue.code === "too_small") return "required";
  return "invalid";
}

export function fieldErrors(issues: { path: PropertyKey[]; code: string; message: string; input?: unknown }[]) {
  const out: Record<string, string> = {};
  for (const i of issues) {
    const k = String(i.path[0] ?? "_");
    if (!out[k]) out[k] = issueCode(i);
  }
  return out;
}
