import TestimonialsSection from "@/components/TestimonialsSection";
import FaqSection from "@/components/FaqSection";

export default function ProgramsPage() {
  return (
    <>
      <div className="container" style={{ padding: "80px 24px" }}>
        <h1 style={{ fontSize: "var(--text-4xl)", marginBottom: "24px" }}>Our Programs</h1>
        <p style={{ fontSize: "var(--text-lg)", color: "var(--text-muted)", marginBottom: "48px" }}>
          Explore our wide range of English courses designed for all ages and goals.
        </p>
        
        <div style={{ display: "grid", gap: "48px" }}>
          <section id="kids">
            <h2 style={{ fontSize: "var(--text-2xl)", color: "var(--color-orange)", marginBottom: "16px" }}>Kids & Teens English</h2>
            <p style={{ lineHeight: 1.6 }}>Interactive and engaging English learning programs tailored for children and teenagers to build a strong foundation and confidence.</p>
          </section>
          
          <section id="ielts">
            <h2 style={{ fontSize: "var(--text-2xl)", color: "var(--color-orange)", marginBottom: "16px" }}>IELTS, TOEFL & Test Prep</h2>
            <p style={{ lineHeight: 1.6 }}>Intensive preparation courses to help you achieve your target scores for university admission and international opportunities.</p>
          </section>
          
          <section id="adults">
            <h2 style={{ fontSize: "var(--text-2xl)", color: "var(--color-orange)", marginBottom: "16px" }}>Adult Learners & Communication</h2>
            <p style={{ lineHeight: 1.6 }}>Practical English for daily life and travel, focusing on listening and speaking skills to boost your confidence in real-world situations.</p>
          </section>
          
          <section id="corporate">
            <h2 style={{ fontSize: "var(--text-2xl)", color: "var(--color-orange)", marginBottom: "16px" }}>Corporate English</h2>
            <p style={{ lineHeight: 1.6 }}>Customized English training solutions for businesses and organizations to empower their workforce and improve global communication.</p>
          </section>
        </div>
      </div>
      
      <TestimonialsSection />
      <FaqSection />
    </>
  );
}
