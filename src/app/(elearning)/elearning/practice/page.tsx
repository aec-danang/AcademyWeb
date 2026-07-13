import Link from "next/link";
import { ClipboardList, FileCheck2, Target, PenTool } from "lucide-react";
import styles from "../elearning.module.css";
import { ClassQuizzesTab } from "./ClassQuizzesTab";
import { PracticeTestsTab } from "./PracticeTestsTab";
import { WrongQuestionsTab } from "./WrongQuestionsTab";
import { WritingEvaluationTab } from "./WritingEvaluationTab";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PracticeHubPage(props: Props) {
  const resolvedSearchParams = await props.searchParams;
  const activeTab = Array.isArray(resolvedSearchParams?.tab) ? resolvedSearchParams.tab[0] : resolvedSearchParams?.tab || "quizzes";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Tabs Navigation */}
      <div style={{ display: "flex", gap: "1rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
        <Link 
          href="/elearning/practice?tab=quizzes"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            fontWeight: 500,
            textDecoration: "none",
            backgroundColor: activeTab === "quizzes" ? "var(--primary-subtle)" : "transparent",
            color: activeTab === "quizzes" ? "var(--primary)" : "var(--text)",
            transition: "all 0.2s"
          }}
        >
          <ClipboardList size={18} />
          Class Quizzes
        </Link>
        <Link 
          href="/elearning/practice?tab=tests"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            fontWeight: 500,
            textDecoration: "none",
            backgroundColor: activeTab === "tests" ? "var(--primary-subtle)" : "transparent",
            color: activeTab === "tests" ? "var(--primary)" : "var(--text)",
            transition: "all 0.2s"
          }}
        >
          <FileCheck2 size={18} />
          Practice Tests
        </Link>
        <Link 
          href="/elearning/practice?tab=wrong"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            fontWeight: 500,
            textDecoration: "none",
            backgroundColor: activeTab === "wrong" ? "var(--primary-subtle)" : "transparent",
            color: activeTab === "wrong" ? "var(--primary)" : "var(--text)",
            transition: "all 0.2s"
          }}
        >
          <Target size={18} />
          Wrong Questions
        </Link>
        <Link 
          href="/elearning/practice?tab=writing"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            fontWeight: 500,
            textDecoration: "none",
            backgroundColor: activeTab === "writing" ? "var(--primary-subtle)" : "transparent",
            color: activeTab === "writing" ? "var(--primary)" : "var(--text)",
            transition: "all 0.2s"
          }}
        >
          <PenTool size={18} />
          Writing Grading
        </Link>
      </div>

      {/* Tab Content */}
      <div style={{ animation: "fadeIn 0.3s ease-in-out" }}>
        {activeTab === "quizzes" && <ClassQuizzesTab searchParams={props.searchParams} />}
        {activeTab === "tests" && <PracticeTestsTab searchParams={props.searchParams} />}
        {activeTab === "wrong" && <WrongQuestionsTab searchParams={props.searchParams} />}
        {activeTab === "writing" && <WritingEvaluationTab />}
      </div>
    </div>
  );
}
