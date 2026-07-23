import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Activity,
  Archive,
  Award,
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileText,
  Settings,
  Sparkles,
  UserPlus,
  UserMinus,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { assignLessonToClassAction, assignQuizToClassAction, decideEnrollmentAction } from "@/lib/lmsActions";
import { archiveClassroomAction, removeStudentFromClassAction, restoreClassroomAction, updateClassroomNameAction } from "@/lib/teacherActions";
import { ElearningBreadcrumbs } from "../../ElearningBreadcrumbs";
import { AssignmentComposer } from "../../assignments/AssignmentComposer";
import { StudentImportForm } from "./StudentImportForm";
import { ConfirmSubmitButton } from "./ConfirmSubmitButton";
import styles from "../../elearning.module.css";

type Props = {
  params: Promise<{ classroomId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

function formatDate(value: Date | null | undefined) {
  return value ? dateFormatter.format(value) : "Not set";
}

export default async function ClassroomHubPage({ params, searchParams }: Props) {
  const user = await requireUser();
  const { classroomId } = await params;
  const query = await searchParams;
  const requestedTab = typeof query.tab === "string" ? query.tab : "overview";

  const classroom = await prisma.classSection.findUnique({
    where: { id: classroomId },
    include: {
      course: { include: { lessons: { where: { published: true }, orderBy: { order: "asc" } } } },
      teacher: true,
      enrollments: { include: { student: true }, orderBy: { requestedAt: "desc" } },
      assignments: {
        orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
        include: { submissions: { include: { student: true, grade: true }, orderBy: { submittedAt: "desc" } } },
      },
      lessonDeliveries: {
        orderBy: [{ availableAt: "asc" }, { createdAt: "asc" }],
        include: { lesson: true, progress: true },
      },
      quizDeliveries: {
        orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
        include: { quiz: { include: { questions: true } }, attempts: true },
      },
      quizzes: {
        where: { isPracticeTest: false },
        orderBy: { createdAt: "desc" },
        include: { attempts: true, questions: true },
      },
    },
  });

  if (!classroom) notFound();

  const isManager = user.role === "ADMIN" || (user.role === "TEACHER" && classroom.teacherId === user.id);
  const isActiveStudent = user.role === "STUDENT" && classroom.status === "ACTIVE" && classroom.enrollments.some((item) => item.userId === user.id && item.status === "ACTIVE");
  if (!isManager && !isActiveStudent) notFound();

  const testLibrary = isManager ? await prisma.quiz.findMany({
    where: { published: true },
    orderBy: { title: "asc" },
    include: { _count: { select: { questions: true } } },
  }) : [];
  const tabs = isManager
    ? ["overview", "students", "lessons", "assignments", "quizzes", "scores", "activity", "settings"]
    : ["overview", "lessons", "assignments", "quizzes", "scores"];
  const activeTab = tabs.includes(requestedTab) ? requestedTab : "overview";
  const activeEnrollments = classroom.enrollments.filter((item) => item.status === "ACTIVE");
  const pendingEnrollments = classroom.enrollments.filter((item) => item.status === "REQUESTED");
  const allSubmissions = classroom.assignments.flatMap((item) => item.submissions);
  const pendingSubmissions = allSubmissions.filter((item) => item.status !== "GRADED" && !item.grade);
  const publishedAssignments = classroom.assignments.filter((item) => item.status === "PUBLISHED");
  const grades = allSubmissions.flatMap((item) => item.grade?.status === "PUBLISHED" ? [{ ...item.grade, student: item.student }] : []);
  const averageScore = grades.length ? grades.reduce((sum, item) => sum + item.score, 0) / grades.length : null;
  const tabIcon: Record<string, React.ReactNode> = {
    overview: <Activity size={16} />, students: <Users size={16} />, lessons: <BookOpen size={16} />,
    assignments: <FileText size={16} />, quizzes: <ClipboardList size={16} />, scores: <Award size={16} />,
    activity: <Activity size={16} />, settings: <Settings size={16} />,
  };

  const activityItems = [
    ...classroom.enrollments.map((item) => ({ key: `enrollment-${item.id}`, date: item.requestedAt, title: item.status === "REQUESTED" ? "Enrollment requested" : `Enrollment ${item.status.toLowerCase()}`, detail: item.student.name || item.student.email || "Student" })),
    ...classroom.assignments.map((item) => ({ key: `assignment-${item.id}`, date: item.updatedAt, title: `Assignment ${item.status.toLowerCase()}`, detail: item.title })),
    ...allSubmissions.map((item) => ({ key: `submission-${item.id}`, date: item.submittedAt, title: "Assignment submitted", detail: item.student.name || item.student.email || "Student" })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 12);

  return (
    <div className={styles.classroomHub}>
      <ElearningBreadcrumbs items={[{ label: "Classrooms", href: "/elearning/classrooms" }, { label: classroom.name }]} />

      <header className={styles.classroomHubHeader}>
        <div>
          <span>{classroom.code} · {classroom.status}</span>
          <h1>{classroom.name}</h1>
          <p>{classroom.course.title} · Teacher: {classroom.teacher?.name || classroom.teacher?.email || "Not assigned"}</p>
        </div>
        {isManager ? <Link href={`/elearning/courses/${classroom.courseId}`} className="btn-secondary">Open course template</Link> : null}
      </header>

      <nav className={styles.classroomTabs} aria-label="Classroom sections">
        {tabs.map((tab) => (
          <Link href={`/elearning/classrooms/${classroom.id}?tab=${tab}`} key={tab} className={activeTab === tab ? styles.classroomTabActive : ""}>
            {tabIcon[tab]} {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === "students" && pendingEnrollments.length ? <b>{pendingEnrollments.length}</b> : null}
            {tab === "assignments" && pendingSubmissions.length ? <b>{pendingSubmissions.length}</b> : null}
          </Link>
        ))}
      </nav>

      {activeTab === "overview" ? (
        <div className={styles.classroomHubContent}>
          {isManager && activeEnrollments.length === 0 ? (
            <section className={styles.classroomGuide}>
              <span><UserPlus size={22} /></span>
              <div><strong>Start by adding students</strong><p>This classroom is ready. Add learners before assigning lessons and tests.</p></div>
              <Link href={`/elearning/classrooms/${classroom.id}?tab=students`} className="btn-primary">Add students</Link>
            </section>
          ) : isManager && classroom.lessonDeliveries.length === 0 && classroom.assignments.length === 0 && classroom.quizDeliveries.length === 0 ? (
            <section className={styles.classroomGuide}>
              <span><Sparkles size={22} /></span>
              <div><strong>Your roster is ready</strong><p>Continue by assigning the first lesson, assignment or test to this class.</p></div>
              <div className={styles.classroomGuideActions}><Link href={`/elearning/classrooms/${classroom.id}?tab=lessons`}>Assign lesson</Link><Link href={`/elearning/classrooms/${classroom.id}?tab=quizzes`}>Assign test</Link></div>
            </section>
          ) : null}
          <section className={`${styles.classroomSummaryGrid} ${styles.classroomDetailSummary}`}>
            <div><Users size={20} /><strong>{activeEnrollments.length}</strong><span>Active students</span></div>
            <div><FileText size={20} /><strong>{publishedAssignments.length}</strong><span>Published assignments</span></div>
            <div><BookOpen size={20} /><strong>{classroom.lessonDeliveries.filter((item) => item.status === "PUBLISHED").length}</strong><span>Assigned lessons</span></div>
            <div><ClipboardList size={20} /><strong>{classroom.quizDeliveries.filter((item) => item.status === "PUBLISHED").length}</strong><span>Assigned tests</span></div>
            <div><Award size={20} /><strong>{averageScore === null ? "–" : averageScore.toFixed(1)}</strong><span>Average score</span></div>
          </section>
          <div className={styles.dashboardMain}>
            <section className={styles.dashboardPanel}>
              <div className={styles.dashboardPanelHeader}><div><span className={styles.cockpitEyebrow}><BookOpen size={16} /> Course content</span><h2>Lessons</h2></div></div>
              {classroom.lessonDeliveries.length ? <div className={styles.focusList}>{classroom.lessonDeliveries.slice(0, 5).map((delivery) => <Link className={styles.focusItem} href={`/elearning/learn/${delivery.lesson.id}?delivery=${delivery.id}`} key={delivery.id}><div className={styles.taskIcon}><BookOpen size={17} /></div><div><strong>{delivery.lesson.title}</strong><p>{delivery.status} · {delivery.progress.filter((item) => item.status === "COMPLETED").length}/{activeEnrollments.length} completed</p></div><span>Open</span></Link>)}</div> : <p className={styles.classroomEmpty}>No lessons assigned yet.</p>}
            </section>
            <section className={styles.dashboardPanel}>
              <div className={styles.dashboardPanelHeader}><div><span className={styles.cockpitEyebrow}><CalendarDays size={16} /> Schedule</span><h2>Class timeline</h2></div></div>
              <div className={styles.classroomTimelineSummary}><div><span>Starts</span><strong>{formatDate(classroom.startAt)}</strong></div><div><span>Ends</span><strong>{formatDate(classroom.endAt)}</strong></div><div><span>Next deadline</span><strong>{formatDate(publishedAssignments.find((item) => item.dueAt && item.dueAt > new Date())?.dueAt)}</strong></div></div>
            </section>
          </div>
        </div>
      ) : null}

      {activeTab === "students" && isManager ? (
        <div className={styles.classroomHubContent}>
          {query.created === "1" ? <div className={styles.workflowNextStep}><UserPlus size={20} /><div><strong>Classroom created successfully</strong><p>Now add students. When the roster is ready, continue to the Assignments tab.</p></div></div> : null}
          <section className={styles.dashboardPanel}>
            <div className={styles.dashboardPanelHeader}><div><span className={styles.cockpitEyebrow}><UserPlus size={16} /> Student management</span><h2>Add students</h2></div></div>
            <StudentImportForm classroomId={classroom.id} />
          </section>
          {pendingEnrollments.length ? <section className={styles.dashboardPanel}><div className={styles.dashboardPanelHeader}><div><span className={styles.cockpitEyebrow}><UserPlus size={16} /> Needs attention</span><h2>Pending enrollments</h2></div></div><div className={styles.classroomRoster}>{pendingEnrollments.map((item) => <div key={item.id}><div><strong>{item.student.name || "Unnamed student"}</strong><p>{item.student.email || "No email"} · Requested {formatDate(item.requestedAt)}</p></div><form action={decideEnrollmentAction}><input type="hidden" name="id" value={item.id} /><button name="decision" value="approve" className="btn-primary">Approve</button><button name="decision" value="reject" className="btn-secondary">Reject</button></form></div>)}</div></section> : null}
          <section className={styles.dashboardPanel}><div className={styles.dashboardPanelHeader}><div><span className={styles.cockpitEyebrow}><Users size={16} /> Roster</span><h2>Active students</h2></div></div>{activeEnrollments.length ? <div className={styles.classroomRoster}>{activeEnrollments.map((item) => <div key={item.id}><div><strong>{item.student.name || "Unnamed student"}</strong><p>{item.student.email || "No email"}</p></div><div className={styles.rosterActions}><span className={styles.scorePill}>Active</span><form action={removeStudentFromClassAction}><input type="hidden" name="enrollmentId" value={item.id} /><input type="hidden" name="classroomId" value={classroom.id} /><ConfirmSubmitButton className={styles.rosterRemoveButton} message={`Remove ${item.student.name || item.student.email || "this student"} from ${classroom.name}? Their account and published scores will be kept.`}><UserMinus size={15} /> Remove</ConfirmSubmitButton></form></div></div>)}</div> : <div className={styles.classroomContextEmpty}><UserPlus size={28} /><strong>No students in this class yet</strong><p>Add one learner or import a list above to begin assigning work.</p></div>}</section>
        </div>
      ) : null}

      {activeTab === "lessons" ? <div className={styles.classroomHubContent}>
        {isManager ? <section className={styles.dashboardPanel}>
          <div className={styles.dashboardPanelHeader}><div><span className={styles.cockpitEyebrow}><BookOpen size={16} /> Course Library</span><h2>Assign a lesson to this class</h2></div></div>
          <form action={assignLessonToClassAction} className={styles.workflowFieldGrid}>
            <input type="hidden" name="classSectionId" value={classroom.id} />
            <label className={`${styles.workflowField} ${styles.workflowFieldWide}`}><span>Lesson <b>*</b></span><select name="lessonId" required defaultValue=""><option value="" disabled>Select from {classroom.course.title}</option>{classroom.course.lessons.map((lesson) => <option value={lesson.id} key={lesson.id}>{lesson.order}. {lesson.title}</option>)}</select></label>
            <label className={styles.workflowField}><span>Available from</span><input type="datetime-local" name="availableAt" /></label>
            <label className={styles.workflowField}><span>Completion deadline</span><input type="datetime-local" name="dueAt" /></label>
            <button className="btn-primary" type="submit">Assign lesson</button>
          </form>
        </section> : null}
        <section className={styles.dashboardPanel}>
          <div className={styles.dashboardPanelHeader}><div><span className={styles.cockpitEyebrow}><BookOpen size={16} /> Learning plan</span><h2>Assigned lessons</h2></div></div>
          {classroom.lessonDeliveries.length ? <div className={styles.focusList}>{classroom.lessonDeliveries.map((delivery) => <Link className={styles.focusItem} href={`/elearning/learn/${delivery.lesson.id}?delivery=${delivery.id}`} key={delivery.id}><div className={styles.taskIcon}><BookOpen size={17} /></div><div><strong>{delivery.lesson.title}</strong><p>{delivery.dueAt ? `Due ${formatDate(delivery.dueAt)}` : "No deadline"} · {delivery.progress.filter((item) => item.status === "COMPLETED").length}/{activeEnrollments.length} completed</p></div><span>{isManager ? "Preview" : "Learn"}</span></Link>)}</div> : <p className={styles.classroomEmpty}>No lessons have been assigned to this class.</p>}
        </section>
      </div> : null}

      {activeTab === "assignments" && isManager ? <section className={styles.dashboardPanel}><div className={styles.dashboardPanelHeader}><div><span className={styles.cockpitEyebrow}><FileText size={16} /> New work</span><h2>Create assignment</h2></div></div><AssignmentComposer classroomId={classroom.id} /></section> : null}
      {activeTab === "assignments" ? <section className={styles.dashboardPanel}>{classroom.assignments.length ? <div className={styles.focusList}>{classroom.assignments.map((item) => <Link className={styles.focusItem} href={isManager ? "/elearning/assignments" : `/elearning/assignments?classroom=${classroom.id}`} key={item.id}><div className={styles.taskIcon}><FileText size={17} /></div><div><strong>{item.title}</strong><p>{item.status} · Due {formatDate(item.dueAt)} · {item.submissions.length} submissions</p></div><span>{isManager ? `${item.submissions.filter((submission) => submission.status !== "GRADED").length} pending` : "Open"}</span></Link>)}</div> : <p className={styles.classroomEmpty}>No assignments have been added to this classroom.</p>}</section> : null}

      {activeTab === "quizzes" ? <div className={styles.classroomHubContent}>
        {isManager ? <section className={styles.dashboardPanel}>
          <div className={styles.dashboardPanelHeader}><div><span className={styles.cockpitEyebrow}><ClipboardList size={16} /> Test Library</span><h2>Assign a test to this class</h2></div><Link href="/elearning/practice?tab=tests">Open test library</Link></div>
          <form action={assignQuizToClassAction} className={styles.workflowFieldGrid}>
            <input type="hidden" name="classSectionId" value={classroom.id} />
            <label className={`${styles.workflowField} ${styles.workflowFieldWide}`}><span>Test <b>*</b></span><select name="quizId" required defaultValue=""><option value="" disabled>Select a published test</option>{testLibrary.map((quiz) => <option value={quiz.id} key={quiz.id}>{quiz.title} ({quiz._count.questions} questions)</option>)}</select></label>
            <label className={styles.workflowField}><span>Open from</span><input type="datetime-local" name="openAt" /></label>
            <label className={styles.workflowField}><span>Deadline</span><input type="datetime-local" name="dueAt" required /></label>
            <label className={styles.workflowField}><span>Attempts</span><input type="number" name="attemptLimit" min="1" defaultValue="1" /></label>
            <button className="btn-primary" type="submit">Assign test</button>
          </form>
        </section> : null}
        <section className={styles.dashboardPanel}>
          <div className={styles.dashboardPanelHeader}><div><span className={styles.cockpitEyebrow}><ClipboardList size={16} /> Assigned assessments</span><h2>Tests for this class</h2></div></div>
          {classroom.quizDeliveries.length ? <div className={styles.focusList}>{classroom.quizDeliveries.map((delivery) => <Link className={styles.focusItem} href={`/elearning/exercises/${delivery.quiz.id}?delivery=${delivery.id}`} key={delivery.id}><div className={styles.taskIcon}><ClipboardList size={17} /></div><div><strong>{delivery.quiz.title}</strong><p>{delivery.dueAt ? `Due ${formatDate(delivery.dueAt)}` : "No deadline"} · {delivery.quiz.questions.length} questions · {delivery.attempts.filter((item) => item.status !== "IN_PROGRESS").length}/{activeEnrollments.length} submitted</p></div><span>Open</span></Link>)}</div> : <p className={styles.classroomEmpty}>No tests are assigned to this class.</p>}
        </section>
      </div> : null}

      {activeTab === "scores" ? <section className={styles.dashboardPanel}>{grades.length ? <div className={styles.classroomRoster}>{grades.slice(0, 20).map((grade) => <div key={grade.id}><div><strong>{grade.student.name || grade.student.email || "Student"}</strong><p>Graded {formatDate(grade.createdAt)}</p></div><span className={styles.scorePill}>{grade.score.toFixed(1)}</span></div>)}</div> : <p className={styles.classroomEmpty}>No graded submissions yet.</p>}<Link href="/elearning/scores" className={styles.classroomFooterLink}>Open all scores</Link></section> : null}

      {activeTab === "activity" && isManager ? <section className={styles.dashboardPanel}>{activityItems.length ? <div className={styles.workspaceTimeline}>{activityItems.map((item) => <div className={styles.workspaceTimelineItem} key={item.key}><span><Activity size={16} /></span><div><strong>{item.title}</strong><p>{item.detail}</p></div><time>{formatDate(item.date)}</time></div>)}</div> : <p className={styles.classroomEmpty}>No classroom activity yet.</p>}</section> : null}

      {activeTab === "settings" && isManager ? <div className={styles.classroomHubContent}>
        {query.renamed === "1" ? <div className={styles.workflowNextStep}><Sparkles size={20} /><div><strong>Classroom name updated</strong><p>The new name is now used across the teacher and student workspace.</p></div></div> : null}
        {query.restored === "1" ? <div className={styles.workflowNextStep}><Sparkles size={20} /><div><strong>Classroom restored</strong><p>Students can access its active learning content again.</p></div></div> : null}
        <section className={styles.dashboardPanel}><div className={styles.dashboardPanelHeader}><div><span className={styles.cockpitEyebrow}><Settings size={16} /> Classroom settings</span><h2>General information</h2></div></div><form action={updateClassroomNameAction} className={styles.classroomRenameForm}><input type="hidden" name="classroomId" value={classroom.id} /><label><span>Classroom name</span><input name="name" defaultValue={classroom.name} minLength={2} maxLength={100} required /></label><button type="submit" className="btn-primary">Save name</button></form><div className={styles.classroomSettingsSummary}><div><span>Course template</span><strong>{classroom.course.title}</strong></div><div><span>Teacher</span><strong>{classroom.teacher?.name || classroom.teacher?.email || "Not assigned"}</strong></div><div><span>Classroom status</span><strong>{classroom.status}</strong></div></div><Link href={`/elearning/courses/${classroom.courseId}`} className="btn-secondary">View course curriculum</Link></section>
        <section className={styles.classroomDangerZone}><div><span><Archive size={18} /></span><div><strong>{classroom.status === "ARCHIVED" ? "Restore classroom" : "Archive classroom"}</strong><p>{classroom.status === "ARCHIVED" ? "Return this classroom to the active workspace. Student accounts and history remain unchanged." : "Remove this classroom from the active workspace without deleting student accounts, submissions or scores."}</p></div></div><form action={classroom.status === "ARCHIVED" ? restoreClassroomAction : archiveClassroomAction}><input type="hidden" name="classroomId" value={classroom.id} /><ConfirmSubmitButton className={classroom.status === "ARCHIVED" ? "btn-secondary" : styles.archiveButton} message={classroom.status === "ARCHIVED" ? `Restore ${classroom.name}?` : `Archive ${classroom.name}? Students will no longer see it as an active classroom.`}>{classroom.status === "ARCHIVED" ? "Restore classroom" : "Archive classroom"}</ConfirmSubmitButton></form></section>
      </div> : null}
    </div>
  );
}
