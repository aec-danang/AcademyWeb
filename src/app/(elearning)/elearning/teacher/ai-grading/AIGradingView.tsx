"use client";

import { useState } from "react";
import { Bot, CheckCircle, Search, Filter, MessageSquare, Save, Edit3, AlertTriangle } from "lucide-react";
import styles from "../../elearning.module.css";

// Mock data for the UI demonstration
const mockSubmissions = [
  {
    id: "sub-1",
    studentName: "Nguyen Van A",
    className: "IELTS Intensive",
    assignmentTitle: "Task 2: Environment",
    submittedAt: "2 hours ago",
    originalText: "Nowadays, the enviroment is very polluted. Many people thinks that government should take action to protect the earth. In my opinion, I very agree with this statement because individual actions is not enough.\n\nFirst of all, factories produces a large amount of toxic gases. They releases it into the air every day. This cause global warming. Second, citizens throws trash everywhere. The river is full of plastic bags. Therefore, strict laws must be apply immediately.",
    aiScore: 6.0,
    aiFeedback: "The essay addresses the prompt but suffers from frequent grammatical errors, particularly subject-verb agreement. Vocabulary is somewhat basic.",
    errors: [
      { id: "e1", type: "Spelling", text: "enviroment", suggestion: "environment", explanation: "Missing the 'n'." },
      { id: "e2", type: "Grammar", text: "Many people thinks", suggestion: "Many people think", explanation: "'People' is plural." },
      { id: "e3", type: "Vocabulary", text: "very agree", suggestion: "strongly agree", explanation: "Use 'strongly agree' for better collocation." },
      { id: "e4", type: "Grammar", text: "individual actions is", suggestion: "individual actions are", explanation: "Plural subject." },
      { id: "e5", type: "Grammar", text: "factories produces", suggestion: "factories produce", explanation: "Plural subject." },
      { id: "e6", type: "Grammar", text: "They releases", suggestion: "They release", explanation: "Plural subject." },
    ]
  }
];

export function AIGradingView() {
  const [activeSubmission, setActiveSubmission] = useState(mockSubmissions[0]);
  const [finalScore, setFinalScore] = useState<string>(activeSubmission.aiScore.toString());
  const [teacherRemarks, setTeacherRemarks] = useState<string>("");
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      alert(`Score ${finalScore} published for ${activeSubmission.studentName}!`);
      setIsPublishing(false);
    }, 1000);
  };

  return (
    <div className={styles.quizPageShell}>
      <section className={styles.quizHero}>
        <div>
          <span className={styles.cockpitEyebrow}><Bot size={16} /> Teacher Tools</span>
          <h1>AI Writing Assistant</h1>
          <p>Review AI-generated feedback for student essays, adjust scores, and add your personal remarks before publishing.</p>
        </div>
      </section>

      {/* Filter Panel */}
      <div className={styles.quizFilterPanel} style={{ marginTop: "1rem" }}>
        <div className={styles.quizFilterHeader}>
          <div>
            <span className={styles.cockpitEyebrow}><Filter size={16} /> Filters</span>
            <h2>Select Submission</h2>
          </div>
        </div>
        <div className={styles.quizFilterGrid}>
          <label>
            <span>Class</span>
            <select defaultValue="IELTS Intensive">
              <option value="IELTS Intensive">IELTS Intensive</option>
              <option value="Basic English">Basic English</option>
            </select>
          </label>
          <label>
            <span>Assignment</span>
            <select defaultValue="Task 2: Environment">
              <option value="Task 2: Environment">Task 2: Environment</option>
            </select>
          </label>
          <label>
            <span>Student Status</span>
            <select defaultValue="Needs Review">
              <option value="Needs Review">Needs Review (1)</option>
              <option value="Graded">Graded (14)</option>
            </select>
          </label>
        </div>
      </div>

      {/* Main Grading Workspace */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "1.5rem" }}>
        
        {/* Left Column: Student Essay */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "1rem", border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
              <div>
                <h3 style={{ margin: "0 0 0.25rem 0", color: "var(--color-navy)" }}>{activeSubmission.studentName}</h3>
                <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>{activeSubmission.assignmentTitle}</span>
              </div>
              <span style={{ fontSize: "0.75rem", padding: "0.25rem 0.75rem", backgroundColor: "var(--primary-subtle)", color: "var(--primary)", borderRadius: "1rem", height: "fit-content", fontWeight: 600 }}>
                Submitted {activeSubmission.submittedAt}
              </span>
            </div>
            
            <div style={{ 
              fontSize: "1rem", 
              lineHeight: "1.8", 
              color: "var(--text)", 
              whiteSpace: "pre-wrap",
              minHeight: "400px"
            }}>
              {activeSubmission.originalText}
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis & Teacher Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          
          {/* AI Score & Teacher Edit */}
          <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "1rem", border: "1px solid var(--border)", display: "flex", gap: "1.5rem", alignItems: "center" }}>
            <div style={{ 
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              width: "100px", height: "100px", borderRadius: "50%", border: "6px solid var(--color-orange)", flexShrink: 0
            }}>
              <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-navy)", lineHeight: 1 }}>{activeSubmission.aiScore}</span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>AI SCORE</span>
            </div>
            
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-navy)", marginBottom: "0.5rem" }}>
                Final Score (Adjustable)
              </label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input 
                  type="number" 
                  step="0.5"
                  value={finalScore}
                  onChange={(e) => setFinalScore(e.target.value)}
                  style={{ width: "80px", padding: "0.5rem", borderRadius: "0.375rem", border: "1px solid var(--border)", fontSize: "1.125rem", fontWeight: 700, outline: "none" }}
                />
              </div>
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "0.5rem", lineHeight: 1.4 }}>
                {activeSubmission.aiFeedback}
              </p>
            </div>
          </div>

          {/* Detailed Error Analysis */}
          <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "1rem", border: "1px solid var(--border)", flex: 1, overflowY: "auto", maxHeight: "500px" }}>
            <h3 style={{ margin: "0 0 1rem 0", color: "var(--color-navy)", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.125rem" }}>
              <AlertTriangle size={18} color="var(--color-orange)" />
              AI Error Analysis
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {activeSubmission.errors.map((err) => (
                <div key={err.id} style={{ padding: "1rem", backgroundColor: "#f8fafc", borderRadius: "0.5rem", borderLeft: "3px solid var(--primary)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, backgroundColor: "var(--primary-subtle)", color: "var(--primary)", padding: "0.2rem 0.5rem", borderRadius: "0.25rem", textTransform: "uppercase" }}>
                      {err.type}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                    <span style={{ color: "var(--error)", textDecoration: "line-through", marginRight: "0.5rem" }}>{err.text}</span>
                    <span style={{ color: "var(--success)", fontWeight: 600 }}>{err.suggestion}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-muted)" }}>{err.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Teacher Remarks & Publish */}
          <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "1rem", border: "1px solid var(--border)" }}>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-navy)", marginBottom: "0.5rem" }}>
              Teacher Remarks (Sent to student)
            </label>
            <textarea 
              value={teacherRemarks}
              onChange={(e) => setTeacherRemarks(e.target.value)}
              placeholder="Add your personalized feedback here..."
              style={{ width: "100%", height: "100px", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--border)", resize: "none", fontSize: "0.875rem", outline: "none", fontFamily: "inherit" }}
              onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
              onBlur={(e) => e.target.style.borderColor = "var(--border)"}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
              <button 
                className="btn-primary" 
                onClick={handlePublish}
                disabled={isPublishing}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <CheckCircle size={16} />
                {isPublishing ? "Publishing..." : "Publish Score"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
