import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

function xml(value: string | null | undefined) {
  return (value || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

export async function GET(_request: Request, { params }: { params: Promise<{ quizId: string }> }) {
  const user = await requireUser(["TEACHER", "ADMIN"]);
  const { quizId } = await params;
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, isPracticeTest: true, ...(user.role === "TEACHER" ? { OR: [{ createdById: user.id }, { collaborators: { some: { userId: user.id } } }] } : {}) },
    include: { questions: { orderBy: { order: "asc" }, include: { question: { include: { options: { orderBy: { order: "asc" } } } }, section: true } } },
  });
  if (!quiz) return new Response("Not found", { status: 404 });

  const items = quiz.questions.map((link, questionIndex) => {
    const question = link.question;
    const identifier = `ITEM_${questionIndex + 1}`;
    const choices = question.options.map((option, index) => `<simpleChoice identifier="${xml(option.label || String.fromCharCode(65 + index))}">${xml(option.text)}</simpleChoice>`).join("");
    const correct = question.options.find((option) => option.isCorrect);
    const response = correct ? `<responseDeclaration identifier="RESPONSE" cardinality="single" baseType="identifier"><correctResponse><value>${xml(correct.label || String.fromCharCode(65 + question.options.indexOf(correct)))}</value></correctResponse></responseDeclaration>` : "";
    const body = choices ? `<choiceInteraction responseIdentifier="RESPONSE" maxChoices="1"><prompt>${xml(question.text)}</prompt>${choices}</choiceInteraction>` : `<extendedTextInteraction responseIdentifier="RESPONSE"><prompt>${xml(question.text)}</prompt></extendedTextInteraction>`;
    return `<assessmentItem identifier="${identifier}" title="${xml(question.text.slice(0, 80))}" adaptive="false" timeDependent="false">${response}<itemBody>${body}</itemBody></assessmentItem>`;
  }).join("");
  const output = `<?xml version="1.0" encoding="UTF-8"?><assessmentTest xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1" identifier="${xml(quiz.id)}" title="${xml(quiz.title)}"><testPart identifier="PART_1" navigationMode="linear" submissionMode="individual"><assessmentSection identifier="SECTION_1" title="${xml(quiz.title)}" visible="true">${items}</assessmentSection></testPart></assessmentTest>`;
  const filename = quiz.title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "test";
  return new Response(output, { headers: { "Content-Type": "application/xml; charset=utf-8", "Content-Disposition": `attachment; filename="${filename}.qti.xml"` } });
}
