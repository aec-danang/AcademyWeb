import Link from "next/link";
import { ChevronLeft, CheckCircle, ExternalLink, FileText, Headphones, Image as ImageIcon, Menu, Video } from "lucide-react";
import { notFound } from "next/navigation";
import styles from "../../elearning.module.css";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

type Props = { params: Promise<{ lessonId: string }> };

export const dynamic = "force-dynamic";

function splitLessonContent(content: string | null) {
  if (!content) return { body: "", metadata: [] as Array<{ label: string; value: string }> };

  const metadataMatch = content.match(/(?:^|\n\n)Source Metadata\s*\n([\s\S]*)$/i);
  const metadata = metadataMatch?.[1]
    ?.split(/\r?\n/)
    .map((line) => {
      const separatorIndex = line.indexOf(":");
      if (separatorIndex === -1) return null;
      const label = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();
      return label && value ? { label, value } : null;
    })
    .filter((item): item is { label: string; value: string } => Boolean(item)) || [];

  const body = metadataMatch ? content.slice(0, metadataMatch.index).trim() : content.trim();
  return { body, metadata };
}

function isUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function mediaKind(url: string) {
  const cleanUrl = url.split("?")[0].toLowerCase();
  if (/\.(mp3|wav|ogg|m4a|aac)$/.test(cleanUrl)) return "audio";
  if (/\.(mp4|webm|mov|m4v)$/.test(cleanUrl)) return "video";
  if (/\.(png|jpe?g|gif|webp|svg)$/.test(cleanUrl)) return "image";
  if (/\.pdf$/.test(cleanUrl)) return "document";
  return "link";
}

function MediaPreview({ title, url }: { title: string; url: string | null }) {
  if (!url) return null;

  const kind = mediaKind(url);
  const sharedPanelStyle = {
    padding: "1rem",
    borderRadius: "var(--radius-md)",
    background: "white",
    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
    border: "1px solid #e2e8f0",
  };

  if (kind === "audio") {
    return (
      <div style={sharedPanelStyle}>
        <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: 0, color: "var(--color-navy)" }}>
          <Headphones size={18} /> Listening Resource
        </h3>
        <audio controls src={url} style={{ width: "100%" }}>
          <a href={url}>Open audio</a>
        </audio>
      </div>
    );
  }

  if (kind === "video") {
    return (
      <div style={sharedPanelStyle}>
        <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: 0, color: "var(--color-navy)" }}>
          <Video size={18} /> Video Resource
        </h3>
        <video controls src={url} style={{ width: "100%", borderRadius: "var(--radius-sm)", background: "#0f172a" }}>
          <a href={url}>Open video</a>
        </video>
      </div>
    );
  }

  if (kind === "image") {
    return (
      <div style={sharedPanelStyle}>
        <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: 0, color: "var(--color-navy)" }}>
          <ImageIcon size={18} /> Visual Resource
        </h3>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={title} style={{ display: "block", width: "100%", maxHeight: "460px", objectFit: "contain", borderRadius: "var(--radius-sm)", background: "#f8fafc" }} />
      </div>
    );
  }

  return (
    <div style={sharedPanelStyle}>
      <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: 0, color: "var(--color-navy)" }}>
        {kind === "document" ? <FileText size={18} /> : <ExternalLink size={18} />} Learning Resource
      </h3>
      <a href={url} target="_blank" rel="noreferrer" className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", textDecoration: "none" }}>
        Open resource <ExternalLink size={16} />
      </a>
    </div>
  );
}

export default async function LearningPage({ params }: Props) {
  const user = await requireUser();
  const { lessonId } = await params;
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { course: { include: { lessons: { orderBy: { order: "asc" } }, classes: { include: { enrollments: true } } } } },
  });
  if (!lesson) notFound();

  const hasAccess = user.role === "ADMIN"
    || lesson.course.classes.some((classSection) => classSection.teacherId === user.id)
    || lesson.course.classes.some((classSection) => classSection.enrollments.some((enrollment) => enrollment.userId === user.id && enrollment.status === "ACTIVE"));
  if (!hasAccess) notFound();

  const { body, metadata } = splitLessonContent(lesson.content);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <Link href={`/elearning/courses/${lesson.courseId}`} style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", textDecoration: "none" }}>
          <ChevronLeft size={16} /> Back to Course
        </Link>
        <h2 style={{ margin: 0, fontSize: "1.25rem", color: "var(--color-navy)" }}>{lesson.title}</h2>
        <div style={{ width: "100px" }} />
      </div>
      <div style={{ display: "flex", gap: "2rem", flex: 1, minHeight: 0 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.5rem", overflowY: "auto", paddingRight: "1rem" }}>
          <MediaPreview title={lesson.title} url={lesson.videoUrl} />
          <div className={styles.panel}>
            <h3>Lesson Notes</h3>
            <div style={{ color: "var(--text-muted)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{body || "No lesson content yet."}</div>
          </div>
          {metadata.length > 0 && (
            <div className={styles.panel}>
              <h3>Source Details</h3>
              <dl style={{ display: "grid", gridTemplateColumns: "minmax(140px, 0.35fr) minmax(0, 1fr)", gap: "0.75rem 1rem", margin: 0 }}>
                {metadata.map((item) => (
                  <div key={`${item.label}-${item.value}`} style={{ display: "contents" }}>
                    <dt style={{ color: "var(--color-navy)", fontWeight: 800 }}>{item.label}</dt>
                    <dd style={{ margin: 0, color: "var(--text-muted)", overflowWrap: "anywhere" }}>
                      {isUrl(item.value) ? (
                        <a href={item.value} target="_blank" rel="noreferrer" style={{ color: "var(--color-orange)" }}>
                          {item.value}
                        </a>
                      ) : item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
        <div style={{ width: "300px", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className={styles.panel} style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
            <h4 style={{ display: "flex", alignItems: "center", gap: "0.5rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.5rem", marginBottom: "1rem" }}><Menu size={16} /> Syllabus</h4>
            {lesson.course.lessons.map((item) => (
              <Link key={item.id} href={`/elearning/learn/${item.id}`} style={{ textDecoration: "none" }}>
                <div style={{ fontSize: "0.875rem", padding: "0.5rem", color: item.id === lesson.id ? "var(--color-orange)" : "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: item.id === lesson.id ? 600 : 400 }}>
                  {item.order < lesson.order ? <CheckCircle size={14} color="#166534" /> : <span style={{ width: 14 }} />}
                  {item.title}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
