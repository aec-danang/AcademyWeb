import Link from "next/link";
import { ChevronLeft, ChevronRight, CheckCircle, Menu } from "lucide-react";
import styles from "../../elearning.module.css";
import { use } from "react";

export default function LearningPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const unwrappedParams = use(params);
  const lessonId = unwrappedParams.lessonId;
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <Link href="/elearning/courses/INT-704" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", textDecoration: "none" }}>
          <ChevronLeft size={16} /> Back to Course
        </Link>
        <h2 style={{ margin: 0, fontSize: "1.25rem", color: "var(--color-navy)" }}>Describing Trends and Charts</h2>
        <div style={{ width: "100px" }}></div> {/* Spacer */}
      </div>

      <div style={{ display: "flex", gap: "2rem", flex: 1, minHeight: 0 }}>
        {/* Main Content Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.5rem", overflowY: "auto", paddingRight: "1rem" }}>
          
          {/* Video Placeholder */}
          <div style={{ width: "100%", aspectRatio: "16/9", backgroundColor: "black", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", position: "relative" }}>
            <div style={{ position: "absolute", width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <div style={{ width: 0, height: 0, borderTop: "15px solid transparent", borderBottom: "15px solid transparent", borderLeft: "25px solid white", marginLeft: "5px" }}></div>
            </div>
          </div>

          {/* Text Content */}
          <div className={styles.panel}>
            <h3>Lesson Notes</h3>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
              In this lesson, we will cover the essential vocabulary needed to describe upward, downward, and fluctuating trends in IELTS Writing Task 1. Make sure to take notes and download the attached PDF materials.
            </p>
            <ul style={{ color: "var(--text-muted)", lineHeight: 1.6, paddingLeft: "1.5rem" }}>
              <li>Using adverbs and adjectives correctly (e.g., increased significantly vs. a significant increase)</li>
              <li>Describing stable periods and fluctuations</li>
              <li>Structuring the overview paragraph</li>
            </ul>
          </div>

          {/* Navigation Buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "auto", paddingTop: "1rem" }}>
            <button className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <ChevronLeft size={16} /> Previous Lesson
            </button>
            <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <CheckCircle size={16} /> Mark as Complete & Next <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Sidebar Syllabus inside Learning View */}
        <div style={{ width: "300px", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className={styles.panel} style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
            <h4 style={{ display: "flex", alignItems: "center", gap: "0.5rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
              <Menu size={16} /> Syllabus
            </h4>
            
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-navy)", marginBottom: "0.5rem" }}>Chapter 1: Reading</div>
              <div style={{ fontSize: "0.875rem", padding: "0.5rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.5rem" }}><CheckCircle size={14} color="#166534" /> Skimming and Scanning</div>
              <div style={{ fontSize: "0.875rem", padding: "0.5rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.5rem" }}><CheckCircle size={14} color="#166534" /> Identifying Main Ideas</div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-navy)", marginBottom: "0.5rem" }}>Chapter 2: Writing</div>
              <div style={{ fontSize: "0.875rem", padding: "0.5rem", backgroundColor: "var(--color-orange-light)", color: "var(--color-orange)", borderRadius: "4px", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 500 }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--color-orange)" }}></div>
                Describing Trends
              </div>
              <div style={{ fontSize: "0.875rem", padding: "0.5rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.5rem", opacity: 0.5 }}> Comparing Data</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
