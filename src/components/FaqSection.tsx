import React from "react";
import { prisma } from "@/lib/prisma";
import { ChevronDown } from "lucide-react";

export default async function FaqSection() {
  const faqs = await prisma.faq.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  });

  if (!faqs || faqs.length === 0) {
    return null;
  }

  return (
    <section style={{ padding: "var(--section-padding) 0" }}>
      <div className="container" style={{ maxWidth: "800px" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2 style={{ fontSize: "var(--text-3xl)", color: "var(--color-navy)", marginBottom: "16px" }}>
            Frequently Asked Questions
          </h2>
          <p style={{ fontSize: "var(--text-lg)", color: "var(--text-muted)" }}>
            Find answers to common questions about our programs and admissions.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {faqs.map((faq) => (
            <details 
              key={faq.id} 
              style={{
                backgroundColor: "var(--color-white)",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-card)",
                overflow: "hidden"
              }}
            >
              <summary 
                style={{
                  padding: "24px",
                  fontSize: "var(--text-lg)",
                  fontWeight: 600,
                  color: "var(--color-navy)",
                  cursor: "pointer",
                  listStyle: "none",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                {faq.question}
                <ChevronDown size={20} color="var(--color-orange)" style={{ flexShrink: 0 }} />
              </summary>
              <div 
                style={{ 
                  padding: "0 24px 24px 24px", 
                  fontSize: "var(--text-base)", 
                  color: "var(--text-muted)",
                  lineHeight: 1.6 
                }}
              >
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          details > summary::-webkit-details-marker {
            display: none;
          }
          details[open] summary svg {
            transform: rotate(180deg);
          }
          details summary svg {
            transition: transform 0.2s ease;
          }
        `
      }} />
    </section>
  );
}
