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
          <form style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>Full Name</label>
              <input type="text" style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ccc" }} placeholder="John Doe" />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>Phone Number</label>
              <input type="tel" style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ccc" }} placeholder="0901234567" />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>Program of Interest</label>
              <select style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ccc" }}>
                <option>Kids & Teens</option>
                <option>IELTS / Test Prep</option>
                <option>Adults / Communication</option>
                <option>Corporate English</option>
              </select>
            </div>
            <button type="button" className="btn-primary" style={{ marginTop: "16px" }}>Submit Registration</button>
          </form>
        </div>
      </div>
    </div>
  );
}
