import Link from "next/link";
import { CheckSquare, Edit3, Headphones, BookOpen, PenTool } from "lucide-react";
import styles from "../elearning.module.css";

export default function ExercisesHubPage() {
  const exerciseTypes = [
    {
      id: "multiple-choice",
      title: "Trắc nghiệm (Multiple Choice)",
      description: "Luyện tập với các câu hỏi trắc nghiệm khách quan.",
      icon: <CheckSquare size={40} color="var(--color-navy)" />,
      color: "#e0f2fe"
    },
    {
      id: "fill-blanks",
      title: "Điền từ (Fill in the Blanks)",
      description: "Điền từ còn thiếu vào đoạn văn hoặc câu.",
      icon: <Edit3 size={40} color="var(--color-navy)" />,
      color: "#fef3c7"
    },
    {
      id: "listening",
      title: "Nghe (Listening)",
      description: "Nghe đoạn hội thoại và trả lời câu hỏi.",
      icon: <Headphones size={40} color="var(--color-navy)" />,
      color: "#f3e8ff"
    },
    {
      id: "reading",
      title: "Đọc hiểu (Reading)",
      description: "Đọc các đoạn văn và tìm thông tin chính xác.",
      icon: <BookOpen size={40} color="var(--color-navy)" />,
      color: "#dcfce7"
    },
    {
      id: "essay",
      title: "Tự luận (Essay / Writing)",
      description: "Viết bài luận theo chủ đề được giao.",
      icon: <PenTool size={40} color="var(--color-navy)" />,
      color: "#fee2e2"
    }
  ];

  return (
    <div>
      <div className={styles.flexBetween} style={{ marginBottom: "2rem" }}>
        <h1 style={{ margin: 0, color: "var(--color-navy)" }}>Làm Bài Tập (Exercises Hub)</h1>
      </div>
      
      <p style={{ marginBottom: "2rem", color: "var(--text-muted)", fontSize: "1.1rem" }}>
        Chọn một thể loại bài tập dưới đây để bắt đầu ôn luyện.
      </p>

      <div className={styles.courseGrid}>
        {exerciseTypes.map(type => (
          <Link href={`/elearning/exercises/${type.id}`} key={type.id} style={{ textDecoration: "none", color: "inherit" }}>
            <div className={styles.courseCard} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{ height: "120px", backgroundColor: type.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {type.icon}
              </div>
              <div className={styles.courseContent} style={{ flex: 1 }}>
                <h3 style={{ color: "var(--color-navy)" }}>{type.title}</h3>
                <p>{type.description}</p>
                <div style={{ marginTop: "1rem", color: "var(--color-orange)", fontWeight: 500, fontSize: "0.875rem" }}>
                  Bắt đầu làm bài &rarr;
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
