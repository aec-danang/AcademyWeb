import ContactFormClient from "./ContactFormClient";

export default function ContactPage() {
  return (
    <div className="container" style={{ padding: "80px 24px" }}>
      <h1 style={{ fontSize: "var(--text-4xl)", marginBottom: "24px" }}>Contact & Registration</h1>
      <p style={{ fontSize: "var(--text-lg)", color: "var(--text-muted)", marginBottom: "48px" }}>
        Get in touch with us or register for a placement test today.
      </p>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px" }}>
        <div>
          <h2 style={{ fontSize: "var(--text-2xl)", marginBottom: "24px" }}>Contact Information</h2>
          <div style={{ marginBottom: "16px" }}>
            <strong>Address:</strong><br />
            98 Le Dinh Ly St, Da Nang
          </div>
          <div style={{ marginBottom: "16px" }}>
            <strong>Phone:</strong><br />
            (0236) 123 4567
          </div>
          <div style={{ marginBottom: "16px" }}>
            <strong>Email:</strong><br />
            info@academy.edu.vn
          </div>
        </div>
        
        <div id="register" className="card">
          <h2 style={{ fontSize: "var(--text-2xl)", marginBottom: "24px" }}>Placement Test Registration</h2>
          <ContactFormClient />
        </div>
      </div>
    </div>
  );
}
