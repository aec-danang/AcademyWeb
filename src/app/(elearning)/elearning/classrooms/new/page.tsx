import Link from "next/link";
import { ArrowLeft, Route } from "lucide-react";
import { requireUser } from "@/lib/session";
import { ElearningBreadcrumbs } from "../../ElearningBreadcrumbs";
import { CreateClassroomForm } from "./CreateClassroomForm";
import { getTeacherSetupProgress } from "@/lib/teacherSetup";
import styles from "../../elearning.module.css";

export const metadata = { title: "Create Classroom | Academy E-learning" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function CreateClassroomPage({ searchParams }: Props) {
  const user = await requireUser(["TEACHER", "ADMIN"]);
  await searchParams;
  const setup = await getTeacherSetupProgress(user.id, false);

  return (
    <main className={styles.workflowPage}>
      <ElearningBreadcrumbs items={[{ label: "Classrooms", href: "/elearning/classrooms" }, { label: "Create classroom" }]} />
      <header className={styles.workflowHero}>
        <div>
          <span><Route size={16} /> Classroom setup</span>
          <h1>Create a classroom</h1>
          <p>Set up the learning space first. After creation, add students and publish their first assignment.</p>
        </div>
        <Link href="/elearning/classrooms" className="btn-secondary"><ArrowLeft size={16} /> Back to classrooms</Link>
      </header>
      <CreateClassroomForm unfinishedClassroom={setup.classroomId && setup.completed < setup.total ? { id: setup.classroomId, name: setup.classroomName || "Untitled classroom", code: setup.classroomCode || "", completed: setup.completed, total: setup.total } : null} />
    </main>
  );
}
