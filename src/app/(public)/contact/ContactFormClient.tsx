"use client";

import { useState } from "react";
import { submitLead } from "./actions";

export default function ContactFormClient() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await submitLead(formData);

    if (result.success) {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } else {
      setErrorMsg(result.error || "An error occurred.");
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {success && (
        <div style={{ padding: "12px", backgroundColor: "#dcfce7", color: "#166534", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
          Thank you! Your registration has been submitted successfully. We will contact you soon.
        </div>
      )}
      {errorMsg && (
        <div style={{ padding: "12px", backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: "8px", border: "1px solid #fecaca" }}>
          {errorMsg}
        </div>
      )}
      <div>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>Full Name</label>
        <input name="name" type="text" required style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ccc" }} placeholder="John Doe" />
      </div>
      <div>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>Phone Number</label>
        <input name="phone" type="tel" required style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ccc" }} placeholder="0901234567" />
      </div>
      <div>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>Program of Interest</label>
        <select name="program" style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ccc" }}>
          <option value="Kids & Teens">Kids & Teens</option>
          <option value="IELTS / Test Prep">IELTS / Test Prep</option>
          <option value="Adults / Communication">Adults / Communication</option>
          <option value="Corporate English">Corporate English</option>
        </select>
      </div>
      <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ marginTop: "16px", opacity: isSubmitting ? 0.7 : 1 }}>
        {isSubmitting ? "Submitting..." : "Submit Registration"}
      </button>
    </form>
  );
}
