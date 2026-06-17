"use client";

import Link from "next/link";
import { ChevronLeft, Send } from "lucide-react";
import styles from "../../elearning.module.css";
import { useState, use } from "react";

export default function ExerciseUIPage({ params }: { params: Promise<{ type: string }> }) {
  const unwrappedParams = use(params);
  const type = unwrappedParams.type;
  const [submitted, setSubmitted] = useState(false);

  // Mock title based on type
  const getTitle = () => {
    switch(type) {
      case 'multiple-choice': return 'Trắc nghiệm: Ngữ pháp Cơ bản';
      case 'fill-blanks': return 'Điền từ: Đoạn hội thoại mẫu';
      case 'listening': return 'Nghe hiểu: Part 1 IELTS';
      case 'reading': return 'Đọc hiểu: Đoạn văn học thuật';
      case 'essay': return 'Tự luận: Writing Task 2';
      default: return 'Làm Bài Tập';
    }
  };

  const renderExerciseContent = () => {
    if (type === 'multiple-choice') {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className={styles.panel}>
            <h4>Câu 1: Identify the correct sentence.</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input type="radio" name="q1" /> A. She go to school everyday.
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input type="radio" name="q1" /> B. She goes to school everyday.
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input type="radio" name="q1" /> C. She going to school everyday.
              </label>
            </div>
          </div>
          <div className={styles.panel}>
            <h4>Câu 2: Choose the synonym for "Abundant".</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input type="radio" name="q2" /> A. Scarce
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input type="radio" name="q2" /> B. Plentiful
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input type="radio" name="q2" /> C. Limited
              </label>
            </div>
          </div>
        </div>
      );
    }

    if (type === 'essay') {
      return (
        <div className={styles.panel}>
          <h4 style={{ marginBottom: "1rem" }}>Đề bài: Discuss the advantages and disadvantages of online learning. Give reasons for your answer and include any relevant examples from your own knowledge or experience.</h4>
          <textarea 
            style={{ width: "100%", minHeight: "300px", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid #e2e8f0", fontFamily: "inherit", fontSize: "1rem" }}
            placeholder="Write your essay here..."
          ></textarea>
        </div>
      );
    }

    // Default fallback UI for other types
    return (
      <div className={styles.panel}>
        <h4 style={{ color: "var(--text-muted)", fontWeight: 400 }}>Giao diện đang được mô phỏng cho bài tập loại: <strong>{type}</strong></h4>
        <p style={{ marginTop: "1rem" }}>Phần xử lý hiển thị chi tiết (ví dụ: trình phát Audio cho phần Nghe, khung Text cho phần Đọc hiểu) sẽ được tích hợp ở bước phát triển sau.</p>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <Link href="/elearning/exercises" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", textDecoration: "none", marginBottom: "1.5rem" }}>
        <ChevronLeft size={16} /> Quay lại danh mục Bài tập
      </Link>
      
      <div className={styles.flexBetween} style={{ marginBottom: "2rem" }}>
        <h1 style={{ margin: 0, color: "var(--color-navy)" }}>{getTitle()}</h1>
        <span className={styles.statusBadge} style={{ backgroundColor: "#e0f2fe", color: "#0369a1" }}>00:45:00</span>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        {renderExerciseContent()}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem", borderTop: "1px solid #e2e8f0", paddingTop: "2rem" }}>
        <button 
          className="btn-primary" 
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", opacity: submitted ? 0.5 : 1 }}
          onClick={() => setSubmitted(true)}
          disabled={submitted}
        >
          {submitted ? "Đã Nộp Bài" : "Nộp Bài (Submit)"} <Send size={16} />
        </button>
      </div>
    </div>
  );
}
