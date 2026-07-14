import TestimonialsSection from "@/components/TestimonialsSection";

export default function AboutPage() {
  return (
    <>
      <div className="container" style={{ padding: "80px 24px" }}>
        <h1 style={{ fontSize: "var(--text-4xl)", marginBottom: "24px" }}>About AEC</h1>
        <p style={{ fontSize: "var(--text-lg)", lineHeight: 1.8, maxWidth: "800px" }}>
          Founded in 2006, Academy English Center (AEC) has been a leading English education center in Da Nang. We provide high-quality, international-standard English training to help learners become confident global citizens.
        </p>
        
        <h2 style={{ fontSize: "var(--text-3xl)", marginTop: "48px", marginBottom: "24px" }}>Our Vision</h2>
        <p style={{ fontSize: "var(--text-lg)", lineHeight: 1.8, maxWidth: "800px" }}>
          Build ACADEMY AEC into a dedicated learning community that serves carefully, wholeheartedly, and professionally for the future of learners and society.
        </p>
        
        <h2 style={{ fontSize: "var(--text-3xl)", marginTop: "48px", marginBottom: "24px" }}>Founder Expectations</h2>
        <ul style={{ fontSize: "var(--text-lg)", lineHeight: 1.8, marginLeft: "24px", maxWidth: "800px" }}>
          <li style={{ marginBottom: "16px" }}>Provide high-quality, diverse, international-standard English training.</li>
          <li style={{ marginBottom: "16px" }}>Develop soft skills and life values so learners become confident global citizens.</li>
          <li style={{ marginBottom: "16px" }}>Maintain professionalism and humanistic education values, putting student needs and character first.</li>
          <li style={{ marginBottom: "16px" }}>Build a dedicated learning and service community for the future of learners and society.</li>
        </ul>
      </div>
      
      <TestimonialsSection />
    </>
  );
}
