import Link from "next/link";
import { PlayCircle, CheckCircle, HelpCircle, ChevronLeft } from "lucide-react";
import styles from "../../elearning.module.css";
import { use } from "react";

export default function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const unwrappedParams = use(params);
  const courseId = unwrappedParams.courseId;
  // Mock data mimicking the SQL sections and section_items structure
  const course = {
    title: "IELTS Intensive 7.0+",
    progress: 45,
    sections: [
      {
        id: "s1",
        title: "Chapter 1: Advanced Reading Strategies",
        items: [
          { id: "l1", type: "lesson", title: "Skimming and Scanning Techniques", status: "completed" },
          { id: "l2", type: "lesson", title: "Identifying Main Ideas", status: "completed" },
          { id: "q1", type: "quiz", title: "Reading Practice Test 1", status: "completed" }
        ]
      },
      {
        id: "s2",
        title: "Chapter 2: Writing Task 1 Data Analysis",
        items: [
          { id: "l3", type: "lesson", title: "Describing Trends and Charts", status: "current" },
          { id: "l4", type: "lesson", title: "Comparing Data", status: "locked" },
          { id: "q2", type: "quiz", title: "Writing Practice 1", status: "locked" }
        ]
      },
      {
        id: "s3",
        title: "Chapter 3: Speaking Fluency",
        items: [
          { id: "l5", type: "lesson", title: "Part 2 Monologue Strategies", status: "locked" },
          { id: "q3", type: "quiz", title: "Speaking Mock Test", status: "locked" }
        ]
      }
    ]
  };

  return (
    <div>
      <Link href="/elearning/courses" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", textDecoration: "none", marginBottom: "1.5rem" }}>
        <ChevronLeft size={16} /> Back to Courses
      </Link>
      
      <div className={styles.panel} style={{ backgroundColor: "var(--color-navy)", color: "white" }}>
        <h1 style={{ margin: "0 0 1rem 0", color: "white" }}>{course.title}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div className={styles.progressBar} style={{ width: "200px", backgroundColor: "rgba(255,255,255,0.2)" }}>
            <div className={styles.progressFill} style={{ width: `${course.progress}%` }}></div>
          </div>
          <span>{course.progress}% Completed</span>
        </div>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h2 style={{ marginBottom: "1rem", color: "var(--color-navy)" }}>Course Syllabus</h2>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {course.sections.map((section, idx) => (
            <div key={section.id} className={styles.panel} style={{ padding: 0, overflow: "hidden", marginBottom: 0 }}>
              <div style={{ padding: "1rem 1.5rem", backgroundColor: "#f8f9fa", borderBottom: "1px solid #e2e8f0", fontWeight: 600 }}>
                {section.title}
              </div>
              <div>
                {section.items.map(item => (
                  <Link 
                    key={item.id} 
                    href={item.status === 'locked' ? "#" : `/elearning/learn/${item.id}`}
                    style={{ textDecoration: "none", color: "inherit", pointerEvents: item.status === 'locked' ? 'none' : 'auto' }}
                  >
                    <div style={{ 
                      padding: "1rem 1.5rem", 
                      borderBottom: "1px solid #e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      opacity: item.status === 'locked' ? 0.5 : 1,
                      backgroundColor: item.status === 'current' ? 'rgba(235, 90, 10, 0.05)' : 'white',
                      transition: "background-color 0.2s"
                    }} className="syllabus-item">
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        {item.type === 'lesson' ? <PlayCircle size={18} color="var(--color-navy)" /> : <HelpCircle size={18} color="var(--color-orange)" />}
                        <span style={{ fontWeight: item.status === 'current' ? 600 : 400 }}>{item.title}</span>
                      </div>
                      <div>
                        {item.status === 'completed' && <CheckCircle size={18} color="#166534" />}
                        {item.status === 'current' && <span className={styles.statusBadge} style={{ backgroundColor: "var(--color-orange)", color: "white" }}>Current</span>}
                        {item.status === 'locked' && <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Locked</span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
