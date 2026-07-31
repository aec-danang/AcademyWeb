import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

type CoachMode = "plan" | "language" | "review" | "custom";

const modeInstruction: Record<CoachMode, string> = {
  plan: "Help the student make a short outline. Ask one useful question, then give 3-5 planning bullets. Do not write the response for them.",
  language: "Suggest useful vocabulary, sentence patterns, and connectors appropriate for the stated CEFR level. Give examples, but do not write a complete answer.",
  review: "Review the student's draft. Identify the three highest-impact improvements in task achievement, organisation, grammar, and vocabulary. Quote only short fragments from the draft and do not rewrite it completely.",
  custom: "Answer the student's specific question about this writing task in at most 150 words. Give one priority, a short explanation, and at most one example. Never write the complete submission.",
};

export async function POST(request: Request) {
  const user = await requireUser(["STUDENT"]);
  const body = await request.json() as { assignmentId?: string; draft?: string; mode?: CoachMode; question?: string };
  const assignmentId = String(body.assignmentId || "");
  const draft = String(body.draft || "").slice(0, 12000);
  const mode: CoachMode = ["plan", "language", "review", "custom"].includes(String(body.mode)) ? body.mode as CoachMode : "plan";
  const question = String(body.question || "").trim().slice(0, 1000);
  const assignment = await prisma.assignment.findFirst({
    where: {
      id: assignmentId,
      status: "PUBLISHED",
      OR: [{ skill: "WRITING" }, { type: "WRITING" }],
      classSection: { enrollments: { some: { userId: user.id, status: "ACTIVE" } } },
    },
    select: { title: true, description: true, instructions: true, rubric: true, cefrLevel: true },
  });
  if (!assignment) return NextResponse.json({ error: "Writing assignment not found." }, { status: 404 });
  if (mode === "review" && draft.trim().split(/\s+/).filter(Boolean).length < 20) {
    return NextResponse.json({ error: "Write at least 20 words before requesting a draft review." }, { status: 400 });
  }
  if (mode === "custom" && !question) return NextResponse.json({ error: "Enter a question for the writing coach." }, { status: 400 });

  const endpoint = (process.env.LOCAL_AI_BASE_URL || "http://127.0.0.1:11434").replace(/\/v1\/?$/, "").replace(/\/$/, "");
  const model = process.env.LOCAL_AI_MODEL || "qwen3.5:9b";
  try {
    const response = await fetch(`${endpoint}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(120000),
      body: JSON.stringify({
        model,
        stream: false,
        think: false,
        options: { temperature: 0.3, num_predict: 320 },
        messages: [
          { role: "system", content: "You are a supportive English writing coach inside a school LMS. Protect academic integrity: coach the student, but never produce a complete submission. Use concise, clear English suitable for the learner's level. Return plain text with short headings and bullets." },
          { role: "user", content: `${modeInstruction[mode]}\n${question ? `Student question: ${question}\n` : ""}\nAssignment: ${assignment.title}\nCEFR: ${assignment.cefrLevel || "Not specified"}\nBrief: ${assignment.description || ""}\nInstructions: ${assignment.instructions || ""}\nRubric: ${assignment.rubric || ""}\n\nCurrent student draft:\n${draft || "(not started)"}` },
        ],
      }),
    });
    const result = await response.json() as { message?: { content?: string }; error?: string };
    if (!response.ok || !result.message?.content) throw new Error(result.error || "The local model returned no advice.");
    return NextResponse.json({ advice: result.message.content.trim(), model });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "The local writing coach is unavailable." }, { status: 503 });
  }
}
