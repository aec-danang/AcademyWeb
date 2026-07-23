import Link from "next/link";
import { ClipboardList, FileCheck2, Target } from "lucide-react";
import styles from "../elearning.module.css";
import { ClassQuizzesTab } from "./ClassQuizzesTab";
import { PracticeTestsTab } from "./PracticeTestsTab";
import { WrongQuestionsTab } from "./WrongQuestionsTab";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PracticeHubPage(props: Props) {
  const resolvedSearchParams = await props.searchParams;
  const activeTab = Array.isArray(resolvedSearchParams?.tab) ? resolvedSearchParams.tab[0] : resolvedSearchParams?.tab || "quizzes";

  return (
    <div className={styles.practiceHub}>
      {/* Tabs Navigation */}
      <nav className={styles.practiceTabs} aria-label="Test library sections">
        <Link 
          href="/elearning/practice?tab=quizzes"
          className={activeTab === "quizzes" ? styles.practiceTabActive : ""}
        >
          <ClipboardList size={18} />
          Class Quizzes
        </Link>
        <Link 
          href="/elearning/practice?tab=tests"
          className={activeTab === "tests" ? styles.practiceTabActive : ""}
        >
          <FileCheck2 size={18} />
          Practice Tests
        </Link>
        <Link 
          href="/elearning/practice?tab=wrong"
          className={activeTab === "wrong" ? styles.practiceTabActive : ""}
        >
          <Target size={18} />
          Wrong Questions
        </Link>
      </nav>

      {/* Tab Content */}
      <div className={styles.practiceContent}>
        {activeTab === "quizzes" && <ClassQuizzesTab searchParams={props.searchParams} />}
        {activeTab === "tests" && <PracticeTestsTab searchParams={props.searchParams} />}
        {activeTab === "wrong" && <WrongQuestionsTab searchParams={props.searchParams} />}
      </div>
    </div>
  );
}
