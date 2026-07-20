import React from "react";
import { prisma } from "@/lib/prisma";
import Card from "@/lib/ui/Card";
import { Star, Quote } from "lucide-react";
import Image from "next/image";

export default async function TestimonialsSection() {
  const testimonials = await prisma.testimonial.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  });

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section style={{ backgroundColor: "var(--color-navy-light)", padding: "var(--section-padding) 0" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2 style={{ fontSize: "var(--text-3xl)", color: "var(--color-navy)", marginBottom: "16px" }}>
            What Our Students Say
          </h2>
          <p style={{ fontSize: "var(--text-lg)", color: "var(--text-muted)", maxWidth: "600px", margin: "0 auto" }}>
            Hear from our community of learners who have transformed their lives through English.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px" }}>
          {testimonials.map((testimonial) => (
            <Card 
              key={testimonial.id} 
              style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            >
              <div style={{ color: "var(--color-orange)" }}>
                <Quote size={40} opacity={0.2} fill="currentColor" />
              </div>
              
              <p style={{ fontSize: "var(--text-base)", lineHeight: 1.6, flexGrow: 1, fontStyle: "italic" }}>
                &quot;{testimonial.content}&quot;
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "auto" }}>
                {testimonial.avatarUrl ? (
                  <Image 
                    src={testimonial.avatarUrl} 
                    alt={testimonial.authorName} 
                    width={56} 
                    height={56} 
                    style={{ borderRadius: "var(--radius-pill)", objectFit: "cover", width: "56px", height: "56px" }}
                  />
                ) : (
                  <div style={{ width: 56, height: 56, borderRadius: "var(--radius-pill)", backgroundColor: "var(--color-orange)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-white)", fontSize: "var(--text-lg)", fontWeight: "bold" }}>
                    {testimonial.authorName.charAt(0).toUpperCase()}
                  </div>
                )}
                
                <div>
                  <h4 style={{ fontSize: "var(--text-base)", fontWeight: 700, margin: 0, color: "var(--color-navy)" }}>
                    {testimonial.authorName}
                  </h4>
                  {testimonial.authorRole && (
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
                      {testimonial.authorRole}
                    </p>
                  )}
                  <div style={{ display: "flex", gap: "4px", marginTop: "8px" }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        size={16} 
                        fill={i < testimonial.rating ? "var(--color-orange)" : "transparent"} 
                        color={i < testimonial.rating ? "var(--color-orange)" : "var(--color-border)"} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
