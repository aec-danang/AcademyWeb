"use client";

import { useState } from "react";
import { PenTool, Target, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import styles from "../elearning.module.css";

type ErrorFeedback = {
  id: string;
  type: "grammar" | "vocabulary" | "spelling" | "style";
  original: string;
  suggestion: string;
  explanation: string;
};

type EvaluationResult = {
  score: number;
  maxScore: number;
  overallFeedback: string;
  errors: ErrorFeedback[];
};

export function WritingEvaluationTab() {
  const [essayContent, setEssayContent] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);

  const wordCount = essayContent.trim().split(/\s+/).filter(w => w.length > 0).length;

  const handleGrade = async () => {
    if (wordCount < 10) {
      alert("Please enter at least 10 words to get an evaluation.");
      return;
    }

    setIsEvaluating(true);
    setResult(null);

    // Mock API call
    setTimeout(() => {
      setResult({
        score: 75,
        maxScore: 100,
        overallFeedback: "Good effort! Your ideas are generally clear, but there are several grammatical and vocabulary errors that need attention to achieve a higher band score.",
        errors: [
          {
            id: "1",
            type: "grammar",
            original: "He go to school every day.",
            suggestion: "He goes to school every day.",
            explanation: "Remember to use the third-person singular 's' for present simple verbs with 'he/she/it'."
          },
          {
            id: "2",
            type: "vocabulary",
            original: "I very like this topic.",
            suggestion: "I really like this topic. / I enjoy this topic very much.",
            explanation: "'Very' cannot directly modify a verb like 'like'. Use 'really' or 'very much' at the end."
          },
          {
            id: "3",
            type: "spelling",
            original: "enviroment",
            suggestion: "environment",
            explanation: "Be careful with the spelling of 'environment', don't forget the 'n'."
          }
        ]
      });
      setIsEvaluating(false);
    }, 2000);
  };

  return (
    <div className={styles.quizPageShell}>
      <section className={styles.quizHero}>
        <div>
          <span className={styles.cockpitEyebrow}><PenTool size={16} /> Writing Grading</span>
          <h1>Evaluate your writing skills</h1>
          <p>
            Paste your essay or paragraph below to receive instant feedback on grammar, vocabulary, spelling, and style, along with an estimated score.
          </p>
        </div>
      </section>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginTop: "1rem" }}>
        
        {/* Input Area */}
        <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "1rem", border: "1px solid var(--border)", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <label htmlFor="essay-input" style={{ fontWeight: 600, color: "var(--color-navy)" }}>Your Essay</label>
            <span style={{ fontSize: "0.875rem", color: wordCount > 250 ? "var(--success)" : "var(--text-muted)" }}>
              {wordCount} words
            </span>
          </div>
          <textarea
            id="essay-input"
            value={essayContent}
            onChange={(e) => setEssayContent(e.target.value)}
            placeholder="Start typing or paste your text here..."
            style={{
              width: "100%",
              minHeight: "250px",
              padding: "1rem",
              borderRadius: "0.5rem",
              border: "1px solid var(--border)",
              resize: "vertical",
              fontSize: "1rem",
              lineHeight: "1.6",
              fontFamily: "inherit",
              outline: "none",
              transition: "border-color 0.2s"
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            disabled={isEvaluating}
          />
          
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
            <button 
              className="btn-primary" 
              onClick={handleGrade}
              disabled={isEvaluating || wordCount === 0}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", opacity: isEvaluating || wordCount === 0 ? 0.6 : 1 }}
            >
              {isEvaluating ? <Loader2 size={18} className="spin" /> : <Target size={18} />}
              {isEvaluating ? "Evaluating..." : "Grade My Writing"}
            </button>
          </div>
        </div>

        {/* Results Area */}
        {result && (
          <div style={{ animation: "fadeIn 0.5s ease-in-out", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "2rem", 
              backgroundColor: "white", 
              padding: "2rem", 
              borderRadius: "1rem", 
              border: "1px solid var(--border)" 
            }}>
              <div style={{ 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                justifyContent: "center",
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                border: "8px solid " + (result.score >= 80 ? "var(--success)" : result.score >= 60 ? "var(--color-orange)" : "var(--error)"),
                flexShrink: 0
              }}>
                <span style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--color-navy)", lineHeight: 1 }}>{result.score}</span>
                <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>/ {result.maxScore}</span>
              </div>
              <div>
                <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--color-navy)" }}>Overall Feedback</h3>
                <p style={{ margin: 0, color: "var(--text)", lineHeight: 1.6 }}>{result.overallFeedback}</p>
              </div>
            </div>

            <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "1rem", border: "1px solid var(--border)" }}>
              <h3 style={{ margin: "0 0 1rem 0", color: "var(--color-navy)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <AlertTriangle size={20} color="var(--color-orange)" />
                Detailed Errors & Suggestions
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {result.errors.length === 0 ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--success)", padding: "1rem", backgroundColor: "rgba(34, 197, 94, 0.1)", borderRadius: "0.5rem" }}>
                    <CheckCircle size={20} />
                    <span>No major errors found. Great job!</span>
                  </div>
                ) : (
                  result.errors.map((error) => (
                    <div key={error.id} style={{ border: "1px solid var(--border)", borderRadius: "0.5rem", padding: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                        <span style={{ 
                          fontSize: "0.75rem", 
                          fontWeight: 700, 
                          textTransform: "uppercase", 
                          padding: "0.25rem 0.5rem", 
                          borderRadius: "0.25rem",
                          backgroundColor: error.type === "grammar" ? "#fce7f3" : error.type === "vocabulary" ? "#e0e7ff" : "#fef3c7",
                          color: error.type === "grammar" ? "#be185d" : error.type === "vocabulary" ? "#4338ca" : "#b45309"
                        }}>
                          {error.type}
                        </span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "0.75rem" }}>
                        <div style={{ backgroundColor: "#fef2f2", padding: "0.75rem", borderRadius: "0.375rem" }}>
                          <span style={{ display: "block", fontSize: "0.75rem", color: "#b91c1c", fontWeight: 600, marginBottom: "0.25rem" }}>Incorrect</span>
                          <span style={{ color: "#7f1d1d", textDecoration: "line-through" }}>{error.original}</span>
                        </div>
                        <div style={{ backgroundColor: "#f0fdf4", padding: "0.75rem", borderRadius: "0.375rem" }}>
                          <span style={{ display: "block", fontSize: "0.75rem", color: "#15803d", fontWeight: 600, marginBottom: "0.25rem" }}>Suggestion</span>
                          <span style={{ color: "#14532d" }}>{error.suggestion}</span>
                        </div>
                      </div>
                      <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text)", paddingLeft: "0.25rem", borderLeft: "3px solid var(--primary-subtle)" }}>
                        {error.explanation}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
